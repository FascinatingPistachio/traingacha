import { VIEW_THRESHOLDS, FICTIONAL_TITLE_PATTERNS } from '../constants.js';
import { applyCharacterRarityBoost, STATIC_CHARACTERS, parseCharacterFromWikitext } from './characters.js';

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

const THOMAS_CANDIDATE_CATEGORIES = new Set([
  'Steam_locomotives_of_the_United_Kingdom',
  'Steam_locomotives_of_the_United_States',
  'Heritage_railways_in_the_United_Kingdom',
  'Named_passenger_trains_of_the_United_Kingdom',
  'Steam_locomotives_of_Germany',
  'Narrow-gauge_locomotives',
  'Diesel_locomotives_of_the_United_Kingdom',
]);

const categoryMembersCache = new Map();
const articleCache         = new Map();
const viewsCache           = new Map();
const characterCache       = new Map();
const wikitextCache        = new Map();
const sessionSeen          = new Set(); // raw titles seen this session

function makeId(title) {
  return title.toLowerCase().replace(/\W+/g, '_');
}

function getSeenPersisted() {
  try { return new Set(JSON.parse(sessionStorage.getItem('rg_seen') ?? '[]')); }
  catch { return new Set(); }
}
function addSeenPersisted(title) {
  try {
    const s = getSeenPersisted(); s.add(title);
    sessionStorage.setItem('rg_seen', JSON.stringify([...s].slice(-300)));
  } catch {}
}

function isFictional(title) {
  return FICTIONAL_TITLE_PATTERNS.some(p => p.test(title));
}

export async function getCategoryMembers(category) {
  if (categoryMembersCache.has(category)) return categoryMembersCache.get(category);
  try {
    const params = new URLSearchParams({
      action:'query', list:'categorymembers', cmtitle:`Category:${category}`,
      cmlimit:'100', cmtype:'page', format:'json', origin:'*',
    });
    const res     = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) throw new Error();
    const data    = await res.json();
    const members = (data.query?.categorymembers ?? [])
      .map(m => m.title)
      .filter(t => !isFictional(t));
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
    const avg   = items.length ? Math.round(items.reduce((s,i)=>s+i.views,0)/items.length) : 0;
    viewsCache.set(title, avg);
    return avg;
  } catch { viewsCache.set(title, 0); return 0; }
}

export function rarityFromViews(views) {
  if (views > 0 && views < VIEW_THRESHOLDS.MYTHIC_MAX) {
    return Math.random() < VIEW_THRESHOLDS.MYTHIC_PROB ? 'M' : 'C';
  }
  if (views >= VIEW_THRESHOLDS.L) return 'L';
  if (views >= VIEW_THRESHOLDS.E) return 'E';
  if (views >= VIEW_THRESHOLDS.R) return 'R';
  return 'C';
}

async function fetchWikitextWithTimeout(title, ms = 4000) {
  if (wikitextCache.has(title)) return wikitextCache.get(title);
  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), ms);
    const params = new URLSearchParams({
      action:'query', titles:title, prop:'revisions',
      rvprop:'content', rvslots:'main', format:'json', origin:'*',
    });
    const res  = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { signal:ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) throw new Error();
    const data  = await res.json();
    const pages = data.query?.pages ?? {};
    const page  = Object.values(pages)[0];
    const text  = (page?.revisions?.[0]?.slots?.main?.['*'] ?? '').slice(0, 8000);
    wikitextCache.set(title, text);
    return text;
  } catch {
    wikitextCache.set(title, '');
    return '';
  }
}

async function detectCharacter(canonicalTitle, fromCategory) {
  if (characterCache.has(canonicalTitle)) return characterCache.get(canonicalTitle);
  const staticChar = STATIC_CHARACTERS[canonicalTitle] ?? null;
  if (staticChar) { characterCache.set(canonicalTitle, staticChar); return staticChar; }
  const candidate = fromCategory
    ? THOMAS_CANDIDATE_CATEGORIES.has(fromCategory)
    : /GWR|LMS|LNER|GER|GNR|LBSCR|Midland|Furness|Talyllyn|heritage/i.test(canonicalTitle);
  if (!candidate) { characterCache.set(canonicalTitle, null); return null; }
  const wikitext = await fetchWikitextWithTimeout(canonicalTitle);
  const parsed   = parseCharacterFromWikitext(wikitext);
  characterCache.set(canonicalTitle, parsed);
  return parsed;
}

