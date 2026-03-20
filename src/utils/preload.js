// In-memory set of URLs we've already asked the browser to cache.
const preloaded = new Set();

/**
 * Preload a single image URL into the browser's cache.
 * Resolves immediately if already preloaded.
 */
export function preloadImage(url) {
  if (!url || preloaded.has(url)) return Promise.resolve();
  preloaded.add(url);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = () => resolve();
    img.onerror = () => resolve(); // don't reject — we just won't show it
    img.src = url;
  });
}

/**
 * Preload multiple image URLs in parallel.
 */
export function preloadImages(urls) {
  return Promise.all(urls.filter(Boolean).map(preloadImage));
}

/**
 * Given an array of card objects (each with .image and optionally .imageHD),
 * preload both sizes.
 */
export function preloadCardImages(cards) {
  const urls = cards.flatMap((c) => [c.image, c.imageHD].filter(Boolean));
  return preloadImages(urls);
}

/**
 * Eagerly preload a batch of Wikipedia category member articles in the background.
 * Call this when the app is idle so card opens feel instant.
 * We fetch up to `limit` random articles and preload their thumbnails only —
 * we don't want to hammer the API, just warm the image cache.
 */
export async function warmImageCache(fetchFn, limit = 8) {
  try {
    const cards = await fetchFn(limit);
    if (cards?.length) {
      await preloadCardImages(cards);
    }
  } catch {
    // silent — this is a best-effort warm
  }
}
