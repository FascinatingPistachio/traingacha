// ── Static real locomotive → fictional character mappings ──────────────────────
export const STATIC_CHARACTERS = {
  'LBSCR E2 class':                 { character:'Thomas',    show:'Thomas & Friends', color:'#1d6fc4', note:'Awdry based Thomas the Tank Engine on the LBSCR E2 class', minRarity:'E' },
  'LNER Class A1':                  { character:'Gordon',    show:'Thomas & Friends', color:'#1a56db', note:'Gordon the Big Engine is based on the Gresley A1 Pacific', minRarity:'E' },
  'LNER Class A3':                  { character:'Gordon',    show:'Thomas & Friends', color:'#1a56db', note:'Gordon is based on the Gresley A3 Pacific — class of Flying Scotsman', minRarity:'E' },
  'GWR 57xx':                       { character:'Duck',      show:'Thomas & Friends', color:'#b45309', note:'Duck the Great Western Engine is based on the GWR 57xx pannier tank', minRarity:'E' },
  'GWR 5700 class':                 { character:'Duck',      show:'Thomas & Friends', color:'#b45309', note:'Duck is based on the GWR 5700 class pannier tank', minRarity:'E' },
  'GWR 14xx class':                 { character:'Oliver',    show:'Thomas & Friends', color:'#15803d', note:'Oliver the Great Western Engine is based on the GWR 14xx class', minRarity:'E' },
  'LNER Class J70':                 { character:'Toby',      show:'Thomas & Friends', color:'#92400e', note:'Toby the Tram Engine is based on the GER/LNER J70 tram locomotive', minRarity:'E' },
  'Stirling Single':                { character:'Emily',     show:'Thomas & Friends', color:'#166534', note:'Emily is based on the Stirling Single Victorian express engine', minRarity:'E' },
  'LNER Class A4':                  { character:'Spencer',   show:'Thomas & Friends', color:'#6b7280', note:'Spencer the Silver Engine is based on the LNER A4 streamlined Pacific', minRarity:'E' },
  'LBSCR B2 class':                 { character:'Edward',    show:'Thomas & Friends', color:'#2563eb', note:'Edward the Blue Engine is based on the LBSCR B2 class', minRarity:'E' },
  'British Rail Class 08':          { character:'Diesel',    show:'Thomas & Friends', color:'#1f2937', note:'Diesel is based on the ubiquitous BR Class 08 0-6-0 shunter', minRarity:'E' },
  'Caledonian Railway 439 class':   { character:'Donald',    show:'Thomas & Friends', color:'#374151', note:'Donald is based on the Caledonian Railway 439 class tank engine', minRarity:'E' },
  'English Electric Type 1':        { character:'BoCo',      show:'Thomas & Friends', color:'#065f46', note:'BoCo the mixed-traffic engine is based on the English Electric Type 1', minRarity:'E' },
  'GWR Hall class':                 { character:'Hogwarts Express', show:'Harry Potter', color:'#92400e', note:'5972 Olton Hall, a GWR Hall class, starred as the Hogwarts Express in all 8 films', minRarity:'E' },
  'Pere Marquette 1225':            { character:'The Polar Express', show:'The Polar Express', color:'#1d4ed8', note:'Pere Marquette 1225 directly inspired The Polar Express', minRarity:'L' },
  'Talyllyn Railway':               { character:'Ivor',      show:'Ivor the Engine', color:'#15803d', note:'The Talyllyn Railway in Wales inspired Ivor the Engine', minRarity:'E' },
  'JNR Class D51':                  { character:'Spirit Train', show:'Spirited Away', color:'#4c1d95', note:'The ghostly ocean train in Spirited Away is based on the D51', minRarity:'E' },
};

