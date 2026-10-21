# ANHQVdle — Manual del proyecto

> Última revisión completa: **14/10/2026** (155 commits). Si algo de aquí no cuadra con el código, manda el código.

## ¿Qué es?
Juego diario tipo Wordle sobre la serie **"Aquí No Hay Quien Viva"** (Antena 3, 2003-2006).
Fan-made, no oficial. Inspirado en LQSAdle (lqsadle.es).

- **URL:** https://anhqvdle.es — lanzado el **24/03/2026** (día #1)
- **Repo:** https://github.com/NesteaMangoPineapple/anhqvdle (público)
- **Hosting:** GitHub Pages + dominio `anhqvdle.es` (Arsys) + DNS en Cloudflare
- **Backend:** no hay servidor propio → Firebase (Auth + Realtime Database) + 2 Cloudflare Workers
- **Redes:** [Instagram](https://www.instagram.com/anhqvdle/) · [TikTok](https://www.tiktok.com/@anhqvdle) · [Ko-fi](https://ko-fi.com/anhqvdle)

---

## Estructura de archivos
```
anhqvdle/
├── index.html            ← Home "dashboard": racha, X/5 modos hechos hoy, tarjetas de modos
├── clasico.html          ← 🎬 Modo Clásico (diario)
├── frases.html           ← 💬 Modo Frases (diario)
├── impostor.html         ← 🕵️ El Impostor (diario)
├── conexiones.html       ← 🧩 Conexiones (diario)
├── pixelada.html         ← 🖼️ Foto Pixelada (diario)
├── quiz.html             ← 🪞 ¿Qué personaje eres? (test, no diario)
├── quien.html            ← 🎭 Quién es Quién (vs máquina / online)
├── junta.html            ← 🗳️ Junta de vecinos (encuesta diaria, no cuenta para la racha)
├── contrarreloj.html     ← ⏱️ Contrarreloj (30 s, ilimitado, récords del día)
├── ranking.html          ← 🏆 Ranking global (Clásico, Frases, Impostor, Racha) — noindex, sin anuncios
├── wiki.html             ← 📖 Portada de la wiki (GENERADA: tools/build-wiki.js): buscador, secciones, temporadas
├── personajes.html       ← Wiki: listado de fichas (las fichas se generan con tools/build-personajes.js)
├── personajes/<slug>.html← Wiki: una página por personaje (GENERADAS; 7 esporádicos cortos van con noindex)
├── edificio.html         ← Contenido SEO: quién vivió en cada piso de Desengaño 21
├── frases-celebres.html  ← Contenido SEO: frases icónicas
├── curiosidades.html     ← Contenido SEO: trivia
├── serie.html            ← Contenido SEO: artículo sobre la serie
├── nosotros.html         ← About + créditos a LQSAdle
├── privacidad.html       ← Política de privacidad (noindex) — incluye sección de emails
├── 404.html              ← (noindex)
├── service-worker.js     ← PWA: caché network-first + recepción de push
├── manifest.json (iconos 32/180/192/512 + maskable), CNAME, ads.txt, robots.txt, sitemap.xml, LICENSE (All Rights Reserved)
├── css/style.css         ← TODOS los estilos (~2.600 líneas)
├── data/
│   ├── characters.js     ← 47 personajes (const CHARACTERS); los nuevos llevan `since`
│   ├── quotes.js         ← 236 frases (const QUOTES)
│   ├── descriptions.js   ← Descripción larga de cada personaje (para personajes.html)
│   └── junta.js          ← Preguntas de la Junta de vecinos (SOLO añadir al final)
├── js/
│   ├── daily.js          ← Semillas diarias, _seededShuffle (común a todos los modos), nº de día, localStorage, countdown
│   ├── utils.js          ← escapeHtml está en auth.js · aquí: toSlug, getCharacterEmoji, autocomplete, stats locales, modal stats, daltonismo, Ko-fi, helpers Stories
│   ├── streak.js         ← Racha GLOBAL (cualquier modo diario) + popup + sync Firebase
│   ├── classic.js / quote.js / impostor.js / conexiones.js / pixelada.js  ← lógica de cada modo
│   ├── quiz.js           ← Quiz de personalidad (15 preguntas → 23 resultados)
│   ├── quien.js          ← Quién es Quién vs máquina
│   ├── quien-online.js   ← Quién es Quién online (salas en Firebase)
│   ├── junta.js          ← Junta de vecinos
│   ├── contrarreloj.js   ← Contrarreloj
│   ├── auth.js           ← escapeHtml/safePhotoUrl globales + AuthModule: login, perfil, borrar cuenta (borra users, streaks, leaderboards, push y baja en Brevo)
│   ├── stats-firebase.js ← StatsFirebase: stats por usuario + leaderboard
│   ├── global-stats.js   ← GlobalStats: "Hoy en la comunidad" (anónimo)
│   ├── email-consent.js  ← EmailConsent: modal opt-in + alta en Brevo vía worker
│   ├── pwa.js            ← SW, banner instalar, push, carga email-consent, badge racha, menú hamburguesa
│   ├── firebase-config.js← Config web de Firebase (es pública por diseño; la seguridad está en las reglas)
│   ├── logros.js         ← Logros e insignias (lo inyecta pwa.js en todas las páginas)
│   ├── onboarding.js     ← Recorrido de 3 pasos en la portada para quien entra por primera vez
│   └── tutorial.js       ← Modal "cómo jugar" la primera vez
├── firebase-rules.json   ← Copia de las reglas de la Realtime Database (se publican a mano en la consola)
├── tools/
│   ├── lib/layout.js       ← Plantilla común (cabecera/pie copiados de personajes.html, rutas absolutas)
│   ├── build-personajes.js ← Fichas de personajes.html + personajes/*.html + sitemap
│   └── build-wiki.js       ← wiki.html + sitemap
├── cloudflare-worker/
│   ├── push-worker.js    ← Envía la notificación push diaria
│   └── email-worker.js   ← Brevo: alta/baja de contactos + emails (recordatorio y matutino)
└── img/
    ├── edificio.png, og-image.jpg/png, logo.svg, favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
    ├── emilio-caricatura.png   ← 2,5 MB, no la usa ninguna página (no afecta a la carga)
    └── personajes/             ← 54 fotos (46 en uso + 8 sin usar: Ana_Shiffer, Valentin…)
```

### Orden de carga de scripts (importa)
Firebase SDK 9.23 compat → `firebase-config.js` → `auth.js` → `stats-firebase.js` / `global-stats.js` → `data/*.js` → `daily.js` → `utils.js` → `streak.js` → `<modo>.js` → `pwa.js`.
`pwa.js` inyecta `email-consent.js`, el badge 🔥 de racha y el menú hamburguesa en **todas** las páginas.

---

## Sistema diario (`daily.js`) — ⚠️ NO TOCAR sin avisar
Cada modo elige su reto de forma determinista, así que todos ven lo mismo el mismo día (hora **local** del navegador):

| Modo | Cómo elige el reto | Ciclo |
|---|---|---|
| Clásico | `getDailyIndex(46)` — hash de la fecha YYYYMMDD | aleatorio con repetición |
| Frases | `getDailyQuote()` — barajado con semilla anual (`año*31337`) + día del año | 236 días |
| Impostor | `PUZZLES[getDayNumber() % 20]` + barajado de personajes con semilla del día | 20 categorías |
| Conexiones | Desde el 16/10/2026: `CONEXIONES_V2[getDayNumber() % 120]` (data/conexiones.js, generado). Antes: los 8 a mano | 120 días |
| Pixelada | `seededShuffle(CHARACTERS, día*48271)[0]` | aleatorio |

- `getDayNumber()`: días desde el 24/03/2026 (aritmética de calendario, no de timestamps → a prueba de zonas horarias).
- Estado guardado en `localStorage`: `anhqvdle_<modo>_<YYYYMMDD>`; `cleanOldStorage()` borra los que tienen más de 7 días.
- Al llegar el countdown a 0 la página se recarga sola.
- `?reset` en la URL borra el estado del día (Conexiones y Pixelada).

**Cambiar cualquier semilla o el orden de `CHARACTERS`/`QUOTES`/puzzles cambia el reto del día para todos.**

### Añadir un personaje sin cambiar el reto del día
Clásico, Pixelada e Impostor sortean con `dailyCharacters()` (daily.js), que solo incluye los personajes cuyo `since` (AAAA-MM-DD) ya ha llegado en la fecha del reto. Para añadir uno:
1. Añádelo **al final** de `CHARACTERS` con `since: "<mañana>"` (nunca hoy ni una fecha pasada).
2. Foto en `img/personajes/<slug>.webp|jpg`, descripción en `data/descriptions.js` y emoji en `getCharacterEmoji` (utils.js).
3. `node tools/build-personajes.js && node tools/build-wiki.js`, y actualiza los recuentos escritos a mano en las guías ("los 47 personajes", "22 de 47 son mujeres"…).
Así hoy y los 5 días jugables no cambian (verificado al añadir a La Paqui el 15/10/2026). En el autocompletado aparece desde el primer momento.

---

## Modos de juego

### 🎬 Clásico (`classic.js`)
Intentos ilimitados. Tabla de 8 columnas con animación de giro de celdas (`cellReveal`, desfase `--i * 0.34s`):

| Columna | 🟩 | 🟨 | 🟥 |
|---|---|---|---|
| Personaje | correcto | — | incorrecto |
| Tipo / Género / Nacionalidad | igual | — | distinto |
| Piso(s) | todos iguales | comparte alguno | ninguno |
| Ocupación | todas iguales | comparte alguna | ninguna |
| Hijos | coincide | — | no |
| 1ª temporada | igual | ±1 | lejos + flecha ⬆️⬇️ |

### 💬 Frases (`quote.js`)
Intentos ilimitados. Botón "💡 Revelar pista" tras 2 fallos (opcional, se guarda `hintRevealed`).

### 🕵️ El Impostor (`impostor.js`)
Grid 3×3: una categoría ("Personajes con hijos"…) y entre 2 y 3 impostores que no la cumplen. Una sola confirmación. 1 pista por día (`anhqvdle_imp_hint_<día>`). Tiene ranking.

### 🧩 Conexiones (`conexiones.js`)
12 personajes → 3 grupos de 4 (amarillo/verde/azul), 5 vidas, aviso de "¡Casi!" con 3 de 4. 1 pista por día.
- **Puzzles generados** con `node tools/build-conexiones.js` → `data/conexiones.js` (120 puzzles, semilla fija). Cada categoría es una regla comprobable con las fichas (piso, temporada, tipo, oficio, hijos, familia por apellido) y **cada personaje encaja en un solo grupo**. Así se resolvió la queja de un seguidor (15/10/2026): en un puzzle escrito a mano, 7 personajes encajaban en "Vivieron en el 3º B".
- Los personajes con datos dudosos no salen en puzzles que usen ese dato (`DOUBTFUL` en el generador).
- Los 8 puzzles antiguos (`CONEXIONES_PUZZLES`) solo se usan para fechas anteriores a `CNX_V2_START`, para no cambiar retos ya jugados.
- Si cambias las fichas y regeneras, cambian los puzzles de días futuros: revisa el diff y no publiques a mitad del día si cambia el de hoy.

### 🖼️ Foto Pixelada (`pixelada.js`)
5 intentos; bloques de píxel `[20, 13, 7, 3, 1]` que se van afinando con cada fallo.

### 🪞 ¿Qué personaje eres? (`quiz.js`)
15 preguntas → 23 personajes posibles. No es competitivo ni cuenta para la racha.

### 🎭 Quién es Quién (`quien.js`, `quien-online.js`)
- Pantalla de bienvenida → elegir modo → elegir personaje → partida (clases `.is-setup` / `.is-playing` en `.quien-wrap`).
- **Vs máquina:** la máquina pregunta por búsqueda binaria de atributos.
- **Online:** salas en `rooms/` de Firebase; se borran al desconectar y 60 s después de acabar.
- Stats `quien_machine` y `quien_online` (sin ranking).

### Común a los modos diarios
- Banner de resultado: `#día`, foto, mensaje, 🔥 racha, compartir y countdown.
- **Compartir:** 📋 texto con emojis · 📸 imagen PNG (Clásico/Frases) · 📱 **Stories 9:16** (1080×1920, todos los modos diarios; helpers `_drawStoriesBase`, `_drawStoriesCTA`, `_shareStoriesBlob` y `_withFontsReady` en `utils.js`). Usa `navigator.share` y, si no está disponible, descarga el archivo.
- Popup de Ko-fi ("Invita a Marisa a su chinchón"), como mucho 1 vez por semana.
- Panel "Hoy en la comunidad" (`GlobalStats`): número de jugadores, % de acierto y distribución (la distribución solo en Clásico y Frases).
- Modo daltónico (`body.cb`, `anhqvdle_cb`): `--correct` pasa a azul y `--wrong` a naranja.
- Autocomplete: insensible a tildes, 6 resultados, foto y ocupación; al hacer clic adivina directamente.

---

### 🗳️ Junta de vecinos (`junta.js`, `data/junta.js`)
- Una pregunta de opinión al día: `JUNTA[(getDayNumber() - JUNTA_FIRST_DAY) % JUNTA.length]` (la primera salió el día 212 = 21/10/2026). **Solo añadir preguntas al final**: cambiar el orden cambia la pregunta de cada día y los votos guardados quedarían con otra.
- Opciones: nombre de personaje (foto), `"A + B"` (pareja, dos fotos) o texto. Máximo 6.
- Votos anónimos en `junta/{día}/o{opción}` (transacción +1); tu voto en `anhqvdle_junta_<YYYYMMDD>`. Los resultados se ven al votar y se actualizan en directo. Ordenador: resultados a la derecha (sticky); móvil: debajo, con scroll automático. También enseña qué ganó ayer.
- **No cuenta** para racha, liga, stats ni el X/5 de la portada.

### ⏱️ Contrarreloj (`contrarreloj.js`)
- 30 s, foto + 4 opciones (distractores del mismo género), acierto +1, fallo −3 s. Teclas 1-4 en ordenador. Precarga todas las fotos antes de dejar empezar.
- Récord personal en `anhqvdle_crono` = {best, bestDate, played}. Con sesión, la mejor marca del día va a `crono/{YYYY-MM-DD}/{uid}` (solo si mejora) y se muestra el top 10 de hoy.
- No es diario: no cuenta para racha ni liga.

## Días anteriores — modo práctica
- Cada modo diario acepta `?dia=N`, pero solo para los **últimos 5 días** (`PAST_DAYS_PLAYABLE` en `daily.js`). Cualquier otro valor se ignora.
- `gameDate()` en `daily.js` devuelve la fecha del reto que se juega. Todas las semillas la usan, así que los 5 modos funcionan sin tocar su lógica. `isPracticeMode()` indica si es un día pasado.
- En práctica: `updateStats` y `updateStreak` no hacen nada (ni stats locales, ni Firebase, ni ranking, ni comunidad). El estado se guarda con la clave de ese día.
- `initPastDays()` (utils.js) pinta el aviso azul de práctica y la tira "📅 Días anteriores" encima de la guía.
- **No hay archivo público de soluciones**, a propósito: el contenido se repite (Conexiones cada 8 días, frases cada año) y destriparía retos futuros.

## Logros, celebración, aviso de racha y onboarding (18/10/2026)
- **Celebración al ganar:** `celebrateWin()` (utils.js) lanza confeti en un canvas propio y hace brillar el banner. Se llama desde `updateStats` solo si `won`, así que nunca sale al recargar ni al perder. Respeta `prefers-reduced-motion`.
- **Logros** (`logros.js`, 15 en total): se calculan con lo que ya hay en localStorage (racha y `anhqvdle_stats_<modo>`), así funcionan sin cuenta. Se guardan en `anhqvdle_logros` = `{unlocked: {id: YYYYMMDD}, best}` y, con sesión, se unen con `users/{uid}/logros`. `updateStats` llama a `Logros.onGame()`, que espera 50 ms para que `updateStreak` y `saveDailyState` ya hayan corrido. Al cargar se desbloquean en silencio los que ya se merecían. Se ven desde el botón 🏅 de la portada, el popup de racha y el perfil.
- **Racha en peligro** (pwa.js, todas las páginas): de 21:00 a medianoche, si jugaste ayer y no hoy, el badge 🔥 late (`.at-risk`) y sale una franja bajo la cabecera con la cuenta atrás. Se puede cerrar (hasta el día siguiente, en `sessionStorage`). `updateStreak` emite el evento `anhqvdle:streak` y la franja se quita sola.
- **Onboarding** (`onboarding.js`, solo en index.html): 3 pasos con foco iluminado para quien no ha jugado nunca. Se marca en `anhqvdle_onboarded`.
- **Transiciones:** fundido entre páginas con `@view-transition` (Chrome/Edge/Safari recientes; en el resto no pasa nada) y una barra de carga dorada arriba al pulsar un enlace interno (pwa.js).

## Ventanas emergentes
`AnhqPopups` (pwa.js): las ventanas de notificaciones (20 s), email (25 s) e instalar (30 s) solo salen si el visitante **ya ha jugado** alguna partida, nunca con otra ventana abierta y como mucho una por página. El tutorial y el Ko-fi siguen igual.

## Racha (`streak.js`)
- **Una sola racha global**: sube al completar **cualquier** modo diario (`anhqvdle_streak` = `{count, lastDate: YYYYMMDD}`).
- Badge 🔥 en la cabecera de todas las páginas (`.empty` = 0, `.pending` = jugó ayer y aún no hoy). Al pulsarlo se abre un popup con el estado y el toggle de emails.
- Animación a pantalla completa al empezar la racha y cada 10 días.
- **Sincronización entre dispositivos** (desde el 15/10/2026): al cargar la página con sesión iniciada y al terminar una partida se hace una *transacción* sobre `streaks/{uid}` que **combina** la racha local con la remota (`_mergeStreaks`: si los tramos de días se tocan o solapan se unen; si no, gana la más reciente). El resultado se escribe en los dos lados. Antes la racha local se escribía a ciegas en Firebase: al cambiar de móvil, una racha de 1 día machacaba la buena (queja de un seguidor).
- También actualiza `users/{uid}.lastPlayed/streak` para los emails.
- Aparte, cada modo tiene sus stats locales `anhqvdle_stats_<modo>` (jugadas, % victorias, racha del modo, máxima y distribución con X = perdidas).

---

## Firebase (Realtime Database, europe-west1)
```
users/{uid}/profile               ← creado en el primer login
users/{uid}/stats/{modo}          ← played, won, streak, maxStreak, totalAttempts, lastDate, lastWonDate
users/{uid}/emailConsent          ← {accepted, email, name, timestamp}
users/{uid}/lastPlayed, streak    ← para el worker de emails
leaderboard/{classic|quote|impostor}/{uid}  ← lectura pública
streaks/{uid}                     ← {count, lastDate, name, photo} — ranking de racha
league/{lunes YYYY-MM-DD}/{uid}   ← {name, photo, points, games, updated} — liga semanal (lectura pública)
users/{uid}/logros                ← {id: YYYYMMDD} — logros desbloqueados
global_stats/{YYYY-MM-DD}/{modo}  ← plays, wins, dist_1…dist_6p, dist_X (anónimo)
push_subscriptions/{final de btoa(endpoint), sin + / =} ← {uid|anon_x, subscription, savedAt}
                                  (hasta el 18/10/2026 se usaba el principio, igual para todos los de Chrome: solo quedaba 1)
rooms/{id}                        ← partidas online de Quién es Quién
junta/{día}/o{0-5}                ← votos de la Junta de vecinos (solo suman +1)
crono/{YYYY-MM-DD}/{uid}          ← {name, photo, score, updated} — récord del día del Contrarreloj
```
- Auth: Google (popup) + email/contraseña con verificación. Dominio autorizado extra: `127.0.0.1` (Live Server).
- Las **reglas de seguridad** están copiadas en `firebase-rules.json`, pero las que valen son las de la consola: si cambias una, cambia la otra. Validan tipos y rangos, `global_stats` solo admite sumar +1, y `league` solo deja sumar entre 1 y 10 puntos y 1 reto por escritura.
- `firebase-config.js` aparece en `.gitignore` pero está versionado (y tiene que estarlo para que la web funcione). No pasa nada: la config web de Firebase es pública.

### Ranking (`ranking.html`)
- Pestañas: 📅 Liga semanal (la primera), Clásico, Frases, Impostor y 🔥 Racha.
- **Liga semanal:** cada reto diario terminado (con sesión, no en práctica) suma puntos en `league/{lunes}/{uid}`: ganar a la primera = 10, cada intento de más resta 1 (mínimo 5), Impostor ganado = 10, perder = 1. La suma la hace `StatsFirebase` solo si la partida contó en las stats de ese día. Cada lunes es una rama nueva, así que se reinicia sola. Muestra "te faltan N puntos para superar a X" y el podio de la semana pasada. `leagueWeekId()` está en auth.js.
- Modos diarios: mínimo **5 victorias** para aparecer, ordenado por media de intentos (asc). Racha: mínimo 1 día, top 200.
- La fila del usuario se resalta (`.rank-row-me`).

---

## Notificaciones y emails

### Push (PWA)
- `pwa.js` pide permiso a los 5 s de cargar (o tras instalar) y guarda la suscripción en `push_subscriptions/`.
- Clave VAPID pública en `pwa.js`; la privada está en los secrets del worker.
- `push-worker.js`: **un cron** `5-34 22,23 * * *` (cada minuto de 00:05 a 00:34 de Madrid; las ejecuciones que no caen a las 00:xx de Madrid no hacen nada, así vale en verano y en invierno). Cada minuto envía una **tanda de 24** (minuto 05 → tanda 0…): 1 lectura + 24 envíos + hasta 24 borrados = 49 subrequests, por debajo del límite de 50 del plan gratis. Capacidad: 720 suscriptores (si se acerca, ampliar el rango del cron). Push **sin payload** con `Topic: reto-diario`; borra las caducadas (410/404) por su clave real.
- Secrets: `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `FIREBASE_DB_URL`, `FIREBASE_SECRET`, `CRON_SECRET`.
- La clave privada VAPID se importa como **JWK** (d + x/y sacados de la pública). Hasta el 21/10/2026 se importaba en formato `raw`, que WebCrypto no admite para claves privadas: muy probablemente ningún push se llegó a enviar (salía como "Fallidos" en el log, no como error).

### Email (Brevo, 300 emails/día gratis)
- `email-consent.js`: modal a los 4 s para usuarios logueados que aún no han respondido. Guarda `emailConsent` y llama al worker con el **idToken de Firebase** (alta o baja en Brevo).
- Toggle para activar/desactivar en el popup de racha y en el perfil (al desactivar, se da de baja también en Brevo).
- `email-worker.js` (`https://anhqvdle-email.yeremy8gc.workers.dev`), remitente `hola@anhqvdle.es`:
  - `POST {action: subscribe|unsubscribe, idToken, name}` → verifica el token con Firebase Auth y usa **su** email (nunca uno que venga en el body).
  - `GET|POST /unsubscribe?u=UID&t=FIRMA` → baja de un clic (enlace en el pie de cada email, firmado con HMAC de `CRON_SECRET`). Pone `accepted:false` en Firebase y bloquea el email en Brevo.
  - `GET ?secret=CRON_SECRET[&job=morning]` → lanzar envío a mano.
  - Cron `0 20 * * *` → recordatorio a quien lleva más de 2 días sin jugar (máx. 90, primero las rachas más largas).
  - Cron `0 8 * * *` → email matutino a los suscritos (máx. 200, primero los que jugaron hace menos). Los dos topes suman menos de 300/día (plan gratis de Brevo).
  - Envía en lotes con `messageVersions` (1 petición a Brevo por cada 500 emails) para no pasar del límite de subrequests de Workers.
- Secrets: `BREVO_API_KEY`, `FIREBASE_DB_URL`, `FIREBASE_SECRET`, `CRON_SECRET`.

---

## Diseño
- Fondo `img/edificio.png` con degradado oscuro (`background-attachment: scroll` en móvil por iOS).
- Variables: `--accent: #f0c020`, `--correct: #16a34a`, `--wrong: #dc2626`, `--partial: #f0c020`.
- Fuentes: **Bebas Neue** (títulos), **Barlow Condensed** (tabla/nav), **Barlow** (cuerpo), cargadas con `<link preconnect>` (no `@import`).
- Móvil: menú hamburguesa (lo inyecta `pwa.js`, que añade también Ranking). La tabla del Clásico tiene scroll horizontal con aviso "← Desliza →".
- Login (`.auth-nav-item`) fijo arriba a la derecha.

## SEO / Monetización

### ⚠️ AdSense rechazado por "contenido de poco valor" (octubre 2026)
Google lee el HTML que manda el servidor. Los juegos se pintan con JS, así que para Google las páginas parecían vacías (pixelada: 16 palabras; personajes: 26, porque las fichas estaban dentro de un `<script>`). Cambios del 15/10/2026:
- **Guía estática** bajo el juego en index, clásico, frases, impostor, conexiones, pixelada, quiz y quien (`<section class="mode-guide">`, de 300 a 600 palabras: cómo se juega, estrategia y FAQ).
- **personajes.html** con las 46 fichas en HTML estático (2.900 palabras), generadas con `node tools/build-personajes.js`. Se corrigieron las descripciones de Bea, Mauri, Fernando, Ezequiel y la Hermana Esperanza.
- **ranking.html**: `noindex`, sin anuncios y fuera del sitemap. **privacidad.html**: sin anuncios.
- **Nosotros** ampliado (qué hay, cómo se hace el contenido, historia del proyecto) y enlaces a las páginas de contenido en el pie de todas las páginas.
- **Wiki** (15/10/2026): portada `wiki.html` con buscador, 46 páginas de personaje con ficha, descripción, todas sus frases y vecinos de piso, y botón 📖 Wiki en el menú. Se reescribieron los párrafos de serie.html que repetían las fichas.
- **Regla para el futuro:** toda página indexable con anuncios necesita texto propio en el HTML (no generado por JS). Las páginas sin contenido van con `noindex` y sin el script de AdSense.

- Canonical, OG/Twitter Card y H1 en las páginas indexables; JSON-LD (WebApplication / Article).
- `sitemap.xml` con 17 URLs fijas + las de la wiki (sin privacidad ni 404).
- GA4 `G-9BGR4GH8P7` · Search Console verificado por TXT.
- AdSense `ca-pub-1251819701012590` + `ads.txt` + CMP de Google (RGPD). Script de AdSense y GA4 en todas las páginas (conexiones, pixelada y quien no los tenían hasta el 14/10/2026).

## Infraestructura
- Cloudflare NS: `harlan.ns.cloudflare.com`, `tessa.ns.cloudflare.com`.
- **Registros A → DNS only (gris)** ⚠️ si se ponen en Proxied se rompe la renovación del certificado SSL de GitHub Pages. CNAME `www` → Proxied.
- SSL/TLS **Full**. Cabeceras de seguridad con Transform Rule: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. Bots de IA bloqueados.
```
A     anhqvdle.es  185.199.108.153 / .109 / .110 / .111   DNS only
CNAME www          nesteamangopineapple.github.io           Proxied
TXT   anhqvdle.es  google-site-verification=...             DNS only
```

## Deploy
Si tocas `data/characters.js`, `data/descriptions.js`, `data/quotes.js` o el menú/pie de `personajes.html`, regenera la wiki:
```bash
node tools/build-personajes.js && node tools/build-wiki.js
```
```bash
git add . && git commit -m "..." && git push origin main   # GitHub Pages tarda 1-2 min
```
- Si cambias JS/CSS que están precacheados, **sube `CACHE_NAME` en `service-worker.js`** (ahora es `anhqvdle-v7`; solo cachea archivos propios con respuesta OK).
- Los workers se despliegan a mano en Cloudflare (copiar y pegar o wrangler). No hay `wrangler.toml` en el repo.

---

## Datos de personajes
```js
{ name: "Emilio Delgado", type: "Principal" /* Principal|Secundario|Esporádico */,
  gender: "Masculino", nationality: "Española", floors: ["Portería","3º B"],
  seasons: [1,2,3,4,5] /* seasons[0] = debut */, occupations: ["Portero", ...], hasChildren: false }
```
- Foto: `img/personajes/<slug>.webp` (si no existe, prueba `.jpg` y luego `.jpeg`); slug = `toSlug(name)`.
- Sin frases: Gerardo y Ezequiel Hidalgo. Con muy pocas: Daniel Rubio, Rebeca, Álex Guerra, Abel y José María.
- Relaciones que hay que respetar: Vicenta y Marisa son **hermanas**; Mauri es el padre biológico de Ezequiel, hijo de Bea; Concha es la madre de Armando; Rafael es el padre de Lucía; Carmen tuvo romance con Emilio; Fernando no tiene hijos.

---

## 🐞 Revisión del 14/10/2026

### ✅ Arreglado el 14/10/2026
- **XSS en el ranking y en la cabecera**: nombres y fotos pasan por `escapeHtml` / `safePhotoUrl` (en `auth.js`) y los números se convierten a número.
- **Worker de emails**: exige idToken de Firebase, baja de un clic firmada, baja real al desactivar el toggle, topes diarios y envío en lote.
- **Borrar la cuenta** borra también `streaks/`, `leaderboard/impostor`, suscripciones push y da de baja en Brevo.
- **Conexiones**: las derrotas cuentan (stats, racha, comunidad) y recargar ya no regenera vidas.
- **Pixelada**: recargar ya no regenera intentos; perder también cuenta para la racha.
- **Fechas**: stats de Firebase, "Hoy en la comunidad" y `lastPlayed` usan la fecha local. Además `lastPlayed` ya no se pone a "hoy" con solo abrir la web (eso impedía que saltaran los recordatorios).
- **Push y cambio de hora**: dos crons y comprobación de la hora de Madrid.
- **PWA**: iconos de 192 y 512 px, así que la web ya se puede instalar. El service worker solo cachea archivos propios.
- **SEO**: conexiones y pixelada tienen description, canonical y OG; quien tiene description y OG; las tres llevan AdSense y GA4 (antes no se medían sus visitas).
- Puzzle #1 de Conexiones sin ambigüedad ("Solo 1 temporada (T1 o T2)"); texto del popup de racha corregido.
- Stories de Frases ahora sí dibujan la frase (buscaban `window.quoteTarget`, que no existe). Las de Clásico y Frases usan los helpers comunes y las fuentes del juego, y Clásico muestra como mucho 7 filas.
- Limpieza: `_seededShuffle`, `toSlug` y `getCharacterEmoji` unificados (son idénticos, así que los retos no cambian); borrados `app.js` y `emoji.js`. El perfil muestra Impostor, Conexiones y Pixelada si los has jugado.

### ⏳ Pendiente
- **Reglas de Firebase**: no están en el repo. Revisar que `leaderboard/{modo}/{uid}`, `streaks/{uid}` y `users/{uid}` solo los pueda escribir su dueño, y que `global_stats` solo acepte números.
- ~~Límite de subrequests del push-worker~~ (tandas desde el 21/10/2026).
- Solo 8 puzzles de Conexiones (se repiten cada 8 días).
- 8 fotos sin usar en `img/personajes/` (Ana_Shiffer, Valentin…), quizá para personajes futuros.

## Pendiente / Ideas
- Revisar las reglas de Firebase (ver arriba).
- Más puzzles de Conexiones (ahora solo 8) y más personajes.
- Modo Audio (el más diferenciador).
- **Guardados para más adelante (21/10/2026):** 🏢 El Edificio (colocar 6 vecinos en su piso de la fachada, diario) y 🧠 ¿Quién soy? (pistas que se revelan una a una, diario). Si se añade un modo diario hay que tocar el X/5 de la portada, el logro "Pleno en el rellano" y la regla `games <= 35` de la liga.
- ~~Aviso de racha en peligro, logros, liga semanal con rivalidad y onboarding~~ (hechos el 18/10/2026).

## Cosas que NO hay que cambiar sin avisar
- Las semillas de `daily.js` y de cada modo, el orden de `CHARACTERS`/`QUOTES`/`PUZZLES`/`CONEXIONES_PUZZLES`.
- Los nombres de los personajes (están ligados al slug de la foto, a los puzzles y a las frases).
- La estructura de `CHARACTERS` y las rutas de Firebase (las leen los workers).
- Los registros A de Cloudflare en DNS only.
