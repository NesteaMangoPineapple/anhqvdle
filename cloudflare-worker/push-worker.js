/* ================================================
   ANHQVdle — Cloudflare Worker: Daily Push Sender
   ================================================
   Configurar en Cloudflare Workers con estas variables de entorno:
   - VAPID_PRIVATE_KEY  = (configurar en Cloudflare Worker Settings → Secrets)
   - VAPID_PUBLIC_KEY   = (configurar en Cloudflare Worker Settings → Secrets)
   - FIREBASE_DB_URL    = (configurar en Cloudflare Worker Settings → Secrets)
   - FIREBASE_SECRET    = (configurar en Cloudflare Worker Settings → Secrets)
   - CRON_SECRET        = (configurar en Cloudflare Worker Settings → Secrets)

   Trigger (Settings → Trigger events) — UN solo cron:
   - 5-34 22,23 * * *
   Se ejecuta cada minuto de 22:05 a 22:34 y de 23:05 a 23:34 UTC. Solo trabajan
   las ejecuciones que caen a las 00:xx de Madrid (así vale en verano y en
   invierno), y cada minuto envía una TANDA distinta:
   minuto 05 → tanda 0, minuto 06 → tanda 1… hasta 30 tandas.

   ¿Por qué tandas? El plan gratis permite 50 peticiones (subrequests) por
   ejecución: 1 para leer Firebase + 1 por notificación + 1 por cada suscripción
   caducada que se borra. Con tandas de 24 nunca se pasa de 49.
   Capacidad: 30 tandas × 24 = 720 suscriptores. Si se acerca, ampliar el rango
   del cron (5-59) o pasar al plan de pago.
   ================================================ */

const BATCH_SIZE  = 24;
const MAX_BATCHES = 30;

export default {
  // Cron trigger: se ejecuta automáticamente cada minuto del rango
  async scheduled(event, env, ctx) {
    const when = new Date(event.scheduledTime);
    const madridHour = parseInt(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false
    }).format(when), 10);
    if (madridHour !== 0) return; // la otra hora del cron (ya es/aún no es medianoche en España)
    const batch = when.getUTCMinutes() - 5;
    if (batch < 0 || batch >= MAX_BATCHES) return;
    ctx.waitUntil(sendDailyPush(env, batch));
  },

  // HTTP trigger: para pruebas manuales (envía UNA tanda, la 0 si no se indica)
  // GET https://tu-worker.workers.dev/?secret=TU_CRON_SECRET&batch=0
  async fetch(request, env, ctx) {
    const url    = new URL(request.url);
    const secret = url.searchParams.get('secret');
    if (secret !== env.CRON_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
    const batch = Math.max(0, parseInt(url.searchParams.get('batch') || '0', 10) || 0);
    ctx.waitUntil(sendDailyPush(env, batch));
    return new Response('Push enviado (tanda ' + batch + ')', { status: 200 });
  }
};

async function sendDailyPush(env, batch) {
  // 1. Leer suscripciones desde Firebase (1 petición)
  const res = await fetch(
    env.FIREBASE_DB_URL + '/push_subscriptions.json?auth=' + env.FIREBASE_SECRET
  );
  if (!res.ok) return;
  const data = await res.json();
  if (!data) return;

  // Orden fijo por clave para que cada minuto coja su trozo sin repetir
  const all   = Object.entries(data).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const slice = all.slice(batch * BATCH_SIZE, (batch + 1) * BATCH_SIZE);
  if (!slice.length) return; // tanda vacía: ya no quedan suscriptores

  // 2. Enviar push a cada suscriptor de la tanda
  const results = await Promise.allSettled(
    slice.map(function ([key, item]) {
      try {
        const sub = JSON.parse(item.subscription);
        return sendPush(key, sub, env);
      } catch (e) {
        return Promise.resolve();
      }
    })
  );

  const sent   = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log('[Push] Tanda ' + batch + ' (' + slice.length + ' de ' + all.length + '): enviados ' + sent + ' / fallidos ' + failed);
  if (batch === MAX_BATCHES - 1 && all.length > MAX_BATCHES * BATCH_SIZE) {
    console.log('[Push] ⚠️ Hay más suscriptores que tandas: amplía el rango del cron');
  }
}

async function sendPush(key, subscription, env) {
  // Web Push con VAPID usando la Web Crypto API de Cloudflare Workers
  const endpoint = subscription.endpoint;
  const vapidHeaders = await buildVapidHeaders(endpoint, env);

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/octet-stream',
      'Content-Length': '0',
      'TTL':            '86400',
      // Si por lo que sea llegan dos, el servicio de push se queda solo con el último
      'Topic':          'reto-diario',
      ...vapidHeaders
    }
  });

  if (res.status === 410 || res.status === 404) {
    // Suscripción expirada — eliminarla de Firebase
    await deleteExpiredSub(key, env);
  }
}

async function buildVapidHeaders(endpoint, env) {
  const audience = new URL(endpoint).origin;
  const now      = Math.floor(Date.now() / 1000);

  const header  = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: now + 43200, // 12h
    sub: 'mailto:hola@anhqvdle.es'
  };

  const b64Header  = btoa(JSON.stringify(header)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const b64Payload = btoa(JSON.stringify(payload)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const sigInput   = b64Header + '.' + b64Payload;

  const key = await getVapidKey(env);

  const sig    = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(sigInput)
  );
  const b64Sig = arrayBufferToBase64Url(sig);
  const jwt    = sigInput + '.' + b64Sig;

  return {
    'Authorization': 'vapid t=' + jwt + ', k=' + env.VAPID_PUBLIC_KEY
  };
}

// Clave privada VAPID para firmar. WebCrypto NO admite claves privadas ECDSA en
// formato 'raw' (así estaba antes y la importación fallaba siempre, en silencio),
// así que se monta un JWK: d = clave privada (32 bytes), x e y = las dos mitades
// de la clave pública sin comprimir (65 bytes: 0x04 + x + y).
let _vapidKey = null;
async function getVapidKey(env) {
  if (_vapidKey) return _vapidKey;
  const pub = new Uint8Array(base64ToArrayBuffer(env.VAPID_PUBLIC_KEY));
  _vapidKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC', crv: 'P-256', ext: true,
      d: env.VAPID_PRIVATE_KEY.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
      x: arrayBufferToBase64Url(pub.slice(1, 33)),
      y: arrayBufferToBase64Url(pub.slice(33, 65))
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );
  return _vapidKey;
}

// Se borra por la clave real con la que está guardada en Firebase
// (antes se recalculaba con la fórmula vieja y no coincidía con las claves nuevas)
async function deleteExpiredSub(key, env) {
  await fetch(
    env.FIREBASE_DB_URL + '/push_subscriptions/' + key + '.json?auth=' + env.FIREBASE_SECRET,
    { method: 'DELETE' }
  );
}

function base64ToArrayBuffer(base64) {
  const b64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  const str = atob(b64);
  const buf = new ArrayBuffer(str.length);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return buf;
}

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
