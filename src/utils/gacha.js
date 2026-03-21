import { fetchTrainCard, fetchThomasCard, ALL_CATEGORIES, PITY_POOL } from './wikipedia.js';
import { RARITY, PITY } from '../constants.js';

// ── Three-tier pity system ───────────────────────────────────────────────────
// pityState = { rare: N, epic: N, legend: N }
// Each counter increments every pull and resets when that tier (or better) drops.

function applyPityOverride(rarity, pityState) {
  const { rare = 0, epic = 0, legend = 0 } = pityState;

  // Legendary hard pity
  if (legend >= PITY.LEGEND_HARD) return 'L';
  // Legendary soft pity: linearly increasing probability 40–50
  if (legend >= PITY.LEGEND_SOFT) {
    const softProgress = (legend - PITY.LEGEND_SOFT) / (PITY.LEGEND_HARD - PITY.LEGEND_SOFT);
    if (Math.random() < softProgress * 0.85) return 'L';
  }

  // Epic hard pity
  if (epic >= PITY.EPIC_HARD) return RARITY[rarity].rank >= 2 ? rarity : 'E';
  // Epic soft pity
  if (epic >= PITY.EPIC_SOFT) {
    const softProgress = (epic - PITY.EPIC_SOFT) / (PITY.EPIC_HARD - PITY.EPIC_SOFT);
    if (Math.random() < softProgress * 0.7 && RARITY[rarity].rank < 2) return 'E';
  }

  // Rare hard pity
  if (rare >= PITY.RARE_HARD && RARITY[rarity].rank < 1) return 'R';

  return rarity;
}

function updatePityState(pityState, rarity) {
  const rank = RARITY[rarity]?.rank ?? 0;
  return {
    rare:   rank >= 1 ? 0 : (pityState.rare   ?? 0) + 1,
    epic:   rank >= 2 ? 0 : (pityState.epic   ?? 0) + 1,
    legend: rank >= 3 ? 0 : (pityState.legend ?? 0) + 1,
  };
}

function poolForPity(legend) {
  if (legend >= 40) return PITY_POOL.high;
  if (legend >= 20) return PITY_POOL.mid;
  return PITY_POOL.low;
}

/**
 * Draw a pack of 5 unique cards.
 *
 * Guarantees:
 *  - No card already in the player's collection (ownedIds)
 *  - No duplicates within the pack
 *  - 3-tier pity system applied
 *
 * Returns { cards, newPityState }
 */
export async function drawPack(pity = 0, ownedIds = new Set(), pityState = {}) {
  const forceLegendary = sessionStorage.getItem('rg_force_legendary');
  const forceEpic      = sessionStorage.getItem('rg_force_epic');
  const forceThomas    = sessionStorage.getItem('rg_force_thomas');

  if (forceLegendary) sessionStorage.removeItem('rg_force_legendary');
  if (forceEpic)      sessionStorage.removeItem('rg_force_epic');
  if (forceThomas)    sessionStorage.removeItem('rg_force_thomas');

  // Running exclude set — grows as each card is committed
  const exclude = new Set(ownedIds);
  let currentPity = { ...pityState };

  const drawOne = async (pool, attempts = 28) => {
    const card = await fetchTrainCard(pool, attempts, exclude);
    if (card) {
      // Apply pity override to rarity
      const overriddenRarity = applyPityOverride(card.rarity, currentPity);
      const finalCard = overriddenRarity !== card.rarity
        ? { ...card, rarity: overriddenRarity }
        : card;
      currentPity = updatePityState(currentPity, finalCard.rarity);
      exclude.add(finalCard.id);
      if (finalCard.title) exclude.add(finalCard.title.toLowerCase().replace(/\W+/g,'_'));
      return finalCard;
    }
    return null;
  };

  // ── Cheat overrides ────────────────────────────────────────────────────────
  if (forceLegendary) {
    const cards = [];
    for (let i = 0; i < 5; i++) {
      const c = await drawOne(PITY_POOL.high);
      if (c) cards.push({ ...c, rarity:'L' });
    }
    return { cards, newPityState: { rare:0, epic:0, legend:0 } };
  }
  if (forceEpic) {
    const cards = [];
    for (let i = 0; i < 5; i++) {
      const c = await drawOne(PITY_POOL.mid);
      if (c) cards.push({ ...c, rarity:'E' });
    }
    return { cards, newPityState: { rare:0, epic:0, legend: currentPity.legend } };
  }
  if (forceThomas) {
    try { sessionStorage.removeItem('rg_seen'); } catch {}
    const cards = [];
    const thomasCard = await fetchThomasCard(exclude);
    if (thomasCard) {
      const final = { ...thomasCard, rarity: applyPityOverride(thomasCard.rarity, currentPity) };
      currentPity = updatePityState(currentPity, final.rarity);
      exclude.add(final.id);
      cards.push(final);
    }
    for (let i = cards.length; i < 5; i++) {
      const c = await drawOne(poolForPity(pity - i));
      if (c) cards.push(c);
    }
    let extra = 0;
    while (cards.length < 5 && extra < 8) {
      const c = await drawOne(ALL_CATEGORIES, 5);
      if (c) cards.push(c);
      extra++;
    }
    return { cards: cards.slice(0,5), newPityState: currentPity };
  }

  // ── Normal draw ────────────────────────────────────────────────────────────
  const cards = [];
  for (let i = 0; i < 5; i++) {
    const c = await drawOne(poolForPity(pity - i));
    if (c) cards.push(c);
  }
  let fill = 0;
  while (cards.length < 5 && fill < 10) {
    const c = await drawOne(ALL_CATEGORIES, 6);
    if (c) cards.push(c);
    fill++;
  }
  return { cards: cards.slice(0,5), newPityState: currentPity };
}

export function updatePity(currentPity, cards) {
  const bestRank = Math.max(...cards.map(c => RARITY[c.rarity]?.rank ?? 0));
  if (bestRank >= 3) return 0;
  if (bestRank >= 2) return Math.max(0, currentPity - 15);
  return currentPity + 5;
}
