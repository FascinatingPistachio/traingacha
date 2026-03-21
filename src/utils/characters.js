// ── Hand-curated real locomotive → character mappings ──────────────────────────
// ONLY entries where the character basis is well-sourced and the Wikipedia
// article title is verified to actually exist.
export const STATIC_CHARACTERS = {
  // Thomas — LBSCR E2 class is the definitive basis (confirmed in Railway Series)
  'LBSCR E2 class':           { character:'Thomas',    show:'Thomas & Friends', color:'#1d6fc4', note:'Awdry based Thomas on the LBSCR E2 class in 1945', minRarity:'E' },

  // Gordon — LNER A1/A3 Pacifics (Gresley). Both article titles used on Wikipedia
  'LNER Class A1':            { character:'Gordon',    show:'Thomas & Friends', color:'#1a56db', note:'Gordon is based on the Gresley A1 Pacific express locomotive', minRarity:'E' },
  'LNER Class A3':            { character:'Gordon',    show:'Thomas & Friends', color:'#1a56db', note:'Gordon is based on the Gresley A3 Pacific, the same class as Flying Scotsman', minRarity:'E' },

  // James — Furness Railway K2 / LNWR Cauliflower disputed; most cited is LMS Fowler 2P
  // Actually James is based on a Midland Railway compound or LMS 2P — removing uncertain ones
  // Henry — no confirmed real prototype; Awdry said Henry was "imaginary". Removing Fowler 4F.

  // Duck — GWR 57xx Pannier Tank (confirmed by Awdry)
  'GWR 57xx':                 { character:'Duck',      show:'Thomas & Friends', color:'#b45309', note:'Duck the Great Western Engine is based on the GWR 57xx pannier tank', minRarity:'E' },
  'GWR 5700 class':           { character:'Duck',      show:'Thomas & Friends', color:'#b45309', note:'Duck the Great Western Engine is based on the GWR 5700 pannier tank class', minRarity:'E' },

  // Oliver — GWR 14xx (confirmed in Railway Series)
  'GWR 14xx':                 { character:'Oliver',    show:'Thomas & Friends', color:'#15803d', note:'Oliver is based on the GWR 14xx auto-tank class', minRarity:'E' },
  'GWR 1400 class':           { character:'Oliver',    show:'Thomas & Friends', color:'#15803d', note:'Oliver is based on the GWR 1400 class auto-tank locomotive', minRarity:'E' },

  // Toby — GER J70 tram engine (confirmed by Awdry). Correct Wikipedia title is LNER Class J70
  'LNER Class J70':           { character:'Toby',      show:'Thomas & Friends', color:'#92400e', note:'Toby the Tram Engine is directly based on the GER/LNER J70 tram engine', minRarity:'E' },

  // Emily — Stirling Single (confirmed in later Railway Series)
  'Stirling Single':          { character:'Emily',     show:'Thomas & Friends', color:'#166534', note:'Emily is based on the Stirling Single, a Victorian express locomotive', minRarity:'E' },
  'GNR Stirling Single':      { character:'Emily',     show:'Thomas & Friends', color:'#166534', note:'Emily is based on the Stirling Single designed by Patrick Stirling', minRarity:'E' },

  // Spencer — LNER A4 streamliner (confirmed)
  'LNER Class A4':            { character:'Spencer',   show:'Thomas & Friends', color:'#6b7280', note:'Spencer the Silver Engine is based on the sleek LNER A4 streamlined Pacific', minRarity:'E' },

  // Edward — LBSCR B2 (cited in Awdry notes, though debated)
  'LBSCR B2 class':           { character:'Edward',    show:'Thomas & Friends', color:'#2563eb', note:'Edward the Blue Engine is believed to be based on the LBSCR B2 class', minRarity:'E' },

  // Non-Thomas fictional characters
  'GWR Hall class':           { character:'Hogwarts Express', show:'Harry Potter', color:'#92400e', note:'GWR Hall class 5972 Olton Hall starred as the Hogwarts Express in all 8 films', minRarity:'E' },
  'Pere Marquette 1225':      { character:'The Polar Express', show:'The Polar Express', color:'#1d4ed8', note:'Pere Marquette 1225 directly inspired The Polar Express story and film', minRarity:'L' },
  'Talyllyn Railway':         { character:'Ivor',      show:'Ivor the Engine', color:'#15803d', note:'The Talyllyn narrow-gauge railway in Wales inspired Ivor the Engine', minRarity:'E' },
  'JNR Class D51':            { character:'Spirit Train', show:'Spirited Away', color:'#4c1d95', note:'The ghostly ocean train in Spirited Away is based on the Japanese D51 steam engine', minRarity:'E' },
};

