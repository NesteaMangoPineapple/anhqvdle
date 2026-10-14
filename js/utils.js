/* ================================================
   ANHQVdle — Utilidades compartidas
   ================================================ */

/**
 * Convierte un nombre de personaje a slug URL-safe.
 * Centralizado aquí para evitar duplicación en classic/quote/quiz.
 */
function toSlug(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* Emoji de respaldo si falla la foto del personaje */
function getCharacterEmoji(name) {
  const map = {
    "Emilio Delgado":"🧹","Mariano Delgado":"📚","Vicenta Benito":"🌸","Marisa Benito":"🚬",
    "Concha de la Fuente":"👵","Mauri Hidalgo":"🌈","Fernando Navarro":"⚖️","Bea Villarejo":"📖",
    "Juan Cuesta":"📋","Paloma Hurtado":"🕊️","Natalia Cuesta":"👩","José Miguel Cuesta":"🎮",
    "Isabel Ruiz":"🌿","Yago":"🌍","Armando Rubio":"😎","Andrés Guerra":"💼",
    "Pablo Guerra":"🎸","Álex Guerra":"💪","Higinio Heredia":"🔨","Mamen Heredia":"🛋️",
    "Candela Heredia":"🍭","Raquel Heredia":"💄","Moncho Heredia":"🛌","Lucía Álvarez":"👜",
    "Roberto Alonso":"✏️","Carlos de Haro":"💰","Nieves Cuesta":"❄️","Rafael Álvarez":"🦇",
    "Carmen Villanueva":"📐","Belén López":"💃","Alicia Sanz":"💅","Ana":"🇩🇪",
    "María Jesús":"🍞","Paco":"📼","Gerardo":"🔧","Padre Miguel":"✝️",
    "Gregorio":"🗂️","Hermana Esperanza":"📻","Daniel Rubio":"👦","Rebeca":"👧",
    "Ezequiel Hidalgo":"🍼","La Paqui":"🧽","Rocío":"✉️","José María":"🎒","Abel":"🧸",
    "Marta «La Pantumaca»":"🍅",
  };
  return map[name] || "👤";
}

/* ══════════════════════════════════════
   MODO DALTONISMO
══════════════════════════════════════ */

function initColorblind() {
  if (localStorage.getItem('anhqvdle_cb') === '1') document.body.classList.add('cb');
  document.querySelectorAll('.cb-toggle').forEach(btn => {
    btn.classList.toggle('active', document.body.classList.contains('cb'));
    btn.title = document.body.classList.contains('cb') ? 'Desactivar modo daltónico' : 'Activar modo daltónico';
  });
}

function toggleColorblind() {
  document.body.classList.toggle('cb');
  const on = document.body.classList.contains('cb');
  localStorage.setItem('anhqvdle_cb', on ? '1' : '0');
  document.querySelectorAll('.cb-toggle').forEach(btn => {
    btn.classList.toggle('active', on);
    btn.title = on ? 'Desactivar modo daltónico' : 'Activar modo daltónico';
  });
}

/* ══════════════════════════════════════
   PIPS
══════════════════════════════════════ */

function renderPips(id, max, used, won = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = Array.from({ length: max }, (_, i) => {
    let cls = '';
    if (i < used) cls = (won && i === used - 1) ? 'win' : 'used';
    return `<div class="pip ${cls}"></div>`;
  }).join('');
}

/* ══════════════════════════════════════
   RESULTADO (shared helper — sin uso activo)
══════════════════════════════════════ */

function getWinMessage(n) {
  if (n === 1) return '¡Increíble! ¡Eres un experto de la comunidad!';
  if (n <= 3)  return '¡Muy bien! El portal del edificio te conoce bien...';
  if (n <= 5)  return '¡Bien! Pero aún te queda práctica con el cotilleo vecinal.';
  return '¡Justo a tiempo! Casi te tira Vicenta a escobazos.';
}

/* ══════════════════════════════════════
   AUTOCOMPLETE
══════════════════════════════════════ */

/**
 * Genera el desplegable de autocompletado con soporte de acentos.
 */
function buildAutocomplete(inputId, acId, onSelect) {
  const input = document.getElementById(inputId);
  const ac    = document.getElementById(acId);
  if (!input || !ac) return;

  const rawVal = input.value.trim();
  if (!rawVal) { ac.style.display = 'none'; return; }

  // Normalizar acentos para que "Jose" encuentre "José"
  const val = rawVal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const matches = CHARACTERS
    .filter(c => {
      const norm = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return norm.includes(val);
    })
    .slice(0, 6);

  if (!matches.length) { ac.style.display = 'none'; return; }

  ac.innerHTML = matches.map(c => {
    const imgPath = `img/personajes/${toSlug(c.name)}.webp`;
    const subtitle = c.occupations && c.occupations.length ? c.occupations[0] : '';
    return `
      <div class="autocomplete-item" data-name="${c.name}">
        <div class="ac-avatar">
          <img src="${imgPath}" alt="${c.name}"
            onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none'}">
        </div>
        <div class="ac-info">
          <span class="ac-name">${c.name}</span>
          ${subtitle ? `<span class="ac-sub">${subtitle}</span>` : ''}
        </div>
      </div>`;
  }).join('');

  ac.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', () => {
      onSelect(item.dataset.name);
      ac.style.display = 'none';
    });
  });

  ac.style.display = 'block';
}

