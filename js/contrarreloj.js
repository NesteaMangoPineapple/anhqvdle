/* ================================================
   ANHQVdle — Contrarreloj
   30 segundos para reconocer todas las fotos posibles (4 opciones).
   Acierto = +1 · fallo = −3 segundos. Sin límite de partidas.
   Récord personal en localStorage; récords del día en crono/{YYYY-MM-DD}/{uid}
   (solo con sesión; solo se guarda si mejora tu marca de hoy).
   ================================================ */

const CRONO_SECONDS = 30;
const CRONO_PENALTY = 3;
const CRONO_KEY     = 'anhqvdle_crono'; // {best, bestDate, played}

let cronoPool = [], cronoDeck = [], cronoCurrent = null, cronoOptions = [];
let cronoScore = 0, cronoMisses = 0, cronoEndAt = 0, cronoRunning = false, cronoLocked = false, cronoRaf = 0;

function _cronoLocal() {
  try { return Object.assign({ best: 0, played: 0 }, JSON.parse(localStorage.getItem(CRONO_KEY) || '{}')); }
  catch (e) { return { best: 0, played: 0 }; }
}
function _cronoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function _shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ── Precarga de fotos: al empezar tienen que salir al instante ──
function _loadPhoto(name) {
  const slug = toSlug(name);
  const tryExt = exts => new Promise(resolve => {
    if (!exts.length) return resolve(null);
    const img = new Image();
    img.onload  = () => resolve(img.src);
    img.onerror = () => tryExt(exts.slice(1)).then(resolve);
    img.src = `img/personajes/${slug}.${exts[0]}`;
  });
  return tryExt(['webp', 'jpg', 'jpeg']);
}

function initCrono() {
  const btn = document.getElementById('crono-start-btn');
  const chars = dailyCharacters();
  let loaded = 0;
  _renderBest();
  Promise.all(chars.map(c => _loadPhoto(c.name).then(url => {
    loaded++;
    btn.textContent = `Cargando fotos… ${Math.round(loaded / chars.length * 100)}%`;
    return url ? { name: c.name, gender: c.gender, url } : null;
  }))).then(list => {
    cronoPool = list.filter(Boolean);
    btn.disabled = false;
    btn.textContent = '▶ Empezar';
  });
  document.addEventListener('keydown', e => {
    if (!cronoRunning) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) answerCrono(n - 1);
  });
  _loadBoard();
}

function _renderBest() {
  const s = _cronoLocal();
  document.getElementById('crono-best').innerHTML = s.best
    ? `Tu récord: <strong>${s.best}</strong> vecino${s.best !== 1 ? 's' : ''}`
    : 'Aún no tienes récord. ¡Estrénalo!';
}

// ── Partida ──
function startCrono() {
  if (!cronoPool.length) return;
  cronoScore = 0; cronoMisses = 0; cronoDeck = [];
  cronoEndAt = performance.now() + CRONO_SECONDS * 1000;
  cronoRunning = true;
  document.getElementById('crono-start').hidden = true;
  document.getElementById('crono-result').innerHTML = '';
  document.getElementById('crono-game').hidden = false;
  document.getElementById('crono-score').textContent = '0';
  _nextCrono();
  cancelAnimationFrame(cronoRaf);
  cronoRaf = requestAnimationFrame(_tick);
}

function _tick() {
  if (!cronoRunning) return;
  const left = Math.max(0, cronoEndAt - performance.now());
  const t = document.getElementById('crono-time');
  t.textContent = left < 10000 ? (left / 1000).toFixed(1) : Math.ceil(left / 1000);
  t.classList.toggle('hurry', left < 10000);
  document.getElementById('crono-bar-fill').style.width = (left / (CRONO_SECONDS * 1000) * 100) + '%';
  if (left <= 0) { _finishCrono(); return; }
  cronoRaf = requestAnimationFrame(_tick);
}

function _nextCrono() {
  if (!cronoDeck.length) cronoDeck = _shuffle(cronoPool);
  cronoCurrent = cronoDeck.pop();
  // Distractores del mismo género si se puede (si no, es demasiado fácil)
  const same  = _shuffle(cronoPool.filter(c => c.name !== cronoCurrent.name && c.gender === cronoCurrent.gender));
  const other = _shuffle(cronoPool.filter(c => c.name !== cronoCurrent.name && c.gender !== cronoCurrent.gender));
  cronoOptions = _shuffle([cronoCurrent, ...same.concat(other).slice(0, 3)]);

  const photo = document.getElementById('crono-photo');
  photo.src = cronoCurrent.url;
  photo.alt = '¿Quién es?';
  document.getElementById('crono-options').innerHTML = cronoOptions.map((c, i) =>
    `<button class="crono-opt" onclick="answerCrono(${i})"><span class="crono-key">${i + 1}</span>${c.name}</button>`).join('');
  cronoLocked = false;
}

function answerCrono(i) {
  if (!cronoRunning || cronoLocked) return;
  cronoLocked = true;
  const btns = document.querySelectorAll('.crono-opt');
  const ok = cronoOptions[i].name === cronoCurrent.name;
  if (ok) {
    cronoScore++;
    btns[i].classList.add('ok');
    document.getElementById('crono-score').textContent = cronoScore;
    _float('+1', 'ok');
    setTimeout(() => cronoRunning && _nextCrono(), 220);
  } else {
    cronoMisses++;
    cronoEndAt -= CRONO_PENALTY * 1000;
    btns[i].classList.add('ko');
    btns[cronoOptions.findIndex(c => c.name === cronoCurrent.name)].classList.add('ok');
    _float('−' + CRONO_PENALTY + ' s', 'ko');
    setTimeout(() => cronoRunning && _nextCrono(), 650);
  }
}

