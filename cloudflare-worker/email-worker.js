/* ================================================
   ANHQVdle — Cloudflare Worker: Email Reminders
   ================================================
   Secrets a configurar en Cloudflare Workers → Settings → Variables → Secrets:
   - BREVO_API_KEY   = xkeysib-...
   - FIREBASE_DB_URL = https://anhqvdle-default-rtdb.europe-west1.firebasedatabase.app
   - FIREBASE_SECRET = (mismo que en push-worker)
   - CRON_SECRET     = (mismo que en push-worker; también firma los enlaces de baja)

   Triggers cron (Settings → Triggers):
   - 0 8 * * *   → email matutino "ya está el reto de hoy" (09:00/10:00 España)
   - 0 20 * * *  → recordatorio a quien lleva +2 días sin jugar (21:00/22:00 España)

   Endpoints:
   - POST /            {action: subscribe|unsubscribe, idToken, name}
                       El email se saca del idToken de Firebase verificado, nunca del body.
   - GET|POST /unsubscribe?u=UID&t=FIRMA   → baja de un clic (enlace en cada email)
   - GET /?secret=CRON_SECRET[&job=morning] → lanzar envío a mano
   ================================================ */

const SENDER = { name: 'ANHQVdle', email: 'hola@anhqvdle.es' };
const SITE_URL = 'https://anhqvdle.es';
const WORKER_URL = 'https://anhqvdle-email.yeremy8gc.workers.dev';
const ALLOWED_ORIGIN = 'https://anhqvdle.es';
// Clave web pública de Firebase (la misma de js/firebase-config.js), solo para verificar idTokens
const FIREBASE_API_KEY = 'AIzaSyCcXSSA5JH1YZ0fSb7pozNg8CBQEhMS9-4';

// Plan gratis de Brevo = 300 emails/día. Reparto: matutino + recordatorios no deben pasarse.
const MAX_MORNING_EMAILS  = 200;
const MAX_REMINDER_EMAILS = 90;
const BATCH_SIZE = 500; // versiones por llamada a Brevo (messageVersions)

export default {
  async scheduled(event, env, ctx) {
    const hour = new Date(event.scheduledTime).getUTCHours();
    if (hour === 8) {
      ctx.waitUntil(sendDailyMorningEmail(env));
    } else if (hour === 20) {
      ctx.waitUntil(sendReminders(env));
    }
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Baja de un clic (GET desde el enlace del email, POST desde List-Unsubscribe-Post)
    if (url.pathname === '/unsubscribe') {
      return handleUnsubscribeLink(env, url);
    }

    // Trigger manual: GET /?secret=X[&job=morning]
    if (request.method === 'GET') {
      if (!env.CRON_SECRET || url.searchParams.get('secret') !== env.CRON_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }
      const job = url.searchParams.get('job');
      ctx.waitUntil(job === 'morning' ? sendDailyMorningEmail(env) : sendReminders(env));
      return new Response('Envío lanzado: ' + (job === 'morning' ? 'matutino' : 'recordatorios'), { status: 200 });
    }

    // Suscribir / desuscribir: requiere idToken de Firebase válido
    if (request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch (e) {
        return new Response('Bad request', { status: 400, headers: corsHeaders });
      }

      const account = await verifyIdToken(body.idToken);
      if (!account || !account.email) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }

      if (body.action === 'subscribe') {
        const name = String(body.name || '').slice(0, 60);
        await addContact(env, account.email, name);
      } else if (body.action === 'unsubscribe') {
        await removeContact(env, account.email);
      } else {
        return new Response('Bad request', { status: 400, headers: corsHeaders });
      }
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    return new Response('Not found', { status: 404 });
  }
};

/* ── Firebase Auth: verificar idToken → {localId, email} ── */
async function verifyIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') return null;
  const res = await fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_API_KEY,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data.users && data.users[0]) || null;
}

/* ── Firma HMAC para los enlaces de baja ── */
async function signUid(env, uid) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(env.CRON_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('unsub:' + uid));
  return [...new Uint8Array(sig)].slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function unsubscribeUrl(env, uid) {
  return WORKER_URL + '/unsubscribe?u=' + encodeURIComponent(uid) + '&t=' + await signUid(env, uid);
}

