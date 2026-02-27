// =====================
// ANHQVdle - app.js
// =====================

const SEED_DATE = "2026-01-01";
const MAX_INTENTOS = 6;

let personajes = [];
let personajeCorrecto = null;

let juegoTerminado = false;
let intentos = [];
let usados = new Set();

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const rows = document.getElementById("rows");

const statusEl = document.getElementById("status");
const counterEl = document.getElementById("counter");
const shareBtn = document.getElementById("shareBtn");

// ---------- Utilidades ----------
function daysBetween(a, b) {
  const ms = 1000 * 60 * 60 * 24;
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((end - start) / ms);
}

function getDayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function obtenerPersonajeDelDia(lista) {
  const inicio = new Date(SEED_DATE);
  const hoy = new Date();
  const diff = daysBetween(inicio, hoy);
  const index = ((diff % lista.length) + lista.length) % lista.length;
  return lista[index];
}

function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ---------- Estado UI ----------
function updateCounter() {
  if (!counterEl) return;
  counterEl.textContent = `Intentos: ${intentos.length}/${MAX_INTENTOS}`;
}

function setStatus(msg) {
  if (!statusEl) return;
  statusEl.textContent = msg;
}

// ---------- Comparación / UI tablero ----------
function cellText(text, cls) {
  const div = document.createElement("div");
  div.className = "cell " + cls;
  div.textContent = text;
  return div;
}

function compareText(a, b) {
  return a === b ? "ok" : "no";
}

function compareNumberClass(a, b) {
  if (a === b) return "ok";
  if (a < b) return "no up";
  return "no down";
}

function addGuessRow(guess) {
  const row = document.createElement("div");
  row.className = "row guess";

  // --- CELDA PERSONAJE (imagen + nombre) ---
  const clsNombre = compareText(guess.nombre, personajeCorrecto.nombre);

  const charCell = document.createElement("div");
  charCell.className = "cell char " + clsNombre;

  const img = document.createElement("img");
  img.className = "avatar";
  img.src = guess.img || "assets/characters/default.png";
  img.alt = guess.nombre;
  img.loading = "lazy";
  img.onerror = () => { img.src = "assets/characters/default.png"; };

  const name = document.createElement("div");
  name.className = "char-name";
  name.textContent = guess.nombre;

  charCell.appendChild(img);
  charCell.appendChild(name);

  row.appendChild(charCell);

  // --- RESTO DE COLUMNAS ---
  row.appendChild(cellText(guess.tipo, compareText(guess.tipo, personajeCorrecto.tipo)));
  row.appendChild(cellText(guess.genero, compareText(guess.genero, personajeCorrecto.genero)));
  row.appendChild(cellText(guess.origen, compareText(guess.origen, personajeCorrecto.origen)));
  row.appendChild(cellText(guess.piso, compareText(guess.piso, personajeCorrecto.piso)));
  row.appendChild(cellText(guess.ocupacion, compareText(guess.ocupacion, personajeCorrecto.ocupacion)));
  row.appendChild(cellText(String(guess.temporada), compareNumberClass(guess.temporada, personajeCorrecto.temporada)));

  rows.appendChild(row);
}

function renderAll() {
  rows.innerHTML = "";
  intentos.forEach(addGuessRow);
  updateCounter();
}

// ---------- Persistencia ----------
function saveState() {
  const key = "anhqvdle_state_" + getDayKey();
  const data = {
    intentos,
    juegoTerminado,
    // opcional: para poder mostrar un mensaje coherente tras recargar
    lastMessage: statusEl ? statusEl.textContent : ""
  };
  localStorage.setItem(key, JSON.stringify(data));
}

function loadState() {
  const key = "anhqvdle_state_" + getDayKey();
  const raw = localStorage.getItem(key);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    intentos = Array.isArray(data.intentos) ? data.intentos : [];
    juegoTerminado = !!data.juegoTerminado;
    usados = new Set(intentos.map(i => i.nombre));
    if (data.lastMessage) setStatus(data.lastMessage);
  } catch {
    // si hay algo corrupto, ignoramos
  }
}

