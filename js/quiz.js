/* ================================================
   ANHQVdle — Quiz ¿Qué personaje eres?
   ================================================ */

const QUIZ_QUESTIONS = [
  {
    q: "Un domingo por la mañana en casa, tú...",
    opts: [
      { text: "Me asomo al descansillo a ver quién sube y baja 👀",            s: { vicenta:3, marisa:1 } },
      { text: "Leo, dibujo o me pongo una maratón de cine 🎬",                 s: { mariano:2, paco:3, roberto:1, carmen:1 } },
      { text: "Hago recados, arreglo cosas, siempre hay algo pendiente 🔧",    s: { emilio:2, higinio:2, bea:1, isabel:1 } },
      { text: "Duermo hasta tarde. Es domingo, para algo existe 😴",            s: { natalia:2, josemi:1, yago:1, andres:1 } }
    ]
  },
  {
    q: "Sabes un secreto comprometedor de un vecino. ¿Qué haces?",
    opts: [
      { text: "Lo guardo para mí, no es asunto mío 🔒",                         s: { fernando:2, bea:1, roberto:1, carmen:1, yago:1 } },
      { text: "Lo cuento en voz baja... solo a «una persona de confianza» 🤫",  s: { vicenta:3, marisa:1, paloma:1 } },
      { text: "Lo guardo para usarlo cuando me convenga 😏",                    s: { andres:3, concha:1 } },
      { text: "Se me escapa sin querer. Lo siento mucho 😬",                    s: { juan:3, natalia:1, josemi:1 } }
    ]
  },
  {
    q: "¿Cómo es tu relación con el dinero?",
    opts: [
      { text: "Siempre busco la siguiente oportunidad de negocio 💰",           s: { andres:3, carlos:1 } },
      { text: "Me llega para vivir tranquilo/a y con eso me basta 🏠",          s: { emilio:2, higinio:1, paloma:1, mamen:1, bea:1 } },
      { text: "El dinero da igual si tienes ideas y tiempo libre 📖",            s: { mariano:3, paco:1, roberto:1, carmen:2 } },
      { text: "Quiero lo mejor de la vida y no me conformo con menos ✨",        s: { concha:2, belen:2, natalia:1, carlos:1 } }
    ]
  },
  {
    q: "En una reunión de vecinos, tú...",
    opts: [
      { text: "Tomo la iniciativa aunque acabe todo peor que antes 🙋",         s: { juan:3, emilio:1 } },
      { text: "Suelto el comentario más certero justo en el momento exacto 🗡️", s: { marisa:3, andres:1, vicenta:1 } },
      { text: "Defiendo mis derechos hasta las últimas consecuencias 💼",        s: { concha:2, fernando:2, carmen:1 } },
      { text: "Prefiero no ir. Si voy, no abro la boca 🪑",                     s: { paco:3, josemi:3, roberto:2, mariano:1 } }
    ]
  },
  {
    q: "¿Cómo eres como amigo/a?",
    opts: [
      { text: "El mejor amigo/a del mundo. Siempre disponible ❤️",              s: { mauri:3, emilio:1, paloma:1 } },
      { text: "Leal y constante: pocos amigos pero de verdad 🤝",               s: { bea:2, josemi:1, lucia:1, carmen:1, higinio:1, mamen:1, isabel:1 } },
      { text: "Me llevo bien con todos pero sin profundizar demasiado 😊",      s: { natalia:2, carlos:2, belen:1 } },
      { text: "Intenso/a: cuando quiero a alguien es todo o nada 🔥",           s: { roberto:2, juan:1, mauri:1, yago:1 } }
    ]
  },
  {
    q: "¿Con qué tipo de trabajo te sientes más identificado/a?",
    opts: [
      { text: "Algo manual: arreglar, construir, crear con las manos 🔨",       s: { higinio:3, emilio:1 } },
      { text: "Algo artístico o intelectual: escribir, dibujar, diseñar ✏️",    s: { roberto:3, carmen:3, lucia:2, mariano:2, josemi:1 } },
      { text: "Algo con visibilidad: escenario, cámara, foco 🎤",               s: { belen:2, carlos:3, natalia:1 } },
      { text: "Cuidar de otros: personas, animales o familia 🐾",               s: { bea:2, mamen:2, paloma:1, isabel:2 } }
    ]
  },
  {
    q: "¿Cuál es tu mayor defecto (sé honesto/a)?",
    opts: [
      { text: "Soy cotilla y me entero de todo. No puedo evitarlo 👅",          s: { vicenta:3, marisa:1, juan:1 } },
      { text: "Soy vago/a o lo dejo todo para mañana 😴",                       s: { mariano:2, paco:2, josemi:1 } },
      { text: "Soy demasiado dramático/a y me complico la vida 🎭",             s: { concha:2, belen:2, juan:1, natalia:1 } },
      { text: "Soy rígido/a y me cuesta salirme de mis normas 📋",              s: { fernando:3, higinio:1 } }
    ]
  },
  {
    q: "Alguien te lleva la contraria. ¿Cómo reaccionas?",
    opts: [
      { text: "Argumento con calma hasta demostrar que tengo razón ⚖️",         s: { fernando:3, marisa:2, carmen:2, bea:1 } },
      { text: "Me enciendo en el momento pero se me pasa enseguida 🔥",         s: { juan:2, concha:1, natalia:1, belen:1 } },
      { text: "Me lo tomo con humor y paso a otra cosa 😄",                     s: { mauri:2, paco:1, carlos:1, emilio:1, andres:1 } },
      { text: "Me lo trago, me cuesta el enfrentamiento directo 😶",            s: { paloma:2, mamen:2, josemi:2, roberto:1, isabel:1 } }
    ]
  },
  {
    q: "¿Qué importancia le das al aspecto físico?",
    opts: [
      { text: "Mucha. La primera impresión lo es casi todo 💅",                 s: { belen:3, carlos:2, natalia:1, concha:1 } },
      { text: "Me cuido sin obsesionarme. Hay más cosas importantes 🙂",        s: { mauri:1, lucia:1, bea:1, yago:1, isabel:1 } },
      { text: "Poca. Lo que de verdad vale está por dentro 📚",                 s: { mariano:2, paco:2, roberto:1, higinio:1 } },
      { text: "Lo mínimo para salir a la calle con dignidad 😅",                s: { emilio:1, fernando:1, josemi:2, mamen:1 } }
    ]
  },
  {
    q: "¿Cómo es tu espacio en casa?",
    opts: [
      { text: "Funcional y ordenado: cada cosa en su sitio 🗂️",                s: { fernando:2, emilio:2, higinio:1, isabel:1 } },
      { text: "Lleno de libros, películas, cómics o arte 🎨",                   s: { mariano:2, paco:2, roberto:2, josemi:2, carmen:2, lucia:1 } },
      { text: "Decorado con gusto y estilo, que diga algo de quien vive ahí ✨", s: { mauri:2, concha:1, belen:1, carlos:1 } },
      { text: "Un poco caótico, pero lleno de vida 🌿",                         s: { juan:1, natalia:1, yago:2, bea:1, lucia:1 } }
    ]
  },
  {
    q: "¿Cuánto te importa lo que piensen los demás de ti?",
    opts: [
      { text: "Mucho. El qué dirán importa y lo reconozco 👁️",                 s: { concha:2, belen:2, paloma:1 } },
      { text: "Me da igual. Hago lo que quiero sin pedir permiso 😎",           s: { yago:2, paco:2, marisa:1, lucia:1 } },
      { text: "Lo mínimo para no crear conflictos innecesarios 🕊️",            s: { mamen:2, paloma:1, isabel:1, emilio:1 } },
      { text: "Solo me importa la opinión de quienes me conocen de verdad 💙",  s: { mauri:2, josemi:2, bea:1, roberto:1, higinio:1, fernando:1 } }
    ]
  },
  {
    q: "¿Cómo eres en el amor?",
    opts: [
      { text: "Apasionado/a e intenso/a: el amor lo es todo 💘",                s: { concha:2, carmen:2, belen:1, juan:1, natalia:1, roberto:1 } },
      { text: "Estable y fiel: el amor es para siempre 💑",                     s: { paloma:2, higinio:1, mamen:2, emilio:1, isabel:1 } },
      { text: "Complicado: hay sentimientos pero siempre hay algún obstáculo 🌊", s: { mauri:2, josemi:3, lucia:2, carmen:2, roberto:1 } },
      { text: "Libre: vivo el momento sin dramas ni ataduras 🌬️",              s: { yago:2, carlos:2, andres:1, natalia:1 } }
    ]
  },
  {
    q: "Si pudieras vivir en cualquier lugar del mundo...",
    opts: [
      { text: "En mi barrio, cerca de los míos. El hogar es el hogar 🏘️",      s: { emilio:2, paloma:1, higinio:1, vicenta:1, mamen:1 } },
      { text: "En otro país, descubrir mundo y reinventarme 🌍",                s: { yago:3, lucia:1, natalia:1 } },
      { text: "En un piso grande con clase y vistas al centro 🏙️",             s: { concha:2, belen:1, carlos:1, mauri:1, andres:1 } },
      { text: "Aquí mismo está bien. ¿Para qué moverse si ya tengo todo? 🛋️",  s: { paco:3, mariano:1, josemi:1 } }
    ]
  },
  {
    q: "¿Cuál es tu mayor virtud?",
    opts: [
      { text: "La lealtad: soy de los que siempre están 🤝",                    s: { emilio:2, mauri:2, paloma:1, mamen:1 } },
      { text: "La inteligencia y el ingenio 🧠",                                s: { marisa:2, carmen:3, fernando:1, andres:1, roberto:1, mariano:1 } },
      { text: "El entusiasmo: contagio energía a quienes me rodean ⚡",          s: { juan:2, carlos:1, belen:1, natalia:1 } },
      { text: "La resiliencia: me levanto siempre, pase lo que pase 💪",        s: { bea:2, lucia:1, higinio:1, yago:1, concha:1 } }
    ]
  },
  {
    q: "¿Cuál de estas frases podría salir de tu boca?",
    opts: [
      { text: "«¿Quién ha dicho eso? ¡Cuéntamelo todo!» 🗣️",                   s: { vicenta:3, marisa:1 } },
      { text: "«Las cosas se hacen bien o no se hacen» 💪",                     s: { fernando:2, higinio:2, emilio:1 } },
      { text: "«Yo solo intento ayudar... ¿por qué siempre acaba así?» 🤡",     s: { juan:3, paloma:1 } },
      { text: "«La vida hay que disfrutarla» 🎉",                               s: { mauri:2, belen:1, carlos:1, natalia:1, yago:1 } }
    ]
  }
];

