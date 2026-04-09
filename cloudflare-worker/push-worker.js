/* ================================================
   ANHQVdle — Cloudflare Worker: Daily Push Sender
   ================================================
   Configurar en Cloudflare Workers con estas variables de entorno:
   - VAPID_PRIVATE_KEY  = (configurar en Cloudflare Worker Settings → Secrets)
   - VAPID_PUBLIC_KEY   = (configurar en Cloudflare Worker Settings → Secrets)
   - FIREBASE_DB_URL    = (configurar en Cloudflare Worker Settings → Secrets)
   - FIREBASE_SECRET    = (configurar en Cloudflare Worker Settings → Secrets)
   - CRON_SECRET        = (configurar en Cloudflare Worker Settings → Secrets)

   Trigger: Cron diario a las 00:05 (hora España = UTC+2, so 22:05 UTC)
   ================================================ */

export default {
  // Cron trigger: se ejecuta automáticamente cada día
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDailyPush(env));
  },

  // HTTP trigger: para pruebas manuales
  // GET https://tu-worker.workers.dev/?secret=TU_CRON_SECRET
  async fetch(request, env, ctx) {
    const url    = new URL(request.url);
    const secret = url.searchParams.get('secret');
    if (secret !== env.CRON_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
    ctx.waitUntil(sendDailyPush(env));
    return new Response('Push enviado', { status: 200 });
  }
};

async function sendDailyPush(env) {
  // 1. Leer suscripciones desde Firebase
  const res = await fetch(
    env.FIREBASE_DB_URL + '/push_subscriptions.json?auth=' + env.FIREBASE_SECRET
  );
  if (!res.ok) return;
  const data = await res.json();
  if (!data) return;

  const subs = Object.values(data);
  const payload = JSON.stringify({
    title: 'ANHQVdle 🏠',
    body:  '¡El personaje de hoy ya está esperando! ¿Adivinas quién es?',
    icon:  'https://anhqvdle.es/img/apple-touch-icon.png',
    url:   'https://anhqvdle.es/clasico.html'
  });

  // 2. Enviar push a cada suscriptor
  const results = await Promise.allSettled(
    subs.map(function(item) {
      try {
        const sub = JSON.parse(item.subscription);
        return sendPush(sub, payload, env);
      } catch(e) {
        return Promise.resolve();
      }
    })
  );

  const sent   = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log('[Push] Enviados: ' + sent + ' / Fallidos: ' + failed);
}

async function sendPush(subscription, payload, env) {
  // Web Push con VAPID usando la Web Crypto API de Cloudflare Workers
  const endpoint = subscription.endpoint;
  const vapidHeaders = await buildVapidHeaders(endpoint, env);

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/octet-stream',
      'Content-Length': '0',
      'TTL':            '86400',
      ...vapidHeaders
    }
  });

  if (res.status === 410 || res.status === 404) {
    // Suscripción expirada — eliminarla de Firebase
    await deleteExpiredSub(subscription.endpoint, env);
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

  // Import private key
  const keyData = base64ToArrayBuffer(env.VAPID_PRIVATE_KEY);
  const key = await crypto.subtle.importKey(
    'raw', keyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );

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

async function deleteExpiredSub(endpoint, env) {
  const key = btoa(endpoint).slice(0, 40);
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
