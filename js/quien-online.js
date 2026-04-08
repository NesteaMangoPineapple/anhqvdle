/* ════════════════════════════════════════════════════════
   ANHQVdle — Modo Multijugador (Firebase Realtime DB)

   Flujo:
   1. Jugador A crea sala → obtiene código (ej. BNQZ-7342)
   2. Jugador B introduce el código → ambos en "setup"
   3. Ambos eligen personaje secreto → confirman "¡Listo!"
   4. Partida por turnos: preguntas y adivinanzas via Firebase
   5. El que adivina primero (o el que no falla) gana
   ════════════════════════════════════════════════════════ */

let _db             = null;
let _roomRef        = null;
let _roomCode       = null;
let _myRole         = null;   // 'host' | 'guest'
let _actionSeq      = 0;
let _lastApplied    = 0;      // seq del último action aplicado al tablero

// ── Firebase init ─────────────────────────────────────
function _fbInit() {
  if (typeof firebase === 'undefined') {
    alert('Firebase no está disponible. ¿Has configurado firebase-config.js?');
    return false;
  }
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  _db = firebase.database();
  return true;
}

// ── Limpiar estado online ─────────────────────────────
function cleanupOnlineRoom() {
  if (_roomRef) { _roomRef.off(); _roomRef = null; }
  _roomCode    = null;
  _myRole      = null;
  _actionSeq   = 0;
  _lastApplied = 0;
}

// ── Código de sala ────────────────────────────────────
function _genCode() {
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const N = '23456789';
  let c = '';
  for (let i = 0; i < 4; i++) c += L[Math.floor(Math.random() * L.length)];
  c += '-';
  for (let i = 0; i < 4; i++) c += N[Math.floor(Math.random() * N.length)];
  return c;
}

// ── UI overlays ───────────────────────────────────────
function showModeOverlay() {
  document.getElementById('quien-mode-overlay').style.display = 'flex';
}
function hideModeOverlay() {
  document.getElementById('quien-mode-overlay').style.display = 'none';
}
function showLobbyOverlay(err) {
  document.getElementById('quien-online-lobby').style.display = 'flex';
  if (err) document.getElementById('quien-lobby-error').textContent = err;
  else     document.getElementById('quien-lobby-error').textContent = '';
}
function hideLobbyOverlay() {
  document.getElementById('quien-online-lobby').style.display = 'none';
}

function selectGameMode(mode) {
  if (mode === 'machine') {
    hideModeOverlay();
    startMachineGame();
  } else {
    hideModeOverlay();
    showLobbyOverlay();
  }
}

function lobbyBack() {
  hideLobbyOverlay();
  showModeOverlay();
}

// ── Tablero (auxiliar) ────────────────────────────────
function _setBoardTitle(html) {
  const el = document.querySelector('.quien-board-title');
  if (!el) return;
  if (html) { el.innerHTML = html; el.style.display = 'block'; }
  else        el.style.display = 'none';
}

// ── Crear sala ────────────────────────────────────────
async function createOnlineRoom() {
  if (!_fbInit()) return;

  _roomCode = _genCode();
  _myRole   = 'host';
  gameMode  = 'online';

  const cleanCode = _roomCode.replace('-', '');
  _roomRef = _db.ref('rooms/' + cleanCode);

  await _roomRef.set({
    created:    Date.now(),
    phase:      'waiting',
    hostReady:  false,
    guestReady: false,
    turnCount:  0,
    action:     null,
    winner:     null,
    hostReveal: null,
    guestReveal: null
  });

  _roomRef.onDisconnect().update({ phase: 'abandoned' });

  hideLobbyOverlay();
  _resetOnlineBoard();
  _setBoardTitle(`
    <div style="text-align:center">
      <h2 style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--accent);letter-spacing:4px;margin:0 0 10px">
        Sala creada
      </h2>
      <p style="font-size:0.9rem;color:var(--text2);margin:0 0 12px">
        Comparte este código con tu amigo:
      </p>
      <div class="online-room-code">${_roomCode}</div>
      <button class="q-btn" onclick="_copyCode()" style="margin-top:10px;padding:6px 18px">
        📋 Copiar código
      </button>
      <p style="font-size:0.82rem;color:var(--text2);margin-top:14px">
        Esperando que se una alguien...
      </p>
    </div>`);

  await _subscribeRoom();
}