// Cierra autocomplete al hacer clic fuera
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) {
    document.querySelectorAll('.autocomplete').forEach(a => a.style.display = 'none');
  }
});

// Cierra modales con Escape
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const stats = document.getElementById('stats-modal');
  if (stats) stats.remove();
  const tutorial = document.getElementById('tutorial-modal');
  if (tutorial && tutorial.classList.contains('active') && typeof hideTutorial === 'function') hideTutorial();
});

/* ══════════════════════════════════════
   ESTADÍSTICAS
══════════════════════════════════════ */

function loadStats(mode) {
  const def = {
    played: 0, streak: 0, maxStreak: 0,
    lastWonDate: null, lastPlayedDate: null,
    totalAttempts: 0,
    distribution: { '1':0,'2':0,'3':0,'4':0,'5':0,'6+':0,'X':0 }
  };
  try {
    const parsed = JSON.parse(localStorage.getItem(`anhqvdle_stats_${mode}`) || '{}');
    // Garantizar que distribution tiene la clave X
    if (parsed.distribution && !('X' in parsed.distribution)) parsed.distribution['X'] = 0;
    return Object.assign({}, def, parsed);
  } catch(e) { return def; }
}

function updateStats(mode, attempts, won) {
  // Días pasados (modo práctica): no cuentan para nada
  if (typeof isPracticeMode === 'function' && isPracticeMode()) return;

  const stats     = loadStats(mode);
  const _d = new Date();
  const today     = `${_d.getFullYear()}-${String(_d.getMonth()+1).padStart(2,'0')}-${String(_d.getDate()).padStart(2,'0')}`;
  const _y = new Date(_d); _y.setDate(_y.getDate() - 1);
  const yesterday = `${_y.getFullYear()}-${String(_y.getMonth()+1).padStart(2,'0')}-${String(_y.getDate()).padStart(2,'0')}`;

  // Evitar doble conteo por si se llama dos veces el mismo día
  if (stats.lastPlayedDate === today) return;

  stats.played++;
  stats.lastPlayedDate = today;

  if (won) {
    stats.totalAttempts += attempts;
    const key = attempts <= 5 ? String(attempts) : '6+';
    stats.distribution[key] = (stats.distribution[key] || 0) + 1;
    stats.streak    = stats.lastWonDate === yesterday ? stats.streak + 1 : 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
    stats.lastWonDate = today;
  } else {
    stats.distribution['X'] = (stats.distribution['X'] || 0) + 1;
    stats.streak = 0;
  }

  localStorage.setItem(`anhqvdle_stats_${mode}`, JSON.stringify(stats));

  // Sync to Firebase if user is logged in
  if (typeof StatsFirebase !== 'undefined') {
    StatsFirebase.saveGameResult(mode, attempts, won);
  }
  // Global anonymous stats (no login required)
  if (typeof GlobalStats !== 'undefined') {
    GlobalStats.update(mode, attempts, won);
  }
}

