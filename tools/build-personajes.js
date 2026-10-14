/* ================================================
   ANHQVdle — Genera el contenido estático de personajes
   (para que Google lo lea sin ejecutar JavaScript).

   Uso:  node tools/build-personajes.js

   1. personajes.html: las 46 fichas entre <!-- PERSONAJES:START/END -->
   2. personajes/<slug>.html: una página por personaje (ficha, descripción,
      frases, vecinos de piso y enlaces a los juegos)
   3. sitemap.xml: bloque <!-- PERSONAJES:START/END -->

   Fuentes: data/characters.js, data/descriptions.js, data/quotes.js
   ================================================ */

const fs   = require('fs');
const path = require('path');
const { ROOT, esc, toSlug, loadData, photoFor, page, updateSitemap } = require('./lib/layout');

const CHARACTERS = loadData('data/characters.js', 'CHARACTERS');
const CHAR_DESC  = loadData('data/descriptions.js', 'CHAR_DESC');
const CHAR_INFO  = loadData('data/descriptions.js', 'CHAR_INFO');
const QUOTES     = loadData('data/quotes.js', 'QUOTES');

// Por debajo de este número de palabras la página se marca noindex (contenido escaso)
const MIN_WORDS_INDEX = 200;
const TODAY = new Date().toISOString().slice(0, 10);

const missing = CHARACTERS.filter(c => !CHAR_DESC[c.name]).map(c => c.name);
if (missing.length) console.warn('⚠️  Sin descripción:', missing.join(', '));

const TYPE_TEXT = { Principal: 'principal', Secundario: 'secundario', 'Esporádico': 'esporádico' };
const listJoin = arr => arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
const seasonsText = s => s.length === 5 ? 'las cinco temporadas'
  : s.length === 1 ? `la temporada ${s[0]}`
  : `las temporadas ${listJoin(s.map(String))}`;
const floorName = f => f === 'Visita' ? 'de visita' : f === 'Portería' ? 'la portería' : f === 'Videoclub' ? 'el videoclub' : f === 'Ático' ? 'el ático' : `el ${f}`;

/* ── 1. Fichas en personajes.html ── */
const cards = CHARACTERS.map(c => {
  const slug = toSlug(c.name);
  const desc = CHAR_DESC[c.name] || '';
  return `        <article class="char-card" id="${slug}" data-type="${esc(c.type)}" data-name="${esc(c.name.toLowerCase())}">
          <div class="char-card-top">
            <img class="char-photo" src="${photoFor(slug).slice(1)}" alt="Foto de ${esc(c.name)}" loading="lazy" width="80" height="80">
            <div class="char-card-info">
              <h2 class="char-name"><a href="personajes/${slug}.html">${esc(c.name)}</a></h2>
              ${(CHAR_INFO[c.name] || {}).nick ? `<div class="char-nick">«${esc(CHAR_INFO[c.name].nick)}»</div>` : ''}
              <span class="char-type-badge badge-${esc(c.type)}">${esc(c.type)}</span>
              <div class="char-meta">
                <span>🏠 ${esc(c.floors.join(', '))}</span><br>
                <span>📺 ${c.seasons.map(s => 'T' + s).join(' · ')}</span>
              </div>
            </div>
          </div>
          ${desc ? `<p class="char-desc">${esc(desc)}</p>` : ''}
          <div class="char-occupations">${esc(c.occupations.join(', '))}</div>
          <a class="char-more" href="personajes/${slug}.html">Ver ficha completa y frases →</a>
        </article>`;
}).join('\n');

const listFile = path.join(ROOT, 'personajes.html');
let listHtml = fs.readFileSync(listFile, 'utf8');
const START = '<!-- PERSONAJES:START -->', END = '<!-- PERSONAJES:END -->';
const a = listHtml.indexOf(START), b = listHtml.indexOf(END);
if (a === -1 || b === -1) throw new Error('No encuentro los marcadores PERSONAJES en personajes.html');
listHtml = listHtml.slice(0, a + START.length) + '\n' + cards + '\n        ' + listHtml.slice(b);
fs.writeFileSync(listFile, listHtml);

/* ── 2. Página individual por personaje ── */
const outDir = path.join(ROOT, 'personajes');
fs.mkdirSync(outDir, { recursive: true });
const sitemap = [];
const thin = [];

