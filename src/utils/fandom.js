/**
 * fandom.js — character image resolution for Thomas & Friends characters.
 *
 * Uses the Fandom MediaWiki API (thomas.fandom.com/api.php).
 * No auth key required — CORS enabled via origin=*.
 *
 * Strategy:
 *  1. `prop=pageimages` — single call, returns the current infobox/representative
 *     image (the same one used in social media previews). Always up to date.
 *  2. Falls back to `prop=images` + `prop=imageinfo` scored search if pageimages
 *     returns nothing (e.g. for pages without an infobox image set).
 *  3. Colour-initial fallback rendered in RailCard if both API calls fail.
 *
 * Results cached in localStorage for 7 days to avoid repeat API calls.
 */

const FANDOM_API    = 'https://thomas.fandom.com/api.php';
const IMG_CACHE_KEY = 'rg_fandom_img_v3';
const IMG_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const THUMB_SIZE    = 400;

// ── Page title variants to try (in order) ─────────────────────────────────────
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
  try { localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(cache)); } catch { /* quota */ }
}

// ── Method 1: pageimages — fastest, most reliable ─────────────────────────────
// Returns the representative/infobox image for the page (what social previews use).
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

// ── Method 2: image list + imageinfo — scored fallback ────────────────────────
function scoreImageTitle(fileTitle, characterName) {
  const t    = fileTitle.toLowerCase();
  const name = characterName.toLowerCase().replace(/\s+/g, '');
  if (/\.(svg|ico|gif|webp|ogg|mp3|mp4|pdf)$/i.test(t)) return -1;
  if (/^file:(stub|wiki|placeholder|transparent|blank|logo|icon|favicon|badge|star|award)/i.test(t)) return -1;
  let score = 0;
  if (t.includes(name))        score += 30;
  if (/maincgi2/i.test(t))     score += 25;
  if (/maincgi/i.test(t))      score += 20;
  if (/cgi2/i.test(t))         score += 15;
  if (/cgi/i.test(t))          score += 10;
  if (/\.png$/i.test(t))       score += 3;
  if (/\.jpg$|\.jpeg$/i.test(t)) score += 2;
  return score;
}

async function fetchImageUrl(fileTitle) {
  const url = new URL(FANDOM_API);
  url.searchParams.set('action',    'query');
  url.searchParams.set('titles',    fileTitle);
  url.searchParams.set('prop',      'imageinfo');
  url.searchParams.set('iiprop',    'url');
  url.searchParams.set('iiurlwidth', String(THUMB_SIZE));
  url.searchParams.set('format',    'json');
  url.searchParams.set('origin',    '*');
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

// ── Main export: fetch + cache ────────────────────────────────────────────────
export async function fetchFandomCharacterImage(characterName) {
  const cache = loadCache();
  const entry = cache[characterName];
  if (entry && Date.now() - entry.ts < IMG_CACHE_TTL) return entry.url;

  // Try Method 1 first (fastest, most reliable)
  let url = await fetchViaPageImages(characterName);

  // If Method 1 found nothing, try Method 2
  if (!url) url = await fetchViaImageList(characterName);

  cache[characterName] = { url, ts: Date.now() };
  saveCache(cache);
  return url;
}

// ── Synchronous lookup (returns [] since we have no hardcoded URLs anymore) ───
// RailCard will immediately trigger the async API path.
export function getCharacterImageUrls(_name) {
  return [];
}

// ── Wiki page URL for the "DIESEL ON FANDOM →" link ──────────────────────────
export function getFandomPageUrl(characterName) {
  return `https://thomas.fandom.com/wiki/${encodeURIComponent(characterName.replace(/ /g, '_'))}`;
}

// ── No-op prewarm (fetching is on-demand only) ────────────────────────────────
export function prewarmFandomCache() {}

// Legacy export alias used in CardDetailModal
export const CHARACTER_WIKI_URLS = new Proxy({}, {
  get: (_, name) => getFandomPageUrl(String(name)),
});
