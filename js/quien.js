/* ================================================
   ANHQVdle — Modo Quién es Quién (turno a turno)
   Ambos eligen un personaje secreto.
   Tú preguntas → máquina responde.
   Máquina pregunta → tú respondes.
   Primero en adivinar gana.
   ================================================ */

const Q_GROUPS = [
  {
    label: 'Básico',
    qs: [
      { id: 'female',    text: '¿Es mujer?',               fn: c => c.gender === 'Femenino' },
      { id: 'hijos',     text: '¿Tiene hijos?',            fn: c => c.hasChildren },
      { id: 'principal', text: '¿Es principal?',           fn: c => c.type === 'Principal' },
      { id: 'espora',    text: '¿Es esporádico?',          fn: c => c.type === 'Esporádico' },
    ]
  },
  {
    label: 'Temporadas',
    qs: [
      { id: 'seas1',    text: 'T1',           fn: c => c.seasons.includes(1) },
      { id: 'seas2',    text: 'T2',           fn: c => c.seasons.includes(2) },
      { id: 'seas3',    text: 'T3',           fn: c => c.seasons.includes(3) },
      { id: 'seas4',    text: 'T4',           fn: c => c.seasons.includes(4) },
      { id: 'seas5',    text: 'T5',           fn: c => c.seasons.includes(5) },
      { id: 'seas_gt3', text: '¿Más de 3T?',  fn: c => c.seasons.length > 3  },
      { id: 'seas_all', text: '¿Las 5T?',     fn: c => c.seasons.length === 5 },
    ]
  },
  {
    label: 'Zona',
    qs: [
      { id: 'piso1',    text: '1er piso',  fn: c => c.floors.some(f => f.startsWith('1º')) },
      { id: 'piso2',    text: '2º piso',   fn: c => c.floors.some(f => f.startsWith('2º')) },
      { id: 'piso3',    text: '3er piso',  fn: c => c.floors.some(f => f.startsWith('3º')) },
      { id: 'atico',    text: 'Ático',     fn: c => c.floors.includes('Ático') },
      { id: 'porteria', text: 'Portería',  fn: c => c.floors.includes('Portería') },
      { id: 'visita',   text: 'De visita', fn: c => c.floors.includes('Visita') },
    ]
  },
  {
    label: 'Piso exacto',
    qs: [
      { id: 'p1a', text: '1º A', fn: c => c.floors.includes('1º A') },
      { id: 'p1b', text: '1º B', fn: c => c.floors.includes('1º B') },
      { id: 'p2a', text: '2º A', fn: c => c.floors.includes('2º A') },
      { id: 'p2b', text: '2º B', fn: c => c.floors.includes('2º B') },
      { id: 'p3a', text: '3º A', fn: c => c.floors.includes('3º A') },
      { id: 'p3b', text: '3º B', fn: c => c.floors.includes('3º B') },
    ]
  },
];

const Q_MAP = {};
Q_GROUPS.forEach(g => g.qs.forEach(q => Q_MAP[q.id] = q));

// ── Estado global ────────────────────────────────────
let gameMode       = 'machine'; // 'machine' | 'online'
let onlineAnswers  = {};         // { questionId: bool } respuestas recibidas en online
let mySecret       = null;
let machineSecret  = null;
let playerElim     = new Set();
let machineCands   = [];
let askedByPlayer  = new Set();
let askedByMachine = new Set();
let phase          = 'idle';
let turnCount      = 0;
let busy           = false;

// ── Init: muestra selector de modo ───────────────────
function initGame() {
  if (typeof cleanupOnlineRoom === 'function') cleanupOnlineRoom();
  gameMode      = 'machine';
  onlineAnswers = {};
  mySecret      = null;
  machineSecret = null;
  playerElim    = new Set();
  machineCands  = [];
  askedByPlayer = new Set();
  askedByMachine= new Set();
  phase         = 'idle';
  turnCount     = 0;
  busy          = false;

  const wrap = document.querySelector('.quien-wrap');
  wrap.classList.remove('is-setup', 'is-playing');
  document.getElementById('quien-start-btn').classList.remove('visible');
  renderBoard();
  updateMyCard(null);
  renderQuestions(false);
  setStatus('');
}

