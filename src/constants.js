export const RARITY = {
  C: { name:'Common',    short:'COM',  color:'#8a9bb0', border:'rgba(138,155,176,0.5)', bg:'#0c1825', glow:'rgba(138,155,176,0.3)', rank:0 },
  R: { name:'Rare',      short:'RARE', color:'#4fa8e8', border:'rgba(79,168,232,0.6)',  bg:'#071828', glow:'rgba(79,168,232,0.4)',  rank:1 },
  E: { name:'Epic',      short:'EPIC', color:'#b57bee', border:'rgba(181,123,238,0.65)',bg:'#140824', glow:'rgba(181,123,238,0.5)', rank:2 },
  L: { name:'Legendary', short:'LEG',  color:'#e8c040', border:'rgba(232,192,64,0.75)', bg:'#160f00', glow:'rgba(232,192,64,0.6)',  rank:3 },
};

export const PACK_COST          = 1;       // 1 ticket per pack
export const DAILY_BONUS        = 10;      // daily bonus tickets
export const START_TICKETS      = 20;      // starting tickets
export const SAVE_KEY           = 'railgacha_v3';

// Rarity thresholds (monthly Wikipedia page views)
export const VIEW_THRESHOLDS = {
  L: 120_000,
  E: 30_000,
  R: 6_000,
};

// ── Ticket economy ─────────────────────────────────────────────────────────
export const TIMER_INTERVAL_MS = 5 * 60 * 1000;   // 1 ticket every 5 minutes
export const TIMER_TICKETS     = 1;                // tickets per charge
export const TIMER_MAX_CHARGES = 10;               // max 10 stored
export const AD_TICKETS        = 5;                // tickets per ad watch
export const AD_COOLDOWN_MS    = 5 * 60 * 1000;    // 5 min between ads
export const AD_DURATION_S     = 30;               // simulated ad length
