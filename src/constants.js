export const RARITY = {
  C: { name:'Common',    short:'COM',  color:'#8a9bb0', border:'rgba(138,155,176,0.5)', bg:'#0c1825', glow:'rgba(138,155,176,0.3)', rank:0 },
  R: { name:'Rare',      short:'RARE', color:'#4fa8e8', border:'rgba(79,168,232,0.6)',  bg:'#071828', glow:'rgba(79,168,232,0.4)',  rank:1 },
  E: { name:'Epic',      short:'EPIC', color:'#b57bee', border:'rgba(181,123,238,0.65)',bg:'#140824', glow:'rgba(181,123,238,0.5)', rank:2 },
  L: { name:'Legendary', short:'LEG',  color:'#e8c040', border:'rgba(232,192,64,0.75)', bg:'#160f00', glow:'rgba(232,192,64,0.6)',  rank:3 },
  M: { name:'Mythic',    short:'???',  color:'#c0c8ff', border:'rgba(140,160,255,0.9)', bg:'#030308', glow:'rgba(120,140,255,0.8)', rank:4 },
};

export const PACK_COST     = 1;
export const DAILY_BONUS   = 10;
export const START_TICKETS = 20;
export const SAVE_KEY      = 'railgacha_v4';

// ── Rarity thresholds (monthly Wikipedia avg views) ──────────────────────────
export const VIEW_THRESHOLDS = {
  MYTHIC_MAX:  15,     // < 15 views AND 12% roll → Mythic (else Common)
  MYTHIC_PROB: 0.12,
  L: 80_000,           // ≥ 80k  → Legendary
  E: 18_000,           // ≥ 18k  → Epic
  R: 3_000,            // ≥ 3k   → Rare
  // < 3k → Common
};

// ── Pity system (3-tier) ──────────────────────────────────────────────────────
// Each tier resets when that rarity or better is pulled.
export const PITY = {
  RARE_HARD:    10,   // Guaranteed Rare+ after N non-Rare pulls
  EPIC_SOFT:    18,   // Increasing Epic probability starts
  EPIC_HARD:    25,   // Guaranteed Epic+
  LEGEND_SOFT:  40,   // Increasing Legendary probability starts
  LEGEND_HARD:  50,   // Guaranteed Legendary
};

// ── Ticket economy ────────────────────────────────────────────────────────────
export const TIMER_INTERVAL_MS = 5 * 60 * 1000;
export const TIMER_TICKETS     = 1;
export const TIMER_MAX_CHARGES = 10;
export const AD_TICKETS        = 5;
export const AD_COOLDOWN_MS    = 5 * 60 * 1000;
export const AD_DURATION_S     = 30;

// ── Battle rewards ────────────────────────────────────────────────────────────
export const BATTLE_WIN_TICKETS  = { easy:3, medium:6, hard:12 };
export const BATTLE_LOSS_TICKETS = 1;
export const RAID_WIN_TICKETS    = 20;

export const LAUNCH_YEAR   = 2026;
export const GITHUB_URL    = 'https://github.com/FascinatingPistachio/traingacha';
export const WIKIGACHA_URL = 'https://wikigacha.com/?lang=EN';

export const FICTIONAL_TITLE_PATTERNS = [
  /thomas the tank engine/i, /thomas & friends/i, /thomas and friends/i,
  /the railway series/i,     /gordon the big engine/i,
  /james the red engine/i,   /percy the small engine/i,
  /henry the green engine/i, /edward the blue engine/i,
  /list of thomas/i,         /characters in thomas/i,
  /\bfictional\b/i,
];
