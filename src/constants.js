export const RARITY = {
  C: {
    name: 'Common',
    short: 'COM',
    color: '#8a9bb0',
    border: 'rgba(138,155,176,0.5)',
    bg: '#0c1825',
    glow: 'rgba(138,155,176,0.3)',
    rank: 0,
  },
  R: {
    name: 'Rare',
    short: 'RARE',
    color: '#4fa8e8',
    border: 'rgba(79,168,232,0.6)',
    bg: '#071828',
    glow: 'rgba(79,168,232,0.4)',
    rank: 1,
  },
  E: {
    name: 'Epic',
    short: 'EPIC',
    color: '#b57bee',
    border: 'rgba(181,123,238,0.65)',
    bg: '#140824',
    glow: 'rgba(181,123,238,0.5)',
    rank: 2,
  },
  L: {
    name: 'Legendary',
    short: 'LEG',
    color: '#e8c040',
    border: 'rgba(232,192,64,0.75)',
    bg: '#160f00',
    glow: 'rgba(232,192,64,0.6)',
    rank: 3,
  },
};

export const PACK_COST = 100;
export const DAILY_BONUS = 150;
export const START_TICKETS = 500;
export const SAVE_KEY = 'railgacha_v3';

// Pageview thresholds (monthly average) for rarity assignment.
// These are calibrated against real Wikipedia traffic data for train articles.
export const VIEW_THRESHOLDS = {
  L: 120_000,  // e.g. Flying Scotsman, Shinkansen – global icons
  E: 30_000,   // e.g. ICE 3, Eurostar – well-known to enthusiasts worldwide
  R: 6_000,    // e.g. regional express services, notable heritage lines
  // below R_threshold → Common
};
