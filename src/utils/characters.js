import { getCharacterColour } from './trainColour.js';

// ── Static real locomotive → fictional character mappings ──────────────────────
// colour is resolved at module load time via getCharacterColour (canonical livery map).
export const STATIC_CHARACTERS = {
  'LBSCR E2 class':               { character:'Thomas',   show:'Thomas & Friends', color:getCharacterColour('Thomas'),  note:'Awdry based Thomas the Tank Engine on the LBSCR E2 class',                minRarity:'E' },
  'LNER Class A1':                { character:'Gordon',   show:'Thomas & Friends', color:getCharacterColour('Gordon'),  note:'Gordon the Big Engine is based on the Gresley A1 Pacific',               minRarity:'E' },
  'LNER Class A3':                { character:'Gordon',   show:'Thomas & Friends', color:getCharacterColour('Gordon'),  note:'Gordon is based on the Gresley A3 — class of Flying Scotsman',           minRarity:'E' },
  'GWR 57xx':                     { character:'Duck',     show:'Thomas & Friends', color:getCharacterColour('Duck'),    note:'Duck the Great Western Engine is based on the GWR 57xx pannier tank',     minRarity:'E' },
  'GWR 5700 class':               { character:'Duck',     show:'Thomas & Friends', color:getCharacterColour('Duck'),    note:'Duck is based on the GWR 5700 class pannier tank',                        minRarity:'E' },
  'GWR 14xx class':               { character:'Oliver',   show:'Thomas & Friends', color:getCharacterColour('Oliver'),  note:'Oliver the Great Western Engine is based on the GWR 14xx class',         minRarity:'E' },
  'LNER Class J70':               { character:'Toby',     show:'Thomas & Friends', color:getCharacterColour('Toby'),    note:'Toby the Tram Engine is based on the GER/LNER J70 tram locomotive',       minRarity:'E' },
  'Stirling Single':              { character:'Emily',    show:'Thomas & Friends', color:getCharacterColour('Emily'),   note:'Emily is based on the Stirling Single Victorian express engine',           minRarity:'E' },
  'LNER Class A4':                { character:'Spencer',  show:'Thomas & Friends', color:getCharacterColour('Spencer'), note:'Spencer the Silver Engine is based on the LNER A4 streamlined Pacific',   minRarity:'E' },
  'LBSCR B2 class':               { character:'Edward',   show:'Thomas & Friends', color:getCharacterColour('Edward'),  note:'Edward the Blue Engine is based on the LBSCR B2 class',                  minRarity:'E' },
  'British Rail Class 08':        { character:'Diesel',   show:'Thomas & Friends', color:getCharacterColour('Diesel'),  note:'Diesel is based on the ubiquitous BR Class 08 0-6-0 shunter',             minRarity:'E' },
  'Caledonian Railway 439 class': { character:'Donald',   show:'Thomas & Friends', color:getCharacterColour('Donald'),  note:'Donald is based on the Caledonian Railway 439 class tank engine',         minRarity:'E' },
  'English Electric Type 1':      { character:'BoCo',     show:'Thomas & Friends', color:getCharacterColour('BoCo'),    note:'BoCo the mixed-traffic engine is based on the English Electric Type 1',   minRarity:'E' },
  'GWR Hall class':               { character:'Hogwarts Express', show:'Harry Potter',         color:'#92400e', note:'5972 Olton Hall, a GWR Hall class, starred as the Hogwarts Express',   minRarity:'E' },
  'Pere Marquette 1225':          { character:'The Polar Express', show:'The Polar Express',   color:'#1d4ed8', note:'Pere Marquette 1225 directly inspired The Polar Express',               minRarity:'L' },
  'Talyllyn Railway':             { character:'Ivor',             show:'Ivor the Engine',      color:'#2e7d32', note:'The Talyllyn Railway in Wales inspired Ivor the Engine',                minRarity:'E' },
  'JNR Class D51':                { character:'Spirit Train',     show:'Spirited Away',        color:'#4c1d95', note:'The ghostly ocean train in Spirited Away is based on the D51',          minRarity:'E' },
};

