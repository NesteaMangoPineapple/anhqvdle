const QUOTES = [
  // JUAN CUESTA
  { quote: "¡Qué follón!", character: "Juan Cuesta", hint: "El presidente de la comunidad, siempre en medio del caos..." },
  { quote: "¡Esto es de república bananera!", character: "Juan Cuesta", hint: "Suele decirlo en las juntas de vecinos cuando todo se desmadra..." },
  { quote: "Y lo digo sin acritud, pero ¡lo digo!", character: "Juan Cuesta", hint: "Frase marca de la casa del presidente de la comunidad..." },
  { quote: "Iniciamos hoy una nueva legislatura en esta nuestra comunidad que estará presidida por el lema: ¡Talante y pa'lante!", character: "Juan Cuesta", hint: "Discurso inaugural del presidente del 2º A..." },
  { quote: "¡Impugno la junta!", character: "Juan Cuesta", hint: "Su recurso favorito cuando pierde una votación..." },
  { quote: "Juan Cuesta, presidente de esta nuestra comunidad", character: "Juan Cuesta", hint: "Así se presenta siempre, con toda la pompa posible..." },
  { quote: "Don Bartolomé Méndez Zuloaga, maestro y mentor", character: "Juan Cuesta", hint: "Cita a su predecesor en la presidencia con reverencia..." },
  { quote: "Primer punto del día", character: "Juan Cuesta", hint: "Abre todas las juntas con esta frase el del 2º A..." },
  { quote: "Pico, mazo, pico, pico, mazo", character: "Juan Cuesta", hint: "Con su mazo de presidente intenta poner orden..." },
  { quote: "Queridos convecinos", character: "Juan Cuesta", hint: "Así llama a sus vecinos el presidente de la comunidad..." },
  { quote: "Aquí ya me chantajea hasta el perro de Vicenta", character: "Juan Cuesta", hint: "El del 2º A lamentándose de su situación en el edificio..." },
  { quote: "Esto es una alteración de elementos comunes", character: "Juan Cuesta", hint: "Su argumento favorito cuando algo le molesta en el edificio..." },

  // PALOMA
  { quote: "¡Confiésalo todo Juan, o me caigo muerta aquí mismo!", character: "Paloma Hurtado", hint: "La mujer del presidente, dramática donde las haya..." },
  { quote: "Ya está la pija restregándonos su dinero", character: "Paloma Hurtado", hint: "Hablando de la vecina del 3º A con su marido..." },
  { quote: "¡Hombre ya!", character: "Paloma Hurtado", hint: "Exclamación favorita de la mujer del presidente..." },
  { quote: "Mi marido es el presidente de la comunidad de vecinos, un hombre respetable", character: "Paloma Hurtado", hint: "Siempre defendiendo el cargo de su marido del 2º A..." },
  { quote: "PUF: Paloma Urban Fashion. Dilo tú Juan, dilo ¡PUF!", character: "Paloma Hurtado", hint: "Su intento de crear una marca de moda en el 2º A..." },
  { quote: "La masa está para manipularla. Todo por el pueblo, pero sin el pueblo", character: "Paloma Hurtado", hint: "La estratega política del 2º A..." },
  { quote: "Y punto en boca, ¿eh?", character: "Paloma Hurtado", hint: "La mujer del presidente zanjando cualquier discusión..." },
  { quote: "Me he quedado muerta, Juan: ¡me he quedado muerta!", character: "Paloma Hurtado", hint: "Reacción dramática de la vecina del 2º A ante cualquier noticia..." },
  { quote: "¡Huy! ¡La Hierbas, se le ha subido el tomillo a la cabeza!", character: "Paloma Hurtado", hint: "Comentando sobre su vecina del 2º B y sus terapias naturales..." },
  { quote: "Las caras, Juan, las caras", character: "Paloma Hurtado", hint: "Riñendo a su marido el presidente por sus expresiones..." },
  { quote: "Que yo te llame borracha no significa que no te aprecie", character: "Paloma Hurtado", hint: "La diplomacia particular de la mujer del presidente..." },
  { quote: "Puteríos aquí no, Juan, aquí ¡no!", character: "Paloma Hurtado", hint: "La vecina del 2º A poniendo límites muy claros..." },
  { quote: "¡El chalé, Juan, el chalé!", character: "Paloma Hurtado", hint: "El sueño inalcanzable de la mujer del presidente del 2º A..." },
  { quote: "La Pija nos tiene envidia y eso yo no lo aguanto, ¿eh, Juan?", character: "Paloma Hurtado", hint: "La mujer del presidente sobre su vecina del 3º A..." },

  // VICENTA
  { quote: "No le hagas caso, desde que la dejó Manolo está amargada", character: "Vicenta Benito", hint: "Defendiendo a su hermana del 1º A con cariño ingenuo..." },
  { quote: "Ver la tele es muy malo, lo han dicho hoy en la tele", character: "Vicenta Benito", hint: "La lógica particular de la jubilada del 1º A..." },
  { quote: "¡Qué bien! ¡Lesbiana! Esos se llevan muy bien con los géminis", character: "Vicenta Benito", hint: "La vecina más ingenua del edificio, vive en el 1º A..." },
  { quote: "¿Y esto es hacer el amor? Parece un poco ridículo...", character: "Vicenta Benito", hint: "La solterona del 1º A descubriendo cosas de la vida..." },
  { quote: "¿Sabéis por qué el caballo se mueve en 'L'? Porque acaba de sacarse el carnet de conducir", character: "Vicenta Benito", hint: "Los chistes de la jubilada del 1º A no tienen rival..." },
  { quote: "Yo quiero pintar el salón más moderno... De gotelé", character: "Vicenta Benito", hint: "La decoradora del 1º A con ideas muy vanguardistas..." },
  { quote: "Otra vez comprando tabaco, ¿qué hiciste con el de ayer?", character: "Vicenta Benito", hint: "Regañando a su hermana del 1º A sin resultado alguno..." },
  { quote: "¿Y para qué queréis el cuarto oscuro? ¿Reveláis fotos?", character: "Vicenta Benito", hint: "La inocente del 1º A sin entender nada de lo que pasa..." },
  { quote: "Marisa dice que son gays, pero yo creo que son homosexuales de esos...", character: "Vicenta Benito", hint: "Hablando de sus vecinos del 1º B con su habitual ingenuidad..." },

  // MARISA
  { quote: "Qué mona va esta chica siempre", character: "Marisa Benito", hint: "La cínica del 1º A refiriéndose a la vecina pija del 3º A..." },
  { quote: "Movida, movida", character: "Marisa Benito", hint: "El comentario favorito de la fumadora del 1º A..." },
  { quote: "A ese me lo tiré", character: "Marisa Benito", hint: "La amargada del 1º A presumiendo de su pasado..." },
  { quote: "No intentes acojonarnos. Si Pinochet se libró por viejo, nosotras con más motivo", character: "Marisa Benito", hint: "La veterana del 1º A sin miedo a nada..." },
  { quote: "Está a dos cigarros de aquí", character: "Marisa Benito", hint: "La forma de medir distancias de la fumadora del 1º A..." },
  { quote: "Ella misma se ha condenado, porque yo, con los egoísmos, ¡es que no puedo!", character: "Marisa Benito", hint: "La del 1º A que siempre tiene algo que decir sobre todo el mundo..." },
  { quote: "¡Qué va! Si este es mentolado, con este me curo yo los catarros", character: "Marisa Benito", hint: "La fumadora empedernida del 1º A justificando su vicio..." },
  { quote: "Nave nodriza llamando a Vicenta: aterriza... Cambio", character: "Marisa Benito", hint: "Hablando con su hermana ingenua del 1º A..." },
  { quote: "¡Un desalojo, otra ocupación!", character: "Marisa Benito", hint: "La crónica del 1º A sobre los movimientos del edificio..." },
  { quote: "¡Paco, otra vez se me ha tragado dos euros la máquina!", character: "Marisa Benito", hint: "La queja habitual de la del 1º A al dueño del videoclub..." },
  { quote: "Os vais a cagar, ¡Radio Patio se va a cebar más con vosotros que la Cope con Zapatero!", character: "Marisa Benito", hint: "La portavoz de Radio Patio amenazando a los vecinos..." },
  { quote: "Radio Patio 24 horas, así han pasado las cosas, así las hemos contado", character: "Marisa Benito", hint: "El cierre informativo de la emisora del 1º A..." },
  { quote: "¿Y qué le importa a esta gente lo que me hizo a mí Manolo?", character: "Marisa Benito", hint: "La amargada del 1º A sacando a relucir su divorcio..." },
  { quote: "¡Anarquía! ¡A las barricadas!", character: "Marisa Benito", hint: "La revolucionaria del 1º A boicoteando la junta de vecinos..." },
  { quote: "Un pitillo, un traguito de chinchón... ¡y a la cama!", character: "Marisa Benito", hint: "La rutina nocturna de la fumadora del 1º A..." },
  { quote: "Radio Patio ya no da abasto, tenemos que contratar becarios", character: "Marisa Benito", hint: "La directora de informativos del 1º A desbordada de noticias..." },
  { quote: "Desde fuera parece un poco ridículo... desde dentro es la leche", character: "Marisa Benito", hint: "Una reflexión muy directa de la veterana del 1º A..." },

  // CONCHA
  { quote: "¡Váyase, señor Cuesta! ¡Váyase!", character: "Concha de la Fuente", hint: "Su frase más icónica dirigida al presidente de la comunidad..." },
  { quote: "¡Yo no pago otra derrama!", character: "Concha de la Fuente", hint: "La vecina más ahorradora del edificio ante cualquier gasto..." },
  { quote: "¡Chorizo!", character: "Concha de la Fuente", hint: "Su insulto favorito para el presidente de la comunidad..." },
  { quote: "Luna de miel homosexual en Kenia, Alicante", character: "Concha de la Fuente", hint: "Comentando la boda de sus vecinos del 1º B con confusión geográfica..." },
  { quote: "Este un día nos pone a todas contra los buzones", character: "Concha de la Fuente", hint: "Advirtiendo sobre el presidente de la comunidad..." },
  { quote: "¡Gentuza!", character: "Concha de la Fuente", hint: "El insulto colectivo de la jubilada del edificio..." },
  { quote: "A mí mi Antonio me dejó bien servida en eso", character: "Concha de la Fuente", hint: "Recordando a su difunto marido con nostalgia la vecina mayor..." },
  { quote: "Levanta Vicenta, que este es mal sitio para hacerse la muerta", character: "Concha de la Fuente", hint: "A su amiga del 1º A en uno de sus desmayos dramáticos..." },
  { quote: "¡Qué no son horas!", character: "Concha de la Fuente", hint: "La guardiana de los horarios del edificio..." },
  { quote: "¡Golfas!", character: "Concha de la Fuente", hint: "Su apodo cariñoso para las chicas del 3º B..." },
  { quote: "Soy Concha, entro", character: "Concha de la Fuente", hint: "La presentación más directa del edificio Desengaño 21..." },

  // MAURI
  { quote: "Bea, me lo debes, yo te di mi semen", character: "Mauri Hidalgo", hint: "Recordándole a su mejor amiga del 1º B el favor que le hizo..." },
  { quote: "¡Vamos a solucionar esto como homosexuales civilizados!", character: "Mauri Hidalgo", hint: "El vecino del 1º B intentando mediar en un conflicto..." },
  { quote: "¡Envidia de pene!", character: "Mauri Hidalgo", hint: "El periodista del 1º B con su particular psicoanálisis..." },
  { quote: "Yo también me he pasado muchas noches esperando a que me llamases para no cogértelo", character: "Mauri Hidalgo", hint: "El celoso del 1º B hablando con su pareja..." },
  { quote: "Esta chica es de algún grupo integrista de lesbianas, AlBoyera o algo así", character: "Mauri Hidalgo", hint: "El vecino del 1º B con sus teorías conspiratorias..." },
  { quote: "Pero ¿quién se puede levantar a estas horas? Aparte de Iñaki Gabilondo", character: "Mauri Hidalgo", hint: "El periodista del 1º B quejándose de madrugar..." },
  { quote: "Yo quiero llevarle al fútbol, ignorarle cuando sea adolescente, lo que hacen los padres", character: "Mauri Hidalgo", hint: "El vecino del 1º B hablando de su hijo Ezequiel..." },
  { quote: "¿Me estáis llamando hetero? ¡Se acabó la fiesta, fuera todo el mundo!", character: "Mauri Hidalgo", hint: "El del 1º B muy ofendido ante una insinuación..." },
  { quote: "Me voy a casa, que se deprime uno mejor estando tumbado", character: "Mauri Hidalgo", hint: "El dramático del 1º B retirándose con elegancia..." },
  { quote: "Seguid conversando tranquilos. Que yo me pongo a leer las cartas del banco y la indignación me abstrae completamente", character: "Mauri Hidalgo", hint: "El irónico del 1º B buscando su propia distracción..." },

  // LUCÍA
  { quote: "¡Yo lo único que os pido es que no me metáis en esto!", character: "Lucía Álvarez", hint: "La abogada del 3º A intentando mantenerse al margen..." },
  { quote: "¡Pero bueno!", character: "Lucía Álvarez", hint: "La reacción más frecuente de la pija del 3º A..." },
  { quote: "Si no tienen vida propia hagan un puzzle o apúntense a un cursillo de alemán", character: "Lucía Álvarez", hint: "La del 3º A aconsejando a sus cotillas vecinos..." },
  { quote: "Es que, cuando me entra el bajón, ¡compro!", character: "Lucía Álvarez", hint: "La terapia de la abogada del 3º A..." },
  { quote: "Paloma, ¡vete a la mierda!", character: "Lucía Álvarez", hint: "La pija del 3º A perdiendo los modales con su vecina del 2º A..." },
  { quote: "Nieves, si querías provocarme, ¡lo has conseguido!", character: "Lucía Álvarez", hint: "La abogada del 3º A al límite con la hermana de Juan..." },
  { quote: "¿Habéis hecho una junta para hundirme?", character: "Lucía Álvarez", hint: "La vecina del 3º A sintiéndose víctima de la comunidad..." },
  { quote: "Me veré obligada a recurrir al socorrido mecanismo de mandarles a freír espárragos", character: "Lucía Álvarez", hint: "La abogada del 3º A amenazando con elegancia..." },
  { quote: "Enfatizo en tonos más agudos con alguna lágrima esporádica", character: "Lucía Álvarez", hint: "La del 3º A siendo consciente de su propio drama..." },

  // ROBERTO
  { quote: "¡Vamos, no me jodas!", character: "Roberto Alonso", hint: "La reacción más habitual del arquitecto del 3º A..." },
  { quote: "Los padres son como el alcohol. ¡No es bueno mezclar!", character: "Roberto Alonso", hint: "La filosofía de vida del vecino del 3º A..." },
  { quote: "No estaba tan pillado con una serie desde que a Heidi se le cayó Clarita por un terraplén", character: "Roberto Alonso", hint: "El friki del 3º A comparando sus series favoritas..." },
  { quote: "Yo soy un tío sensible... Veo La 2", character: "Roberto Alonso", hint: "El arquitecto del 3º A presumiendo de cultura..." },
  { quote: "Si yo antes ligaba, a mí me entraban las tías, y ahora me dejan hasta las feas", character: "Roberto Alonso", hint: "El vecino del 3º A lamentando su suerte con las mujeres..." },
  { quote: "Carlos, no te obsesiones que te obsesionas", character: "Roberto Alonso", hint: "El del 3º A dando consejos a su amigo del mismo piso..." },
  { quote: "Que el del banco me ha contado un chiste a plazo fijo y me vencía ahora", character: "Roberto Alonso", hint: "El arquitecto del 3º A con sus ingeniosas comparaciones..." },
  { quote: "Si yo estoy madurando, pero en lo que maduro del todo...", character: "Roberto Alonso", hint: "El eterno inmaduro del 3º A reflexionando sobre su vida..." },
  { quote: "Eso es como cuando te compras un coche de segunda mano y descubres que el cuentakilómetros está trucado, mal rollo", character: "Roberto Alonso", hint: "Las metáforas del vecino del 3º A tienen mucho de mecánica..." },
  { quote: "Juan, a este edificio no le pasa nada, te lo digo yo que soy arquitecto", character: "Roberto Alonso", hint: "El del 3º A dando garantías estructurales con mucha confianza..." },

  // EMILIO
  { quote: "Un poquito de por favor", character: "Emilio Delgado", hint: "La petición más famosa del portero de Desengaño 21..." },
  { quote: "¡Cipote!", character: "Emilio Delgado", hint: "El insulto favorito del portero del edificio..." },
  { quote: "La ira lleva al odio, el odio al lado oscuro y en el lado oscuro lo cojo y lo reviento", character: "Emilio Delgado", hint: "La filosofía Star Wars del portero de Desengaño 21..." },
  { quote: "Un poquito de caridad cristiana", character: "Emilio Delgado", hint: "El portero apelando a la bondad de sus vecinos..." },
  { quote: "Apaguen sus teléfonos móviles y no fumen. Para hablar me levantan la mano y para insultar también me la levantan", character: "Emilio Delgado", hint: "El portero convertido en profesor dando sus normas de clase..." },
  { quote: "Me voy a cagar en todo lo cagable", character: "Emilio Delgado", hint: "La expresión de enfado del portero de Desengaño 21..." },
  { quote: "Mala, que eres mala. ¡Bicho!", character: "Emilio Delgado", hint: "El portero del edificio dirigiéndose a alguien con cariño..." },
  { quote: "Buenas tardes, soy don Emilio Delgado, voy a dar clase de lengua y tengo muy mala hostia", character: "Emilio Delgado", hint: "La presentación del portero convertido en profesor universitario..." },
  { quote: "¿Te pelo un kiwi?", character: "Emilio Delgado", hint: "La oferta más misteriosa del portero de Desengaño 21..." },
  { quote: "Yo soy el portero, un profesional de la información", character: "Emilio Delgado", hint: "El habitante de la portería definiéndose a sí mismo..." },

  // MARIANO
  { quote: "Ignorante de la vida", character: "Mariano Delgado", hint: "El insulto favorito del padre del portero..." },
  { quote: "Soy Mariano Delgado, metrosexual y pensador", character: "Mariano Delgado", hint: "La presentación del padre del portero, muy orgulloso de sí mismo..." },
  { quote: "¿Te saco unas cervecitas para equilibrar el PH?", character: "Mariano Delgado", hint: "El remedio universal del padre del portero para todo problema..." },
  { quote: "Ahora tienes la sensación de que se te viene el mundo encima, pero verás cómo mañana te levantas mucho peor", character: "Mariano Delgado", hint: "Los consuelos particulares del padre del portero..." },
  { quote: "Me exfolio, luego existo. El primer mandamiento del metrosexual", character: "Mariano Delgado", hint: "La filosofía de vida del vendedor de libros de la portería..." },
  { quote: "No he podido evitar oíros porque estaba escuchando", character: "Mariano Delgado", hint: "El cotilla oficial de la portería con su lógica aplastante..." },
  { quote: "Los sentimientos, la asignatura pendiente del ser humano", character: "Mariano Delgado", hint: "La profundidad inesperada del padre del portero..." },
  { quote: "Le miro poco para no cogerle cariño, como a tu madre", character: "Mariano Delgado", hint: "La ternura a su manera del padre del portero..." },
  { quote: "No pienses, que es una trampa", character: "Mariano Delgado", hint: "El consejo más útil del vendedor de libros de la portería..." },
  { quote: "Bastante perjudicado está el perjudicado como para perjudicarle más", character: "Mariano Delgado", hint: "La lógica irrefutable del padre que vive en la portería..." },
  { quote: "A mí me encanta el rey, le voto en todas las elecciones", character: "Mariano Delgado", hint: "El ciudadano ejemplar de la portería y su educación cívica..." },
  { quote: "Las construcciones tardan en asentarse cinco años, de toda la vida de Dios", character: "Mariano Delgado", hint: "El experto en todo del piso de la portería..." },

  // BELÉN
  { quote: "Vete un poquito a la mierda", character: "Belén López", hint: "La respuesta favorita de la chica del 3º B..." },
  { quote: "Mire Doña Concha, llevo mucho tiempo queriéndole decir: váyase usted a la mierda", character: "Belén López", hint: "La inquilina del 3º B soltando lo que lleva tiempo guardando..." },
  { quote: "Voy a acabar sola y amargada", character: "Belén López", hint: "La premonición de la chica del 3º B sobre su futuro..." },
  { quote: "Concha, tus golfas no te olvidan", character: "Belén López", hint: "La vecina del 3º B dirigiéndose a la propietaria del piso..." },
  { quote: "En el campo y con tacones, parezco un travesti", character: "Belén López", hint: "La chica del 3º B fuera de su elemento natural..." },
  { quote: "Yo de pequeña hacía gimnasia rítmica y tengo los músculos de la vagina muy desarrollados", character: "Belén López", hint: "La vecina del 3º B con sus confesiones inesperadas..." },
  { quote: "El vibrador y el microondas es lo que nos ha hecho entrar en el siglo XXI", character: "Belén López", hint: "La inquilina del 3º B reflexionando sobre los grandes avances de la humanidad..." },
  { quote: "No tengo casa, no tengo piso, no tengo novio, no tengo nada", character: "Belén López", hint: "El inventario existencial de la chica del 3º B..." },
  { quote: "Ya me he cansado de ser el patito feo, a partir de ahora voy a ser el patito... ¡TERMINATOR!", character: "Belén López", hint: "La inquilina del 3º B declarando su nueva actitud ante la vida..." },
  { quote: "Mi vida es una mierda", character: "Belén López", hint: "El diagnóstico vital más conciso de la chica del alquiler del 3º B..." },
  { quote: "Cuando a otra persona le va tan mal como a mí, me siento... integrada en la sociedad", character: "Belén López", hint: "La solidaridad particular de la inquilina del 3º B..." },

  // ALICIA
  { quote: "¡Qué mala es la envidia!", character: "Alicia Sanz", hint: "La compañera de piso del 3º B con su frase de cabecera..." },
  { quote: "Si eres guapa la vida ya te compensa", character: "Alicia Sanz", hint: "La filosofía vital de la vecina del 3º B..." },
  { quote: "¿Cada vez que ves un tío guapo tiene que ser gay?", character: "Alicia Sanz", hint: "La frustración amorosa de la chica del 3º B..." },
  { quote: "Estoy confundida, es la primera vez que un tío que me gusta no me hace caso", character: "Alicia Sanz", hint: "La del 3º B sin entender a los hombres del edificio..." },
  { quote: "Si no me acuerdo de los nombres, me voy a acordar de los teléfonos", character: "Alicia Sanz", hint: "La estrategia de la vecina del 3º B para ligar..." },
  { quote: "El portero y la del tercero. Parece una peli porno", character: "Alicia Sanz", hint: "La comentarista del 3º B sobre sus propios vecinos..." },
  { quote: "Es la ventaja de salir con Emilio, que nadie te lo va a quitar", character: "Alicia Sanz", hint: "La valoración de la chica del 3º B sobre el portero..." },
  { quote: "El hambre en el mundo, las guerras, la gente fea... ¡Cuando Rosa perdió Eurovisión!", character: "Alicia Sanz", hint: "La escala de tragedias de la vecina del 3º B..." },

  // JOSÉ MIGUEL
  { quote: "¿Hamburguesas vegetales? Eso es una contradicción en sí misma", character: "José Miguel Cuesta", hint: "El hijo del presidente del 2º A con su sabiduría adolescente..." },
  { quote: "Mamá, no existe una relación directa entre el volumen de tu voz y el caso que te vayamos a hacer", character: "José Miguel Cuesta", hint: "El hijo del 2º A explicándole algo importante a su madre..." },
  { quote: "Yo voy haciendo una lista de geriátricos para planificar mi venganza", character: "José Miguel Cuesta", hint: "El hijo del presidente del 2º A planificando el futuro..." },
  { quote: "Bueno, pero tranquilita, ¿eh?", character: "José Miguel Cuesta", hint: "El hijo del presidente del 2º A poniendo calma a su madre..." },
  { quote: "Cuidado, que te busco un geriátrico en el que aten a los viejos", character: "José Miguel Cuesta", hint: "La amenaza favorita del adolescente del 2º A..." },

  // ISABEL
  { quote: "Me estoy hiperventilando", character: "Isabel Ruiz", hint: "La hipocondríaca del 2º A ante cualquier situación de estrés..." },
  { quote: "Mátala, Juan, tienes que matarla, ¡mátala!", character: "Isabel Ruiz", hint: "La naturópata del 2º A perdiendo los papeles..." },
  { quote: "¡Juan! Que esto no es el Titanic, que el presidente no tiene que morir con el edificio", character: "Isabel Ruiz", hint: "La del 2º A poniendo en perspectiva la situación a su pareja..." },
  { quote: "Y la nave de E.T., ¿se va a quedar mucho entre nosotros o va a volver pronto a su planeta?", character: "Isabel Ruiz", hint: "La hierbas del 2º A con una pregunta muy concreta..." },
  { quote: "¿Y la eutanasia me la cubre la seguridad social o me va a dejar sufrir?", character: "Isabel Ruiz", hint: "La hipocondríaca del 2º A explorando todas las opciones..." },
  { quote: "Bueno, Juan, yo me voy a esnifar pegamento a la papelería", character: "Isabel Ruiz", hint: "La naturópata del 2º A con una salida inesperada..." },
  { quote: "Dialoga con tu miedo, dile: 'Hola, ¿qué quieres de mí?'", character: "Isabel Ruiz", hint: "Los consejos terapéuticos de la del 2º A..." },
  { quote: "La vida son ciclos: hay ciclos que estás ¡plof! y hay ciclos que estás ¡uh!", character: "Isabel Ruiz", hint: "La filosofía new age de la vecina del 2º A..." },
  { quote: "Si no se me valora yo me hago un nudito aquí en el corazón y me voy por donde he venido", character: "Isabel Ruiz", hint: "La amenaza más tierna de la hierbas del 2º A..." },

  // FERNANDO NAVARRO
  { quote: "Mauri, lo nuestro merece más que esto", character: "Fernando Navarro", hint: "El abogado del 1º B en una conversación seria con su pareja..." },
  { quote: "Soy abogado, no mago", character: "Fernando Navarro", hint: "El legal del 1º B cuando le piden algo imposible..." },
  { quote: "En Londres aprendes a valorar lo que tienes aquí", character: "Fernando Navarro", hint: "El vecino del 1º B tras su temporada fuera de España..." },

  // BEA VILLAREJO
  { quote: "Con los animales me entiendo mucho mejor que con las personas", character: "Bea Villarejo", hint: "La veterinaria del 1º B expresando su filosofía de vida..." },
  { quote: "Yo también tengo derecho a ser madre", character: "Bea Villarejo", hint: "La vecina del 1º B reivindicando algo muy importante para ella..." },
  { quote: "Mauri, para. Respira. Ahora habla", character: "Bea Villarejo", hint: "La amiga íntima del periodista del 1º B poniéndole freno..." },
  { quote: "A los animales hay que tratarles con más respeto del que os tratáis vosotros", character: "Bea Villarejo", hint: "La veterinaria del edificio con una lección moral para sus vecinos..." },

  // DIEGO ÁLVAREZ
  { quote: "Soy el hermano de Lucía, no su secretario", character: "Diego Álvarez", hint: "El del 1º B aclarando su identidad ante los vecinos de su hermana..." },
  { quote: "Mauri, hay cosas que no se pueden explicar", character: "Diego Álvarez", hint: "El vecino del 1º B hablando con el periodista del piso..." },
  { quote: "Me da igual lo que piensen los vecinos", character: "Diego Álvarez", hint: "El hermano de la del 3º A siendo directo sobre la opinión ajena..." },

  // NATALIA CUESTA
  { quote: "¡Que no soy una niña, papá!", character: "Natalia Cuesta", hint: "La hija del presidente del 2º A reclamando su independencia..." },
  { quote: "Es que en este edificio es imposible tener vida privada", character: "Natalia Cuesta", hint: "La hija de los del 2º A harta de los cotilleos vecinales..." },
  { quote: "¿Es que nadie puede enamorarse en paz aquí?", character: "Natalia Cuesta", hint: "La joven del 2º A quejándose de la intromisión de sus vecinos..." },
  { quote: "Yamiley es mía y de Yago, y punto", character: "Natalia Cuesta", hint: "La madre del bebé del edificio siendo contundente..." },

  // YAGO
  { quote: "El planeta no puede esperar mientras vosotros discutís por el portal", character: "Yago", hint: "El ecologista cubano del edificio con perspectiva medioambiental..." },
  { quote: "En Cuba, la comunidad de vecinos funciona de otra manera, mi amor", character: "Yago", hint: "El del ático comparando España con su país de origen..." },
  { quote: "El sabor de la vida está en las cosas sencillas", character: "Yago", hint: "La filosofía del ecologista caribeño del edificio..." },

  // ARMANDO CORTÉS
  { quote: "Mamá, que ya soy mayor para estas cosas", character: "Armando Cortés", hint: "El hijo de la propietaria del 2º B resistiéndose a su madre..." },
  { quote: "Soy un hombre libre, eso es todo", character: "Armando Cortés", hint: "El soltero del 2º B explicando su filosofía de vida..." },
  { quote: "Las mujeres siempre complican todo", character: "Armando Cortés", hint: "El womanizer del 2º B con su particular visión del amor..." },

  // ANDRÉS GUERRA
  { quote: "Los negocios son los negocios, no lo mezcles con sentimientos", character: "Andrés Guerra", hint: "El empresario del 2º B con su filosofía del mundo..." },
  { quote: "Todo es cuestión de saber moverse, y yo me muevo muy bien", character: "Andrés Guerra", hint: "El hombre de negocios del 2º B presumiendo de habilidades..." },
  { quote: "Hacienda somos todos. Yo los represento a todos y por eso pago lo menos posible", character: "Andrés Guerra", hint: "El empresario del 2º B con su interpretación particular de las obligaciones fiscales..." },

  // PABLO GUERRA
  { quote: "Paso de todo. En serio, de todo", character: "Pablo Guerra", hint: "El joven del ático con su actitud ante la vida..." },
  { quote: "Es que en este edificio no se puede vivir", character: "Pablo Guerra", hint: "El inquilino del ático compartiendo una opinión con la mayoría..." },
  { quote: "Yo soy un tío normal metido en una familia de locos", character: "Pablo Guerra", hint: "El hijo de los del 2º B describiendo su situación familiar..." },

  // ÁLEX GUERRA
  { quote: "¿Y a mí qué me contáis?", character: "Álex Guerra", hint: "El pequeño de los del 2º B sin interés en los dramas del edificio..." },
  { quote: "Voy a mi cuarto", character: "Álex Guerra", hint: "La respuesta más habitual del adolescente de los Guerra..." },

  // HIGINIO HEREDIA
  { quote: "Eso lo arreglo yo en un momento", character: "Higinio Heredia", hint: "El manitas del 2º B ante cualquier avería del edificio..." },
  { quote: "Juan, con todo el respeto, usted no sabe ni poner un enchufe", character: "Higinio Heredia", hint: "El carpintero del 2º B siendo sincero con el presidente..." },
  { quote: "La presidencia de la comunidad es una responsabilidad muy seria", character: "Higinio Heredia", hint: "El vecino del 2º B tomándose muy en serio su cargo temporal..." },
  { quote: "Yo vengo de abajo y no me avergüenzo de nada", character: "Higinio Heredia", hint: "El manitas del 2º B siendo orgulloso de sus orígenes..." },

  // MAMEN HEREDIA
  { quote: "Higinio, si no arreglas esto ahora mismo, a ver si el único que vas a arreglar eres tú", character: "Mamen Heredia", hint: "La mujer del manitas del 2º B dando órdenes en casa..." },
  { quote: "En esta comunidad nos miran por encima del hombro y me tiene harta", character: "Mamen Heredia", hint: "La fisioterapeuta del 2º B cansada del clasismo vecinal..." },
  { quote: "Mira que sois raros, vecinos de ciudad", character: "Mamen Heredia", hint: "La recién llegada al 2º B con su visión de los vecinos del edificio..." },

  // CANDELA HEREDIA
  { quote: "Yo salí en un anuncio de yogur, ¿sabes?", character: "Candela Heredia", hint: "La pequeña del 2º B presumiendo de su carrera artística..." },
  { quote: "Es que yo tengo mucho tirón, ¿vale?", character: "Candela Heredia", hint: "La joven promesa del 2º B explicando su popularidad..." },
  { quote: "¡Mamá, me están mirando!", character: "Candela Heredia", hint: "La niña actriz del 2º B con conciencia de ser observada..." },

  // RAQUEL HEREDIA
  { quote: "Soy quien soy, y no pienso cambiar por nadie", character: "Raquel Heredia", hint: "La vecina del 2º B reivindicando su identidad con firmeza..." },
  { quote: "A mí me miran raro, pero yo les miro peor", character: "Raquel Heredia", hint: "La del 2º B con una actitud muy clara ante los prejuicios del edificio..." },

  // MONCHO HEREDIA
  { quote: "Estoy buscando trabajo, no me agobies", character: "Moncho Heredia", hint: "La respuesta estándar del mayor de los Heredia ante las preguntas incómodas..." },
  { quote: "A los treinta años un hombre está en su mejor momento, ¿no?", character: "Moncho Heredia", hint: "El vividor del 2º B buscando justificaciones para seguir en casa de sus padres..." },
  { quote: "Papá, el emprendimiento lleva su tiempo", character: "Moncho Heredia", hint: "El hijo mayor de los del 2º B con grandes planes y nulos resultados..." },

  // CARLOS DE HARO
  { quote: "Dinero tengo. Lo que no tengo es tiempo para tonterías", character: "Carlos de Haro", hint: "El adinerado del 3º A dejando clara su posición..." },
  { quote: "Roberto, eres mi mejor amigo, pero a veces eres un idiota", character: "Carlos de Haro", hint: "El del 3º A siendo sincero con su amigo de siempre..." },
  { quote: "En este edificio o estás loco o te vuelves loco", character: "Carlos de Haro", hint: "La conclusión del adinerado del 3º A tras varios años en Desengaño 21..." },
  { quote: "Lucía no me quiere, pero yo no lo acepto", character: "Carlos de Haro", hint: "El obsesivo del 3º A siendo brutalmente sincero consigo mismo..." },

  // NIEVES CUESTA
  { quote: "Aquí mando yo mientras mi hermano no sepa mandar", character: "Nieves Cuesta", hint: "La hermana del presidente tomando las riendas de la comunidad..." },
  { quote: "Soy La Chunga, cariño, y no me pises", character: "Nieves Cuesta", hint: "La cuñada de los del 2º A dejando muy claro su carácter..." },
  { quote: "Juan siempre ha sido muy blando. Sale a su padre", character: "Nieves Cuesta", hint: "La hermana del presidente siendo muy directa sobre su familia..." },

  // RAFAEL ÁLVAREZ
  { quote: "Ese edificio lo voy a comprar aunque sea lo último que haga", character: "Rafael Álvarez", hint: "El constructor padre de la del 3º A con su obsesión inmobiliaria..." },
  { quote: "El dinero no da la felicidad, pero a mí tampoco me la ha quitado", character: "Rafael Álvarez", hint: "La filosofía vital del empresario padre de la abogada pija..." },
  { quote: "Lucía, soy tu padre, y te digo que ese chico no te conviene", character: "Rafael Álvarez", hint: "El empresario interfiriendo en la vida sentimental de su hija del 3º A..." },

  // CARMEN VILLANUEVA
  { quote: "Soy profesora de universidad, no la portera", character: "Carmen Villanueva", hint: "La catedrática del 3º B aclarando su estatus profesional..." },
  { quote: "En mis clases no se habla, se escucha", character: "Carmen Villanueva", hint: "La del 3º B aplicando sus normas universitarias en el edificio..." },
  { quote: "Emilio, lo nuestro no tiene ningún futuro", character: "Carmen Villanueva", hint: "La profesora del 3º B siendo directa con el portero..." },
  { quote: "Soy la Rottenmeier y me lo habéis ganado a pulso", character: "Carmen Villanueva", hint: "La vecina más estricta del 3º B asumiendo su apodo..." },

  // ANA
  { quote: "Llevo tres días en el aire y ni me saludáis", character: "Ana", hint: "La azafata del 3º B llegando del trabajo sin que nadie la reciba..." },
  { quote: "No, no, no. Yo vengo de Frankfurt, no de la esquina", character: "Ana", hint: "La del 3º B dejando claro que viene de lejos..." },
  { quote: "En Alemania esto no pasaría", character: "Ana", hint: "La azafata del 3º B comparando su país con lo que ve en el edificio..." },

  // MARÍA JESÚS
  { quote: "Es el gen López de tu padre", character: "María Jesús", hint: "La madre de la del 3º B explicando el origen de todos los problemas..." },
  { quote: "¡Tonta, hija, es que eres tonta!", character: "María Jesús", hint: "La madre de la inquilina del 3º B con sus palabras de aliento..." },
  { quote: "¡He hecho torrijas!", character: "María Jesús", hint: "El anuncio culinario favorito de la madre de la chica del 3º B..." },
  { quote: "El tupper lo quiero con vuelta, ¡eh!, que esos los uso mucho", character: "María Jesús", hint: "La madre de la del 3º B con sus prioridades muy claras..." },
  { quote: "¿Ya has visto a mi hija Belén? ¡Aprovecha que ahora está sola!", character: "María Jesús", hint: "La madre de la inquilina del 3º B haciendo de intermediaria sentimental..." },

  // PACO
  { quote: "Hola, soy Paco, director de cine", character: "Paco", hint: "La presentación oficial del dueño del videoclub del edificio..." },
  { quote: "¡Qué cabrón, qué cabrón!", character: "Paco", hint: "La admiración involuntaria del dueño del videoclub ante las maniobras de algún vecino..." },
  { quote: "Las peleas para afuera, que luego con la confusión siempre me faltan chicles", character: "Paco", hint: "El dueño del videoclub poniendo orden en su local..." },
  { quote: "Esta semana, dos por uno en películas de ficción", character: "Paco", hint: "Las ofertas irresistibles del empresario audiovisual del edificio..." },
  { quote: "Yo de política no sé, pero de cine sé más que nadie en este edificio", character: "Paco", hint: "El experto cinematográfico del local comercial del edificio..." },

  // GREGORIO
  { quote: "La derrama está aprobada y hay que pagarla, señores", character: "Gregorio", hint: "El administrador de fincas de Desengaño 21 sin contemplaciones..." },
  { quote: "Los números no mienten, y estos números son un desastre", character: "Gregorio", hint: "El gestor del edificio con su diagnóstico contable de la comunidad..." },

  // PADRE MIGUEL
  { quote: "Dios nos perdone a todos en este edificio, que falta nos hace", character: "Padre Miguel", hint: "El sacerdote de San Marcos con su valoración espiritual del vecindario..." },
  { quote: "He compuesto una canción que refleja el alma de esta comunidad", character: "Padre Miguel", hint: "El cura compositor de San Marcos presentando otra de sus obras..." },
  { quote: "La fe mueve montañas, pero la derrama necesita dinero contante y sonante", character: "Padre Miguel", hint: "El párroco de San Marcos siendo muy pragmático con las cuentas..." },

  // HERMANA ESPERANZA
  { quote: "Radio Patio, al aire con la gracia de Dios", character: "Hermana Esperanza", hint: "La locutora del programa vecinal más escuchado del edificio..." },
  { quote: "El Señor trabaja de maneras misteriosas, pero este edificio ya lo supera", character: "Hermana Esperanza", hint: "La monja presentadora ante los desmanes del vecindario..." },
  { quote: "Rezo todos los días por estos vecinos. Todos los días", character: "Hermana Esperanza", hint: "La religiosa del programa Radio Patio expresando su devoción..." },

  // DANIEL RUBIO
  { quote: "¿Puedo irme ya?", character: "Daniel Rubio", hint: "El hijo del que vivía en el 2º B con ganas de escapar del edificio..." },

  // REBECA
  { quote: "Papá, ¿cuándo nos vamos?", character: "Rebeca", hint: "La hija del que vivía en el 2º B lista para abandonar Desengaño 21..." },

  // ROCÍO
  { quote: "Emilio Delgado, eres lo peor que le ha pasado al correo español", character: "Rocío", hint: "La cartera del edificio dejando muy claro su opinión sobre el portero..." },
  { quote: "Llevo años repartiendo correo en esta calle y nunca me había pasado algo así", character: "Rocío", hint: "La trabajadora de Correos ante una situación sin precedentes en Desengaño 21..." },
  { quote: "Me cambio de ruta. Me cambio de ruta y de vida", character: "Rocío", hint: "La cartera del edificio tomando una decisión drástica tras una decepción..." },

  // JOSÉ MARÍA
  { quote: "Yo vivo como quiero, y quiero vivir así", character: "José María", hint: "El personaje alternativo del entorno del edificio explicando su estilo de vida..." },
  { quote: "Desde aquí se ve todo el edificio, y me sé todos los secretos", character: "José María", hint: "El observador externo del edificio Desengaño 21..." },

  // ABEL
  { quote: "Ezequiel es el niño más listo que he cuidado en mi vida", character: "Abel", hint: "El canguro del 1º B presumiendo de su protegido..." },
  { quote: "Cuido niños, no hago milagros", character: "Abel", hint: "El niñero del edificio poniendo límites a su trabajo..." },

  // MARTA «LA PANTUMACA»
  { quote: "En mi comunidad las cosas se hacen bien. Aquí no sé cómo os apañáis", character: "Marta «La Pantumaca»", hint: "La presidenta de la comunidad de San Marcos con su opinión sobre Desengaño 21..." },
  { quote: "Soy la Pantumaca, cariño, no me confundas con cualquiera", character: "Marta «La Pantumaca»", hint: "La vecina catalana dejando claro quién es..." },
];

