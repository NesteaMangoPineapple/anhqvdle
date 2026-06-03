/* ================================================
   ANHQVdle — Sistema de personaje/frase del día
   Misma semilla por fecha = mismo resultado para todos
   ================================================ */

/**
 * Genera un índice determinista a partir de la fecha de hoy.
 */
function getDailyIndex(arrayLength) {
  const now  = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return (Math.imul(seed, 2654435761) >>> 0) % arrayLength;
}

/**
 * Igual que getDailyIndex pero para ayer.
 */
function getYesterdayIndex(arrayLength) {
  const d    = new Date();
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
  const t = new Date();
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
  const now     = new Date();
  const shuffled = _seededShuffle(QUOTES, now.getFullYear() * 31337);
  return shuffled[_localDayOfYear(now) % shuffled.length];
}

function getYesterdayQuote() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const shuffled = _seededShuffle(QUOTES, d.getFullYear() * 31337);
  return shuffled[_localDayOfYear(d) % shuffled.length];
}

/* ══════════════════════════════════════
   localStorage
══════════════════════════════════════ */

function getTodayKey(mode) {
  const now = new Date();
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
}

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
