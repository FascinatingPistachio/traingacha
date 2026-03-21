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

// ── Categories where Thomas characters are plausible ─────────────────────────
// Only fetch wikitext for articles from these categories — avoids wasting
// time on ICE trains or Shinkansen which will never have Thomas connections.
const THOMAS_CANDIDATE_CATEGORIES = new Set([
  'Steam_locomotives_of_the_United_Kingdom',
  'Steam_locomotives_of_the_United_States',
  'Heritage_railways_in_the_United_Kingdom',
  'Named_passenger_trains_of_the_United_Kingdom',
  'Steam_locomotives_of_Germany',
  'Narrow-gauge_locomotives',
]);

// ── Caches ────────────────────────────────────────────────────────────────────
const categoryMembersCache = new Map();
const articleCache         = new Map();
const viewsCache           = new Map();
const characterCache       = new Map(); // title → character | null
const wikitextCache        = new Map();
const sessionSeen          = new Set();

// Track which category each title came from
const titleCategoryMap     = new Map();

function getSeenPersisted() {
  try { return new Set(JSON.parse(sessionStorage.getItem('rg_seen') ?? '[]')); }
  catch { return new Set(); }
}
function addSeenPersisted(title) {
  try {
    const s = getSeenPersisted(); s.add(title);
    sessionStorage.setItem('rg_seen', JSON.stringify([...s].slice(-200)));
  } catch {}
}

function isFictional(title) {
  return FICTIONAL_TITLE_PATTERNS.some(p => p.test(title));
}

function isThomosCandidate(title) {
  // If we know the category it came from, only fetch wikitext for candidates
  const cat = titleCategoryMap.get(title);
  if (cat) return THOMAS_CANDIDATE_CATEGORIES.has(cat);
  // If category unknown, check the title — UK steam and heritage locos are likely candidates
  return /class|railway|steam|loco|engine/i.test(title) &&
         /GWR|LMS|LNER|GER|GNR|BR|LBSCR|Midland|Furness|Talyllyn|heritage/i.test(title);
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
    // Record which category each title came from
    members.forEach(t => { if (!titleCategoryMap.has(t)) titleCategoryMap.set(t, category); });
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

// Wikitext fetch with 4-second timeout to avoid blocking pack opens
async function fetchWikitextWithTimeout(title, timeoutMs = 4000) {
  if (wikitextCache.has(title)) return wikitextCache.get(title);
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);
    const params = new URLSearchParams({
      action:'query', titles:title, prop:'revisions',
      rvprop:'content', rvslots:'main', format:'json', origin:'*',
    });
    const res  = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { signal: controller.signal });
    clearTimeout(tid);
    if (!res.ok) throw new Error();
    const data = await res.json();
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

/**
 * Character detection — two sources, fast path first.
 * Wikitext is only fetched for likely Thomas-candidate articles.
 */
async function detectCharacter(canonicalTitle, fromCategory) {
  if (characterCache.has(canonicalTitle)) return characterCache.get(canonicalTitle);

  // Fast path 1: static lookup (instant)
  const staticChar = STATIC_CHARACTERS[canonicalTitle] ?? null;
  if (staticChar) {
    characterCache.set(canonicalTitle, staticChar);
    return staticChar;
  }

  // Fast path 2: only fetch wikitext if this is a plausible Thomas candidate
  const candidate = fromCategory
    ? THOMAS_CANDIDATE_CATEGORIES.has(fromCategory)
    : isThomosCandidate(canonicalTitle);

  if (!candidate) {
    // Not a candidate (e.g. ICE 3, Shinkansen, Class 66 diesel) — skip wikitext fetch
    characterCache.set(canonicalTitle, null);
    return null;
  }

  // Fetch wikitext with timeout — won't block if Wikipedia is slow
  const wikitext = await fetchWikitextWithTimeout(canonicalTitle);
  const parsed   = parseCharacterFromWikitext(wikitext);
  characterCache.set(canonicalTitle, parsed);
  return parsed;
}

export async function fetchArticleSummary(title) {
  if (isFictional(title)) return null;
  if (articleCache.has(title)) return articleCache.get(title);

  // Try the title directly (titles in STATIC_CHARACTERS are already verified)
  const titlesToTry = [title];

  for (const tryTitle of titlesToTry) {
    const encoded = encodeURIComponent(tryTitle.replace(/ /g, '_'));
    let res;
    try {
      res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`);
    } catch { continue; }
    if (!res.ok) continue; // try next fallback

    try {
    const d = await res.json();
    if (!d.thumbnail?.source)       return null;
    if (isFictional(d.title ?? '')) return null;

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
    } catch { continue; } // JSON parse failed etc, try next fallback
  }
  return null; // all titles failed
}

export async function fetchTrainCard(categoryPool, maxAttempts = 24, ownedIds = new Set()) {
  const persistedSeen = getSeenPersisted();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];
    const members  = await getCategoryMembers(category);
    if (!members.length) continue;

    // Exclude: session-seen, persisted-seen, AND cards already in collection
    const isOwned  = (t) => ownedIds.has(t.toLowerCase().replace(/\W+/g, '_'));
    const unseen   = members.filter(t => !sessionSeen.has(t) && !persistedSeen.has(t) && !isOwned(t));
    const pool     = unseen.length ? unseen : members.filter(t => !sessionSeen.has(t) && !isOwned(t));
    const fallback = pool.length ? pool : members.filter(t => !isOwned(t));
    const finalPool = fallback.length ? fallback : members; // last resort: anything
    const title     = finalPool[Math.floor(Math.random() * finalPool.length)];

    if (isFictional(title)) continue;

    const article = await fetchArticleSummary(title);
    if (!article) continue;

    // Run views + character detection in parallel
    // Character detection skips wikitext fetch for non-Thomas-candidate categories
    const [views, character] = await Promise.all([
      getMonthlyPageViews(title),
      detectCharacter(article.title, category),
    ]);

    let rarity = rarityFromViews(views);
    if (character) rarity = applyCharacterRarityBoost(rarity, character);

    sessionSeen.add(title);
    sessionSeen.add(article.title);
    addSeenPersisted(title);
    return { ...article, rarity, views, character: character ?? null };
  }
  return null;
}

// Thomas cheat — uses verified static mappings only, no wikitext fetching
export async function fetchThomasCard(ownedIds = new Set()) {
  try { sessionStorage.removeItem('rg_seen'); } catch {}

  const isOwned = (t) => ownedIds.has(t.toLowerCase().replace(/\W+/g, '_'));

  const entries = Object.entries(STATIC_CHARACTERS)
    .filter(([, v]) => v.show === 'Thomas & Friends')
    .filter(([t]) => !isOwned(t))  // skip already-owned Thomas locos
    .sort(() => Math.random() - 0.5);

  // Fallback to all Thomas locos if all are owned
  const pool = entries.length ? entries
    : Object.entries(STATIC_CHARACTERS).filter(([, v]) => v.show === 'Thomas & Friends');

  for (const [locoTitle, char] of pool) {
    if (isFictional(locoTitle)) continue;
    const article = await fetchArticleSummary(locoTitle);
    if (!article) continue;
    const views   = await getMonthlyPageViews(locoTitle);
    let   rarity  = rarityFromViews(views);
    rarity        = applyCharacterRarityBoost(rarity, char);
    addSeenPersisted(locoTitle);
    return { ...article, rarity, views, character: char };
  }
  return null;
}
