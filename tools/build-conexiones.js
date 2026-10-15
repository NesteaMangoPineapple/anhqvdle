/* ================================================
   ANHQVdle — Generador de puzzles de Conexiones

   Uso:  node tools/build-conexiones.js

   Genera data/conexiones.js con puzzles SIN AMBIGÜEDAD: cada categoría es una
   regla comprobable con data/characters.js y cada uno de los 12 personajes
   cumple exactamente UNA de las tres categorías del puzzle. Así siempre se
   puede resolver razonando (a diferencia de los 8 puzzles escritos a mano,
   donde a veces 7 personajes encajaban en "Vivieron en el 3º B").

   Es determinista (semilla fija): regenerar con los mismos datos da el mismo
   archivo. Si cambian las fichas, revisa el diff antes de publicar, porque
   cambia el puzzle de días futuros.
   ================================================ */

const fs   = require('fs');
const path = require('path');
const { ROOT, loadData } = require('./lib/layout');

const CHARACTERS = loadData('data/characters.js', 'CHARACTERS');
const N_PUZZLES  = 120;   // ~4 meses sin repetir
const SEED       = 20261016;

/* ── Categorías: { id, type, label, fit } ── */
const occ = (c, w) => c.occupations.some(o => o.toLowerCase().includes(w));
const realFloors = c => c.floors.filter(f => f !== 'Visita');
const CATS = [];
const add = (id, type, label, fit) => CATS.push({ id, type, label, fit });

['1º A', '1º B', '2º A', '2º B', '3º A', '3º B'].forEach(f =>
  add('piso-' + f, 'piso', `Vivieron en el ${f}`, c => c.floors.includes(f)));
add('piso-atico',    'piso', 'Vivieron en el ático',    c => c.floors.includes('Ático'));
add('piso-porteria', 'piso', 'Vivieron en la portería', c => c.floors.includes('Portería'));
add('visita',        'piso', 'Solo aparecen de visita', c => c.floors.every(f => f === 'Visita'));
add('varios-pisos',  'piso', 'Vivieron en tres pisos o más', c => realFloors(c).length >= 3);

[1, 2, 3, 4, 5].forEach(t =>
  add('debut-' + t, 'temporada', `Debutan en la T${t}`, c => c.seasons[0] === t));
add('una-temp',   'temporada', 'Solo salen en una temporada', c => c.seasons.length === 1);
add('cinco-temp', 'temporada', 'Salen en las cinco temporadas', c => c.seasons.length === 5);
[1, 2, 3, 4].forEach(t =>
  add('ultima-' + t, 'temporada', `Su última temporada es la T${t}`, c => Math.max(...c.seasons) === t));

add('principal',  'tipo', 'Personajes principales',  c => c.type === 'Principal');
add('secundario', 'tipo', 'Personajes secundarios',  c => c.type === 'Secundario');
add('esporadico', 'tipo', 'Personajes esporádicos',  c => c.type === 'Esporádico');

add('estudiante', 'oficio', 'Estudiantes',            c => occ(c, 'estudiante'));
add('ama-casa',   'oficio', 'Amas de casa',           c => occ(c, 'ama de casa'));
add('empresario', 'oficio', 'Empresarios',            c => occ(c, 'empresari'));
add('jubilada',   'oficio', 'Jubiladas',              c => occ(c, 'jubilad'));
add('sin-empleo', 'oficio', 'Sin empleo fijo o en paro', c => occ(c, 'sin empleo') || occ(c, 'en paro'));

add('hijos',      'familia', 'Tienen hijos',          c => c.hasChildren);
add('sin-hijos',  'familia', 'No tienen hijos',       c => !c.hasChildren);
add('cuesta',     'familia', 'La familia Cuesta',     c => c.name.includes('Cuesta') || c.name === 'Paloma Hurtado');
add('heredia',    'familia', 'La familia Heredia',    c => c.name.includes('Heredia'));
add('benito',     'familia', 'Las hermanas Benito',   c => c.name.includes('Benito'));

