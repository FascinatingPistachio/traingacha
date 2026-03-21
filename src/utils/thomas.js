/**
 * thomas.js — used ONLY for the force_thomas cheat.
 * Maps real locomotive Wikipedia articles to Thomas & Friends characters.
 */

const CHAR_EMOJI = {
  thomas:'🟦', gordon:'🔵', henry:'🟢', james:'🔴', percy:'🟩',
  toby:'🟫', duck:'🟡', donald:'⬜', douglas:'⬜', oliver:'🟢',
  emily:'🟩', edward:'🔵', spencer:'⚪', hiro:'🟣', skarloey:'🔴',
  rheneas:'🔴', sir_handel:'🔵', peter_sam:'🔵', rusty:'🟠', duncan:'🟡',
};
function emojiFor(name) { return CHAR_EMOJI[name.toLowerCase().replace(/\s+/g,'_')] ?? '🚂'; }

export const THOMAS_LOCO_ARTICLES = [
  // NWR Steam
  { wikiArticle:'LBSCR E2 class',            character:'Thomas',        show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  { wikiArticle:'LNER Class A1',             character:'Gordon',        show:'Thomas & Friends', color:'#1a237e', minRarity:'E' },
  { wikiArticle:'LNER Class A3',             character:'Gordon',        show:'Thomas & Friends', color:'#1a237e', minRarity:'E' },
  { wikiArticle:'LMS Fowler 4F',             character:'Henry',         show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'GWR 5700 class',            character:'Duck',          show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'GWR 1400 class',            character:'Oliver',        show:'Thomas & Friends', color:'#2e7d32', minRarity:'E' },
  { wikiArticle:'LNER Class J70',            character:'Toby',          show:'Thomas & Friends', color:'#4e342e', minRarity:'E' },
  { wikiArticle:'GNR Stirling Single',       character:'Emily',         show:'Thomas & Friends', color:'#1b5e20', minRarity:'E' },
  { wikiArticle:'Furness Railway K2 class',  character:'James',         show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'LNER Class A4',             character:'Spencer',       show:'Thomas & Friends', color:'#78909c', minRarity:'E' },
  { wikiArticle:'LBSCR B2 class',            character:'Edward',        show:'Thomas & Friends', color:'#1976d2', minRarity:'E' },
  { wikiArticle:'BR Standard Class 4MT',     character:'Arthur',        show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  // NWR Diesels
  { wikiArticle:'British Rail Class 08',     character:'Diesel',        show:'Thomas & Friends', color:'#212121', minRarity:'E' },
  { wikiArticle:'British Rail Class 20',     character:'BoCo',          show:'Thomas & Friends', color:'#1b5e20', minRarity:'E' },
  { wikiArticle:'English Electric Type 1',   character:'BoCo',          show:'Thomas & Friends', color:'#1b5e20', minRarity:'E' },
  // Skarloey Railway bases (narrow gauge Welsh prototypes)
  { wikiArticle:'Talyllyn',                  character:'Skarloey',      show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Dolgoch',                   character:'Rheneas',       show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  { wikiArticle:'Sir Haydn',                 character:'Sir Handel',    show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  { wikiArticle:'Peter Sam (locomotive)',    character:'Peter Sam',     show:'Thomas & Friends', color:'#1565c0', minRarity:'E' },
  { wikiArticle:'Talyllyn Railway',          character:'Skarloey',      show:'Thomas & Friends', color:'#c62828', minRarity:'E' },
  // Other franchises
  { wikiArticle:'GWR Hall class',            character:'Hogwarts Express', show:'Harry Potter',       color:'#92400e', minRarity:'E' },
  { wikiArticle:'Pere Marquette 1225',       character:'The Polar Express', show:'The Polar Express', color:'#1d4ed8', minRarity:'L' },
  { wikiArticle:'JNR Class D51',             character:'Spirit Train',  show:'Spirited Away',    color:'#4c1d95', minRarity:'E' },
  // Mainline famous engines that appear in the show
  { wikiArticle:'Flying Scotsman',           character:'Flying Scotsman', show:'Thomas & Friends', color:'#004d00', minRarity:'L' },
];

export async function fetchThomasCharacters() {
  return THOMAS_LOCO_ARTICLES.reduce((acc, entry) => {
    acc[entry.character] = {
      ...entry,
      emoji: emojiFor(entry.character),
      note: `Basis for ${entry.character} in ${entry.show}`,
    };
    return acc;
  }, {});
}

export async function getThomasArticleIndex() {
  return {};
}
