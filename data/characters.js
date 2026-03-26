const CHARACTERS = [

  // PORTERÍA
  { name: "Emilio Delgado",    type: "Principal",  gender: "Masculino", nationality: "Española", floors: ["Portería","3º B"],      seasons: [1,2,3,4,5], occupations: ["Portero","Estudiante universitario"] },
  { name: "Mariano Delgado",   type: "Principal",  gender: "Masculino", nationality: "Española", floors: ["Portería"],             seasons: [1,2,3,4,5], occupations: ["Vendedor de libros","Escritor"] },

  // 1º A
  { name: "Vicenta Benito",    type: "Principal",  gender: "Femenino",  nationality: "Española", floors: ["1º A"],                 seasons: [1,2,3,4,5], occupations: ["Jubilada"] },
  { name: "Marisa Benito",     type: "Principal",  gender: "Femenino",  nationality: "Española", floors: ["1º A"],                 seasons: [1,2,3,4,5], occupations: ["Jubilada"] },
  { name: "Concha de la Fuente", type: "Principal",gender: "Femenino",  nationality: "Española", floors: ["2º B","1º A","3º B"],   seasons: [1,2,3,4,5], occupations: ["Jubilada","Propietaria inmobiliaria"] },

  // 1º B
  { name: "Mauri Hidalgo",     type: "Principal",  gender: "Masculino", nationality: "Española", floors: ["1º B"],                 seasons: [1,2,3,4,5], occupations: ["Periodista"] },
  { name: "Fernando Navarro",  type: "Principal",  gender: "Masculino", nationality: "Española", floors: ["1º B"],                 seasons: [1,2,3,4,5], occupations: ["Abogado"] },
  { name: "Bea Villarejo",     type: "Principal",  gender: "Femenino",  nationality: "Española", floors: ["1º B"],                 seasons: [2,3,4,5],   occupations: ["Veterinaria"] },

  // 2º A
  { name: "Juan Cuesta",       type: "Principal",  gender: "Masculino", nationality: "Española", floors: ["2º A"],                 seasons: [1,2,3,4,5], occupations: ["Profesor de primaria","Presidente comunidad","Director de academia"] },
  { name: "Paloma Hurtado",    type: "Principal",  gender: "Femenino",  nationality: "Española", floors: ["2º A"],                 seasons: [1,2],       occupations: ["Ama de casa"] },
  { name: "Natalia Cuesta",    type: "Principal",  gender: "Femenino",  nationality: "Española", floors: ["2º A"],                 seasons: [1,2,3,4,5], occupations: ["Estudiante de psicología","Madre de alquiler"] },
  { name: "José Miguel Cuesta",type: "Principal",  gender: "Masculino", nationality: "Española", floors: ["2º A"],                 seasons: [1,2,3,4,5], occupations: ["Estudiante"] },
  { name: "Isabel Ruiz",       type: "Principal",  gender: "Femenino",  nationality: "Española", floors: ["2º B","2º A"],          seasons: [2,3,4,5],   occupations: ["Ama de casa","Enfermera"] },
  { name: "Yago",              type: "Secundario", gender: "Masculino", nationality: "Cubana",   floors: ["Ático","2º A"],         seasons: [4,5],       occupations: ["Ecologista"] },

  // 2º B
  { name: "Armando Cortés",    type: "Secundario", gender: "Masculino", nationality: "Española", floors: ["2º B"],                 seasons: [1],         occupations: ["En paro"] },
  { name: "Andrés Guerra",     type: "Secundario", gender: "Masculino", nationality: "Española", floors: ["2º B","Ático"],         seasons: [2,3,4],     occupations: ["Empresario","Estafador"] },
  { name: "Pablo Guerra",      type: "Secundario", gender: "Masculino", nationality: "Española", floors: ["2º B","Ático"],         seasons: [2,3,4,5],   occupations: ["Estudiante"] },
  { name: "Álex Guerra",       type: "Secundario", gender: "Masculino", nationality: "Española", floors: ["2º B"],                 seasons: [2,3],       occupations: ["Estudiante"] },
  { name: "Higinio Heredia",   type: "Secundario", gender: "Masculino", nationality: "Española", floors: ["2º B"],                 seasons: [4,5],       occupations: ["Funcionario","Presidente comunidad (interino)"] },
  { name: "Mamen Heredia",     type: "Secundario", gender: "Femenino",  nationality: "Española", floors: ["2º B"],                 seasons: [4,5],       occupations: ["Ama de casa"] },
  { name: "Candela Heredia",   type: "Secundario", gender: "Femenino",  nationality: "Española", floors: ["2º B"],                 seasons: [5],         occupations: ["Estudiante"] },
  { name: "Raquel Heredia",    type: "Secundario", gender: "Femenino",  nationality: "Española", floors: ["2º B"],                 seasons: [5],         occupations: ["Sin empleo fijo"] },
  { name: "Moncho Heredia",    type: "Secundario", gender: "Masculino", nationality: "Española", floors: ["2º B"],                 seasons: [5],         occupations: ["Empresario fracasado","Vividor"] },

  // 3º A
  { name: "Lucía Álvarez",     type: "Principal",  gender: "Femenino",  nationality: "Española", floors: ["3º A"],                 seasons: [1,2,3,4],   occupations: ["Empleada empresa constructora","Voluntaria ONG"] },
  { name: "Roberto Alonso",    type: "Principal",  gender: "Masculino", nationality: "Española", floors: ["3º A","2º B","Ático"],  seasons: [1,2,3,4],   occupations: ["Arquitecto","Dibujante de cómics","Caricaturista"] },
  { name: "Carlos de Haro",    type: "Secundario", gender: "Masculino", nationality: "Española", floors: ["3º A","2º B"],          seasons: [1,3,4],     occupations: ["Empresario","Dueño del videoclub"] },
  { name: "Nieves Cuesta",     type: "Secundario", gender: "Femenino",  nationality: "Española", floors: ["2º B"],                 seasons: [3,4],       occupations: ["Funcionaria"] },
  { name: "Rafael Álvarez",    type: "Secundario", gender: "Masculino", nationality: "Española", floors: ["3º A"],                 seasons: [1,4,5],     occupations: ["Empresario de la construcción"] },
  { name: "Carmen Villanueva", type: "Secundario", gender: "Femenino",  nationality: "Española", floors: ["3º B","3º A"],          seasons: [3,4],       occupations: ["Profesora universitaria"] },

  // 3º B
  { name: "Belén López",       type: "Principal",  gender: "Femenino",  nationality: "Española", floors: ["3º B","Portería"],      seasons: [1,2,3,4,5], occupations: ["Camarera","Modelo","Empleada de moda","Actriz de anuncios"] },
  { name: "Alicia Sanz",       type: "Secundario", gender: "Femenino",  nationality: "Española", floors: ["3º A","3º B"],          seasons: [1,2],       occupations: ["Sin empleo fijo"] },
  { name: "Ana",               type: "Secundario", gender: "Femenino",  nationality: "Alemana",  floors: ["3º B"],                 seasons: [3,4],       occupations: ["Sin empleo fijo"] },
  { name: "María Jesús",       type: "Secundario", gender: "Femenino",  nationality: "Española", floors: ["3º B"],                 seasons: [4],         occupations: ["Ama de casa"] },

  // VIDEOCLUB
  { name: "Paco",              type: "Principal",  gender: "Masculino", nationality: "Española", floors: ["Videoclub","Ático"],    seasons: [1,2,3,4,5], occupations: ["Empleado de videoclub"] },

  // ESPORÁDICOS RECURRENTES
  { name: "Gerardo",           type: "Esporádico", gender: "Masculino", nationality: "Española", floors: ["Visita"],               seasons: [1,2,3,4,5], occupations: ["Instalador de alarmas","Exterminador de plagas","Jefe de seguridad","Instalador de internet","Experto en termitas","Instalador de duchas hidromasaje","Recepcionista","Dependiente de tienda de espionaje"] },
  { name: "Padre Miguel",      type: "Esporádico", gender: "Masculino", nationality: "Española", floors: ["Visita"],               seasons: [1,2,3,4,5], occupations: ["Cura","Cantautor aficionado"] },
  { name: "Gregorio",          type: "Esporádico", gender: "Masculino", nationality: "Española", floors: ["Visita"],               seasons: [1,2,3],     occupations: ["Administrador de fincas"] },
  { name: "Hermana Esperanza", type: "Esporádico", gender: "Femenino",  nationality: "Española", floors: ["Visita","1º B"],        seasons: [2,3,4],     occupations: ["Monja","Cuidadora","Locutora de radio"] },
  { name: "Daniel Rubio",      type: "Esporádico", gender: "Masculino", nationality: "Española", floors: ["2º B"],                 seasons: [1],         occupations: ["Estudiante"] },
  { name: "Rebeca",            type: "Esporádico", gender: "Femenino",  nationality: "Española", floors: ["2º B"],                 seasons: [2],         occupations: ["Estudiante"] },
  { name: "Ezequiel Hidalgo",  type: "Esporádico", gender: "Masculino", nationality: "Española", floors: ["1º B"],                 seasons: [3,4,5],     occupations: ["Niño"] },
];