CHARACTERS.forEach((c, i) => {
  const slug   = toSlug(c.name);
  const desc   = CHAR_DESC[c.name] || '';
  const quotes = QUOTES.filter(q => q.character === c.name);
  const prev   = CHARACTERS[(i - 1 + CHARACTERS.length) % CHARACTERS.length];
  const next   = CHARACTERS[(i + 1) % CHARACTERS.length];

  // Vecinos que compartieron algún piso (según nuestras fichas)
  const neighbourBlocks = c.floors.filter(f => f !== 'Visita').map(f => {
    const others = CHARACTERS.filter(o => o.name !== c.name && o.floors.includes(f));
    if (!others.length) return '';
    return `
        <h3 class="pj-h3">${f === 'Portería' || f === 'Videoclub' || f === 'Ático' ? f[0].toUpperCase() + floorName(f).slice(4) : 'El ' + f}</h3>
        <p class="pj-chips">${others.map(o => `<a class="pj-chip" href="/personajes/${toSlug(o.name)}.html">${esc(o.name)}</a>`).join(' ')}</p>`;
  }).join('');

  const floorsReal = c.floors.filter(f => f !== 'Visita');
  const resumen = `${esc(c.name)} es un personaje ${TYPE_TEXT[c.type]} de <strong>Aquí No Hay Quien Viva</strong>. ` +
    `Aparece en ${seasonsText(c.seasons)} de la serie` +
    (c.seasons.length > 1 ? ` (debutó en la temporada ${c.seasons[0]})` : '') + '. ' +
    (floorsReal.length
      ? `En el edificio de Desengaño 21 vivió en ${listJoin(floorsReal.map(floorName))}${c.floors.includes('Visita') ? ', aunque también aparece como visita' : ''}.`
      : 'No vive en el edificio: aparece como visita.');

  const body = `    <article class="about-panel pj-page">
      <nav class="pj-breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> › <a href="/personajes.html">Personajes</a> › <span>${esc(c.name)}</span></nav>

      <div class="pj-hero">
        <img class="pj-photo" src="${photoFor(slug)}" alt="${esc(c.name)} en Aquí No Hay Quien Viva" width="160" height="160">
        <div>
          <h1 class="about-title pj-title">${esc(c.name)}</h1>
          <span class="char-type-badge badge-${esc(c.type)}">${esc(c.type)}</span>
        </div>
      </div>

      <p class="about-text">${resumen}</p>

      <h2 class="about-section-title">Ficha</h2>
      <table class="pj-ficha">
        ${(CHAR_INFO[c.name] || {}).full ? `<tr><th>Nombre completo</th><td>${esc(CHAR_INFO[c.name].full)}</td></tr>` : ''}
        ${(CHAR_INFO[c.name] || {}).nick ? `<tr><th>Apodo</th><td>«${esc(CHAR_INFO[c.name].nick)}»</td></tr>` : ''}
        <tr><th>Tipo</th><td>${esc(c.type)}</td></tr>
        <tr><th>Género</th><td>${esc(c.gender)}</td></tr>
        <tr><th>Nacionalidad</th><td>${esc(c.nationality)}</td></tr>
        <tr><th>Piso(s)</th><td>${esc(c.floors.join(', '))}</td></tr>
        <tr><th>Temporadas</th><td>${c.seasons.map(s => 'T' + s).join(' · ')}</td></tr>
        <tr><th>Ocupación</th><td>${esc(c.occupations.join(', '))}</td></tr>
        <tr><th>Hijos</th><td>${c.hasChildren ? 'Sí' : 'No'}</td></tr>
      </table>

      ${desc ? `<h2 class="about-section-title">Quién es ${esc(c.name)}</h2>
      <p class="about-text">${esc(desc)}</p>` : ''}

      ${quotes.length ? `<h2 class="about-section-title">Frases de ${esc(c.name)}</h2>
      <p class="about-text">${quotes.length === 1 ? 'Una frase' : quotes.length + ' frases'} de ${esc(c.name)} que pueden salir en el <a href="/frases.html">Modo Frases</a>:</p>
      <ul class="pj-quotes">
${quotes.map(q => `        <li><blockquote>«${esc(q.quote)}»</blockquote></li>`).join('\n')}
      </ul>` : ''}

      ${neighbourBlocks ? `<h2 class="about-section-title">Vecinos con los que compartió piso</h2>${neighbourBlocks}` : ''}

      <h2 class="about-section-title">¿Cuánto sabes de ${esc(c.name)}?</h2>
      <p class="about-text">${esc(c.name)} puede ser el personaje del día en el <a href="/clasico.html">Modo Clásico</a>, aparecer pixelado en <a href="/pixelada.html">Foto Pixelada</a> o colarse como impostor en <a href="/impostor.html">El Impostor</a>. Y si quieres saber si te pareces a algún vecino, haz el test <a href="/quiz.html">¿Qué personaje eres?</a></p>

      <nav class="pj-prevnext" aria-label="Otros personajes">
        <a href="/personajes/${toSlug(prev.name)}.html">← ${esc(prev.name)}</a>
        <a href="/personajes.html">Todos</a>
        <a href="/personajes/${toSlug(next.name)}.html">${esc(next.name)} →</a>
      </nav>
    </article>`;

  const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const index = words >= MIN_WORDS_INDEX;
  if (!index) thin.push(`${c.name} (${words})`);

  const metaDesc = (desc || resumen.replace(/<[^>]+>/g, '')).slice(0, 155).replace(/\s+\S*$/, '') + '…';
  const html = page({
    url: `/personajes/${slug}.html`,
    title: `${c.name} – Personaje de Aquí No Hay Quien Viva | ANHQVdle`,
    description: metaDesc,
    image: photoFor(slug),
    extraHead: index ? '' : '  <meta name="robots" content="noindex, follow">',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://anhqvdle.es/' },
        { '@type': 'ListItem', position: 2, name: 'Personajes', item: 'https://anhqvdle.es/personajes.html' },
        { '@type': 'ListItem', position: 3, name: c.name, item: `https://anhqvdle.es/personajes/${slug}.html` },
      ],
    },
    body,
  });
  fs.writeFileSync(path.join(outDir, `${slug}.html`), html);
  if (index) sitemap.push({ loc: `/personajes/${slug}.html` });
});

/* ── 3. Sitemap ── */
updateSitemap('PERSONAJES', sitemap, TODAY);

console.log(`✓ ${CHARACTERS.length} fichas en personajes.html`);
console.log(`✓ ${CHARACTERS.length} páginas en personajes/ (${sitemap.length} indexables)`);
if (thin.length) console.log(`  noindex por contenido escaso (<${MIN_WORDS_INDEX} palabras): ${thin.join(', ')}`);
