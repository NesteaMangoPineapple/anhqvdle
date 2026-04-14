/* ================================================
   ANHQVdle — Envío diario de notificaciones push
   Se ejecuta via GitHub Actions cada día a las 9h
   ================================================ */

const webpush = require('web-push');
const admin   = require('firebase-admin');

// ── VAPID ─────────────────────────────────────────
webpush.setVapidDetails(
  'mailto:contacto@anhqvdle.es',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ── Firebase Admin ────────────────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential:   admin.credential.cert(serviceAccount),
  databaseURL:  process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

// ── Payload de la notificación ────────────────────
const PAYLOAD = JSON.stringify({
  title: 'ANHQVdle 🏠',
  body:  '¡El personaje de hoy ya está esperando! ¿Adivinas quién es?',
  url:   '/clasico.html'
});

// ── Envío ─────────────────────────────────────────
async function run() {
  const snap = await db.ref('push_subscriptions').once('value');
  const data = snap.val();

  if (!data) {
    console.log('Sin suscripciones, nada que enviar.');
    return;
  }

  const keys = Object.keys(data);
  console.log(`Enviando a ${keys.length} suscripciones...`);

  let sent = 0, removed = 0, failed = 0;

  await Promise.all(keys.map(async (key) => {
    let sub;
    try {
      sub = JSON.parse(data[key].subscription);
    } catch (e) {
      console.warn(`Suscripción inválida en ${key}, eliminando.`);
      await db.ref('push_subscriptions/' + key).remove();
      removed++;
      return;
    }

    try {
      await webpush.sendNotification(sub, PAYLOAD);
      sent++;
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Suscripción expirada o revocada → borrar de Firebase
        await db.ref('push_subscriptions/' + key).remove();
        removed++;
      } else {
        console.warn(`Error enviando a ${key}: ${err.statusCode} ${err.message}`);
        failed++;
      }
    }
  }));

  console.log(`✓ Enviadas: ${sent}  |  Expiradas eliminadas: ${removed}  |  Fallidas: ${failed}`);
}

run()
  .then(() => { console.log('Listo.'); process.exit(0); })
  .catch(err => { console.error('Error fatal:', err); process.exit(1); });
