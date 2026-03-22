const preloaded = new Set();

export function preloadImage(url) {
  if (!url || preloaded.has(url)) return Promise.resolve();
  preloaded.add(url);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload  = resolve;
    img.onerror = resolve; // never reject — just move on
    img.src = url;
  });
}

export function preloadImages(urls) {
  return Promise.all(urls.filter(Boolean).map(preloadImage));
}

export function preloadCardImages(cards) {
  const urls = cards.flatMap(c => [c.image, c.imageHD].filter(Boolean));
  return preloadImages(urls);
}

/**
 * Preload ALL images for a set of cards and wait until they're in the browser
 * cache before resolving. This means cards render instantly with no flash.
 * 
 * Has a 6-second timeout so a slow network doesn't block forever.
 */
export function preloadCardImagesComplete(cards, timeoutMs = 6000) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeoutMs); // safety escape
    preloadCardImages(cards).then(() => {
      clearTimeout(timer);
      resolve();
    }).catch(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}
