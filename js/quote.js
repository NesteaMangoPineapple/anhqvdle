/* ================================================
   ANHQVdle — Modo Frases (frase del día)
   ================================================ */

const MODE_KEY_Q = 'quote';

let quoteTarget  = null;
let quoteGuesses = [];
let quoteDone    = false;

function renderYesterdayQuote() {
  const yQuote = getYesterdayQuote();
  const el     = document.getElementById('quote-yesterday');
  if (!el) return;
  const imgPath = `img/personajes/${toSlug(yQuote.character)}.webp`;
  el.innerHTML = `
    <div class="yesterday-pill">
      <img src="${imgPath}" alt="${yQuote.character}"
        onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none'}">
      <span>La frase de ayer era de <strong>${yQuote.character}</strong></span>
    </div>`;
}

function initQuote() {
  cleanOldStorage();
  initColorblind();

  quoteTarget = getDailyQuote();
  renderYesterdayQuote();

  const saved = loadDailyState(MODE_KEY_Q);
  if (saved) {
    quoteGuesses = saved.guesses || [];
    quoteDone    = saved.done || false;
    document.getElementById('quote-text').textContent = quoteTarget.quote;
    quoteGuesses.forEach(name => {
      const correct = name === quoteTarget.character;
      const imgPath = `img/personajes/${toSlug(name)}.webp`;
      const emoji   = getQuoteEmoji(name);
      const card    = document.createElement('div');
      card.className = 'quote-guess-card ' + (correct ? 'correct' : 'wrong');
      card.innerHTML = `
        <div class="quote-guess-avatar">
          <img src="${imgPath}" alt="${name}"
            onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
          <span class="emoji-fallback" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:1.4rem">${emoji}</span>
        </div>
        <span class="quote-guess-name">${name}</span>`;
      document.getElementById('quote-attempts').appendChild(card);
    });
    if (quoteGuesses.length >= 2 && !saved.won) {
      if (saved.hintRevealed) {
        document.getElementById('quote-hint').textContent = '💡 ' + quoteTarget.hint;
      } else {
        showHintButton();
      }
    }
    if (quoteDone) {
      document.getElementById('quote-input').disabled = true;
      document.getElementById('search-wrap').style.display = 'none';
      showDoneMessageQuote(saved.won, quoteTarget.character, quoteGuesses.length);
    }
    return;
  }

  quoteGuesses = [];
  quoteDone    = false;
  document.getElementById('quote-text').textContent       = quoteTarget.quote;
  document.getElementById('quote-hint').textContent       = '';
  document.getElementById('quote-attempts').innerHTML     = '';
  document.getElementById('quote-result').innerHTML       = '';
  document.getElementById('quote-input').value            = '';
  document.getElementById('quote-input').disabled         = false;
  document.getElementById('autocomplete-quote').style.display = 'none';
}

function updateAutocompleteQuote() {
  buildAutocomplete('quote-input', 'autocomplete-quote',
    name => { document.getElementById('quote-input').value = name; makeGuessQuote(); });
}

function makeGuessQuote() {
  if (quoteDone) return;
  const input = document.getElementById('quote-input');
  const val   = input.value.trim();
  if (!val) return;
  document.getElementById('autocomplete-quote').style.display = 'none';

  const guess = CHARACTERS.find(c => c.name.toLowerCase() === val.toLowerCase());
  if (!guess) { shakeInput('quote-input'); return; }

  // Evitar adivinar el mismo personaje dos veces
  if (quoteGuesses.includes(guess.name)) { input.value = ''; input.focus(); return; }

  quoteGuesses.push(guess.name);
  input.value = '';

  const correct = guess.name === quoteTarget.character;
  const imgPath = `img/personajes/${toSlug(guess.name)}.webp`;
  const emoji   = getQuoteEmoji(guess.name);

  const card = document.createElement('div');
  card.className = 'quote-guess-card ' + (correct ? 'correct' : 'wrong');
  card.setAttribute('role', 'listitem');
  card.innerHTML = `
    <div class="quote-guess-avatar">
      <img src="${imgPath}" alt="${guess.name}"
        onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
      <span class="emoji-fallback" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:1.4rem">${emoji}</span>
    </div>
    <span class="quote-guess-name">${guess.name}</span>
  `;
  document.getElementById('quote-attempts').appendChild(card);

  if (correct) {
    quoteDone = true;
    input.disabled = true;
    document.getElementById('search-wrap').style.display = 'none';
    updateStats('quote', quoteGuesses.length, true);
    saveDailyState(MODE_KEY_Q, { guesses: quoteGuesses, done: true, won: true });
    showDoneMessageQuote(true, quoteTarget.character, quoteGuesses.length);
  } else {
    saveDailyState(MODE_KEY_Q, { guesses: quoteGuesses, done: false, won: false });
    if (quoteGuesses.length >= 2) showHintButton();
    input.focus();
  }
}

function showHintButton() {
  if (document.getElementById('hint-reveal-btn')) return;
  const btn = document.createElement('button');
  btn.id        = 'hint-reveal-btn';
  btn.className = 'hint-reveal-btn';
  btn.textContent = '💡 Revelar pista';
  btn.onclick   = revealHint;
  document.querySelector('.quote-box').insertAdjacentElement('beforeend', btn);
}

function revealHint() {
  const btn = document.getElementById('hint-reveal-btn');
  if (btn) btn.remove();
  document.getElementById('quote-hint').textContent = '💡 ' + quoteTarget.hint;
  const saved = loadDailyState(MODE_KEY_Q) || {};
  saveDailyState(MODE_KEY_Q, { ...saved, hintRevealed: true });
}

