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
  const el = document.getElementById('classic-yesterday');
  if (!el) return;
  const imgPath = `img/personajes/${toSlug(yChar.name)}.webp`;
  el.innerHTML = `
    <div class="yesterday-pill">
      <img src="${imgPath}" alt="${yChar.name}"
        onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none'}">
      <span>El personaje de ayer fue <strong>${yChar.name}</strong></span>
    </div>`;
}

function initClassic() {
  cleanOldStorage();
  initColorblind();

  const idx    = getDailyIndex(CHARACTERS.length);
  classicTarget = CHARACTERS[idx];
  renderYesterdayClassic();

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
  if (classicGuesses.includes(guess.name)) { input.value = ''; input.focus(); return; }

  classicGuesses.push(guess.name);
  input.value = '';

  const won = guess.name === classicTarget.name;
  const t   = classicTarget;
  const allFloorsMatch = guess.floors.length === t.floors.length && guess.floors.every(f => t.floors.includes(f));
  const floorPartial   = !allFloorsMatch && guess.floors.some(f => t.floors.includes(f));
  const allJobsMatch   = guess.occupations.length === t.occupations.length && guess.occupations.every(o => t.occupations.includes(o));
  const jobPartial     = !allJobsMatch && guess.occupations.some(o => t.occupations.includes(o));
  const debutDiff      = Math.abs(guess.seasons[0] - t.seasons[0]);

  const rowEmojis = [
    guess.name === t.name ? '🟩' : '🟥',
    guess.type === t.type ? '🟩' : '🟥',
    guess.gender === t.gender ? '🟩' : '🟥',
    guess.nationality === t.nationality ? '🟩' : '🟥',
    allFloorsMatch ? '🟩' : floorPartial ? '🟨' : '🟥',
    allJobsMatch   ? '🟩' : jobPartial   ? '🟨' : '🟥',
    guess.hasChildren === t.hasChildren ? '🟩' : '🟥',
    guess.seasons[0] === t.seasons[0] ? '🟩' : debutDiff === 1 ? '🟨' : '🟥',
  ];
  classicResults.push(rowEmojis);

  renderGuessRow(guess);

  if (won) {
    classicDone = true;
    input.disabled = true;
    document.getElementById('search-wrap').style.display = 'none';
    updateStats('classic', classicGuesses.length, true);
    saveDailyState(MODE_KEY, { guesses: classicGuesses, results: classicResults, done: true, won: true });
    showDoneMessage('classic-result', true, classicTarget.name, classicGuesses.length);
  } else {
    saveDailyState(MODE_KEY, { guesses: classicGuesses, results: classicResults, done: false, won: false });
    input.focus();
  }
}

