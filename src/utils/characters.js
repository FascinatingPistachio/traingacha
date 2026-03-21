import { getCharacterColour } from './trainColour.js';

// ── Static real locomotive → fictional character mappings ──────────────────────
export const STATIC_CHARACTERS = {
  // NWR Main Cast bases
  'LBSCR E2 class':               { character:'Thomas',      show:'Thomas & Friends', color:getCharacterColour('Thomas'),      note:'Awdry based Thomas the Tank Engine on the LBSCR E2 class',                minRarity:'E' },
  'LNER Class A1':                { character:'Gordon',      show:'Thomas & Friends', color:getCharacterColour('Gordon'),      note:'Gordon the Big Engine is based on the Gresley A1 Pacific',               minRarity:'E' },
  'LNER Class A3':                { character:'Gordon',      show:'Thomas & Friends', color:getCharacterColour('Gordon'),      note:'Gordon is based on the Gresley A3 — class of Flying Scotsman',           minRarity:'E' },
  'GWR 57xx':                     { character:'Duck',        show:'Thomas & Friends', color:getCharacterColour('Duck'),        note:'Duck the Great Western Engine is based on the GWR 57xx pannier tank',     minRarity:'E' },
  'GWR 5700 class':               { character:'Duck',        show:'Thomas & Friends', color:getCharacterColour('Duck'),        note:'Duck is based on the GWR 5700 class pannier tank',                        minRarity:'E' },
  'GWR 14xx class':               { character:'Oliver',      show:'Thomas & Friends', color:getCharacterColour('Oliver'),      note:'Oliver the Great Western Engine is based on the GWR 14xx class',         minRarity:'E' },
  'GWR 1400 class':               { character:'Oliver',      show:'Thomas & Friends', color:getCharacterColour('Oliver'),      note:'Oliver is based on the GWR 1400 class auto-tank',                        minRarity:'E' },
  'LNER Class J70':               { character:'Toby',        show:'Thomas & Friends', color:getCharacterColour('Toby'),        note:'Toby the Tram Engine is based on the GER/LNER J70 tram locomotive',       minRarity:'E' },
  'GER Class J70':                { character:'Toby',        show:'Thomas & Friends', color:getCharacterColour('Toby'),        note:'Toby the Tram Engine is based on the Great Eastern Railway J70',          minRarity:'E' },
  'GNR Stirling Single':          { character:'Emily',       show:'Thomas & Friends', color:getCharacterColour('Emily'),       note:'Emily is based on the Stirling Single Victorian express engine',           minRarity:'E' },
  'Stirling Single':              { character:'Emily',       show:'Thomas & Friends', color:getCharacterColour('Emily'),       note:'Emily is based on the Stirling Single Victorian express engine',           minRarity:'E' },
  'LNER Class A4':                { character:'Spencer',     show:'Thomas & Friends', color:getCharacterColour('Spencer'),     note:'Spencer the Silver Engine is based on the LNER A4 streamlined Pacific',   minRarity:'E' },
  'LBSCR B2 class':               { character:'Edward',      show:'Thomas & Friends', color:getCharacterColour('Edward'),      note:'Edward the Blue Engine is based on the LBSCR B2 class',                  minRarity:'E' },
  'British Rail Class 08':        { character:'Diesel',      show:'Thomas & Friends', color:getCharacterColour('Diesel'),      note:'Diesel is based on the ubiquitous BR Class 08 0-6-0 shunter',             minRarity:'E' },
  'Caledonian Railway 439 class': { character:'Donald',      show:'Thomas & Friends', color:getCharacterColour('Donald'),      note:'Donald is based on the Caledonian Railway 439 class tank engine',         minRarity:'E' },
  'English Electric Type 1':      { character:'BoCo',        show:'Thomas & Friends', color:getCharacterColour('BoCo'),        note:'BoCo the mixed-traffic engine is based on the English Electric Type 1',   minRarity:'E' },
  'British Rail Class 20':        { character:'BoCo',        show:'Thomas & Friends', color:getCharacterColour('BoCo'),        note:'BoCo is based on the BR Class 20 diesel locomotive',                      minRarity:'E' },
  'Furness Railway K2 class':     { character:'James',       show:'Thomas & Friends', color:getCharacterColour('James'),       note:'James the Red Engine is based on the Furness Railway K2 class',           minRarity:'E' },
  'LMS Fowler 4F':                { character:'Henry',       show:'Thomas & Friends', color:getCharacterColour('Henry'),       note:'Henry the Green Engine is based on the LMS Fowler 4F',                   minRarity:'E' },
  'LBSCR D1 class':               { character:'Percy',       show:'Thomas & Friends', color:getCharacterColour('Percy'),       note:'Percy the Small Engine is based on the LBSCR D1 class saddle tank',       minRarity:'E' },
  'Avonside Engine Company':      { character:'Percy',       show:'Thomas & Friends', color:getCharacterColour('Percy'),       note:'Percy may be partly based on Avonside industrial tank engines',           minRarity:'E' },
  'BR Standard Class 4MT':        { character:'Arthur',      show:'Thomas & Friends', color:getCharacterColour('Arthur'),      note:'Arthur the tank engine is based on the BR Standard Class 4MT',            minRarity:'E' },
  'GWR 6959 Modified Hall class': { character:'Hogwarts Express', show:'Harry Potter', color:'#92400e', note:'5972 Olton Hall, a GWR Modified Hall, starred as the Hogwarts Express', minRarity:'E' },
  'GWR Hall class':               { character:'Hogwarts Express', show:'Harry Potter', color:'#92400e', note:'5972 Olton Hall, a GWR Hall class, starred as the Hogwarts Express',   minRarity:'E' },
  'Pere Marquette 1225':          { character:'The Polar Express', show:'The Polar Express', color:'#1d4ed8', note:'Pere Marquette 1225 directly inspired The Polar Express',         minRarity:'L' },
  'Talyllyn Railway':             { character:'Ivor',             show:'Ivor the Engine',    color:'#2e7d32', note:'The Talyllyn Railway in Wales inspired Ivor the Engine',          minRarity:'E' },
  'JNR Class D51':                { character:'Spirit Train',     show:'Spirited Away',      color:'#4c1d95', note:'The ghostly ocean train in Spirited Away is based on the D51',    minRarity:'E' },
  'Flying Scotsman':              { character:'Flying Scotsman',  show:'Thomas & Friends',   color:getCharacterColour('Flying Scotsman'), note:'The real Flying Scotsman appears in Thomas & Friends',           minRarity:'L' },
  'Talyllyn':                     { character:'Skarloey',    show:'Thomas & Friends', color:getCharacterColour('Skarloey'),    note:'Skarloey on the Skarloey Railway is based on the Talyllyn narrow gauge engine', minRarity:'E' },
};

