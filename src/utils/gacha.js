import { fetchTrainCard, fetchThomasCard, ALL_CATEGORIES, PITY_POOL } from './wikipedia.js';
import { RARITY } from '../constants.js';

function poolForPity(pity) {
  if (pity >= 45) return PITY_POOL.high;
  if (pity >= 22) return PITY_POOL.mid;
  return PITY_POOL.low;
}

/**
 * Draw a pack of 5 cards.
 *
 * Guarantees:
 *  - No card already in the player's collection (ownedIds)
 *  - No duplicates within the pack itself
 *
 * Cards are drawn sequentially so each draw can exclude everything
 * already committed (owned + drawn so far this pack).
 */
export async function drawPack(pity = 0, ownedIds = new Set()) {
  const forceLegendary = sessionStorage.getItem('rg_force_legendary');
  const forceEpic      = sessionStorage.getItem('rg_force_epic');
  const forceThomas    = sessionStorage.getItem('rg_force_thomas');

  if (forceLegendary) sessionStorage.removeItem('rg_force_legendary');
  if (forceEpic)      sessionStorage.removeItem('rg_force_epic');
  if (forceThomas)    sessionStorage.removeItem('rg_force_thomas');

  // Running exclude set — starts with everything owned, grows as each card
  // is drawn so duplicates within a pack are impossible.
  const exclude = new Set(ownedIds);

  // Helper: draw one card sequentially and add it to exclude immediately
  async function drawOne(pool, attempts = 28) {
    const card = await fetchTrainCard(pool, attempts, exclude);
    if (card) {
      exclude.add(card.id);
      if (card.title) exclude.add(card.title.toLowerCase().replace(/\W+/g, '_'));
    }
    return card;
  }

  // ── Cheat overrides ──────────────────────────────────────────────────────────
  if (forceLegendary) {
    const cards = [];
    for (let i = 0; i < 5; i++) {
      const c = await drawOne(PITY_POOL.high);
      if (c) cards.push({ ...c, rarity: 'L' });
    }
    return cards;
  }

  if (forceEpic) {
    const cards = [];
    for (let i = 0; i < 5; i++) {
      const c = await drawOne(PITY_POOL.mid);
      if (c) cards.push({ ...c, rarity: 'E' });
    }
    return cards;
  }

  if (forceThomas) {
    try { sessionStorage.removeItem('rg_seen'); } catch {}

    const cards = [];

    // First card: guaranteed Thomas character
    const thomasCard = await fetchThomasCard(exclude);
    if (thomasCard) {
      exclude.add(thomasCard.id);
      cards.push(thomasCard);
    }

    // Fill remaining 4 slots normally
    for (let i = cards.length; i < 5; i++) {
      const pityOffset = Math.max(0, pity - i);
      const c = await drawOne(poolForPity(pityOffset));
      if (c) cards.push(c);
    }

    // Back-fill if we still short (very rare)
    let extra = 0;
    while (cards.length < 5 && extra < 8) {
      const c = await drawOne(ALL_CATEGORIES, 5);
      if (c) cards.push(c);
      extra++;
    }
    return cards.slice(0, 5);
  }

  // ── Normal draw ──────────────────────────────────────────────────────────────
  const cards = [];

  for (let i = 0; i < 5; i++) {
    const pityOffset = Math.max(0, pity - i);
    const c = await drawOne(poolForPity(pityOffset));
    if (c) cards.push(c);
  }

  // Back-fill if any slot came back null (network failure, exhausted pool, etc.)
  let fill = 0;
  while (cards.length < 5 && fill < 10) {
    const c = await drawOne(ALL_CATEGORIES, 6);
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
