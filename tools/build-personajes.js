/* ================================================
   ANHQVdle — Genera las fichas de personajes.html en HTML estático
   (para que Google las lea sin ejecutar JavaScript).

   Uso:  node tools/build-personajes.js
   Lee data/characters.js + data/descriptions.js y reescribe lo que hay
   entre <!-- PERSONAJES:START --> y <!-- PERSONAJES:END --> en personajes.html.
   ================================================ */

const fs   = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const load = (file, name) => new Function(
  fs.readFileSync(path.join(root, file), 'utf8').replace(/^﻿/, '') + `\nreturn ${name};`
)();

const CHARACTERS = load('data/characters.js', 'CHARACTERS');
const CHAR_DESC  = load('data/descriptions.js', 'CHAR_DESC');

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const toSlug = name => name.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const photoFor = slug => {
  for (const ext of ['webp', 'jpg', 'jpeg']) {
    if (fs.existsSync(path.join(root, 'img/personajes', `${slug}.${ext}`))) return `img/personajes/${slug}.${ext}`;
  }
  return `img/personajes/${slug}.webp`;
};

const missing = CHARACTERS.filter(c => !CHAR_DESC[c.name]).map(c => c.name);
if (missing.length) console.warn('⚠️  Sin descripción:', missing.join(', '));

const cards = CHARACTERS.map(c => {
  const slug = toSlug(c.name);
  const desc = CHAR_DESC[c.name] || '';
  return `        <article class="char-card" id="${slug}" data-type="${esc(c.type)}" data-name="${esc(c.name.toLowerCase())}">
          <div class="char-card-top">
            <img class="char-photo" src="${photoFor(slug)}" alt="Foto de ${esc(c.name)}" loading="lazy" width="80" height="80">
            <div class="char-card-info">
              <h2 class="char-name">${esc(c.name)}</h2>
              <span class="char-type-badge badge-${esc(c.type)}">${esc(c.type)}</span>
              <div class="char-meta">
                <span>🏠 ${esc(c.floors.join(', '))}</span><br>
                <span>📺 ${c.seasons.map(s => 'T' + s).join(' · ')}</span>
              </div>
            </div>
          </div>
          ${desc ? `<p class="char-desc">${esc(desc)}</p>` : ''}
          <div class="char-occupations">${esc(c.occupations.join(', '))}</div>
        </article>`;
}).join('\n');

const file = path.join(root, 'personajes.html');
const html = fs.readFileSync(file, 'utf8');
const START = '<!-- PERSONAJES:START -->', END = '<!-- PERSONAJES:END -->';
const a = html.indexOf(START), b = html.indexOf(END);
if (a === -1 || b === -1) throw new Error('No encuentro los marcadores PERSONAJES en personajes.html');

fs.writeFileSync(file, html.slice(0, a + START.length) + '\n' + cards + '\n        ' + html.slice(b));
console.log(`✓ ${CHARACTERS.length} fichas generadas en personajes.html`);
