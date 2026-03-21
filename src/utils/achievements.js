// Achievement system — awarded based on save state.
// Each achievement has an id, title, description, icon, and a check(save) function.

export const ACHIEVEMENTS = [
  { id:'first_pack',    icon:'📦', title:'First Pack',        desc:'Open your very first pack',                    check:s => (s.totalPulls??0) >= 5 },
  { id:'ten_packs',     icon:'🎴', title:'Ten Packs',         desc:'Open 10 packs',                                check:s => (s.totalPulls??0) >= 50 },
  { id:'hundred_packs', icon:'🎰', title:'Centurion',         desc:'Open 100 packs',                               check:s => (s.totalPulls??0) >= 500 },
  { id:'first_rare',    icon:'💎', title:'Rare Find',         desc:'Pull your first Rare card',                    check:s => Object.values(s.collection).some(c=>c.rarity==='R') },
  { id:'first_epic',    icon:'✨', title:'Epic Pull',         desc:'Pull your first Epic card',                    check:s => Object.values(s.collection).some(c=>c.rarity==='E') },
  { id:'first_legend',  icon:'⭐', title:'Legendary!',        desc:'Pull your first Legendary card',               check:s => Object.values(s.collection).some(c=>c.rarity==='L') },
  { id:'first_mythic',  icon:'✦',  title:'Ghost Train',       desc:'Pull an ultra-rare Mythic card',               check:s => Object.values(s.collection).some(c=>c.rarity==='M') },
  { id:'first_thomas',  icon:'🚂', title:'Thomas Fan',        desc:'Pull a card with a Thomas & Friends character', check:s => Object.values(s.collection).some(c=>c.character?.show==='Thomas & Friends') },
  { id:'ten_unique',    icon:'📋', title:'Collector',         desc:'Collect 10 unique cards',                      check:s => Object.keys(s.collection).length >= 10 },
  { id:'fifty_unique',  icon:'🗂️', title:'Archivist',         desc:'Collect 50 unique cards',                      check:s => Object.keys(s.collection).length >= 50 },
  { id:'streak_3',      icon:'🔥', title:'On a Roll',         desc:'Log in 3 days in a row',                       check:s => (s.loginStreak??0) >= 3 },
  { id:'streak_7',      icon:'🔥', title:'Weekly Regular',    desc:'Log in 7 days in a row',                       check:s => (s.loginStreak??0) >= 7 },
  { id:'daily_5',       icon:'📅', title:'Faithful',          desc:'Claim the daily bonus 5 times',                check:s => (s.totalDailies??0) >= 5 },
  { id:'fav_5',         icon:'♥',  title:'Favourites',        desc:'Mark 5 cards as favourites',                   check:s => (s.favourites?.length??0) >= 5 },
  { id:'uk_collector',  icon:'🇬🇧', title:'British Railways', desc:'Pull 5 UK locomotive cards',                    check:s => Object.values(s.collection).filter(c=>c.extract&&/british|england|london|scotland|wales|UK/i.test(c.extract)).length >= 5 },
];

/**
 * Check which achievements should be newly unlocked.
 * Returns an array of newly earned achievement objects.
 */
export function checkNewAchievements(save) {
  const earned  = new Set(save.achievements ?? []);
  const newOnes = [];
  for (const ach of ACHIEVEMENTS) {
    if (!earned.has(ach.id) && ach.check(save)) {
      newOnes.push(ach);
    }
  }
  return newOnes;
}

/**
 * Update login streak: called on app load.
 * Returns a patch object or null if no change.
 */
export function updateLoginStreak(save) {
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (save.lastLoginDate === today) return null; // already counted today

  const streak = save.lastLoginDate === yesterday
    ? (save.loginStreak ?? 0) + 1
    : 1; // streak broken

  return { lastLoginDate: today, loginStreak: streak };
}
