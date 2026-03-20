import { VIEW_THRESHOLDS } from '../constants.js';
import { applyCharacterRarityBoost, getCharacterForTrain } from './characters.js';
import { getThomasArticleIndex, fetchThomasCharacters } from './thomas.js';

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

export const ALL_CATEGORIES  = [...CATEGORIES.famous, ...CATEGORIES.notable, ...CATEGORIES.general];
export const PITY_POOL = {
  high: CATEGORIES.famous,
  mid:  [...CATEGORIES.famous, ...CATEGORIES.famous, ...CATEGORIES.notable],
  low:  ALL_CATEGORIES,
};

// ── In-memory caches ─────────────────────────────────────────────────────────
const categoryMembersCache = new Map();  // category → string[]
const articleCache         = new Map();  // canonical title → article object
const viewsCache           = new Map();  // title → number

// Session-level dedup: tracks all titles seen this session
const sessionSeen = new Set();

// Longer-term dedup: persisted in sessionStorage so refreshes don't repeat cards
function getSeenPersisted() {
  try { return new Set(JSON.parse(sessionStorage.getItem('rg_seen') ?? '[]')); }
  catch { return new Set(); }
}
function addSeenPersisted(title) {
  try {
    const s = getSeenPersisted();
    s.add(title);
    // Keep only last 150 to avoid bloat
    const arr = [...s].slice(-150);
    sessionStorage.setItem('rg_seen', JSON.stringify(arr));
  } catch {}
}

export async function getCategoryMembers(category) {
  if (categoryMembersCache.has(category)) return categoryMembersCache.get(category);
  try {
    const params = new URLSearchParams({
      action:'query', list:'categorymembers', cmtitle:`Category:${category}`,
      cmlimit:'100', cmtype:'page', format:'json', origin:'*',
    });
    const res  = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const members = (data.query?.categorymembers ?? []).map(m => m.title);
    categoryMembersCache.set(category, members);
    return members;
  } catch {
    categoryMembersCache.set(category, []);
    return [];
  }
}

export async function getMonthlyPageViews(title) {
  if (viewsCache.has(title)) return viewsCache.get(title);
  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const now = new Date(), ago = new Date(now);
    ago.setMonth(ago.getMonth() - 3);
    const fmt = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}01`;
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/${encoded}/monthly/${fmt(ago)}/${fmt(now)}`;
    const res = await fetch(url);
    if (!res.ok) { viewsCache.set(title, 0); return 0; }
    const data  = await res.json();
    const items = data.items ?? [];
    const avg   = items.length ? Math.round(items.reduce((s,i) => s+i.views, 0) / items.length) : 0;
    viewsCache.set(title, avg);
    return avg;
  } catch {
    viewsCache.set(title, 0);
    return 0;
  }
}

export function rarityFromViews(views) {
  // Bimodal: obscure ghosts are Mythic, famous icons are Legendary
  if (views > 0 && views < VIEW_THRESHOLDS.MYTHIC_MAX) return 'M';   // Ghost train
  if (views >= VIEW_THRESHOLDS.L) return 'L';                          // World-famous
  if (views >= VIEW_THRESHOLDS.E) return 'E';
  if (views >= VIEW_THRESHOLDS.R) return 'R';
  return 'C';
}

export async function fetchArticleSummary(title) {
  // Check cache by input title first
  if (articleCache.has(title)) return articleCache.get(title);
  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.thumbnail?.source) return null;

    // Use the canonical title from response to prevent cache key mismatches
    const canonicalTitle = d.title ?? title;

    // Check if we already have this canonical title cached
    if (articleCache.has(canonicalTitle)) {
      const cached = articleCache.get(canonicalTitle);
      articleCache.set(title, cached);
      return cached;
    }

    const extract = (d.extract ?? '')
      .replace(/\([^)]*\)/g, '')
      .split(/\.(?:\s+|$)/)
      .map(s => s.trim()).filter(Boolean).slice(0, 2).join('. ').trim();

    const result = {
      id:       canonicalTitle.toLowerCase().replace(/\W+/g, '_'),
      title:    canonicalTitle,
      extract:  extract ? extract + '.' : '',
      image:    d.thumbnail.source.replace(/\/\d+px-/, '/400px-'),
      imageHD:  d.thumbnail.source.replace(/\/\d+px-/, '/800px-'),
      url:      d.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encoded}`,
      // Store thumbnail origin for debugging
      _imgBase: d.thumbnail.source,
    };

    // Cache by both input title and canonical title
    articleCache.set(title, result);
    articleCache.set(canonicalTitle, result);
    return result;
  } catch { return null; }
}

export async function fetchThomasCard() {
  const thomasIndex = await getThomasArticleIndex();
  const chars       = await fetchThomasCharacters();
  const entries     = Object.values(chars);
  if (!entries.length) return null;
  const seen = getSeenPersisted();
  const shuffled = [...entries].filter(c => c.wikiArticle && !seen.has(c.wikiArticle)).sort(() => Math.random() - 0.5);
  // Fallback to seen if all seen
  const pool = shuffled.length ? shuffled : [...entries].filter(c => c.wikiArticle).sort(() => Math.random() - 0.5);
  for (const char of pool) {
    const article = await fetchArticleSummary(char.wikiArticle);
    if (!article) continue;
    const views  = await getMonthlyPageViews(char.wikiArticle);
    let   rarity = rarityFromViews(views);
    rarity       = applyCharacterRarityBoost(rarity, char);
    addSeenPersisted(char.wikiArticle);
    return { ...article, rarity, views, character: char };
  }
  return null;
}

export async function fetchTrainCard(categoryPool, maxAttempts = 16) {
  const thomasIndex = await getThomasArticleIndex();
  const persistedSeen = getSeenPersisted();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];
    const members  = await getCategoryMembers(category);
    if (!members.length) continue;

    // Prefer unseen titles (session + persisted)
    const unseen = members.filter(t => !sessionSeen.has(t) && !persistedSeen.has(t));
    const pool   = unseen.length > 0 ? unseen : members.filter(t => !sessionSeen.has(t));
    const finalPool = pool.length > 0 ? pool : members;
    const title  = finalPool[Math.floor(Math.random() * finalPool.length)];

    const article = await fetchArticleSummary(title);
    if (!article) continue;

    const views     = await getMonthlyPageViews(title);
    let   rarity    = rarityFromViews(views);
    const character = getCharacterForTrain(title, thomasIndex);
    if (character) rarity = applyCharacterRarityBoost(rarity, character);

    sessionSeen.add(title);
    sessionSeen.add(article.title); // also mark canonical title
    addSeenPersisted(title);
    return { ...article, rarity, views, character: character ?? null };
  }
  return null;
}
