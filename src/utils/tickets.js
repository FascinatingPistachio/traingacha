import { TIMER_INTERVAL_MS, TIMER_MAX_CHARGES, AD_COOLDOWN_MS } from '../constants.js';

export function collectTimerCharges(save) {
  const now        = Date.now();
  const lastCollect = save.timerLastCollect ?? now;
  const elapsed    = now - lastCollect;
  const newCharges = Math.floor(elapsed / TIMER_INTERVAL_MS);
  if (newCharges <= 0) return null;
  const currentCharges = save.timerCharges ?? 0;
  const total          = Math.min(currentCharges + newCharges, TIMER_MAX_CHARGES);
  const used           = total - currentCharges;
  const newLastCollect = lastCollect + used * TIMER_INTERVAL_MS;
  return { timerCharges: total, timerLastCollect: newLastCollect };
}

export function msUntilNextCharge(save) {
  const lastCollect = save.timerLastCollect ?? Date.now();
  const elapsed     = Date.now() - lastCollect;
  return TIMER_INTERVAL_MS - (elapsed % TIMER_INTERVAL_MS);
}

export function adOnCooldown(save) {
  if (!save.lastAdWatch) return false;
  return (Date.now() - save.lastAdWatch) < AD_COOLDOWN_MS;
}

export function msUntilAdReady(save) {
  if (!save.lastAdWatch) return 0;
  return Math.max(0, AD_COOLDOWN_MS - (Date.now() - save.lastAdWatch));
}

export function fmtMs(ms) {
  const totalS = Math.ceil(ms / 1000);
  const m      = Math.floor(totalS / 60);
  const s      = totalS % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
