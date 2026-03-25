# ANHQVdle — Contexto del proyecto

## ¿Qué es?
Juego tipo Wordle de personajes de la serie española **"Aquí No Hay Quien Viva"** (Antena 3, 2003-2006).
Fan-made, no oficial. Inspirado en LQSAdle (lqsadle.es).

**URL:** https://anhqvdle.es
**Repo:** https://github.com/NesteaMangoPineapple/anhqvdle (público)
**Hosting:** GitHub Pages + dominio propio `anhqvdle.es` (registrado en Arsys, 1€ primer año)
**Redes:** https://www.instagram.com/anhqvdle/ | https://www.tiktok.com/@anhqvdle

---

## Estructura de archivos
```
anhqvdle/
├── index.html          ← Página de inicio con tarjetas de modos
├── clasico.html        ← Modo Clásico
├── frases.html         ← Modo Frases
├── nosotros.html       ← Página "Sobre el proyecto" con créditos a LQSAdle
├── LICENSE             ← All Rights Reserved
├── CNAME               ← anhqvdle.es (para GitHub Pages)
├── sitemap.xml         ← Para indexación Google
├── robots.txt          ← Allow all + Sitemap pointer
├── css/style.css       ← Todos los estilos (incluye responsive)
├── data/
│   ├── characters.js   ← 41 personajes con atributos
│   └── quotes.js       ← 130+ frases de la serie
├── js/
│   ├── daily.js        ← Sistema de personaje del día (semilla por fecha)
│   ├── classic.js      ← Lógica modo clásico
│   ├── quote.js        ← Lógica modo frases
│   ├── emoji.js        ← Lógica modo emojis (no usado aún)
│   ├── utils.js        ← Funciones compartidas (autocomplete, stats, resultados)
│   └── app.js          ← Controlador de navegación
└── img/
    ├── edificio.png         ← Fondo (fachada del edificio)
    ├── og-image.jpg         ← Imagen Open Graph (1200x630, <600KB)
    ├── logo.svg             ← Favicon/logo
    ├── favicon.ico
    ├── favicon-32.png
    ├── apple-touch-icon.png
    └── personajes/          ← Fotos de personajes (.webp con fallback .jpg/.jpeg)
```

---

## Modos de juego
- **🎬 Clásico** (`clasico.html`) — Adivina el personaje comparando atributos en tabla. Intentos ilimitados.
- **💬 Frases** (`frases.html`) — Adivina quién dijo la frase. Intentos ilimitados.
- **🔊 Audio** — Próximamente (desactivado en la nav)

---

## Sistema diario (`daily.js`)
- `getDailyIndex(n)` — índice del personaje/frase de hoy usando la fecha como semilla
- `getYesterdayIndex(n)` — índice de ayer (para mostrar "el personaje de ayer fue X")
- Mismo resultado para todos los jugadores ese día
- Estado guardado en `localStorage` con clave `anhqvdle_[modo]_[YYYYMMDD]`
- Se resetea automáticamente a las 00:00
- Para pruebas: añadir `?reset` a la URL → botón rojo "Reset día"

**⚠️ NO cambiar `getDailyIndex()` sin avisar** — si se cambia, todos los jugadores verán personajes distintos.

---

## Autocomplete (`utils.js` — función `buildAutocomplete`)
- Muestra foto del personaje (40×40px), nombre y primera ocupación
- Al seleccionar un personaje **se adivina automáticamente** (sin botón) en ambos modos
- Fallback de imagen: `.webp` → `.jpg` → `.jpeg` → oculto
- Máximo 6 resultados
- Slug de imagen: `name.toLowerCase().normalize('NFD').replace acentos.replace no-alfanum por guión`

---

## Tabla modo clásico
| Columna | Verde | Amarillo | Rojo |
|---|---|---|---|
| Personaje | Correcto | — | Incorrecto |
| Tipo | = | — | ≠ |
| Género | = | — | ≠ |
| Nacionalidad | = | — | ≠ |
| Piso(s) | Comparte alguno | — | Ninguno |
| Ocupación | Comparte alguno | — | Ninguno |
| 1ª Temporada | = | ±1 | ≠ + flecha ⬆️⬇️ |

