// Derives a display colour for a Thomas & Friends character using two methods:
// 1. Known canonical livery map (accurate for the main cast)
// 2. Fuzzy keyword extraction from the character's Wikipedia extract text
//    e.g. "green engine" → green, "red engine" → red

// ── Canonical livery colours (accurate, manually verified) ─────────────────────
const KNOWN_LIVERIES = {
  // Blues
  thomas:    '#1565c0', edward:    '#1976d2', gordon:    '#1a237e',
  connor:    '#1565c0', ryan:      '#1976d2', phillip:   '#4a148c',
  nia:       '#e65100', ivan:      '#1565c0', noor:      '#e65100',
  // Reds
  james:     '#c62828', victor:    '#c62828', samson:    '#b71c1c',
  billy:     '#c62828', carlos:    '#c62828', yong:      '#c62828',
  kana:      '#c62828', bertie:    '#d32f2f', rosie:     '#ad1457',
  // Greens
  percy:     '#2e7d32', henry:     '#1b5e20', duck:      '#2e7d32',
  emily:     '#1b5e20', oliver:    '#2e7d32', mavis:     '#212121',
  whiff:     '#388e3c', rusty:     '#bf360c', timothy:   '#f57f17',
  bash:      '#2e7d32', ferdinand: '#2e7d32', flora:     '#f57f17',
  luke:      '#2e7d32', millie:    '#f9a825', freddie:   '#f9a825',
  // Browns / Earth
  toby:      '#4e342e', trevor:    '#4e342e', toad:      '#4e342e',
  // Greys / Silvers
  spencer:   '#78909c', stephen:   '#fdd835', glynn:     '#fdd835',
  donald:    '#37474f', douglas:   '#37474f', diesel:    '#212121',
  boco:      '#1b5e20', daisy:     '#4caf50', paxton:    '#1565c0',
  stanley:   '#9e9e9e', hiro:      '#212121', winston:   '#c62828',
  murdoch:   '#4e342e', dennis:    '#fdd835', arthur:    '#1565c0',
  // Yellows / Oranges
  charlie:   '#f9a825', molly:     '#fdd835', kevin:     '#f57f17',
  dash:      '#1565c0', sonny:     '#f9a825', axel:      '#f9a825',
  // Pinks / Purples
  ashima:    '#d81b60', rebecca:   '#f9a825', caitlin:   '#e3f2fd',
  // Others
  pip:       '#1565c0', emma:      '#fdd835', whiro:     '#1b5e20',
  rajiv:     '#e65100', lorenzo:   '#4a148c', bruno:     '#37474f',
  natasha:   '#1565c0', the_fat_controller: '#212121',
};

// ── Colour keyword extraction from text ────────────────────────────────────────
// If the character isn't in KNOWN_LIVERIES, scan the extract for colour words
const COLOUR_WORDS = {
  blue:   '#1565c0', dark_blue: '#0d47a1', light_blue: '#1e88e5',
  red:    '#c62828', dark_red:  '#b71c1c', crimson: '#b71c1c',
  green:  '#2e7d32', dark_green:'#1b5e20', lime:    '#388e3c',
  yellow: '#f9a825', gold:      '#f9a825', golden:  '#f9a825',
  orange: '#e65100', amber:     '#ff8f00',
  purple: '#4a148c', violet:    '#4a148c',
  pink:   '#ad1457',
  grey:   '#546e7a', gray:      '#546e7a', silver:  '#78909c',
  black:  '#212121', dark:      '#212121',
  brown:  '#4e342e', chocolate: '#4e342e',
  white:  '#90a4ae', cream:     '#a1887f',
};

/**
 * Returns a hex colour for a character.
 * Priority: known livery → text extraction → fallback.
 *
 * @param {string} characterName  - The character name (e.g. "Duck")
 * @param {string} [extract]      - Wikipedia extract text for fuzzy fallback
 * @returns {string} hex colour
 */
export function getCharacterColour(characterName, extract = '') {
  // 1. Known livery lookup (normalise to lowercase, strip spaces/punctuation)
  const key = characterName.toLowerCase().replace(/[^a-z]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  if (KNOWN_LIVERIES[key]) return KNOWN_LIVERIES[key];

  // 2. Fuzzy: scan extract for "X [engine/locomotive/train]" or "painted X"
  const text = (characterName + ' ' + extract).toLowerCase();
  const engineColourRe = /\b(blue|red|green|yellow|gold|orange|purple|pink|grey|gray|silver|black|brown|white|dark blue|light blue|dark green|dark red)\s+(?:engine|locomotive|tank|tender|loco|train|tram|coach)\b/g;
  const paintedRe      = /\bpainted\s+(blue|red|green|yellow|gold|orange|purple|pink|grey|gray|silver|black|brown|white)\b/;

  let match = engineColourRe.exec(text);
  if (match) {
    const c = match[1].replace(' ', '_');
    if (COLOUR_WORDS[c]) return COLOUR_WORDS[c];
  }
  match = paintedRe.exec(text);
  if (match && COLOUR_WORDS[match[1]]) return COLOUR_WORDS[match[1]];

  // 3. Scan for any colour word near the character name
  for (const [word, hex] of Object.entries(COLOUR_WORDS)) {
    const re = new RegExp(`\\b${word.replace('_', '\\s+')}\\b`, 'i');
    if (re.test(text.slice(0, 200))) return hex;
  }

  return '#546e7a'; // neutral slate fallback
}
