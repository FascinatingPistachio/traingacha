// Static fallback entries for core Thomas characters + other fictional trains.
// These are used when the Wikipedia parser doesn't find a match, and for
// non-Thomas franchises (Hogwarts, Polar Express, etc.)
// The dynamic Thomas list from thomas.js takes precedence over these.

export const STATIC_CHARACTERS = {
  'LBSCR E2 class': {
    character: 'Thomas', show: 'Thomas & Friends', emoji: '🟦',
    note: 'The real locomotive class Thomas is based on', minRarity: 'E',
  },
  'LNER Class A1': {
    character: 'Gordon', show: 'Thomas & Friends', emoji: '🔵',
    note: 'Basis for Gordon the Big Engine', minRarity: 'E',
  },
  'LNER Class A3': {
    character: 'Gordon', show: 'Thomas & Friends', emoji: '🔵',
    note: 'Basis for Gordon the Big Engine', minRarity: 'E',
  },
  'LMS Fowler 4F': {
    character: 'Henry', show: 'Thomas & Friends', emoji: '🟢',
    note: 'Basis for Henry the Green Engine', minRarity: 'E',
  },
  'GWR 5700 class': {
    character: 'Duck', show: 'Thomas & Friends', emoji: '🟡',
    note: 'Basis for Duck the Great Western Engine', minRarity: 'E',
  },
  'GWR 1400 class': {
    character: 'Oliver', show: 'Thomas & Friends', emoji: '🟢',
    note: 'Basis for Oliver the Great Western Engine', minRarity: 'E',
  },
  'GER Class J70': {
    character: 'Toby', show: 'Thomas & Friends', emoji: '🟫',
    note: 'Basis for Toby the Tram Engine', minRarity: 'E',
  },
  'Stirling Single': {
    character: 'Emily', show: 'Thomas & Friends', emoji: '🟩',
    note: 'Basis for Emily the Stirling Engine', minRarity: 'E',
  },
  'Furness Railway K2 class': {
    character: 'James', show: 'Thomas & Friends', emoji: '🔴',
    note: 'Basis for James the Red Engine', minRarity: 'E',
  },
  'LNER Class A4': {
    character: 'Spencer', show: 'Thomas & Friends', emoji: '⚪',
    note: 'Basis for Spencer the Silver Engine', minRarity: 'E',
  },
  'GWR Hall class': {
    character: 'Hogwarts Express', show: 'Harry Potter', emoji: '⚡',
    note: '5972 Olton Hall was used as the Hogwarts Express', minRarity: 'E',
  },
  'GWR 4900 Class': {
    character: 'Hogwarts Express', show: 'Harry Potter', emoji: '⚡',
    note: 'GWR Hall class locos used as the Hogwarts Express', minRarity: 'E',
  },
  'Pere Marquette 1225': {
    character: 'The Polar Express', show: 'The Polar Express', emoji: '❄️',
    note: 'This locomotive inspired The Polar Express', minRarity: 'L',
  },
  'Talyllyn Railway': {
    character: 'Ivor', show: 'Ivor the Engine', emoji: '🟩',
    note: 'Inspiration for Ivor the Engine', minRarity: 'E',
  },
  'JNR Class D51': {
    character: 'No-Face Train', show: 'Spirited Away', emoji: '👻',
    note: 'The ocean train in Spirited Away is based on this class', minRarity: 'E',
  },
};

// Apply character rarity boost
export function applyCharacterRarityBoost(rarity, character) {
  if (!character?.minRarity) return rarity;
  const ORDER = ['C', 'R', 'E', 'L'];
  return ORDER[Math.max(ORDER.indexOf(rarity), ORDER.indexOf(character.minRarity))];
}

// Lookup — called with a Wikipedia article title.
// Returns character data or null.
// Dynamic Thomas index is passed in to avoid circular imports.
export function getCharacterForTrain(title, thomasIndex = {}) {
  return thomasIndex[title] ?? STATIC_CHARACTERS[title] ?? null;
}
