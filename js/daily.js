/* ================================================
   ANHQVdle — Sistema de personaje/frase del día
   Misma semilla por fecha = mismo resultado para todos
   ================================================ */

/* ══════════════════════════════════════
   FECHA DEL JUEGO + MODO PRÁCTICA
   ?dia=N permite jugar uno de los últimos PAST_DAYS_PLAYABLE retos.
   Esos días son práctica: no cuentan para stats, racha ni ranking.
══════════════════════════════════════ */

const PAST_DAYS_PLAYABLE = 5;
let _gameDateOffset = 0; // 0 = hoy, -1 = ayer… (solo -PAST_DAYS_PLAYABLE..-1)

(function _readPracticeDay() {
  try {
    const m = location.search.match(/[?&]dia=(\d+)/);
    if (!m) return;
    const offset = parseInt(m[1], 10) - getDayNumber(); // getDayNumber aún usa hoy
    if (offset < 0 && offset >= -PAST_DAYS_PLAYABLE) _gameDateOffset = offset;
    else history.replaceState(null, '', location.pathname); // día no permitido → reto de hoy
  } catch (e) {}
})();

/** Fecha del reto que se está jugando (hoy, o el día pasado elegido). Siempre un objeto nuevo. */
function gameDate() {
  const d = new Date();
  if (_gameDateOffset) d.setDate(d.getDate() + _gameDateOffset);
  return d;
}

/** true si se está jugando un día pasado (modo práctica) */
function isPracticeMode() {
  return _gameDateOffset !== 0;
}

/**
 * Personajes que entran en el sorteo de un día.
 * Un personaje con `since: 'AAAA-MM-DD'` solo cuenta a partir de esa fecha, así
 * añadir personajes no cambia el reto de hoy ni el de días pasados.
 * offsetDays: 0 = día del juego, -1 = el anterior.
 */
function dailyCharacters(offsetDays = 0) {
  const d = gameDate();
  d.setDate(d.getDate() + offsetDays);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return CHARACTERS.filter(c => !c.since || c.since <= iso);
}

/**
 * Genera un índice determinista a partir de la fecha del juego.
 */
function getDailyIndex(arrayLength) {
  const now  = gameDate();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return (Math.imul(seed, 2654435761) >>> 0) % arrayLength;
}

/**
 * Igual que getDailyIndex pero para ayer.
 */
function getYesterdayIndex(arrayLength) {
  const d    = gameDate();
  d.setDate(d.getDate() - 1);
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return (Math.imul(seed, 2654435761) >>> 0) % arrayLength;
}

/**
 * Días transcurridos desde el lanzamiento (2026-03-24).
 * Útil para mostrar "#X" en los resultados.
 */
function getDayNumber() {
  function _absDay(y, m, d) {
    const leap = (y%4===0&&y%100!==0)||y%400===0;
    const dim  = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
    let n = y*365 + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400);
    for (let i = 0; i < m; i++) n += dim[i];
    return n + d;
  }
  const t = (typeof _gameDateOffset !== 'undefined') ? gameDate() : new Date();
  const launchDay = _absDay(2026, 2, 24); // 24 mar 2026
  const todayDay  = _absDay(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.max(1, todayDay - launchDay + 1);
}

/* ══════════════════════════════════════
   FRASES — distribución equitativa
   Baraja QUOTES con semilla anual para
   que cada personaje aparezca sin sesgo.
══════════════════════════════════════ */

