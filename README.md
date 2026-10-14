# ANHQVdle 🏠

Juego tipo Wordle de personajes de **Aquí No Hay Quien Viva**.
Fan-made, no oficial. Nuevo personaje y nueva frase cada día.

🌐 **[anhqvdle.es](https://anhqvdle.es)**

---

## Modos de juego

**Diarios** (mismo reto para todos, cuentan para la racha 🔥):
- **🎬 Clásico** — Adivina el personaje del día comparando atributos. Intentos ilimitados.
- **💬 Frases** — Adivina quién dijo la frase mítica. Pista opcional tras 2 fallos.
- **🕵️ El Impostor** — 9 personajes y una categoría: encuentra a los que no encajan.
- **🧩 Conexiones** — Agrupa 12 personajes en 3 grupos de 4. 5 vidas.
- **🖼️ Foto Pixelada** — Reconoce al personaje con la foto pixelada en 5 intentos.

**Libres:**
- **🪞 ¿Quién eres?** — 15 preguntas para descubrir qué vecino de Desengaño 21 eres.
- **🎭 Quién es Quién** — Adivina el personaje del rival preguntando sí/no. Contra la máquina u online.

---

## Características

- Home tipo dashboard: racha global y modos completados hoy
- Racha global diaria + ranking (Clásico, Frases, Impostor, Racha)
- Login con Google o email (Firebase Auth) y stats en la nube
- "Hoy en la comunidad": stats anónimas en tiempo real
- Compartir como texto, imagen o **Stories 9:16**
- PWA instalable con notificaciones push diarias
- Recordatorios por email (Brevo + Cloudflare Worker), con opt-in
- Modo daltónico, responsive y menú hamburguesa en móvil
- 📖 Wiki de la serie: una página por personaje (ficha, frases, vecinos), edificio, temporadas, frases célebres, curiosidades
- Últimos 5 días jugables en modo práctica (no cuentan para racha ni ranking)

📘 **Documentación técnica completa en [PROYECTO.md](PROYECTO.md).**

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

Edita `data/characters.js` y añade un objeto al array `CHARACTERS`.
⚠️ Cambiar la longitud del array cambia el personaje del día del Clásico y de Pixelada para todos (avísalo o hazlo a medianoche).

```js
{
  name: "Nombre Apellido",
  type: "Principal",         // Principal / Secundario / Esporádico
  gender: "Masculino",       // Masculino / Femenino
  nationality: "Española",
  floors: ["2º A"],          // Array de pisos donde vivió
  seasons: [1, 2, 3],        // seasons[0] = temporada de debut
  occupations: ["Profesión"], // Array de trabajos
  hasChildren: false
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