async function handleUnsubscribeLink(env, url) {
  const uid = url.searchParams.get('u') || '';
  const t   = url.searchParams.get('t') || '';
  if (!uid || !/^[A-Za-z0-9_-]{1,128}$/.test(uid) || t !== await signUid(env, uid)) {
    return htmlPage('Enlace no válido', 'Este enlace de baja no es válido o está incompleto.');
  }

  const consentUrl = env.FIREBASE_DB_URL + '/users/' + uid + '/emailConsent.json?auth=' + env.FIREBASE_SECRET;
  const res = await fetch(consentUrl);
  const consent = res.ok ? await res.json() : null;
  if (consent) {
    await fetch(consentUrl, { method: 'PATCH', body: JSON.stringify({ accepted: false }) });
    if (consent.email) await removeContact(env, consent.email);
  }
  return htmlPage('Te has dado de baja',
    'No volverás a recibir emails de ANHQVdle. Puedes reactivarlos cuando quieras desde tu perfil en ' +
    '<a href="' + SITE_URL + '" style="color:#f0c020">anhqvdle.es</a>.');
}

function htmlPage(title, msg) {
  return new Response(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} – ANHQVdle</title></head>
<body style="margin:0;background:#0a0a0a;color:#fff;font-family:Helvetica,Arial,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center">
<div style="max-width:420px;padding:32px;text-align:center">
<div style="font-size:2rem;font-weight:900;letter-spacing:6px;color:#f0c020">ANHQV<span style="color:#fff">dle</span></div>
<h1 style="font-size:1.3rem;margin:24px 0 12px">${title}</h1>
<p style="color:rgba(255,255,255,0.6);line-height:1.6">${msg}</p></div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

/* ── Brevo: añadir contacto (y quitarlo de la lista negra si se dio de baja antes) ── */
async function addContact(env, email, name) {
  await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: name },
      emailBlacklisted: false,
      updateEnabled: true,
    }),
  });
}

/* ── Brevo: desuscribir contacto ── */
async function removeContact(env, email) {
  await fetch('https://api.brevo.com/v3/contacts/' + encodeURIComponent(email), {
    method: 'PUT',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailBlacklisted: true }),
  });
}

/* ── Utilidades ── */
// Fecha YYYY-MM-DD en hora de España (el cliente guarda lastPlayed en hora local)
function madridDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(d);
}

async function loadSubscribers(env) {
  const res = await fetch(env.FIREBASE_DB_URL + '/users.json?auth=' + env.FIREBASE_SECRET);
  if (!res.ok) return [];
  const users = await res.json();
  if (!users) return [];
  return Object.entries(users)
    .filter(([, u]) => u.emailConsent?.accepted === true && u.emailConsent?.email)
    .map(([uid, u]) => ({ uid, ...u }));
}

/* Envía en lotes con messageVersions: 1 subrequest por lote
   (el plan gratis de Workers solo permite 50 subrequests por ejecución). */
async function sendBatch(env, subject, htmlContent, versions) {
  for (let i = 0; i < versions.length; i += BATCH_SIZE) {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: SENDER,
        subject,
        htmlContent,
        messageVersions: versions.slice(i, i + BATCH_SIZE),
      }),
    });
    if (!res.ok) console.log('[Brevo] Error ' + res.status + ': ' + await res.text());
  }
}

async function buildVersion(env, user, extra = {}) {
  const name = String(user.emailConsent.name || 'vecino').slice(0, 60);
  return {
    to: [{ email: user.emailConsent.email, name }],
    params: { name, unsub: await unsubscribeUrl(env, user.uid), ...extra.params },
    ...(extra.subject ? { subject: extra.subject } : {}),
  };
}

