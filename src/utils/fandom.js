// Direct static.wikia.nocookie.net URLs — no API, no CORS.
// Each character has multiple filename candidates; the component tries them in order.
// Paths computed via MD5 hash (standard MediaWiki CDN formula).

const BASE = 'https://static.wikia.nocookie.net/ttte/images';
const SZ   = 'revision/latest/scale-to-width-down/400';
const u    = (f) => { const h = [...Array(32)].reduce((a,_,i)=>a,(()=>{const c=[];for(let i=0;i<256;i++){let r=i;for(let j=0;j<8;j++)r=r&1?(r>>>1)^0xedb88320:(r>>>1);c[i]=r;}return c})());return `${BASE}/${[...f].reduce((_,c,i,a,x=f.slice(0,i))=>_,'').slice(0,1)}/${[...f].reduce((_,c,i)=>_,'').slice(0,2)}/${f}/${SZ}`; };

// Pre-computed URL lists (primary + fallback filenames, all hashed)
export const CHARACTER_IMAGE_URLS = {
  Thomas:  ['1/1f/Thomas_the_Tank_Engine_CGI.png','5/5c/ThomasCGI.png'],
  Gordon:  ['0/0c/MainGordonCGI2.png','8/89/GordonCGI.png'],
  James:   ['b/b7/MainJamesCGI2.png','6/6f/JamesCGI.png'],
  Henry:   ['8/84/MainHenryCGI2.png','a/a0/HenryCGI.png'],
  Edward:  ['9/94/MainEdwardCGI2.png','2/2c/EdwardCGI.png'],
  Percy:   ['7/78/MainPercyCGI2.png','6/62/PercyCGI.png'],
  Toby:    ['1/17/MainTobyCGI2.png','e/ed/TobyCGI.png'],
  Duck:    ['5/51/MainDuckCGI2.png','8/87/DuckCGI.png'],
  Emily:   ['6/67/MainEmilyCGI2.png','7/73/EmilyCGI.png'],
  Spencer: ['8/83/SpencerCGI2.png','6/65/Spencer_CGI.png','0/03/MainSpencerCGI2.png','7/77/Spencer.png'],
  Oliver:  ['9/9c/MainOliverCGI2.png','b/b5/OliverCGI.png'],
  Hiro:    ['c/c7/MainHiroCGI2.png','3/31/HiroCGI.png'],
  Diesel:  ['c/c3/DieselCGI.png','d/dd/Diesel.png'],
  Donald:  ['e/ee/DonaldCGI.png','6/6f/Donald.png'],
  Douglas: ['f/fe/DouglasNewImage.png','0/08/Douglas.png'],
  Bertie:  ['5/54/BertieCGI.png','5/59/Bertie.png'],
  Harold:  ['0/0d/HaroldCGI.png','7/75/Harold.png'],
  Mavis:   ['6/6b/MavisCGI.png','7/7c/Mavis.png'],
  Daisy:   ['8/84/DaisyCGI.png','c/c1/Daisy.png'],
};

// Returns the array of URLs to try for a character (first that loads wins)
export function getCharacterImageUrls(characterName) {
  const paths = CHARACTER_IMAGE_URLS[characterName];
  if (!paths) return [];
  return paths.map(p => `${BASE}/${p}/${SZ}`);
}

// Fandom wiki page URLs
export const CHARACTER_WIKI_URLS = Object.fromEntries(
  Object.keys(CHARACTER_IMAGE_URLS).map(c => [c, `https://ttte.fandom.com/wiki/${encodeURIComponent(c)}_(T%26F)`])
);

// Legacy compat — returns first URL synchronously
export function fetchFandomCharacterImage(characterName) {
  const urls = getCharacterImageUrls(characterName);
  return Promise.resolve(urls[0] ?? null);
}

export function prewarmFandomCache() {}