// ── Strict wikitext character detection rules ────────────────────────────────
// Only match if text EXPLICITLY says this loco is the basis for a named character.
// Patterns are tested before use — see scripts/test_patterns.py
export const CHARACTER_DETECTION_RULES = [
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Thomas(?:\s+the Tank Engine)?\b/i,   character:'Thomas',  show:'Thomas & Friends', color:'#1d6fc4', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Gordon(?:\s+the Big Engine)?\b/i,   character:'Gordon',  show:'Thomas & Friends', color:'#1a56db', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?James(?:\s+the Red Engine)?\b/i,    character:'James',   show:'Thomas & Friends', color:'#b91c1c', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Percy(?:\s+the Small Engine)?\b/i,  character:'Percy',   show:'Thomas & Friends', color:'#16a34a', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Henry(?:\s+the Green Engine)?\b/i,  character:'Henry',   show:'Thomas & Friends', color:'#15803d', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Edward(?:\s+the Blue Engine)?\b/i,  character:'Edward',  show:'Thomas & Friends', color:'#2563eb', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Toby(?:\s+the Tram Engine)?\b/i,    character:'Toby',    show:'Thomas & Friends', color:'#92400e', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Duck(?:\s+the Great Western)?\b/i,  character:'Duck',    show:'Thomas & Friends', color:'#b45309', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Emily\b/i,                           character:'Emily',   show:'Thomas & Friends', color:'#166534', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Spencer\b/i,                        character:'Spencer', show:'Thomas & Friends', color:'#6b7280', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Oliver\b/i,                         character:'Oliver',  show:'Thomas & Friends', color:'#15803d', minRarity:'E' },
  { basis:/\b(?:basis for|based on|modell?ed? (?:on|after)|inspiration for|inspired)\s+(?:the character\s+)?Hiro\b/i,                           character:'Hiro',    show:'Thomas & Friends', color:'#7c3aed', minRarity:'E' },
  // Other franchises — require additional phrase to avoid false positives
  { basis:/Hogwarts Express/i,  requirePhrase:/(?:used|stars?|filmed|painted|appears?)\s+as\s+the\s+Hogwarts/i, character:'Hogwarts Express', show:'Harry Potter',       color:'#92400e', minRarity:'E' },
  { basis:/Polar Express/i,     requirePhrase:/(?:inspir|basis|based|modell)/i,                                  character:'The Polar Express', show:'The Polar Express',  color:'#1d4ed8', minRarity:'L' },
  { basis:/Ivor the Engine/i,   requirePhrase:/(?:inspir|basis|based|modell)/i,                                  character:'Ivor',              show:'Ivor the Engine',    color:'#15803d', minRarity:'E' },
  { basis:/Spirited Away/i,     requirePhrase:/(?:inspir|basis|based|modell)/i,                                  character:'Spirit Train',       show:'Spirited Away',       color:'#4c1d95', minRarity:'E' },
];

/**
 * Parse the wikitext of a REAL locomotive article looking for fictional character
 * references. Strict matching only — must say "basis for [Character]" explicitly.
 */
export function parseCharacterFromWikitext(wikitext) {
  if (!wikitext) return null;

  // Clean wiki markup
  const clean = wikitext
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/'{2,}/g, '')
    .replace(/<ref[^>]*\/>/g, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

  // Find culture/fiction section
  const cultureRe = /={2,4}\s*(?:In (?:popular )?culture|Fictional? characters?|Cultural references?|In fiction|In media|Popular culture)\s*={2,4}/i;
  const cultureIdx = cultureRe.exec(clean)?.index ?? -1;
  const cultureText = cultureIdx >= 0 ? clean.slice(cultureIdx, cultureIdx + 3000) : '';
  const introText   = clean.slice(0, 1500);

  for (const rule of CHARACTER_DETECTION_RULES) {
    for (const text of [cultureText, introText].filter(Boolean)) {
      if (!rule.basis.test(text)) continue;
      if (rule.requirePhrase && !rule.requirePhrase.test(text)) continue;

      // Extract surrounding sentence for the note
      const excerpt = text.match(new RegExp(`.{0,200}${rule.basis.source}.{0,200}`, 'i'))?.[0] ?? '';
      let note = excerpt.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim();
      if (note.length > 180) note = note.slice(0, 180).replace(/\s+\S+$/, '') + '…';
      if (note && !note.endsWith('.') && !note.endsWith('…')) note += '.';

      return {
        character: rule.character,
        show:      rule.show,
        color:     rule.color,
        note:      note || `This locomotive was the basis for ${rule.character} in ${rule.show}.`,
        minRarity: rule.minRarity,
      };
    }
  }
  return null;
}

export function applyCharacterRarityBoost(rarity, character) {
  if (!character?.minRarity) return rarity;
  const ORDER = ['C', 'R', 'E', 'L', 'M'];
  const curr  = ORDER.indexOf(rarity);
  const min   = ORDER.indexOf(character.minRarity);
  return ORDER[Math.min(Math.max(curr, min), 3)]; // cap at L
}

// No longer used externally but kept for compatibility
export function getCharacterForTrain(title, index = {}) {
  return index[title] ?? STATIC_CHARACTERS[title] ?? null;
}
