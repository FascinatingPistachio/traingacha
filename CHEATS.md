# Rail Gacha — Dev Console Cheat Commands
# Open browser DevTools (F12) → Console tab, paste and hit Enter.

## ── Give yourself tickets ─────────────────────────────────────────────────
# 999,999 tickets
const s=JSON.parse(localStorage.getItem('railgacha_v4'));s.tickets=999999;localStorage.setItem('railgacha_v4',JSON.stringify(s));location.reload();

# Add 500 tickets (stackable)
const s=JSON.parse(localStorage.getItem('railgacha_v4'));s.tickets+=500;localStorage.setItem('railgacha_v4',JSON.stringify(s));location.reload();

## ── Reset daily bonus so you can claim again now ──────────────────────────
const s=JSON.parse(localStorage.getItem('railgacha_v4'));s.dailyClaimedDate=null;localStorage.setItem('railgacha_v4',JSON.stringify(s));location.reload();

## ── Max out timer charges (collect 3 charges worth of tickets now) ────────
const s=JSON.parse(localStorage.getItem('railgacha_v4'));s.timerCharges=3;s.timerLastCollect=Date.now();localStorage.setItem('railgacha_v4',JSON.stringify(s));location.reload();

## ── Reset ad cooldown so you can watch another ad immediately ─────────────
const s=JSON.parse(localStorage.getItem('railgacha_v4'));s.lastAdWatch=null;localStorage.setItem('railgacha_v4',JSON.stringify(s));location.reload();

## ── Force next pack to contain a Thomas & Friends character ──────────────
# Injects a cheat flag that the gacha system checks for one pack only
sessionStorage.setItem('rg_force_thomas','1');
# Then open a pack — the flag is cleared automatically after use.

## ── Force next pack to be all Legendaries ────────────────────────────────
sessionStorage.setItem('rg_force_legendary','1');
# Open a pack — cleared automatically.

## ── Force next pack to be all Epics ─────────────────────────────────────
sessionStorage.setItem('rg_force_epic','1');

## ── Set pity counter to 49 (next pack near-guaranteed Legendary) ─────────
const s=JSON.parse(localStorage.getItem('railgacha_v4'));s.pity=49;localStorage.setItem('railgacha_v4',JSON.stringify(s));location.reload();

## ── Clear your entire collection (keep tickets) ──────────────────────────
const s=JSON.parse(localStorage.getItem('railgacha_v4'));s.collection={};s.totalPulls=0;localStorage.setItem('railgacha_v4',JSON.stringify(s));location.reload();

## ── Print your current save state to console ─────────────────────────────
console.table(JSON.parse(localStorage.getItem('railgacha_v4')));

## ── Wipe everything and start fresh ──────────────────────────────────────
localStorage.removeItem('railgacha_v4');location.reload();
