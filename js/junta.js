/* ================================================
   ANHQVdle — Junta de vecinos (encuesta diaria)
   Una pregunta al día, la misma para todos. Votas y ves los porcentajes.
   Votos: junta/{día}/o{opción} en Firebase (contadores que solo suman +1).
   Tu voto: anhqvdle_junta_<YYYYMMDD> en localStorage.
   No cuenta para la racha ni la liga: votar no tiene mérito.
   ================================================ */

const MODE_KEY_JUNTA = 'junta';
let juntaDay = 0, juntaPoll = null, juntaVotes = {}, juntaMine = null, juntaBusy = false;

function getJuntaPoll(day) {
  const L = JUNTA.length;
  return JUNTA[(((day - JUNTA_FIRST_DAY) % L) + L) % L];
}

// ── Opciones: personaje (foto), pareja (dos fotos) o texto ──
function _juntaPhoto(name, cls) {
  return `<img class="${cls}" src="img/personajes/${toSlug(name)}.webp" alt="${name}"
    onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.visibility='hidden'}">`;
}
function _juntaOption(opt) {
  const isChar = n => CHARACTERS.some(c => c.name === n);
  const parts = opt.split(' + ');
  if (parts.length > 1 && parts.every(isChar)) {
    return { label: parts.map(n => n.split(' ')[0]).join(' y '), media: parts.map(n => _juntaPhoto(n, 'junta-av')).join(''), pair: true };
  }
  if (isChar(opt)) return { label: opt, media: _juntaPhoto(opt, 'junta-av') };
  return { label: opt, media: '', text: true };
}

// ── Pintar la pregunta ──
function initJunta() {
  juntaDay  = getDayNumber();
  juntaPoll = getJuntaPoll(juntaDay);
  const saved = loadDailyState(MODE_KEY_JUNTA);
  juntaMine = saved && Number.isInteger(saved.vote) ? saved.vote : null;

  document.getElementById('junta-num').textContent = `Junta nº ${juntaDay - JUNTA_FIRST_DAY + 1}`;
  document.getElementById('junta-question').textContent = juntaPoll.q;
  document.getElementById('junta-options').innerHTML = juntaPoll.opts.map((opt, i) => {
    const o = _juntaOption(opt);
    return `<button class="junta-opt${o.text ? ' is-text' : ''}${o.pair ? ' is-pair' : ''}" data-i="${i}" onclick="voteJunta(${i})">
      ${o.media ? `<span class="junta-opt-media">${o.media}</span>` : ''}
      <span class="junta-opt-name">${o.label}</span>
    </button>`;
  }).join('');

  startCountdown('countdown-timer-junta');
  renderJunta();

  AuthModule.onReady(function () {
    const db = AuthModule.getDb();
    if (!db) { _juntaError('La junta no está disponible ahora mismo.'); return; }
    // Votos en directo: el panel se actualiza solo cuando vota otra gente
    db.ref('junta/' + juntaDay).on('value', snap => { juntaVotes = snap.val() || {}; renderJunta(); },
      () => _juntaError('No se pudieron cargar los votos.'));
    _loadYesterday(db);
  });
}

function _juntaCounts() {
  const counts = juntaPoll.opts.map((_, i) => +juntaVotes['o' + i] || 0);
  return { counts, total: counts.reduce((a, b) => a + b, 0) };
}