function _copyCode() {
  navigator.clipboard?.writeText(_roomCode).catch(() => {});
  const btn = document.querySelector('.online-room-code + button');
  if (btn) { btn.textContent = '✓ Copiado'; setTimeout(() => btn.textContent = '📋 Copiar código', 2000); }
}

// ── Unirse a sala ─────────────────────────────────────
async function joinOnlineRoom() {
  if (!_fbInit()) return;

  const input = document.getElementById('quien-join-input');
  const raw   = (input?.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (raw.length !== 8) {
    showLobbyOverlay('Código inválido. Formato: ABCD-1234');
    return;
  }

  const ref  = _db.ref('rooms/' + raw);
  const snap = await ref.once('value');
  if (!snap.exists()) { showLobbyOverlay('Sala no encontrada. Verifica el código.'); return; }

  const data = snap.val();
  if (data.phase !== 'waiting') { showLobbyOverlay('Esta sala ya no está disponible.'); return; }

  _roomCode = raw;
  _myRole   = 'guest';
  gameMode  = 'online';
  _roomRef  = ref;

  await _roomRef.update({ phase: 'setup', guestJoined: true });
  _roomRef.onDisconnect().update({ phase: 'abandoned' });

  hideLobbyOverlay();
  _resetOnlineBoard();
  await _subscribeRoom();
}

// ── Inicializar UI del tablero (online) ───────────────
function _resetOnlineBoard() {
  playerElim     = new Set();
  askedByPlayer  = new Set();
  askedByMachine = new Set();
  phase          = 'setup';
  turnCount      = 0;
  busy           = false;
  mySecret       = null;
  onlineAnswers  = {};
  _lastApplied   = 0;

  document.querySelector('.quien-wrap').classList.add('is-setup');
  document.getElementById('quien-start-btn').classList.remove('visible');
  renderBoard();
  updateMyCard(null);
  renderQuestions(false);
  setStatus('');
  document.getElementById('quien-board').classList.add('is-setup');
}

// ── Suscribirse ───────────────────────────────────────
async function _subscribeRoom() {
  const snap    = await _roomRef.once('value');
  const initial = snap.val();
  _lastApplied  = initial?.action?.seq ?? 0;
  _actionSeq    = _lastApplied;

  _roomRef.on('value', snap => {
    if (!snap.exists()) return;
    _onRoomUpdate(snap.val());
  });
}

// ── Dispatcher principal ──────────────────────────────
function _onRoomUpdate(data) {
  if (!data) return;

  if (data.phase === 'abandoned') {
    renderQuestions(false);
    _setBoardTitle(null);
    setStatus(`<div class="quien-setup">
      <p class="quien-title" style="color:#f87171;font-size:1.4rem">😔 Oponente desconectado</p>
      <button class="guess-btn" onclick="location.reload()" style="margin-top:16px">Volver al inicio</button>
    </div>`);
    return;
  }

  if (data.phase === 'waiting') {
    // Host waiting, nothing to do yet
    return;
  }

  if (data.phase === 'setup') {
    // Si veníamos de gameover → revancha → resetear tablero local
    if (phase === 'gameover') {
      playerElim     = new Set();
      askedByPlayer  = new Set();
      askedByMachine = new Set();
      onlineAnswers  = {};
      mySecret       = null;
      _lastApplied   = 0;
      _actionSeq     = 0;
      turnCount      = 0;
      busy           = false;
      phase          = 'setup';
      document.querySelector('.quien-wrap').classList.add('is-setup');
      document.getElementById('quien-start-btn').classList.remove('visible');
      renderBoard();
      updateMyCard(null);
      renderQuestions(false);
      _setBoardTitle(`
        <h2>Elige tu personaje secreto</h2>
        <p>Haz clic en el personaje que vas a ser. El oponente intentará adivinarlo.</p>`);
      setStatus('');
      return;
    }
    _handleSetup(data);
    return;
  }

  if (data.phase === 'host_turn' || data.phase === 'guest_turn') {
    _handleTurn(data);
    return;
  }

  if (data.phase === 'pending_answer') {
    _handlePendingAnswer(data);
    return;
  }

  if (data.phase === 'pending_guess') {
    _handlePendingGuess(data);
    return;
  }

  if (data.phase === 'gameover') {
    _handleGameover(data);
  }
}

// ── Setup ─────────────────────────────────────────────
function _handleSetup(data) {
  // Host: guest just joined → show board
  if (_myRole === 'host' && data.guestJoined && phase === 'setup' &&
      !document.querySelector('.quien-board-title')?.innerHTML?.includes('Elige tu')) {
    _setBoardTitle(`
      <h2>Elige tu personaje secreto</h2>
      <p>Haz clic en el personaje que vas a ser. El oponente intentará adivinarlo.</p>`);
  }

  // Guest: board is already shown from joinOnlineRoom
  if (_myRole === 'guest' && !document.querySelector('.quien-board-title')?.innerHTML?.includes('Elige tu')) {
    _setBoardTitle(`
      <h2>Elige tu personaje secreto</h2>
      <p>Haz clic en el personaje que vas a ser. El oponente intentará adivinarlo.</p>`);
  }

  const myReady  = _myRole === 'host' ? data.hostReady  : data.guestReady;
  const oppReady = _myRole === 'host' ? data.guestReady : data.hostReady;

  if (myReady && !oppReady) {
    document.getElementById('quien-start-btn').classList.remove('visible');
    setStatus(`<div class="quien-setup">
      <p class="quien-desc" style="margin:10px 0">✅ Listo. Esperando al oponente...</p>
    </div>`);
  }
}

// ── Jugador online elige personaje ────────────────────
function onlineSelectSecret(name) {
  const char = CHARACTERS.find(c => c.name === name);
  if (!char) return;
  mySecret = char;
  updateMyCard(char);
  renderBoard();
  document.querySelectorAll('.quien-card-3d').forEach(el => {
    el.classList.toggle('my-secret', el.dataset.name === name);
  });
  document.getElementById('quien-start-btn').classList.add('visible');
  setStatus('');
}

// ── Confirmar listo ───────────────────────────────────
async function onlineConfirmReady() {
  if (!mySecret || !_roomRef) return;

  const update = _myRole === 'host' ? { hostReady: true } : { guestReady: true };
  await _roomRef.update(update);

  // Atomic check: si ambos listos → empezar
  const snap = await _roomRef.once('value');
  const data  = snap.val();
  if (data.hostReady && data.guestReady) {
    await _roomRef.update({ phase: 'host_turn', turnCount: 0 });
  }

  document.getElementById('quien-start-btn').classList.remove('visible');
  setStatus(`<div class="quien-setup">
    <p class="quien-desc" style="margin:10px 0">✅ Listo. Esperando al oponente...</p>
  </div>`);
}

// ── Manejo de turno ───────────────────────────────────
function _handleTurn(data) {
  // Aplicar respuesta a MI tablero si yo hice la última pregunta y ya tiene respuesta
  const act = data.action;
  if (act && act.seq > _lastApplied && act.answer !== null && act.by === _myRole) {
    const q = Q_MAP[act.questionId];
    if (q) {
      CHARACTERS.filter(c => q.fn(c) !== act.answer).forEach(c => playerElim.add(c.name));
      askedByPlayer.add(act.questionId);
      onlineAnswers[act.questionId] = act.answer;
      _lastApplied = act.seq;
    }
  }

  const isMyTurn = (data.phase === 'host_turn' && _myRole === 'host') ||
                   (data.phase === 'guest_turn' && _myRole === 'guest');

  // Siempre salir del modo setup y mostrar el tablero completo
  _setBoardTitle(null);
  document.querySelector('.quien-wrap').classList.remove('is-setup');
  document.getElementById('quien-board').classList.remove('is-setup');
  document.getElementById('quien-start-btn').classList.remove('visible');
  renderBoard();

  if (isMyTurn) {
    phase = 'player_turn';
    turnCount = data.turnCount || 0;
    renderQuestions(true);
    setStatus(playerTurnStatus());
  } else {
    phase = 'machine_turn';
    renderQuestions(false);
    const rem = CHARACTERS.length - playerElim.size;
    setStatus(`<div class="quien-turn-player">
      <p class="turn-badge">⏳ Turno del oponente</p>
      <p class="quien-desc">Esperando que haga su pregunta...</p>
      <p class="quien-remaining">El oponente podría ser <strong>${rem}</strong> personaje${rem !== 1 ? 's' : ''}</p>
    </div>`);
  }
}

// ── Pregunta pendiente ────────────────────────────────
function _handlePendingAnswer(data) {
  const act = data.action;
  if (!act) return;

  if (act.by === _myRole) {
    // Yo pregunté, esperando respuesta
    renderQuestions(false);
    setStatus(`<div class="quien-turn-player">
      <p class="turn-badge">🗣️ Tu pregunta</p>
      <h2 class="quien-question">${Q_MAP[act.questionId]?.text}</h2>
      <p class="quien-desc" style="margin-top:8px">Esperando respuesta del oponente...</p>
    </div>`);
  } else {
    // El oponente preguntó, yo respondo
    const q = Q_MAP[act.questionId];
    setStatus(`<div class="quien-machine-ask">
      <p class="turn-badge">🤔 Pregunta del oponente</p>
      <h2 class="quien-question">${q?.text}</h2>
      <p class="quien-desc" style="font-size:0.82rem;margin-bottom:16px">
        Sobre tu personaje secreto
      </p>
      <div class="quien-btns">
        <button class="quien-btn-yes" onclick="onlineAnswerQ(true)">✓ Sí</button>
        <button class="quien-btn-no"  onclick="onlineAnswerQ(false)">✗ No</button>
      </div>
    </div>`);
  }
}

async function onlineAnswerQ(ans) {
  if (!_roomRef) return;
  const snap = await _roomRef.once('value');
  const data  = snap.val();
  // El siguiente turno es para quien hizo la pregunta (el que no soy yo)
  const nextPhase = data.action?.by === 'host' ? 'guest_turn' : 'host_turn';

  await _roomRef.update({
    'action/answer': ans,
    phase:           nextPhase,
    turnCount:       (data.turnCount || 0) + 1
  });

  const q = Q_MAP[data.action?.questionId];
  setStatus(`<div class="quien-answer ${ans ? 'answer-yes' : 'answer-no'}">
    <p class="quien-question-asked">${q?.text}</p>
    <div class="quien-answer-badge">${ans ? '✓ SÍ' : '✗ NO'}</div>
  </div>`);
}

// ── Jugador online hace una pregunta ──────────────────
async function onlineAskQuestion(id) {
  if (!_roomRef || phase !== 'player_turn') return;
  phase = 'asking';
  renderQuestions(false);
  _actionSeq++;

  await _roomRef.update({
    phase:  'pending_answer',
    action: { seq: _actionSeq, by: _myRole, questionId: id, answer: null }
  });
}

// ── Jugador online adivina ────────────────────────────
async function onlinePlayerGuess(name) {
  if (!_roomRef || phase !== 'player_turn') return;
  if (playerElim.has(name)) return;
  phase = 'guessing';
  renderQuestions(false);
  _actionSeq++;

  const slug = makeSlug(name);
  await _roomRef.update({
    phase:  'pending_guess',
    action: { seq: _actionSeq, type: 'guess', by: _myRole, guessChr: name, correct: null }
  });

  setStatus(`<div class="quien-machine-ask">
    <p class="turn-badge">🕵️ Tu adivinanza</p>
    <div class="quien-guess-avatar" style="margin:8px auto;border-color:var(--accent)">
      <img src="img/personajes/${slug}.webp" alt="${name}"
        onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.display='none'}">
    </div>
    <h2 class="quien-guess-name">${name}</h2>
    <p class="quien-desc" style="font-size:0.8rem;margin-top:6px">Esperando confirmación del oponente...</p>
  </div>`);
}

// ── Adivinanza pendiente ──────────────────────────────
function _handlePendingGuess(data) {
  const act = data.action;
  if (!act) return;

  if (act.by === _myRole) return; // Ya mostrado en onlinePlayerGuess

  // El oponente adivina → yo confirmo
  const slug = makeSlug(act.guessChr);
  setStatus(`<div class="quien-machine-ask">
    <p class="turn-badge">🕵️ El oponente adivina</p>
    <p class="quien-question" style="font-size:0.95rem;margin-bottom:10px">¿Tu personaje es...</p>
    <div class="quien-guess-avatar" style="margin:0 auto 8px;border-color:var(--accent)">
      <img src="img/personajes/${slug}.webp" alt="${act.guessChr}"
        onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.display='none'}">
    </div>
    <h2 class="quien-guess-name">${act.guessChr}</h2>
    <div class="quien-btns" style="margin-top:14px">
      <button class="quien-btn-yes" onclick="onlineConfirmGuess(true)">✓ Sí</button>
      <button class="quien-btn-no"  onclick="onlineConfirmGuess(false)">✗ No</button>
    </div>
  </div>`);
}

async function onlineConfirmGuess(correct) {
  if (!_roomRef) return;
  const myRevealKey = _myRole === 'host' ? 'hostReveal' : 'guestReveal';
  const snap  = await _roomRef.once('value');
  const guesser = snap.val()?.action?.by;

  if (correct) {
    await _roomRef.update({
      phase: 'gameover',
      winner: guesser,
      [myRevealKey]: mySecret?.name || null
    });
  } else {
    // Adivinanza incorrecta → el que adivina pierde
    await _roomRef.update({
      phase: 'gameover',
      winner: _myRole,  // yo gano
      [myRevealKey]: mySecret?.name || null
    });
  }
}

// ── Revancha en la misma sala ─────────────────────────
async function onlineRematch() {
  if (!_roomRef) return;

  const rematchKey = _myRole === 'host' ? 'hostRematch' : 'guestRematch';
  await _roomRef.update({ [rematchKey]: true });

  setStatus(`<div class="quien-setup">
    <p class="quien-desc" style="margin:10px 0">✅ Listo para revancha. Esperando al oponente...</p>
  </div>`);

  // Escuchar si ambos quieren revancha
  _roomRef.once('value', async snap => {
    const data = snap.val();
    if (data?.hostRematch && data?.guestRematch) {
      // Solo el host resetea la sala
      if (_myRole === 'host') {
        await _roomRef.update({
          phase:        'setup',
          hostReady:    false,
          guestReady:   false,
          hostRematch:  false,
          guestRematch: false,
          turnCount:    0,
          action:       null,
          winner:       null,
          hostReveal:   null,
          guestReveal:  null,
        });
      }
    }
  });
}

// ── Fin de partida ────────────────────────────────────
function _handleGameover(data) {
  renderQuestions(false);
  _setBoardTitle(null);
  phase = 'gameover';

  // Revelar mi personaje si no lo hice ya
  const myRevealKey  = _myRole === 'host' ? 'hostReveal' : 'guestReveal';
  if (!data[myRevealKey] && mySecret && _roomRef) {
    _roomRef.update({ [myRevealKey]: mySecret.name });
  }

  const iWon      = data.winner === _myRole;
  const oppReveal = _myRole === 'host' ? data.guestReveal : data.hostReveal;

  let html = `<div class="quien-result">`;
  html += iWon
    ? `<p class="quien-result-label">🎉 ¡Has ganado!</p>`
    : `<p class="quien-result-label" style="color:#f87171">😔 Has perdido</p>`;

  if (oppReveal) {
    const slug = makeSlug(oppReveal);
    html += `
      <p class="quien-desc" style="font-size:0.8rem;margin:8px 0 4px">El personaje del oponente era:</p>
      <div class="quien-guess-avatar ${iWon ? 'win-avatar' : ''}" style="margin:0 auto 8px">
        <img src="img/personajes/${slug}.webp" alt="${oppReveal}"
          onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else{this.style.display='none'}">
      </div>
      <h2 class="quien-guess-name">${oppReveal}</h2>`;
  } else {
    html += `<p class="quien-desc" style="margin-top:10px">Esperando que el oponente revele su personaje...</p>`;
  }

  html += `<button class="guess-btn" onclick="onlineRematch()" style="margin-top:16px">Jugar de nuevo</button>`;
  html += `</div>`;
  setStatus(html);
}
