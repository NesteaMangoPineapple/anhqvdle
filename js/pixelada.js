/* ================================================
   ANHQVdle — Modo Foto Pixelada
   ================================================ */

const MODE_KEY_PIX = 'pixelada';
const PIX_MAX_ATTEMPTS = 5;

/* Tamaños de bloque por intento (más alto = más pixelado) */
const PIX_BLOCK_SIZES = [20, 13, 7, 3, 1];

let pixTarget    = null;
let pixGuesses   = [];
let pixDone      = false;
let pixImg       = null;

function seededShufflePix(arr, seed) {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDailyPixChar() {
  const day = getDayNumber();
  return seededShufflePix(CHARACTERS, day * 48271)[0];
}

function pixSlug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function initPixelada() {
  if (location.search.includes('reset')) {
    const d = new Date();
    const key = `anhqvdle_${MODE_KEY_PIX}_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    localStorage.removeItem(key);
    history.replaceState(null, '', location.pathname);
  }
  cleanOldStorage();
  pixTarget = getDailyPixChar();

  const saved = loadDailyState(MODE_KEY_PIX);
  if (saved && saved.character && saved.character !== pixTarget.name) {
    /* día distinto */
  } else if (saved && saved.done) {
    pixGuesses = saved.guesses || [];
    pixDone    = true;
    renderPixBoard();
    loadAndDraw(0, true);
    showPixResult(saved.won, pixTarget.name);
    return;
  }

  pixGuesses = [];
  pixDone    = false;
  renderPixBoard();
  loadAndDraw(0, false);
}

function renderPixBoard() {
  const container = document.getElementById('pix-board');
  if (!container) return;

  const attempt = Math.min(pixGuesses.length, PIX_MAX_ATTEMPTS - 1);

  container.innerHTML = `
    <div class="pix-wrap">
      <canvas id="pix-canvas" width="280" height="280" class="pix-canvas"></canvas>
      <div class="pix-reveal-label" id="pix-reveal-label"></div>
    </div>
    <div class="pix-attempts">
      ${Array.from({length: PIX_MAX_ATTEMPTS}, (_, i) => {
        let cls = '';
        if (i < pixGuesses.length) cls = 'used-wrong';
        return `<span class="pix-attempt-dot ${cls}"></span>`;
      }).join('')}
    </div>
    <div class="pix-guesses" id="pix-guesses">
      ${pixGuesses.map(g => `<span class="pix-guess-pill wrong">${g}</span>`).join('')}
    </div>
    ${!pixDone ? `
    <div class="pix-input-wrap">
      <div style="position:relative;max-width:400px;margin:0 auto">
        <input id="pix-input" class="pix-input" type="text"
          placeholder="Escribe el nombre del personaje…"
          autocomplete="off" autocorrect="off"
          oninput="updateAutocompletePix()"
          onkeydown="if(event.key==='Enter')makeGuessPix()">
        <div id="autocomplete-pix" class="autocomplete-dropdown" style="display:none"></div>
      </div>
      <button class="imp-submit-btn" onclick="makeGuessPix()" style="margin-top:10px">Adivinar</button>
    </div>` : ''}`;
}

function loadAndDraw(blockIdx, revealed) {
  const canvas = document.getElementById('pix-canvas');
  if (!canvas) return;
  const slug  = pixSlug(pixTarget.name);
  const img   = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    pixImg = img;
    if (revealed) {
      drawPixelated(canvas, img, 1);
      const lbl = document.getElementById('pix-reveal-label');
      if (lbl) { lbl.textContent = pixTarget.name; lbl.style.opacity = '1'; }
    } else {
      const blockSize = PIX_BLOCK_SIZES[Math.min(blockIdx, PIX_BLOCK_SIZES.length - 1)];
      drawPixelated(canvas, img, blockSize);
    }
  };
  img.onerror = () => {
    img.src = img.src.endsWith('.webp')
      ? img.src.replace('.webp', '.jpg')
      : img.src.replace('.jpg', '.jpeg');
  };
  img.src = `img/personajes/${slug}.webp`;
}

function drawPixelated(canvas, img, blockSize) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  if (blockSize <= 1) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, w, h);
    return;
  }

  const small = document.createElement('canvas');
  small.width  = Math.max(1, Math.floor(w / blockSize));
  small.height = Math.max(1, Math.floor(h / blockSize));
  const sctx = small.getContext('2d');
  sctx.drawImage(img, 0, 0, small.width, small.height);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, w, h);
}

function updateAutocompletePix() {
  buildAutocomplete('pix-input', 'autocomplete-pix',
    name => { document.getElementById('pix-input').value = name; makeGuessPix(); });
}

function makeGuessPix() {
  if (pixDone) return;
  const input = document.getElementById('pix-input');
  const val   = input.value.trim();
  if (!val) return;
  document.getElementById('autocomplete-pix').style.display = 'none';

  const guess = CHARACTERS.find(c => c.name.toLowerCase() === val.toLowerCase());
  if (!guess) { shakeInput('pix-input'); return; }
  if (pixGuesses.includes(guess.name)) { input.value = ''; input.focus(); return; }

  pixGuesses.push(guess.name);
  input.value = '';

  const correct = guess.name === pixTarget.name;

  if (correct) {
    pixDone = true;
    updateStats(MODE_KEY_PIX, pixGuesses.length, true);
    saveDailyState(MODE_KEY_PIX, { guesses: pixGuesses, done: true, won: true, character: pixTarget.name });
    if (typeof updateStreak === 'function') {
      const n = updateStreak();
      if (typeof triggerStreakAnimation === 'function') triggerStreakAnimation(n);
    }
    renderPixBoard();
    loadAndDraw(0, true);
    showPixResult(true, pixTarget.name);
  } else {
    saveDailyState(MODE_KEY_PIX, { guesses: pixGuesses, done: false, won: false, character: pixTarget.name });
    if (pixGuesses.length >= PIX_MAX_ATTEMPTS) {
      pixDone = true;
      updateStats(MODE_KEY_PIX, pixGuesses.length, false);
      saveDailyState(MODE_KEY_PIX, { guesses: pixGuesses, done: true, won: false, character: pixTarget.name });
      renderPixBoard();
      loadAndDraw(0, true);
      showPixResult(false, pixTarget.name);
    } else {
      const newBlockIdx = Math.min(pixGuesses.length, PIX_BLOCK_SIZES.length - 1);
      renderPixBoard();
      if (pixImg) drawPixelated(document.getElementById('pix-canvas'), pixImg, PIX_BLOCK_SIZES[newBlockIdx]);
      else loadAndDraw(newBlockIdx, false);
      document.getElementById('pix-input').focus();
    }
  }
}

function showPixResult(won, charName) {
  const el = document.getElementById('pix-result');
  if (!el) return;
  startCountdown('countdown-timer-pix');
  const streak = (typeof getStreakData === 'function') ? getStreakData() : { count: 0 };
  const streakHtml = streak.count >= 1
    ? `<div class="result-streak">🔥 <strong>${streak.count}</strong> día${streak.count !== 1 ? 's' : ''} seguido${streak.count !== 1 ? 's' : ''}</div>`
    : '';

  el.innerHTML = `
    <div class="result-banner result-banner-quote" style="margin-top:24px">
      <p class="result-day-num">#${getDayNumber()}</p>
      <h2>${won ? '¡Reconocido!' : '¡Uy!'}</h2>
      <p class="result-sub" style="${streakHtml ? 'margin-bottom:8px' : ''}">
        ${won
          ? `Lo identificaste en <strong>${pixGuesses.length}</strong> intento${pixGuesses.length !== 1 ? 's' : ''}`
          : `Era <strong>${charName}</strong>`}
      </p>
      ${streakHtml}
      <div class="result-divider"></div>
      <div class="share-row">
        <button class="share-btn" onclick="sharePix(${won})">📋 Compartir</button>
      </div>
      <div class="countdown-wrap">
        <p class="countdown-label">Próxima foto en</p>
        <div class="countdown" id="countdown-timer-pix">00:00:00</div>
      </div>
    </div>`;
  maybeShowKofiPopup();
}

function sharePix(won) {
  const emojis = pixGuesses.map((_, i) => i === pixGuesses.length - 1 && won ? '🟩' : '🟥').join('');
  const text   = `ANHQVdle 🖼️ #${getDayNumber()} · ${new Date().toLocaleDateString('es-ES')}\n${won ? `${pixGuesses.length} intento${pixGuesses.length !== 1 ? 's' : ''}` : 'Sin adivinar'}\n${emojis}\nanhqvdle.es`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('#pix-result .share-btn');
    if (!btn) return;
    btn.textContent = '¡Copiado! ✓'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Compartir'; btn.classList.remove('copied'); }, 2000);
  });
}

initPixelada();
