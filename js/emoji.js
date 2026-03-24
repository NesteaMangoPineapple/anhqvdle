/* ================================================
   ANHQVdle — Modo Emojis (emoji del día)
   ================================================ */

const MAX_EMOJI  = 5;
const MODE_KEY_E = 'emoji';

let emojiTarget  = null;
let emojiGuesses = [];
let emojiDone    = false;

function initEmoji() {
  const idx   = getDailyIndex(EMOJIS.length);
  emojiTarget = EMOJIS[idx];

  const saved = loadDailyState(MODE_KEY_E);
  if (saved) {
    emojiGuesses = saved.guesses || [];
    emojiDone    = saved.done || false;
    document.getElementById('emoji-display').textContent = emojiTarget.emojis;
    renderEmojiHints(emojiGuesses.length);
    renderPips('emoji-pips', MAX_EMOJI, emojiGuesses.length, saved.won);
    emojiGuesses.forEach(name => {
      const correct = name === emojiTarget.character;
      const chip = document.createElement('span');
      chip.className   = 'quote-attempt-item ' + (correct ? 'correct' : 'wrong');
      chip.textContent = name;
      document.getElementById('emoji-attempts').appendChild(chip);
    });
    if (emojiDone) {
      document.getElementById('emoji-input').disabled = true;
      document.getElementById('search-wrap').style.display = 'none';
      showDoneMessageEmoji(saved.won, emojiTarget.character, emojiGuesses.length);
    }
    return;
  }

  emojiGuesses = [];
  emojiDone    = false;
  document.getElementById('emoji-display').textContent       = emojiTarget.emojis;
  document.getElementById('emoji-attempts').innerHTML        = '';
  document.getElementById('emoji-result').innerHTML          = '';
  document.getElementById('emoji-input').value               = '';
  document.getElementById('emoji-input').disabled            = false;
  document.getElementById('autocomplete-emoji').style.display = 'none';
  renderEmojiHints(0);
  renderPips('emoji-pips', MAX_EMOJI, 0);
}

function renderEmojiHints(n) {
  const container = document.getElementById('emoji-hints');
  if (!container) return;
  container.innerHTML = emojiTarget.hints
    .map((hint, i) => `<span class="emoji-hint-chip ${i < n ? 'revealed' : ''}">
      ${i < n ? hint : '?? Pista ' + (i + 1)}
    </span>`).join('');
}

function updateAutocompleteEmoji() {
  buildAutocomplete('emoji-input', 'autocomplete-emoji',
    name => { document.getElementById('emoji-input').value = name; });
}

function makeGuessEmoji() {
  if (emojiDone) return;
  const input = document.getElementById('emoji-input');
  const val   = input.value.trim();
  if (!val) return;
  document.getElementById('autocomplete-emoji').style.display = 'none';

  const guess = CHARACTERS.find(c => c.name.toLowerCase() === val.toLowerCase());
  if (!guess) { shakeInput('emoji-input'); return; }

  emojiGuesses.push(guess.name);
  input.value = '';

  const correct = guess.name === emojiTarget.character;
  const chip = document.createElement('span');
  chip.className   = 'quote-attempt-item ' + (correct ? 'correct' : 'wrong');
  chip.textContent = guess.name;
  document.getElementById('emoji-attempts').appendChild(chip);

  renderEmojiHints(emojiGuesses.length);
  renderPips('emoji-pips', MAX_EMOJI, emojiGuesses.length, correct);

  if (correct || emojiGuesses.length >= MAX_EMOJI) {
    emojiDone = true;
    input.disabled = true;
    document.getElementById('search-wrap').style.display = 'none';
    saveDailyState(MODE_KEY_E, { guesses: emojiGuesses, done: true, won: correct });
    showDoneMessageEmoji(correct, emojiTarget.character, emojiGuesses.length);
  } else {
    saveDailyState(MODE_KEY_E, { guesses: emojiGuesses, done: false, won: false });
  }
}

function showDoneMessageEmoji(won, charName, attempts) {
  const el = document.getElementById('emoji-result');
  startCountdownEmoji();
  el.innerHTML = `
    <div class="result-banner">
      <h2>${won ? '🎉 ¡Correcto!' : '😭 ¡Uy!'}</h2>
      <p>${won
        ? `Lo adivinaste en <strong>${attempts}</strong> intento${attempts !== 1 ? 's' : ''}`
        : `Era <strong>${charName}</strong>. ¡Mañana lo intentas de nuevo!`}
      </p>
      <div class="character-reveal">${won ? charName : '→ ' + charName}</div>
      <div class="countdown-wrap">
        <p style="font-size:0.8rem;color:var(--text2);margin-top:16px;letter-spacing:1px;text-transform:uppercase">Próximos emojis en</p>
        <div class="countdown" id="countdown-timer-e">00:00:00</div>
      </div>
    </div>`;
}

function startCountdownEmoji() {
  function tick() {
    const el = document.getElementById('countdown-timer-e');
    if (!el) return;
    el.textContent = formatCountdown(msUntilMidnight());
  }
  tick();
  setInterval(tick, 1000);
}

initEmoji();
