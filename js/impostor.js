/* ================================================
   ANHQVdle — Modo El Impostor
   ================================================ */

const MODE_KEY_IMP = 'impostor';

const PUZZLES = [
  { text: 'Personajes de tipo Principal',            fit: c => c.type === 'Principal',                                             n: 2 },
  { text: 'Personajes de tipo Secundario',           fit: c => c.type === 'Secundario',                                            n: 2 },
  { text: 'Personajes de tipo Esporádico',           fit: c => c.type === 'Esporádico',                                            n: 3 },
  { text: 'Personajes que vivieron en el 1º B',      fit: c => c.floors.includes('1º B'),                                          n: 3 },
  { text: 'Personajes que vivieron en el 2º A',      fit: c => c.floors.includes('2º A'),                                          n: 2 },
  { text: 'Personajes que vivieron en el 2º B',      fit: c => c.floors.includes('2º B'),                                          n: 2 },
  { text: 'Personajes que vivieron en el ático',     fit: c => c.floors.includes('Ático'),                                         n: 3 },
  { text: 'Personajes que vivieron en el 3º A',      fit: c => c.floors.includes('3º A'),                                          n: 3 },
  { text: 'Personajes que vivieron en el 3º B',      fit: c => c.floors.includes('3º B'),                                          n: 2 },
  { text: 'Personajes que aparecen en la T1',        fit: c => c.seasons.includes(1),                                               n: 2 },
  { text: 'Personajes que aparecen en la T3',        fit: c => c.seasons.includes(3),                                               n: 2 },
  { text: 'Personajes que aparecen en la T5',        fit: c => c.seasons.includes(5),                                               n: 2 },
  { text: 'Personajes con hijos',                    fit: c => c.hasChildren,                                                       n: 2 },
  { text: 'Personajes sin hijos',                    fit: c => !c.hasChildren,                                                      n: 2 },
  { text: 'Personajes de género femenino',           fit: c => c.gender === 'Femenino',                                            n: 2 },
  { text: 'Personajes de género masculino',          fit: c => c.gender === 'Masculino',                                           n: 2 },
  { text: 'Personajes con solo 1 temporada',         fit: c => c.seasons.length === 1,                                              n: 2 },
  { text: 'Personajes en las 5 temporadas',          fit: c => c.seasons.length === 5,                                              n: 2 },
  { text: 'Personajes que solo aparecen como visita',fit: c => c.floors.every(f => f === 'Visita'),                                 n: 3 },
  { text: 'Personajes que vivieron en varios pisos', fit: c => c.floors.filter(f => f !== 'Visita').length > 1,                     n: 2 },
];

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDailyGame() {
  const day    = getDayNumber();
  const puzzle = PUZZLES[day % PUZZLES.length];
  const fits   = seededShuffle(CHARACTERS.filter(c =>  puzzle.fit(c)), day * 31337);
  const noFits = seededShuffle(CHARACTERS.filter(c => !puzzle.fit(c)), day * 7919);
  const chars  = seededShuffle([...fits.slice(0, 9 - puzzle.n), ...noFits.slice(0, puzzle.n)], day * 131071);
  return { puzzle, chars, impostors: noFits.slice(0, puzzle.n).map(c => c.name) };
}

let impGame     = null;
let impSelected = [];
let impDone     = false;
let impHintName = null;

function initImpostor() {
  cleanOldStorage();
  impGame = buildDailyGame();
  impHintName = localStorage.getItem('anhqvdle_imp_hint_' + getDayNumber()) || null;

  const saved = loadDailyState(MODE_KEY_IMP);
  if (saved && saved.done) {
    impSelected = saved.selected || [];
    impDone     = true;
    renderImpostorBoard(true);
    showResultImpostor(saved.won);
    return;
  }

  impSelected = [];
  impDone     = false;
  renderImpostorBoard(false);
}

function impSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function renderImpostorBoard(revealed) {
  const container = document.getElementById('impostor-board');
  if (!container) return;
  container.innerHTML = '';

  /* Cabecera de categoría */
  const cat = document.createElement('div');
  cat.className = 'imp-category';
  cat.innerHTML = `
    <p class="imp-cat-label">La categoría es</p>
    <div class="imp-cat-text">${impGame.puzzle.text}</div>
    <p class="imp-cat-hint">Hay <strong>${impGame.puzzle.n}</strong> impostor${impGame.puzzle.n !== 1 ? 'es' : ''} — ¡encuéntralos!</p>`;
  container.appendChild(cat);

  /* Grid 3×3 */
  const grid = document.createElement('div');
  grid.className = 'imp-grid';

  impGame.chars.forEach(c => {
    const isImp = impGame.impostors.includes(c.name);
    const isSel = impSelected.includes(c.name);
    let state = '';
    if (revealed) {
      if (isImp && isSel)   state = 'correct';
      else if (!isImp && isSel) state = 'wrong';
      else if (isImp && !isSel) state = 'missed';
    } else if (isSel) {
      state = 'selected';
    }

    const card = document.createElement('div');
    card.className = 'imp-char' + (state ? ' ' + state : '');
    card.dataset.name = c.name;

    const slug    = impSlug(c.name);
    const overlay = revealed
      ? (isImp && isSel ? '✓' : !isImp && isSel ? '✗' : isImp ? '!' : '')
      : (isSel ? '✗' : '');

    const isHinted = !revealed && c.name === impHintName;
    if (isHinted) card.classList.add('hint');

    card.innerHTML = `
      <div class="imp-photo-wrap">
        <img src="img/personajes/${slug}.webp" alt="${c.name}"
          onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.opacity='0.3'}">
        <div class="imp-overlay">${overlay}</div>
      </div>
      <span class="imp-name">${c.name}</span>
      ${isHinted ? '<span class="imp-badge" style="background:rgba(255,165,0,0.3);color:#ffa500;border-color:rgba(255,165,0,0.5)">💡 Pista</span>' : ''}
      ${revealed && isImp ? '<span class="imp-badge">Impostor</span>' : ''}`;

    if (!revealed) card.addEventListener('click', () => toggleImpChar(c.name));
    grid.appendChild(card);
  });

  container.appendChild(grid);

  if (!revealed) {
    const bar = document.createElement('div');
    bar.className = 'imp-action-bar';
    bar.innerHTML = `
      <span class="imp-counter" id="imp-counter">0 / ${impGame.puzzle.n} seleccionados</span>
      <div style="display:flex;gap:8px">
        <button class="imp-hint-btn" id="imp-hint-btn" onclick="revealImpHint()" ${impHintName ? 'disabled' : ''}>
          💡 ${impHintName ? 'Pista usada' : 'Pista'}
        </button>
        <button class="imp-submit-btn" id="imp-submit-btn" onclick="submitImpostor()" disabled>Confirmar</button>
      </div>`;
    container.appendChild(bar);
  }
}

