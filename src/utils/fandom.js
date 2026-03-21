// Fetches character images from the Thomas & Friends fandom wiki (thomas.fandom.com)
const FANDOM_BASE = 'https://thomas.fandom.com';
const imageCache  = new Map();

const FANDOM_PAGES = {
  'Thomas':'Thomas', 'Gordon':'Gordon', 'James':'James',
  'Henry':'Henry',   'Edward':'Edward', 'Percy':'Percy',
  'Toby':'Toby',     'Duck':'Duck',     'Emily':'Emily',
  'Spencer':'Spencer','Oliver':'Oliver', 'Hiro':'Hiro',
};

export async function fetchFandomCharacterImage(characterName) {
  if (imageCache.has(characterName)) return imageCache.get(characterName);
  const pageTitle = FANDOM_PAGES[characterName];
  if (!pageTitle) { imageCache.set(characterName, null); return null; }
  try {
    const params = new URLSearchParams({
      action:'query', titles:pageTitle, prop:'pageimages',
      pithumbsize:200, format:'json', origin:'*',
    });
    const res  = await fetch(`${FANDOM_BASE}/api.php?${params}`, { signal:AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error();
    const data  = await res.json();
    const pages = data.query?.pages ?? {};
    const page  = Object.values(pages)[0];
    const url   = page?.thumbnail?.source ?? null;
    imageCache.set(characterName, url);
    return url;
  } catch {
    imageCache.set(characterName, null);
    return null;
  }
}

export function prewarmFandomCache() {
  Object.keys(FANDOM_PAGES).forEach(c => fetchFandomCharacterImage(c).catch(()=>{}));
}
