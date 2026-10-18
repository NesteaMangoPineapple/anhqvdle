/* ================================================
   ANHQVdle — Onboarding de la portada
   Recorrido de 3 pasos para quien entra por primera vez y aún no ha jugado:
   ilumina una parte de la página y explica qué es con un bocadillo.
   Solo se ve una vez (anhqvdle_onboarded).
   ================================================ */

(function () {
  var KEY = 'anhqvdle_onboarded';
  var STEPS = [
    { sel: '.daily-hub', title: 'Tus retos de hoy',
      text: 'Cada día hay 5 retos nuevos, los mismos para todo el mundo. Aquí ves cuáles llevas hechos.' },
    { sel: '#streak-header-badge', title: 'Tu racha 🔥',
      text: 'Completa al menos un reto al día y tu racha sube. Si un día no juegas, vuelve a empezar desde cero.' },
    { sel: 'a.mode-card[href="clasico.html"]', title: '¿Por dónde empiezo?',
      text: 'El Clásico es el mejor para estrenarse: escribe un personaje y las pistas de colores te acercan al del día.',
      last: true },
  ];

  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }
  // Solo a quien no ha jugado nunca (AnhqPopups está en pwa.js)
  if (window.AnhqPopups && AnhqPopups.hasPlayed()) {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    return;
  }

  var spot, tip, idx = 0;

  function visible(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function finish() {
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
    if (spot) spot.remove();
    if (tip) tip.remove();
    window.removeEventListener('resize', place);
    window.removeEventListener('scroll', place, true);
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') finish();
  }

  // Coloca el foco y el bocadillo sobre el paso actual
  function place() {
    var el = document.querySelector(STEPS[idx].sel);
    if (!visible(el)) return;
    var r = el.getBoundingClientRect(), pad = 8;
    spot.style.top    = (r.top - pad) + 'px';
    spot.style.left   = (r.left - pad) + 'px';
    spot.style.width  = (r.width + pad * 2) + 'px';
    spot.style.height = (r.height + pad * 2) + 'px';

    var tw = tip.offsetWidth, th = tip.offsetHeight, gap = 14;
    var below = r.bottom + pad + gap + th < window.innerHeight;
    var top = below ? r.bottom + pad + gap : Math.max(12, r.top - pad - gap - th);
    var left = Math.min(Math.max(16, r.left + r.width / 2 - tw / 2), window.innerWidth - tw - 16);
    tip.style.top = top + 'px';
    tip.style.left = left + 'px';
  }

  function show(i) {
    // Saltar pasos cuyo elemento no se ve (p. ej. el badge aún no ha salido)
    while (i < STEPS.length && !visible(document.querySelector(STEPS[i].sel))) i++;
    if (i >= STEPS.length) { finish(); return; }
    idx = i;
    var step = STEPS[i];
    var el = document.querySelector(step.sel);
    var fixed = getComputedStyle(el).position === 'fixed';
    if (!fixed) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    tip.innerHTML =
      '<div class="onb-step">Paso ' + (i + 1) + ' de ' + STEPS.length + '</div>' +
      '<div class="onb-title">' + step.title + '</div>' +
      '<div class="onb-text">' + step.text + '</div>' +
      '<div class="onb-actions">' +
        '<button class="onb-skip">Saltar</button>' +
        '<button class="onb-next">' + (step.last ? '¡A jugar!' : 'Siguiente') + '</button>' +
      '</div>';
    tip.querySelector('.onb-skip').onclick = finish;
    tip.querySelector('.onb-next').onclick = function () {
      if (step.last) { finish(); location.href = 'clasico.html'; }
      else show(i + 1);
    };
    place();
    setTimeout(place, 400); // tras el scroll suave
    tip.querySelector('.onb-next').focus({ preventScroll: true });
  }

  function start() {
    // No pisar otra ventana que ya esté abierta
    if (document.querySelector('.auth-overlay, #tutorial-modal.active, #kofi-popup')) return;
    spot = document.createElement('div');
    spot.className = 'onb-spot';
    tip = document.createElement('div');
    tip.className = 'onb-tip';
    tip.setAttribute('role', 'dialog');
    tip.setAttribute('aria-label', 'Cómo funciona ANHQVdle');
    document.body.appendChild(spot);
    document.body.appendChild(tip);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('keydown', onKey);
    show(0);
  }

  window.addEventListener('load', function () { setTimeout(start, 900); });
}());
