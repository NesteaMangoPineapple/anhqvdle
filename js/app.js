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

// --- Utilidades ---
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

// --- Comparación / UI ---
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
  row.className = "row";

  row.appendChild(cellText(guess.nombre, compareText(guess.nombre, personajeCorrecto.nombre)));
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
}

function endGame(msg) {
  juegoTerminado = true;
  searchInput.disabled = true;
  suggestions.innerHTML = "";
  setTimeout(() => alert(msg), 50);
}

// --- Persistencia ---
function saveState() {
  const key = "anhqvdle_state_" + getDayKey();
  const data = {
    intentos,
    juegoTerminado
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
  } catch {
    // si hay algo corrupto, ignoramos
  }
}

// --- Autocomplete ---
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

// --- Juego ---
function seleccionarPersonaje(personaje) {
  if (juegoTerminado) return;
  if (usados.has(personaje.nombre)) return;

  intentos.push(personaje);
  usados.add(personaje.nombre);

  addGuessRow(personaje);
  saveState();

  suggestions.innerHTML = "";
  searchInput.value = "";

  if (personaje.nombre === personajeCorrecto.nombre) {
    endGame("🎉 ¡Correcto! Has adivinado el personaje del día.");
    saveState();
    return;
  }

  if (intentos.length >= MAX_INTENTOS) {
    endGame(`😬 Se acabaron los intentos. Era: ${personajeCorrecto.nombre}`);
    saveState();
  }
}

// --- Inicio ---
async function init() {
  const res = await fetch("data/personajes.json");
  personajes = await res.json();

  personajeCorrecto = obtenerPersonajeDelDia(personajes);

  loadState();
  renderAll();

  if (juegoTerminado) {
    searchInput.disabled = true;
  }
}

init();