/* ================================================
   ANHQVdle — Plantilla común para las páginas generadas
   (personajes/<slug>.html y wiki.html).
   Cabecera y pie se copian de personajes.html con rutas absolutas,
   así cualquier cambio en el menú se propaga al regenerar.
   ================================================ */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SITE = 'https://anhqvdle.es';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const toSlug = name => name.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Carga un archivo de data/ (const X = ...) y devuelve X
function loadData(file, name) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/^﻿/, '');
  return new Function(src + `\nreturn ${name};`)();
}

// Rutas relativas → absolutas (las páginas generadas viven en subcarpetas)
function absolutize(html) {
  return html.replace(/(href|src)="(?!https?:|\/|#|mailto:)([^"]+)"/g, '$1="/$2"');
}

const base = fs.readFileSync(path.join(ROOT, 'personajes.html'), 'utf8');
const HEADER = absolutize(base.match(/  <header>[\s\S]*?<\/header>/)[0]).replace(/ class="nav-btn active"/g, ' class="nav-btn"')
  .replace(/(<a href="\/wiki\.html"\s+class=")nav-btn"/, '$1nav-btn active"'); // todas las páginas generadas son de la wiki
const FOOTER = absolutize(base.match(/  <footer>[\s\S]*?<\/footer>/)[0]);

function photoFor(slug) {
  for (const ext of ['webp', 'jpg', 'jpeg']) {
    if (fs.existsSync(path.join(ROOT, 'img/personajes', `${slug}.${ext}`))) return `/img/personajes/${slug}.${ext}`;
  }
  return `/img/personajes/${slug}.webp`;
}

/**
 * Página completa.
 * opts: { url (ruta absoluta, ej. /personajes/emilio-delgado.html), title, description,
 *         image, ogType, jsonLd (objeto o array), body (HTML de <main>), extraHead }
 */
function page(opts) {
  const url   = SITE + opts.url;
  const image = opts.image ? SITE + opts.image : SITE + '/img/og-image.jpg';
  const ld    = [].concat(opts.jsonLd || []).map(o =>
    `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2)}\n  </script>`).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(opts.title)}</title>
  <meta name="description" content="${esc(opts.description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="${opts.ogType || 'article'}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(opts.title)}">
  <meta property="og:description" content="${esc(opts.description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:locale" content="es_ES">
  <meta property="og:site_name" content="ANHQVdle">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/x-icon" href="/img/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png">
  <link rel="icon" type="image/svg+xml" href="/img/logo.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;600&display=swap">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#f0c020">
  <link rel="stylesheet" href="/css/style.css">
${ld}
${opts.extraHead || ''}
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1251819701012590" crossorigin="anonymous"></script>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-9BGR4GH8P7"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-9BGR4GH8P7');
  </script>
</head>
<body>
  <!-- Página generada por tools/ — no editar a mano -->
${HEADER}

  <main>
${opts.body}
  </main>

${FOOTER}

  <!-- Firebase SDK (compat) -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <script src="/js/firebase-config.js"></script>
  <script src="/js/auth.js"></script>
  <script src="/js/pwa.js"></script>
</body>
</html>
`;
}

// Reescribe las entradas del sitemap entre <!-- NAME:START --> y <!-- NAME:END -->
function updateSitemap(name, urls, lastmod) {
  const file = path.join(ROOT, 'sitemap.xml');
  let xml = fs.readFileSync(file, 'utf8');
  const START = `<!-- ${name}:START -->`, END = `<!-- ${name}:END -->`;
  const block = urls.map(u =>
    `  <url>\n    <loc>${SITE}${u.loc}</loc>\n    <lastmod>${u.lastmod || lastmod}</lastmod>\n    <changefreq>${u.changefreq || 'monthly'}</changefreq>\n    <priority>${u.priority || '0.6'}</priority>\n  </url>`
  ).join('\n');
  if (!xml.includes(START)) {
    xml = xml.replace('</urlset>', `  ${START}\n  ${END}\n</urlset>`);
  }
  const a = xml.indexOf(START), b = xml.indexOf(END);
  xml = xml.slice(0, a + START.length) + '\n' + block + '\n  ' + xml.slice(b);
  fs.writeFileSync(file, xml);
}

module.exports = { ROOT, SITE, esc, toSlug, loadData, photoFor, page, updateSitemap };
