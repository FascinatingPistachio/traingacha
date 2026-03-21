// ── Static fallback character data ────────────────────────────────────────────
// These are used when the live wikitext parser fails or as known overrides.
// Keys are Wikipedia article titles for real locomotives.

export const STATIC_CHARACTERS = {
  'LBSCR E2 class':        { character:'Thomas',   show:'Thomas & Friends', emoji:'🟦', color:'#2563eb', note:'Basis for Thomas the Tank Engine', minRarity:'E' },
  'LNER Class A1':         { character:'Gordon',   show:'Thomas & Friends', emoji:'🟦', color:'#1d4ed8', note:'Basis for Gordon the Big Engine',  minRarity:'E' },
  'LNER Class A3':         { character:'Gordon',   show:'Thomas & Friends', emoji:'🟦', color:'#1d4ed8', note:'Basis for Gordon the Big Engine',  minRarity:'E' },
  'LMS Fowler 4F':         { character:'Henry',    show:'Thomas & Friends', emoji:'🟩', color:'#16a34a', note:'Basis for Henry the Green Engine', minRarity:'E' },
  'GWR 57xx':              { character:'Duck',     show:'Thomas & Friends', emoji:'🟡', color:'#ca8a04', note:'Basis for Duck the Great Western Engine', minRarity:'E' },
  'GWR 5700 class':        { character:'Duck',     show:'Thomas & Friends', emoji:'🟡', color:'#ca8a04', note:'Basis for Duck the Great Western Engine', minRarity:'E' },
  'GWR 1400 class':        { character:'Oliver',   show:'Thomas & Friends', emoji:'🟩', color:'#15803d', note:'Basis for Oliver the Great Western Engine', minRarity:'E' },
  'GER Class J70':         { character:'Toby',     show:'Thomas & Friends', emoji:'🟫', color:'#92400e', note:'Basis for Toby the Tram Engine',   minRarity:'E' },
  'Stirling Single':       { character:'Emily',    show:'Thomas & Friends', emoji:'🟩', color:'#15803d', note:'Basis for Emily the Stirling Engine', minRarity:'E' },
  'Furness Railway K2 class': { character:'James', show:'Thomas & Friends', emoji:'🔴', color:'#dc2626', note:'Basis for James the Red Engine',  minRarity:'E' },
  'LNER Class A4':         { character:'Spencer',  show:'Thomas & Friends', emoji:'⚪', color:'#9ca3af', note:'Basis for Spencer the Silver Engine', minRarity:'E' },
  'LBSCR B2 class':        { character:'Edward',   show:'Thomas & Friends', emoji:'🟦', color:'#2563eb', note:'Basis for Edward the Blue Engine', minRarity:'E' },
  'GWR Hall class':        { character:'Hogwarts Express', show:'Harry Potter', emoji:'⚡', color:'#b45309', note:'5972 Olton Hall was used as the Hogwarts Express', minRarity:'E' },
  'Pere Marquette 1225':   { character:'The Polar Express', show:'The Polar Express', emoji:'❄️', color:'#0284c7', note:'Locomotive that inspired The Polar Express', minRarity:'L' },
  'Talyllyn Railway':      { character:'Ivor',     show:'Ivor the Engine', emoji:'🟩', color:'#15803d', note:'Inspiration for Ivor the Engine', minRarity:'E' },
  'JNR Class D51':         { character:'No-Face Train', show:'Spirited Away', emoji:'👻', color:'#7c3aed', note:'The ocean train in Spirited Away is based on this class', minRarity:'E' },
};