// ── Complete Thomas & Friends character list ────────────────────────────────────
// Covers all named engine/vehicle characters from all railways on Sodor and beyond
const THOMAS_CHARACTER_NAMES = [
  // NWR Steam
  'Thomas','Edward','Henry','Gordon','James','Percy','Toby','Duck',
  'Donald','Douglas','Oliver','Bill','Ben','Harvey','Emily','Fergus',
  'Arthur','Murdoch','Molly','Neville','Rosie','Whiff','Billy','Stanley',
  'Hank','Flora','Victor','Charlie','Bash','Dash','Ferdinand','Scruff',
  'Belle','Porter','Marion','Timothy','Ryan','Nia','Rebecca',
  // NWR Diesels
  'Diesel','Daisy','BoCo','Mavis','Derek','Diesel 10','Salty','Dennis',
  'Den','Paxton','Sidney','Norman','Philip','Hugo','Stafford','Bear',
  'Philippa','Emma','Flynn','Dart','Sonny',
  // NWR Special/Other
  'Skiff','Elizabeth','Kevin','Harold','Jeremy','Cranky','Big Mickey',
  'Carly','Reg','Winston','Rocky','Hector',
  // NWR Coaches & Wagons (named)
  'Annie','Clarabel','Henrietta','Toad','Victoria',
  // Skarloey Railway
  'Skarloey','Rheneas','Sir Handel','Peter Sam','Rusty','Duncan','Duke',
  'Bertram','Mighty Mac','Proteus','Freddie','Luke','Ivo Hugh','Madge',
  'Colin','Merrick','Owen',
  // Arlesdale Railway
  'Rex','Mike','Frank','Jock',
  // Culdee Fell Railway
  'Godred','Ernest','Wilfred','Culdee','Shane Dooiney','Patrick','Alaric','Eric','Catherine',
  // Mid Sodor Railway
  'Smudger','Albert','Gerry','Jennings','John','Atlas','Alfred',
  // Estate Railway
  'Stephen','Millie','Glynn',
  // UK Mainland
  'Flying Scotsman','Spencer','Hiro','Connor','Caitlin','Samson','Logan',
  'Merlin','Lexi','Theo','Hurricane','Frankie','Beresford','Bradford',
  'Stepney','Bluebell','Primrose','Dwayne','Eddy','Sixteen','Thirteen',
  // International — Americas
  'Marshall','Carlos','Natalie','Vinnie','Beau','Carter','Emerson','Raul',
  'Gator','Axel',
  // International — Europe
  'Etienne','Frieda','Gina','Settebello','Nuria','Angelique','Lorenzo','Beppe',
  // International — Russia/Asia
  'Ivan','Kwaku','Kobe','Ashima','Coran','Noor Jeehan','Rajinda','Rajiv',
  'Shankar','Ace','Tony',
  // International — Japan
  'Reiji','Taita','Hayato','Ryusei','Goro','Lilac','Kaito','Kisuke',
  'Kenya','Kenji','Gustavo','Gabriela','Cassia','Stefano','Ester','Marcio','Marcia',
  // International — Australia
  'Zoom',
  // All Engines Go!
  'Kana','Sandy','Bruno','Tess','Pullman',
  // The Pack
  'Nelson','Jack','Alfie','Max','Monty','Kelly','Byron','Ned','Isobella','Buster',
  // Road vehicles
  'Bertie','Bulgy','Elizabeth',
  // Other Sodor vehicles
  'Terence','Trevor','George','Caroline','Lady',
];

