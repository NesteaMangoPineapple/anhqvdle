/* ================================================
   ANHQVdle — Firebase Auth (Google + Email/Password)
   ================================================ */

window.AuthModule = (function () {
  var _auth  = null;
  var _db    = null;
  var _user  = null;
  var _ready = false;
  var _queue = [];

  // ── Boot ────────────────────────────────────────
  function _boot() {
    if (typeof firebase === 'undefined' || typeof FIREBASE_CONFIG === 'undefined') {
      setTimeout(_boot, 150);
      return;
    }
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    _auth = firebase.auth();
    _db   = firebase.database();

    _auth.onAuthStateChanged(function (user) {
      _user  = user;
      _ready = true;
      _renderNav();
      if (user) _ensureProfile(user);
      _queue.forEach(function (cb) { cb(user); });
      _queue = [];
    });
  }
  _boot();

  // ── Ensure profile exists in DB ─────────────────
  function _ensureProfile(user) {
    _db.ref('users/' + user.uid + '/profile').once('value').then(function (snap) {
      if (!snap.exists()) {
        _db.ref('users/' + user.uid + '/profile').set({
          displayName: user.displayName || user.email.split('@')[0],
          email:       user.email    || '',
          photoURL:    user.photoURL || '',
          createdAt:   Date.now()
        });
      }
    });
  }

  // ── Nav button ──────────────────────────────────
  function _renderNav() {
    document.querySelectorAll('.auth-nav-item').forEach(function (el) {
      if (_user) {
        var nm    = _user.displayName || _user.email.split('@')[0];
        var ph    = _user.photoURL;
        var short = nm.length > 10 ? nm.slice(0, 10) + '\u2026' : nm;
        el.innerHTML =
          '<button class="nav-btn auth-user-btn" onclick="AuthModule.showProfile()">' +
          (ph
            ? '<img src="' + ph + '" class="auth-av-img" alt="">'
            : '<span class="auth-av-letter">' + nm[0].toUpperCase() + '</span>') +
          '<span class="auth-uname">' + short + '</span></button>';
      } else {
        el.innerHTML =
          '<button class="nav-btn auth-login-btn" onclick="AuthModule.showLogin()">👤 Login</button>';
      }
    });
  }

  // ── Google Sign-In ──────────────────────────────
  function signInGoogle() {
    if (!_auth) return;
    var provider = new firebase.auth.GoogleAuthProvider();
    _auth.signInWithPopup(provider)
      .then(_closeLogin)
      .catch(function (e) { _setErr(e.message); });
  }

  // ── Email / Password ────────────────────────────
  var _mode = 'login';

  function _setMode(m) {
    _mode = m;
    var nw = document.getElementById('auth-namewrap');
    var sb = document.getElementById('auth-sb');
    var sw = document.getElementById('auth-sw');
    if (!sb) return;
    if (m === 'register') {
      if (nw) nw.style.display = 'block';
      sb.textContent = 'Registrarse';
      if (sw) sw.innerHTML = '¿Ya tienes cuenta? <a href="#" onclick="AuthModule._setMode(\'login\');return false">Inicia sesi\u00f3n</a>';
    } else {
      if (nw) nw.style.display = 'none';
      sb.textContent = 'Entrar';
      if (sw) sw.innerHTML = '\u00bfNo tienes cuenta? <a href="#" onclick="AuthModule._setMode(\'register\');return false">Reg\u00edstrate</a>';
    }
    _setErr('');
  }

  function submit() {
    if (!_auth) return;
    var email = ((document.getElementById('auth-email') || {}).value || '').trim();
    var pass  = (document.getElementById('auth-pass')  || {}).value || '';
    var name  = ((document.getElementById('auth-name') || {}).value || '').trim();
    if (!email || !pass) return;
    _setErr('');

    if (_mode === 'register') {
      if (!name) { _setErr('Pon un nombre de vecino'); return; }
      _auth.createUserWithEmailAndPassword(email, pass)
        .then(function (cred) {
          return cred.user.updateProfile({ displayName: name }).then(function () {
            // Send verification email
            cred.user.sendEmailVerification().catch(function () {});
            return cred.user;
          });
        })
        .then(_closeLogin)
        .catch(function (e) { _setErr(_fe(e.code)); });
    } else {
      _auth.signInWithEmailAndPassword(email, pass)
        .then(_closeLogin)
        .catch(function (e) { _setErr(_fe(e.code)); });
    }
  }

  function _fe(code) {
    var map = {
      'auth/email-already-in-use': 'Ese email ya est\u00e1 registrado',
      'auth/invalid-email':        'Email no v\u00e1lido',
      'auth/weak-password':        'La contrase\u00f1a debe tener al menos 6 caracteres',
      'auth/user-not-found':       'No existe cuenta con ese email',
      'auth/wrong-password':       'Contrase\u00f1a incorrecta',
      'auth/invalid-credential':   'Email o contrase\u00f1a incorrectos',
      'auth/too-many-requests':    'Demasiados intentos. Espera un momento'
    };
    return map[code] || 'Error al iniciar sesi\u00f3n. Int\u00e9ntalo de nuevo';
  }

  function _setErr(msg) {
    var el = document.getElementById('auth-err');
    if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
  }

  // ── Login Modal ─────────────────────────────────
  function showLogin() {
    if (document.getElementById('auth-modal')) return;
    _mode = 'login';
    var d = document.createElement('div');
    d.id        = 'auth-modal';
    d.className = 'auth-overlay';
    d.innerHTML = [
      '<div class="auth-box" role="dialog" aria-modal="true" aria-label="Iniciar sesi\u00f3n">',
        '<button class="auth-x" onclick="AuthModule._closeLogin()" aria-label="Cerrar">\u2715</button>',
        '<div class="auth-icon">\ud83c\udfe0</div>',
        '<h2 class="auth-h2">Entrar al portal</h2>',
        '<p class="auth-p">Guarda tus estad\u00edsticas y aparece en el ranking</p>',

        '<button class="auth-google" onclick="AuthModule.signInGoogle()">',
          '<svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0">',
            '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>',
            '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>',
            '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>',
            '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>',
          '</svg>',
          ' Entrar con Google',
        '</button>',

        '<div class="auth-div"><span>o con email</span></div>',

        '<div id="auth-namewrap" style="display:none">',
          '<input type="text" id="auth-name" class="auth-inp" placeholder="Tu nombre (ej: Emilio Delgado)" autocomplete="name">',
        '</div>',
        '<input type="email"    id="auth-email" class="auth-inp" placeholder="Email" autocomplete="email">',
        '<input type="password" id="auth-pass"  class="auth-inp" placeholder="Contrase\u00f1a" autocomplete="current-password">',
        '<div id="auth-err" class="auth-err" style="display:none"></div>',
        '<button id="auth-sb" class="auth-btn" onclick="AuthModule.submit()">Entrar</button>',
        '<p id="auth-sw" class="auth-sw">\u00bfNo tienes cuenta? <a href="#" onclick="AuthModule._setMode(\'register\');return false">Reg\u00edstrate</a></p>',
      '</div>'
    ].join('');
    d.addEventListener('click', function (e) { if (e.target === d) _closeLogin(); });
    document.body.appendChild(d);
    d.querySelectorAll('.auth-inp').forEach(function (inp) {
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    });
  }

  function _closeLogin() {
    var m = document.getElementById('auth-modal');
    if (m) m.remove();
  }

  // ── Profile Modal ───────────────────────────────
  function showProfile() {
    if (!_user) { showLogin(); return; }
    if (document.getElementById('profile-modal')) return;

    var nm = _user.displayName || _user.email.split('@')[0];
    var em = _user.email || '';
    var ph = _user.photoURL;
    var verified = _user.emailVerified;
    var isGoogle = (_user.providerData || []).some(function (p) { return p.providerId === 'google.com'; });

    var verBadge = (!isGoogle && !verified)
      ? '<div class="auth-verify-notice">' +
          '\u26a0\ufe0f Verifica tu email \u2014 ' +
          '<a href="#" onclick="AuthModule._resendVerification();return false">Reenviar correo</a>' +
        '</div>'
      : '';

    var d = document.createElement('div');
    d.id        = 'profile-modal';
    d.className = 'auth-overlay';
    d.innerHTML = [
      '<div class="auth-box profile-box" role="dialog" aria-modal="true">',
        '<button class="auth-x" onclick="document.getElementById(\'profile-modal\').remove()" aria-label="Cerrar">\u2715</button>',
        '<div class="profile-av">',
          ph
            ? '<img src="' + ph + '" alt="' + nm + '" class="profile-av-img">'
            : '<div class="profile-av-letter">' + nm[0].toUpperCase() + '</div>',
        '</div>',
        '<h2 class="auth-h2">' + nm + '</h2>',
        em ? '<p class="auth-p auth-p-email">' + em + '</p>' : '',
        verBadge,
        '<div id="profile-stats" class="profile-stats"><p class="auth-p">Cargando\u2026</p></div>',
        '<a href="ranking.html" class="profile-ranking-link" onclick="document.getElementById(\'profile-modal\').remove()">🏆 Ver ranking global</a>',
        '<button class="auth-signout" onclick="AuthModule.signOut()">Cerrar sesi\u00f3n</button>',
        '<button class="auth-delete-btn" onclick="AuthModule.deleteAccount()">Eliminar cuenta</button>',
      '</div>'
    ].join('');
    d.addEventListener('click', function (e) { if (e.target === d) d.remove(); });
    document.body.appendChild(d);
    _loadProfileStats(_user.uid);
  }

  function _resendVerification() {
    if (_user && !_user.emailVerified) {
      _user.sendEmailVerification()
        .then(function () { alert('Correo de verificaci\u00f3n enviado a ' + _user.email); })
        .catch(function () {});
    }
  }

  function _loadProfileStats(uid) {
    if (!_db) return;
    _db.ref('users/' + uid + '/stats').once('value').then(function (snap) {
      var el = document.getElementById('profile-stats');
      if (!el) return;
      var s = snap.val() || {};
      var modes = [
        { k: 'classic', lbl: '🎬 Cl\u00e1sico', daily: true },
        { k: 'quote',   lbl: '💬 Frases',   daily: true }
      ];
      el.innerHTML = modes.map(function (m) {
        var data = s[m.k] || {};
        var p    = data.played || 0;
        var w    = data.won    || 0;
        var pct  = p > 0 ? Math.round(w / p * 100) : 0;
        return '<div class="pstat-card">' +
          '<div class="pstat-mode">' + m.lbl + '</div>' +
          '<div class="pstat-row">' +
            '<span class="pstat-num">' + p + '</span><span class="pstat-lbl">jugadas</span>' +
            '<span class="pstat-num">' + w + '</span><span class="pstat-lbl">ganadas</span>' +
            '<span class="pstat-num">' + pct + '%</span><span class="pstat-lbl">victorias</span>' +
            (m.daily
              ? '<span class="pstat-num">' + (data.maxStreak || 0) + '</span><span class="pstat-lbl">racha m\u00e1x.</span>'
              : '') +
          '</div>' +
        '</div>';
      }).join('');
    });
  }

  // ── Delete Account ──────────────────────────────
  function deleteAccount() {
    if (!_user) return;
    var confirmed = window.confirm(
      '\u00bfEliminar tu cuenta?\n\nSe borrar\u00e1n tus estadísticas y dejar\u00e1s de aparecer en el ranking. Esta acci\u00f3n no se puede deshacer.'
    );
    if (!confirmed) return;

    var uid = _user.uid;
    var modes = ['classic', 'quote', 'quien_machine', 'quien_online'];

    // Delete DB data first
    var deletes = [_db.ref('users/' + uid).remove()].concat(
      modes.map(function (m) { return _db.ref('leaderboard/' + m + '/' + uid).remove(); })
    );

    Promise.all(deletes).then(function () {
      return _user.delete();
    }).then(function () {
      var pm = document.getElementById('profile-modal');
      if (pm) pm.remove();
    }).catch(function (e) {
      if (e.code === 'auth/requires-recent-login') {
        alert('Por seguridad, cierra sesi\u00f3n, vuelve a entrar y solicita la eliminaci\u00f3n de nuevo.');
      } else {
        alert('No se pudo eliminar la cuenta. Int\u00e9ntalo m\u00e1s tarde.');
      }
    });
  }

  // ── Sign Out ────────────────────────────────────
  function signOut() {
    if (!_auth) return;
    _auth.signOut().then(function () {
      var pm = document.getElementById('profile-modal');
      if (pm) pm.remove();
    });
  }

  // ── Public API ──────────────────────────────────
  return {
    showLogin:      showLogin,
    _closeLogin:    _closeLogin,
    showProfile:    showProfile,
    _resendVerification: _resendVerification,
    signInGoogle:   signInGoogle,
    submit:         submit,
    _setMode:       _setMode,
    signOut:        signOut,
    deleteAccount:  deleteAccount,
    getCurrentUser: function () { return _user; },
    getDb:          function () { return _db; },
    onReady: function (cb) {
      if (_ready) { cb(_user); } else { _queue.push(cb); }
    }
  };
})();