function showDoneMessageQuote(won, charName, attempts) {
  const el  = document.getElementById('quote-result');
  const day = getDayNumber();
  startCountdown('countdown-timer-q');
  const imgPath = `img/personajes/${toSlug(charName)}.webp`;
  el.innerHTML = `
    <div class="result-banner result-banner-quote">
      <p class="result-day-num">#${day}</p>
      <div class="result-header">
        <h2>${won ? '¡Correcto!' : '¡Uy!'}</h2>
      </div>
      <p class="result-sub">${won
        ? `Lo adivinaste en <strong>${attempts}</strong> intento${attempts !== 1 ? 's' : ''}`
        : 'No lo has adivinado esta vez...'}</p>
      <div class="result-character">
        <div class="result-avatar">
          <img src="${imgPath}" alt="${charName}"
            onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none'}">
        </div>
        <div class="character-reveal">${won ? charName : '→ ' + charName}</div>
      </div>
      <div class="result-divider"></div>
      <div class="share-row">
        <button class="share-btn" id="share-btn-quote" onclick="shareResultQuote(${won}, ${attempts})">📋 Texto</button>
        <button class="share-btn" id="share-img-btn-quote" onclick="shareImageQuote(${won}, ${attempts})">📸 Imagen</button>
      </div>
      <div class="countdown-wrap">
        <p class="countdown-label">Próxima frase en</p>
        <div class="countdown" id="countdown-timer-q">00:00:00</div>
      </div>
    </div>`;
}

function shareResultQuote(won, attempts) {
  const today   = new Date();
  const dateStr = today.toLocaleDateString('es-ES');
  const emojis  = quoteGuesses.map(name => name === quoteTarget.character ? '✅' : '❌').join('');
  const status  = won ? `${attempts} intento${attempts !== 1 ? 's' : ''}` : 'Sin adivinar';
  const text    = `ANHQVdle 💬 #${getDayNumber()} · ${dateStr}\n${status}\n${emojis}\nanhqvdle.es`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('share-btn-quote');
    if (!btn) return;
    btn.textContent = '¡Copiado! ✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Texto'; btn.classList.remove('copied'); }, 2000);
  });
}

function shareImageQuote(won, attempts) {
  const n    = quoteGuesses.length;
  const CELL = 40, GAP = 6;
  const W    = Math.max(300, 60 + n * (CELL + GAP));
  const H    = 210;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(240,192,32,0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  ctx.font = 'bold 38px Impact, "Bebas Neue", sans-serif';
  ctx.fillStyle = '#f0c020';
  ctx.textAlign = 'center';
  ctx.fillText('ANHQVdle', W / 2, 48);

  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(`💬 Frases #${getDayNumber()} · ${new Date().toLocaleDateString('es-ES')}`, W / 2, 72);

  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = won ? '#4ade80' : '#f87171';
  ctx.fillText(won ? `✓ ${attempts} intento${attempts !== 1 ? 's' : ''}` : '✗ Sin adivinar', W / 2, 100);

  const totalW = n * (CELL + GAP) - GAP;
  let x = (W - totalW) / 2;
  quoteGuesses.forEach(name => {
    ctx.fillStyle = name === quoteTarget.character ? '#16a34a' : '#dc2626';
    ctx.fillRect(x, 122, CELL, CELL);
    x += CELL + GAP;
  });

  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('anhqvdle.es', W / 2, H - 14);

  canvas.toBlob(blob => {
    if (!blob) return;
    const file = new File([blob], 'anhqvdle-frases.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'ANHQVdle' }).catch(() => _downloadBlob(blob, 'anhqvdle-frases.png'));
    } else {
      _downloadBlob(blob, 'anhqvdle-frases.png');
    }
  }, 'image/png');
}

function _downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

initQuote();

function getQuoteEmoji(name) {
  const map = {
    "Emilio Delgado":"🧹","Mariano Delgado":"📚","Vicenta Benito":"🌸","Marisa Benito":"🚬",
    "Concha de la Fuente":"👵","Mauri Hidalgo":"🌈","Fernando Navarro":"⚖️","Bea Villarejo":"📖",
    "Juan Cuesta":"📋","Paloma Hurtado":"🕊️","Natalia Cuesta":"👩","José Miguel Cuesta":"🎮",
    "Isabel Ruiz":"🌿","Yago":"🌍","Armando Cortés":"😎","Andrés Guerra":"💼",
    "Pablo Guerra":"🎸","Álex Guerra":"💪","Higinio Heredia":"🔨","Mamen Heredia":"🛋️",
    "Candela Heredia":"🍭","Raquel Heredia":"💄","Moncho Heredia":"🛌","Lucía Álvarez":"👜",
    "Roberto Alonso":"✏️","Carlos de Haro":"💰","Nieves Cuesta":"❄️","Rafael Álvarez":"🦇",
    "Carmen Villanueva":"📐","Belén López":"💃","Alicia Sanz":"💅","Ana":"🇩🇪",
    "María Jesús":"🍞","Paco":"📼","Gerardo":"🔧","Padre Miguel":"✝️",
    "Gregorio":"🗂️","Hermana Esperanza":"📻","Daniel Rubio":"👦","Rebeca":"👧",
    "Ezequiel Hidalgo":"🍼",
  };
  return map[name] || "👤";
}
