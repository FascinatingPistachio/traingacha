// Maps Wikipedia article titles (exact) to fictional train characters.
// When a pulled card's title matches a key here, a character banner is shown on the card
// and the rarity is boosted to at least the value in `minRarity`.
//
// Character art is represented with an emoji since real character artwork is copyrighted.

export const CHARACTER_TRAINS = {
  // ── Thomas & Friends ────────────────────────────────────────────────────────
  'LBSCR E2 class': {
    character: 'Thomas',
    show: 'Thomas & Friends',
    emoji: '🟦',
    note: 'Basis for Thomas the Tank Engine',
    minRarity: 'E',
  },
  'LNER Class A1': {
    character: 'Gordon',
    show: 'Thomas & Friends',
    emoji: '🔵',
    note: 'Basis for Gordon the Big Engine',
    minRarity: 'E',
  },
  'LNER Class A3': {
    character: 'Gordon',
    show: 'Thomas & Friends',
    emoji: '🔵',
    note: 'Basis for Gordon the Big Engine',
    minRarity: 'E',
  },
  'LNER Class A4': {
    character: 'Spencer',
    show: 'Thomas & Friends',
    emoji: '⚪',
    note: 'Basis for Spencer the Silver Engine',
    minRarity: 'E',
  },
  'GWR 5700 class': {
    character: 'Duck',
    show: 'Thomas & Friends',
    emoji: '🟡',
    note: 'Basis for Duck the Great Western Engine',
    minRarity: 'E',
  },
  'GWR 5700 Pannier Tank': {
    character: 'Duck',
    show: 'Thomas & Friends',
    emoji: '🟡',
    note: 'Basis for Duck the Great Western Engine',
    minRarity: 'E',
  },
  'GWR 1400 class': {
    character: 'Oliver',
    show: 'Thomas & Friends',
    emoji: '🟢',
    note: 'Basis for Oliver the Great Western Engine',
    minRarity: 'E',
  },
  'GER Class J70': {
    character: 'Toby',
    show: 'Thomas & Friends',
    emoji: '🟫',
    note: 'Basis for Toby the Tram Engine',
    minRarity: 'E',
  },
  'Great Eastern Railway Class C53': {
    character: 'Toby',
    show: 'Thomas & Friends',
    emoji: '🟫',
    note: 'Basis for Toby the Tram Engine',
    minRarity: 'E',
  },
  'Stirling Single': {
    character: 'Emily',
    show: 'Thomas & Friends',
    emoji: '🟩',
    note: 'Basis for Emily the Stirling Engine',
    minRarity: 'E',
  },
  'GNR Stirling Single': {
    character: 'Emily',
    show: 'Thomas & Friends',
    emoji: '🟩',
    note: 'Basis for Emily the Stirling Engine',
    minRarity: 'E',
  },
  'Furness Railway K2 class': {
    character: 'James',
    show: 'Thomas & Friends',
    emoji: '🔴',
    note: 'Basis for James the Red Engine',
    minRarity: 'E',
  },
  'LMS Fowler 4F': {
    character: 'Henry',
    show: 'Thomas & Friends',
    emoji: '🟢',
    note: 'Possible basis for Henry the Green Engine',
    minRarity: 'E',
  },
  'LBSCR B2 class': {
    character: 'Edward',
    show: 'Thomas & Friends',
    emoji: '🔵',
    note: 'Basis for Edward the Blue Engine',
    minRarity: 'E',
  },
  'GWR 57xx': {
    character: 'Percy',
    show: 'Thomas & Friends',
    emoji: '🟢',
    note: 'Possible basis for Percy the Small Engine',
    minRarity: 'E',
  },

  // ── Hogwarts Express / Harry Potter ─────────────────────────────────────────
  'GWR Hall class': {
    character: 'Hogwarts Express',
    show: 'Harry Potter',
    emoji: '⚡',
    note: '5972 Olton Hall was used as the Hogwarts Express',
    minRarity: 'E',
  },
  'Olton Hall': {
    character: 'Hogwarts Express',
    show: 'Harry Potter',
    emoji: '⚡',
    note: 'This locomotive IS the Hogwarts Express',
    minRarity: 'L',
  },

  // ── Ivor the Engine ───────────────────────────────────────────────────────
  'Talyllyn Railway': {
    character: 'Ivor',
    show: 'Ivor the Engine',
    emoji: '🟩',
    note: 'Inspiration for Ivor the Engine',
    minRarity: 'E',
  },
  'Hunslet': {
    character: 'Ivor',
    show: 'Ivor the Engine',
    emoji: '🟩',
    note: 'Possible inspiration for Ivor the Engine',
    minRarity: 'E',
  },

  // ── The Polar Express ─────────────────────────────────────────────────────
  'Pere Marquette 1225': {
    character: 'The Polar Express',
    show: 'The Polar Express',
    emoji: '❄️',
    note: 'This locomotive inspired The Polar Express',
    minRarity: 'L',
  },

  // ── Snowpiercer ───────────────────────────────────────────────────────────
  'EMD SD70ACe': {
    character: 'Snowpiercer',
    show: 'Snowpiercer',
    emoji: '❄️',
    note: 'Visual basis for the Snowpiercer locomotive',
    minRarity: 'E',
  },

  // ── Spirited Away ─────────────────────────────────────────────────────────
  'D51': {
    character: 'No-Face Train',
    show: 'Spirited Away',
    emoji: '👻',
    note: 'The ocean train in Spirited Away is based on the D51',
    minRarity: 'E',
  },
  'JNR Class D51': {
    character: 'No-Face Train',
    show: 'Spirited Away',
    emoji: '👻',
    note: 'The ocean train in Spirited Away is based on this class',
    minRarity: 'E',
  },

  // ── Back to the Future ────────────────────────────────────────────────────
  'Central Pacific No. 60': {
    character: 'Time Train',
    show: 'Back to the Future Part III',
    emoji: '⏰',
    note: 'Basis for the time-travelling locomotive',
    minRarity: 'L',
  },
};

// Returns character data if this article title matches, otherwise null.
export function getCharacterForTrain(title) {
  return CHARACTER_TRAINS[title] ?? null;
}

// If character data specifies a minRarity boost, apply it.
export function applyCharacterRarityBoost(rarity, character) {
  if (!character?.minRarity) return rarity;
  const ORDER = ['C', 'R', 'E', 'L'];
  const current = ORDER.indexOf(rarity);
  const minimum = ORDER.indexOf(character.minRarity);
  return ORDER[Math.max(current, minimum)];
}