/* ── Cron mañana: email diario a los suscriptores ── */
async function sendDailyMorningEmail(env) {
  const subs = (await loadSubscribers(env))
    // Prioriza a quien ha jugado más recientemente si hay más suscritos que cupo
    .sort((a, b) => String(b.lastPlayed || '').localeCompare(String(a.lastPlayed || '')))
    .slice(0, MAX_MORNING_EMAILS);
  if (!subs.length) return;

  const versions = await Promise.all(subs.map(u => buildVersion(env, u)));
  await sendBatch(env, '☀️ Ya está disponible el reto de hoy — ¿adivinas al vecino?', emailLayout(`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:3rem;line-height:1">🎬</div>
      </div>
      <h2 style="color:#fff;font-size:1.3rem;text-align:center;margin:0 0 12px">¡Buenos días, {{params.name}}!</h2>
      <p style="color:rgba(255,255,255,0.55);font-size:0.95rem;line-height:1.7;text-align:center;margin:0 0 28px">
        Ya está disponible el reto de hoy. Un nuevo vecino te espera — ¿cuántos intentos necesitas para adivinarlo?
      </p>`), versions);
  console.log('[Email] Matutino enviado a ' + versions.length);
}

/* ── Cron noche: recordatorios a quien lleva +2 días sin jugar ── */
async function sendReminders(env) {
  const twoDaysAgo = madridDate(-2);
  const subs = (await loadSubscribers(env))
    .filter(u => (u.lastPlayed || '') < twoDaysAgo)
    // Primero los que tienen racha más larga (más que perder)
    .sort((a, b) => (b.streak || 0) - (a.streak || 0))
    .slice(0, MAX_REMINDER_EMAILS);
  if (!subs.length) return;

  const versions = await Promise.all(subs.map(u => {
    const streak = parseInt(u.streak, 10) || 0;
    const name   = u.emailConsent.name || 'vecino';
    return buildVersion(env, u, streak > 0
      ? {
          subject: `🔥 Tu racha de ${streak} día${streak > 1 ? 's' : ''} está en peligro`,
          params: {
            icon: '🔥',
            big: `${streak} DÍA${streak > 1 ? 'S' : ''}`,
            title: `¡${name}, tu racha peligra!`,
            body: 'Llevas más de dos días sin jugar. El personaje de hoy te está esperando — no dejes que tu racha se rompa.',
          },
        }
      : {
          params: {
            icon: '🎬',
            big: '',
            title: `¡Hola ${name}!`,
            body: 'Hace un par de días que no juegas. Tienes un nuevo reto esperándote — ¿puedes adivinar al vecino de hoy?',
          },
        });
  }));

  await sendBatch(env, '🎬 Tienes un nuevo reto esperándote en ANHQVdle', emailLayout(`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:3.5rem;line-height:1">{{params.icon}}</div>
        <div style="font-size:2.5rem;font-weight:900;color:#ff6400;letter-spacing:2px;margin-top:8px">{{params.big}}</div>
      </div>
      <h2 style="color:#fff;font-size:1.3rem;text-align:center;margin:0 0 12px">{{params.title}}</h2>
      <p style="color:rgba(255,255,255,0.55);font-size:0.95rem;line-height:1.7;text-align:center;margin:0 0 28px">{{params.body}}</p>`), versions);
  console.log('[Email] Recordatorios enviados a ' + versions.length);
}

/* ── Plantilla común ── */
function emailLayout(inner) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a">
  <div style="max-width:520px;margin:0 auto;background:#111;border-radius:16px;overflow:hidden;font-family:'Helvetica Neue',Arial,sans-serif">
    <div style="background:linear-gradient(135deg,#1a1500,#0a0a0a);padding:32px 32px 20px;text-align:center;border-bottom:1px solid rgba(240,192,32,0.2)">
      <div style="font-size:2rem;font-weight:900;letter-spacing:6px;color:#f0c020">ANHQV<span style="color:#fff">dle</span></div>
      <div style="font-size:0.75rem;letter-spacing:3px;color:rgba(255,255,255,0.35);margin-top:4px;text-transform:uppercase">Aquí No Hay Quien Viva</div>
    </div>
    <div style="padding:32px">
      ${inner}
      <div style="text-align:center">
        <a href="${SITE_URL}" style="display:inline-block;background:#f0c020;color:#000;text-decoration:none;padding:16px 40px;border-radius:50px;font-weight:800;font-size:1rem;letter-spacing:1px">Jugar ahora →</a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
      <p style="font-size:0.72rem;color:rgba(255,255,255,0.3);margin:0;line-height:1.8">
        ANHQVdle · Fan-made · No oficial<br>
        Recibes este email porque activaste los avisos en anhqvdle.es.<br>
        <a href="{{params.unsub}}" style="color:rgba(255,255,255,0.5)">Darme de baja</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
