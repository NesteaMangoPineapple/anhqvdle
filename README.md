# ANHQVdle 🏠

Juego tipo Wordle de personajes de **Aquí No Hay Quien Viva**.  
Fan-made, no oficial.

## Modos de juego

- **🎯 Clásico** — adivina el personaje en 8 intentos con pistas por atributos
- **💬 Frase** — adivina quién dijo la frase en 5 intentos
- **😂 Emojis** — descifra el personaje a partir de emojis en 5 intentos

## Estructura del proyecto

```
anhqvdle/
├── index.html          ← HTML principal
├── css/
│   └── style.css       ← Todos los estilos
├── data/
│   ├── characters.js   ← Base de datos de personajes
│   └── quotes.js       ← Frases y emojis
└── js/
    ├── utils.js        ← Funciones compartidas
    ├── classic.js      ← Lógica modo clásico
    ← quote.js         ← Lógica modo frase
    ├── emoji.js        ← Lógica modo emojis
    └── app.js          ← Controlador de navegación
```

## Cómo ejecutar en local

Abre `index.html` directamente en tu navegador. No necesita servidor.

> **Nota:** Si quieres usar `import/export` de ES Modules en el futuro,  
> necesitarás un servidor local (Live Server de VS Code o `npx serve`).

## Cómo publicar en GitHub Pages

```bash
# 1. Inicializa el repositorio
git init
git add .
git commit -m "primer commit"

# 2. Crea el repo en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/anhqvdle.git
git push -u origin main

# 3. En GitHub: Settings → Pages → Source: main branch → Save
# Tu web estará en: https://TU_USUARIO.github.io/anhqvdle
```

## Cómo añadir personajes

Edita `data/characters.js` y añade un objeto al array `CHARACTERS`:

```js
{ name: "Nombre Apellido", type: "Principal", gender: "Masculino", children: 0, floor: "2º A", occupation: "Profesión", seasons: 3 },
```

## Cómo añadir frases

Edita `data/quotes.js` y añade un objeto al array `QUOTES`:

```js
{ quote: "La frase tal cual", character: "Nombre Apellido", hint: "Pista opcional..." },
```

---

*Fan project — Aquí No Hay Quien Viva es de Globomedia / Antena 3*
