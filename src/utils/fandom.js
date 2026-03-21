// Direct static.wikia.nocookie.net image URLs — no API, no CORS issues.
// Paths computed via MD5 hash of filename (standard MediaWiki CDN formula).
// Gordon's URL verified against the og:image from ttte.fandom.com/wiki/Gordon_(T%26F).

const BASE = 'https://static.wikia.nocookie.net/ttte/images';
const SZ   = 'revision/latest/scale-to-width-down/400';

// fetchFandomCharacterImage is intentionally sync-wrapped in a Promise
// so existing async call sites continue to work without changes.
const CHARACTER_IMAGES = {
  Thomas:  `${BASE}/1/1f/Thomas_the_Tank_Engine_CGI.png/${SZ}`,
  Gordon:  `${BASE}/0/0c/MainGordonCGI2.png/${SZ}`,
  James:   `${BASE}/b/b7/MainJamesCGI2.png/${SZ}`,
  Henry:   `${BASE}/8/84/MainHenryCGI2.png/${SZ}`,
  Edward:  `${BASE}/9/94/MainEdwardCGI2.png/${SZ}`,
  Percy:   `${BASE}/7/78/MainPercyCGI2.png/${SZ}`,
  Toby:    `${BASE}/1/17/MainTobyCGI2.png/${SZ}`,
  Duck:    `${BASE}/5/51/MainDuckCGI2.png/${SZ}`,
  Emily:   `${BASE}/6/67/MainEmilyCGI2.png/${SZ}`,
  Spencer: `${BASE}/0/03/MainSpencerCGI2.png/${SZ}`,
  Oliver:  `${BASE}/9/9c/MainOliverCGI2.png/${SZ}`,
  Hiro:    `${BASE}/c/c7/MainHiroCGI2.png/${SZ}`,
};

export const CHARACTER_WIKI_URLS = {
  Thomas:  'https://ttte.fandom.com/wiki/Thomas_(T%26F)',
  Gordon:  'https://ttte.fandom.com/wiki/Gordon_(T%26F)',
  James:   'https://ttte.fandom.com/wiki/James_(T%26F)',
  Henry:   'https://ttte.fandom.com/wiki/Henry_(T%26F)',
  Edward:  'https://ttte.fandom.com/wiki/Edward_(T%26F)',
  Percy:   'https://ttte.fandom.com/wiki/Percy_(T%26F)',
  Toby:    'https://ttte.fandom.com/wiki/Toby_(T%26F)',
  Duck:    'https://ttte.fandom.com/wiki/Duck_(T%26F)',
  Emily:   'https://ttte.fandom.com/wiki/Emily_(T%26F)',
  Spencer: 'https://ttte.fandom.com/wiki/Spencer_(T%26F)',
  Oliver:  'https://ttte.fandom.com/wiki/Oliver_(T%26F)',
  Hiro:    'https://ttte.fandom.com/wiki/Hiro_(T%26F)',
};

// Returns a resolved Promise<string|null> — no fetch, no CORS.
export function fetchFandomCharacterImage(characterName) {
  return Promise.resolve(CHARACTER_IMAGES[characterName] ?? null);
}

// No-op — images are hardcoded, nothing to prewarm.
export function prewarmFandomCache() {}