const QUIZ_RESULTS = {
  emilio:   { name: "Emilio Delgado",      desc: "Eres responsable, trabajador y con un buen corazón que no cabe en el pecho. Tienes la rara virtud de hacer lo correcto aunque nadie te lo pida ni te lo agradezca. Eres el pegamento que mantiene unido el edificio.",                                                                        emoji: "🧹" },
  mariano:  { name: "Mariano Delgado",     desc: "Eres un soñador/a con muchísima cultura y más ideas que ganas de llevarlas a cabo. Vives en tu propio mundo de proyectos que raramente se materializan... pero qué compañía tan entretenida.",                                                                                                emoji: "📚" },
  vicenta:  { name: "Vicenta Benito",      desc: "Cotilla de primera categoría y sin ninguna vergüenza. No pasa nada en el edificio sin que tú te enteres antes que nadie. Eres el sistema de información más rápido y menos discreto de Desengaño 21.",                                                                                        emoji: "🌸" },
  marisa:   { name: "Marisa Benito",       desc: "Cotilla con estilo y una mala leche de campeonato. Siempre tienes el comentario afilado a punto, la ironía es tu idioma materno y no hay personaje que se te escape.",                                                                                                                        emoji: "🚬" },
  concha:   { name: "Concha de la Fuente", desc: "Dramática, mandona y con las ideas muy claras sobre cómo debería funcionar el mundo... que es exactamente como tú quieres. Tienes un don especial para el caos con clase.",                                                                                                                   emoji: "👵" },
  mauri:    { name: "Mauri Hidalgo",       desc: "El mejor amigo/a que se puede tener. Leal, empático/a, divertido/a y siempre ahí cuando más se te necesita. Eres el alma de cualquier reunión y la persona que todos quieren tener cerca.",                                                                                                   emoji: "🌈" },
  fernando: { name: "Fernando Navarro",    desc: "Serio/a, principios claros y una brújula moral que nunca falla. A veces demasiado rígido/a, pero eres exactamente en quien todos confían cuando las cosas se ponen feas de verdad.",                                                                                                          emoji: "⚖️" },
  bea:      { name: "Bea Villarejo",       desc: "Independiente, práctica y con un instinto protector muy fuerte. No necesitas que nadie te rescate, pero cuando los demás lo necesitan, tú ya estás ahí.",                                                                                                                                     emoji: "🐾" },
  juan:     { name: "Juan Cuesta",         desc: "Tienes una energía arrolladora y una voluntad de ayudar sin límites. El problema es que siempre acaba todo peor de lo que empezó. Bienintencionado/a hasta el caos más absoluto.",                                                                                                           emoji: "📋" },
  paloma:   { name: "Paloma Hurtado",      desc: "Dulce, generosa y completamente entregada a quienes quieres. Tu bondad es tu mayor virtud y a veces tu mayor vulnerabilidad. Todo el mundo debería tener una Paloma en su vida.",                                                                                                            emoji: "🕊️" },
  natalia:  { name: "Natalia Cuesta",      desc: "Impulsiva, vital y con mucho carácter. Vas a lo tuyo sin pedir permiso, lo que unas veces te da alas y otras te mete en líos. Nunca se puede decir que seas aburrido/a.",                                                                                                                    emoji: "💅" },
  josemi:   { name: "José Miguel Cuesta",  desc: "Callado/a por fuera, volcán por dentro. Tienes sentimientos muy profundos que no sabes muy bien cómo expresar, y tus historias de amor siempre acaban siendo más complicadas de lo que esperabas. Quien te conoce de verdad sabe que merece la pena.",                                             emoji: "🤓" },
  paco:     { name: "Paco",               desc: "El videoclub es tu templo y el cine tu religión. Sabes más de películas que de personas, y eso te hace una compañía única para quien comparte tu pasión. Rebobina y disfruta.",                                                                                                               emoji: "📼" },
  andres:   { name: "Andrés Guerra",       desc: "Siempre tienes un plan entre manos... y no siempre es del todo legal. Eres un oportunista nato con mucho encanto. El dinero huele bien desde cualquier ángulo y tú tienes muy buen olfato.",                                                                                                 emoji: "💼" },
  lucia:    { name: "Lucía Álvarez",       desc: "Libre, independiente y con un sentido muy claro de lo que está bien y lo que no. Defiendes tus valores con convicción aunque no sea cómodo. Eres auténtico/a hasta los huesos.",                                                                                                             emoji: "🎨" },
  roberto:  { name: "Roberto Alonso",      desc: "Creativo/a, observador/a y con un mundo interior muy rico. No sueles mostrar todo lo que sientes, pero quien se toma el tiempo de conocerte descubre a alguien extraordinario.",                                                                                                             emoji: "✏️" },
  belen:    { name: "Belén López",         desc: "Ambicioso/a, encantador/a y con los pies en la tierra cuando hace falta. Sueñas a lo grande y no te conformas con menos. Esta vida es tuya y lo sabes perfectamente.",                                                                                                                      emoji: "💃" },
  carlos:   { name: "Carlos de Haro",      desc: "Carismático/a, encantador/a y con un punto de vanidad que todo el mundo te perdona. Te mueves en cualquier ambiente y sabes exactamente cómo causar buena impresión.",                                                                                                                      emoji: "🎸" },
  higinio:  { name: "Higinio Heredia",     desc: "Práctico/a, trabajador/a y muy de tu familia. No hay problema que no tenga solución si se le aplica el sentido común y las manos. El hombre/la mujer para todo del edificio.",                                                                                                              emoji: "🔨" },
  mamen:    { name: "Mamen Heredia",       desc: "Paciente, cariñosa y con una fortaleza silenciosa que pocos notan. Eres el centro tranquilo de tu entorno, aunque no siempre se te reconozca como mereces.",                                                                                                                                emoji: "🍲" },
  yago:     { name: "Yago",               desc: "Misterioso/a, libre y con tus propias reglas. Vienes y te vas cuando quieres, y en ese vaivén dejas huella en todo el que te conoce. No te define ningún lugar ni ninguna etiqueta.",                                                                                                        emoji: "🌿" },
  isabel:   { name: "Isabel Ruiz",         desc: "Discreta, cariñosa y con una fuerza interior que va creciendo con el tiempo. No siempre llevas la voz cantante, pero estás ahí para los tuyos cuando más importa.",                                                                                                                         emoji: "🏠" },
  carmen:   { name: "Carmen Villanueva",   desc: "Intelectual, apasionada y con una conversación que engancha desde el primer momento. Llegas desde fuera y lo revolucionas todo sin pretenderlo. Te enamoras de quien menos esperabas y eso lo complica todo... pero también lo hace más interesante.",                                       emoji: "📖" }
};

