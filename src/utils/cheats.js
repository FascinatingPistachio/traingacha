/**
 * cheats.js — installs a friendly `rg` cheat object on window.
 *
 * Instead of pasting raw sessionStorage calls that return "undefined",
 * all cheats now respond with a styled console message confirming what happened.
 *
 * Usage in browser console:
 *   rg.thomas()       — force next pack to have a Thomas character
 *   rg.legendary()    — force next pack to be all Legendaries
 *   rg.epic()         — force next pack to be all Epics
 *   rg.tickets(500)   — add tickets
 *   rg.maxtickets()   — set tickets to 999,999
 *   rg.daily()        — reset daily bonus so you can claim again
 *   rg.pity(49)       — set pity counter
 *   rg.clearads()     — reset ad cooldown
 *   rg.clearcollection() — wipe collection (keeps tickets)
 *   rg.save()         — print current save state
 *   rg.reset()        — wipe everything and reload
 *   rg.help()         — list all commands
 */

const SAVE_KEY = 'railgacha_v4';

const S  = 'color:#c9a833;font-weight:bold;font-size:13px';   // gold
const E  = 'color:#b57bee;font-weight:bold;font-size:13px';   // purple
const G  = 'color:#4caf50;font-weight:bold;font-size:13px';   // green
const R  = 'color:#ef5350;font-weight:bold;font-size:13px';   // red

function readSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; }
}
function writeSave(s) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(s));
}

const rg = {
  thomas() {
    sessionStorage.setItem('rg_force_thomas', '1');
    console.log('%c🚂 Next pack guaranteed to include a Thomas & Friends character. Open a pack!', S);
  },

  legendary() {
    sessionStorage.setItem('rg_force_legendary', '1');
    console.log('%c⭐ Next pack will be ALL LEGENDARIES. Open a pack!', S);
  },

  epic() {
    sessionStorage.setItem('rg_force_epic', '1');
    console.log('%c✨ Next pack will be ALL EPICS. Open a pack!', E);
  },

  tickets(amount = 500) {
    const s = readSave();
    if (!s) { console.error('%c✗ No save found. Have you logged in?', R); return; }
    const before = s.tickets;
    s.tickets += amount;
    writeSave(s);
    console.log(`%c🎫 Added ${amount} tickets. ${before} → ${s.tickets}. Reloading…`, G);
    setTimeout(() => location.reload(), 600);
  },

  maxtickets() {
    const s = readSave();
    if (!s) { console.error('%c✗ No save found. Have you logged in?', R); return; }
    s.tickets = 999999;
    writeSave(s);
    console.log('%c🎫🎫🎫 Tickets set to 999,999. Reloading…', G);
    setTimeout(() => location.reload(), 600);
  },

  daily() {
    const s = readSave();
    if (!s) { console.error('%c✗ No save found.', R); return; }
    s.dailyClaimedDate = null;
    writeSave(s);
    console.log('%c📅 Daily bonus reset — go claim it! Reloading…', G);
    setTimeout(() => location.reload(), 600);
  },

  pity(value = 49) {
    const s = readSave();
    if (!s) { console.error('%c✗ No save found.', R); return; }
    s.pity = value;
    writeSave(s);
    console.log(`%c🎰 Pity set to ${value}. Reloading…`, E);
    setTimeout(() => location.reload(), 600);
  },

  clearads() {
    const s = readSave();
    if (!s) { console.error('%c✗ No save found.', R); return; }
    s.lastAdWatch = null;
    writeSave(s);
    console.log('%c📺 Ad cooldown cleared. Reloading…', G);
    setTimeout(() => location.reload(), 600);
  },

  clearcollection() {
    const s = readSave();
    if (!s) { console.error('%c✗ No save found.', R); return; }
    const count = Object.keys(s.collection ?? {}).length;
    s.collection = {};
    s.totalPulls = 0;
    writeSave(s);
    console.log(`%c🗑️ Cleared ${count} cards from collection. Reloading…`, R);
    setTimeout(() => location.reload(), 600);
  },

  save() {
    const s = readSave();
    if (!s) { console.error('%c✗ No save found.', R); return; }
    console.log('%c📋 Current save state:', S);
    console.table({
      username:    s.username,
      tickets:     s.tickets,
      pity:        s.pity ?? 0,
      totalPulls:  s.totalPulls ?? 0,
      collection:  Object.keys(s.collection ?? {}).length + ' cards',
      favourites:  (s.favourites ?? []).length + ' cards',
      achievements:(s.achievements ?? []).length + ' unlocked',
      loginStreak: s.loginStreak ?? 0,
    });
  },

  reset() {
    if (!confirm('Wipe ALL Rail Gacha data and start fresh?')) {
      console.log('%c↩ Reset cancelled.', S);
      return;
    }
    localStorage.removeItem(SAVE_KEY);
    console.log('%c💥 Save wiped. Reloading…', R);
    setTimeout(() => location.reload(), 600);
  },

  help() {
    console.log(
      '%cRail Gacha Cheats\n' +
      '─────────────────────────────────────────────\n' +
      '  rg.thomas()          Force a Thomas character next pack\n' +
      '  rg.legendary()       Force all Legendaries next pack\n' +
      '  rg.epic()            Force all Epics next pack\n' +
      '  rg.tickets(n)        Add n tickets (default 500)\n' +
      '  rg.maxtickets()      Set tickets to 999,999\n' +
      '  rg.daily()           Reset daily bonus cooldown\n' +
      '  rg.pity(n)           Set pity counter (default 49)\n' +
      '  rg.clearads()        Reset ad cooldown\n' +
      '  rg.clearcollection() Wipe collection (keeps tickets)\n' +
      '  rg.save()            Print save state to console\n' +
      '  rg.reset()           Wipe everything and start fresh\n' +
      '  rg.help()            Show this message',
      S
    );
  },
};

// Install on window so it's accessible from the browser console
if (typeof window !== 'undefined') {
  window.rg = rg;
  console.log('%c🚂 Rail Gacha cheats loaded — type rg.help() for commands', 'color:#c9a833;font-size:11px');
}

export default rg;
