# ANHQVdle — Contexto del proyecto

## ¿Qué es?
Juego tipo Wordle de personajes de la serie española **"Aquí No Hay Quien Viva"** (Antena 3, 2003-2006).
Fan-made, no oficial. Inspirado en LQSAdle (lqsadle.es).

## Estructura de archivos
```
anhqvdle/
├── index.html          ← Página de inicio
├── clasico.html        ← Modo Clásico
├── frases.html         ← Modo Frases
├── css/style.css       ← Todos los estilos
├── data/
│   ├── characters.js   ← 41 personajes con atributos
│   └── quotes.js       ← 130 frases + 17 emojis
├── js/
│   ├── daily.js        ← Sistema de personaje del día (semilla por fecha)
│   ├── classic.js      ← Lógica modo clásico
│   ├── quote.js        ← Lógica modo frases
│   ├── emoji.js        ← Lógica modo emojis (no usado aún)
│   └── utils.js        ← Funciones compartidas
└── img/
    ├── edificio.png    ← Fondo (fachada del edificio)
    ├── logo.svg        ← Favicon/logo
    ├── favicon.ico     ← Favicon para IE/Edge
    ├── favicon-32.png  ← Favicon 32x32
    ├── apple-touch-icon.png ← Favicon iOS
    └── personajes/     ← Fotos de personajes (.webp/.jpg)
```

## Modos de juego
- **🎯 Clásico** (`clasico.html`) — Adivina el personaje comparando atributos en una tabla. Intentos ilimitados.
- **💬 Frases** (`frases.html`) — Adivina quién dijo la frase. Intentos ilimitados.
- **🔊 Audio** — Próximamente (aparece desactivado en la nav)

## Sistema diario
- El personaje del día se calcula con `getDailyIndex()` usando la fecha como semilla
- Mismo personaje para todos los jugadores ese día
- El estado se guarda en `localStorage` con clave `anhqvdle_[modo]_[fecha]`
- Se resetea automáticamente a las 00:00
- Para pruebas: añadir `?reset` a la URL → aparece botón rojo "Reset día"

## Diseño / Estética
- Fondo: foto del edificio (`img/edificio.png`) con degradado oscuro encima
- Colores: amarillo `#f0c020` (accent), verde `#16a34a` (correcto), rojo `#dc2626` (incorrecto), amarillo para parcial
- Tipografía: Bebas Neue (títulos), Barlow Condensed (tabla/nav), Barlow (cuerpo)
- Nav: pills redondeadas, activo en amarillo
- Tabla: celdas de 108px de alto. Celda de personaje = foto a pantalla completa con `background-image`

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

## Personajes en `characters.js`
Cada personaje tiene:
```js
{
  name: "Emilio Delgado",
  type: "Principal",           // Principal / Secundario / Esporádico
  gender: "Masculino",
  nationality: "Española",
  floors: ["Portería", "3º B"], // Array — vivió en varios pisos
  seasons: [1, 2, 3, 4, 5],    // seasons[0] = temporada de debut
  occupations: ["Portero", "Estudiante universitario"], // Array
}
```

## Fotos de personajes
- Carpeta: `img/personajes/`
- Formato: `.webp` preferido, fallback `.jpg`
- Nombre: slug del personaje (minúsculas, sin tildes, guiones)
  - Ej: "Concha de la Fuente" → `concha-de-la-fuente.webp`
- Falta foto de: **Gregorio** (`gregorio.webp`)

## Frases en `quotes.js`
130 frases reales de ANHQV de 13 personajes distintos.
Cada frase tiene: `quote`, `character`, `hint`.

## Pendiente / Ideas futuras
- Modo Audio: reproducir audios de frases y adivinar el personaje
- Compartir resultado (copiar al portapapeles estilo Wordle)
- Estadísticas del jugador
- Modo difícil

## Cosas a NO cambiar sin avisar
- El sistema `getDailyIndex()` — si se cambia, todos los jugadores verán personajes distintos
- Los nombres de archivo de las fotos — están vinculados al slug del nombre del personaje
- La estructura de `CHARACTERS` en `characters.js` — el juego depende de todos los campos