export async function fetchArticleSummary(title) {
  if (isFictional(title)) return null;
  if (articleCache.has(title)) return articleCache.get(title);
  try {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'));
    const res     = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
    if (!res.ok) return null;
    const d = await res.json();
    if (!d.thumbnail?.source) return null;
    if (isFictional(d.title ?? '')) return null;
    const canonicalTitle = d.title ?? title;
    if (articleCache.has(canonicalTitle)) {
      const cached = articleCache.get(canonicalTitle);
      articleCache.set(title, cached);
      return cached;
    }
    // Short 1-sentence extract for card display
    const extract = (d.extract ?? '')
      .replace(/\([^)]*\)/g, '')
      .split(/\.(?:\s+|$)/)
      .map(s => s.trim()).filter(Boolean)
      .slice(0, 1).join('. ').trim();
    const result = {
      id:      makeId(canonicalTitle),
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

export async function fetchTrainCard(categoryPool, maxAttempts = 28, ownedIds = new Set()) {
  const persistedSeen = getSeenPersisted();

  // Build a comprehensive exclude set: owned IDs + seen IDs (both raw and id-normalised)
  const isExcluded = (rawTitle) => {
    const id = makeId(rawTitle);
    return sessionSeen.has(rawTitle)
      || sessionSeen.has(id)
      || persistedSeen.has(rawTitle)
      || persistedSeen.has(id)
      || ownedIds.has(id)
      || ownedIds.has(rawTitle);
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];
    const members  = await getCategoryMembers(category);
    if (!members.length) continue;

    // Priority: not excluded at all → not owned → anything
    const notExcluded = members.filter(t => !isExcluded(t));
    const notOwned    = members.filter(t => !ownedIds.has(makeId(t)) && !ownedIds.has(t));
    const finalPool   = notExcluded.length ? notExcluded : notOwned.length ? notOwned : members;
    const title       = finalPool[Math.floor(Math.random() * finalPool.length)];

    if (isFictional(title)) continue;

    const article = await fetchArticleSummary(title);
    if (!article) continue;

    // Check again after canonical resolution — prevents subtle duplicates
    if (ownedIds.has(article.id) || ownedIds.has(makeId(article.title))) continue;

    const [views, character] = await Promise.all([
      getMonthlyPageViews(title),
      detectCharacter(article.title, category),
    ]);

    let rarity = rarityFromViews(views);
    if (character) rarity = applyCharacterRarityBoost(rarity, character);

    sessionSeen.add(title);
    sessionSeen.add(article.title);
    sessionSeen.add(article.id);
    addSeenPersisted(title);
    return { ...article, rarity, views, character: character ?? null };
  }
  return null;
}

export async function fetchThomasCard(ownedIds = new Set()) {
  try { sessionStorage.removeItem('rg_seen'); } catch {}
  const isOwned = (t) => ownedIds.has(makeId(t)) || ownedIds.has(t);
  const entries = Object.entries(STATIC_CHARACTERS)
    .filter(([, v]) => v.show === 'Thomas & Friends')
    .filter(([t]) => !isOwned(t))
    .sort(() => Math.random() - 0.5);
  const pool = entries.length
    ? entries
    : Object.entries(STATIC_CHARACTERS).filter(([, v]) => v.show === 'Thomas & Friends');
  for (const [locoTitle, char] of pool) {
    if (isFictional(locoTitle)) continue;
    const article = await fetchArticleSummary(locoTitle);
    if (!article) continue;
    if (isOwned(article.id)) continue;
    const views   = await getMonthlyPageViews(locoTitle);
    let   rarity  = rarityFromViews(views);
    rarity        = applyCharacterRarityBoost(rarity, char);
    addSeenPersisted(locoTitle);
    return { ...article, rarity, views, character: char };
  }
  return null;
}
