export const RARITY = {
  C: { name:'Common',    short:'COM',  color:'#8a9bb0', border:'rgba(138,155,176,0.5)', bg:'#0c1825', glow:'rgba(138,155,176,0.3)', rank:0 },
  R: { name:'Rare',      short:'RARE', color:'#4fa8e8', border:'rgba(79,168,232,0.6)',  bg:'#071828', glow:'rgba(79,168,232,0.4)',  rank:1 },
  E: { name:'Epic',      short:'EPIC', color:'#b57bee', border:'rgba(181,123,238,0.65)',bg:'#140824', glow:'rgba(181,123,238,0.5)', rank:2 },
  L: { name:'Legendary', short:'LEG',  color:'#e8c040', border:'rgba(232,192,64,0.75)', bg:'#160f00', glow:'rgba(232,192,64,0.6)',  rank:3 },
  // Mythic is RARER than Legendary — a true ghost train with near-zero Wikipedia presence
  M: { name:'Mythic',    short:'???',  color:'#c0c8ff', border:'rgba(140,160,255,0.9)', bg:'#030308', glow:'rgba(120,140,255,0.8)', rank:4 },
};

export const PACK_COST     = 1;
export const DAILY_BONUS   = 10;
export const START_TICKETS = 20;
export const SAVE_KEY      = 'railgacha_v4';

// View thresholds (monthly Wikipedia avg)
// Mythic: < MYTHIC_MAX views AND only fires on a 12% probability roll → genuinely rarer than Legendary
export const VIEW_THRESHOLDS = {
  MYTHIC_MAX:  15,    // must be < 15 views AND pass the 12% roll
  MYTHIC_PROB: 0.12,  // probability a qualifying low-view article becomes Mythic (rest → Common)
  L: 80_000,
  E: 18_000,
  R: 3_000,
  // 3k–80k = Common (lots of decent but unremarkable trains)
};

// Ticket economy
export const TIMER_INTERVAL_MS = 5 * 60 * 1000;
export const TIMER_TICKETS     = 1;
export const TIMER_MAX_CHARGES = 10;
export const AD_TICKETS        = 5;
export const AD_COOLDOWN_MS    = 5 * 60 * 1000;
export const AD_DURATION_S     = 30;

export const LAUNCH_YEAR   = 2026;
export const GITHUB_URL    = 'https://github.com/FascinatingPistachio/traingacha';
export const WIKIGACHA_URL = 'https://wikigacha.com/?lang=EN';

// Wikipedia article titles that are FICTIONAL (character articles, not real locomotives)
// — skipped during pulls so only real-world subjects become cards
export const FICTIONAL_TITLE_PATTERNS = [
  /thomas the tank engine/i,
  /thomas & friends/i,
  /thomas and friends/i,
  /the railway series/i,
  /gordon the big engine/i,
  /james the red engine/i,
  /percy the small engine/i,
  /henry the green engine/i,
  /edward the blue engine/i,
  /list of thomas/i,
  /characters in thomas/i,
  /\bfictional\b/i,
];