function renderGuessRow(guess) {
  const t      = classicTarget;
  const tbody  = document.getElementById('guess-tbody');
  const row    = document.createElement('tr');
  row.className = 'guess-row';

  const allFloorsMatch = guess.floors.length === t.floors.length && guess.floors.every(f => t.floors.includes(f));
  const floorPartial   = !allFloorsMatch && guess.floors.some(f => t.floors.includes(f));
  const allJobsMatch   = guess.occupations.length === t.occupations.length && guess.occupations.every(o => t.occupations.includes(o));
  const jobPartial     = !allJobsMatch && guess.occupations.some(o => t.occupations.includes(o));
  const childrenMatch  = guess.hasChildren === t.hasChildren;
  const debutGuess     = guess.seasons[0];
  const debutTarget    = t.seasons[0];
  const debutClose     = Math.abs(debutGuess - debutTarget) === 1;
  const isCorrectChar  = guess.name === t.name;

  const imgPath  = `img/personajes/${toSlug(guess.name)}.webp`;
  const emoji    = getCharacterEmoji(guess.name);
  const jobsHtml = guess.occupations.map(o => `<span class="job-tag">${o}</span>`).join('');

  // Color del borde de la foto según si es correcto/incorrecto
  const avatarBorderColor = isCorrectChar ? 'var(--correct)' : 'var(--wrong)';
  const avatarHtml = `
    <div class="cell-name">
      <div class="cell-avatar" style="border-color:${avatarBorderColor};border-width:3px">
        <img src="${imgPath}" alt="${guess.name}"
          onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
        <span class="emoji-fallback" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:1.8rem">${emoji}</span>
        <div class="avatar-hover-name">${guess.name}</div>
      </div>
    </div>`;

  const cols = [
    { html: avatarHtml,                  correct: isCorrectChar,                    partial: false, arrow: '' },
    { html: guess.type,                  correct: guess.type === t.type,            partial: false, arrow: '' },
    { html: guess.gender,                correct: guess.gender === t.gender,        partial: false, arrow: '' },
    { html: guess.nationality,           correct: guess.nationality === t.nationality, partial: false, arrow: '' },
    { html: guess.floors.join('<br>'),   correct: allFloorsMatch,                   partial: floorPartial, arrow: '' },
    { html: jobsHtml,                    correct: allJobsMatch,                     partial: jobPartial,   arrow: '' },
    { html: guess.hasChildren ? 'Sí' : 'No', correct: childrenMatch,               partial: false,        arrow: '' },
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
  const el      = document.getElementById(containerId);
  const day     = getDayNumber();
  const imgPath = `img/personajes/${toSlug(charName)}.webp`;
  startCountdown('countdown-timer');
  el.innerHTML = `
    <div class="result-banner result-banner-quote">
      <p class="result-day-num">#${day}</p>
      <h2>${won ? '¡Correcto!' : '¡Uy!'}</h2>
      <p class="result-sub">${won
        ? `Lo adivinaste en <strong>${attempts}</strong> intento${attempts !== 1 ? 's' : ''}`
        : `Era <strong>${charName}</strong>. ¡Mañana lo intentas de nuevo!`}
      </p>
      <div class="result-character">
        <div class="result-avatar">
          <img src="${imgPath}" alt="${charName}"
            onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none'}">
        </div>
        <div class="character-reveal">${charName}</div>
      </div>
      <p style="font-size:0.85rem;color:var(--text2);margin-bottom:12px">${won ? getWinMessage(attempts) : ''}</p>
      <div class="result-divider"></div>
      <div class="share-row">
        <button class="share-btn" id="share-btn-classic" onclick="shareResultClassic(${won}, ${attempts})">📋 Texto</button>
        <button class="share-btn" id="share-img-btn-classic" onclick="shareImageClassic(${won}, ${attempts})">📸 Imagen</button>
      </div>
      <div class="countdown-wrap">
        <p class="countdown-label">Próximo personaje en</p>
        <div class="countdown" id="countdown-timer">00:00:00</div>
      </div>
    </div>`;
}

function shareResultClassic(won, attempts) {
  const today   = new Date();
  const dateStr = today.toLocaleDateString('es-ES');
  const grid    = classicResults.map(row => row.join('')).join('\n');
  const status  = won ? `${attempts} intento${attempts !== 1 ? 's' : ''}` : 'Sin adivinar';
  const text    = `ANHQVdle 🎬 #${getDayNumber()} · ${dateStr}\n${status}\n${grid}\nanhqvdle.es`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('share-btn-classic');
    if (!btn) return;
    btn.textContent = '¡Copiado! ✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Texto'; btn.classList.remove('copied'); }, 2000);
  });
}

function shareImageClassic(won, attempts) {
  const CELL = 30, GAP = 3, COLS = 8;
  const rows  = classicResults.length;
  const gridH = rows * (CELL + GAP);
  const W = 380, H = 168 + gridH + 36;

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fondo
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  // Borde dorado
  ctx.strokeStyle = 'rgba(240,192,32,0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  // Logo
  ctx.font = 'bold 40px Impact, "Bebas Neue", sans-serif';
  ctx.fillStyle = '#f0c020';
  ctx.textAlign = 'center';
  ctx.fillText('ANHQVdle', W / 2, 50);

  // Subtítulo
  ctx.font = '13px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(`🎬 Clásico #${getDayNumber()} · ${new Date().toLocaleDateString('es-ES')}`, W / 2, 74);

  // Resultado
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.fillStyle = won ? '#4ade80' : '#f87171';
  ctx.fillText(won ? `✓ ${attempts} intento${attempts !== 1 ? 's' : ''}` : '✗ Sin adivinar', W / 2, 102);

  // Cuadrícula
  const colors = { '🟩': '#16a34a', '🟨': '#f0c020', '🟥': '#dc2626' };
  const gridW  = COLS * CELL + (COLS - 1) * GAP;
  let x0 = (W - gridW) / 2;
  let y  = 124;

  classicResults.forEach(row => {
    let x = x0;
    row.forEach(emoji => {
      ctx.fillStyle = colors[emoji] || '#444';
      ctx.fillRect(x, y, CELL, CELL);
      x += CELL + GAP;
    });
    y += CELL + GAP;
  });

  // URL
  ctx.font = '12px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('anhqvdle.es', W / 2, H - 14);

  canvas.toBlob(blob => {
    if (!blob) return;
    const file = new File([blob], 'anhqvdle-clasico.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'ANHQVdle' }).catch(() => _downloadBlob(blob, 'anhqvdle-clasico.png'));
    } else {
      _downloadBlob(blob, 'anhqvdle-clasico.png');
    }
  }, 'image/png');
}

function _downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ══════════════════════════════════════
   PÉRDIDA — marcar estadística
══════════════════════════════════════ */

// Se llama cuando el usuario hace "?reset" o recarga al día siguiente
// y el estado guardado era done=false. No hay evento explícito de rendición
// en este modo (intentos ilimitados), así que la pérdida solo se registra
// si el usuario abandona (no hay acción de "rendirse" implementada todavía).
// Los stats de victoria se registran siempre en won=true arriba.

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
