/* ================================================
   ANHQVdle — PWA: Service Worker + Web Push nativo
   ================================================ */

var VAPID_PUBLIC_KEY = 'BLDItKuQj4aYujxuQP1xNHFDljsVn3oMdgZK6FxivWTVQLtAVFqRfs9kNCuc5AKNl2J0QWhih2NVBNY83pvnXfs';

// ── Service Worker ───────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function (reg) {
        // Guardar registro para usar en suscripción
        window._swReg = reg;
      })
      .catch(function (err) {
        console.warn('[PWA] Service worker error:', err);
      });
  });
}

// ── Install Banner (A2HS) ────────────────────────
var _deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  _deferredPrompt = e;
  _showInstallBanner();
});

window.addEventListener('appinstalled', function () {
  _deferredPrompt = null;
  // Tras instalar, pedir permiso de notificaciones después de 3s
  setTimeout(_askPushPermission, 3000);
});

function _showInstallBanner() {
  if (localStorage.getItem('anhqvdle_install_dismissed')) return;
  if (document.getElementById('pwa-install-banner')) return;

  var banner = document.createElement('div');
  banner.id = 'pwa-install-banner';
  banner.innerHTML =
    '<div class="pwa-banner-inner">' +
      '<span class="pwa-banner-icon">🏠</span>' +
      '<span class="pwa-banner-text">Instala ANHQVdle en tu móvil y juega como una app</span>' +
      '<button class="pwa-banner-btn" onclick="pwaInstall()">Instalar</button>' +
      '<button class="pwa-banner-close" onclick="pwaDismiss()" aria-label="Cerrar">✕</button>' +
    '</div>';
  document.body.appendChild(banner);

  setTimeout(function () {
    var b = document.getElementById('pwa-install-banner');
    if (b) b.remove();
  }, 15000);
}

function pwaInstall() {
  if (!_deferredPrompt) return;
  _deferredPrompt.prompt();
  _deferredPrompt.userChoice.then(function (choice) {
    _deferredPrompt = null;
    var b = document.getElementById('pwa-install-banner');
    if (b) b.remove();
  });
}

function pwaDismiss() {
  localStorage.setItem('anhqvdle_install_dismissed', '1');
  var b = document.getElementById('pwa-install-banner');
  if (b) b.remove();
}

// ── Web Push nativo ──────────────────────────────
function _urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  var raw     = window.atob(base64);
  var output  = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

function _askPushPermission() {
  if (!('PushManager' in window)) return;
  if (!('serviceWorker' in navigator)) return;
  if (localStorage.getItem('anhqvdle_push_asked')) return;

  // Mostrar nuestro propio diálogo antes del nativo
  _showPushPrompt();
}

function _showPushPrompt() {
  if (document.getElementById('push-prompt')) return;
  var d = document.createElement('div');
  d.id = 'push-prompt';
  d.className = 'auth-overlay';
  d.innerHTML =
    '<div class="auth-box" style="max-width:360px;text-align:center">' +
      '<div style="font-size:2rem;margin-bottom:12px">🔔</div>' +
      '<h2 class="auth-h2">¿Aviso diario?</h2>' +
      '<p class="auth-p">Recibe una notificación cada día cuando salga el nuevo personaje. Sin spam.</p>' +
      '<button class="auth-btn" style="margin-top:16px" onclick="pwaSubscribePush()">¡Sí, avísame!</button>' +
      '<button class="auth-signout" style="margin-top:8px" onclick="pwaDenyPush()">Ahora no</button>' +
    '</div>';
  d.addEventListener('click', function (e) { if (e.target === d) pwaDenyPush(); });
  document.body.appendChild(d);
}

function pwaSubscribePush() {
  var prompt = document.getElementById('push-prompt');
  if (prompt) prompt.remove();
  localStorage.setItem('anhqvdle_push_asked', '1');

  var reg = window._swReg;
  if (!reg) return;

  reg.pushManager.subscribe({
    userVisibleOnly:      true,
    applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  }).then(function (sub) {
    // Guardar suscripción en Firebase para poder enviar el push diario
    _savePushSubscription(sub);
    var btn = document.getElementById('pwa-notif-btn');
    if (btn) btn.remove();
  }).catch(function () {
    var btn = document.getElementById('pwa-notif-btn');
    if (btn) btn.remove();
  });
}

function pwaDenyPush() {
  localStorage.setItem('anhqvdle_push_asked', '1');
  var prompt = document.getElementById('push-prompt');
  if (prompt) prompt.remove();
  // Hide floating button too
  var btn = document.getElementById('pwa-notif-btn');
  if (btn) btn.remove();
}

function _savePushSubscription(sub) {
  if (!window.AuthModule) return;
  AuthModule.onReady(function (user) {
    var db = AuthModule.getDb();
    if (!db) return;
    // Guardar con uid si está logado, o con un ID anónimo si no
    var uid = user ? user.uid : ('anon_' + Math.random().toString(36).slice(2));
    db.ref('push_subscriptions/' + btoa(sub.endpoint).slice(0, 40)).set({
      uid:          uid,
      subscription: JSON.stringify(sub),
      savedAt:      Date.now()
    }).catch(function () {});
  });
}

// ── Floating 🔔 button for desktop users ─────────────
function _showNotifButton() {
  if (!('PushManager' in window)) return;
  if (!('serviceWorker' in navigator)) return;
  if (Notification.permission === 'granted') return;
  if (localStorage.getItem('anhqvdle_push_asked')) return;
  if (document.getElementById('pwa-notif-btn')) return;

  var btn = document.createElement('button');
  btn.id = 'pwa-notif-btn';
  btn.setAttribute('aria-label', 'Activar notificaciones');
  btn.innerHTML = '<span class="pwa-notif-icon">🔔</span><span>Avisos diarios</span>';
  btn.addEventListener('click', function () {
    btn.remove();
    _showPushPrompt();
  });
  document.body.appendChild(btn);

  // Auto-hide after 20 seconds if user ignores it
  setTimeout(function () {
    var b = document.getElementById('pwa-notif-btn');
    if (b) b.remove();
  }, 20000);
}

// Show the button after 4 seconds on page load
window.addEventListener('load', function () {
  setTimeout(_showNotifButton, 4000);
});

// Exponer globalmente
window.pwaInstall        = pwaInstall;
window.pwaDismiss        = pwaDismiss;
window.pwaAskPush        = _askPushPermission;
window.pwaSubscribePush  = pwaSubscribePush;
window.pwaDenyPush       = pwaDenyPush;