function showStatsModal(mode) {
  const existing = document.getElementById('stats-modal');
  if (existing) { existing.remove(); return; }

  const stats    = loadStats(mode);
  const lost     = stats.distribution['X'] || 0;
  const won      = stats.played - lost;
  const winRate  = stats.played > 0 ? Math.round(won / stats.played * 100) : 0;
  const avg      = won > 0 ? (stats.totalAttempts / won).toFixed(1) : '—';
  const modeLabel = mode === 'classic' ? '🎬 Clásico' : '💬 Frases';

  const distOrder = ['1','2','3','4','5','6+','X'];
  const maxVal    = Math.max(...distOrder.map(k => stats.distribution[k] || 0), 1);

  const distHtml = distOrder.map(k => {
    const v   = stats.distribution[k] || 0;
    const pct = Math.round((v / maxVal) * 100);
    const isX = k === 'X';
    return `<div class="stat-dist-row">
      <span class="stat-dist-label${isX ? ' stat-dist-lost' : ''}">${isX ? '✗' : k}</span>
      <div class="stat-dist-bar-wrap">
        <div class="stat-dist-bar${v > 0 ? ' has-val' : ''}${isX && v > 0 ? ' stat-dist-bar-lost' : ''}" style="width:${Math.max(pct,8)}%">${v > 0 ? v : ''}</div>
      </div>
    </div>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'stats-modal';
  modal.className = 'stats-modal-overlay';
  modal.innerHTML = `
    <div class="stats-modal">
      <button class="stats-close" onclick="document.getElementById('stats-modal').remove()">✕</button>
      <h2 class="stats-title">Mis estadísticas</h2>
      <p class="stats-mode-label">${modeLabel}</p>
      <div class="stats-grid">
        <div class="stat-item"><div class="stat-num">${stats.played}</div><div class="stat-lbl">Jugadas</div></div>
        <div class="stat-item"><div class="stat-num">${winRate}%</div><div class="stat-lbl">% Victorias</div></div>
        <div class="stat-item"><div class="stat-num">${stats.streak}</div><div class="stat-lbl">Racha</div></div>
        <div class="stat-item"><div class="stat-num">${stats.maxStreak}</div><div class="stat-lbl">Máx. racha</div></div>
        <div class="stat-item"><div class="stat-num">${avg}</div><div class="stat-lbl">Media int.</div></div>
      </div>
      <h3 class="stats-dist-title">Distribución de intentos</h3>
      <div class="stats-dist">${distHtml}</div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

/* ══════════════════════════════════════
   CUENTA ATRÁS (compartida)
══════════════════════════════════════ */

function startCountdown(elementId) {
  function tick() {
    const el = document.getElementById(elementId);
    if (!el) return;
    const ms = msUntilMidnight();
    if (ms <= 0) { location.reload(); return; }
    el.textContent = formatCountdown(ms);
  }
  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════
   KOFI POPUP
══════════════════════════════════════ */

function maybeShowKofiPopup() {
  const key  = 'anhqvdle_kofi_shown';
  const last = parseInt(localStorage.getItem(key) || '0', 10);
  if (Date.now() - last < 7 * 24 * 60 * 60 * 1000) return;

  setTimeout(() => {
    if (document.getElementById('kofi-popup')) return;
    const overlay = document.createElement('div');
    overlay.id = 'kofi-popup';
    overlay.className = 'kofi-popup-overlay';
    overlay.innerHTML = `
      <div class="kofi-popup">
        <button class="kofi-popup-close" onclick="closeKofiPopup()" aria-label="Cerrar">✕</button>
        <div class="kofi-popup-icon">☕</div>
        <h3 class="kofi-popup-title">¿Te gusta el juego?</h3>
        <p class="kofi-popup-text">Invita a Marisa a su chínchón y ayúdanos a seguir añadiendo nuevos modos de juego.</p>
        <div class="kofi-popup-btns">
          <a href="https://ko-fi.com/anhqvdle" target="_blank" rel="noopener" class="kofi-popup-donate" onclick="closeKofiPopup()">☕ Invitar a Marisa</a>
          <button class="kofi-popup-skip" onclick="closeKofiPopup()">Ahora no</button>
        </div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeKofiPopup(); });
    document.body.appendChild(overlay);
    localStorage.setItem(key, String(Date.now()));
  }, 2500);
}

function closeKofiPopup() {
  const popup = document.getElementById('kofi-popup');
  if (popup) popup.remove();
}

/* ══════════════════════════════════════
   INPUT FEEDBACK
══════════════════════════════════════ */

function shakeInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.style.borderColor = 'var(--accent)';
  setTimeout(() => (input.style.borderColor = ''), 800);
}

/* ══════════════════════════════════════
   STORIES — helpers compartidos (9:16)
══════════════════════════════════════ */

function _drawStoriesBase(ctx, W, H, modeLabel, resultText, won) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0f0c00'); grad.addColorStop(0.5, '#0a0a0a'); grad.addColorStop(1, '#000');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(240,192,32,0.25)'; ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, W - 6, H - 6);
  ctx.fillStyle = '#f0c020'; ctx.fillRect(0, 0, W, 8);

  ctx.textAlign = 'center';
  // Logo: ANHQV en dorado + dle en blanco, misma fuente que el juego
  ctx.font = '140px "Bebas Neue", Impact, sans-serif';
  ctx.fillStyle = '#f0c020';
  const anhqvW = ctx.measureText('ANHQV').width;
  const dleW   = ctx.measureText('dle').width;
  const logoX  = (W - anhqvW - dleW) / 2;
  ctx.textAlign = 'left';
  ctx.fillText('ANHQV', logoX, 210);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('dle', logoX + anhqvW, 210);
  ctx.textAlign = 'center';

  ctx.font = '700 36px "Barlow Condensed", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.letterSpacing = '6px';
  ctx.fillText('AQUÍ NO HAY QUIEN VIVA', W / 2, 268);
  ctx.letterSpacing = '0px';

  ctx.font = '600 54px "Barlow Condensed", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(`${modeLabel}  ·  #${getDayNumber()}`, W / 2, 370);

  ctx.strokeStyle = 'rgba(240,192,32,0.3)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(120, 420); ctx.lineTo(W - 120, 420); ctx.stroke();

  ctx.font = '700 68px "Barlow Condensed", Arial, sans-serif';
  ctx.fillStyle = won ? '#4ade80' : '#f87171';
  ctx.fillText(resultText, W / 2, 520);
}

function _drawStoriesCTA(ctx, W, H) {
  ctx.fillStyle = '#f0c020';
  ctx.beginPath(); ctx.roundRect(W / 2 - 280, 1545, 560, 100, 50); ctx.fill();
  ctx.font = '800 54px "Barlow Condensed", Arial, sans-serif';
  ctx.fillStyle = '#000'; ctx.textAlign = 'center';
  ctx.fillText('anhqvdle.es', W / 2, 1613);

  ctx.font = '400 34px "Barlow", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillText('Fan-made · No oficial', W / 2, H - 60);
}

function _wrapText(ctx, text, cx, y, maxWidth, lineH) {
  const words = text.split(' '); let line = '';
  words.forEach(word => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), cx, y); y += lineH; line = word + ' ';
    } else { line = test; }
  });
  if (line) ctx.fillText(line.trim(), cx, y);
}

function _shareStoriesBlob(canvas, filename) {
  canvas.toBlob(blob => {
    if (!blob) return;
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'ANHQVdle' })
        .catch(() => _downloadStoriesBlob(blob, filename));
    } else {
      _downloadStoriesBlob(blob, filename);
    }
  }, 'image/png');
}

