/* ================================================
   ANHQVdle — Modo Conexiones
   ================================================ */

const MODE_KEY_CNX = 'conexiones';
const MAX_MISTAKES  = 5;

/* ── Puzzles diarios (3 grupos × 4 personajes = 12) ── */
const CONEXIONES_PUZZLES = [
  {
    groups: [
      { label: 'Vivieron en el 1º B',          color: 'yellow', chars: ['Mauri Hidalgo','Fernando Navarro','Bea Villarejo','Ezequiel Hidalgo'] },
      { label: 'Ama de casa',                  color: 'green',  chars: ['Paloma Hurtado','Isabel Ruiz','Mamen Heredia','María Jesús'] },
      { label: 'Solo 1 temporada en la serie', color: 'blue',   chars: ['Armando Cortés','Rocío','Daniel Rubio','Rebeca'] },
    ]
  },
  {
    groups: [
      { label: 'Vivieron en el 3º A',          color: 'yellow', chars: ['Lucía Álvarez','Roberto Alonso','Carlos de Haro','Rafael Álvarez'] },
      { label: 'Estudiantes',                  color: 'green',  chars: ['Emilio Delgado','José Miguel Cuesta','Pablo Guerra','Candela Heredia'] },
      { label: 'Solo aparecen de visita',      color: 'blue',   chars: ['Gerardo','Padre Miguel','Abel','José María'] },
    ]
  },
  {
    groups: [
      { label: 'Hermanos/as en el edificio',   color: 'yellow', chars: ['Vicenta Benito','Marisa Benito','Pablo Guerra','Álex Guerra'] },
      { label: 'Empresarios',                  color: 'green',  chars: ['Andrés Guerra','Carlos de Haro','Moncho Heredia','Rafael Álvarez'] },
      { label: 'Los Heredia',                  color: 'blue',   chars: ['Higinio Heredia','Mamen Heredia','Candela Heredia','Raquel Heredia'] },
    ]
  },
  {
    groups: [
      { label: 'Los Cuesta del 2º A',          color: 'yellow', chars: ['Juan Cuesta','Paloma Hurtado','Natalia Cuesta','José Miguel Cuesta'] },
      { label: 'Vivieron en el ático',         color: 'green',  chars: ['Andrés Guerra','Pablo Guerra','Paco','Yago'] },
      { label: 'Llegaron en la T3',            color: 'blue',   chars: ['Nieves Cuesta','Carmen Villanueva','Diego Álvarez','Gregorio'] },
    ]
  },
  {
    groups: [
      { label: 'Solo aparecen en la T5',       color: 'yellow', chars: ['Mamen Heredia','Candela Heredia','Raquel Heredia','Moncho Heredia'] },
      { label: 'Vivieron en el 3º B',          color: 'green',  chars: ['Belén López','Alicia Sanz','Ana','María Jesús'] },
      { label: 'Vivieron en tres pisos o más', color: 'blue',   chars: ['Concha de la Fuente','Roberto Alonso','Bea Villarejo','Carmen Villanueva'] },
    ]
  },
  {
    groups: [
      { label: 'Padre/a e hijo/a en el edificio', color: 'yellow', chars: ['Mariano Delgado','Emilio Delgado','Rafael Álvarez','Lucía Álvarez'] },
      { label: 'Aparecen en las 5 temporadas', color: 'green',  chars: ['Juan Cuesta','Mauri Hidalgo','Fernando Navarro','Paco'] },
      { label: 'Llegaron en la T2',            color: 'blue',   chars: ['Bea Villarejo','Isabel Ruiz','Andrés Guerra','Álex Guerra'] },
    ]
  },
  {
    groups: [
      { label: 'Pareja oficial del edificio',  color: 'yellow', chars: ['Mauri Hidalgo','Fernando Navarro','Emilio Delgado','Belén López'] },
      { label: 'Esporádicos de varias temporadas', color: 'green', chars: ['Gerardo','Padre Miguel','Gregorio','Hermana Esperanza'] },
      { label: 'Sin empleo fijo o en paro',    color: 'blue',   chars: ['Armando Cortés','Alicia Sanz','Raquel Heredia','Diego Álvarez'] },
    ]
  },
  {
    groups: [
      { label: 'Solo conocidos por su nombre', color: 'yellow', chars: ['Ana','Paco','Yago','Abel'] },
      { label: 'Vinculados al arte o la cultura', color: 'green', chars: ['Roberto Alonso','Mariano Delgado','Padre Miguel','Belén López'] },
      { label: 'Profesionales liberales',      color: 'blue',   chars: ['Fernando Navarro','Mauri Hidalgo','Natalia Cuesta','Carmen Villanueva'] },
    ]
  },
];

