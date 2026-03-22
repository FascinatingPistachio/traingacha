/**
 * Rail Gacha — Service Worker
 * Enables PWA install on Chrome, Brave, Edge, Samsung Internet, Opera.
 * All Chromium-based browsers support beforeinstallprompt — no special handling needed.
 */

const CACHE    = 'railgacha-v2';
const APP_URLS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// ── Install: cache the app shell ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(APP_URLS).catch(err => console.warn('[SW] pre-cache failed:', err))
    )
  );
  // Take control immediately without waiting for old SW to expire
  self.skipWaiting();
});

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategy ────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip browser-extension and non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // ── Same-origin app shell: Cache-first ──
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          // Cache successful same-origin responses
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE).then(c => c.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Offline fallback: serve index.html for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }

  // ── Wikipedia / Wikimedia images: Network-first with cache fallback ──
  if (url.hostname.includes('wikipedia.org') || url.hostname.includes('wikimedia.org')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Everything else: network only (don't cache external fonts, analytics, etc.)
});