### Animación de celdas
- Keyframe `cellReveal`: flip en scaleY con rebote (`cubic-bezier(0.34,1.4,0.64,1)`)
- Stagger: `calc(var(--i,0) * 0.34s)` → total ~2.5s para las 7 celdas
- `--i` se asigna en `classic.js` con `td.style.setProperty('--i', i)`

---

## Compartir resultado
- Botón **"📋 Compartir resultado"** en el banner de resultado de ambos modos
- Copia al portapapeles texto con emojis estilo Wordle
- Clásico: grid de 🟩🟨🟥 por cada fila de intentos (7 columnas)
- Frases: ❌❌✅ según intentos
- Formato:
  ```
  ANHQVdle 🎬 · 24/3/2026
  3 intentos
  🟥🟨🟩🟥🟥🟩🟩
  🟩🟩🟩🟩🟩🟩🟩
  anhqvdle.es
  ```
- `classicResults` se guarda en `saveDailyState` junto a `guesses`
- CSS: `.share-btn`, `.share-btn.copied`

---

## Estadísticas del jugador (`utils.js`)
- Botón **📊 Stats** en la nav de `clasico.html` y `frases.html`
- Abre modal con: Jugadas, Racha, Máx. racha, Media intentos
- Gráfica de distribución de intentos (barras verdes)
- localStorage key: `anhqvdle_stats_classic` y `anhqvdle_stats_quote`
- Estructura:
  ```json
  { "played":0, "streak":0, "maxStreak":0, "lastWonDate":null,
    "totalAttempts":0, "distribution":{"1":0,"2":0,"3":0,"4":0,"5":0,"6+":0} }
  ```
- `updateStats(mode, attempts)` — llamado en `makeGuess()` y `makeGuessQuote()` al ganar
- Solo cuenta partidas ganadas (no hay estado de derrota — intentos ilimitados)
- CSS: `.stats-modal-overlay`, `.stats-modal`, `.stats-grid`, `.stat-dist-bar`

---

## "El personaje/frase de ayer"
- Clásico: función `renderYesterdayClassic()` en `classic.js`, div `#classic-yesterday`
- Frases: función `renderYesterdayQuote()` en `quote.js`, div `#quote-yesterday`
- Se renderiza al final del `<main>`, antes del footer
- Estilo: pill con foto circular + texto — CSS clase `.yesterday-pill`

---

## Banner de resultado — Frases (`showDoneMessageQuote`)
- Foto del personaje en círculo con borde dorado y glow
- Título "¡Correcto!" / "¡Uy!" con emoji
- Intentos usados
- Nombre del personaje
- Botón compartir resultado
- Separador + countdown hasta próxima frase
- Clases CSS: `.result-banner-quote`, `.result-header`, `.result-avatar`, `.result-character`, `.result-divider`

---

## Footer
- Texto de copyright
- Link "Nosotros" → `nosotros.html`
- Iconos circulares de Instagram y TikTok debajo (color `var(--accent)` amarillo)
- Clases CSS: `.footer-social`, `.social-btn`

---

## Página Nosotros (`nosotros.html`)
- Descripción fan-made + aviso no oficial
- Créditos a LQSAdle (DavidHern0 y Guillelg_02)
- Botón de contacto por Instagram (@anhqvdle)
- Botón "← Volver" a index.html
- CSS: `.about-panel`, `.about-title`, `.about-section-title`, `.about-text`, `.about-contact-btn`

---

## Personajes en `characters.js`
```js
{
  name: "Emilio Delgado",
  type: "Principal",            // Principal / Secundario / Esporádico
  gender: "Masculino",
  nationality: "Española",
  floors: ["Portería", "3º B"],
  seasons: [1, 2, 3, 4, 5],    // seasons[0] = temporada de debut
  occupations: ["Portero", "Estudiante universitario"],
}
```
**Falta foto de: Gregorio** (`gregorio.webp`)