const EMOJIS = [
  { emojis: "🧹🏠😤💬", character: "Emilio Delgado", hints: ["Vive en la portería", "Trabaja como portero", "Tiene novia del tercer piso", "Le encanta cotillear"] },
  { emojis: "📚🧴💈😏", character: "Mariano Delgado", hints: ["Padre del portero", "Vive en la portería", "Se cree muy moderno", "Vendedor a domicilio"] },
  { emojis: "🌸🐕📺😇", character: "Vicenta Benito", hints: ["Jubilada del primer piso", "Tiene un perrito llamado Valentín", "Muy ingenua y buena persona", "Hermana de Marisa"] },
  { emojis: "🚬😒📻🍷", character: "Marisa Benito", hints: ["Fumadora empedernida", "Primera planta A", "Cínica y directa", "Hermana de Vicenta"] },
  { emojis: "👵💰🏠😤", character: "Concha de la Fuente", hints: ["Propietaria de varios pisos", "Odia al presidente de la comunidad", "Llama golfas a las del tercero B", "Muy cotilla"] },
  { emojis: "🌈📰⚖️👶", character: "Mauri Hidalgo", hints: ["Primer piso B", "Periodista de profesión", "Pareja de Fernando", "Padre de Ezequiel"] },
  { emojis: "⚖️🏃💼😍", character: "Fernando Navarro", hints: ["Abogado guapísimo", "Primer piso B", "Pareja de Mauri", "Trabajó en Londres"] },
  { emojis: "📋🔨😤🏛️", character: "Juan Cuesta", hints: ["Presidente de la comunidad", "Segundo piso A", "Profesor de primaria", "Siempre convocando juntas"] },
  { emojis: "🕊️👊😡📢", character: "Paloma Hurtado", hints: ["Mujer del presidente", "Segundo piso A", "Muy dramática", "Siempre gritando a Juan"] },
  { emojis: "🌿🧘💊😰", character: "Isabel Ruiz", hints: ["Hipocondríaca total", "Le gustan las terapias naturales", "Pareja de Juan Cuesta", "Segundo piso A"] },
  { emojis: "👜💅⚖️✈️", character: "Lucía Álvarez", hints: ["Abogada del tercer piso A", "Muy pija", "Varios novios en la serie", "Se fue de misionera al final"] },
  { emojis: "✏️🎨😅💔", character: "Roberto Alonso", hints: ["Arquitecto del tercer piso A", "Novio de Lucía al principio", "Dibujante de cómics", "Muy mala suerte con las mujeres"] },
  { emojis: "💃😤🏠🔑", character: "Belén López", hints: ["Tercer piso B", "Novia del portero a ratos", "Muchos trabajos distintos", "Amiga de Alicia"] },
  { emojis: "💅👠😍🌟", character: "Alicia Sanz", hints: ["Compañera de piso de Belén", "Tercer piso B", "Busca novio rico", "Se fue a vivir a Estados Unidos"] },
  { emojis: "📚👩‍🏫📖😤", character: "Bea Villarejo", hints: ["Profesora de profesión", "Primer piso B", "Amiga íntima de Mauri", "Madre de Ezequiel"] },
  { emojis: "📼🛋️🍺🚐", character: "Paco", hints: ["Dueño del videoclub", "Local del edificio", "Amigo del portero", "Se va en caravana al final"] },
  { emojis: "🔧⚡🐛📡", character: "Gerardo", hints: ["Siempre aparece con un trabajo diferente", "Habla muy muy rápido", "Calvito", "Visita recurrente al edificio"] },
];
