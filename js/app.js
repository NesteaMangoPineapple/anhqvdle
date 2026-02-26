const personajes = [
  {
    nombre: "Juan Cuesta",
    tipo: "Principal",
    genero: "Masculino",
    origen: "España",
    piso: "3ºB",
    ocupacion: "Profesor",
    temporada: 5
  },
  {
    nombre: "Emilio",
    tipo: "Principal",
    genero: "Masculino",
    origen: "España",
    piso: "Portería",
    ocupacion: "Portero",
    temporada: 5
  },
  {
    nombre: "Belén",
    tipo: "Principal",
    genero: "Femenino",
    origen: "España",
    piso: "3ºA",
    ocupacion: "Dependienta",
    temporada: 4
  }
];

function obtenerPersonajeDelDia() {
  const fechaInicio = new Date("2026-01-01");
  const hoy = new Date();
  const diferencia = Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24));
  const index = diferencia % personajes.length;
  return personajes[index];
}

const personajeCorrecto = obtenerPersonajeDelDia();

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const rows = document.getElementById("rows");

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  suggestions.innerHTML = "";

  if (!value) return;

  const filtrados = personajes.filter(p =>
    p.nombre.toLowerCase().includes(value)
  );

  filtrados.forEach(p => {
    const div = document.createElement("div");
    div.textContent = p.nombre;
    div.onclick = () => seleccionarPersonaje(p);
    suggestions.appendChild(div);
  });
});

function seleccionarPersonaje(personaje) {
  addGuessRow(personaje);
  suggestions.innerHTML = "";
  searchInput.value = "";
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
  row.appendChild(cellText(
    String(guess.temporada),
    compareNumberClass(guess.temporada, personajeCorrecto.temporada)
  ));

  rows.appendChild(row);
}

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
