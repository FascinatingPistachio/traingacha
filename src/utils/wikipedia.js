import { VIEW_THRESHOLDS } from '../constants.js';

// ---------------------------------------------------------------------------
// Category pools
// Organised by expected fame level so the pity system can bias pulls toward
// famous categories when the player has gone a long time without a high rarity.
// ---------------------------------------------------------------------------
export const CATEGORIES = {
  famous: [
    'Named_passenger_trains_of_the_United_States',
    'Named_passenger_trains_of_the_United_Kingdom',
    'Named_passenger_trains_of_Europe',
    'Named_passenger_trains_of_Japan',
    'High-speed_trains_of_Japan',
    'High-speed_trains_of_France',
    'Luxury_trains',
    'Named_passenger_trains_of_India',
    'Named_passenger_trains_of_Australia',
    'Named_passenger_trains_of_South_Africa',
  ],
  notable: [
    'Steam_locomotives_of_the_United_Kingdom',
    'Steam_locomotives_of_the_United_States',
    'High-speed_trains_of_Germany',
    'High-speed_trains_of_China',
    'High-speed_trains_of_South_Korea',
    'Maglev_trains',
    'Heritage_railways_in_the_United_Kingdom',
    'Named_passenger_trains_of_Canada',
    'Named_passenger_trains_of_Russia',
    'Steam_locomotives_of_Germany',
  ],
  general: [
    'Diesel_locomotives_of_the_United_Kingdom',
    'Electric_locomotives_of_Germany',
    'Diesel_locomotives_of_the_United_States',
    'Electric_multiple_units_of_the_United_Kingdom',
    'Diesel_multiple_units_of_the_United_Kingdom',
    'Electric_locomotives_of_the_United_Kingdom',
    'Electric_locomotives_of_Switzerland',
    'Diesel_locomotives_of_Germany',
    'Electric_multiple_units_of_Japan',
    'Electric_multiple_units_of_Germany',
    'Diesel_locomotives_of_Australia',
    'Electric_locomotives_of_France',
    'Electric_multiple_units_of_Switzerland',
    'Commuter_rail_vehicles_of_the_United_States',
    'Narrow-gauge_locomotives',
    'Rack_railways',
  ],
};

export const ALL_CATEGORIES = [
  ...CATEGORIES.famous,
  ...CATEGORIES.notable,
  ...CATEGORIES.general,
];

// Category pools used by the pity system
export const PITY_POOL = {
  high: CATEGORIES.famous,
  mid: [...CATEGORIES.famous, ...CATEGORIES.famous, ...CATEGORIES.notable],
  low: ALL_CATEGORIES,
};

// ---------------------------------------------------------------------------
// In-memory caches (survive page interactions, reset on hard reload)
// ---------------------------------------------------------------------------
const categoryMembersCache = new Map();
const articleCache = new Map();
const viewsCache = new Map();

// Tracks titles used this session so we minimise duplicates in one play session
const sessionSeen = new Set();

// ---------------------------------------------------------------------------
// Wikipedia Category Members API
// ---------------------------------------------------------------------------
export async function getCategoryMembers(category) {
  if (categoryMembersCache.has(category)) return categoryMembersCache.get(category);

  try {
    const params = new URLSearchParams({
      action: 'query',
      list: 'categorymembers',
      cmtitle: `Category:${category}`,
      cmlimit: '100',
      cmtype: 'page',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) throw new Error('category fetch failed');
    const data = await res.json();
    const members = (data.query?.categorymembers ?? []).map((m) => m.title);
    categoryMembersCache.set(category, members);
    return members;
  } catch {
    categoryMembersCache.set(category, []);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Wikimedia Pageviews API  →  rarity
// Uses a 3-month average for a stable signal.
// ---------------------------------------------------------------------------
export async function getMonthlyPageViews(title) {
  if (viewsCache.has(title)) return viewsCache.get(title);

  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));

    // Build date range: 3 months ago → now
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const fmt = (d) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}01`;

    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/${encoded}/monthly/${fmt(threeMonthsAgo)}/${fmt(now)}`;
    const res = await fetch(url);
    if (!res.ok) {
      viewsCache.set(title, 0);
      return 0;
    }
    const data = await res.json();
    const items = data.items ?? [];
    const avg = items.length
      ? Math.round(items.reduce((s, i) => s + i.views, 0) / items.length)
      : 0;
    viewsCache.set(title, avg);
    return avg;
  } catch {
    viewsCache.set(title, 0);
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Rarity from pageviews
// ---------------------------------------------------------------------------
export function rarityFromViews(views) {
  if (views >= VIEW_THRESHOLDS.L) return 'L';
  if (views >= VIEW_THRESHOLDS.E) return 'E';
  if (views >= VIEW_THRESHOLDS.R) return 'R';
  return 'C';
}

// ---------------------------------------------------------------------------
// Wikipedia REST summary API
// Returns null if the article has no image (cards without images are skipped).
// ---------------------------------------------------------------------------
export async function fetchArticleSummary(title) {
  if (articleCache.has(title)) return articleCache.get(title);

  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`
    );
    if (!res.ok) return null;
    const d = await res.json();

    // Hard rule: no image → card does not exist
    if (!d.thumbnail?.source) return null;

    // Build a clean 2-sentence extract
    const extract = (d.extract ?? '')
      .replace(/\([^)]*\)/g, '')           // strip parentheticals
      .split(/\.(?:\s+|$)/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2)
      .join('. ')
      .trim();

    const result = {
      id: title.toLowerCase().replace(/\W+/g, '_'),
      title: d.title,
      extract: extract ? extract + '.' : '',
      // Request a 400px wide thumbnail for cards; larger detail view uses 800px
      image: d.thumbnail.source.replace(/\/\d+px-/, '/400px-'),
      imageHD: d.thumbnail.source.replace(/\/\d+px-/, '/800px-'),
      url:
        d.content_urls?.desktop?.page ??
        `https://en.wikipedia.org/wiki/${encoded}`,
    };

    articleCache.set(title, result);
    return result;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main entry point used by the gacha system.
// Picks a random article from the supplied category pool, fetches its image
// and extract, then determines rarity from pageviews.
// Retries on failures and skips articles with no image.
// ---------------------------------------------------------------------------
export async function fetchTrainCard(categoryPool, maxAttempts = 14) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];
    const members = await getCategoryMembers(category);
    if (!members.length) continue;

    // Prefer titles not yet seen this session
    const unseen = members.filter((t) => !sessionSeen.has(t));
    const pool = unseen.length > 0 ? unseen : members;
    const title = pool[Math.floor(Math.random() * pool.length)];

    const article = await fetchArticleSummary(title);
    if (!article) continue; // no image → skip

    const views = await getMonthlyPageViews(title);
    const rarity = rarityFromViews(views);

    sessionSeen.add(title);
    return { ...article, rarity, views };
  }

  return null; // could not fetch a valid card after maxAttempts
}
