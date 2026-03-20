import { fetchTrainCard, fetchThomasCard, ALL_CATEGORIES, PITY_POOL } from './wikipedia.js';
import { RARITY } from '../constants.js';

function poolForPity(pity) {
  if (pity >= 45) return PITY_POOL.high;
  if (pity >= 22) return PITY_POOL.mid;
  return PITY_POOL.low;
}

export async function drawPack(pity = 0) {
  const forceLegendary = sessionStorage.getItem('rg_force_legendary');
  const forceEpic      = sessionStorage.getItem('rg_force_epic');
  const forceThomas    = sessionStorage.getItem('rg_force_thomas');

  // Clear cheat flags immediately
  if (forceLegendary) sessionStorage.removeItem('rg_force_legendary');
  if (forceEpic)      sessionStorage.removeItem('rg_force_epic');
  if (forceThomas)    sessionStorage.removeItem('rg_force_thomas');

  let slots = [0,1,2,3,4].map(offset => Math.max(0, pity - offset));

  // ── Cheat overrides ──────────────────────────────────────────────────────
  if (forceLegendary) {
    const cards = await Promise.all(slots.map(() => fetchTrainCard(PITY_POOL.high)));
    const result = cards.filter(Boolean);
    // Force all to legendary
    return result.map(c => ({ ...c, rarity: 'L' })).slice(0, 5);
  }

  if (forceEpic) {
    const cards = await Promise.all(slots.map(() => fetchTrainCard(PITY_POOL.mid)));
    return cards.filter(Boolean).map(c => ({ ...c, rarity: 'E' })).slice(0, 5);
  }

  if (forceThomas) {
    // First card guaranteed to be a Thomas character, rest normal
    const [thomasCard, ...rest] = await Promise.all([
      fetchThomasCard(),
      ...slots.slice(1).map(p => fetchTrainCard(poolForPity(p))),
    ]);
    const cards = [thomasCard, ...rest].filter(Boolean).slice(0, 5);
    // Back-fill if needed
    let extra = 0;
    while (cards.length < 5 && extra < 8) {
      const c = await fetchTrainCard(ALL_CATEGORIES, 5);
      if (c) cards.push(c);
      extra++;
    }
    return cards.slice(0, 5);
  }

  // ── Normal draw ──────────────────────────────────────────────────────────
  const results = await Promise.all(
    slots.map(p => fetchTrainCard(poolForPity(p)))
  );
  const cards = results.filter(Boolean);

  let fill = 0;
  while (cards.length < 5 && fill < 10) {
    const c = await fetchTrainCard(ALL_CATEGORIES, 6);
    if (c) cards.push(c);
    fill++;
  }
  return cards.slice(0, 5);
}

export function updatePity(currentPity, cards) {
  const bestRank = Math.max(...cards.map(c => RARITY[c.rarity]?.rank ?? 0));
  if (bestRank >= 3) return 0;
  if (bestRank >= 2) return Math.max(0, currentPity - 15);
  return currentPity + 5;
}
