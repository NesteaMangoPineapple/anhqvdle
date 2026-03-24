# ANHQVdle 🏠

Juego tipo Wordle de personajes de **Aquí No Hay Quien Viva**.
Fan-made, no oficial. Nuevo personaje y nueva frase cada día.

🌐 **[anhqvdle.es](https://anhqvdle.es)**

---

## Modos de juego

- **🎬 Clásico** — Adivina el personaje del día comparando atributos. Intentos ilimitados.
- **💬 Frases** — Adivina quién dijo la frase mítica. Intentos ilimitados.
- **🔊 Audio** — Próximamente

---

## Características

- Personaje y frase nuevos cada día (sincronizados para todos los jugadores)
- Autocompletado con foto y ocupación del personaje
- Animación de revelación de celdas al adivinar
- Muestra el personaje/frase de ayer
- Responsive: funciona en móvil, tablet y escritorio
- Sin backend — solo HTML, CSS y JavaScript vanilla

---

## Estructura del proyecto

```
anhqvdle/
├── index.html          ← Página de inicio
├── clasico.html        ← Modo Clásico
├── frases.html         ← Modo Frases
├── css/style.css       ← Todos los estilos
├── data/
│   ├── characters.js   ← 41 personajes con atributos
│   └── quotes.js       ← 130+ frases de la serie
├── js/
│   ├── daily.js        ← Sistema de personaje del día
│   ├── classic.js      ← Lógica modo clásico
│   ├── quote.js        ← Lógica modo frases
│   ├── utils.js        ← Funciones compartidas
│   └── app.js          ← Controlador de navegación
└── img/
    ├── edificio.png    ← Imagen de fondo
    └── personajes/     ← Fotos de personajes (.webp/.jpg)
```

---

## Cómo ejecutar en local

Abre `index.html` directamente en el navegador. No necesita servidor ni instalación.

---

## Cómo subir cambios

```bash
git add .
git commit -m "descripción del cambio"
git push origin main
```

GitHub Pages se actualiza automáticamente en ~1-2 minutos.

---

## Cómo añadir personajes

Edita `data/characters.js` y añade un objeto al array `CHARACTERS`:

```js
{
  name: "Nombre Apellido",
  type: "Principal",         // Principal / Secundario / Esporádico
  gender: "Masculino",       // Masculino / Femenino
  nationality: "Española",
  floors: ["2º A"],          // Array de pisos donde vivió
  seasons: [1, 2, 3],        // seasons[0] = temporada de debut
  occupations: ["Profesión"] // Array de trabajos
}
```

Añade también su foto en `img/personajes/` con el nombre en slug:
`"Nombre Apellido"` → `nombre-apellido.webp`

## Cómo añadir frases

Edita `data/quotes.js` y añade un objeto al array `QUOTES`:

```js
{ quote: "La frase tal cual", character: "Nombre Apellido", hint: "Pista opcional..." }
```

---

*Fan project — Aquí No Hay Quien Viva es de Globomedia / Antena 3*
