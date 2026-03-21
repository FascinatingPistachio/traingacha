import { VIEW_THRESHOLDS, FICTIONAL_TITLE_PATTERNS } from '../constants.js';
import { applyCharacterRarityBoost, getCharacterForTrain, parseCharacterFromWikitext } from './characters.js';
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

// ── Caches ────────────────────────────────────────────────────────────────────
const categoryMembersCache = new Map();
const articleCache         = new Map();  // title → article object (without character)
const wikitextCache        = new Map();  // title → raw wikitext
const viewsCache           = new Map();
const characterCache       = new Map();  // title → character | null (parsed from wikitext)
const sessionSeen          = new Set();

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
    const avg   = items.length ? Math.round(items.reduce((s,i) => s+i.views,0)/items.length) : 0;
    viewsCache.set(title, avg);
    return avg;
  } catch {
    viewsCache.set(title, 0);
    return 0;
  }
}

export function rarityFromViews(views) {
  // Mythic = ultra-obscure AND only fires 12% of the time (so genuinely rarer than Legendary)
  if (views > 0 && views < VIEW_THRESHOLDS.MYTHIC_MAX) {
    return Math.random() < VIEW_THRESHOLDS.MYTHIC_PROB ? 'M' : 'C';
  }
  if (views >= VIEW_THRESHOLDS.L) return 'L';
  if (views >= VIEW_THRESHOLDS.E) return 'E';
  if (views >= VIEW_THRESHOLDS.R) return 'R';
  return 'C';
}

/**
 * Fetch the raw wikitext of an article.
 * Used to parse the "In popular culture" section for fictional character references.
 */
async function fetchWikitext(title) {
  if (wikitextCache.has(title)) return wikitextCache.get(title);
  try {
    const params = new URLSearchParams({
      action:'query', titles:title, prop:'revisions',
      rvprop:'content', rvslots:'main',
      rvsection:'0', // only the lead + we'll also check popular culture by fetching more
      format:'json', origin:'*',
      // Limit content size — we don't need the full article
      rvcontentformat:'text/x-wiki',
    });
    // First try fetching just what we need by looking for the section
    const params2 = new URLSearchParams({
      action:'parse', page:title, prop:'wikitext',
      section:'0', format:'json', origin:'*',
    });
    const res  = await fetch(`https://en.wikipedia.org/w/api.php?${params2}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    // Get intro section
    const intro = data.parse?.wikitext?.['*'] ?? '';

    // Now also fetch "In popular culture" section if it exists
    // We find it by searching for the section title in the full article
    const params3 = new URLSearchParams({
      action:'query', titles:title, prop:'revisions',
      rvprop:'content', rvslots:'main', format:'json', origin:'*',
      rvsection:'0',
    });
    // Combine: use intro + look for culture section
    let combined = intro;

    // Also try full article but limit chars (Wikipedia API doesn't support char limits easily)
    // Instead, search for popular culture in the full wikitext if intro is short
    if (intro.length < 500) {
      const params4 = new URLSearchParams({
        action:'query', titles:title, prop:'revisions',
        rvprop:'content', rvslots:'main', format:'json', origin:'*',
      });
      const res4  = await fetch(`https://en.wikipedia.org/w/api.php?${params4}`);
      if (res4.ok) {
        const data4 = await res4.json();
        const pages = data4.query?.pages ?? {};
        const page  = Object.values(pages)[0];
        const full  = page?.revisions?.[0]?.slots?.main?.['*'] ?? '';
        // Only take first 6000 chars to avoid huge memory usage
        combined = full.slice(0, 6000);
      }
    }

    wikitextCache.set(title, combined);
    return combined;
  } catch {
    wikitextCache.set(title, '');
    return '';
  }
}

/**
 * Fetch the full article wikitext (limited to 8000 chars) to find culture section.
 */
async function fetchFullWikitextForCharacter(title) {
  const cacheKey = title + '_full';
  if (wikitextCache.has(cacheKey)) return wikitextCache.get(cacheKey);
  try {
    const params = new URLSearchParams({
      action:'query', titles:title, prop:'revisions',
      rvprop:'content', rvslots:'main', format:'json', origin:'*',
    });
    const res  = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const pages = data.query?.pages ?? {};
    const page  = Object.values(pages)[0];
    const full  = (page?.revisions?.[0]?.slots?.main?.['*'] ?? '').slice(0, 8000);
    wikitextCache.set(cacheKey, full);
    return full;
  } catch {
    wikitextCache.set(cacheKey, '');
    return '';
  }
}

/**
 * Detect if a locomotive article has a fictional character based on it,
 * by parsing the article's wikitext for popular culture references.
 */
async function detectCharacterFromArticle(title, thomasIndex) {
  if (characterCache.has(title)) return characterCache.get(title);

  // 1. Check static/Thomas index first (fast path)
  const staticChar = getCharacterForTrain(title, thomasIndex);
  if (staticChar) {
    characterCache.set(title, staticChar);
    return staticChar;
  }

  // 2. Fetch and parse wikitext
  const wikitext  = await fetchFullWikitextForCharacter(title);
  const parsed    = parseCharacterFromWikitext(wikitext);
  characterCache.set(title, parsed);
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
  } catch { return null; }
}

export async function fetchTrainCard(categoryPool, maxAttempts = 16) {
  const thomasIndex   = await getThomasArticleIndex();
  const persistedSeen = getSeenPersisted();

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];
    const members  = await getCategoryMembers(category);
    if (!members.length) continue;

    const unseen    = members.filter(t => !sessionSeen.has(t) && !persistedSeen.has(t));
    const pool      = unseen.length ? unseen : members.filter(t => !sessionSeen.has(t));
    const finalPool = pool.length ? pool : members;
    const title     = finalPool[Math.floor(Math.random() * finalPool.length)];

    if (isFictional(title)) continue;

    const article = await fetchArticleSummary(title);
    if (!article) continue;

    const [views, character] = await Promise.all([
      getMonthlyPageViews(title),
      detectCharacterFromArticle(article.title, thomasIndex),
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

// Thomas-specific cheat draw — fetches a real loco that has a Thomas character
export async function fetchThomasCard() {
  const { fetchThomasCharacters } = await import('./thomas.js');
  const chars   = await fetchThomasCharacters();
  const thomasIndex = await getThomasArticleIndex();
  const entries = Object.values(chars).filter(c => c.wikiArticle && !isFictional(c.wikiArticle));
  if (!entries.length) return null;

  const seen   = getSeenPersisted();
  const pool   = [...entries].filter(c => !seen.has(c.wikiArticle)).sort(() => Math.random() - 0.5);
  const tryList = pool.length ? pool : entries.sort(() => Math.random() - 0.5);

  for (const char of tryList) {
    const article = await fetchArticleSummary(char.wikiArticle);
    if (!article) continue;
    const views   = await getMonthlyPageViews(char.wikiArticle);
    let   rarity  = rarityFromViews(views);
    rarity        = applyCharacterRarityBoost(rarity, char);
    addSeenPersisted(char.wikiArticle);
    return { ...article, rarity, views, character: char };
  }
  return null;
}
