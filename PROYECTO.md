# ANHQVdle — Contexto del proyecto

## ¿Qué es?
Juego tipo Wordle de personajes de la serie española **"Aquí No Hay Quien Viva"** (Antena 3, 2003-2006).
Fan-made, no oficial. Inspirado en LQSAdle (lqsadle.es).

**URL:** https://anhqvdle.es
**Repo:** https://github.com/NesteaMangoPineapple/anhqvdle
**Hosting:** GitHub Pages + dominio propio `anhqvdle.es` (registrado en Arsys)

---

## Estructura de archivos
```
anhqvdle/
├── index.html          ← Página de inicio con tarjetas de modos
├── clasico.html        ← Modo Clásico
├── frases.html         ← Modo Frases
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
    ├── favicon.ico          ← Favicon para IE/Edge
    ├── favicon-32.png       ← Favicon 32x32
    ├── apple-touch-icon.png ← Favicon iOS
    └── personajes/          ← Fotos de personajes (.webp/.jpg)
```

---

## Modos de juego
- **🎬 Clásico** (`clasico.html`) — Adivina el personaje comparando atributos en tabla. Intentos ilimitados.
- **💬 Frases** (`frases.html`) — Adivina quién dijo la frase. Intentos ilimitados.
- **🔊 Audio** — Próximamente (aparece desactivado en la nav)

---

## Sistema diario (`daily.js`)
- `getDailyIndex(n)` — índice del personaje/frase de hoy usando la fecha como semilla
- `getYesterdayIndex(n)` — índice de ayer (para mostrar "el personaje de ayer fue X")
- Mismo resultado para todos los jugadores ese día
- Estado guardado en `localStorage` con clave `anhqvdle_[modo]_[YYYYMMDD]`
- Se resetea automáticamente a las 00:00
- Para pruebas: añadir `?reset` a la URL → botón rojo "Reset día"

**⚠️ NO cambiar `getDailyIndex()` sin avisar** — si se cambia, todos los jugadores verán personajes distintos ese día.

---

## Tabla modo clásico — columnas
| Columna | Campo | Verde | Amarillo | Rojo |
|---|---|---|---|---|
| Personaje | Foto + nombre en hover | Correcto | — | Incorrecto |
| Tipo | Principal/Secundario/Esporádico | = | — | ≠ |
| Género | Masculino/Femenino | = | — | ≠ |
| Nacionalidad | País de origen | = | — | ≠ |
| Piso(s) | Array de pisos | Comparte alguno | — | Ninguno |
| Ocupación | Array de trabajos | Comparte alguno | — | Ninguno |
| 1ª Temporada | `seasons[0]` | = | ±1 | ≠ + flecha ⬆️⬇️ |

### Animación de celdas
Las celdas aparecen una a una con stagger de `0.34s` por celda (total ~2.5s).
Keyframe: `cellReveal` — flip en Y con rebote.

---

## Autocomplete
- Muestra foto del personaje (40×40px), nombre y primera ocupación
- Al seleccionar un personaje se adivina automáticamente (sin botón)
- Fallback de imagen: `.webp` → `.jpg` → `.jpeg` → oculto
- Máximo 6 resultados

---

## "El personaje/frase de ayer"
- Se calcula con `getYesterdayIndex()` en cada `init()`
- Se renderiza como pill (foto circular + texto) al final del contenido
- Clásico: "El personaje de ayer fue **X**"
- Frases: "La frase de ayer era de **X**"

---

## Banner de resultado (Frases)
El banner de "¡Correcto!" / "¡Uy!" incluye:
- Foto del personaje en círculo con borde dorado
- Título, intentos usados, nombre del personaje
- Countdown hasta la próxima frase

---

## Personajes en `characters.js`
Cada personaje tiene:
```js
{
  name: "Emilio Delgado",
  type: "Principal",            // Principal / Secundario / Esporádico
  gender: "Masculino",
  nationality: "Española",
  floors: ["Portería", "3º B"], // Array — vivió en varios pisos
  seasons: [1, 2, 3, 4, 5],    // seasons[0] = temporada de debut
  occupations: ["Portero", "Estudiante universitario"],
}
```

---

## Fotos de personajes
- Carpeta: `img/personajes/`
- Formato: `.webp` preferido, fallback `.jpg` → `.jpeg`
- Nombre: slug del personaje (minúsculas, sin tildes, guiones)
  - Ej: "Concha de la Fuente" → `concha-de-la-fuente.webp`
- Falta foto de: **Gregorio** (`gregorio.webp`)

---

## Diseño / Estética
- Fondo: foto del edificio (`img/edificio.png`) con degradado oscuro encima
- En móvil: `background-attachment: scroll` (el `fixed` rompe el scroll en iOS)
- Colores: amarillo `#f0c020` (accent), verde `#16a34a` (correcto), rojo `#dc2626` (incorrecto)
- Tipografía: Bebas Neue (títulos), Barlow Condensed (tabla/nav), Barlow (cuerpo)
- Nav: pills redondeadas, activo en amarillo

---

## Responsive
Breakpoints definidos en `style.css`:
- **≤768px** (tablet): tabla más compacta, fuentes reducidas, nav ajustada
- **≤480px** (móvil): tabla mínima con scroll horizontal, fuentes pequeñas, cards en columna

La tabla siempre tiene scroll horizontal en móvil (`overflow-x: auto`, `-webkit-overflow-scrolling: touch`).
Se muestra el hint "← Desliza para ver todas las columnas →" en pantallas pequeñas.

---

## Deploy
- **Hosting:** GitHub Pages (gratis, rama `main`)
- **Dominio:** `anhqvdle.es` registrado en Arsys (1€ primer año)
- **Subir cambios:**
```bash
git add .
git commit -m "descripción del cambio"
git push origin main
```
GitHub Pages se actualiza automáticamente en ~1-2 minutos.

---

## Pendiente / Ideas futuras
- Modo Audio: reproducir audios de frases y adivinar el personaje
- Compartir resultado (copiar al portapapeles estilo Wordle)
- Estadísticas del jugador
- Modo difícil
- Meta tags Open Graph para previews en redes sociales
- Google AdSense (requiere tráfico mínimo ~100 visitas/día)

---

## Cosas a NO cambiar sin avisar
- `getDailyIndex()` — si se cambia, todos los jugadores verán personajes distintos
- Los nombres de archivo de las fotos — vinculados al slug del nombre del personaje
- La estructura de `CHARACTERS` en `characters.js` — el juego depende de todos los campos
