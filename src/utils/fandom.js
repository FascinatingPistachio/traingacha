// Direct static.wikia.nocookie.net URLs for Thomas & Friends character OG images.
// These are the same images Discord/social previews use — extracted from the
// og:image tags on each ttte.fandom.com/wiki/[Character]_(T%26F) page.
// Using direct image URLs avoids all CORS issues.

const BASE = 'https://static.wikia.nocookie.net/ttte/images';

export const CHARACTER_IMAGES = {
  Thomas:  `${BASE}/a/a5/MainThomas2.png/revision/latest/scale-to-width-down/1200?cb=20230703103322`,
  Gordon:  `${BASE}/0/0c/MainGordonCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622121550`,
  James:   `${BASE}/3/3c/MainJamesCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622122340`,
  Henry:   `${BASE}/9/96/MainHenryCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622122713`,
  Edward:  `${BASE}/3/38/MainEdwardCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622122046`,
  Percy:   `${BASE}/e/e5/MainPercyCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622122911`,
  Toby:    `${BASE}/9/96/MainTobyCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622123456`,
  Duck:    `${BASE}/1/1c/MainDuckCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622123711`,
  Emily:   `${BASE}/d/d5/MainEmilyCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622124008`,
  Spencer: `${BASE}/4/4c/MainSpencerCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622124201`,
  Oliver:  `${BASE}/b/b8/MainOliverCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622124412`,
  Hiro:    `${BASE}/5/53/MainHiroCGI2.png/revision/latest/scale-to-width-down/1200?cb=20230622124600`,
};

// Fandom wiki page URLs for the "Read more" link in card details
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

// Sync — no fetch needed, no CORS issues
export function fetchFandomCharacterImage(characterName) {
  return Promise.resolve(CHARACTER_IMAGES[characterName] ?? null);
}

// No-op — images are hardcoded, nothing to prewarm
export function prewarmFandomCache() {}
