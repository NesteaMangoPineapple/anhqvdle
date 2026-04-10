/* ================================================
   ANHQVdle — Estadísticas globales del día
   Lectura y escritura anónima en Firebase.
   Ruta: /global_stats/{YYYY-MM-DD}/{mode}/
   ================================================ */

window.GlobalStats = (function () {

  function _db() {
    return (window.firebase && firebase.apps && firebase.apps.length)
      ? firebase.database() : null;
  }

  function _today() {
    return new Date().toISOString().slice(0, 10);
  }

  // Llamar al terminar una partida (desde utils.js updateStats)
  function update(mode, attempts, won) {
    var db = _db();
    if (!db) return;

    var today = _today();
    var lsKey = 'anhqvdle_gs_' + mode + '_' + today;
    if (localStorage.getItem(lsKey)) return; // ya contribuimos hoy
    localStorage.setItem(lsKey, '1');

    var ref = db.ref('global_stats/' + today + '/' + mode);

    ref.child('plays').transaction(function (n) { return (n || 0) + 1; });
    if (won) {
      ref.child('wins').transaction(function (n) { return (n || 0) + 1; });
    }
    // Clave de distribución: '6+' → '6p para evitar carácter inválido en Firebase
    var distKey = 'dist_' + (won ? String(attempts).replace('+', 'p') : 'X');
    ref.child(distKey).transaction(function (n) { return (n || 0) + 1; });
  }

  // Cargar y mostrar en tiempo real en el contenedor indicado
  function load(mode, containerId) {
    var db = _db();
    if (!db) {
      // Firebase aún no listo, reintentar
      setTimeout(function () { load(mode, containerId); }, 800);
      return;
    }
    var today = _today();
    db.ref('global_stats/' + today + '/' + mode).on('value', function (snap) {
      _render(snap.val() || {}, mode, containerId);
    });
  }

  function _render(data, mode, containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    var plays = data.plays || 0;
    if (plays === 0) { el.innerHTML = ''; return; }

    var wins = data.wins || 0;
    var pct  = Math.round((wins / plays) * 100);

    // Claves de distribución según modo
    var keys = (mode === 'classic')
      ? ['1','2','3','4','5','6','7','8']
      : ['1','2','3','4','5','6p'];

    // Máximo para escalar las barras
    var maxVal = 1;
    keys.forEach(function (k) { maxVal = Math.max(maxVal, data['dist_' + k] || 0); });
    maxVal = Math.max(maxVal, data.dist_X || 0);

    function bar(label, count, isX) {
      var w = Math.round((count / maxVal) * 100);
      return '<div class="gs-bar-row">' +
        '<span class="gs-bar-label' + (isX ? ' gs-label-x' : '') + '">' + label + '</span>' +
        '<div class="gs-bar-track">' +
          '<div class="gs-bar-fill' + (isX ? ' gs-fill-x' : '') + '" style="width:' + w + '%"></div>' +
        '</div>' +
        '<span class="gs-bar-count">' + count + '</span>' +
      '</div>';
    }

    var barsHtml = keys.map(function (k) {
      var label = k.replace('p', '+');
      return bar(label, data['dist_' + k] || 0, false);
    }).join('');
    barsHtml += bar('✗', data.dist_X || 0, true);

    el.innerHTML =
      '<div class="gs-panel">' +
        '<div class="gs-title">Hoy en la comunidad</div>' +
        '<div class="gs-summary">' +
          '<div class="gs-stat"><span class="gs-num">' + plays + '</span><span class="gs-label">jugaron</span></div>' +
          '<div class="gs-stat"><span class="gs-num">' + pct + '%</span><span class="gs-label">lo adivinaron</span></div>' +
        '</div>' +
        '<div class="gs-bars">' + barsHtml + '</div>' +
      '</div>';
  }

  return { update: update, load: load };
})();
