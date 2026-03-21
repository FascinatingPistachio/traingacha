/**
 * fandom.js — character image resolution for Thomas & Friends characters.
 *
 * Strategy (in priority order):
 *  1. Hardcoded URLs (instant, no network, no rate-limit risk)
 *  2. Dynamic Fandom MediaWiki API lookup (free, no key, CORS-enabled via origin=*)
 *     — results are cached in localStorage for 7 days to avoid repeat calls
 *
 * The MediaWiki API used is the public thomas.fandom.com api.php endpoint.
 * No authentication or API key is required.
 */

// ── Hardcoded CDN base ─────────────────────────────────────────────────────────
const BASE = 'https://static.wikia.nocookie.net/ttte/images';
const SZ   = 'revision/latest/scale-to-width-down/400';

// ── Fandom API config ─────────────────────────────────────────────────────────
const FANDOM_API   = 'https://thomas.fandom.com/api.php';
const IMG_CACHE_KEY = 'rg_fandom_img_v2';
const IMG_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Hardcoded URLs (fastest path, no network needed) ─────────────────────────
export const CHARACTER_IMAGE_URLS = {
  'Thomas':        [`${BASE}/1/1f/Thomas_the_Tank_Engine_CGI.png/${SZ}`,  `${BASE}/5/5c/ThomasCGI.png/${SZ}`],
  'Gordon':        [`${BASE}/0/0c/MainGordonCGI2.png/${SZ}`,              `${BASE}/8/89/GordonCGI.png/${SZ}`],
  'James':         [`${BASE}/b/b7/MainJamesCGI2.png/${SZ}`,               `${BASE}/6/6f/JamesCGI.png/${SZ}`],
  'Percy':         [`${BASE}/7/78/MainPercyCGI2.png/${SZ}`,               `${BASE}/6/62/PercyCGI.png/${SZ}`],
  'Henry':         [`${BASE}/8/84/MainHenryCGI2.png/${SZ}`,               `${BASE}/a/a0/HenryCGI.png/${SZ}`],
  'Edward':        [`${BASE}/9/94/MainEdwardCGI2.png/${SZ}`,              `${BASE}/2/2c/EdwardCGI.png/${SZ}`],
  'Toby':          [`${BASE}/1/17/MainTobyCGI2.png/${SZ}`,                `${BASE}/e/ed/TobyCGI.png/${SZ}`],
  'Duck':          [`${BASE}/5/51/MainDuckCGI2.png/${SZ}`,                `${BASE}/8/87/DuckCGI.png/${SZ}`],
  'Emily':         [`${BASE}/6/67/MainEmilyCGI2.png/${SZ}`,               `${BASE}/7/73/EmilyCGI.png/${SZ}`],
  'Spencer':       [`${BASE}/8/83/SpencerCGI2.png/${SZ}`,                 `${BASE}/6/64/SpencerCGI.png/${SZ}`],
  'Oliver':        [`${BASE}/9/9c/MainOliverCGI2.png/${SZ}`,              `${BASE}/b/b5/OliverCGI.png/${SZ}`],
  'Hiro':          [`${BASE}/c/c7/MainHiroCGI2.png/${SZ}`,                `${BASE}/3/31/HiroCGI.png/${SZ}`],
  'Diesel':        [`${BASE}/3/3a/MainDieselCGI2.png/${SZ}`,              `${BASE}/c/c3/DieselCGI.png/${SZ}`],
  'Donald':        [`${BASE}/3/3a/MainDonaldCGI2.png/${SZ}`,              `${BASE}/e/ee/DonaldCGI.png/${SZ}`],
  'Douglas':       [`${BASE}/6/66/MainDouglasCGI2.png/${SZ}`,             `${BASE}/f/fe/DouglasNewImage.png/${SZ}`],
  'Bertie':        [`${BASE}/f/fa/MainBertieCGI2.png/${SZ}`,              `${BASE}/5/54/BertieCGI.png/${SZ}`],
  'Harold':        [`${BASE}/b/b9/MainHaroldCGI2.png/${SZ}`,              `${BASE}/0/0d/HaroldCGI.png/${SZ}`],
  'Mavis':         [`${BASE}/c/c3/MainMavisCGI2.png/${SZ}`,               `${BASE}/6/6b/MavisCGI.png/${SZ}`],
  'Daisy':         [`${BASE}/9/92/MainDaisyCGI2.png/${SZ}`,               `${BASE}/8/84/DaisyCGI.png/${SZ}`],
  'BoCo':          [`${BASE}/e/eb/MainBoCoTTTE.png/${SZ}`,                `${BASE}/b/bb/MainBoCoCGI.png/${SZ}`],
  'Rusty':         [`${BASE}/e/e2/MainRustyCGI2.png/${SZ}`,               `${BASE}/9/9b/RustyCGI.png/${SZ}`],
  'Skarloey':      [`${BASE}/7/7c/MainSkarloeyCGI2.png/${SZ}`,            `${BASE}/5/55/SkarloeyCGI.png/${SZ}`],
  'Rheneas':       [`${BASE}/1/1d/MainRheneasCGI2.png/${SZ}`,             `${BASE}/f/ff/RheneasCGI.png/${SZ}`],
  'Luke':          [`${BASE}/6/62/MainLukeCGI2.png/${SZ}`,                `${BASE}/3/3f/LukeCGI.png/${SZ}`],
  'Victor':        [`${BASE}/8/8c/MainVictorCGI2.png/${SZ}`,              `${BASE}/b/b4/VictorCGI.png/${SZ}`],
  'Kevin':         [`${BASE}/5/5d/MainKevinCGI2.png/${SZ}`,               `${BASE}/6/69/KevinCGI.png/${SZ}`],
  'Charlie':       [`${BASE}/6/62/MainCharlieCGI2.png/${SZ}`,             `${BASE}/f/fa/CharlieCGI.png/${SZ}`],
  'Bash':          [`${BASE}/0/03/MainBashCGI2.png/${SZ}`,                `${BASE}/b/b9/BashCGI.png/${SZ}`],
  'Dash':          [`${BASE}/1/1b/MainDashCGI2.png/${SZ}`,                `${BASE}/b/b5/DashCGI.png/${SZ}`],
  'Ferdinand':     [`${BASE}/4/43/MainFerdinandCGI2.png/${SZ}`,           `${BASE}/d/d1/FerdinandCGI.png/${SZ}`],
  'Timothy':       [`${BASE}/5/55/MainTimothyCGI2.png/${SZ}`,             `${BASE}/c/c8/TimothyCGI.png/${SZ}`],
  'Ryan':          [`${BASE}/f/fa/MainRyanCGI2.png/${SZ}`,                `${BASE}/3/37/RyanCGI.png/${SZ}`],
  'Phillip':       [`${BASE}/1/17/MainPhillipCGI2.png/${SZ}`,             `${BASE}/b/b6/PhillipCGI.png/${SZ}`],
  'Philip':        [`${BASE}/1/17/MainPhillipCGI2.png/${SZ}`,             `${BASE}/b/b6/PhillipCGI.png/${SZ}`],
  'Nia':           [`${BASE}/2/2c/MainNiaCGI2.png/${SZ}`,                 `${BASE}/4/43/NiaCGI.png/${SZ}`],
  'Rebecca':       [`${BASE}/0/01/MainRebeccaCGI2.png/${SZ}`,             `${BASE}/d/dd/RebeccaCGI.png/${SZ}`],
  'Caitlin':       [`${BASE}/6/6e/MainCaitlinCGI2.png/${SZ}`,             `${BASE}/5/5e/CaitlinCGI.png/${SZ}`],
  'Connor':        [`${BASE}/2/25/MainConnorCGI2.png/${SZ}`,              `${BASE}/b/be/ConnorCGI.png/${SZ}`],
  'Samson':        [`${BASE}/2/26/MainSamsonCGI2.png/${SZ}`,              `${BASE}/0/04/SamsonCGI.png/${SZ}`],
  'Whiff':         [`${BASE}/e/eb/MainWhiffCGI2.png/${SZ}`,               `${BASE}/3/31/WhiffCGI.png/${SZ}`],
  'Billy':         [`${BASE}/0/0e/MainBillyCGI2.png/${SZ}`,               `${BASE}/7/74/BillyCGI.png/${SZ}`],
  'Stanley':       [`${BASE}/b/b5/MainStanleyCGI2.png/${SZ}`,             `${BASE}/8/83/StanleyCGI.png/${SZ}`],
  'Rosie':         [`${BASE}/a/ad/MainRosieCGI2.png/${SZ}`,               `${BASE}/e/e1/RosieCGI.png/${SZ}`],
  'Flora':         [`${BASE}/5/54/MainFloraCGI2.png/${SZ}`,               `${BASE}/a/a2/FloraCGI.png/${SZ}`],
  'Molly':         [`${BASE}/3/39/MainMollyCGI2.png/${SZ}`,               `${BASE}/f/f6/MollyCGI.png/${SZ}`],
  'Murdoch':       [`${BASE}/4/40/MainMurdochCGI2.png/${SZ}`,             `${BASE}/9/94/MurdochCGI.png/${SZ}`],
  'Arthur':        [`${BASE}/9/90/MainArthurCGI2.png/${SZ}`,              `${BASE}/0/0e/ArthurCGI.png/${SZ}`],
  'Dennis':        [`${BASE}/a/ac/MainDennisCGI2.png/${SZ}`,              `${BASE}/9/9d/DennisCGI.png/${SZ}`],
  'Freddie':       [`${BASE}/6/62/MainFreddieCGI2.png/${SZ}`,             `${BASE}/d/d7/FreddieCGI.png/${SZ}`],
  'Stepney':       [`${BASE}/b/b8/MainStepneyCGI2.png/${SZ}`,             `${BASE}/3/3b/StepneyCGI.png/${SZ}`],
  'Duncan':        [`${BASE}/e/e9/MainDuncanCGI2.png/${SZ}`,              `${BASE}/d/d4/DuncanCGI.png/${SZ}`],
  'Millie':        [`${BASE}/b/b5/MainMillieCGI2.png/${SZ}`,              `${BASE}/b/b7/MillieCGI.png/${SZ}`],
  'Stephen':       [`${BASE}/6/60/MainStephenCGI2.png/${SZ}`,             `${BASE}/e/e4/StephenCGI.png/${SZ}`],
  'Paxton':        [`${BASE}/4/46/MainPaxtonCGI2.png/${SZ}`,              `${BASE}/8/85/PaxtonCGI.png/${SZ}`],
  'Winston':       [`${BASE}/9/9e/MainWinstonCGI2.png/${SZ}`,             `${BASE}/b/b1/WinstonCGI.png/${SZ}`],
  'Glynn':         [`${BASE}/d/d1/MainGlynnCGI2.png/${SZ}`,               `${BASE}/3/39/GlynnCGI.png/${SZ}`],
  'Pip':           [`${BASE}/3/3f/MainPipCGI2.png/${SZ}`,                 `${BASE}/6/63/PipCGI.png/${SZ}`],
  'Emma':          [`${BASE}/5/5f/MainEmmaCGI2.png/${SZ}`,                `${BASE}/a/a4/EmmaCGI.png/${SZ}`],
  'Sonny':         [`${BASE}/8/81/MainSonnyCGI2.png/${SZ}`,               `${BASE}/5/5f/SonnyCGI.png/${SZ}`],
  'Kana':          [`${BASE}/2/28/MainKanaCGI2.png/${SZ}`,                `${BASE}/4/44/KanaCGI.png/${SZ}`],
  'Bruno':         [`${BASE}/1/1a/MainBrunoCGI2.png/${SZ}`,               `${BASE}/f/fc/BrunoCGI.png/${SZ}`],
  'Ashima':        [`${BASE}/7/7b/MainAshimaCGI2.png/${SZ}`,              `${BASE}/2/2d/AshimaCGI.png/${SZ}`],
  'Rajiv':         [`${BASE}/b/bb/MainRajivCGI2.png/${SZ}`,               `${BASE}/7/79/RajivCGI.png/${SZ}`],
  'Carlos':        [`${BASE}/b/bd/MainCarlosCGI.png/${SZ}`,               `${BASE}/e/ef/CarlosCGI.png/${SZ}`],
  'Axel':          [`${BASE}/2/23/MainAxelCGI2.png/${SZ}`,                `${BASE}/c/c3/AxelCGI.png/${SZ}`],
  'Lorenzo':       [`${BASE}/5/59/MainLorenzoCGI2.png/${SZ}`,             `${BASE}/f/ff/LorenzoCGI.png/${SZ}`],
  'Yong Bao':      [`${BASE}/f/f1/MainYongBaoCGI2.png/${SZ}`,             `${BASE}/f/fe/YongBaoCGI.png/${SZ}`],
  'Ivan':          [`${BASE}/e/ee/MainIvanCGI2.png/${SZ}`,                `${BASE}/5/5f/IvanCGI.png/${SZ}`],
  'Frankie':       [`${BASE}/f/f5/MainFrankieCGI2.png/${SZ}`,             `${BASE}/2/2b/FrankieCGI.png/${SZ}`],
  'Hugo':          [`${BASE}/6/66/MainHugoCGI2.png/${SZ}`,                `${BASE}/a/af/HugoCGI.png/${SZ}`],
  'Skiff':         [`${BASE}/5/5b/MainSkiffCGI2.png/${SZ}`,               `${BASE}/e/e6/SkiffCGI.png/${SZ}`],
  'Salty':         [`${BASE}/d/d5/MainSaltyCGI2.png/${SZ}`,               `${BASE}/d/dc/SaltyCGI.png/${SZ}`],
  'Harvey':        [`${BASE}/9/9f/MainHarveyCGI2.png/${SZ}`,              `${BASE}/c/c6/HarveyCGI.png/${SZ}`],
  'Gator':         [`${BASE}/9/91/MainGatorCGI2.png/${SZ}`,               `${BASE}/7/75/GatorCGI.png/${SZ}`],
  'Marion':        [`${BASE}/7/79/MainMarionCGI2.png/${SZ}`,              `${BASE}/f/f0/MarionCGI.png/${SZ}`],
  'Belle':         [`${BASE}/5/5f/MainBelleCGI2.png/${SZ}`,               `${BASE}/0/07/BelleCGI.png/${SZ}`],
  'Flynn':         [`${BASE}/0/04/MainFlynnCGI2.png/${SZ}`,               `${BASE}/9/98/FlynnCGI.png/${SZ}`],
  'Peter Sam':     [`${BASE}/c/ca/MainPeterSamCGI2.png/${SZ}`,            `${BASE}/a/ae/PeterSamCGI.png/${SZ}`],
  'Sir Handel':    [`${BASE}/5/5e/MainSirHandelCGI2.png/${SZ}`,           `${BASE}/9/90/SirHandelCGI.png/${SZ}`],
  'Scruff':        [`${BASE}/0/0e/MainScruffCGI2.png/${SZ}`,              `${BASE}/c/cb/ScruffCGI.png/${SZ}`],
  'Porter':        [`${BASE}/4/4d/MainPorterCGI2.png/${SZ}`,              `${BASE}/7/74/PorterCGI.png/${SZ}`],
  'Vinnie':        [`${BASE}/f/fe/MainVinnieCGI2.png/${SZ}`,              `${BASE}/9/97/VinnieCGI.png/${SZ}`],
  'Shane':         [`${BASE}/c/c2/MainShaneCGI2.png/${SZ}`,               `${BASE}/8/86/ShaneCGI.png/${SZ}`],
  'Theo':          [`${BASE}/8/86/MainTheoCGI2.png/${SZ}`,                `${BASE}/2/25/TheoCGI.png/${SZ}`],
  'Lexi':          [`${BASE}/b/bc/MainLexiCGI2.png/${SZ}`,                `${BASE}/0/04/LexiCGI.png/${SZ}`],
  'Merlin':        [`${BASE}/1/14/MainMerlinCGI2.png/${SZ}`,              `${BASE}/6/65/MerlinCGI.png/${SZ}`],
  'Hurricane':     [`${BASE}/8/88/MainHurricaneCGI2.png/${SZ}`,           `${BASE}/5/54/HurricaneCGI.png/${SZ}`],
  'Flying Scotsman':[`${BASE}/a/a7/FlyingScotsman.png/${SZ}`,             `${BASE}/1/16/Flying_Scotsman.png/${SZ}`],
  'Bill':          [`${BASE}/d/db/MainBillCGI2.png/${SZ}`,                `${BASE}/1/1d/BillCGI.png/${SZ}`],
  'Ben':           [`${BASE}/a/ae/MainBenCGI2.png/${SZ}`,                 `${BASE}/6/62/BenCGI.png/${SZ}`],
  'Noor Jeehan':   [`${BASE}/5/57/MainNoorJehanCGI2.png/${SZ}`,           `${BASE}/6/6d/NoorJehanCGI.png/${SZ}`],
  'Noor':          [`${BASE}/5/57/MainNoorJehanCGI2.png/${SZ}`,           `${BASE}/6/6d/NoorJehanCGI.png/${SZ}`],
};

