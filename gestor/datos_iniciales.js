// Datos iniciales extraídos directamente del Google Sheet del usuario
const rootScope = typeof window !== 'undefined' ? window : global;

const DEFAULT_SKILLS = [
  { id: "skill_1", name: "tijera (bicicleta)", stock: 0 },
  { id: "skill_2", name: "doble toque (croqueta)", stock: 1 },
  { id: "skill_3", name: "elastica", stock: 0 },
  { id: "skill_4", name: "marsellesa", stock: 1 },
  { id: "skill_5", name: "sombrerito", stock: 0 },
  { id: "skill_6", name: "recorte con giro", stock: 0 },
  { id: "skill_7", name: "amago por detras y giro", stock: 0 },
  { id: "skill_8", name: "rebote interior", stock: 0 },
  { id: "skill_9", name: "control con la suela", stock: 1 },
  { id: "skill_10", name: "cabeceador", stock: 6 },
  { id: "skill_11", name: "disparo lejano con rosca", stock: 3 },
  { id: "skill_12", name: "vaselina (sombrero)", stock: 0 },
  { id: "skill_13", name: "disparo sin rotacion", stock: 0 },
  { id: "skill_14", name: "disparo descendente", stock: 1 },
  { id: "skill_15", name: "disparo ascendente", stock: 0 },
  { id: "skill_16", name: "tiro larga distancia", stock: 1 },
  { id: "skill_17", name: "finalizacion acrobatica", stock: 2 },
  { id: "skill_18", name: "tazonazo (espuela)", stock: 0 },
  { id: "skill_19", name: "pase al primer toque", stock: 0 },
  { id: "skill_20", name: "remate al primer toque", stock: 0 },
  { id: "skill_21", name: "pase en profundidad", stock: 0 },
  { id: "skill_22", name: "pase medido (hueco)", stock: 0 },
  { id: "skill_23", name: "pase cruzado", stock: 1 },
  { id: "skill_24", name: "centro con rosca", stock: 4 },
  { id: "skill_25", name: "rabona", stock: 0 },
  { id: "skill_26", name: "pase sin mirar", stock: 1 },
  { id: "skill_27", name: "pase bombeado bajo", stock: 0 },
  { id: "skill_28", name: "malicia (picardia)", stock: 1 },
  { id: "skill_29", name: "marcaje", stock: 2 },
  { id: "skill_30", name: "delantero atrasado", stock: 5 },
  { id: "skill_31", name: "interceptador", stock: 3 },
  { id: "skill_32", name: "bloqueador", stock: 2 },
  { id: "skill_33", name: "superiorida area", stock: 1 },
  { id: "skill_34", name: "entrada deslizante", stock: 1 },
  { id: "skill_35", name: "despeje acrobatico", stock: 4 },
  { id: "skill_36", name: "superrefuerzo (as en la)", stock: 4 },
  { id: "skill_37", name: "espiritu de lucha", stock: 0 },
  { id: "skill_38", name: "capitania", stock: 0 },
  { id: "skill_39", name: "saque de banda largo", stock: 0 },
  { id: "skill_40", name: "especialista en penales", stock: 0 },
  { id: "skill_41", name: "patadon el largo", stock: 0 }
];

const DEFAULT_PLAYERS = [
  {
    id: "player_1",
    name: "el hadji diouf",
    skills: ["elastica", "pase al primer toque", "", "", ""],
    notes: ""
  },
  {
    id: "player_2",
    name: "lookman",
    skills: [
      "elastica",
      "pase al primer toque",
      "malicia (picardia)",
      "pase medido (hueco)",
      "doble toque (croqueta)"
    ],
    notes: ""
  },
  {
    id: "player_3",
    name: "pires",
    skills: ["espiritu de lucha", "", "", "", ""],
    notes: ""
  },
  {
    id: "player_4",
    name: "sneijder",
    skills: ["elastica", "tiro larga distancia", "", "", ""],
    notes: ""
  },
  {
    id: "player_5",
    name: "rummeniggue",
    skills: ["elastica", "", "", "", ""],
    notes: ""
  },
  {
    id: "player_6",
    name: "joellinton",
    skills: ["doble toque (croqueta)", "espiritu de lucha", "", "", ""],
    notes: ""
  },
  {
    id: "player_7",
    name: "saliva",
    skills: ["pase al primer toque", "pase bombeado bajo", "", "", ""],
    notes: ""
  },
  {
    id: "player_8",
    name: "dida",
    skills: ["patadon el largo", "", "", "", ""],
    notes: ""
  },
  {
    id: "player_9",
    name: "bissoumma",
    skills: ["bloqueador", "pase al primer toque", "pase en profundidad", "pase medido (hueco)", "espiritu de lucha"],
    notes: ""
  },
  {
    id: "player_10",
    name: "gakpo",
    skills: ["elastica", "tiro larga distancia", "espiritu de lucha", "", ""],
    notes: ""
  },
  {
    id: "player_11",
    name: "olise",
    skills: ["elastica", "control con la suela", "remate al primer toque", "espiritu de lucha", ""],
    notes: ""
  },
  {
    id: "player_12",
    name: "estefano fiore",
    skills: ["elastica", "pase medido (hueco)", "", "", ""],
    notes: ""
  },
  {
    id: "player_13",
    name: "javier zanetti",
    skills: ["tazonazo (espuela)", "pase al primer toque", "", "", ""],
    notes: ""
  }
];

const DEFAULT_MODEL_PLAYERS = [
  {
    id: "model_1",
    name: "Alfredo Loaisa",
    skills: ["marcaje", "superiorida area", "bloqueador", "cabeceador", "pase al primer toque"],
    description: "Perfil defensivo y juego aéreo con salida limpia al primer toque"
  }
];

const TEAMS_CONFIG = {
  darth_vader: {
    id: 'darth_vader',
    name: 'Darth Vader FC',
    shortName: 'Darth Vader',
    subtitle: 'Gestor de Habilidades y Jugadores - Darth Vader',
    badge: 'assets/darth_vader_crest.svg',
    defaultSkills: DEFAULT_SKILLS,
    defaultPlayers: DEFAULT_PLAYERS,
    defaultModelPlayers: DEFAULT_MODEL_PLAYERS
  },
  fcb_david: {
    id: 'fcb_david',
    name: 'FCB David',
    shortName: 'FCB David',
    subtitle: 'Gestor de Habilidades y Jugadores - FCB David',
    badge: 'assets/fcb_david_crest.svg',
    // 41 habilidades maestras disponibles con stock en 0
    defaultSkills: DEFAULT_SKILLS.map(s => ({ id: s.id, name: s.name, stock: 0 })),
    // Lista de jugadores vacía
    defaultPlayers: [],
    defaultModelPlayers: DEFAULT_MODEL_PLAYERS
  }
};

rootScope.DEFAULT_SKILLS = DEFAULT_SKILLS;
rootScope.DEFAULT_PLAYERS = DEFAULT_PLAYERS;
rootScope.DEFAULT_MODEL_PLAYERS = DEFAULT_MODEL_PLAYERS;
rootScope.TEAMS_CONFIG = TEAMS_CONFIG;