function toggleImpChar(name) {
  if (impDone) return;
  const idx = impSelected.indexOf(name);
  idx === -1 ? impSelected.push(name) : impSelected.splice(idx, 1);

  document.querySelectorAll('.imp-char').forEach(card => {
    const sel = impSelected.includes(card.dataset.name);
    card.classList.toggle('selected', sel);
    card.querySelector('.imp-overlay').textContent = sel ? '✗' : '';
  });

  const counter = document.getElementById('imp-counter');
  const btn     = document.getElementById('imp-submit-btn');
  if (counter) counter.textContent = `${impSelected.length} / ${impGame.puzzle.n} seleccionados`;
  if (btn)     btn.disabled = impSelected.length === 0;
}

function revealImpHint() {
  const candidates = impGame.impostors.filter(n => !impSelected.includes(n));
  impHintName = candidates.length > 0 ? candidates[0] : impGame.impostors[0];
  localStorage.setItem('anhqvdle_imp_hint_' + getDayNumber(), impHintName);
  renderImpostorBoard(false);
  showImpToast(`💡 Pista: ${impHintName} es impostor`);
}

function showImpToast(msg) {
  const existing = document.getElementById('imp-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'imp-toast';
  toast.style.cssText = `
    text-align:center;background:rgba(255,165,0,0.15);
    border:1px solid rgba(255,165,0,0.4);border-radius:20px;
    padding:8px 20px;font-size:0.85rem;color:#ffa500;
    margin-top:8px;animation:fadeIn 0.2s ease;
  `;
  toast.textContent = msg;
  document.getElementById('impostor-board').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function submitImpostor() {
  if (impDone || impSelected.length === 0) return;
  impDone = true;

  const won = impGame.impostors.every(n => impSelected.includes(n)) &&
              impSelected.every(n => impGame.impostors.includes(n));

  updateStats('impostor', impSelected.length, won);
  saveDailyState(MODE_KEY_IMP, { selected: impSelected, done: true, won });

  if (typeof updateStreak === 'function') {
    const newCount = updateStreak();
    if (typeof triggerStreakAnimation === 'function') triggerStreakAnimation(newCount);
  }

  renderImpostorBoard(true);
  showResultImpostor(won);
}

function showResultImpostor(won) {
  const el = document.getElementById('impostor-result');
  if (!el) return;
  startCountdown('countdown-timer-imp');

  const streak = (typeof getStreakData === 'function') ? getStreakData() : { count: 0 };
  const streakHtml = streak.count >= 1
    ? `<div class="result-streak">🔥 <strong>${streak.count}</strong> día${streak.count !== 1 ? 's' : ''} seguido${streak.count !== 1 ? 's' : ''}</div>`
    : '';

  const title   = won ? '¡Impostores encontrados!' : '¡Casi!';
  const subtext = `Los impostores eran: <strong>${impGame.impostors.join(' y ')}</strong>`;

  el.innerHTML = `
    <div class="result-banner result-banner-quote" style="margin-top:24px">
      <p class="result-day-num">#${getDayNumber()}</p>
      <h2>${title}</h2>
      <p class="result-sub" style="${streakHtml ? 'margin-bottom:8px' : ''}">${subtext}</p>
      ${streakHtml}
      <div class="result-divider"></div>
      <div class="share-row">
        <button class="share-btn" id="share-btn-imp" onclick="shareImpostor(${won})">📋 Compartir</button>
      </div>
      <div class="countdown-wrap">
        <p class="countdown-label">Próximo impostor en</p>
        <div class="countdown" id="countdown-timer-imp">00:00:00</div>
      </div>
    </div>`;
  maybeShowKofiPopup();
}

function shareImpostor(won) {
  const dateStr  = new Date().toLocaleDateString('es-ES');
  const correct  = impGame.impostors.filter(n =>  impSelected.includes(n)).map(() => '✅');
  const wrongSel = impSelected.filter(n => !impGame.impostors.includes(n)).map(() => '❌');
  const missed   = impGame.impostors.filter(n => !impSelected.includes(n)).map(() => '⬜');
  const emojis   = [...correct, ...wrongSel, ...missed].join('');
  const status   = won ? '¡Encontrado!' : 'Sin encontrar';
  const text     = `ANHQVdle 🕵️ #${getDayNumber()} · ${dateStr}\n${status}\n${emojis}\nanhqvdle.es`;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('share-btn-imp');
    if (!btn) return;
    btn.textContent = '¡Copiado! ✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Compartir'; btn.classList.remove('copied'); }, 2000);
  });
}

initImpostor();
