/* ================================================
   ANHQVdle — Sistema de personaje del día
   Misma semilla por fecha = mismo personaje para todos
   ================================================ */

/**
 * Genera un índice determinista a partir de la fecha de hoy.
 * El mismo día, todos los jugadores obtendrán el mismo personaje.
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
 * Devuelve la clave de localStorage para hoy (por modo).
 * Ejemplo: "anhqvdle_classic_20260323"
 */
function getTodayKey(mode) {
  const now = new Date();
  const d   = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  return `anhqvdle_${mode}_${d}`;
}

/**
 * Carga el estado guardado de hoy para un modo.
 * Devuelve null si no hay estado guardado.
 */
function loadDailyState(mode) {
  try {
    const raw = localStorage.getItem(getTodayKey(mode));
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

/**
 * Guarda el estado actual de un modo para hoy.
 */
function saveDailyState(mode, state) {
  try {
    localStorage.setItem(getTodayKey(mode), JSON.stringify(state));
  } catch(e) {}
}

/**
 * Devuelve cuánto tiempo falta para la medianoche (en ms).
 * Útil para mostrar el contador de cuenta atrás.
 */
function msUntilMidnight() {
  const now  = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next - now;
}

/**
 * Formatea milisegundos como HH:MM:SS
 */
function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