function _seededShuffle(arr, seed) {
  const a = arr.slice();
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function _localDayOfYear(date) {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-11
  const d = date.getDate();  // 1-31
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const dim  = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let total = 0;
  for (let i = 0; i < m; i++) total += dim[i];
  return total + d - 1; // 0-indexed desde Jan 1
}

function getDailyQuote() {
  const now     = gameDate();
  const shuffled = _seededShuffle(QUOTES, now.getFullYear() * 31337);
  return shuffled[_localDayOfYear(now) % shuffled.length];
}

function getYesterdayQuote() {
  const d = gameDate();
  d.setDate(d.getDate() - 1);
  const shuffled = _seededShuffle(QUOTES, d.getFullYear() * 31337);
  return shuffled[_localDayOfYear(d) % shuffled.length];
}

/* ══════════════════════════════════════
   localStorage
══════════════════════════════════════ */

function getTodayKey(mode) {
  const now = gameDate();
  const d   = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  return `anhqvdle_${mode}_${d}`;
}

function loadDailyState(mode) {
  try {
    const raw = localStorage.getItem(getTodayKey(mode));
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function saveDailyState(mode, state) {
  try {
    localStorage.setItem(getTodayKey(mode), JSON.stringify(state));
  } catch(e) {}
  if (state && state.done && !isPracticeMode()) _saveDailyToCloud(mode, state);
}

/* ══════════════════════════════════════
   RETO TERMINADO EN OTRO DISPOSITIVO
   El estado del día vive en localStorage, así que en otro móvil se podía
   volver a jugar el mismo reto. Con sesión iniciada, al terminar se guarda
   también en users/{uid}/daily/{modo} = {date, state} (solo el último día,
   no se acumula). Al abrir un modo, si la cuenta ya lo tiene terminado hoy
   y este navegador no, se copia aquí y se recarga: el modo lo pinta como hecho.
══════════════════════════════════════ */

const DAILY_PAGE_MODES = {
  'clasico.html': 'classic', 'frases.html': 'quote', 'impostor.html': 'impostor',
  'conexiones.html': 'conexiones', 'pixelada.html': 'pixelada',
};

function _todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function _saveDailyToCloud(mode, state) {
  if (typeof AuthModule === 'undefined' || !DAILY_PAGE_MODES_LIST.includes(mode)) return;
  AuthModule.onReady(function (user) {
    const db = AuthModule.getDb();
    if (!user || !db) return;
    db.ref('users/' + user.uid + '/daily/' + mode).set({ date: _todayYMD(), state: state }).catch(function () {});
  });
}
const DAILY_PAGE_MODES_LIST = Object.values(DAILY_PAGE_MODES);

/**
 * Copia a localStorage los retos de HOY que la cuenta tiene terminados y este
 * navegador no. Devuelve los modos copiados.
 */
function _applyCloudDaily(remote) {
  const today = _todayYMD(), copied = [];
  Object.keys(remote || {}).forEach(function (mode) {
    const r = remote[mode];
    if (!DAILY_PAGE_MODES_LIST.includes(mode) || !r || r.date !== today || !r.state || !r.state.done) return;
    const key = 'anhqvdle_' + mode + '_' + today;
    let local = null;
    try { local = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    if (local && local.done) return; // aquí también está terminado: nada que hacer
    try { localStorage.setItem(key, JSON.stringify(r.state)); copied.push(mode); } catch (e) {}
  });
  return copied;
}

(function _syncDailyFromCloud() {
  if (typeof AuthModule === 'undefined' || isPracticeMode()) return;
  const pageMode = DAILY_PAGE_MODES[location.pathname.split('/').pop()];
  AuthModule.onReady(function (user) {
    const db = AuthModule.getDb();
    if (!user || !db) return;
    db.ref('users/' + user.uid + '/daily').once('value').then(function (snap) {
      const copied = _applyCloudDaily(snap.val());
      if (!pageMode || copied.indexOf(pageMode) === -1) return;
      // Una sola recarga por modo y día, por si algo fallara (nunca en bucle)
      const flag = 'anhqvdle_cloud_reload_' + pageMode + '_' + _todayYMD();
      try { if (sessionStorage.getItem(flag)) return; sessionStorage.setItem(flag, '1'); } catch (e) { return; }
      location.reload();
    }).catch(function () {});
  });
}());

/**
 * Elimina entradas de juego de más de 7 días para no acumular basura.
 * Preserva stats y preferencias.
 */
function cleanOldStorage() {
  const cutoff = Date.now() - 7 * 86400000;
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('anhqvdle_') &&
                   !k.startsWith('anhqvdle_stats_') &&
                   !k.startsWith('anhqvdle_tutorial') &&
                   k !== 'anhqvdle_cb' &&
                   k !== 'anhqvdle_kofi_shown')
      .forEach(k => {
        const match = k.match(/(\d{8})$/);
        if (match) {
          const d = match[1];
          const date = new Date(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`);
          if (date.getTime() < cutoff) localStorage.removeItem(k);
        }
      });
  } catch(e) {}
}

/* ══════════════════════════════════════
   TIEMPO
══════════════════════════════════════ */

function msUntilMidnight() {
  const now  = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next - now;
}

function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
