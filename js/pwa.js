/* ================================================
   ANHQVdle — PWA: Service Worker + Install Banner
   ================================================
   OneSignal App ID: REEMPLAZAR cuando esté disponible
   ================================================ */

var ONESIGNAL_APP_ID = 'TU-APP-ID-AQUI'; // ← reemplazar con el ID de OneSignal

// ── Service Worker ───────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function (reg) {
        console.log('[PWA] Service worker registrado:', reg.scope);
      })
      .catch(function (err) {
        console.warn('[PWA] Service worker error:', err);
      });
  });
}

// ── OneSignal Push ───────────────────────────────
window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(function (OneSignal) {
  OneSignal.init({
    appId: ONESIGNAL_APP_ID,
    safari_web_id: '', // opcional, para Safari macOS
    notifyButton: { enable: false }, // usamos nuestro propio botón
    promptOptions: {
      slidedown: {
        prompts: [{
          type: 'push',
          autoPrompt: false, // no mostrar automáticamente — lo hacemos nosotros
          text: {
            actionMessage:    '¿Quieres recibir un aviso diario cuando salga el personaje de hoy?',
            acceptButton:     '¡Sí, avísame!',
            cancelButton:     'Ahora no'
          }
        }]
      }
    }
  });
});

// ── Install Banner (A2HS) ────────────────────────
var _deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  _deferredPrompt = e;
  _showInstallBanner();
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

  // Auto-dismiss after 15s
  setTimeout(function () {
    var b = document.getElementById('pwa-install-banner');
    if (b) b.remove();
  }, 15000);
}

function pwaInstall() {
  if (!_deferredPrompt) return;
  _deferredPrompt.prompt();
  _deferredPrompt.userChoice.then(function (choice) {
    if (choice.outcome === 'accepted') {
      // Tras instalar, pedir permiso de notificaciones
      _askPushPermission();
    }
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

// ── Push permission ──────────────────────────────
function _askPushPermission() {
  if (ONESIGNAL_APP_ID === 'TU-APP-ID-AQUI') return; // no configurado aún
  if (!window.OneSignal) return;
  window.OneSignalDeferred.push(function (OneSignal) {
    OneSignal.Slidedown.promptPush();
  });
}

// Exponer para botón manual (si quisiéramos ponerlo en el perfil)
window.pwaInstall   = pwaInstall;
window.pwaDismiss   = pwaDismiss;
window.pwaAskPush   = _askPushPermission;
