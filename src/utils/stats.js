/**
 * stats.js — Deterministic card stat generation.
 *
 * Same Wikipedia article title → always same stats → universal across all players.
 * No backend needed. Two players who pull "Flying Scotsman" get identical stats.
 *
 * Stats (Top Trumps style):
 *   SPEED     0–350  (km/h)
 *   POWER     0–9999 (kW)
 *   HERITAGE  0–999  (historical significance score)
 *   FAME      0–999  (from real Wikipedia monthly views)
 *   ENDURANCE 0–999  (longevity / reliability score)
 */

export const STAT_CONFIG = [
  { key:'speed',     label:'SPEED',     unit:'km/h', max:350,  color:'#ef5350', icon:'💨' },
  { key:'power',     label:'POWER',     unit:'kW',   max:9999, color:'#ff9800', icon:'⚡' },
  { key:'heritage',  label:'HERITAGE',  unit:'pts',  max:999,  color:'#9c27b0', icon:'🏛️' },
  { key:'fame',      label:'FAME',      unit:'pts',  max:999,  color:'#2196f3', icon:'⭐' },
  { key:'endurance', label:'ENDURANCE', unit:'pts',  max:999,  color:'#4caf50', icon:'🔧' },
];

// Seeded hash — deterministic for any given string
function seed32(str) {
  let h = 0xdeadbeef;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  return (h ^ (h >>> 13)) >>> 0;
}

// Linear congruential generator from seed
function lcg(s) {
  let state = s >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

// Rarity affects the ceiling of stats — higher rarity = generally better cards
const RARITY_SCALE = { C:0.50, R:0.65, E:0.82, L:0.93, M:1.00 };
// Rarity floor (minimum % of max stat) — Legendary always at least decent
const RARITY_FLOOR = { C:0.05, R:0.12, E:0.25, L:0.40, M:0.55 };

export function generateCardStats(title, views = 0, rarity = 'C') {
  const rng   = lcg(seed32(title));
  const scale = RARITY_SCALE[rarity] ?? 0.50;
  const floor = RARITY_FLOOR[rarity] ?? 0.05;

  const r = () => floor + rng() * (scale - floor);

  const speed     = Math.round(r() * 350);
  const power     = Math.round(r() * 9999);
  const heritage  = Math.round(r() * 999);
  // Fame is derived from real Wikipedia views — consistent and meaningful
  const fame      = Math.min(999, Math.round(Math.log10(views + 10) / Math.log10(500000) * 999));
  const endurance = Math.round(r() * 999);

  // Overall: normalised weighted sum (speed matters most for trains)
  const overall = Math.round(
    (speed/350 * 0.25 + power/9999 * 0.20 + heritage/999 * 0.20 + fame/999 * 0.20 + endurance/999 * 0.15) * 100
  );

  return { speed, power, heritage, fame, endurance, overall };
}

export function statPercent(key, value) {
  const cfg = STAT_CONFIG.find(s => s.key === key);
  return cfg ? Math.min(100, Math.round((value / cfg.max) * 100)) : 0;
}

export function formatStat(key, value) {
  if (key === 'speed')  return `${value} km/h`;
  if (key === 'power')  return value >= 1000 ? `${(value/1000).toFixed(1)}k kW` : `${value} kW`;
  return String(value);
}