// ── All Thomas & Friends characters (auto colour from canonical livery map) ────
const THOMAS_CHARACTER_NAMES = [
  'Thomas','Gordon','James','Percy','Henry','Edward','Toby','Duck','Emily',
  'Spencer','Oliver','Hiro','Diesel','Donald','Douglas','Bertie','Harold',
  'Mavis','Daisy','BoCo','Rusty','Rheneas','Skarloey','Luke','Victor','Kevin',
  'Charlie','Bash','Dash','Ferdinand','Timothy','Ryan','Phillip','Nia','Rebecca',
  'Caitlin','Connor','Samson','Whiff','Billy','Stanley','Rosie','Flora','Molly',
  'Murdoch','Arthur','Dennis','Freddie','Stepney','Duncan','Peter Sam','Millie',
  'Stephen','Paxton','Winston','Glynn','Pip','Emma','Sonny','Kana','Bruno',
  'Ashima','Rajiv','Carlos','Axel','Lorenzo','Yong','Ivan','Natasha','Noor',
  'Toad','Annie','Clarabel','Henrietta',
];

export const ALL_THOMAS_CHARACTERS = Object.fromEntries(
  THOMAS_CHARACTER_NAMES.map(name => [name, getCharacterColour(name)])
);

// ── Strict wikitext detection rules (generated from character list) ────────────
export const CHARACTER_DETECTION_RULES = [
  ...THOMAS_CHARACTER_NAMES.map(name => ({
    basis: new RegExp(`\\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\\s+(?:the character\\s+)?${name.replace(/\s+/, '\\\\s+')}(?:\\s+the \\w+ Engine)?\\b`, 'i'),
    character: name,
    show: 'Thomas & Friends',
    color: getCharacterColour(name),
    minRarity: 'E',
  })),
  { basis:/Hogwarts Express/i, requirePhrase:/(?:used|stars?|filmed|painted|appears?)\s+as\s+the\s+Hogwarts/i, character:'Hogwarts Express', show:'Harry Potter',       color:'#92400e', minRarity:'E' },
  { basis:/Polar Express/i,    requirePhrase:/(?:inspir|basis|based|modell)/i,                                  character:'The Polar Express', show:'The Polar Express', color:'#1d4ed8', minRarity:'L' },
  { basis:/Ivor the Engine/i,  requirePhrase:/(?:inspir|basis|based|modell)/i,                                  character:'Ivor',              show:'Ivor the Engine',   color:'#2e7d32', minRarity:'E' },
  { basis:/Spirited Away/i,    requirePhrase:/(?:inspir|basis|based|modell)/i,                                  character:'Spirit Train',       show:'Spirited Away',     color:'#4c1d95', minRarity:'E' },
];

export function parseCharacterFromWikitext(wikitext) {
  if (!wikitext) return null;
  const clean = wikitext
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')
    .replace(/\{\{[^}]*\}\}/g, '').replace(/'{2,}/g, '')
    .replace(/<ref[^>]*\/>/g, '').replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const cultureRe  = /={2,4}\s*(?:In (?:popular )?culture|Fictional? characters?|Cultural references?|In fiction|In media|Popular culture)\s*={2,4}/i;
  const cultureIdx = cultureRe.exec(clean)?.index ?? -1;
  const cultureText = cultureIdx >= 0 ? clean.slice(cultureIdx, cultureIdx + 3000) : '';
  const introText   = clean.slice(0, 1500);
  for (const rule of CHARACTER_DETECTION_RULES) {
    for (const text of [cultureText, introText].filter(Boolean)) {
      if (!rule.basis.test(text)) continue;
      if (rule.requirePhrase && !rule.requirePhrase.test(text)) continue;
      const excerpt = text.match(new RegExp(`.{0,200}${rule.basis.source}.{0,200}`, 'i'))?.[0] ?? '';
      let note = excerpt.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
      if (note.length > 160) note = note.slice(0, 160).replace(/\s+\S+$/, '') + '…';
      if (note && !note.endsWith('.') && !note.endsWith('…')) note += '.';
      return { character:rule.character, show:rule.show, color:rule.color,
        note: note || `This locomotive is the basis for ${rule.character} in ${rule.show}.`, minRarity:rule.minRarity };
    }
  }
  return null;
}

export function applyCharacterRarityBoost(rarity, character) {
  if (!character?.minRarity) return rarity;
  const ORDER = ['C','R','E','L','M'];
  return ORDER[Math.min(Math.max(ORDER.indexOf(rarity), ORDER.indexOf(character.minRarity)), 3)];
}

export function getCharacterForTrain(title, index = {}) {
  return index[title] ?? STATIC_CHARACTERS[title] ?? null;
}
