// ── Static known locomotive → character mappings ──────────────────────────────
// Keyed by exact Wikipedia article title of the REAL locomotive.
// These are verified manually and are always reliable.
export const STATIC_CHARACTERS = {
  'LBSCR E2 class':           { character:'Thomas',    show:'Thomas & Friends', color:'#1d6fc4', note:'The E2 class was the direct basis for Thomas the Tank Engine', minRarity:'E' },
  'LNER Class A1':            { character:'Gordon',    show:'Thomas & Friends', color:'#1d4ed8', note:'Gordon the Big Engine is based on the LNER Class A1', minRarity:'E' },
  'LNER Class A3':            { character:'Gordon',    show:'Thomas & Friends', color:'#1d4ed8', note:'Gordon the Big Engine is partly based on the LNER Class A3', minRarity:'E' },
  'LMS Fowler 4F':            { character:'Henry',     show:'Thomas & Friends', color:'#16a34a', note:'Henry the Green Engine is based on the Fowler 4F', minRarity:'E' },
  'GWR 5700 class':           { character:'Duck',      show:'Thomas & Friends', color:'#b45309', note:'Duck the Great Western Engine is based on the GWR 5700 Pannier', minRarity:'E' },
  'GWR 1400 class':           { character:'Oliver',    show:'Thomas & Friends', color:'#15803d', note:'Oliver the Great Western Engine is based on the GWR 1400 class', minRarity:'E' },
  'GER Class J70':            { character:'Toby',      show:'Thomas & Friends', color:'#92400e', note:'Toby the Tram Engine is based on the GER J70 tram engine', minRarity:'E' },
  'GNR Stirling Single':      { character:'Emily',     show:'Thomas & Friends', color:'#166534', note:'Emily is based on the Stirling Single', minRarity:'E' },
  'Furness Railway K2 class': { character:'James',     show:'Thomas & Friends', color:'#b91c1c', note:'James the Red Engine is based on the Furness Railway K2', minRarity:'E' },
  'LNER Class A4':            { character:'Spencer',   show:'Thomas & Friends', color:'#9ca3af', note:'Spencer the Silver Engine is based on the LNER A4 streamliner', minRarity:'E' },
  'LBSCR B2 class':           { character:'Edward',    show:'Thomas & Friends', color:'#2563eb', note:'Edward the Blue Engine is based on the LBSCR B2 class', minRarity:'E' },
  'GWR Hall class':           { character:'Hogwarts Express', show:'Harry Potter', color:'#92400e', note:'5972 Olton Hall, a GWR Hall, stars as the Hogwarts Express', minRarity:'E' },
  'Pere Marquette 1225':      { character:'The Polar Express', show:'The Polar Express', color:'#1d4ed8', note:'Pere Marquette 1225 directly inspired The Polar Express film', minRarity:'L' },
  'Talyllyn Railway':         { character:'Ivor',      show:'Ivor the Engine', color:'#15803d', note:'The Talyllyn Railway inspired the BBC series Ivor the Engine', minRarity:'E' },
  'JNR Class D51':            { character:'No-Face\'s Train', show:'Spirited Away', color:'#4c1d95', note:'The ghostly ocean train in Spirited Away is based on the D51', minRarity:'E' },
};

// ── Strict wikitext character detection ────────────────────────────────────────
// ONLY match if the text explicitly says this loco/class is the BASIS FOR a named character.
// Each pattern has:
//   - basis: regex that must match (indicates the loco is the direct inspiration)
//   - character: the character data to attach
//
// The basis regex requires "basis", "based on", "modelled", or "inspired" to appear
// within a short window of the character name — NOT just any mention.
export const CHARACTER_DETECTION_RULES = [
  {
    // Thomas — must say "basis for Thomas" or "based on [E2]... Thomas"
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for|inspired.*?)\s+(?:the character\s+)?Thomas(?:\s+the Tank Engine)?\b/i,
    character: 'Thomas', show: 'Thomas & Friends', color: '#1d6fc4', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Gordon(?:\s+the Big Engine)?\b/i,
    character: 'Gordon', show: 'Thomas & Friends', color: '#1d4ed8', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?James(?:\s+the Red Engine)?\b/i,
    character: 'James', show: 'Thomas & Friends', color: '#b91c1c', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Percy(?:\s+the Small Engine)?\b/i,
    character: 'Percy', show: 'Thomas & Friends', color: '#16a34a', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Henry(?:\s+the Green Engine)?\b/i,
    character: 'Henry', show: 'Thomas & Friends', color: '#15803d', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Edward(?:\s+the Blue Engine)?\b/i,
    character: 'Edward', show: 'Thomas & Friends', color: '#2563eb', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Toby(?:\s+the Tram Engine)?\b/i,
    character: 'Toby', show: 'Thomas & Friends', color: '#92400e', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Duck(?:\s+the Great Western)?\b/i,
    character: 'Duck', show: 'Thomas & Friends', color: '#b45309', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Emily\b/i,
    character: 'Emily', show: 'Thomas & Friends', color: '#166534', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Spencer\b/i,
    character: 'Spencer', show: 'Thomas & Friends', color: '#9ca3af', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Oliver\b/i,
    character: 'Oliver', show: 'Thomas & Friends', color: '#15803d', minRarity: 'E',
  },
  {
    basis: /\b(?:basis for|based on|model(?:led)? for|inspiration for)\s+(?:the character\s+)?Hiro\b/i,
    character: 'Hiro', show: 'Thomas & Friends', color: '#7c3aed', minRarity: 'E',
  },
  // Non-Thomas franchises — also strict
  {
    basis: /Hogwarts Express/i,
    character: 'Hogwarts Express', show: 'Harry Potter', color: '#92400e', minRarity: 'E',
    // Extra: only if it's actually USED as, not just mentioned
    requirePhrase: /(?:used|starring|painted|filmed|featured|appears)\s+as\s+the\s+Hogwarts/i,
  },
  {
    basis: /(?:Polar Express|Pere Marquette 1225)/i,
    character: 'The Polar Express', show: 'The Polar Express', color: '#1d4ed8', minRarity: 'L',
    requirePhrase: /(?:inspir|basis|based|model)/i,
  },
  {
    basis: /Ivor the Engine/i,
    character: 'Ivor', show: 'Ivor the Engine', color: '#15803d', minRarity: 'E',
    requirePhrase: /(?:inspir|basis|based|model)/i,
  },
  {
    basis: /Spirited Away/i,
    character: 'No-Face\'s Train', show: 'Spirited Away', color: '#4c1d95', minRarity: 'E',
    requirePhrase: /(?:inspir|basis|based|model)/i,
  },
];

