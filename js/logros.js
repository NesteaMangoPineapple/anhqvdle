/* ================================================
   ANHQVdle — Logros e insignias
   Se calculan con lo que ya guarda el navegador (racha y stats de cada modo),
   así funcionan sin cuenta. Con sesión iniciada se copian a
   users/{uid}/logros para no perderlos al cambiar de móvil.
   Lo inyecta pwa.js en todas las páginas; utils.js llama a onGame().
   ================================================ */

window.Logros = (function () {
  var KEY   = 'anhqvdle_logros';
  var MODES = ['classic', 'quote', 'impostor', 'conexiones', 'pixelada'];

  // ctx = { agg: datos acumulados, ev: la partida recién terminada (o null) }
  var LIST = [
    { id: 'primer_reto', icon: '🏠', name: 'Recién mudado',            desc: 'Completa tu primer reto diario.',
      check: function (c) { return c.agg.played >= 1; } },
    { id: 'racha_7',     icon: '🔥', name: 'Semana perfecta',          desc: 'Consigue una racha de 7 días.',
      check: function (c) { return c.agg.best >= 7; },   goal: function (c) { return [c.agg.streak, 7]; } },
    { id: 'racha_30',    icon: '🏢', name: 'Vecino de toda la vida',   desc: 'Consigue una racha de 30 días.',
      check: function (c) { return c.agg.best >= 30; },  goal: function (c) { return [c.agg.streak, 30]; } },
    { id: 'racha_100',   icon: '👑', name: 'Presidente de la comunidad', desc: 'Consigue una racha de 100 días.',
      check: function (c) { return c.agg.best >= 100; }, goal: function (c) { return [c.agg.streak, 100]; } },
    { id: 'pleno',       icon: '🌟', name: 'Pleno en el rellano',      desc: 'Gana los 5 retos diarios el mismo día.',
      check: function (c) { return c.agg.wonToday >= 5; }, goal: function (c) { return [c.agg.wonToday, 5]; } },
    { id: 'clasico_1',   icon: '🎯', name: '¡A la primera!',           desc: 'Acierta el Clásico en 1 intento.',
      check: function (c) { return firstTry(c, 'classic'); } },
    { id: 'frases_1',    icon: '👂', name: 'Oído de portera',          desc: 'Acierta Frases a la primera.',
      check: function (c) { return firstTry(c, 'quote'); } },
    { id: 'pixel_1',     icon: '🦅', name: 'Ojo de halcón',            desc: 'Reconoce la Foto Pixelada a la primera.',
      check: function (c) { return firstTry(c, 'pixelada'); } },
    { id: 'cnx_perfect', icon: '🧩', name: 'Ni un fallo',              desc: 'Resuelve Conexiones sin errores.',
      check: function (c) { return firstTry(c, 'conexiones'); } },
    { id: 'impostor_10', icon: '🕵️', name: 'Detective de escalera',   desc: 'Gana 10 veces El Impostor.',
      check: function (c) { return c.agg.won.impostor >= 10; }, goal: function (c) { return [c.agg.won.impostor, 10]; } },
    { id: 'clasico_25',  icon: '🧹', name: 'Cotilla profesional',      desc: 'Gana 25 veces el Clásico.',
      check: function (c) { return c.agg.won.classic >= 25; }, goal: function (c) { return [c.agg.won.classic, 25]; } },
    { id: 'partidas_50', icon: '📅', name: 'Habitual de la escalera',  desc: 'Juega 50 retos diarios.',
      check: function (c) { return c.agg.played >= 50; }, goal: function (c) { return [c.agg.played, 50]; } },
    { id: 'victorias_100', icon: '🏆', name: 'Leyenda de Desengaño 21', desc: 'Consigue 100 victorias.',
      check: function (c) { return c.agg.wonTotal >= 100; }, goal: function (c) { return [c.agg.wonTotal, 100]; } },
    { id: 'madrugador',  icon: '🌅', name: 'Madrugador',               desc: 'Completa un reto antes de las 8:00.',
      check: function (c) { return !!c.ev && c.ev.hour < 8; } },
    { id: 'campana',     icon: '🔔', name: 'Salvado por la campana',   desc: 'Salva tu racha después de las 23:00.',
      check: function (c) {
        var b = c.ev && c.ev.streakBefore;
        return !!b && c.ev.hour >= 23 && b.count >= 1 && b.lastDate === ymd(-1);
      } },
  ];

  function firstTry(c, mode) {
    return !!c.ev && c.ev.mode === mode && c.ev.won && c.ev.attempts === 1;
  }

  // ── Fechas ──
  function ymd(offset) {
    var d = new Date(); d.setDate(d.getDate() + (offset || 0));
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  }
  function prettyDate(s) { // 'YYYYMMDD' → 'D/M/YYYY'
    return +s.slice(6, 8) + '/' + +s.slice(4, 6) + '/' + s.slice(0, 4);
  }

  // ── Almacenamiento ──
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { unlocked: s.unlocked || {}, best: s.best || 0 };
    } catch (e) { return { unlocked: {}, best: 0 }; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }
  function readJSON(k) {
    try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; }
  }

  // Lo que sabemos del jugador en este navegador
  function aggregate(state) {
    var streak = readJSON('anhqvdle_streak') || {};
    var active = streak.count >= 1 && (streak.lastDate === ymd(0) || streak.lastDate === ymd(-1));
    var agg = { streak: active ? streak.count : 0, played: 0, wonTotal: 0, won: {}, wonToday: 0 };
    agg.best = Math.max(state.best, agg.streak);
    MODES.forEach(function (m) {
      var s = readJSON('anhqvdle_stats_' + m) || {};
      var played = s.played || 0;
      var lost   = (s.distribution && s.distribution.X) || 0;
      agg.played   += played;
      agg.won[m]    = Math.max(0, played - lost);
      agg.wonTotal += agg.won[m];
      var today = readJSON('anhqvdle_' + m + '_' + ymd(0));
      if (today && today.done && today.won) agg.wonToday++;
    });
    return agg;
  }

  // Comprueba todos los logros; devuelve los recién conseguidos
  function evaluate(ev) {
    var state = load();
    var ctx = { agg: aggregate(state), ev: ev };
    state.best = ctx.agg.best;
    var fresh = [];
    LIST.forEach(function (l) {
      if (state.unlocked[l.id]) return;
      var ok = false;
      try { ok = l.check(ctx); } catch (e) {}
      if (ok) { state.unlocked[l.id] = ymd(0); fresh.push(l); }
    });
    save(state);
    if (fresh.length) syncToCloud();
    return fresh;
  }

  // Al terminar una partida. Se espera un momento para que updateStreak()
  // y saveDailyState() (que van justo después de updateStats) ya hayan corrido.
  function onGame(ev) {
    ev = Object.assign({ hour: new Date().getHours() }, ev);
    setTimeout(function () {
      var fresh = evaluate(ev);
      // Después de la animación de racha, si la hay
      fresh.forEach(function (l, i) { setTimeout(function () { toast(l); }, 1800 + i * 3800); });
    }, 50);
  }

  // ── Aviso "Logro desbloqueado" ──
  function toast(l) {
    var el = document.createElement('div');
    el.className = 'logro-toast';
    el.setAttribute('role', 'status');
    el.innerHTML = '<span class="logro-toast-icon">' + l.icon + '</span>' +
      '<span><span class="logro-toast-kicker">🏅 Logro desbloqueado</span><br>' +
      '<span class="logro-toast-name">' + l.name + '</span></span>';
    el.addEventListener('click', function () { el.remove(); show(); });
    document.body.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 350);
    }, 3400);
  }

  // ── Ventana con todos los logros ──
  function show() {
    if (document.getElementById('logros-modal')) return;
    var state = load();
    var ctx = { agg: aggregate(state), ev: null };
    var cards = LIST.map(function (l) {
      var date = state.unlocked[l.id];
      var extra = '';
      if (date) {
        extra = '<span class="logro-date">✓ ' + prettyDate(date) + '</span>';
      } else if (l.goal) {
        var g = l.goal(ctx);
        extra = '<span class="logro-desc">' + Math.min(g[0], g[1]) + ' / ' + g[1] + '</span>';
      }
      return '<div class="logro-card ' + (date ? 'on' : 'off') + '">' +
        '<span class="logro-icon">' + l.icon + '</span>' +
        '<span class="logro-name">' + l.name + '</span>' +
        '<span class="logro-desc">' + l.desc + '</span>' + extra + '</div>';
    }).join('');

    var loggedIn = window.AuthModule && AuthModule.getCurrentUser();
    var d = document.createElement('div');
    d.id = 'logros-modal';
    d.className = 'auth-overlay';
    d.innerHTML =
      '<div class="auth-box logros-box" role="dialog" aria-modal="true" aria-labelledby="logros-title">' +
        '<button class="auth-x" onclick="document.getElementById(\'logros-modal\').remove()" aria-label="Cerrar">✕</button>' +
        '<h2 class="auth-h2" id="logros-title">🏅 Mis logros</h2>' +
        '<p class="logros-progress"><strong>' + count() + '</strong> de ' + LIST.length + ' desbloqueados</p>' +
        '<div class="logros-grid">' + cards + '</div>' +
        '<p class="logros-hint">' + (loggedIn
          ? 'Tus logros se guardan en tu cuenta.'
          : 'Se guardan en este navegador. <a href="#" style="color:var(--accent)" onclick="document.getElementById(\'logros-modal\').remove();window.AuthModule&&AuthModule.showLogin();return false">Inicia sesión</a> para no perderlos al cambiar de móvil.') +
        '</p>' +
      '</div>';
    d.addEventListener('click', function (e) { if (e.target === d) d.remove(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { d.remove(); document.removeEventListener('keydown', esc); }
    });
    document.body.appendChild(d);
  }

  function count() { return Object.keys(load().unlocked).length; }

  // ── Nube: unión de lo local y lo guardado en la cuenta ──
  function syncToCloud() {
    if (!window.AuthModule) return;
    AuthModule.onReady(function (user) {
      if (!user) return;
      var db = AuthModule.getDb();
      if (!db) return;
      var ref = db.ref('users/' + user.uid + '/logros');
      ref.once('value').then(function (snap) {
        var remote = snap.val() || {};
        var state = load();
        var changedLocal = false, changedRemote = false;
        Object.keys(remote).forEach(function (id) {
          if (!state.unlocked[id] && /^\d{8}$/.test(remote[id])) { state.unlocked[id] = remote[id]; changedLocal = true; }
        });
        Object.keys(state.unlocked).forEach(function (id) {
          if (!remote[id]) { remote[id] = state.unlocked[id]; changedRemote = true; }
        });
        if (changedLocal) save(state);
        if (changedRemote) ref.set(remote).catch(function () {});
      }).catch(function () {});
    });
  }

  // Al cargar: recuperar los que ya se merecían (jugadores de antes de los logros)
  // sin avisos, y traer los de la cuenta.
  evaluate(null);
  try {
    if (!sessionStorage.getItem('anhqvdle_logros_sync')) {
      sessionStorage.setItem('anhqvdle_logros_sync', '1'); // una lectura por sesión, no por página
      syncToCloud();
    }
  } catch (e) { syncToCloud(); }

  return { onGame: onGame, show: show, count: count, total: function () { return LIST.length; } };
}());