// ── Iniciar partida vs máquina ────────────────────────
function startMachineGame() {
  gameMode      = 'machine';
  machineSecret = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  playerElim    = new Set();
  machineCands  = [...CHARACTERS];
  askedByPlayer = new Set();
  askedByMachine= new Set();
  phase         = 'setup';
  turnCount     = 0;
  busy          = false;

  const wrap = document.querySelector('.quien-wrap');
  wrap.classList.remove('is-playing');
  wrap.classList.add('is-setup');
  document.getElementById('quien-start-btn').classList.remove('visible');
  renderBoard();
  updateMyCard(null);
  renderQuestions(false);
  setStatus('');
  document.getElementById('quien-board').classList.add('is-setup');
}

// ── Botón "¡Comenzar!" (máquina u online) ────────────
function onStartBtnClick() {
  if (gameMode === 'online') onlineConfirmReady();
  else startGame();
}

// ── Fase setup: jugador elige su personaje ───────────
function boardClick(name) {
  if (phase === 'setup') {
    if (gameMode === 'online') onlineSelectSecret(name);
    else selectSecret(name);
  } else if (phase === 'player_turn' && !busy) {
    playerGuess(name);
  }
}

function selectSecret(name) {
  mySecret = CHARACTERS.find(c => c.name === name);
  const slug = makeSlug(name);
  updateMyCard(mySecret);
  renderBoard();
  document.getElementById('quien-board').classList.add('is-setup');
  // Mostrar botón comenzar
  document.getElementById('quien-start-btn').classList.add('visible');
  // Marcar la tarjeta elegida
  document.querySelectorAll('.quien-card').forEach(el => {
    el.classList.toggle('my-secret', el.dataset.name === name);
  });
  setStatus('');
}

function startGame() {
  if (!mySecret) return;
  phase = 'player_turn';
  const wrap2 = document.querySelector('.quien-wrap');
  wrap2.classList.remove('is-setup');
  wrap2.classList.add('is-playing');
  document.getElementById('quien-board').classList.remove('is-setup');
  document.getElementById('quien-start-btn').classList.remove('visible');
  renderBoard();
  renderQuestions(true);
  setStatus(playerTurnStatus());
}

// ── Turno del jugador ────────────────────────────────
function playerTurnStatus() {
  const rem = CHARACTERS.length - playerElim.size;
  if (gameMode === 'online') return `
    <div class="quien-turn-player">
      <p class="turn-badge">🗣️ Tu turno</p>
      <p class="quien-desc">Pregunta sobre el personaje del oponente o adivina directamente.</p>
      <p class="quien-remaining">El oponente podría ser <strong>${rem}</strong> personaje${rem !== 1 ? 's' : ''}</p>
    </div>`;
  return `
    <div class="quien-turn-player">
      <p class="turn-badge">🗣️ Tu turno</p>
      <p class="quien-desc">Pregunta sobre mi personaje o haz clic en el tablero si ya sabes quién soy.</p>
      <p class="quien-remaining">Yo podría ser <strong>${rem}</strong> personaje${rem !== 1 ? 's' : ''}</p>
    </div>`;
}

