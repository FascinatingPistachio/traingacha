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

// Thomas-character locomotive categories — used when force_thomas cheat is active
export const THOMAS_CATEGORIES = [
  'Steam_locomotives_of_the_United_Kingdom',
  'Named_passenger_trains_of_the_United_Kingdom',
  'Heritage_railways_in_the_United_Kingdom',
  'Steam_locomotives_of_Germany',
];

export const ALL_CATEGORIES = [
  ...CATEGORIES.famous,
  ...CATEGORIES.notable,
  ...CATEGORIES.general,
];
export const PITY_POOL = {
  high: CATEGORIES.famous,
  mid:  [...CATEGORIES.famous, ...CATEGORIES.famous, ...CATEGORIES.notable],
  low:  ALL_CATEGORIES,
};

const categoryMembersCache = new Map();
const articleCache          = new Map();
const viewsCache            = new Map();
const sessionSeen           = new Set();

export async function getCategoryMembers(category) {
  if (categoryMembersCache.has(category)) return categoryMembersCache.get(category);
  try {
    const params = new URLSearchParams({
      action: 'query', list: 'categorymembers',
      cmtitle: `Category:${category}`, cmlimit: '100',
      cmtype: 'page', format: 'json', origin: '*',
    });
    const res     = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) throw new Error();
    const data    = await res.json();
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
  if (views >= VIEW_THRESHOLDS.L) return 'L';
  if (views >= VIEW_THRESHOLDS.E) return 'E';
  if (views >= VIEW_THRESHOLDS.R) return 'R';
  return 'C';
}

export async function fetchArticleSummary(title) {
  if (articleCache.has(title)) return articleCache.get(title);
  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.thumbnail?.source) return null;
    const extract = (d.extract ?? '')
      .replace(/\([^)]*\)/g, '')
      .split(/\.(?:\s+|$)/)
      .map(s => s.trim()).filter(Boolean).slice(0, 2).join('. ').trim();
    const result = {
      id:       title.toLowerCase().replace(/\W+/g, '_'),
      title:    d.title,
      extract:  extract ? extract + '.' : '',
      image:    d.thumbnail.source.replace(/\/\d+px-/, '/400px-'),
      imageHD:  d.thumbnail.source.replace(/\/\d+px-/, '/800px-'),
      url:      d.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encoded}`,
    };
    articleCache.set(title, result);
    return result;
  } catch { return null; }
}

// ── Thomas cheat: try to find a Thomas character article ────────────────────
export async function fetchThomasCard() {
  const thomasIndex = await getThomasArticleIndex();
  const chars       = await fetchThomasCharacters();
  const entries     = Object.values(chars);
  if (!entries.length) return null;

  // Shuffle and try each character's known wikiArticle
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  for (const char of shuffled) {
    const title = char.wikiArticle;
    if (!title) continue;
    const article = await fetchArticleSummary(title);
    if (!article) continue;
    const views   = await getMonthlyPageViews(title);
    let   rarity  = rarityFromViews(views);
    rarity        = applyCharacterRarityBoost(rarity, char);
    return { ...article, rarity, views, character: char };
  }
  return null;
}

// ── Main draw ────────────────────────────────────────────────────────────────
export async function fetchTrainCard(categoryPool, maxAttempts = 14) {
  const thomasIndex = await getThomasArticleIndex();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];
    const members  = await getCategoryMembers(category);
    if (!members.length) continue;

    const unseen = members.filter(t => !sessionSeen.has(t));
    const pool   = unseen.length > 0 ? unseen : members;
    const title  = pool[Math.floor(Math.random() * pool.length)];

    const article = await fetchArticleSummary(title);
    if (!article) continue;

    const views     = await getMonthlyPageViews(title);
    let   rarity    = rarityFromViews(views);
    const character = getCharacterForTrain(title, thomasIndex);
    if (character)  rarity = applyCharacterRarityBoost(rarity, character);

    sessionSeen.add(title);
    return { ...article, rarity, views, character: character ?? null };
  }
  return null;
}
