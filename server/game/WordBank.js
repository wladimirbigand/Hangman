'use strict';

// Banque de mots (francais, sans accents) par categorie.
// Chaque categorie contient au moins 50 mots adaptes a un public scolaire.

const CATEGORIES = {
  animaux: [
    'CHIEN', 'CHAT', 'CHEVAL', 'VACHE', 'COCHON', 'MOUTON', 'CHEVRE', 'LAPIN', 'SOURIS', 'RAT',
    'HAMSTER', 'ECUREUIL', 'RENARD', 'LOUP', 'OURS', 'LION', 'TIGRE', 'ELEPHANT', 'GIRAFE', 'ZEBRE',
    'SINGE', 'GORILLE', 'KANGOUROU', 'KOALA', 'PANDA', 'CROCODILE', 'SERPENT', 'LEZARD', 'TORTUE', 'GRENOUILLE',
    'POISSON', 'REQUIN', 'DAUPHIN', 'BALEINE', 'PIEUVRE', 'CRABE', 'HOMARD', 'AIGLE', 'FAUCON', 'HIBOU',
    'CHOUETTE', 'PERROQUET', 'PINGOUIN', 'MANCHOT', 'AUTRUCHE', 'PAON', 'CANARD', 'OIE', 'DINDE', 'POULE', 'COQ',
  ],
  pays: [
    'FRANCE', 'ESPAGNE', 'ITALIE', 'ALLEMAGNE', 'PORTUGAL', 'BELGIQUE', 'SUISSE', 'IRLANDE', 'ECOSSE', 'NORVEGE',
    'SUEDE', 'FINLANDE', 'DANEMARK', 'POLOGNE', 'GRECE', 'TURQUIE', 'RUSSIE', 'CHINE', 'JAPON', 'INDE',
    'THAILANDE', 'VIETNAM', 'INDONESIE', 'AUSTRALIE', 'CANADA', 'MEXIQUE', 'BRESIL', 'ARGENTINE', 'CHILI', 'PEROU',
    'COLOMBIE', 'EGYPTE', 'MAROC', 'ALGERIE', 'TUNISIE', 'SENEGAL', 'KENYA', 'NIGERIA', 'ISRAEL', 'LIBAN',
    'IRAN', 'ISLANDE', 'ROUMANIE', 'HONGRIE', 'AUTRICHE', 'CROATIE', 'UKRAINE', 'CUBA', 'HAITI', 'PANAMA',
  ],
  metiers: [
    'MEDECIN', 'INFIRMIER', 'DENTISTE', 'PHARMACIEN', 'VETERINAIRE', 'PROFESSEUR', 'INSTITUTEUR', 'AVOCAT', 'JUGE', 'POLICIER',
    'POMPIER', 'SOLDAT', 'INGENIEUR', 'ARCHITECTE', 'MACON', 'PLOMBIER', 'ELECTRICIEN', 'MENUISIER', 'PEINTRE', 'CUISINIER',
    'BOULANGER', 'PATISSIER', 'BOUCHER', 'COIFFEUR', 'ESTHETICIEN', 'JARDINIER', 'AGRICULTEUR', 'PECHEUR', 'MARIN', 'PILOTE',
    'HOTESSE', 'CHAUFFEUR', 'MECANICIEN', 'VENDEUR', 'CAISSIER', 'COMPTABLE', 'BANQUIER', 'SECRETAIRE', 'JOURNALISTE', 'ECRIVAIN',
    'MUSICIEN', 'CHANTEUR', 'ACTEUR', 'REALISATEUR', 'PHOTOGRAPHE', 'COUTURIER', 'BIJOUTIER', 'FLEURISTE', 'LIBRAIRE', 'BIBLIOTHECAIRE', 'ASTRONAUTE',
  ],
  nourriture: [
    'PIZZA', 'PATES', 'RIZ', 'PAIN', 'FROMAGE', 'BEURRE', 'LAIT', 'OEUF', 'POULET', 'BOEUF',
    'PORC', 'POISSON', 'CREVETTE', 'SALADE', 'TOMATE', 'CAROTTE', 'POMME', 'BANANE', 'ORANGE', 'FRAISE',
    'RAISIN', 'ANANAS', 'MANGUE', 'CITRON', 'PASTEQUE', 'CERISE', 'PECHE', 'POIRE', 'ABRICOT', 'CHOCOLAT',
    'GATEAU', 'BONBON', 'GLACE', 'CROISSANT', 'BAGUETTE', 'CREPE', 'GAUFRE', 'TARTE', 'YAOURT', 'MIEL',
    'CONFITURE', 'SOUPE', 'SANDWICH', 'HAMBURGER', 'FRITES', 'CHIPS', 'BISCUIT', 'MACARON', 'NOUGAT', 'CARAMEL', 'CACAHUETE',
  ],
  films: [
    'TITANIC', 'AVATAR', 'MATRIX', 'GRAVITY', 'INCEPTION', 'JUMANJI', 'ALADDIN', 'POCAHONTAS', 'MULAN', 'RATATOUILLE',
    'SHREK', 'FROZEN', 'ENCANTO', 'COCO', 'BRAVE', 'TARZAN', 'HERCULE', 'CENDRILLON', 'RAIPONCE', 'VAIANA',
    'ZOOTOPIE', 'ROBIN', 'BAMBI', 'DUMBO', 'PINOCCHIO', 'ALICE', 'NEMO', 'DORY', 'CARS', 'SUPERMAN',
    'BATMAN', 'SPIDERMAN', 'AVENGERS', 'IRONMAN', 'THOR', 'HULK', 'AQUAMAN', 'VENOM', 'GODZILLA', 'KINGKONG',
    'MINIONS', 'GRINCH', 'ANNIE', 'GREASE', 'SINBAD', 'ASTERIX', 'OBELIX', 'TINTIN', 'LUPIN', 'TAXI',
  ],
  jeuxvideo: [
    'MINECRAFT', 'FORTNITE', 'ROBLOX', 'TETRIS', 'PACMAN', 'MARIO', 'LUIGI', 'ZELDA', 'POKEMON', 'SONIC',
    'KIRBY', 'FIFA', 'OVERWATCH', 'VALORANT', 'TERRARIA', 'UNDERTALE', 'PORTAL', 'DOOM', 'QUAKE', 'HALO',
    'APEX', 'MINESWEEPER', 'SOLITAIRE', 'PONG', 'ARKANOID', 'GALAGA', 'ASTEROIDS', 'FROGGER', 'DIABLO', 'WARCRAFT',
    'STARCRAFT', 'SIMS', 'SPORE', 'CIVILIZATION', 'RAYMAN', 'CRASH', 'SPYRO', 'DONKEYKONG', 'YOSHI', 'BOWSER',
    'PEACH', 'SAMUS', 'LINK', 'KRATOS', 'GERALT', 'TOMBRAIDER', 'LARA', 'SNAKE', 'CUPHEAD', 'CELESTE',
  ],
};