// "+1" / "−3 s" que sube y se desvanece sobre la foto
function _float(text, cls) {
  const el = document.createElement('span');
  el.className = 'crono-float ' + cls;
  el.textContent = text;
  document.getElementById('crono-photo-wrap').appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function _finishCrono() {
  cronoRunning = false;
  cancelAnimationFrame(cronoRaf);
  document.getElementById('crono-game').hidden = true;

  const s = _cronoLocal();
  const isRecord = cronoScore > s.best;
  s.played++;
  if (isRecord) { s.best = cronoScore; s.bestDate = _cronoToday(); }
  try { localStorage.setItem(CRONO_KEY, JSON.stringify(s)); } catch (e) {}

  const msg = cronoScore >= 20 ? '¡Eres un vecino de toda la vida!'
    : cronoScore >= 12 ? '¡Muy bien! Te conoces el edificio.'
    : cronoScore >= 6  ? 'No está mal, pero aún te queda portal por barrer.'
    : '¿Seguro que has visto la serie? 😅';

  document.getElementById('crono-result').innerHTML = `
    <div class="result-banner result-banner-quote">
      <p class="result-day-num">⏱️ ${CRONO_SECONDS} segundos</p>
      <h2>${cronoScore} vecino${cronoScore !== 1 ? 's' : ''}</h2>
      <p class="result-sub">${isRecord && cronoScore > 0 ? '🏆 <strong>¡Nuevo récord!</strong>' : `Tu récord: <strong>${s.best}</strong>`}
        · ${cronoMisses} fallo${cronoMisses !== 1 ? 's' : ''}</p>
      <p style="font-size:0.9rem;color:var(--text2);margin:6px 0 14px">${msg}</p>
      <div class="share-row">
        <button class="share-btn crono-again" onclick="startCrono()">🔁 Otra vez</button>
        <button class="share-btn" id="crono-share-btn" onclick="shareCrono()">📋 Compartir</button>
      </div>
    </div>`;
  if (isRecord && cronoScore > 0) celebrateWin();

  // El panel de inicio se queda oculto: el resultado ya trae "Otra vez"
  _renderBest();
  _submitScore(cronoScore);
}

function shareCrono() {
  const text = `⏱️ ANHQVdle Contrarreloj\nHe reconocido a ${cronoScore} vecino${cronoScore !== 1 ? 's' : ''} de Aquí No Hay Quien Viva en ${CRONO_SECONDS} segundos.\n¿Me superas? anhqvdle.es/contrarreloj.html`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('crono-share-btn');
    if (btn) { btn.textContent = '✓ Copiado'; setTimeout(() => (btn.textContent = '📋 Compartir'), 2000); }
  }).catch(() => {});
}

// ── Récords del día (Firebase) ──
function _submitScore(score) {
  if (!score) return;
  AuthModule.onReady(user => {
    const db = AuthModule.getDb();
    if (!user || !db) return;
    db.ref(`crono/${_cronoToday()}/${user.uid}`).transaction(cur => {
      if (cur && (cur.score || 0) >= score) return; // no mejora tu marca de hoy: no se toca
      return {
        name:    user.displayName || (user.email || '').split('@')[0] || 'Vecino',
        photo:   user.photoURL || '',
        score:   score,
        updated: Date.now()
      };
    }).then(() => _loadBoard()).catch(() => {});
  });
}

function _loadBoard() {
  const el = document.getElementById('crono-board');
  AuthModule.onReady(user => {
    const db = AuthModule.getDb();
    if (!db) return;
    db.ref('crono/' + _cronoToday()).once('value').then(snap => {
      const rows = Object.entries(snap.val() || {}).map(([uid, r]) => Object.assign({ uid }, r))
        .sort((a, b) => (+b.score || 0) - (+a.score || 0) || (+a.updated || 0) - (+b.updated || 0));
      const top = rows.slice(0, 10);
      const myPos = user ? rows.findIndex(r => r.uid === user.uid) : -1;
      const medal = i => ['🥇', '🥈', '🥉'][i] || (i + 1);
      let html = '<h2 class="crono-board-title">🏆 Récords de hoy</h2>';
      if (!top.length) {
        html += '<p class="crono-board-empty">Nadie ha marcado récord hoy. ¡Sé el primero!</p>';
      } else {
        html += '<ol class="crono-board-list">' + top.map((r, i) => {
          const ph = safePhotoUrl(r.photo);
          return `<li class="${user && r.uid === user.uid ? 'me' : ''}">
            <span class="crono-board-pos">${medal(i)}</span>
            ${ph ? `<img src="${ph}" alt="" class="crono-board-av" onerror="this.style.visibility='hidden'">` : `<span class="crono-board-av">${escapeHtml((r.name || '?')[0].toUpperCase())}</span>`}
            <span class="crono-board-name">${escapeHtml(r.name || 'Vecino')}</span>
            <span class="crono-board-score">${+r.score || 0}</span></li>`;
        }).join('') + '</ol>';
        if (myPos >= 10) html += `<p class="crono-board-empty">Tú vas <strong>#${myPos + 1}</strong> con ${+rows[myPos].score || 0}.</p>`;
      }
      if (!user) html += '<p class="crono-board-empty">👤 <a href="#" onclick="AuthModule.showLogin();return false">Inicia sesión</a> para entrar en los récords del día.</p>';
      el.innerHTML = html;
    }).catch(() => { el.innerHTML = ''; });
  });
}

initCrono();
