/* ================================================
   ANHQVdle — Cloudflare Worker: Email Reminders
   ================================================
   Secrets a configurar en Cloudflare Workers → Settings → Variables → Secrets:
   - BREVO_API_KEY   = xkeysib-...
   - FIREBASE_DB_URL = https://anhqvdle-xxxxx-default-rtdb.firebaseio.com
   - FIREBASE_SECRET = (mismo que en push-worker)
   - CRON_SECRET     = (mismo que en push-worker)

   Trigger cron: 0 20 * * *  (las 20:00 UTC = 22:00 España)
   ================================================ */

const SENDER = { name: 'ANHQVdle', email: 'hola@anhqvdle.es' };
const SITE_URL = 'https://anhqvdle.es';
const ALLOWED_ORIGIN = 'https://anhqvdle.es';

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendReminders(env));
  },

  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Trigger manual: GET /?secret=X
    if (request.method === 'GET') {
      const url = new URL(request.url);
      if (url.searchParams.get('secret') !== env.CRON_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }
      ctx.waitUntil(sendReminders(env));
      return new Response('Recordatorios enviados', { status: 200, headers: corsHeaders });
    }

    // Suscribir / desuscribir contacto: POST con JSON
    if (request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch(e) {
        return new Response('Bad request', { status: 400, headers: corsHeaders });
      }

      if (body.action === 'subscribe') {
        await addContact(env, body.email, body.name);
      } else if (body.action === 'unsubscribe') {
        await removeContact(env, body.email);
      }
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    return new Response('Not found', { status: 404 });
  }
};

/* ── Brevo: añadir contacto ── */
async function addContact(env, email, name) {
  await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: name },
      updateEnabled: true,
    }),
  });
}

/* ── Brevo: desuscribir contacto ── */
async function removeContact(env, email) {
  await fetch('https://api.brevo.com/v3/contacts/' + encodeURIComponent(email), {
    method: 'PUT',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emailBlacklisted: true }),
  });
}

/* ── Cron: enviar recordatorios diarios ── */
async function sendReminders(env) {
  const res = await fetch(
    env.FIREBASE_DB_URL + '/users.json?auth=' + env.FIREBASE_SECRET
  );
  if (!res.ok) return;
  const users = await res.json();
  if (!users) return;

  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);

  const tasks = Object.values(users).map(async (user) => {
    if (!user.emailConsent?.accepted || !user.emailConsent?.email) return;

    const lastPlayed = user.lastPlayed || '';
    if (lastPlayed >= twoDaysAgo) return; // jugó hace menos de 2 días

    const streak = user.streak || 0;
    const name   = user.emailConsent.name || 'vecino';

    await sendReminderEmail(env, user.emailConsent.email, name, streak);
  });

  await Promise.allSettled(tasks);
}

/* ── Brevo: enviar email transaccional ── */
async function sendReminderEmail(env, email, name, streak) {
  const hasStreak = streak > 0;
  const subject   = hasStreak
    ? `🔥 Tu racha de ${streak} día${streak > 1 ? 's' : ''} está en peligro`
    : '🎬 Tienes un nuevo reto esperándote en ANHQVdle';

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a">
  <div style="max-width:520px;margin:0 auto;background:#111;border-radius:16px;overflow:hidden;font-family:'Helvetica Neue',Arial,sans-serif">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a1500,#0a0a0a);padding:32px 32px 20px;text-align:center;border-bottom:1px solid rgba(240,192,32,0.2)">
      <div style="font-size:2rem;font-weight:900;letter-spacing:6px;color:#f0c020">ANHQV<span style="color:#fff">dle</span></div>
      <div style="font-size:0.75rem;letter-spacing:3px;color:rgba(255,255,255,0.35);margin-top:4px;text-transform:uppercase">Aquí No Hay Quien Viva</div>
    </div>
    <!-- Body -->
    <div style="padding:32px">
      ${hasStreak ? `
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:3.5rem;line-height:1">🔥</div>
          <div style="font-size:2.5rem;font-weight:900;color:#ff6400;letter-spacing:2px;margin-top:8px">${streak} DÍA${streak > 1 ? 'S' : ''}</div>
        </div>
        <h2 style="color:#fff;font-size:1.3rem;text-align:center;margin:0 0 12px">¡${name}, tu racha peligra!</h2>
        <p style="color:rgba(255,255,255,0.55);font-size:0.95rem;line-height:1.7;text-align:center;margin:0 0 28px">Llevas más de dos días sin jugar. El personaje de hoy te está esperando — no dejes que tu racha se rompa.</p>
      ` : `
        <h2 style="color:#fff;font-size:1.3rem;text-align:center;margin:0 0 12px">¡Hola ${name}!</h2>
        <p style="color:rgba(255,255,255,0.55);font-size:0.95rem;line-height:1.7;text-align:center;margin:0 0 28px">Hace un par de días que no juegas. Tienes un nuevo reto esperándote — ¿puedes adivinar al vecino de hoy?</p>
      `}
      <div style="text-align:center">
        <a href="${SITE_URL}" style="display:inline-block;background:#f0c020;color:#000;text-decoration:none;padding:16px 40px;border-radius:50px;font-weight:800;font-size:1rem;letter-spacing:1px">Jugar ahora →</a>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
      <p style="font-size:0.72rem;color:rgba(255,255,255,0.2);margin:0">
        ANHQVdle · Fan-made · No oficial<br>
        <a href="${SITE_URL}" style="color:rgba(255,255,255,0.3)">Gestionar preferencias de email</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email, name }],
      subject,
      htmlContent: html,
    }),
  });
}
