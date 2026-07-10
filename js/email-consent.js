/* ================================================
   ANHQVdle — Email consent modal + Brevo sync
   ================================================ */

window.EmailConsent = (function () {

  // URL del Cloudflare Worker de emails (rellenar tras desplegar)
  var WORKER_URL = 'https://anhqvdle-email.workers.dev';

  function init() {
    if (typeof AuthModule === 'undefined') return;
    AuthModule.onReady(function (user) {
      if (!user) return;
      _checkConsent(user);
    });
  }

  function _checkConsent(user) {
    var db = AuthModule.getDb();
    if (!db) return;
    db.ref('users/' + user.uid + '/emailConsent').once('value').then(function (snap) {
      if (snap.val() !== null) return; // ya respondió antes
      setTimeout(function () { _showModal(user, db); }, 4000);
    }).catch(function () {});
  }

  function _showModal(user, db) {
    if (document.getElementById('ec-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'ec-overlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;background:rgba(0,0,0,0.78);',
      'backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);',
      'z-index:9998;display:flex;align-items:center;justify-content:center;',
      'padding:16px;animation:fadeIn 0.25s ease',
    ].join('');

    overlay.innerHTML = [
      '<div style="background:#111;border:1px solid rgba(240,192,32,0.3);border-radius:20px;',
      'padding:32px 28px 24px;max-width:380px;width:100%;text-align:center;',
      'animation:slideUp 0.3s ease;box-shadow:0 24px 60px rgba(0,0,0,0.8)">',

        '<div style="font-size:2.8rem;margin-bottom:12px">🔥</div>',

        '<h2 style="font-family:\'Bebas Neue\',cursive;font-size:1.9rem;letter-spacing:3px;',
        'color:#f0c020;margin:0 0 10px">¿Te avisamos si olvidas jugar?</h2>',

        '<p style="color:rgba(255,255,255,0.5);font-size:0.88rem;line-height:1.65;',
        'margin:0 0 24px">Cuando lleves +2 días sin entrar te mandamos un email para que ',
        'no pierdas tu racha. Sin spam, solo recordatorios.</p>',

        '<button id="ec-yes" style="width:100%;background:#f0c020;color:#000;border:none;',
        'border-radius:50px;padding:14px;font-family:\'Bebas Neue\',cursive;',
        'font-size:1.1rem;letter-spacing:2px;cursor:pointer;margin-bottom:10px;',
        'transition:opacity 0.2s">¡SÍ, AVÍSAME!</button>',

        '<button id="ec-no" style="width:100%;background:transparent;',
        'color:rgba(255,255,255,0.3);border:none;padding:10px;font-size:0.82rem;',
        'cursor:pointer;letter-spacing:1px;font-family:\'Barlow Condensed\',sans-serif">',
        'Ahora no</button>',

      '</div>',
    ].join('');

    document.body.appendChild(overlay);

    document.getElementById('ec-yes').addEventListener('click', function () {
      _saveConsent(user, db, true);
      overlay.remove();
      _showToast('¡Listo! Te avisaremos si olvidas jugar 🔥');
    });

    document.getElementById('ec-no').addEventListener('click', function () {
      _saveConsent(user, db, false);
      overlay.remove();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        _saveConsent(user, db, false);
        overlay.remove();
      }
    });
  }

  function _saveConsent(user, db, accepted) {
    var consent = {
      accepted:  accepted,
      email:     user.email || '',
      name:      user.displayName || (user.email ? user.email.split('@')[0] : 'Vecino'),
      timestamp: new Date().toISOString().slice(0, 10),
    };
    db.ref('users/' + user.uid + '/emailConsent').set(consent).catch(function () {});
    if (accepted) _syncToBrevo(consent.email, consent.name, 'subscribe');
  }

  function _syncToBrevo(email, name, action) {
    if (!WORKER_URL || WORKER_URL.includes('TU_WORKER')) return;
    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action, email: email, name: name }),
    }).catch(function () {});
  }

  function _showToast(msg) {
    var t = document.createElement('div');
    t.style.cssText = [
      'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);',
      'background:#f0c020;color:#000;padding:12px 24px;border-radius:50px;',
      'font-family:\'Barlow Condensed\',sans-serif;font-weight:700;font-size:0.9rem;',
      'z-index:9999;letter-spacing:1px;white-space:nowrap;',
      'animation:slideUp 0.3s ease',
    ].join('');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3500);
  }

  /* API pública: toggle desde perfil */
  function toggle(user, db, accepted) {
    _saveConsent(user, db, accepted);
  }

  return { init: init, toggle: toggle };
}());