// ── Known Thomas character name patterns for wikitext parsing ─────────────────
// Each entry maps a character name (regex) to display metadata.
export const THOMAS_CHARACTERS = [
  { pattern:/\bThomas the Tank Engine\b/i,  character:'Thomas',  show:'Thomas & Friends', emoji:'🟦', color:'#2563eb', minRarity:'E' },
  { pattern:/\bGordon the Big Engine\b/i,   character:'Gordon',  show:'Thomas & Friends', emoji:'🟦', color:'#1d4ed8', minRarity:'E' },
  { pattern:/\bJames the Red Engine\b/i,    character:'James',   show:'Thomas & Friends', emoji:'🔴', color:'#dc2626', minRarity:'E' },
  { pattern:/\bPercy the Small Engine\b/i,  character:'Percy',   show:'Thomas & Friends', emoji:'🟩', color:'#16a34a', minRarity:'E' },
  { pattern:/\bHenry the Green Engine\b/i,  character:'Henry',   show:'Thomas & Friends', emoji:'🟩', color:'#15803d', minRarity:'E' },
  { pattern:/\bEdward the Blue Engine\b/i,  character:'Edward',  show:'Thomas & Friends', emoji:'🟦', color:'#3b82f6', minRarity:'E' },
  { pattern:/\bToby the Tram Engine\b/i,    character:'Toby',    show:'Thomas & Friends', emoji:'🟫', color:'#92400e', minRarity:'E' },
  { pattern:/\bDuck the Great Western\b/i,  character:'Duck',    show:'Thomas & Friends', emoji:'🟡', color:'#ca8a04', minRarity:'E' },
  { pattern:/\bEmily.*Stirling\b/i,         character:'Emily',   show:'Thomas & Friends', emoji:'🟩', color:'#15803d', minRarity:'E' },
  { pattern:/\bSpencer.*silver\b/i,         character:'Spencer', show:'Thomas & Friends', emoji:'⚪', color:'#9ca3af', minRarity:'E' },
  { pattern:/\bOliver the Great Western\b/i,character:'Oliver',  show:'Thomas & Friends', emoji:'🟩', color:'#15803d', minRarity:'E' },
  { pattern:/\bHiro.*Japan\b/i,             character:'Hiro',    show:'Thomas & Friends', emoji:'🟣', color:'#7c3aed', minRarity:'E' },
  { pattern:/\bThe Railway Series\b/i,      character:'Thomas',  show:'Thomas & Friends', emoji:'🟦', color:'#2563eb', minRarity:'E' },
  { pattern:/\bW\.? Awdry\b/i,             character:'Thomas',  show:'Thomas & Friends', emoji:'🟦', color:'#2563eb', minRarity:'E' },
  { pattern:/\bHogwarts Express\b/i,        character:'Hogwarts Express', show:'Harry Potter', emoji:'⚡', color:'#b45309', minRarity:'E' },
  { pattern:/\bPolar Express\b/i,           character:'The Polar Express', show:'The Polar Express', emoji:'❄️', color:'#0284c7', minRarity:'L' },
  { pattern:/\bIvor the Engine\b/i,         character:'Ivor',    show:'Ivor the Engine', emoji:'🟩', color:'#15803d', minRarity:'E' },
  { pattern:/\bSpirited Away\b/i,           character:'No-Face Train', show:'Spirited Away', emoji:'👻', color:'#7c3aed', minRarity:'E' },
];

/**
 * Parse the raw wikitext of an article and look for popular culture / fictional
 * character references. Returns character data or null.
 *
 * Strategy:
 * 1. Find the "In popular culture" section (or similar headings)
 * 2. Scan the text for known character name patterns
 * 3. Also look for trigger phrases like "basis for", "based on", "inspired" near
 *    any known character name
 */
export function parseCharacterFromWikitext(wikitext) {
  if (!wikitext) return null;

  // Find popular culture / fiction section
  const sectionRe = /={2,4}\s*(In (?:popular )?culture|Fiction|Fictional|Cultural references?|In fiction|In media)\s*={2,4}/i;
  const sectionMatch = sectionRe.exec(wikitext);

  // Use either the section text or the full article (some loco articles mention it in the intro)
  const searchText = sectionMatch
    ? wikitext.slice(sectionMatch.index, sectionMatch.index + 2000)
    : wikitext.slice(0, 3000); // check first 3000 chars of intro too

  // Strip wiki markup for cleaner matching
  const plain = searchText
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2') // [[link|text]] → text
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/'{2,}/g, '')
    .replace(/<ref[^>]*>.*?<\/ref>/gs, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

  // Try each known character pattern
  for (const char of THOMAS_CHARACTERS) {
    if (char.pattern.test(plain)) {
      // Extract the surrounding sentence for the note
      const match = plain.match(new RegExp('.{0,120}' + char.pattern.source + '.{0,120}', 'i'));
      let note = match ? match[0].replace(/^\s*[,;.]\s*/, '').trim() : `Inspiration for ${char.character}`;
      // Clean up and truncate
      note = note.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').slice(0, 140).trim();
      if (!note.endsWith('.')) note += '.';
      return { ...char, note };
    }
  }

  return null;
}

export function applyCharacterRarityBoost(rarity, character) {
  if (!character?.minRarity) return rarity;
  const ORDER = ['C', 'R', 'E', 'L', 'M'];
  const curr  = ORDER.indexOf(rarity);
  const min   = ORDER.indexOf(character.minRarity);
  // Never auto-promote to Mythic via character boost
  return ORDER[Math.min(Math.max(curr, min), 3)];
}

export function getCharacterForTrain(title, thomasIndex = {}) {
  return thomasIndex[title] ?? STATIC_CHARACTERS[title] ?? null;
}