function playerAskQuestion(id) {
  if (gameMode === 'online') { onlineAskQuestion(id); return; }
  if (busy || phase !== 'player_turn' || askedByPlayer.has(id)) return;
  busy = true;

  const q   = Q_MAP[id];
  const ans = q.fn(machineSecret);

  askedByPlayer.add(id);

  // Actualizar botón
  const btn = document.getElementById('qbtn-' + id);
  if (btn) {
    btn.disabled = true;
    btn.classList.add(ans ? 'asked-yes' : 'asked-no');
    btn.textContent = q.text + (ans ? ' ✓' : ' ✗');
  }

  // Eliminar del tablero del jugador
  CHARACTERS.filter(c => q.fn(c) !== ans).forEach(c => playerElim.add(c.name));

  const rem = CHARACTERS.length - playerElim.size;
  setStatus(`
    <div class="quien-answer ${ans ? 'answer-yes' : 'answer-no'}">
      <p class="quien-question-asked">${q.text}</p>
      <div class="quien-answer-badge">${ans ? '✓ SÍ' : '✗ NO'}</div>
      <p class="quien-remaining">Quedan <strong>${rem}</strong> posible${rem !== 1 ? 's' : ''}</p>
    </div>`);
  renderBoard();

  setTimeout(() => {
    busy = false;
    phase = 'machine_turn';
    renderQuestions(false);
    doMachineTurn();
  }, 1400);
}

function playerGuess(name) {
  if (gameMode === 'online') { onlinePlayerGuess(name); return; }
  if (busy || phase !== 'player_turn') return;
  if (playerElim.has(name)) return;

  busy = true;
  phase = 'gameover';
  renderQuestions(false);

  const correct = name === machineSecret.name;

  // Save stats to Firebase
  if (typeof StatsFirebase !== 'undefined') {
    StatsFirebase.saveGameResult('quien_machine', 1, correct);
  }
  if (correct) {
    const slug = makeSlug(name);
    setStatus(`
      <div class="quien-result">
        <p class="quien-result-label">¡Has ganado! 🎉</p>
        <div class="quien-guess-avatar win-avatar">
          <img src="img/personajes/${slug}.webp" alt="${name}"
            onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.display='none'}">
        </div>
        <h2 class="quien-guess-name">${name}</h2>
        <p class="quien-desc">Era mi personaje. Lo has adivinado en <strong>${turnCount}</strong> ronda${turnCount !== 1 ? 's' : ''}.</p>
        <button class="guess-btn" onclick="initGame()" style="margin-top:14px">Jugar de nuevo</button>
      </div>`);
    document.querySelectorAll('.quien-card').forEach(el => {
      el.classList.toggle('winner', el.dataset.name === name);
      el.classList.toggle('eliminated', el.dataset.name !== name);
    });
  } else {
    // Fallo → el jugador pierde
    const slug = makeSlug(machineSecret.name);
    setStatus(`
      <div class="quien-result">
        <p class="quien-result-label" style="color:#f87171">¡Has fallado!</p>
        <div class="quien-guess-avatar">
          <img src="img/personajes/${slug}.webp" alt="${machineSecret.name}"
            onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.display='none'}">
        </div>
        <h2 class="quien-guess-name">${machineSecret.name}</h2>
        <p class="quien-desc">Era <strong>${machineSecret.name}</strong>. Más suerte la próxima vez.</p>
        <button class="guess-btn" onclick="initGame()" style="margin-top:14px">Jugar de nuevo</button>
      </div>`);
  }
}

// ── Turno de la máquina ──────────────────────────────
function doMachineTurn() {
  turnCount++;

  // ¿La máquina puede adivinar?
  if (machineCands.length === 1) {
    machineGuesses(machineCands[0]);
    return;
  }
  if (machineCands.length === 0) {
    // No debería ocurrir, pero si pasa, rendirse
    phase = 'player_turn';
    renderQuestions(true);
    setStatus(playerTurnStatus());
    busy = false;
    return;
  }

  const q = getBestMachineQuestion();

  if (!q) {
    // Sin preguntas útiles → adivinar al azar entre candidatos
    machineGuesses(machineCands[0]);
    return;
  }

  askedByMachine.add(q.id);

  setStatus(`
    <div class="quien-machine-ask">
      <p class="turn-badge">🤖 Mi turno</p>
      <p class="quien-question-asked" style="font-size:0.8rem;margin-bottom:10px">
        Me quedan <strong>${machineCands.length}</strong> candidato${machineCands.length !== 1 ? 's' : ''} sobre ti
      </p>
      <h2 class="quien-question">${q.text}</h2>
      <p class="quien-desc" style="font-size:0.8rem;margin-bottom:16px">Sobre tu personaje secreto</p>
      <div class="quien-btns">
        <button class="quien-btn-yes" onclick="playerAnswerMachine('${q.id}', true)">✓ Sí</button>
        <button class="quien-btn-no"  onclick="playerAnswerMachine('${q.id}', false)">✗ No</button>
      </div>
    </div>`);
}

