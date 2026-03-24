/* ================================================
   ANHQVdle — Utilidades compartidas
   ================================================ */

/**
 * Renderiza los puntos de intentos (pips)
 * @param {string} id    - ID del contenedor
 * @param {number} max   - Máximo de intentos
 * @param {number} used  - Intentos usados
 * @param {boolean} won  - Si se ganó en el último intento
 */
function renderPips(id, max, used, won = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = Array.from({ length: max }, (_, i) => {
    let cls = '';
    if (i < used) cls = (won && i === used - 1) ? 'win' : 'used';
    return `<div class="pip ${cls}"></div>`;
  }).join('');
}

/**
 * Muestra el banner de resultado (victoria o derrota)
 * @param {string} containerId - ID del div de resultado
 * @param {boolean} won        - Si ganó
 * @param {string} charName    - Nombre del personaje correcto
 * @param {number} attempts    - Número de intentos usados
 * @param {string} mode        - Modo de juego ('classic' | 'quote' | 'emoji')
 */
function showResult(containerId, won, charName, attempts, mode) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="result-banner">
      <h2>${won ? '🎉 ¡Correcto!' : '😭 ¡Uy!'}</h2>
      <p>
        ${won
          ? `Lo adivinaste en <strong>${attempts}</strong> intento${attempts !== 1 ? 's' : ''}`
          : 'No lo has adivinado esta vez...'}
      </p>
      <div class="character-reveal">${won ? charName : '→ Era: ' + charName}</div>
      <p style="font-size:0.85rem; color:var(--text2); margin-top:8px">
        ${won ? getWinMessage(attempts) : '¡Sigue practicando, vecino!'}
      </p>
      <button class="play-again-btn" onclick="restartMode('${mode}')">🔄 Jugar de nuevo</button>
    </div>
  `;
}

/**
 * Mensaje aleatorio según intentos usados
 */
function getWinMessage(n) {
  if (n === 1) return '¡Increíble! ¡Eres un experto de la comunidad!';
  if (n <= 3)  return '¡Muy bien! El portal del edificio te conoce bien...';
  if (n <= 5)  return '¡Bien! Pero aún te queda práctica con el cotilleo vecinal.';
  return '¡Justo a tiempo! Casi te tira Vicenta a escobazos.';
}

/**
 * Genera el desplegable de autocompletado
 * @param {string} inputId   - ID del input
 * @param {string} acId      - ID del contenedor autocomplete
 * @param {Function} onSelect - Callback al seleccionar un nombre
 */
function buildAutocomplete(inputId, acId, onSelect) {
  const input = document.getElementById(inputId);
  const ac    = document.getElementById(acId);
  if (!input || !ac) return;

  const val = input.value.trim().toLowerCase();
  if (!val) { ac.style.display = 'none'; return; }

  const matches = CHARACTERS
    .filter(c => c.name.toLowerCase().includes(val))
    .slice(0, 6);

  if (!matches.length) { ac.style.display = 'none'; return; }

  ac.innerHTML = matches.map(c => {
    const slug = c.name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const imgPath = `img/personajes/${slug}.webp`;
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

  // Añadir eventos con JS en vez de inline onclick
  ac.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', () => {
      onSelect(item.dataset.name);
      ac.style.display = 'none';
    });
  });

  ac.style.display = 'block';
}

/**
 * Cierra todos los autocompletes al hacer clic fuera
 */
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) {
    document.querySelectorAll('.autocomplete').forEach(a => a.style.display = 'none');
  }
});

/* ══════════════════════════════════════
   ESTADÍSTICAS
══════════════════════════════════════ */

function loadStats(mode) {
  const def = { played:0, streak:0, maxStreak:0, lastWonDate:null, totalAttempts:0,
    distribution:{'1':0,'2':0,'3':0,'4':0,'5':0,'6+':0} };
  try {
    return Object.assign({}, def, JSON.parse(localStorage.getItem(`anhqvdle_stats_${mode}`) || '{}'));
  } catch(e) { return def; }
}

function updateStats(mode, attempts) {
  const stats   = loadStats(mode);
  const today   = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (stats.lastWonDate === today) return; // ya contado hoy
  stats.played++;
  stats.totalAttempts += attempts;
  const key = attempts <= 5 ? String(attempts) : '6+';
  stats.distribution[key] = (stats.distribution[key] || 0) + 1;
  stats.streak = stats.lastWonDate === yesterday ? stats.streak + 1 : 1;
  stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
  stats.lastWonDate = today;
  localStorage.setItem(`anhqvdle_stats_${mode}`, JSON.stringify(stats));
}

function showStatsModal(mode) {
  const existing = document.getElementById('stats-modal');
  if (existing) { existing.remove(); return; }
  const stats    = loadStats(mode);
  const avg      = stats.played > 0 ? (stats.totalAttempts / stats.played).toFixed(1) : '—';
  const modeLabel = mode === 'classic' ? '🎬 Clásico' : '💬 Frases';
  const maxVal   = Math.max(...Object.values(stats.distribution), 1);
  const distHtml = Object.entries(stats.distribution).map(([k, v]) => {
    const pct = Math.round((v / maxVal) * 100);
    return `<div class="stat-dist-row">
      <span class="stat-dist-label">${k}</span>
      <div class="stat-dist-bar-wrap">
        <div class="stat-dist-bar${v > 0 ? ' has-val' : ''}" style="width:${Math.max(pct,8)}%">${v > 0 ? v : ''}</div>
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

/**
 * Marca el input con borde rojo brevemente (nombre no encontrado)
 */
function shakeInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.style.borderColor = 'var(--accent)';
  setTimeout(() => (input.style.borderColor = ''), 800);
}
