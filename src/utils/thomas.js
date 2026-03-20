// Fetches the Thomas & Friends character list from Wikipedia and parses out
// character → real locomotive mappings.
// Results are cached in sessionStorage for 24 hours.

const CACHE_KEY = 'rg_thomas_v2';
const CACHE_TTL = 24 * 60 * 60 * 1000;

// Fallback emoji map for well-known characters so cards look nice
const CHAR_EMOJI = {
  thomas:  '🟦', gordon:  '🔵', henry:   '🟢', james:   '🔴',
  percy:   '🟩', toby:    '🟫', duck:    '🟡', donald:  '⬜',
  douglas: '⬜', oliver:  '🟢', emily:   '🟩', edward:  '🔵',
  spencer: '⚪', hiro:    '🟣', victor:  '🟥', kevin:   '🟠',
  charlie: '🟨', bash:    '🟤', dash:    '🟤', ferdinand: '🟤',
  luke:    '🟩', millie:  '🟪', stephen: '🟡', paxton:  '🔵',
  timothy: '🟤', ryan:    '🔵', phillip: '🟣', nia:     '🟧',
  rebecca: '🟡', caitlin: '⬜', connor:  '🔵', samson:  '🟥',
};

function emojiFor(name) {
  return CHAR_EMOJI[name.toLowerCase()] ?? '🚂';
}

// ── Wikitext parser ──────────────────────────────────────────────────────────
// The Thomas & Friends characters page uses == Heading == sections for each
// character. We extract the character name and any locomotive basis mentioned.

function parseWikitext(wikitext) {
  const results = {};

  // Split into sections by == heading ==
  const sectionRe = /^(={2,4})\s*([^=\n]+?)\s*\1\s*$/gm;
  const sectionMatches = [...wikitext.matchAll(sectionRe)];

  sectionMatches.forEach((match, idx) => {
    const depth       = match[1].length;
    const charName    = match[2].trim();
    if (depth > 3) return; // skip deep sub-sections
    if (/see also|notes|refer/i.test(charName)) return;

    // Content between this heading and the next same-or-higher-level heading
    const start = match.index + match[0].length;
    const end   = sectionMatches[idx + 1]?.index ?? wikitext.length;
    const body  = wikitext.slice(start, end);

    // Strip wiki markup for easier regex
    const plain = body
      .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')  // [[link|text]] → text
      .replace(/\{\{[^}]+\}\}/g, '')                     // templates
      .replace(/'{2,}/g, '')                             // bold/italic
      .replace(/<[^>]+>/g, ' ')                          // HTML tags
      .replace(/\n+/g, ' ')
      .trim();

    if (!plain) return;

    // Look for locomotive basis patterns
    const basedOnPatterns = [
      /based on (?:a |an |the )?([A-Z][^.,]{4,80}?(?:class|Class|type|Type|locomotive|engine|loco|tank))/i,
      /modelled? on (?:a |an |the )?([A-Z][^.,]{4,80}?(?:class|Class|type|Type|locomotive|engine))/i,
      /inspired by (?:a |an |the )?([A-Z][^.,]{4,80}?(?:class|Class|type|Type|locomotive|engine))/i,
      /real.world basis is (?:a |an |the )?([A-Z][^.,]{4,80})/i,
    ];

    let realLoco = null;
    for (const pat of basedOnPatterns) {
      const m = plain.match(pat);
      if (m) { realLoco = m[1].replace(/\s+/g, ' ').trim(); break; }
    }

    // Also try to pull a Wikipedia article title from a [[link]] near "based on"
    const wikiLinkNearBased = body.match(
      /based on[^.]{0,60}\[\[([^\]|#]+?)(?:\|[^\]]+)?\]\]/i
    );
    const wikiArticle = wikiLinkNearBased?.[1]?.trim() ?? null;

    if (!realLoco && !wikiArticle) return; // no useful data

    results[charName] = {
      character:  charName,
      show:       'Thomas & Friends',
      emoji:      emojiFor(charName),
      note:       `Inspiration for ${charName} in Thomas & Friends`,
      realLoco:   realLoco ?? charName,
      wikiArticle: wikiArticle,   // the exact Wikipedia article title if found
      minRarity:  'E',
    };
  });

  return results;
}

// ── Public API ───────────────────────────────────────────────────────────────

let _promise = null;   // singleton in-flight request

export async function fetchThomasCharacters() {
  // 1. Check cache
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL) return data;
    }
  } catch {}

  // 2. Deduplicate concurrent calls
  if (_promise) return _promise;

  _promise = (async () => {
    try {
      const params = new URLSearchParams({
        action:  'query',
        titles:  'List of Thomas & Friends characters',
        prop:    'revisions',
        rvprop:  'content',
        rvslots: 'main',
        format:  'json',
        origin:  '*',
      });
      const res   = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      if (!res.ok) throw new Error('fetch failed');
      const json  = await res.json();
      const pages = json.query?.pages ?? {};
      const page  = Object.values(pages)[0];
      const text  = page?.revisions?.[0]?.slots?.main?.['*'] ?? '';

      const data = parseWikitext(text);

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
      } catch {}

      return data;
    } catch {
      return {};
    } finally {
      _promise = null;
    }
  })();

  return _promise;
}

// ── Reverse index: Wikipedia article title → character data ─────────────────
// Used by wikipedia.js to check if a pulled card's article matches a character.

let _articleIndex = null;

export async function getThomasArticleIndex() {
  if (_articleIndex) return _articleIndex;
  const chars = await fetchThomasCharacters();

  const index = {};
  for (const char of Object.values(chars)) {
    // Index by explicit wikiArticle title (most reliable)
    if (char.wikiArticle) {
      index[char.wikiArticle] = char;
    }
    // Also index by the realLoco string (fallback fuzzy match handled elsewhere)
    if (char.realLoco) {
      index[char.realLoco] = char;
    }
  }
  _articleIndex = index;
  return index;
}
