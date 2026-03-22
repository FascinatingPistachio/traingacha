/**
 * wikiImage.js — Fetches a reliable thumbnail URL for any Wikipedia article.
 * Used for bot/raid/draft cards that don't go through fetchArticleSummary.
 *
 * Cached in localStorage to avoid repeat calls.
 */

const CACHE_KEY = 'rg_wiki_img_v1';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}'); }
  catch { return {}; }
}
function saveCache(c) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch {}
}

export async function fetchWikiThumbnail(title, width = 400) {
  const cache = loadCache();
  const key   = `${title}::${width}`;
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.url;

  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const url  = data.thumbnail?.source
      ? data.thumbnail.source.replace(/\/\d+px-/, `/${width}px-`)
      : null;
    cache[key] = { url, ts: Date.now() };
    saveCache(cache);
    return url;
  } catch {
    cache[key] = { url: null, ts: Date.now() };
    saveCache(cache);
    return null;
  }
}