let currentQ = 0;
let scores   = {};

function initQuiz() {
  Object.keys(QUIZ_RESULTS).forEach(k => scores[k] = 0);
  currentQ = 0;
  showIntro();
}

function showIntro() {
  document.getElementById('quiz-wrap').innerHTML = `
    <div class="quiz-intro">
      <div class="quiz-intro-icon">🪞</div>
      <h2 class="quiz-intro-title">¿Qué vecino de Desengaño 21 eres?</h2>
      <p class="quiz-intro-desc">Responde ${QUIZ_QUESTIONS.length} preguntas y descubre qué personaje de <strong>Aquí No Hay Quien Viva</strong> se esconde en ti.</p>
      <button class="guess-btn" style="font-size:1.1rem;padding:14px 40px" onclick="startQuiz()">¡Empezar!</button>
    </div>`;
}

function startQuiz() {
  Object.keys(QUIZ_RESULTS).forEach(k => scores[k] = 0);
  currentQ = 0;
  showQuestion();
}

function showQuestion() {
  const q        = QUIZ_QUESTIONS[currentQ];
  const progress = Math.round((currentQ / QUIZ_QUESTIONS.length) * 100);
  document.getElementById('quiz-wrap').innerHTML = `
    <div>
      <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${progress}%"></div></div>
      <p class="quiz-counter">${currentQ + 1} / ${QUIZ_QUESTIONS.length}</p>
      <h2 class="quiz-question">${q.q}</h2>
      <div class="quiz-options">
        ${q.opts.map((o, i) => `<button class="quiz-option" onclick="selectAnswer(${i})">${o.text}</button>`).join('')}
      </div>
    </div>`;
}