function playerAnswerMachine(qId, yes) {
  if (busy) return;
  busy = true;

  const q = Q_MAP[qId];
  // Filtrar candidatos de la máquina
  machineCands = yes
    ? machineCands.filter(q.fn)
    : machineCands.filter(c => !q.fn(c));

  const rem = machineCands.length;
  setStatus(`
    <div class="quien-answer ${yes ? 'answer-yes' : 'answer-no'}">
      <p class="quien-question-asked">${q.text}</p>
      <div class="quien-answer-badge">${yes ? '✓ SÍ' : '✗ NO'}</div>
      <p class="quien-remaining">Me quedan <strong>${rem}</strong> candidato${rem !== 1 ? 's' : ''} sobre ti</p>
    </div>`);

  setTimeout(() => {
    busy = false;
    if (machineCands.length === 1) {
      machineGuesses(machineCands[0]);
    } else {
      phase = 'player_turn';
      renderQuestions(true);
      setStatus(playerTurnStatus());
    }
  }, 1200);
}

function machineGuesses(char) {
  const slug = makeSlug(char.name);
  setStatus(`
    <div class="quien-machine-ask">
      <p class="turn-badge">🤖 Mi turno</p>
      <p class="quien-question" style="font-size:1.2rem;margin-bottom:12px">¿Tu personaje es...</p>
      <div class="quien-guess-avatar" style="margin:0 auto 10px;border-color:var(--accent)">
        <img src="img/personajes/${slug}.webp" alt="${char.name}"
          onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.display='none'}">
      </div>
      <h2 class="quien-guess-name">${char.name}</h2>
      <div class="quien-btns" style="margin-top:14px">
        <button class="quien-btn-yes" onclick="onMachineGuessResult('${char.name}', true)">✓ Sí</button>
        <button class="quien-btn-no"  onclick="onMachineGuessResult('${char.name}', false)">✗ No</button>
      </div>
    </div>`);
}

function onMachineGuessResult(name, correct) {
  if (correct) {
    // Máquina gana
    phase = 'gameover';
    const mySlug = makeSlug(mySecret.name);
    setStatus(`
      <div class="quien-result">
        <p class="quien-result-label" style="color:#f87171">¡Ha ganado la máquina! 🤖</p>
        <div class="quien-guess-avatar" style="border-color:#f87171;margin:0 auto 10px">
          <img src="img/personajes/${mySlug}.webp" alt="${mySecret.name}"
            onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.display='none'}">
        </div>
        <h2 class="quien-guess-name">${mySecret.name}</h2>
        <p class="quien-desc">Tu personaje era <strong>${mySecret.name}</strong>.<br>
          La partida duró <strong>${turnCount}</strong> ronda${turnCount !== 1 ? 's' : ''}.</p>
        <button class="guess-btn" onclick="initGame()" style="margin-top:14px">Revancha</button>
      </div>`);
  } else {
    // La máquina falla → elimina ese candidato y pasa el turno al jugador
    machineCands = machineCands.filter(c => c.name !== name);
    busy = false;
    phase = 'player_turn';
    renderQuestions(true);
    setStatus(`
      <div class="quien-turn-player">
        <p class="turn-badge" style="color:#f87171">🤖 Fallo de la máquina</p>
        <p class="quien-desc">No era <strong>${name}</strong>. Ahora es tu turno.</p>
      </div>`);
    setTimeout(() => {
      if (phase === 'player_turn') setStatus(playerTurnStatus());
    }, 1800);
  }
}

