// Uses the Fandom v1 Articles API which explicitly supports CORS (origin=* works).
// Returns the article thumbnail which is the same as the OG image.

const FANDOM_API = 'https://ttte.fandom.com/api/v1/Articles/Details';
const imageCache  = new Map();

// Maps character name → fandom wiki article title
const ARTICLE_TITLES = {
  Thomas:  'Thomas_(T%26F)',
  Gordon:  'Gordon_(T%26F)',
  James:   'James_(T%26F)',
  Henry:   'Henry_(T%26F)',
  Edward:  'Edward_(T%26F)',
  Percy:   'Percy_(T%26F)',
  Toby:    'Toby_(T%26F)',
  Duck:    'Duck_(T%26F)',
  Emily:   'Emily_(T%26F)',
  Spencer: 'Spencer_(T%26F)',
  Oliver:  'Oliver_(T%26F)',
  Hiro:    'Hiro_(T%26F)',
};

// Fandom wiki article URLs for the "Fandom →" link
export const CHARACTER_WIKI_URLS = Object.fromEntries(
  Object.entries(ARTICLE_TITLES).map(([k, v]) => [k, `https://ttte.fandom.com/wiki/${v}`])
);

export async function fetchFandomCharacterImage(characterName) {
  if (imageCache.has(characterName)) return imageCache.get(characterName);
  const title = ARTICLE_TITLES[characterName];
  if (!title) { imageCache.set(characterName, null); return null; }
  try {
    const params = new URLSearchParams({ titles: title, width: 400, height: 400 });
    const res    = await fetch(`${FANDOM_API}?${params}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error();
    const data   = await res.json();
    const items  = Object.values(data.items ?? {});
    const url    = items[0]?.thumbnail ?? null;
    imageCache.set(characterName, url);
    return url;
  } catch {
    imageCache.set(characterName, null);
    return null;
  }
}

export function prewarmFandomCache() {
  Object.keys(ARTICLE_TITLES).forEach(c => fetchFandomCharacterImage(c).catch(() => {}));
}
