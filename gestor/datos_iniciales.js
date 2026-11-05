// Datos iniciales para la Versión Comercial (Base en limpio sin datos asociados)
const rootScope = typeof window !== 'undefined' ? window : global;

const DEFAULT_SKILLS = [
  { id: "skill_1", name: "tijera (bicicleta)", stock: 0 },
  { id: "skill_2", name: "doble toque (croqueta)", stock: 0 },
  { id: "skill_3", name: "elastica", stock: 0 },
  { id: "skill_4", name: "marsellesa", stock: 0 },
  { id: "skill_5", name: "sombrerito", stock: 0 },
  { id: "skill_6", name: "recorte con giro", stock: 0 },
  { id: "skill_7", name: "amago por detras y giro", stock: 0 },
  { id: "skill_8", name: "rebote interior", stock: 0 },
  { id: "skill_9", name: "control con la suela", stock: 0 },
  { id: "skill_10", name: "cabeceador", stock: 0 },
  { id: "skill_11", name: "disparo lejano con rosca", stock: 0 },
  { id: "skill_12", name: "vaselina (sombrero)", stock: 0 },
  { id: "skill_13", name: "disparo sin rotacion", stock: 0 },
  { id: "skill_14", name: "disparo descendente", stock: 0 },
  { id: "skill_15", name: "disparo ascendente", stock: 0 },
  { id: "skill_16", name: "tiro larga distancia", stock: 0 },
  { id: "skill_17", name: "finalizacion acrobatica", stock: 0 },
  { id: "skill_18", name: "tazonazo (espuela)", stock: 0 },
  { id: "skill_19", name: "pase al primer toque", stock: 0 },
  { id: "skill_20", name: "remate al primer toque", stock: 0 },
  { id: "skill_21", name: "pase en profundidad", stock: 0 },
  { id: "skill_22", name: "pase medido (hueco)", stock: 0 },
  { id: "skill_23", name: "pase cruzado", stock: 0 },
  { id: "skill_24", name: "centro con rosca", stock: 0 },
  { id: "skill_25", name: "rabona", stock: 0 },
  { id: "skill_26", name: "pase sin mirar", stock: 0 },
  { id: "skill_27", name: "pase bombeado bajo", stock: 0 },
  { id: "skill_28", name: "malicia (picardia)", stock: 0 },
  { id: "skill_29", name: "marcaje", stock: 0 },
  { id: "skill_30", name: "delantero atrasado", stock: 0 },
  { id: "skill_31", name: "interceptador", stock: 0 },
  { id: "skill_32", name: "bloqueador", stock: 0 },
  { id: "skill_33", name: "superiorida area", stock: 0 },
  { id: "skill_34", name: "entrada deslizante", stock: 0 },
  { id: "skill_35", name: "despeje acrobatico", stock: 0 },
  { id: "skill_36", name: "superrefuerzo (as en la)", stock: 0 },
  { id: "skill_37", name: "espiritu de lucha", stock: 0 },
  { id: "skill_38", name: "capitania", stock: 0 },
  { id: "skill_39", name: "saque de banda largo", stock: 0 },
  { id: "skill_40", name: "especialista en penales", stock: 0 },
  { id: "skill_41", name: "patadon el largo", stock: 0 }
];

const DEFAULT_PLAYERS = [];
const DEFAULT_MODEL_PLAYERS = [];

const DEFAULT_TEAMS_CONFIG = {
  team_1: {
    id: 'team_1',
    name: 'Equipo Principal',
    shortName: 'Equipo 1',
    subtitle: 'Control de stock en tiempo real y asignación interactiva de habilidades',
    badge: 'assets/team1_crest.svg',
    defaultSkills: DEFAULT_SKILLS.map(s => ({ ...s })),
    defaultPlayers: [],
    defaultModelPlayers: []
  },
  team_2: {
    id: 'team_2',
    name: 'Equipo Secundario',
    shortName: 'Equipo 2',
    subtitle: 'Control de stock en tiempo real y asignación interactiva de habilidades',
    badge: 'assets/team2_crest.svg',
    defaultSkills: DEFAULT_SKILLS.map(s => ({ ...s })),
    defaultPlayers: [],
    defaultModelPlayers: []
  }
};

rootScope.DEFAULT_SKILLS = DEFAULT_SKILLS;
rootScope.DEFAULT_PLAYERS = DEFAULT_PLAYERS;
rootScope.DEFAULT_MODEL_PLAYERS = DEFAULT_MODEL_PLAYERS;
rootScope.DEFAULT_TEAMS_CONFIG = DEFAULT_TEAMS_CONFIG;
