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
├── LICENSE             ← All Rights Reserved
├── css/style.css       ← Todos los estilos (incluye responsive)
├── data/
│   ├── characters.js   ← 41 personajes con atributos
│   └── quotes.js       ← 130+ frases de la serie
├── js/
│   ├── daily.js        ← Sistema de personaje del día (semilla por fecha)
│   ├── classic.js      ← Lógica modo clásico
│   ├── quote.js        ← Lógica modo frases
│   ├── emoji.js        ← Lógica modo emojis (no usado aún)
│   ├── utils.js        ← Funciones compartidas (autocomplete, resultados)
│   └── app.js          ← Controlador de navegación
└── img/
    ├── edificio.png         ← Fondo (fachada del edificio)
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
- Separador + countdown hasta próxima frase
- Clases CSS: `.result-banner-quote`, `.result-header`, `.result-avatar`, `.result-character`, `.result-divider`

---

## Footer
- Texto de copyright
- Iconos circulares de Instagram y TikTok debajo (color `var(--accent)` amarillo)
- Clases CSS: `.footer-social`, `.social-btn`

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

## Deploy
```bash
git add .
git commit -m "descripción"
git push origin main
# GitHub Pages actualiza en ~1-2 minutos
```

### DNS Arsys (configurado)
```
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
CNAME www  nesteamangopineapple.github.io
```

---

## Pendiente / Ideas futuras
- Modo Audio
- Compartir resultado (copiar al portapapeles estilo Wordle)
- Estadísticas del jugador
- Modo difícil
- Meta tags Open Graph para previews en redes sociales
- Google AdSense (requiere ~100 visitas/día mínimo)

---

## Cosas a NO cambiar sin avisar
- `getDailyIndex()` — si se cambia, todos los jugadores verán personajes distintos
- Nombres de archivo de las fotos — vinculados al slug del nombre
- Estructura de `CHARACTERS` — el juego depende de todos los campos
