// Fetches OG preview images from the Thomas fandom wiki.
// Uses allorigins.win as a CORS proxy to fetch the page HTML and extract the og:image tag
// — the same image Discord/social media show as a preview.

const PROXY    = 'https://api.allorigins.win/raw?url=';
const imageCache = new Map();

// Map character name → fandom wiki URL
const FANDOM_URLS = {
  Thomas:  'https://thomas.fandom.com/wiki/Thomas',
  Gordon:  'https://thomas.fandom.com/wiki/Gordon',
  James:   'https://thomas.fandom.com/wiki/James',
  Henry:   'https://thomas.fandom.com/wiki/Henry',
  Edward:  'https://thomas.fandom.com/wiki/Edward',
  Percy:   'https://thomas.fandom.com/wiki/Percy',
  Toby:    'https://thomas.fandom.com/wiki/Toby',
  Duck:    'https://thomas.fandom.com/wiki/Duck',
  Emily:   'https://thomas.fandom.com/wiki/Emily',
  Spencer: 'https://thomas.fandom.com/wiki/Spencer',
  Oliver:  'https://thomas.fandom.com/wiki/Oliver',
  Hiro:    'https://thomas.fandom.com/wiki/Hiro',
};

/**
 * Fetch the OG:image for a fandom wiki character page.
 * Returns a URL string or null.
 */
export async function fetchFandomCharacterImage(characterName) {
  if (imageCache.has(characterName)) return imageCache.get(characterName);

  const pageUrl = FANDOM_URLS[characterName];
  if (!pageUrl) {
    imageCache.set(characterName, null);
    return null;
  }

  try {
    const res = await fetch(
      PROXY + encodeURIComponent(pageUrl),
      { signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) throw new Error();
    const html = await res.text();

    // Extract og:image
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
                ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    const url = match?.[1] ?? null;
    imageCache.set(characterName, url);
    return url;
  } catch {
    imageCache.set(characterName, null);
    return null;
  }
}

export function prewarmFandomCache() {
  Object.keys(FANDOM_URLS).forEach(c =>
    fetchFandomCharacterImage(c).catch(() => {})
  );
}