/* ── Datos dudosos (pendientes de confirmar con la serie) ──
   Un personaje no sale en un puzzle que use una categoría basada en un dato
   suyo que no tenemos claro: el puzzle sería coherente con las fichas pero
   podría ser falso respecto a la serie. */
const DOUBTFUL = {
  temporada: ['Rafael Álvarez', 'Abel', 'Ana', 'Rocío'],
  piso:      ['Natalia Cuesta', 'Roberto Alonso', 'Carlos de Haro', 'Concha de la Fuente'],
  hijos:     ['Carlos de Haro'],
};
const doubtKind = cat => cat.type === 'temporada' ? 'temporada' : cat.type === 'piso' ? 'piso'
  : (cat.id === 'hijos' || cat.id === 'sin-hijos') ? 'hijos' : null;
const isDoubtful = (ch, cats) => cats.some(cat => {
  const k = doubtKind(cat);
  return k && DOUBTFUL[k].includes(ch.name);
});

/* ── PRNG determinista (mulberry32) ── */
let s = SEED >>> 0;
const rand = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ── Generación ── */
const puzzles = [];
const usedTriples = new Set();
const charUse = new Map(); // reparte apariciones entre personajes
let attempts = 0;

while (puzzles.length < N_PUZZLES && attempts < 200000) {
  attempts++;
  const cats = shuffle(CATS).slice(0, 3);
  // Como mucho dos categorías del mismo tipo, y nada de "tienen / no tienen hijos" juntas
  const types = cats.map(c => c.type);
  if (new Set(types).size < 2) continue;
  const tripleKey = cats.map(c => c.id).sort().join('|');
  if (usedTriples.has(tripleKey)) continue;

  // Candidatos de cada categoría: cumplen ESA y ninguna de las otras dos
  const pools = cats.map(cat => CHARACTERS.filter(ch =>
    cat.fit(ch) && cats.every(o => o === cat || !o.fit(ch)) && !isDoubtful(ch, cats)));
  if (pools.some(p => p.length < 4)) continue;

  // Elige 4 por categoría, prefiriendo personajes que han salido menos
  const groups = cats.map((cat, i) => {
    const picked = shuffle(pools[i])
      .sort((a, b) => (charUse.get(a.name) || 0) - (charUse.get(b.name) || 0))
      .slice(0, 4);
    return { label: cat.label, chars: picked.map(c => c.name) };
  });

  // Verificación final: cada uno de los 12 cumple exactamente una categoría
  const all = groups.flatMap(g => g.chars);
  const ok = all.every(n => {
    const ch = CHARACTERS.find(c => c.name === n);
    return cats.filter(cat => cat.fit(ch)).length === 1;
  }) && new Set(all).size === 12;
  if (!ok) continue;

  usedTriples.add(tripleKey);
  all.forEach(n => charUse.set(n, (charUse.get(n) || 0) + 1));
  ['yellow', 'green', 'blue'].forEach((col, i) => { groups[i].color = col; });
  puzzles.push({ groups });
}

if (puzzles.length < N_PUZZLES) throw new Error(`Solo se generaron ${puzzles.length} puzzles`);

/* ── Escribir data/conexiones.js ── */
const out = `/* ================================================
   ANHQVdle — Puzzles de Conexiones (GENERADO por tools/build-conexiones.js)
   No editar a mano: cambia el generador y vuelve a ejecutarlo.
   Cada personaje encaja en exactamente un grupo de su puzzle.
   ================================================ */

const CONEXIONES_V2 = ${JSON.stringify(puzzles, null, 1)};
`;
fs.writeFileSync(path.join(ROOT, 'data/conexiones.js'), out);

const counts = [...charUse.values()];
const catUse = {};
puzzles.forEach(p => p.groups.forEach(g => { catUse[g.label] = (catUse[g.label] || 0) + 1; }));
console.log(`✓ ${puzzles.length} puzzles (${attempts} intentos), ${CATS.length} categorías disponibles, ${Object.keys(catUse).length} usadas`);
console.log(`  Apariciones por personaje: min ${Math.min(...counts)}, max ${Math.max(...counts)}, personajes usados ${charUse.size}/${CHARACTERS.length}`);