function selectAnswer(i) {
  document.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
  document.querySelectorAll('.quiz-option')[i].classList.add('selected');

  const s = QUIZ_QUESTIONS[currentQ].opts[i].s;
  Object.entries(s).forEach(([k, v]) => scores[k] = (scores[k] || 0) + v);

  setTimeout(() => {
    currentQ++;
    if (currentQ < QUIZ_QUESTIONS.length) showQuestion();
    else showResult();
  }, 350);
}

function showResult() {
  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const r      = QUIZ_RESULTS[winner];
  const slug   = r.name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  document.getElementById('quiz-wrap').innerHTML = `
    <div class="quiz-result">
      <p class="quiz-result-label">¡Eres...</p>
      <div class="quiz-result-avatar">
        <img src="img/personajes/${slug}.webp" alt="${r.name}"
          onerror="if(this.src.endsWith('.webp')){this.src=this.src.replace('.webp','.jpg')}else if(this.src.endsWith('.jpg')){this.src=this.src.replace('.jpg','.jpeg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
        <span class="emoji-fallback" style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:3rem">${r.emoji}</span>
      </div>
      <h2 class="quiz-result-name">${r.name}</h2>
      <p class="quiz-result-desc">${r.desc}</p>
      <div class="quiz-result-actions">
        <button class="share-btn" onclick="shareQuizResult('${r.name}')">📋 Compartir resultado</button>
        <button class="guess-btn" onclick="startQuiz()">🔄 Repetir test</button>
      </div>
    </div>`;
}

function shareQuizResult(charName) {
  const text = `Soy ${charName} en ANHQVdle 🎭\n¿Y tú cuál eres? Descúbrelo en anhqvdle.es/quiz.html`;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.share-btn');
    if (!btn) return;
    btn.textContent = '¡Copiado! ✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Compartir resultado'; btn.classList.remove('copied'); }, 2000);
  });
}

initQuiz();