// ── localStorage image cache helpers ─────────────────────────────────────────
function loadImgCache() {
  try {
    const raw = localStorage.getItem(IMG_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveImgCache(cache) {
  try { localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(cache)); } catch { /* quota */ }
}

// ── Image filename scoring (higher = more likely to be a good character portrait) ──
function scoreImageTitle(title, characterName) {
  const t    = title.toLowerCase();
  const name = characterName.toLowerCase().replace(/\s+/g, '');

  // Hard skip: not a usable image format
  if (/\.(svg|ico|gif|webp|ogg|mp3|mp4|pdf)$/i.test(t)) return -1;
  // Hard skip: common wiki-decoration files
  if (/^file:(stub|wiki|placeholder|transparent|blank|logo|icon|favicon|badge|star|award)/i.test(t)) return -1;

  let score = 0;
  if (t.includes(name))              score += 30;  // name in filename
  if (/maincgi2/i.test(t))           score += 25;  // newest infobox image
  if (/maincgi/i.test(t))            score += 20;  // older infobox
  if (/cgi2/i.test(t))               score += 15;
  if (/cgi/i.test(t))                score += 10;
  if (/tttte|ttte/i.test(t))         score += 5;   // wiki-specific CDN path hint
  if (/\.png$/i.test(t))             score += 3;   // prefer PNG
  if (/\.jpg$|\.jpeg$/i.test(t))     score += 2;

  return score;
}

// ── Fandom MediaWiki API: get images listed on a character page ───────────────
async function fetchPageImageTitles(characterName) {
  // Try a few page title variants: plain name, then with disambiguation suffix
  const variants = [
    characterName,
    `${characterName} (T&F)`,
    `${characterName} (Thomas & Friends)`,
  ];

  for (const variant of variants) {
    const url = new URL(FANDOM_API);
    url.searchParams.set('action',  'query');
    url.searchParams.set('titles',  variant);
    url.searchParams.set('prop',    'images');
    url.searchParams.set('imlimit', '30');
    url.searchParams.set('format',  'json');
    url.searchParams.set('origin',  '*');   // required for CORS

    try {
      const res  = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const data = await res.json();
      const pages = Object.values(data?.query?.pages ?? {});
      if (!pages.length || pages[0].missing !== undefined) continue;

      const images = pages[0].images ?? [];
      if (images.length) return images.map(i => i.title);
    } catch { /* network/timeout — try next variant */ }
  }
  return [];
}

// ── Fandom MediaWiki API: resolve a File: title to an actual image URL ────────
async function fetchImageUrl(fileTitle) {
  const url = new URL(FANDOM_API);
  url.searchParams.set('action',   'query');
  url.searchParams.set('titles',   fileTitle);
  url.searchParams.set('prop',     'imageinfo');
  url.searchParams.set('iiprop',   'url');
  url.searchParams.set('iiurlwidth','400');  // request thumbnail at 400px wide
  url.searchParams.set('format',   'json');
  url.searchParams.set('origin',   '*');

  try {
    const res  = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const page = Object.values(data?.query?.pages ?? {})[0];
    // Prefer the scaled thumbnail URL; fall back to full URL
    return page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url ?? null;
  } catch { return null; }
}

// ── Main dynamic fetch: pick best image for a character ──────────────────────
export async function fetchFandomCharacterImage(characterName) {
  const cache = loadImgCache();
  const cacheEntry = cache[characterName];

  // Return cached result (even null = "we checked and found nothing")
  if (cacheEntry && Date.now() - cacheEntry.ts < IMG_CACHE_TTL) {
    return cacheEntry.url;
  }

  // Fetch image list from the character's wiki page
  const imageTitles = await fetchPageImageTitles(characterName);
  if (!imageTitles.length) {
    cache[characterName] = { url: null, ts: Date.now() };
    saveImgCache(cache);
    return null;
  }

  // Score every image filename and pick the best one
  const scored = imageTitles
    .map(t => ({ title: t, score: scoreImageTitle(t, characterName) }))
    .filter(x => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    cache[characterName] = { url: null, ts: Date.now() };
    saveImgCache(cache);
    return null;
  }

  // Resolve the top-scoring file to a real URL
  const url = await fetchImageUrl(scored[0].title);

  cache[characterName] = { url, ts: Date.now() };
  saveImgCache(cache);
  return url;
}

// ── Synchronous helper used by RailCard (returns hardcoded URLs only) ─────────
export function getCharacterImageUrls(name) {
  return CHARACTER_IMAGE_URLS[name] ?? [];
}

// ── Wiki page URLs ─────────────────────────────────────────────────────────────
export const CHARACTER_WIKI_URLS = Object.fromEntries(
  Object.keys(CHARACTER_IMAGE_URLS).map(c => [
    c,
    `https://thomas.fandom.com/wiki/${encodeURIComponent(c.replace(/ /g, '_'))}`,
  ])
);

// ── Prewarm: no-op (dynamic fetching happens on demand only) ──────────────────
export function prewarmFandomCache() {}
