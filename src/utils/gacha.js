import { fetchTrainCard, ALL_CATEGORIES, PITY_POOL } from './wikipedia.js';
import { RARITY } from '../constants.js';

// ---------------------------------------------------------------------------
// Selects the category pool for a single draw based on current pity counter.
// Higher pity → biased toward famous categories (better chance of high rarity).
// ---------------------------------------------------------------------------
function poolForPity(pity) {
  if (pity >= 45) return PITY_POOL.high;
  if (pity >= 22) return PITY_POOL.mid;
  return PITY_POOL.low;
}

// ---------------------------------------------------------------------------
// Draw a full pack of 5 cards.
// All 5 fetches run in parallel. Each draw gets slightly less pity than the
// previous so the first card benefits most from accumulated pity.
// ---------------------------------------------------------------------------
export async function drawPack(pity = 0) {
  const pitiesPerSlot = [0, 1, 2, 3, 4].map((offset) =>
    Math.max(0, pity - offset)
  );

  const results = await Promise.all(
    pitiesPerSlot.map((p) => fetchTrainCard(poolForPity(p)))
  );

  const cards = results.filter(Boolean);

  // Back-fill any null results (fetch failures) from the general pool
  let fillAttempts = 0;
  while (cards.length < 5 && fillAttempts < 10) {
    const fill = await fetchTrainCard(ALL_CATEGORIES, 6);
    if (fill) cards.push(fill);
    fillAttempts++;
  }

  return cards.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Calculate new pity counter after a pack.
// Legendary resets to 0. Epic halves the counter. Otherwise it grows by 5.
// ---------------------------------------------------------------------------
export function updatePity(currentPity, cards) {
  const bestRank = Math.max(...cards.map((c) => RARITY[c.rarity]?.rank ?? 0));
  if (bestRank >= 3) return 0;          // Legendary
  if (bestRank >= 2) return Math.max(0, currentPity - 15); // Epic
  return currentPity + 5;
}