function renderJunta() {
  const { counts, total } = _juntaCounts();
  const voted = juntaMine !== null;

  document.querySelectorAll('.junta-opt').forEach(b => {
    const i = +b.dataset.i;
    b.disabled = voted || juntaBusy;
    b.classList.toggle('mine', voted && i === juntaMine);
    b.classList.toggle('faded', voted && i !== juntaMine);
  });
  document.getElementById('junta-hint').textContent = voted
    ? '✅ Ya has votado hoy. Vuelve mañana para la siguiente pregunta.'
    : 'Toca una opción para votar. Solo puedes votar una vez.';

  const panel = document.getElementById('junta-results');
  const people = `${total} vecino${total !== 1 ? 's han' : ' ha'} votado`;
  if (!voted) {
    panel.innerHTML = `<div class="junta-locked">
      <div class="junta-lock-icon">🔒</div>
      <p><strong>Vota para ver qué opina la comunidad</strong></p>
      <p class="junta-total">${people}</p>
      <div class="junta-ghost"><span></span><span></span><span></span></div>
    </div>`;
    return;
  }

  const max = Math.max(...counts);
  const rows = juntaPoll.opts.map((opt, i) => {
    const o = _juntaOption(opt);
    const pct = total ? Math.round(counts[i] / total * 100) : 0;
    const cls = (i === juntaMine ? ' mine' : '') + (counts[i] === max && max > 0 ? ' winner' : '');
    return `<div class="junta-row${cls}">
      <div class="junta-row-head">
        <span class="junta-row-label">${o.media ? `<span class="junta-row-media">${o.media}</span>` : ''}${o.label}${i === juntaMine ? ' <em>· tu voto</em>' : ''}</span>
        <span class="junta-row-pct">${pct}%</span>
      </div>
      <div class="junta-bar"><div class="junta-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
  const mine = total ? Math.round(counts[juntaMine] / total * 100) : 0;
  panel.innerHTML = `<h3 class="junta-panel-title">Resultados en directo</h3>
    ${rows}
    <p class="junta-total">${people}</p>
    <p class="junta-mine-pct">El <strong>${mine}%</strong> piensa como tú</p>
    <button class="share-btn" onclick="shareJunta()">📋 Compartir</button>`;
}

// ── Votar ──
function voteJunta(i) {
  if (juntaMine !== null || juntaBusy) return;
  const db = AuthModule.getDb();
  if (!db) { _juntaError('No hay conexión con la junta. Inténtalo en un momento.'); return; }
  juntaBusy = true;
  renderJunta();
  db.ref(`junta/${juntaDay}/o${i}`).transaction(n => (n || 0) + 1).then(res => {
    juntaBusy = false;
    if (!res.committed) throw new Error('no committed');
    juntaMine = i;
    saveDailyState(MODE_KEY_JUNTA, { vote: i, done: true });
    renderJunta();
    // En móvil los resultados quedan debajo: bajar hasta ellos
    if (window.innerWidth < 860) {
      document.getElementById('junta-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }).catch(() => {
    juntaBusy = false;
    renderJunta();
    _juntaError('No se pudo guardar tu voto. Inténtalo de nuevo.');
  });
}

function _juntaError(msg) {
  const el = document.getElementById('junta-hint');
  if (el) { el.textContent = '⚠️ ' + msg; el.classList.add('is-error'); }
}

// ── Lo que se votó ayer ──
function _loadYesterday(db) {
  const day = juntaDay - 1;
  if (day < JUNTA_FIRST_DAY) return;
  const poll = getJuntaPoll(day);
  db.ref('junta/' + day).once('value').then(snap => {
    const v = snap.val() || {};
    const counts = poll.opts.map((_, i) => +v['o' + i] || 0);
    const total = counts.reduce((a, b) => a + b, 0);
    if (!total) return;
    const best = counts.indexOf(Math.max(...counts));
    const o = _juntaOption(poll.opts[best]);
    document.getElementById('junta-yesterday').innerHTML = `<div class="junta-yesterday">
      <span class="junta-y-kicker">Ayer en la junta</span>
      <span class="junta-y-q">${poll.q}</span>
      <span class="junta-y-a">${o.media ? `<span class="junta-row-media">${o.media}</span>` : ''}Ganó <strong>${o.label}</strong> con el ${Math.round(counts[best] / total * 100)}% (${total} votos)</span>
    </div>`;
  }).catch(() => {});
}

function shareJunta() {
  const { counts, total } = _juntaCounts();
  const o = _juntaOption(juntaPoll.opts[juntaMine]);
  const pct = total ? Math.round(counts[juntaMine] / total * 100) : 0;
  const text = `🗳️ Junta de vecinos de ANHQVdle\n${juntaPoll.q}\nYo voté: ${o.label} (el ${pct}% piensa como yo)\n¿Y tú? anhqvdle.es/junta.html`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('#junta-results .share-btn');
    if (btn) { btn.textContent = '✓ Copiado'; setTimeout(() => (btn.textContent = '📋 Compartir'), 2000); }
  }).catch(() => {});
}

cleanOldStorage();
initJunta();
