/**
 * trainType.js — Detect locomotive type from card title.
 * Used for VFX / SFX selection.
 */

const STEAM_PATTERNS = [
  /steam/i, /GWR/i, /LNER/i, /LMS/i, /SR\b/i, /LBSCR/i, /LNWR/i, /MR\b/i,
  /scotsman/i, /mallard/i, /rocket/i, /duchess/i, /princess/i, /britannia/i,
  /tank engine/i, /saddle.?tank/i, /pannier/i, /prairie/i, /atlantic/i,
  /pacific/i, /mogul/i, /consolidation/i, /mikado/i, /berkshire/i,
  /stirling/i, /\b4-6-2\b/, /\b2-8-0\b/, /\b0-6-0\b/, /\b4-6-0\b/,
  /\b2-6-0\b/, /\b4-4-0\b/, /\b0-4-0\b/, /\b0-6-2\b/, /\b2-4-0\b/,
  /\b4-4-2\b/, /\b2-6-4\b/, /\b2-10-0\b/, /\b4-8-4\b/,
  /fowler/i, /stanier/i, /gresley/i, /churchward/i, /collett/i, /hawksworth/i,
  /big boy/i, /union pacific/i, /pennsylvania.*steam/i, /B&O/i,
  /thomas/i, /gordon/i, /percy.*engine/i, /henry.*engine/i,
  /talyllyn/i, /ffestiniog/i, /narrow gauge/i,
];

const DIESEL_PATTERNS = [
  /diesel/i, /\bclass 08\b/i, /\bclass 2[05]\b/i, /\bclass 3[37]\b/i,
  /\bclass 4[04-9]\b/i, /\bclass 5[5]\b/i, /\bclass 6[06]\b/i,
  /\bclass 7[0]\b/i, /HST/i, /intercity 125/i,
  /\bLMD.*\b/i, /\bEMD\b/i, /GP[0-9]/i, /SD[0-9]/i,
  /\bDB\b.*class/i, /\bNS\b.*diesel/i,
];

const ELECTRIC_PATTERNS = [
  /electric/i, /shinkansen/i, /TGV/i, /ICE/i, /\bETR\b/i, /eurostar/i,
  /pendolino/i, /\bAVE\b/i, /thalys/i, /AGV/i, /frecciarossa/i,
  /KTX/i, /CRH/i, /\bEMU\b/i, /\bALX\b/i, /class 3[0-3][0-9]\b/i,
  /class 37[0-9]\b/i, /class 4[0-4][0-9]\b/i,
  /metro/i, /subway/i, /\btram\b/i, /\btrolley\b/i, /underground/i,
];

const MAGLEV_PATTERNS = [
  /maglev/i, /SCMaglev/i, /transrapid/i, /linimo/i, /hyperloop/i,
  /levitation/i, /\bMLX\b/i,
];

const HIGHSPEED_PATTERNS = [
  /shinkansen/i, /TGV/i, /ICE/i, /eurostar/i, /pendolino/i, /\bAVE\b/i,
  /thalys/i, /frecciarossa/i, /KTX/i, /CRH\b/i, /\bHS2\b/i,
  /intercity 225/i, /\bAPT\b/i, /\bAGV\b/i, /\bETR 500\b/i, /\bETR 300\b/i,
];

/**
 * Returns one of: 'steam' | 'diesel' | 'electric' | 'maglev' | 'unknown'
 */
export function detectTrainType(title = '') {
  if (MAGLEV_PATTERNS.some(p => p.test(title)))   return 'maglev';
  if (STEAM_PATTERNS.some(p => p.test(title)))     return 'steam';
  if (DIESEL_PATTERNS.some(p => p.test(title)))    return 'diesel';
  if (ELECTRIC_PATTERNS.some(p => p.test(title)))  return 'electric';
  return 'unknown';
}

export function isHighSpeed(title = '') {
  return HIGHSPEED_PATTERNS.some(p => p.test(title));
}

/** Returns an emoji label for the train type */
export function trainTypeEmoji(title = '') {
  const t = detectTrainType(title);
  if (t === 'steam')   return '♨️ STEAM';
  if (t === 'diesel')  return '🛢️ DIESEL';
  if (t === 'electric') return '⚡ ELECTRIC';
  if (t === 'maglev')  return '🧲 MAGLEV';
  if (isHighSpeed(title)) return '🚄 HIGH-SPEED';
  return '🚂 RAIL';
}
