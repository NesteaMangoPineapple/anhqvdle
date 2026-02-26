const personajes = [
  { nombre: "Juan Cuesta", rol: "Presidente" },
  { nombre: "Emilio", rol: "Portero" },
  { nombre: "Belén", rol: "Vecina" }
];

const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");

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
  alert("Has seleccionado: " + personaje.nombre);
}
