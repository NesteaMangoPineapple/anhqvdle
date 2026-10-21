/* ================================================
   ANHQVdle — Junta de vecinos: preguntas de la encuesta diaria
   ⚠️ Solo AÑADIR al final: cambiar el orden cambia la pregunta de cada día
   (y los votos ya guardados quedarían con otra pregunta).
   Cada opción es:
   - el nombre exacto de un personaje de CHARACTERS → sale su foto
   - "Nombre A + Nombre B" → pareja, salen las dos fotos
   - cualquier otro texto → tarjeta de texto
   Máximo 6 opciones por pregunta.
   ================================================ */

// Día (getDayNumber) en que salió la primera pregunta. No tocar.
const JUNTA_FIRST_DAY = 212;

const JUNTA = [
  { q: '¿Quién es el vecino más cotilla de Desengaño 21?', opts: ['Vicenta Benito', 'Marisa Benito', 'Concha de la Fuente', 'Emilio Delgado'] },
  { q: '¿Con qué vecino te irías de cañas?', opts: ['Emilio Delgado', 'Mauri Hidalgo', 'Belén López', 'Armando Rubio'] },
  { q: '¿A quién votarías como presidente de la comunidad?', opts: ['Juan Cuesta', 'Emilio Delgado', 'Mauri Hidalgo', 'Concha de la Fuente'] },
  { q: '¿Cuál es la mejor pareja de la serie?', opts: ['Juan Cuesta + Paloma Hurtado', 'Mauri Hidalgo + Fernando Navarro', 'Lucía Álvarez + Roberto Alonso', 'Emilio Delgado + Carmen Villanueva'] },
  { q: '¿Quién sería el peor compañero de piso?', opts: ['Moncho Heredia', 'Marisa Benito', 'Armando Rubio', 'José Miguel Cuesta'] },
  { q: '¿Quién es el personaje más gracioso?', opts: ['Emilio Delgado', 'Mariano Delgado', 'Marisa Benito', 'Juan Cuesta'] },
  { q: '¿A quién le pedirías consejo amoroso?', opts: ['Belén López', 'Alicia Sanz', 'Mauri Hidalgo', 'Vicenta Benito'] },
  { q: '¿En qué piso te gustaría vivir?', opts: ['Portería', '2º A', '2º B', '3º A', '3º B', 'Ático'] },
  { q: '¿Quién es el vecino más pesado?', opts: ['Concha de la Fuente', 'Paloma Hurtado', 'Mariano Delgado', 'Armando Rubio'] },
  { q: '¿Quién tiene más mala suerte en el amor?', opts: ['Belén López', 'Emilio Delgado', 'Lucía Álvarez', 'Alicia Sanz'] },
  { q: '¿Con quién harías un viaje en coche de ocho horas?', opts: ['Emilio Delgado', 'Mauri Hidalgo', 'Mariano Delgado', 'Yago'] },
  { q: '¿Quién es el personaje más entrañable?', opts: ['Vicenta Benito', 'Mariano Delgado', 'Emilio Delgado', 'Juan Cuesta'] },
  { q: '¿Quién sobreviviría más tiempo en una isla desierta?', opts: ['Higinio Heredia', 'Rafael Álvarez', 'Emilio Delgado', 'Marisa Benito'] },
  { q: '¿Quién es el más dramático del edificio?', opts: ['Paloma Hurtado', 'Lucía Álvarez', 'Juan Cuesta', 'Alicia Sanz'] },
  { q: '¿Quién ganaría una discusión?', opts: ['Marisa Benito', 'Paloma Hurtado', 'Concha de la Fuente', 'Juan Cuesta'] },
  { q: '¿A quién le dejarías las llaves de tu casa?', opts: ['Emilio Delgado', 'Mauri Hidalgo', 'Fernando Navarro', 'Vicenta Benito'] },
  { q: '¿Cuál es la mejor temporada?', opts: ['Temporada 1', 'Temporada 2', 'Temporada 3', 'Temporada 4', 'Temporada 5'] },
  { q: '¿Quién sería el mejor jefe?', opts: ['Andrés Guerra', 'Carlos de Haro', 'Juan Cuesta', 'Rafael Álvarez'] },
  { q: '¿Quién es el mayor liante del edificio?', opts: ['Emilio Delgado', 'Armando Rubio', 'Moncho Heredia', 'José Miguel Cuesta'] },
  { q: '¿Quién arrasaría en un reality?', opts: ['Marisa Benito', 'Belén López', 'Paloma Hurtado', 'Higinio Heredia'] },
  { q: '¿Con quién te quedarías encerrado en un ascensor averiado?', opts: ['Mauri Hidalgo', 'Emilio Delgado', 'Belén López', 'Juan Cuesta'] },
  { q: '¿Quién organizaría la mejor fiesta?', opts: ['Belén López', 'Mauri Hidalgo', 'Armando Rubio', 'Emilio Delgado'] },
  { q: '¿Quién es el más inocente del edificio?', opts: ['Mariano Delgado', 'Emilio Delgado', 'Bea Villarejo', 'Vicenta Benito'] },
  { q: '¿A quién llamarías si te metes en un lío?', opts: ['Fernando Navarro', 'Mauri Hidalgo', 'Emilio Delgado', 'Juan Cuesta'] },
  { q: '¿Quién tiene peor carácter?', opts: ['Marisa Benito', 'Concha de la Fuente', 'Rafael Álvarez', 'Paloma Hurtado'] },
  { q: '¿Quién merecía más protagonismo?', opts: ['Bea Villarejo', 'Nieves Cuesta', 'Carmen Villanueva', 'Gregorio'] },
  { q: '¿Quién cocinaría mejor?', opts: ['Vicenta Benito', 'Mamen Heredia', 'Paloma Hurtado', 'María Jesús'] },
  { q: '¿Quién sería el mejor detective?', opts: ['Vicenta Benito', 'Marisa Benito', 'Concha de la Fuente', 'Emilio Delgado'] },
  { q: '¿Con qué vecino compartirías un secreto?', opts: ['Mauri Hidalgo', 'Belén López', 'Emilio Delgado', 'Lucía Álvarez'] },
  { q: '¿Quién sería el peor vecino de tu edificio de verdad?', opts: ['Concha de la Fuente', 'Paloma Hurtado', 'Moncho Heredia', 'Armando Rubio'] },
  { q: '¿Quién es el más romántico?', opts: ['Roberto Alonso', 'Emilio Delgado', 'Juan Cuesta', 'Mauri Hidalgo'] },
  { q: '¿Quién te cae mejor de los Heredia?', opts: ['Higinio Heredia', 'Mamen Heredia', 'Candela Heredia', 'Raquel Heredia', 'Moncho Heredia'] },
  { q: '¿Quién te cae mejor de los Cuesta?', opts: ['Juan Cuesta', 'Paloma Hurtado', 'Natalia Cuesta', 'José Miguel Cuesta', 'Nieves Cuesta'] },
  { q: '¿Quién es el mejor amigo que se puede tener?', opts: ['Emilio Delgado', 'Mauri Hidalgo', 'Belén López', 'Fernando Navarro'] },
  { q: '¿Quién ganaría al chinchón?', opts: ['Marisa Benito', 'Vicenta Benito', 'Concha de la Fuente', 'Emilio Delgado'] },
  { q: '¿Quién hace más el ridículo?', opts: ['Mariano Delgado', 'Juan Cuesta', 'Emilio Delgado', 'Armando Rubio'] },
  { q: '¿Quién sería el mejor alcalde de Madrid?', opts: ['Juan Cuesta', 'Fernando Navarro', 'Marisa Benito', 'Andrés Guerra'] },
  { q: '¿Quién es más de quedarse en el sofá?', opts: ['Moncho Heredia', 'Emilio Delgado', 'Mariano Delgado', 'José Miguel Cuesta'] },
  { q: '¿Con quién verías una peli de miedo?', opts: ['Belén López', 'Mauri Hidalgo', 'Emilio Delgado', 'Vicenta Benito'] },
  { q: '¿Quién da más miedo cuando se enfada?', opts: ['Paloma Hurtado', 'Marisa Benito', 'Concha de la Fuente', 'Rafael Álvarez'] },
  { q: '¿Quién es el vecino más trabajador?', opts: ['Emilio Delgado', 'Higinio Heredia', 'Lucía Álvarez', 'Fernando Navarro'] },
  { q: '¿Quién sería el mejor tertuliano de la tele?', opts: ['Marisa Benito', 'Concha de la Fuente', 'Juan Cuesta', 'Paloma Hurtado'] },
  { q: '¿Qué vecino tiene el mejor corazón?', opts: ['Vicenta Benito', 'Emilio Delgado', 'Mauri Hidalgo', 'Mariano Delgado'] },
  { q: '¿A quién le tocaría la lotería y se lo contaría a todo el edificio?', opts: ['Emilio Delgado', 'Mariano Delgado', 'Belén López', 'Vicenta Benito'] },
  { q: '¿Quién es el personaje más infravalorado?', opts: ['Fernando Navarro', 'Bea Villarejo', 'Isabel Ruiz', 'Gregorio'] },
  { q: '¿Quién sería el mejor influencer?', opts: ['Alicia Sanz', 'Lucía Álvarez', 'Belén López', 'Mauri Hidalgo'] },
  { q: '¿Con quién te pelearías por el último trozo de pizza?', opts: ['Emilio Delgado', 'Moncho Heredia', 'José Miguel Cuesta', 'Mariano Delgado'] },
  { q: '¿Cuál es el mejor secundario?', opts: ['Gregorio', 'Padre Miguel', 'Hermana Esperanza', 'Paco', 'María Jesús'] },
  { q: '¿Quién tendría más seguidores en TikTok?', opts: ['Mariano Delgado', 'Belén López', 'Marisa Benito', 'Armando Rubio'] },
  { q: '¿Quién es el más ligón?', opts: ['Armando Rubio', 'Pablo Guerra', 'Belén López', 'Yago'] },
  { q: '¿Quién sería el mejor profesor?', opts: ['Roberto Alonso', 'Mariano Delgado', 'Juan Cuesta', 'Isabel Ruiz'] },
  { q: '¿Quién es el más listo del edificio?', opts: ['Fernando Navarro', 'Mariano Delgado', 'Roberto Alonso', 'Marisa Benito'] },
  { q: '¿Quién tiene más estilo vistiendo?', opts: ['Lucía Álvarez', 'Alicia Sanz', 'Mauri Hidalgo', 'Paloma Hurtado'] },
  { q: '¿Quién te daría el mejor susto en Halloween?', opts: ['Concha de la Fuente', 'Marisa Benito', 'Rafael Álvarez', 'Gregorio'] },
  { q: '¿Quién sería el mejor streamer?', opts: ['Mariano Delgado', 'José Miguel Cuesta', 'Belén López', 'Marisa Benito'] },
  { q: '¿Quién es el mejor padre o madre del edificio?', opts: ['Juan Cuesta', 'Paloma Hurtado', 'Mamen Heredia', 'Higinio Heredia'] },
  { q: '¿A quién invitarías a tu boda?', opts: ['Belén López', 'Mauri Hidalgo', 'Emilio Delgado', 'Lucía Álvarez'] },
  { q: '¿Quién tiene la mejor frase de la serie?', opts: ['Juan Cuesta', 'Marisa Benito', 'Paloma Hurtado', 'Mariano Delgado'] },
  { q: '¿Cuál es tu modo favorito de ANHQVdle?', opts: ['Clásico', 'Frases', 'Impostor', 'Conexiones', 'Pixelada', 'Contrarreloj'] },
];