const CATEGORY_LABELS = {
  animaux: 'Animaux',
  pays: 'Pays',
  metiers: 'Metiers',
  nourriture: 'Nourriture',
  films: 'Films',
  jeuxvideo: 'Jeux video',
  melange: 'Melange',
};

function getAllWords() {
  return Object.values(CATEGORIES).flat();
}

function getWordsForCategory(category) {
  if (category === 'melange') return getAllWords();
  return CATEGORIES[category] || getAllWords();
}

const DIFFICULTY_RANGES = {
  facile: [0, 5],
  normal: [6, 8],
  difficile: [9, Infinity],
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Choisit un mot non deja utilise pour la categorie/difficulte donnees.
 * Retombe sur tout mot non-utilise de la categorie si aucun mot ne correspond
 * a la plage de longueur de la difficulte (evite de bloquer une partie).
 */
function pickWord(category, difficulty, usedWords = []) {
  const pool = getWordsForCategory(category);
  const [min, max] = DIFFICULTY_RANGES[difficulty] || DIFFICULTY_RANGES.normal;
  const used = new Set(usedWords);

  const inRange = pool.filter((w) => w.length >= min && w.length <= max && !used.has(w));
  if (inRange.length > 0) return shuffle(inRange)[0];

  const anyUnused = pool.filter((w) => !used.has(w));
  if (anyUnused.length > 0) return shuffle(anyUnused)[0];

  return shuffle(pool)[0];
}

module.exports = {
  CATEGORIES,
  CATEGORY_LABELS,
  getWordsForCategory,
  pickWord,
};
