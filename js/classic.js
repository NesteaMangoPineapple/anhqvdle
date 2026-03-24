/* ================================================
   ANHQVdle — Modo Clásico (personaje del día)
   ================================================ */

const MODE_KEY    = 'classic';

let classicTarget  = null;
let classicGuesses = [];
let classicResults = [];
let classicDone    = false;

function renderYesterdayClassic() {
  const yChar = CHARACTERS[getYesterdayIndex(CHARACTERS.length)];
  const slug  = yChar.name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const el = document.getElementById('classic-yesterday');
  if (!el) return;
  el.innerHTML = `
    <div class="yesterday-pill">
      <img src="img/personajes/${slug}.webp" alt="${yChar.name}"
        onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none'}">
      <span>El personaje de ayer fue <strong>${yChar.name}</strong></span>
    </div>`;
}

function initClassic() {
  // Personaje del día — mismo para todos usando la fecha como semilla
  const idx    = getDailyIndex(CHARACTERS.length);
  classicTarget = CHARACTERS[idx];
  renderYesterdayClassic();

  // Recuperar estado de hoy si ya se jugó
  const saved = loadDailyState(MODE_KEY);
  if (saved) {
    classicGuesses = saved.guesses || [];
    classicResults = saved.results || [];
    classicDone    = saved.done || false;
      classicGuesses.forEach(g => {
      const char = CHARACTERS.find(c => c.name === g);
      if (char) renderGuessRow(char);
    });
    if (classicDone) {
      document.getElementById('classic-input').disabled = true;
      document.getElementById('search-wrap').style.display = 'none';
      showDoneMessage('classic-result', saved.won, classicTarget.name, classicGuesses.length);
    }
    return;
  }

  // Estado limpio
  classicGuesses = [];
  classicResults = [];
  classicDone    = false;
  document.getElementById('guess-tbody').innerHTML      = '';
  document.getElementById('classic-result').innerHTML   = '';
  document.getElementById('classic-input').value        = '';
  document.getElementById('classic-input').disabled     = false;
  document.getElementById('autocomplete').style.display = 'none';
}

function updateAutocomplete() {
  buildAutocomplete('classic-input', 'autocomplete',
    name => { document.getElementById('classic-input').value = name; makeGuess(); });
}

function makeGuess() {
  if (classicDone) return;
  const input = document.getElementById('classic-input');
  const val   = input.value.trim();
  if (!val) return;
  document.getElementById('autocomplete').style.display = 'none';

  const guess = CHARACTERS.find(c => c.name.toLowerCase() === val.toLowerCase());
  if (!guess) { shakeInput('classic-input'); return; }
  if (classicGuesses.find(g => g === guess.name)) { input.value = ''; return; }

  classicGuesses.push(guess.name);
  input.value = '';

  const won = guess.name === classicTarget.name;
  const t   = classicTarget;
  const floorMatch = guess.floors.some(f => t.floors.includes(f));
  const jobMatch   = guess.occupations.some(o => t.occupations.includes(o));
  const debutDiff  = Math.abs(guess.seasons[0] - t.seasons[0]);
  const rowEmojis  = [
    guess.name === t.name ? '🟩' : '🟥',
    guess.type === t.type ? '🟩' : '🟥',
    guess.gender === t.gender ? '🟩' : '🟥',
    guess.nationality === t.nationality ? '🟩' : '🟥',
    floorMatch ? '🟩' : '🟥',
    jobMatch   ? '🟩' : '🟥',
    guess.seasons[0] === t.seasons[0] ? '🟩' : debutDiff === 1 ? '🟨' : '🟥',
  ];
  classicResults.push(rowEmojis);

  renderGuessRow(guess);

  if (won) {
    classicDone = true;
    input.disabled = true;
    document.getElementById('search-wrap').style.display = 'none';
    saveDailyState(MODE_KEY, { guesses: classicGuesses, results: classicResults, done: true, won });
    showDoneMessage('classic-result', won, classicTarget.name, classicGuesses.length);
  } else {
    saveDailyState(MODE_KEY, { guesses: classicGuesses, results: classicResults, done: false, won: false });
  }
}