function _downloadStoriesBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Espera a que las Google Fonts estén disponibles antes de dibujar en canvas
function _withFontsReady(drawFn) {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(drawFn);
  } else {
    setTimeout(drawFn, 300);
  }
}

/* ══════════════════════════════════════
   RETO DE AYER
   Como ayer se puede jugar en modo práctica, la solución solo se enseña
   si ya lo jugaste; si no, se invita a jugarlo. En práctica no se muestra.
══════════════════════════════════════ */

function renderYesterdayPill(elId, mode, charName, revealHtml) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (typeof isPracticeMode === 'function' && isPracticeMode()) { el.innerHTML = ''; return; }

  const d = new Date(); d.setDate(d.getDate() - 1);
  const key = `anhqvdle_${mode}_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  let played = false;
  try { played = !!(JSON.parse(localStorage.getItem(key) || 'null') || {}).done; } catch (e) {}

  if (played) {
    const imgPath = `img/personajes/${toSlug(charName)}.webp`;
    el.innerHTML = `
    <div class="yesterday-pill">
      <img src="${imgPath}" alt="${charName}"
        onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none'}">
      <span>${revealHtml}</span>
    </div>`;
  } else {
    el.innerHTML = `
    <a class="yesterday-pill yesterday-play" href="${location.pathname.split('/').pop()}?dia=${getDayNumber() - 1}">
      <span>🕹️ ¿Te perdiste el reto de ayer? <strong>Juégalo →</strong></span>
    </a>`;
  }
}

/* ══════════════════════════════════════
   DÍAS ANTERIORES (modo práctica)
   Tira con los últimos PAST_DAYS_PLAYABLE retos y aviso cuando se juega uno.
══════════════════════════════════════ */

const _PAST_DAYS_MODES = {
  'clasico.html': 'classic', 'frases.html': 'quote', 'impostor.html': 'impostor',
  'conexiones.html': 'conexiones', 'pixelada.html': 'pixelada',
};

function initPastDays() {
  const page = location.pathname.split('/').pop() || '';
  const mode = _PAST_DAYS_MODES[page];
  const main = document.querySelector('main');
  if (!mode || !main || typeof gameDate !== 'function') return;

  const DAYS   = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const pad    = n => String(n).padStart(2, '0');
  const ymd    = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const todayN = getDayNumber() - (isPracticeMode() ? _gameDateOffset : 0);
  const playing = getDayNumber();

  // Aviso de modo práctica
  if (isPracticeMode()) {
    const d = gameDate();
    const banner = document.createElement('div');
    banner.className = 'practice-banner';
    banner.innerHTML = `🕹️ Estás jugando el reto <strong>#${playing}</strong> (${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}).
      Es <strong>modo práctica</strong>: no cuenta para tu racha ni para el ranking.
      <a href="${page}">Ir al reto de hoy →</a>`;
    main.insertBefore(banner, main.firstChild);
  }

  // Tira de días
  const items = [];
  for (let i = PAST_DAYS_PLAYABLE; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const n = todayN - i;
    let state = '';
    try {
      const saved = JSON.parse(localStorage.getItem(`anhqvdle_${mode}_${ymd(d)}`) || 'null');
      if (saved && saved.done) state = saved.won ? 'won' : 'lost';
    } catch (e) {}
    const icon  = state === 'won' ? '✓' : state === 'lost' ? '✗' : '';
    const label = i === 0 ? 'Hoy' : `${DAYS[d.getDay()]} ${d.getDate()}`;
    const href  = i === 0 ? page : `${page}?dia=${n}`;
    items.push(`<a class="past-day ${state}${n === playing ? ' current' : ''}" href="${href}" title="Reto #${n}">
        <span class="past-day-label">${label}</span><span class="past-day-num">#${n} ${icon}</span></a>`);
  }
  const strip = document.createElement('div'); // <nav> no: hereda los estilos del menú
  strip.className = 'past-days';
  strip.setAttribute('role', 'navigation');
  strip.setAttribute('aria-label', 'Retos de días anteriores');
  strip.innerHTML = `<p class="past-days-title">📅 Días anteriores</p>
    <p class="past-days-sub">Juega los retos que te perdiste. Son de práctica: no cuentan para la racha ni el ranking.</p>
    <div class="past-days-row">${items.join('')}</div>`;
  const guide = main.querySelector('.mode-guide');
  main.insertBefore(strip, guide || null);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPastDays);
else initPastDays();