function seededShuffleCnx(arr, seed) {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const COLOR_STYLES = {
  yellow: { bg: 'rgba(240,192,32,0.25)',  border: '#f0c020',  text: '#f0c020'  },
  green:  { bg: 'rgba(74,222,128,0.2)',   border: '#4ade80',  text: '#4ade80'  },
  blue:   { bg: 'rgba(96,165,250,0.2)',   border: '#60a5fa',  text: '#60a5fa'  },
};

let cnxPuzzle    = null;
let cnxSelected  = [];
let cnxFound     = [];   // array of solved group colors
let cnxMistakes  = 0;
let cnxDone      = false;
let cnxHintUsed  = false;

function getCnxPuzzle() {
  return CONEXIONES_PUZZLES[getDayNumber() % CONEXIONES_PUZZLES.length];
}

function cnxSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function initConexiones() {
  if (location.search.includes('reset')) {
    const d = new Date();
    const key = `anhqvdle_${MODE_KEY_CNX}_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    localStorage.removeItem(key);
    history.replaceState(null, '', location.pathname);
  }
  cleanOldStorage();
  cnxPuzzle  = getCnxPuzzle();
  cnxHintUsed = !!localStorage.getItem('anhqvdle_cnx_hint_' + getDayNumber());

  const saved = loadDailyState(MODE_KEY_CNX);
  if (saved && saved.done) {
    cnxFound    = saved.found || [];
    cnxMistakes = saved.mistakes || 0;
    cnxDone     = true;
    renderCnxBoard();
    showCnxResult(saved.won);
    return;
  }
  cnxSelected = [];
  cnxFound    = [];
  cnxMistakes = 0;
  cnxDone     = false;
  renderCnxBoard();
}

function renderCnxBoard() {
  const container = document.getElementById('cnx-board');
  if (!container) return;
  container.innerHTML = '';

  /* Encabezado */
  const header = document.createElement('div');
  header.className = 'cnx-header';
  header.innerHTML = `
    <p class="cnx-instruction">Agrupa los 12 personajes en 3 categorías de 4</p>
    <div class="cnx-lives" id="cnx-lives">${renderLives()}</div>`;
  container.appendChild(header);

  /* Grupos resueltos */
  cnxPuzzle.groups.forEach(g => {
    if (!cnxFound.includes(g.color)) return;
    const s = COLOR_STYLES[g.color];
    const band = document.createElement('div');
    band.className = 'cnx-solved-group';
    band.style.cssText = `background:${s.bg};border:2px solid ${s.border};`;
    band.innerHTML = `
      <div class="cnx-solved-label" style="color:${s.text}">${g.label}</div>
      <div class="cnx-solved-chars">${g.chars.map(c => `
        <div class="cnx-solved-char">
          <img src="img/personajes/${cnxSlug(c)}.webp" alt="${c}"
            onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.opacity='0.3'}">
          <span>${c}</span>
        </div>`).join('')}
      </div>`;
    container.appendChild(band);
  });

  /* Si el juego acabó (perdiste): mostrar grupos sin resolver */
  if (cnxDone) {
    cnxPuzzle.groups.forEach(g => {
      if (cnxFound.includes(g.color)) return;
      const s = COLOR_STYLES[g.color];
      const band = document.createElement('div');
      band.className = 'cnx-solved-group';
      band.style.cssText = `background:${s.bg};border:2px dashed ${s.border};opacity:0.75;`;
      band.innerHTML = `
        <div class="cnx-solved-label" style="color:${s.text}">${g.label}</div>
        <div class="cnx-solved-chars">${g.chars.map(c => `
          <div class="cnx-solved-char">
            <img src="img/personajes/${cnxSlug(c)}.webp" alt="${c}"
              onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.opacity='0.3'}">
            <span>${c}</span>
          </div>`).join('')}
        </div>`;
      container.appendChild(band);
    });
    return;
  }

  /* Grid de personajes restantes (solo en partida activa) */
  const day = getDayNumber();
  const allChars = cnxPuzzle.groups.flatMap(g => g.chars);
  const shuffled = seededShuffleCnx(allChars, day * 77317);
  const remaining = shuffled.filter(c => !cnxPuzzle.groups.some(g => cnxFound.includes(g.color) && g.chars.includes(c)));

  if (remaining.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'cnx-grid';

    remaining.forEach(name => {
      const sel = cnxSelected.includes(name);
      const card = document.createElement('div');
      card.className = 'cnx-card' + (sel ? ' selected' : '');
      card.dataset.name = name;
      card.innerHTML = `
        <img src="img/personajes/${cnxSlug(name)}.webp" alt="${name}"
          onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.opacity='0.3'}">
        <span>${name}</span>`;
      card.addEventListener('click', () => toggleCnxCard(name));
      grid.appendChild(card);
    });
    container.appendChild(grid);

    /* Barra de acción */
    const bar = document.createElement('div');
    bar.className = 'cnx-action-bar';
    bar.innerHTML = `
      <span class="cnx-sel-count" id="cnx-sel-count">${cnxSelected.length} / 4 seleccionados</span>
      <div style="display:flex;gap:8px">
        <button class="cnx-hint-btn" id="cnx-hint-btn" onclick="revealCnxHint()" ${cnxHintUsed ? 'disabled' : ''}>
          💡 ${cnxHintUsed ? 'Pista usada' : 'Pista'}
        </button>
        <button class="imp-submit-btn" id="cnx-submit-btn" onclick="submitCnx()" ${cnxSelected.length !== 4 ? 'disabled' : ''}>
          Comprobar
        </button>
      </div>`;
    container.appendChild(bar);
  }
}

function renderLives() {
  let html = '';
  for (let i = 0; i < MAX_MISTAKES; i++) {
    html += `<span class="cnx-life ${i < cnxMistakes ? 'used' : ''}">●</span>`;
  }
  return html;
}

function toggleCnxCard(name) {
  if (cnxDone) return;
  const idx = cnxSelected.indexOf(name);
  if (idx === -1) {
    if (cnxSelected.length >= 4) return;
    cnxSelected.push(name);
  } else {
    cnxSelected.splice(idx, 1);
  }
  document.querySelectorAll('.cnx-card').forEach(c => c.classList.toggle('selected', cnxSelected.includes(c.dataset.name)));
  const count = document.getElementById('cnx-sel-count');
  const btn   = document.getElementById('cnx-submit-btn');
  if (count) count.textContent = `${cnxSelected.length} / 4 seleccionados`;
  if (btn)   btn.disabled = cnxSelected.length !== 4;
}

function submitCnx() {
  if (cnxSelected.length !== 4 || cnxDone) return;

  /* Buscar si los 4 forman un grupo */
  const match = cnxPuzzle.groups.find(g =>
    !cnxFound.includes(g.color) &&
    g.chars.every(c => cnxSelected.includes(c)) &&
    cnxSelected.every(c => g.chars.includes(c))
  );

  if (match) {
    cnxFound.push(match.color);
    cnxSelected = [];
    const won = cnxFound.length === cnxPuzzle.groups.length;
    if (won || cnxMistakes >= MAX_MISTAKES) {
      cnxDone = true;
      updateStats('conexiones', cnxMistakes + 1, won);
      saveDailyState(MODE_KEY_CNX, { found: cnxFound, mistakes: cnxMistakes, done: true, won });
      if (typeof updateStreak === 'function') {
        const n = updateStreak();
        if (typeof triggerStreakAnimation === 'function') triggerStreakAnimation(n);
      }
    } else {
      saveDailyState(MODE_KEY_CNX, { found: cnxFound, mistakes: cnxMistakes, done: false, won: false });
    }
    renderCnxBoard();
    if (cnxDone) showCnxResult(won);
  } else {
    /* Incorrecto */
    cnxMistakes++;
    /* ¿Casi? (3 de 4 pertenecen al mismo grupo) */
    const casi = cnxPuzzle.groups.find(g =>
      !cnxFound.includes(g.color) &&
      cnxSelected.filter(c => g.chars.includes(c)).length === 3
    );
    /* Shake visual */
    document.querySelectorAll('.cnx-card.selected').forEach(c => {
      c.classList.add('shake');
      setTimeout(() => c.classList.remove('shake'), 400);
    });
    document.getElementById('cnx-lives').innerHTML = renderLives();

    if (casi) {
      showCnxToast('¡Casi! Hay 1 intruso en tu selección');
    }
    if (cnxMistakes >= MAX_MISTAKES) {
      cnxDone = true;
      saveDailyState(MODE_KEY_CNX, { found: cnxFound, mistakes: cnxMistakes, done: true, won: false });
      renderCnxBoard();
      showCnxResult(false);
    }
    cnxSelected = [];
  }
}

function revealCnxHint() {
  const unsolved = cnxPuzzle.groups.find(g => !cnxFound.includes(g.color));
  if (!unsolved) return;
  cnxHintUsed = true;
  localStorage.setItem('anhqvdle_cnx_hint_' + getDayNumber(), '1');
  const btn = document.getElementById('cnx-hint-btn');
  if (btn) { btn.disabled = true; btn.textContent = '💡 Pista usada'; }
  showCnxToast(`💡 Pista: una categoría es "${unsolved.label}"`);
}

function showCnxToast(msg) {
  const existing = document.getElementById('cnx-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'cnx-toast';
  toast.className = 'cnx-toast';
  toast.textContent = msg;
  document.getElementById('cnx-board').appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function showCnxResult(won) {
  const el = document.getElementById('cnx-result');
  if (!el) return;
  startCountdown('countdown-timer-cnx');
  const streak = (typeof getStreakData === 'function') ? getStreakData() : { count: 0 };
  const streakHtml = streak.count >= 1
    ? `<div class="result-streak">🔥 <strong>${streak.count}</strong> día${streak.count !== 1 ? 's' : ''} seguido${streak.count !== 1 ? 's' : ''}</div>`
    : '';

  el.innerHTML = `
    <div class="result-banner result-banner-quote" style="margin-top:24px">
      <p class="result-day-num">#${getDayNumber()}</p>
      <h2>${won ? '¡Conexiones encontradas!' : '¡Casi!'}</h2>
      <p class="result-sub" style="${streakHtml ? 'margin-bottom:8px' : ''}">
        ${won ? `${cnxMistakes === 0 ? '¡Sin errores!' : `Con ${cnxMistakes} error${cnxMistakes !== 1 ? 'es' : ''}`}` : 'No encontraste todas las conexiones'}
      </p>
      ${streakHtml}
      <div class="result-divider"></div>
      <div class="share-row">
        <button class="share-btn" onclick="shareCnx(${won})">📋 Compartir</button>
        <button class="share-btn" onclick="shareStoriesCnx(${won})">📱 Stories</button>
      </div>
      <div class="countdown-wrap">
        <p class="countdown-label">Próximas conexiones en</p>
        <div class="countdown" id="countdown-timer-cnx">00:00:00</div>
      </div>
    </div>`;
  maybeShowKofiPopup();
}

function shareCnx(won) {
  const colors = { yellow: '🟨', green: '🟩', blue: '🟦' };
  const found  = cnxFound.map(c => colors[c]).join('');
  const missed = cnxPuzzle.groups.filter(g => !cnxFound.includes(g.color)).map(() => '⬜').join('');
  const errors = cnxMistakes > 0 ? ` · ${cnxMistakes} error${cnxMistakes !== 1 ? 'es' : ''}` : ' · Sin errores';
  const text   = `ANHQVdle 🔗 #${getDayNumber()} · ${new Date().toLocaleDateString('es-ES')}\n${won ? '¡Encontradas!' : 'Sin completar'}${errors}\n${found}${missed}\nanhqvdle.es`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('#cnx-result .share-btn');
    if (!btn) return;
    btn.textContent = '¡Copiado! ✓'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Compartir'; btn.classList.remove('copied'); }, 2000);
  });
}