// ---------- Fin de partida ----------
function endGame(msg) {
  juegoTerminado = true;
  searchInput.disabled = true;
  suggestions.innerHTML = "";
  setStatus(msg);
}

// ---------- Autocomplete ----------
function updateSuggestions() {
  const value = normalize(searchInput.value.trim());
  suggestions.innerHTML = "";
  if (!value || juegoTerminado) return;

  const filtrados = personajes
    .filter(p => normalize(p.nombre).includes(value))
    .filter(p => !usados.has(p.nombre))
    .slice(0, 8);

  filtrados.forEach(p => {
    const div = document.createElement("div");
    div.textContent = p.nombre;
    div.onclick = () => seleccionarPersonaje(p);
    suggestions.appendChild(div);
  });
}

searchInput.addEventListener("input", updateSuggestions);

// Enter = si hay 1 sugerencia, selecciona esa
searchInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const first = suggestions.querySelector("div");
  if (first) first.click();
});

// ---------- Juego ----------
function seleccionarPersonaje(personaje) {
  if (juegoTerminado) return;
  if (usados.has(personaje.nombre)) return;

  intentos.push(personaje);
  usados.add(personaje.nombre);

  addGuessRow(personaje);
  updateCounter();

  suggestions.innerHTML = "";
  searchInput.value = "";

  // Guardamos tras el intento
  saveState();

  if (personaje.nombre === personajeCorrecto.nombre) {
    endGame("🎉 ¡Correcto! Has adivinado el personaje del día.");
    saveState();
    return;
  }

  if (intentos.length >= MAX_INTENTOS) {
    endGame(`😬 Se acabaron los intentos. Era: ${personajeCorrecto.nombre}`);
    saveState();
    return;
  }

  setStatus("🔎 Sigue probando...");
  saveState();
}

// ---------- Compartir ----------
function buildShareText() {
  const lines = intentos.map(g => {
    const cells = [];

    cells.push(g.nombre === personajeCorrecto.nombre ? "🟩" : "🟥");
    cells.push(g.tipo === personajeCorrecto.tipo ? "🟩" : "🟥");
    cells.push(g.genero === personajeCorrecto.genero ? "🟩" : "🟥");
    cells.push(g.origen === personajeCorrecto.origen ? "🟩" : "🟥");
    cells.push(g.piso === personajeCorrecto.piso ? "🟩" : "🟥");
    cells.push(g.ocupacion === personajeCorrecto.ocupacion ? "🟩" : "🟥");

    if (g.temporada === personajeCorrecto.temporada) cells.push("🟩");
    else if (g.temporada < personajeCorrecto.temporada) cells.push("⬆️");
    else cells.push("⬇️");

    return cells.join("");
  });

  const dayKey = getDayKey();
  const score = juegoTerminado ? intentos.length : "?";
  const header = `ANHQVdle ${dayKey} — ${score}/${MAX_INTENTOS}`;
  return [header, ...lines].join("\n");
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const text = buildShareText();

    try {
      await navigator.clipboard.writeText(text);
      setStatus("📋 Resultado copiado al portapapeles. ¡Pégalo donde quieras!");
    } catch {
      // fallback
      prompt("Copia el resultado:", text);
    }

    saveState();
  });
}

// ---------- Inicio ----------
async function init() {
  const res = await fetch("data/personajes.json");
  personajes = await res.json();

  personajeCorrecto = obtenerPersonajeDelDia(personajes);

  loadState();
  renderAll();

  if (!juegoTerminado && (!statusEl || !statusEl.textContent)) {
    setStatus("🕵️ Escribe un personaje para empezar.");
  }

  if (juegoTerminado) {
    searchInput.disabled = true;
    if (!statusEl || !statusEl.textContent) {
      setStatus("✅ Ya terminaste el juego de hoy. Vuelve mañana.");
    }
  }

  updateCounter();
}

init();