function renderGuessRow(guess) {
  const t      = classicTarget;
  const tbody  = document.getElementById('guess-tbody');
  const row    = document.createElement('tr');
  row.className = 'guess-row';

  const floorMatch  = guess.floors.some(f => t.floors.includes(f));
  const jobMatch    = guess.occupations.some(o => t.occupations.includes(o));
  const debutGuess  = guess.seasons[0];
  const debutTarget = t.seasons[0];
  const debutClose  = Math.abs(debutGuess - debutTarget) === 1;
  const emoji       = getCharacterEmoji(guess.name);
  const imgSlug     = guess.name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const imgPath     = `img/personajes/${imgSlug}.webp`;
  const jobsHtml    = guess.occupations.map(o => `<span class="job-tag">${o}</span>`).join('');
  const avatarHtml  = `
    <div class="cell-avatar">
      <img src="${imgPath}" alt="${guess.name}"
        onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
      <span class="emoji-fallback" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:1.8rem">${emoji}</span>
      <div class="avatar-hover-name">${guess.name}</div>
    </div>`;

  const cols = [
    { html: `<div class="cell-name">${avatarHtml}</div>`, correct: guess.name === t.name, partial: false, arrow: '' },
    { html: guess.type,               correct: guess.type === t.type,               partial: false, arrow: '' },
    { html: guess.gender,             correct: guess.gender === t.gender,           partial: false, arrow: '' },
    { html: guess.nationality,        correct: guess.nationality === t.nationality, partial: false, arrow: '' },
    { html: guess.floors.join('<br>'),correct: floorMatch,                          partial: false, arrow: '' },
    { html: jobsHtml,                 correct: jobMatch,                            partial: false, arrow: '' },
    {
      html:    'T' + debutGuess,
      correct: debutGuess === debutTarget,
      partial: debutGuess !== debutTarget && debutClose,
      arrow:   debutGuess === debutTarget ? '' : debutGuess < debutTarget ? ' ⬆️' : ' ⬇️'
    },
  ];

  cols.forEach((col, i) => {
    const td  = document.createElement('td');
    td.style.setProperty('--i', i);
    const cls = col.correct ? 'cell-correct' : col.partial ? 'cell-partial' : 'cell-wrong';
    if (i === 0) {
      // Photo cell — td IS the image, no wrapper at all
      td.style.cssText = 'padding:0;overflow:hidden;position:relative;';
      td.innerHTML = col.html;
    } else {
      td.innerHTML = `<div class="cell-inner ${cls}">${col.html}${col.arrow}</div>`;
    }
    row.appendChild(td);
  });

  tbody.insertBefore(row, tbody.firstChild);
}

function showDoneMessage(containerId, won, charName, attempts) {
  const el = document.getElementById(containerId);
  startCountdown();
  el.innerHTML = `
    <div class="result-banner">
      <h2>${won ? '🎉 ¡Correcto!' : '😭 ¡Uy!'}</h2>
      <p>${won
        ? `Lo adivinaste en <strong>${attempts}</strong> intento${attempts !== 1 ? 's' : ''}`
        : `Era <strong>${charName}</strong>. ¡Mañana lo intentas de nuevo!`}
      </p>
      <div class="character-reveal">${won ? charName : '→ ' + charName}</div>
      <p style="font-size:0.85rem;color:var(--text2);margin-top:8px">${won ? getWinMessage(attempts) : ''}</p>
      <button class="share-btn" id="share-btn-classic" onclick="shareResultClassic(${won}, ${attempts})">📋 Compartir resultado</button>
      <div class="countdown-wrap">
        <p style="font-size:0.8rem;color:var(--text2);margin-top:16px;letter-spacing:1px;text-transform:uppercase">Próximo personaje en</p>
        <div class="countdown" id="countdown-timer">00:00:00</div>
      </div>
    </div>`;
}

function shareResultClassic(won, attempts) {
  const today   = new Date();
  const dateStr = today.toLocaleDateString('es-ES');
  const grid    = classicResults.map(row => row.join('')).join('\n');
  const status  = won ? `${attempts} intento${attempts !== 1 ? 's' : ''}` : 'Sin adivinar';
  const text    = `ANHQVdle 🎬 · ${dateStr}\n${status}\n${grid}\nahqvdle.es`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('share-btn-classic');
    if (!btn) return;
    btn.textContent = '¡Copiado! ✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Compartir resultado'; btn.classList.remove('copied'); }, 2000);
  });
}

function startCountdown() {
  function tick() {
    const el = document.getElementById('countdown-timer');
    if (!el) return;
    el.textContent = formatCountdown(msUntilMidnight());
  }
  tick();
  setInterval(tick, 1000);
}

function getWinMessage(n) {
  if (n === 1) return '¡Increíble! ¡Eres un experto de la comunidad!';
  if (n <= 3)  return '¡Muy bien! El portal del edificio te conoce bien...';
  if (n <= 5)  return '¡Bien! Pero aún te queda práctica con el cotilleo vecinal.';
  return '¡Justo a tiempo! Casi te tira Vicenta a escobazos.';
}

function getCharacterEmoji(name) {
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

// Arrancar al cargar la página
initClassic();
