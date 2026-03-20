import { TIMER_INTERVAL_MS, TIMER_MAX_CHARGES, AD_COOLDOWN_MS } from '../constants.js';

/**
 * Given the save object, work out how many timer charges have accumulated
 * since the last time they were collected and return an updated save patch.
 * Call this on app load and whenever the ShopScreen is opened.
 */
export function collectTimerCharges(save) {
  const now        = Date.now();
  const lastCollect = save.timerLastCollect ?? now;
  const elapsed    = now - lastCollect;
  const newCharges = Math.floor(elapsed / TIMER_INTERVAL_MS);

  if (newCharges <= 0) return null; // nothing to collect

  const currentCharges = save.timerCharges ?? 0;
  const total          = Math.min(currentCharges + newCharges, TIMER_MAX_CHARGES);
  const used           = total - currentCharges;           // actually added
  // Advance lastCollect only by the intervals we consumed
  const newLastCollect = lastCollect + used * TIMER_INTERVAL_MS;

  return {
    timerCharges:     total,
    timerLastCollect: newLastCollect,
  };
}

/**
 * How many ms until the next charge arrives.
 */
export function msUntilNextCharge(save) {
  const lastCollect = save.timerLastCollect ?? Date.now();
  const elapsed     = Date.now() - lastCollect;
  const remaining   = TIMER_INTERVAL_MS - (elapsed % TIMER_INTERVAL_MS);
  return remaining;
}

/**
 * Is the ad button on cooldown?
 */
export function adOnCooldown(save) {
  if (!save.lastAdWatch) return false;
  return (Date.now() - save.lastAdWatch) < AD_COOLDOWN_MS;
}

/**
 * How many ms until ad can be watched again.
 */
export function msUntilAdReady(save) {
  if (!save.lastAdWatch) return 0;
  return Math.max(0, AD_COOLDOWN_MS - (Date.now() - save.lastAdWatch));
}

/**
 * Format milliseconds as  mm:ss
 */
export function fmtMs(ms) {
  const totalS = Math.ceil(ms / 1000);
  const m      = Math.floor(totalS / 60);
  const s      = totalS % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