// ── Estrategia de preguntas (máquina) ───────────────
function getBestMachineQuestion() {
  let best = null, bestScore = Infinity;
  for (const g of Q_GROUPS) {
    for (const q of g.qs) {
      if (askedByMachine.has(q.id)) continue;
      const yes = machineCands.filter(q.fn).length;
      const no  = machineCands.length - yes;
      if (yes === 0 || no === 0) continue;
      const score = Math.abs(yes - no);
      if (score < bestScore) { bestScore = score; best = q; }
    }
  }
  return best;
}

// ── Render tablero 3D ────────────────────────────────
const BOARD_ROWS = [
  CHARACTERS.slice(0,  10),
  CHARACTERS.slice(10, 22),
  CHARACTERS.slice(22, 34),
  CHARACTERS.slice(34, 46),
];

function renderBoard() {
  const el = document.getElementById('quien-board');
  if (!el) return;

  el.innerHTML = BOARD_ROWS.map(row => `
    <div class="quien-3d-row">
      ${row.map(c => {
        const slug    = makeSlug(c.name);
        const out     = playerElim.has(c.name);
        const secret  = phase === 'setup' && mySecret && c.name === mySecret.name;
        let cls = out ? 'eliminated' : 'active';
        if (secret) cls += ' my-secret';
        return `
          <div class="quien-card-3d ${cls}"
               data-name="${c.name}"
               onclick="boardClick('${c.name.replace(/'/g, "\\'")}')">
            <img src="img/personajes/${slug}.webp" alt="${c.name}"
              onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.display='none'}">
            <span class="card-name">${c.name.split(' ')[0]}</span>
          </div>`;
      }).join('')}
    </div>`
  ).join('');
}

function updateMyCard(char) {
  const el = document.getElementById('quien-my-card');
  if (!el) return;
  if (!char) {
    el.innerHTML = `<div class="quien-my-card-placeholder">?</div>`;
    _updateSecretTooltip(null);
    return;
  }
  const slug = makeSlug(char.name);
  el.innerHTML = `
    <div class="quien-my-card-filled">
      <img src="img/personajes/${slug}.webp" alt="${char.name}"
        onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.display='none'}">
      <div class="card-name">${char.name.split(' ')[0]}</div>
    </div>`;
  _updateSecretTooltip(char);
}

function _updateSecretTooltip(char) {
  const tip = document.getElementById('quien-secret-tooltip');
  if (!tip) return;
  if (!char) { tip.innerHTML = ''; return; }
  const seas = char.seasons.map(s => 'T' + s).join(', ');
  const floors = char.floors.join(', ');
  const occ = char.occupations.join(', ');
  tip.innerHTML = `
    <div class="quien-tooltip-title">📋 ${char.name}</div>
    <div class="quien-tooltip-row">
      <span class="quien-tooltip-key">Género</span>
      <span class="quien-tooltip-val">${char.gender}</span>
    </div>
    <div class="quien-tooltip-row">
      <span class="quien-tooltip-key">Tipo</span>
      <span class="quien-tooltip-val">${char.type}</span>
    </div>
    <div class="quien-tooltip-row">
      <span class="quien-tooltip-key">Temporadas</span>
      <span class="quien-tooltip-val">${seas}</span>
    </div>
    <div class="quien-tooltip-row">
      <span class="quien-tooltip-key">Piso</span>
      <span class="quien-tooltip-val">${floors}</span>
    </div>
    <div class="quien-tooltip-row">
      <span class="quien-tooltip-key">Hijos</span>
      <span class="quien-tooltip-val">${char.hasChildren ? 'Sí' : 'No'}</span>
    </div>
    <div class="quien-tooltip-row">
      <span class="quien-tooltip-key">Profesión</span>
      <span class="quien-tooltip-val">${occ}</span>
    </div>`;
}