export const ALL_THOMAS_CHARACTERS = Object.fromEntries(
  THOMAS_CHARACTER_NAMES.map(name => [name, getCharacterColour(name)])
);

// ── Strict wikitext detection rules ────────────────────────────────────────────
export const CHARACTER_DETECTION_RULES = [
  ...THOMAS_CHARACTER_NAMES.map(name => ({
    basis: new RegExp(`\\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\\s+(?:the character\\s+)?${name.replace(/\s+/, '\\\\s+')}(?:\\s+the \\w+ Engine)?\\b`, 'i'),
    character: name,
    show: 'Thomas & Friends',
    color: getCharacterColour(name),
    minRarity: 'E',
  })),
  { basis:/Hogwarts Express/i, requirePhrase:/(?:used|stars?|filmed|painted|appears?)\\s+as\\s+the\\s+Hogwarts/i, character:'Hogwarts Express', show:'Harry Potter',        color:'#92400e', minRarity:'E' },
  { basis:/Polar Express/i,   requirePhrase:/(?:inspir|basis|based|modell)/i,                                     character:'The Polar Express', show:'The Polar Express',  color:'#1d4ed8', minRarity:'L' },
  { basis:/Ivor the Engine/i, requirePhrase:/(?:inspir|basis|based|modell)/i,                                     character:'Ivor',              show:'Ivor the Engine',    color:'#2e7d32', minRarity:'E' },
  { basis:/Spirited Away/i,   requirePhrase:/(?:inspir|basis|based|modell)/i,                                     character:'Spirit Train',       show:'Spirited Away',      color:'#4c1d95', minRarity:'E' },
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
