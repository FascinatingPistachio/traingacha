/**
 * thomas.js — used ONLY for the force_thomas cheat.
 *
 * Fetches the Thomas & Friends character list from Wikipedia and extracts
 * the real locomotive Wikipedia articles each character is based on.
 * These are then used when the player activates the force_thomas cheat to
 * guarantee a Thomas-character-related loco in their next pack.
 *
 * This index is NOT used for normal pack pulls or character badge detection.
 * Character badge detection uses STATIC_CHARACTERS + strict wikitext parsing only.
 */

const CACHE_KEY = 'rg_thomas_v3';
const CACHE_TTL = 24 * 60 * 60 * 1000;

const CHAR_EMOJI = {
  thomas:'🟦', gordon:'🔵', henry:'🟢', james:'🔴', percy:'🟩',
  toby:'🟫', duck:'🟡', donald:'⬜', douglas:'⬜', oliver:'🟢',
  emily:'🟩', edward:'🔵', spencer:'⚪', hiro:'🟣',
};
function emojiFor(name) { return CHAR_EMOJI[name.toLowerCase()] ?? '🚂'; }

// Hardcoded list of known real-loco → Thomas character mappings.
// This is the ONLY safe way to do this without false positives.
// All entries are manually verified.
export const THOMAS_LOCO_ARTICLES = [
  { wikiArticle:'LBSCR E2 class',            character:'Thomas',   show:'Thomas & Friends', color:'#1d6fc4', minRarity:'E' },
  { wikiArticle:'LNER Class A1',             character:'Gordon',   show:'Thomas & Friends', color:'#1d4ed8', minRarity:'E' },
  { wikiArticle:'LNER Class A3',             character:'Gordon',   show:'Thomas & Friends', color:'#1d4ed8', minRarity:'E' },
  { wikiArticle:'LMS Fowler 4F',             character:'Henry',    show:'Thomas & Friends', color:'#16a34a', minRarity:'E' },
  { wikiArticle:'GWR 5700 class',            character:'Duck',     show:'Thomas & Friends', color:'#b45309', minRarity:'E' },
  { wikiArticle:'GWR 1400 class',            character:'Oliver',   show:'Thomas & Friends', color:'#15803d', minRarity:'E' },
  { wikiArticle:'GER Class J70',             character:'Toby',     show:'Thomas & Friends', color:'#92400e', minRarity:'E' },
  { wikiArticle:'GNR Stirling Single',       character:'Emily',    show:'Thomas & Friends', color:'#166534', minRarity:'E' },
  { wikiArticle:'Furness Railway K2 class',  character:'James',    show:'Thomas & Friends', color:'#b91c1c', minRarity:'E' },
  { wikiArticle:'LNER Class A4',             character:'Spencer',  show:'Thomas & Friends', color:'#9ca3af', minRarity:'E' },
  { wikiArticle:'LBSCR B2 class',            character:'Edward',   show:'Thomas & Friends', color:'#2563eb', minRarity:'E' },
  { wikiArticle:'GWR Hall class',            character:'Hogwarts Express', show:'Harry Potter', color:'#92400e', minRarity:'E' },
  { wikiArticle:'Pere Marquette 1225',       character:'The Polar Express', show:'The Polar Express', color:'#1d4ed8', minRarity:'L' },
  { wikiArticle:'Talyllyn Railway',          character:'Ivor',     show:'Ivor the Engine', color:'#15803d', minRarity:'E' },
  { wikiArticle:'JNR Class D51',             character:"No-Face's Train", show:'Spirited Away', color:'#4c1d95', minRarity:'E' },
];

/**
 * Returns the list of known Thomas-character locomotive Wikipedia articles.
 * Used only by the force_thomas cheat.
 */
export async function fetchThomasCharacters() {
  // Just return the hardcoded list — no Wikipedia API call needed.
  // The note for each is filled in by the wikitext parser when the card is pulled.
  return THOMAS_LOCO_ARTICLES.reduce((acc, entry) => {
    acc[entry.character] = {
      ...entry,
      emoji: emojiFor(entry.character),
      note: `Basis for ${entry.character} in ${entry.show}`,
    };
    return acc;
  }, {});
}

/**
 * Returns an empty index — character detection is now handled entirely by
 * STATIC_CHARACTERS and strict wikitext parsing in characters.js.
 * This function exists only for backwards compatibility.
 */
export async function getThomasArticleIndex() {
  return {};  // deliberately empty — don't use thomas index for badge detection
}