function shareStoriesCnx(won) {
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const errText = cnxMistakes === 0 ? 'Sin errores' : `${cnxMistakes} error${cnxMistakes !== 1 ? 'es' : ''}`;
  _drawStoriesBase(ctx, W, H, '🔗 CONEXIONES',
    won ? `¡Encontradas! · ${errText}` : 'No completado', won);

  const groupColors = { yellow: '#ca8a04', green: '#16a34a', blue: '#2563eb' };
  const allGroups = cnxPuzzle.groups.map(g => ({
    color: groupColors[g.color] || '#444',
    found: cnxFound.includes(g.color),
  }));

  const CELL = 200, GAP = 20;
  const totalW = allGroups.length * CELL + (allGroups.length - 1) * GAP;
  let x = (W - totalW) / 2;
  allGroups.forEach(g => {
    ctx.shadowColor = g.found ? g.color : '#333'; ctx.shadowBlur = g.found ? 20 : 0;
    ctx.fillStyle = g.found ? g.color : 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.roundRect(x, 580, CELL, CELL, 14); ctx.fill();
    ctx.shadowBlur = 0;
    x += CELL + GAP;
  });

  ctx.font = 'bold 68px Arial'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'center';
  ctx.fillText('¿Encuentras las conexiones?', W / 2, 1480);
  _drawStoriesCTA(ctx, W, H);
  _shareStoriesBlob(canvas, 'anhqvdle-conexiones-stories.png');
}

initConexiones();