const COLORS = {
  Thomas:'#1d6fc4', Gordon:'#1d4ed8', James:'#b91c1c', Percy:'#16a34a',
  Henry:'#15803d', Edward:'#2563eb', Toby:'#92400e', Duck:'#b45309',
  Emily:'#166534', Spencer:'#9ca3af', Oliver:'#15803d', Hiro:'#7c3aed',
  'Hogwarts Express':'#92400e', 'The Polar Express':'#1d4ed8', 'Ivor':'#15803d',
};

/**
 * Parse wikitext of a REAL locomotive article for strict character matches.
 * Only returns a character if the article explicitly says this loco is the
 * basis/model/inspiration for a named fictional character.
 *
 * The "In popular culture" section is checked first, then the intro.
 */
export function parseCharacterFromWikitext(wikitext) {
  if (!wikitext) return null;

  // Strip wiki markup to clean text
  const clean = wikitext
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')   // [[link|text]] → text
    .replace(/\{\{[^}]*\}\}/g, '')                      // templates
    .replace(/'{2,}/g, '')                              // bold/italic
    .replace(/<ref[^>]*\/>/g, '')                       // self-closing refs
    .replace(/<ref[^>]*>.*?<\/ref>/gs, '')              // ref content
    .replace(/<[^>]+>/g, ' ')                           // HTML tags
    .replace(/\s+/g, ' ');

  // Find "In popular culture" section (or equivalent)
  const cultureRe = /(?:={2,4})\s*(?:In (?:popular )?culture|Fiction|Fictional characters?|Cultural references?|In fiction|In media|Popular culture)\s*(?:={2,4})/i;
  const cultureMatch = cultureRe.exec(clean);

  // We check: (1) popular culture section, (2) intro
  const introText   = clean.slice(0, 1500);
  const cultureText = cultureMatch
    ? clean.slice(cultureMatch.index, cultureMatch.index + 3000)
    : '';

  const searchTexts = [cultureText, introText].filter(Boolean);

  for (const rule of CHARACTER_DETECTION_RULES) {
    for (const text of searchTexts) {
      const basisMatch = rule.basis.test(text);
      if (!basisMatch) continue;

      // If rule has an extra requirePhrase check, apply it
      if (rule.requirePhrase && !rule.requirePhrase.test(text)) continue;

      // Extract the matching sentence as the note
      const matchResult = text.match(
        new RegExp('.{0,200}' + rule.basis.source + '.{0,200}', 'i')
      );
      let note = matchResult?.[0]?.replace(/\[\d+\]/g, '').replace(/\s+/g, ' ').trim() ?? '';
      if (note.length > 180) note = note.slice(0, 180).replace(/\s+\S+$/, '') + '…';
      if (note && !note.endsWith('.') && !note.endsWith('…')) note += '.';

      const color = COLORS[rule.character] ?? '#6b7280';
      return {
        character: rule.character,
        show:      rule.show,
        color,
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
  // Never auto-promote to Mythic via character boost
  return ORDER[Math.min(Math.max(curr, min), 3)]; // cap at L (index 3)
}

export function getCharacterForTrain(title, thomasIndex = {}) {
  return thomasIndex[title] ?? STATIC_CHARACTERS[title] ?? null;
}
