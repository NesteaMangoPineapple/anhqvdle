/* ================================================
   ANHQVdle — Portada de la wiki (wiki.html)

   Uso:  node tools/build-wiki.js
   Genera wiki.html con buscador, índice de secciones, personajes por tipo
   y la tabla de temporadas (datos de data/characters.js y data/quotes.js).
   ================================================ */

const fs   = require('fs');
const path = require('path');
const { ROOT, esc, toSlug, loadData, photoFor, page, updateSitemap } = require('./lib/layout');

const CHARACTERS = loadData('data/characters.js', 'CHARACTERS');
const QUOTES     = loadData('data/quotes.js', 'QUOTES');

const link = c => `<a href="/personajes/${toSlug(c.name)}.html">${esc(c.name)}</a>`;
const quoteCount = name => QUOTES.filter(q => q.character === name).length;

const SECTIONS = [
  { href: '/personajes.html',      icon: '👥', title: 'Personajes',      text: `Las fichas de los ${CHARACTERS.length} vecinos: pisos, temporadas, profesiones y sus frases.` },
  { href: '/edificio.html',        icon: '🏢', title: 'El edificio',     text: 'Quién vivió en cada piso de Desengaño 21, de la portería al ático.' },
  { href: '#temporadas',           icon: '📺', title: 'Temporadas',      text: 'Quién aparece en cada una de las cinco temporadas y quién debuta en cada una.' },
  { href: '/frases-celebres.html', icon: '💬', title: 'Frases célebres', text: `Las frases más icónicas de la serie. En total recogemos ${QUOTES.length} frases.` },
  { href: '/curiosidades.html',    icon: '🎬', title: 'Curiosidades',    text: 'Datos del rodaje, del reparto y anécdotas de la serie.' },
  { href: '/serie.html',           icon: '📖', title: 'La serie',        text: 'Historia de Aquí No Hay Quien Viva: creadores, emisión y legado.' },
];

const byType = type => CHARACTERS.filter(c => c.type === type)
  .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  .map(c => `<a class="pj-chip" href="/personajes/${toSlug(c.name)}.html">${esc(c.name)}</a>`).join(' ');

const seasonRows = [1, 2, 3, 4, 5].map(s => {
  const inS    = CHARACTERS.filter(c => c.seasons.includes(s));
  const debut  = inS.filter(c => c.seasons[0] === s);
  const last   = inS.filter(c => c.seasons[c.seasons.length - 1] === s && s < 5);
  return `
      <h3 class="pj-h3" id="temporada-${s}">Temporada ${s} · ${inS.length} personajes</h3>
      <p class="about-text"><strong>Debutan (${debut.length}):</strong> ${debut.map(link).join(', ') || '—'}.</p>
      ${last.length ? `<p class="about-text"><strong>Su última temporada (${last.length}):</strong> ${last.map(link).join(', ')}.</p>` : ''}`;
}).join('');

const allFive = CHARACTERS.filter(c => c.seasons.length === 5);
const topQuotes = [...CHARACTERS].sort((a, b) => quoteCount(b.name) - quoteCount(a.name)).slice(0, 5);

// Índice para el buscador (nombre → url), embebido como JSON
const searchIndex = CHARACTERS.map(c => ({ n: c.name, u: `/personajes/${toSlug(c.name)}.html`, t: c.type }))
  .concat([
    { n: 'El edificio Desengaño 21', u: '/edificio.html', t: 'Sección' },
    { n: 'Frases célebres', u: '/frases-celebres.html', t: 'Sección' },
    { n: 'Curiosidades', u: '/curiosidades.html', t: 'Sección' },
    { n: 'Historia de la serie', u: '/serie.html', t: 'Sección' },
  ]);

const css = `
  <style>
    .wiki-search { position: relative; margin: 6px 0 24px; }
    .wiki-search input {
      width: 100%; box-sizing: border-box; padding: 14px 18px; border-radius: 50px; font-size: 1rem;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(240,192,32,0.35); color: var(--text); font-family: 'Barlow', sans-serif;
    }
    .wiki-search input:focus { outline: none; border-color: var(--accent); }
    .wiki-results { position: absolute; left: 0; right: 0; top: calc(100% + 6px); z-index: 20; background: #111; border: 1px solid rgba(240,192,32,0.3); border-radius: 12px; overflow: hidden; }
    .wiki-results a { display: flex; justify-content: space-between; padding: 10px 16px; text-decoration: none; color: var(--text); border-bottom: 1px solid rgba(255,255,255,0.05); }
    .wiki-results a:hover, .wiki-results a:focus { background: rgba(240,192,32,0.12); }
    .wiki-results small { color: var(--text2); }
    .wiki-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; margin-bottom: 8px; }
    .wiki-card { display: block; padding: 16px; border-radius: 12px; text-decoration: none; background: rgba(255,255,255,0.04); border: 1px solid rgba(240,192,32,0.18); transition: border-color .15s, transform .15s; }
    .wiki-card:hover { border-color: rgba(240,192,32,0.5); transform: translateY(-2px); }
    .wiki-card strong { display: block; font-family: 'Bebas Neue', cursive; font-size: 1.3rem; letter-spacing: 1px; color: var(--accent); margin-bottom: 4px; }
    .wiki-card span { color: var(--text2); font-size: 0.85rem; line-height: 1.5; }
  </style>`;

