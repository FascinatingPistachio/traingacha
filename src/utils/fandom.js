/**
 * fandom.js — character image resolution for Thomas & Friends characters.
 *
 * Priority order:
 *  1. Local bundled images  (/characters/<name>.png|webp)  — instant, no network
 *  2. Fandom MediaWiki API  (ttte.fandom.com/api.php)      — free, no key needed
 *     a. prop=pageimages  (single call, returns current infobox image)
 *     b. prop=images + imageinfo scored fallback
 *  3. Colour-initial circle rendered in RailCard             — always works
 *
 * Results from the API are cached in localStorage for 7 days.
 *
 * NOTE: The correct Fandom wiki ID for Thomas & Friends is "ttte"
 *       (https://ttte.fandom.com), NOT "thomas.fandom.com" which 404s.
 */

// ── 1. Local bundled images ───────────────────────────────────────────────────
// Files placed in public/characters/ are served at /characters/<file> by Vite.
// Run  scripts/download-characters.sh  to populate this folder.
const LOCAL_IMAGES = {
  'Duck':   '/characters/duck.png',
  'Diesel': '/characters/diesel.png',
  'BoCo':   '/characters/boco.webp',
  'Toby':   '/characters/toby.webp',
};

// ── 2. Fandom MediaWiki API config ────────────────────────────────────────────
// "ttte" is the correct wiki ID — static CDN also uses static.wikia.nocookie.net/ttte/
const FANDOM_API    = 'https://ttte.fandom.com/api.php';
const IMG_CACHE_KEY = 'rg_fandom_img_v4';
const IMG_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const THUMB_SIZE    = 400;

// ── Page title variants to try ────────────────────────────────────────────────
function pageTitleVariants(name) {
  return [
    name,
    `${name} (T&F)`,
    `${name} (Thomas & Friends)`,
    `${name} (character)`,
  ];
}

// ── localStorage cache helpers ────────────────────────────────────────────────
function loadCache() {
  try { return JSON.parse(localStorage.getItem(IMG_CACHE_KEY) ?? '{}'); }
  catch { return {}; }
}
function saveCache(cache) {
  try { localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(cache)); } catch {}
}

// ── Method A: pageimages prop ─────────────────────────────────────────────────
// Returns the representative/infobox image (same one used in social previews).
async function fetchViaPageImages(name) {
  for (const title of pageTitleVariants(name)) {
    const url = new URL(FANDOM_API);
    url.searchParams.set('action',      'query');
    url.searchParams.set('titles',      title);
    url.searchParams.set('prop',        'pageimages');
    url.searchParams.set('pithumbsize', String(THUMB_SIZE));
    url.searchParams.set('piprop',      'thumbnail');
    url.searchParams.set('format',      'json');
    url.searchParams.set('origin',      '*');
    try {
      const res  = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      const data = await res.json();
      const pages = Object.values(data?.query?.pages ?? {});
      if (!pages.length || pages[0].missing !== undefined) continue;
      const thumbUrl = pages[0]?.thumbnail?.source;
      if (thumbUrl) return thumbUrl;
    } catch { /* try next variant */ }
  }
  return null;
}

// ── Method B: image list + imageinfo scored fallback ─────────────────────────
function scoreImageTitle(fileTitle, characterName) {
  const t    = fileTitle.toLowerCase();
  const name = characterName.toLowerCase().replace(/\s+/g, '');
  if (/\.(svg|ico|gif|ogg|mp3|mp4|pdf)$/i.test(t)) return -1;
  if (/^file:(stub|wiki|placeholder|transparent|blank|logo|icon|favicon|badge|star|award)/i.test(t)) return -1;
  let score = 0;
  if (t.includes(name))          score += 30;
  if (/maincgi2/i.test(t))       score += 25;
  if (/maincgi/i.test(t))        score += 20;
  if (/cgi2/i.test(t))           score += 15;
  if (/cgi/i.test(t))            score += 10;
  if (/\.(png|webp)$/i.test(t))  score += 3;
  if (/\.jpe?g$/i.test(t))       score += 2;
  return score;
}

async function fetchImageUrl(fileTitle) {
  const url = new URL(FANDOM_API);
  url.searchParams.set('action',     'query');
  url.searchParams.set('titles',     fileTitle);
  url.searchParams.set('prop',       'imageinfo');
  url.searchParams.set('iiprop',     'url');
  url.searchParams.set('iiurlwidth', String(THUMB_SIZE));
  url.searchParams.set('format',     'json');
  url.searchParams.set('origin',     '*');
  try {
    const res  = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const page = Object.values(data?.query?.pages ?? {})[0];
    return page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url ?? null;
  } catch { return null; }
}

async function fetchViaImageList(name) {
  for (const title of pageTitleVariants(name)) {
    const url = new URL(FANDOM_API);
    url.searchParams.set('action',  'query');
    url.searchParams.set('titles',  title);
    url.searchParams.set('prop',    'images');
    url.searchParams.set('imlimit', '30');
    url.searchParams.set('format',  'json');
    url.searchParams.set('origin',  '*');
    try {
      const res  = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();
      const pages = Object.values(data?.query?.pages ?? {});
      if (!pages.length || pages[0].missing !== undefined) continue;
      const images = pages[0].images ?? [];
      if (!images.length) continue;
      const scored = images
        .map(i => ({ title: i.title, score: scoreImageTitle(i.title, name) }))
        .filter(x => x.score >= 0)
        .sort((a, b) => b.score - a.score);
      if (!scored.length) continue;
      const imgUrl = await fetchImageUrl(scored[0].title);
      if (imgUrl) return imgUrl;
    } catch { /* try next variant */ }
  }
  return null;
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function fetchFandomCharacterImage(characterName) {
  // Priority 1: local bundled image (no network, instant)
  if (LOCAL_IMAGES[characterName]) return LOCAL_IMAGES[characterName];

  // Priority 2: cached API result
  const cache = loadCache();
  const entry = cache[characterName];
  if (entry && Date.now() - entry.ts < IMG_CACHE_TTL) return entry.url;

  // Priority 3: Fandom API — pageimages first, image list fallback
  let url = await fetchViaPageImages(characterName);
  if (!url) url = await fetchViaImageList(characterName);

  cache[characterName] = { url, ts: Date.now() };
  saveCache(cache);
  return url;
}

// Synchronous getter — returns nothing (RailCard always uses the async path)
export function getCharacterImageUrls(_name) { return []; }

// Wiki page URL for the "X ON FANDOM →" link in CardDetailModal
export function getFandomPageUrl(characterName) {
  return `https://ttte.fandom.com/wiki/${encodeURIComponent(characterName.replace(/ /g, '_'))}`;
}

export function prewarmFandomCache() {}

// Legacy alias used by CardDetailModal
export const CHARACTER_WIKI_URLS = new Proxy({}, {
  get: (_, name) => getFandomPageUrl(String(name)),
});
