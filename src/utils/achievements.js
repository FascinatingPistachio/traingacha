// Achievement system — awarded based on save state.

export const ACHIEVEMENTS = [
  // Pack opening milestones
  { id:'first_pack',      icon:'📦', title:'First Pack',         desc:'Open your very first pack',                      check:s => (s.totalPulls??0) >= 5 },
  { id:'ten_packs',       icon:'🎴', title:'Ten Packs',          desc:'Open 10 packs',                                  check:s => (s.totalPulls??0) >= 50 },
  { id:'fifty_packs',     icon:'🚄', title:'Express Service',    desc:'Open 50 packs',                                  check:s => (s.totalPulls??0) >= 250 },
  { id:'hundred_packs',   icon:'🎰', title:'Centurion',          desc:'Open 100 packs',                                 check:s => (s.totalPulls??0) >= 500 },
  // Rarity milestones
  { id:'first_rare',      icon:'💎', title:'Rare Find',          desc:'Pull your first Rare card',                      check:s => Object.values(s.collection).some(c=>c.rarity==='R') },
  { id:'first_epic',      icon:'✨', title:'Epic Pull',          desc:'Pull your first Epic card',                      check:s => Object.values(s.collection).some(c=>c.rarity==='E') },
  { id:'first_legend',    icon:'⭐', title:'Legendary!',         desc:'Pull your first Legendary card',                 check:s => Object.values(s.collection).some(c=>c.rarity==='L') },
  { id:'first_mythic',    icon:'✦',  title:'Ghost Train',        desc:'Pull an ultra-rare Mythic card',                 check:s => Object.values(s.collection).some(c=>c.rarity==='M') },
  // Thomas characters
  { id:'first_thomas',    icon:'🚂', title:'Thomas Fan',         desc:'Pull a card with a Thomas & Friends character',  check:s => Object.values(s.collection).some(c=>c.character?.show==='Thomas & Friends') },
  { id:'five_thomas',     icon:'🟦', title:'Sodor Collector',    desc:'Pull 5 different Thomas character cards',        check:s => new Set(Object.values(s.collection).filter(c=>c.character?.show==='Thomas & Friends').map(c=>c.character?.character)).size >= 5 },
  { id:'ten_thomas',      icon:'🏝️', title:'Island of Sodor',   desc:'Pull 10 different Thomas character cards',       check:s => new Set(Object.values(s.collection).filter(c=>c.character?.show==='Thomas & Friends').map(c=>c.character?.character)).size >= 10 },
  // Collection milestones
  { id:'ten_unique',      icon:'📋', title:'Collector',          desc:'Collect 10 unique cards',                        check:s => Object.keys(s.collection).length >= 10 },
  { id:'fifty_unique',    icon:'🗂️', title:'Archivist',          desc:'Collect 50 unique cards',                        check:s => Object.keys(s.collection).length >= 50 },
  { id:'hundred_unique',  icon:'📚', title:'Curator',            desc:'Collect 100 unique cards',                       check:s => Object.keys(s.collection).length >= 100 },
  // Daily / streak
  { id:'streak_3',        icon:'🔥', title:'On a Roll',          desc:'Log in 3 days in a row',                         check:s => (s.loginStreak??0) >= 3 },
  { id:'streak_7',        icon:'🔥', title:'Weekly Regular',     desc:'Log in 7 days in a row',                         check:s => (s.loginStreak??0) >= 7 },
  { id:'streak_30',       icon:'🔥', title:'Monthly Pass',       desc:'Log in 30 days in a row',                        check:s => (s.loginStreak??0) >= 30 },
  { id:'daily_5',         icon:'📅', title:'Faithful',           desc:'Claim the daily bonus 5 times',                  check:s => (s.totalDailies??0) >= 5 },
  { id:'daily_30',        icon:'🗓️', title:'Regular Commuter',   desc:'Claim the daily bonus 30 times',                 check:s => (s.totalDailies??0) >= 30 },
  // Favourites
  { id:'fav_5',           icon:'♥',  title:'Favourites',         desc:'Mark 5 cards as favourites',                     check:s => (s.favourites?.length??0) >= 5 },
  { id:'fav_20',          icon:'💖', title:'Beloved Collection', desc:'Mark 20 cards as favourites',                    check:s => (s.favourites?.length??0) >= 20 },
  // Regional
  { id:'uk_collector',    icon:'🇬🇧', title:'British Railways',  desc:'Pull 5 UK locomotive cards',                     check:s => Object.values(s.collection).filter(c=>c.extract&&/british|england|london|scotland|wales|uk/i.test(c.extract)).length >= 5 },
  { id:'japan_collector', icon:'🇯🇵', title:'Shinkansen Dreams', desc:'Pull 5 Japanese locomotive cards',               check:s => Object.values(s.collection).filter(c=>c.extract&&/japan(?:ese)?|shinkansen|jnr|jr\s/i.test(c.extract)).length >= 5 },
  { id:'steam_collector', icon:'♨️', title:'Steam Enthusiast',   desc:'Pull 10 steam locomotive cards',                 check:s => Object.values(s.collection).filter(c=>c.extract&&/steam/i.test(c.extract)).length >= 10 },
  // Special
  { id:'mythic_3',        icon:'👻', title:'Ghost Hunter',       desc:'Pull 3 Mythic cards',                            check:s => Object.values(s.collection).filter(c=>c.rarity==='M').length >= 3 },
  { id:'legend_5',        icon:'🌟', title:'Hall of Fame',       desc:'Pull 5 Legendary cards',                         check:s => Object.values(s.collection).filter(c=>c.rarity==='L').length >= 5 },
];

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

export function updateLoginStreak(save) {
  const today     = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (save.lastLoginDate === today) return null;
  const streak = save.lastLoginDate === yesterday
    ? (save.loginStreak ?? 0) + 1
    : 1;
  return { lastLoginDate: today, loginStreak: streak };
}