const body = `    <div class="about-panel pj-page">
      <nav class="pj-breadcrumb" aria-label="Migas de pan"><a href="/">Inicio</a> › <span>Wiki</span></nav>
      <h1 class="about-title pj-title">Wiki de Aquí No Hay Quien Viva</h1>
      <p class="about-text">La enciclopedia de Desengaño 21: todo lo que necesitas saber de los vecinos, los pisos, las temporadas y las frases de <strong>Aquí No Hay Quien Viva</strong> (Antena 3, 2003-2006). Es la misma información que usan los juegos de ANHQVdle, revisada a mano.</p>

      <div class="wiki-search" role="search">
        <input id="wiki-q" type="search" placeholder="Busca un personaje o una sección…" autocomplete="off" aria-label="Buscar en la wiki">
        <div id="wiki-results" class="wiki-results" hidden></div>
      </div>

      <h2 class="about-section-title">Secciones</h2>
      <div class="wiki-grid">
${SECTIONS.map(s => `        <a class="wiki-card" href="${s.href}"><strong>${s.icon} ${s.title}</strong><span>${esc(s.text)}</span></a>`).join('\n')}
      </div>

      <h2 class="about-section-title">Personajes</h2>
      <h3 class="pj-h3">Principales (${CHARACTERS.filter(c => c.type === 'Principal').length})</h3>
      <p class="pj-chips">${byType('Principal')}</p>
      <h3 class="pj-h3">Secundarios (${CHARACTERS.filter(c => c.type === 'Secundario').length})</h3>
      <p class="pj-chips">${byType('Secundario')}</p>
      <h3 class="pj-h3">Esporádicos (${CHARACTERS.filter(c => c.type === 'Esporádico').length})</h3>
      <p class="pj-chips">${byType('Esporádico')}</p>

      <h2 class="about-section-title" id="temporadas">Temporadas</h2>
      <p class="about-text">La serie tuvo cinco temporadas. Solo ${allFive.length} personajes aparecen en todas: ${allFive.map(link).join(', ')}. Esta es la evolución del reparto temporada a temporada, según nuestras fichas:</p>
${seasonRows}

      <h2 class="about-section-title">Los que más frases tienen</h2>
      <p class="about-text">De las ${QUOTES.length} frases que recogemos, los personajes con más son ${topQuotes.map(c => `${link(c)} (${quoteCount(c.name)})`).join(', ')}. Puedes leerlas todas en la ficha de cada uno.</p>

      <h2 class="about-section-title">¿Y si juegas?</h2>
      <p class="about-text">Cuando lo sepas todo, demuéstralo: cada día hay un personaje nuevo en el <a href="/clasico.html">Modo Clásico</a>, una frase en <a href="/frases.html">Frases</a>, impostores en <a href="/impostor.html">El Impostor</a>, grupos en <a href="/conexiones.html">Conexiones</a> y una foto en <a href="/pixelada.html">Foto Pixelada</a>.</p>
    </div>

  <script>
    (function () {
      var INDEX = ${JSON.stringify(searchIndex)};
      var q = document.getElementById('wiki-q'), box = document.getElementById('wiki-results');
      var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); };
      var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
      q.addEventListener('input', function () {
        var v = norm(q.value.trim());
        if (!v) { box.hidden = true; return; }
        var hits = INDEX.filter(function (i) { return norm(i.n).indexOf(v) !== -1; }).slice(0, 8);
        box.innerHTML = hits.length
          ? hits.map(function (i) { return '<a href="' + i.u + '">' + esc(i.n) + ' <small>' + esc(i.t) + '</small></a>'; }).join('')
          : '<a href="/personajes.html">Sin resultados · ver todos los personajes <small>→</small></a>';
        box.hidden = false;
      });
      q.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { var first = box.querySelector('a'); if (first) location.href = first.href; }
      });
      document.addEventListener('click', function (e) { if (!e.target.closest('.wiki-search')) box.hidden = true; });
    })();
  </script>`;

fs.writeFileSync(path.join(ROOT, 'wiki.html'), page({
  url: '/wiki.html',
  title: 'Wiki de Aquí No Hay Quien Viva – Personajes, pisos y temporadas | ANHQVdle',
  description: `Enciclopedia de Aquí No Hay Quien Viva: los ${CHARACTERS.length} personajes de Desengaño 21, sus pisos, temporadas, ${QUOTES.length} frases y curiosidades de la serie.`,
  ogType: 'website',
  extraHead: css,
  body,
}));

updateSitemap('WIKI', [{ loc: '/wiki.html', changefreq: 'weekly', priority: '0.8' }], new Date().toISOString().slice(0, 10));
console.log('✓ wiki.html generada');
