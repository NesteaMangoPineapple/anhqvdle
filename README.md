# ANHQVdle 🏠

Juego tipo Wordle de personajes de **Aquí No Hay Quien Viva**.
Fan-made, no oficial. Nuevo personaje y nueva frase cada día.

🌐 **[anhqvdle.es](https://anhqvdle.es)**

---

## Modos de juego

- **🎬 Clásico** — Adivina el personaje del día comparando atributos. Intentos ilimitados.
- **💬 Frases** — Adivina quién dijo la frase mítica. Pista opcional tras 2 fallos.
- **🪞 ¿Quién eres?** — 15 preguntas para descubrir qué personaje de Desengaño 21 eres.
- **🎭 Quién es Quién** — Elige un personaje secreto y adivina el del rival preguntando sí/no. Vs máquina u online.
- **🔊 Audio** — Próximamente

---

## Características

- Personaje y frase nuevos cada día (sincronizados para todos los jugadores)
- Autocompletado con foto y ocupación del personaje
- Animación de revelación de celdas al adivinar
- Muestra el personaje/frase de ayer
- Responsive: funciona en móvil, tablet y escritorio
- Modo daltónico (toggle 👁️ en panel lateral)
- Compartir resultado como texto o imagen (Canvas API)
- **Firebase Auth**: login con Google o email/password, verificación por email
- **Ranking global** por modo en ranking.html
- Stats locales (localStorage) + en la nube para usuarios registrados
- PWA: manifest + theme-color

---

## Estructura del proyecto

```
anhqvdle/
├── index.html              ← Página de inicio
├── clasico.html            ← Modo Clásico
├── frases.html             ← Modo Frases
├── quiz.html               ← Quiz ¿Qué personaje eres?
├── quien.html              ← Modo Quién es Quién
├── ranking.html            ← Ranking global
├── serie.html              ← Página editorial SEO
├── privacidad.html         ← Política de privacidad
├── nosotros.html           ← About / créditos
├── css/style.css           ← Todos los estilos
├── data/
│   ├── characters.js       ← 46 personajes con atributos
│   └── quotes.js           ← ~290 frases de la serie
├── js/
│   ├── firebase-config.js  ← Config Firebase (API key, etc.)
│   ├── auth.js             ← Autenticación + perfil de usuario
│   ├── stats-firebase.js   ← Escritura de stats en Firebase
│   ├── daily.js            ← Sistema de personaje/frase del día
│   ├── classic.js          ← Lógica modo clásico
│   ├── quote.js            ← Lógica modo frases
│   ├── quiz.js             ← Lógica quiz personalidad
│   ├── quien.js            ← Lógica Quién es Quién (vs máquina)
│   ├── quien-online.js     ← Lógica Quién es Quién (online)
│   └── utils.js            ← Funciones compartidas
└── img/
    ├── edificio.png        ← Imagen de fondo
    └── personajes/         ← Fotos de personajes (.webp/.jpg)
```

---

## Cómo ejecutar en local

Abre `index.html` directamente en el navegador o usa Live Server (puerto 5500).  
Para auth Firebase funcione en local, asegúrate de que `127.0.0.1` está en los dominios autorizados de Firebase Console → Authentication → Settings.

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