// ── All Thomas & Friends characters with their colours ─────────────────────────
// Used to match wikitext "basis for [Character]" patterns.
// Colours match the character's canonical livery.
export const ALL_THOMAS_CHARACTERS = {
  Thomas:      '#1d6fc4', Gordon:   '#1a56db', James:    '#b91c1c',
  Percy:       '#16a34a', Henry:    '#15803d', Edward:   '#2563eb',
  Toby:        '#92400e', Duck:     '#b45309', Emily:    '#166534',
  Spencer:     '#6b7280', Oliver:   '#15803d', Hiro:     '#7c3aed',
  Diesel:      '#1f2937', Donald:   '#374151', Douglas:  '#374151',
  Bertie:      '#dc2626', Harold:   '#e5e7eb', Mavis:    '#1f2937',
  Daisy:       '#16a34a', BoCo:     '#065f46', Rusty:    '#c2410c',
  Rheneas:     '#dc2626', Skarloey: '#b91c1c', Luke:     '#15803d',
  Victor:      '#dc2626', Kevin:    '#d97706', Charlie:  '#f59e0b',
  Bash:        '#15803d', Dash:     '#1d4ed8', Ferdinand:'#15803d',
  Timothy:     '#d97706', Ryan:     '#1d4ed8', Phillip:  '#7c3aed',
  Nia:         '#c2410c', Rebecca:  '#ca8a04', Caitlin:  '#e5e7eb',
  Connor:      '#1d4ed8', Samson:   '#b91c1c', Whiff:    '#166534',
  Billy:       '#dc2626', Stanley:  '#9ca3af', Rosie:    '#db2777',
  Flora:       '#d97706', Molly:    '#d97706', Murdoch:  '#1f2937',
  Arthur:      '#1d4ed8', Dennis:   '#16a34a', Freddie:  '#ca8a04',
  Stepney:     '#1d4ed8', Duncan:   '#d97706', Peter:    '#1d4ed8',
  Luke:        '#166534', Millie:   '#ca8a04', Stephen:  '#ca8a04',
  Paxton:      '#1d4ed8', Winston:  '#dc2626', Sir:      '#dc2626',
  Glynn:       '#d97706', Pip:      '#1d4ed8', Emma:     '#d97706',
  Sonny:       '#f59e0b', Kana:     '#dc2626', Bruno:    '#374151',
  Ashima:      '#db2777', Rajiv:    '#b45309', Carlos:   '#dc2626',
  Axel:        '#ca8a04', Lorenzo:  '#7c3aed', Yong:     '#dc2626',
  Ivan:        '#1d4ed8', Natasha:  '#1d4ed8', Noor:     '#ca8a04',
};

// Build detection rules from ALL_THOMAS_CHARACTERS
export const CHARACTER_DETECTION_RULES = [
  ...Object.entries(ALL_THOMAS_CHARACTERS).map(([name, color]) => ({
    basis: new RegExp(`\\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\\s+(?:the character\\s+)?${name}(?:\\s+the \\w+ Engine)?\\b`, 'i'),
    character: name, show: 'Thomas & Friends', color, minRarity: 'E',
  })),
  { basis:/Hogwarts Express/i, requirePhrase:/(?:used|stars?|filmed|painted|appears?)\\s+as\\s+the\\s+Hogwarts/i, character:'Hogwarts Express', show:'Harry Potter',       color:'#92400e', minRarity:'E' },
  { basis:/Polar Express/i,    requirePhrase:/(?:inspir|basis|based|modell)/i, character:'The Polar Express',  show:'The Polar Express', color:'#1d4ed8', minRarity:'L' },
  { basis:/Ivor the Engine/i,  requirePhrase:/(?:inspir|basis|based|modell)/i, character:'Ivor',               show:'Ivor the Engine',   color:'#15803d', minRarity:'E' },
  { basis:/Spirited Away/i,    requirePhrase:/(?:inspir|basis|based|modell)/i, character:'Spirit Train',        show:'Spirited Away',     color:'#4c1d95', minRarity:'E' },
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
