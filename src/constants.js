export const RARITY = {
  C: { name:'Common',    short:'COM',  color:'#8a9bb0', border:'rgba(138,155,176,0.5)', bg:'#0c1825', glow:'rgba(138,155,176,0.3)', rank:0 },
  R: { name:'Rare',      short:'RARE', color:'#4fa8e8', border:'rgba(79,168,232,0.6)',  bg:'#071828', glow:'rgba(79,168,232,0.4)',  rank:1 },
  E: { name:'Epic',      short:'EPIC', color:'#b57bee', border:'rgba(181,123,238,0.65)',bg:'#140824', glow:'rgba(181,123,238,0.5)', rank:2 },
  L: { name:'Legendary', short:'LEG',  color:'#e8c040', border:'rgba(232,192,64,0.75)', bg:'#160f00', glow:'rgba(232,192,64,0.6)',  rank:3 },
  M: { name:'Mythic',    short:'???',  color:'#d0d8f8', border:'rgba(180,200,255,0.8)', bg:'#06060e', glow:'rgba(160,180,255,0.7)', rank:4 },
};

export const PACK_COST     = 1;
export const DAILY_BONUS   = 10;
export const START_TICKETS = 20;
export const SAVE_KEY      = 'railgacha_v4';

// Rarity thresholds (monthly Wikipedia page views)
// Bimodal: Mythic = obscure (< 80 views) AND Legendary = famous (≥ 80k)
export const VIEW_THRESHOLDS = {
  MYTHIC_MAX: 80,    // < 80 views/month  → Mythic  (ghost trains, almost unseen)
  L: 80_000,         // ≥ 80k views/month → Legendary (world-famous)
  E: 20_000,
  R: 3_000,
  // 80–3000 = Common
};

// Ticket economy
export const TIMER_INTERVAL_MS = 5 * 60 * 1000;   // 1 ticket per 5 min
export const TIMER_TICKETS     = 1;
export const TIMER_MAX_CHARGES = 10;
export const AD_TICKETS        = 5;
export const AD_COOLDOWN_MS    = 5 * 60 * 1000;
export const AD_DURATION_S     = 30;

export const LAUNCH_YEAR = 2026;
export const GITHUB_URL  = 'https://github.com/FascinatingPistachio/traingacha';
export const WIKIGACHA_URL = 'https://wikigacha.com/?lang=EN';