// ── Render preguntas ─────────────────────────────────
function renderQuestions(enabled) {
  const el = document.getElementById('quien-questions');
  if (!el) return;
  if (!enabled) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = Q_GROUPS.map(g => `
    <div class="q-group">
      <div class="q-group-label">${g.label}</div>
      <div class="q-group-btns">
        ${g.qs.map(q => {
          const asked = askedByPlayer.has(q.id);
          const ans   = asked ? (gameMode === 'online' ? onlineAnswers[q.id] : Q_MAP[q.id].fn(machineSecret)) : null;
          const label = asked ? q.text + (ans ? ' ✓' : ' ✗') : q.text;
          const cls   = asked ? 'q-btn ' + (ans ? 'asked-yes' : 'asked-no') : 'q-btn';
          return `<button id="qbtn-${q.id}" class="${cls}" ${asked ? 'disabled' : ''}
            onclick="playerAskQuestion('${q.id}')">${label}</button>`;
        }).join('')}
      </div>
    </div>`).join('');
}

// ── Helpers ──────────────────────────────────────────
function setStatus(html) {
  const el = document.getElementById('quien-status');
  if (el) el.innerHTML = html;
}

function setBoardLabel(text) {
  const el = document.getElementById('quien-board-label');
  if (el) el.textContent = text;
}

function makeSlug(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

initGame();

// ── Tutorial ────────────────────────────────────────
function showQuienTutorial() {
  if (document.getElementById('quien-tutorial')) return;
  const d = document.createElement('div');
  d.id = 'quien-tutorial';
  d.className = 'stats-modal-overlay';
  d.innerHTML = `
    <div class="stats-modal" style="max-width:480px">
      <button class="stats-close" onclick="document.getElementById('quien-tutorial').remove()">✕</button>
      <h2 class="stats-title">🪟 Cómo jugar</h2>
      <div style="text-align:left;color:var(--text2);font-size:0.92rem;line-height:1.7;display:flex;flex-direction:column;gap:10px">
        <p>Cada jugador elige un <strong style="color:var(--text)">personaje secreto</strong> del tablero sin que el rival lo vea.</p>
        <p>Por turnos, cada jugador hace una <strong style="color:var(--text)">pregunta de sí o no</strong> sobre el personaje rival (ej: ¿Es mujer? ¿Tiene hijos?).</p>
        <p>Usa las respuestas para <strong style="color:var(--text)">eliminar personajes</strong> del tablero. Los descartados se atenúan.</p>
        <p>Cuando creas que sabes quién es, pulsa en la carta del personaje y elige <strong style="color:var(--text)">Adivinar</strong>. ¡El primero en acertar gana!</p>
        <p style="color:#f87171">⚠️ Si fallas la adivinanza, pierdes automáticamente.</p>
        <hr style="border-color:rgba(255,255,255,0.1)">
        <p><strong style="color:var(--text)">Modos:</strong><br>
          🤖 <strong style="color:var(--text)">Vs Máquina</strong> — juegas solo, la IA lleva el otro tablero.<br>
          👥 <strong style="color:var(--text)">Multijugador</strong> — crea una sala y comparte el código con un amigo.
        </p>
      </div>
    </div>`;
  d.addEventListener('click', e => { if (e.target === d) d.remove(); });
  document.body.appendChild(d);
}

// Tooltip hover en carta secreta
document.getElementById('quien-my-card').addEventListener('mouseenter', () => {
  const tip = document.getElementById('quien-secret-tooltip');
  if (tip && tip.innerHTML) tip.style.display = 'block';
});
document.getElementById('quien-my-card').addEventListener('mouseleave', () => {
  const tip = document.getElementById('quien-secret-tooltip');
  if (tip) tip.style.display = '';
});
