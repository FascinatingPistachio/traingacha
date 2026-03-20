import { VIEW_THRESHOLDS, FICTIONAL_TITLE_PATTERNS } from '../constants.js';
import { applyCharacterRarityBoost, getCharacterForTrain } from './characters.js';
import { getThomasArticleIndex } from './thomas.js';

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
    'Narrow-gauge_locomotives',
    'Rack_railways',
  ],
};

export const ALL_CATEGORIES = [...CATEGORIES.famous, ...CATEGORIES.notable, ...CATEGORIES.general];
export const PITY_POOL = {
  high: CATEGORIES.famous,
  mid:  [...CATEGORIES.famous, ...CATEGORIES.famous, ...CATEGORIES.notable],
  low:  ALL_CATEGORIES,
};

const categoryMembersCache = new Map();
const articleCache         = new Map(); // canonical title → result
const viewsCache           = new Map();

function getSeenPersisted() {
  try { return new Set(JSON.parse(sessionStorage.getItem('rg_seen') ?? '[]')); }
  catch { return new Set(); }
}
function addSeenPersisted(title) {
  try {
    const s   = getSeenPersisted();
    s.add(title);
    sessionStorage.setItem('rg_seen', JSON.stringify([...s].slice(-200)));
  } catch {}
}

/** Returns true if a Wikipedia article title refers to a fictional entity */
function isFictionalArticle(title) {
  return FICTIONAL_TITLE_PATTERNS.some(p => p.test(title));
}

export async function getCategoryMembers(category) {
  if (categoryMembersCache.has(category)) return categoryMembersCache.get(category);
  try {
    const params = new URLSearchParams({
      action:'query', list:'categorymembers', cmtitle:`Category:${category}`,
      cmlimit:'100', cmtype:'page', format:'json', origin:'*',
    });
    const res   = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) throw new Error();
    const data  = await res.json();
    // Filter fictional titles at source
    const members = (data.query?.categorymembers ?? [])
      .map(m => m.title)
      .filter(t => !isFictionalArticle(t));
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
    const avg   = items.length
      ? Math.round(items.reduce((s, i) => s + i.views, 0) / items.length)
      : 0;
    viewsCache.set(title, avg);
    return avg;
  } catch {
    viewsCache.set(title, 0);
    return 0;
  }
}

/**
 * Bimodal rarity:
 *  - Mythic   = VERY obscure (< MYTHIC_MAX views) AND 12% probability roll → rarer than Legendary
 *  - Legendary = globally famous (≥ 80k views)
 *  - Between those: Epic / Rare / Common by view count
 */
export function rarityFromViews(views) {
  if (views > 0 && views < VIEW_THRESHOLDS.MYTHIC_MAX) {
    // Only become Mythic 12% of the time — rest are demoted to Common
    return Math.random() < VIEW_THRESHOLDS.MYTHIC_PROB ? 'M' : 'C';
  }
  if (views >= VIEW_THRESHOLDS.L) return 'L';
  if (views >= VIEW_THRESHOLDS.E) return 'E';
  if (views >= VIEW_THRESHOLDS.R) return 'R';
  return 'C';
}

export async function fetchArticleSummary(title) {
  // Skip fictional articles
  if (isFictionalArticle(title)) return null;
  if (articleCache.has(title))   return articleCache.get(title);

  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const res     = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
    if (!res.ok) return null;
    const d = await res.json();

    if (!d.thumbnail?.source)     return null;   // no image → skip
    if (isFictionalArticle(d.title ?? '')) return null; // double-check canonical title

    const canonicalTitle = d.title ?? title;
    if (articleCache.has(canonicalTitle)) {
      const cached = articleCache.get(canonicalTitle);
      articleCache.set(title, cached);
      return cached;
    }

    const extract = (d.extract ?? '')
      .replace(/\([^)]*\)/g, '')
      .split(/\.(?:\s+|$)/)
      .map(s => s.trim()).filter(Boolean)
      .slice(0, 2).join('. ').trim();

    const result = {
      id:      canonicalTitle.toLowerCase().replace(/\W+/g, '_'),
      title:   canonicalTitle,
      extract: extract ? extract + '.' : '',
      image:   d.thumbnail.source.replace(/\/\d+px-/, '/400px-'),
      imageHD: d.thumbnail.source.replace(/\/\d+px-/, '/800px-'),
      url:     d.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encoded}`,
    };

    articleCache.set(title, result);
    articleCache.set(canonicalTitle, result);
    return result;
  } catch { return null; }
}

/**
 * Draw one card for a Thomas-character pull.
 * Fetches the REAL LOCOMOTIVE article the character is based on,
 * and attaches the character as badge data only.
 */
export async function fetchThomasCard() {
  const { fetchThomasCharacters } = await import('./thomas.js');
  const chars   = await fetchThomasCharacters();
  const entries = Object.values(chars).filter(c => c.wikiArticle && !isFictionalArticle(c.wikiArticle));
  if (!entries.length) return null;

  const seen     = getSeenPersisted();
  const unseen   = entries.filter(c => !seen.has(c.wikiArticle));
  const pool     = (unseen.length ? unseen : entries).sort(() => Math.random() - 0.5);

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

const sessionSeen = new Set();

export async function fetchTrainCard(categoryPool, maxAttempts = 16) {
  const thomasIndex   = await getThomasArticleIndex();
  const persistedSeen = getSeenPersisted();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];
    const members  = await getCategoryMembers(category);
    if (!members.length) continue;

    const unseen    = members.filter(t => !sessionSeen.has(t) && !persistedSeen.has(t));
    const pool      = (unseen.length ? unseen : members.filter(t => !sessionSeen.has(t)));
    const finalPool = pool.length ? pool : members;
    const title     = finalPool[Math.floor(Math.random() * finalPool.length)];

    if (isFictionalArticle(title)) continue;

    const article = await fetchArticleSummary(title);
    if (!article) continue;

    const views     = await getMonthlyPageViews(title);
    let   rarity    = rarityFromViews(views);
    const character = getCharacterForTrain(article.title, thomasIndex);
    if (character) rarity = applyCharacterRarityBoost(rarity, character);

    sessionSeen.add(title);
    sessionSeen.add(article.title);
    addSeenPersisted(title);
    return { ...article, rarity, views, character: character ?? null };
  }
  return null;
}