---

## Fotos de personajes
- Carpeta: `img/personajes/`
- Formato: `.webp` preferido, fallback `.jpg` → `.jpeg`
- Nombre: slug del personaje (minúsculas, sin tildes, guiones)
  - Ej: "Concha de la Fuente" → `concha-de-la-fuente.webp`

---

## Diseño / Estética
- Fondo: `img/edificio.png` con degradado oscuro encima
- En móvil: `background-attachment: scroll` (el `fixed` rompe scroll en iOS)
- Variables CSS: `--accent: #f0c020`, `--correct: #16a34a`, `--wrong: #dc2626`, `--partial: #f0c020`
- Tipografía: Bebas Neue (títulos), Barlow Condensed (tabla/nav), Barlow (cuerpo)
- Logo: `clamp(2.5rem, 10vw, 6rem)`

---

## Responsive (`style.css`)
- **≤768px** (tablet): tabla compacta, fuentes reducidas, nav ajustada
- **≤480px** (móvil): tabla mínima con scroll horizontal, cards en columna
- La tabla usa scroll horizontal con `-webkit-overflow-scrolling: touch`
- Hint "← Desliza para ver todas las columnas →" visible solo en móvil (clase `.scroll-hint`)
- `html, body { overflow-x: hidden }` para evitar scroll lateral de página

---

## Open Graph / SEO
- Meta tags OG y Twitter Card en las 3 páginas HTML
- Imagen: `img/og-image.jpg` (1200x630, <600KB)
- `sitemap.xml` enviado a Google Search Console
- `robots.txt` con `Allow: /` y pointer al sitemap
- Google Analytics (GA4): ID `G-9BGR4GH8P7` — en las 3 páginas
- Google Search Console: verificado vía TXT record en Cloudflare DNS

---

## Infraestructura / Seguridad
### Cloudflare (activo)
- Nameservers: `harlan.ns.cloudflare.com` y `tessa.ns.cloudflare.com` (configurado en Arsys)
- **A records → DNS only (gris)** ⚠️ NO poner en Proxied — rompe la renovación del cert SSL de GitHub Pages
- CNAME www → Proxied (naranja) — ok
- SSL/TLS: **Full**
- Bots de IA: bloqueados en todas las páginas
- Security Headers activos (Response Header Transform Rule):
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

### GitHub Pages
- Custom domain: `anhqvdle.es` ✓
- Enforce HTTPS: ✓
- SSL cert: gestionado por GitHub Pages (Let's Encrypt, renueva cada ~90 días)
- ⚠️ Si en 90 días falla el cert: poner A records en gris temporalmente, esperar renovación, volver a gris

### DNS en Cloudflare
```
A     anhqvdle.es  185.199.108.153  DNS only
A     anhqvdle.es  185.199.109.153  DNS only
A     anhqvdle.es  185.199.110.153  DNS only
A     anhqvdle.es  185.199.111.153  DNS only
CNAME www          nesteamangopineapple.github.io  Proxied
TXT   anhqvdle.es  google-site-verification=...    DNS only
```

---

## Deploy
```bash
git add .
git commit -m "descripción"
git push origin main
# GitHub Pages actualiza en ~1-2 minutos
```

---

## Pendiente / Ideas futuras
- Modo Audio
- Modo difícil
- Google AdSense (requiere ~100 visitas/día mínimo)
- Más personajes (actualmente 41, se repiten pronto)
- Tutorial primera vez (pop-up explicando cómo jugar)
- Archivo de personajes anteriores

---

## Cosas a NO cambiar sin avisar
- `getDailyIndex()` — si se cambia, todos los jugadores verán personajes distintos
- Nombres de archivo de las fotos — vinculados al slug del nombre
- Estructura de `CHARACTERS` — el juego depende de todos los campos
- A records en Cloudflare — deben estar en DNS only (gris), no Proxied
