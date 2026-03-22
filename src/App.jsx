import { useState, useEffect, useCallback } from 'react';

import LoginScreen      from './components/LoginScreen.jsx';
import HomeScreen       from './components/HomeScreen.jsx';
import ShopScreen       from './components/ShopScreen.jsx';
import OpeningScreen    from './components/OpeningScreen.jsx';
import CollectionScreen from './components/CollectionScreen.jsx';
import AccountScreen    from './components/AccountScreen.jsx';
import BattleScreen     from './components/BattleScreen.jsx';
import BottomNav        from './components/BottomNav.jsx';
import Toast            from './components/Toast.jsx';
import Footer           from './components/Footer.jsx';
import AchievementToast from './components/AchievementToast.jsx';
import PWAInstallBanner from './components/PWAInstallBanner.jsx';
import DesktopLanding   from './components/DesktopLanding.jsx';

import { drawPack, updatePity }                              from './utils/gacha.js';
import { loadSave, writeSave, deleteSave, makeFreshSave }    from './utils/storage.js';
import { preloadCardImages }                                 from './utils/preload.js';
import { collectTimerCharges }                               from './utils/tickets.js';
import { toggleMute, isMuted, soundClick, soundDailyClaim }  from './utils/sounds.js';
import { prewarmFandomCache }                                from './utils/fandom.js';
import { checkNewAchievements, updateLoginStreak }           from './utils/achievements.js';
import { generateCardStats }                                 from './utils/stats.js';
import { PACK_COST, DAILY_BONUS, TIMER_TICKETS, AD_TICKETS } from './constants.js';

// ── Desktop detection ────────────────────────────────────────────────────────
// True desktop = large screen + fine pointer (mouse). Tablets with stylus excluded.
// We use CSS classes (mobile-only / desktop-only) so it works without JS flash.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    const fine   = window.matchMedia('(pointer: fine)').matches;
    const hover  = window.matchMedia('(hover: hover)').matches;
    const wide   = window.innerWidth >= 769;
    return fine && hover && wide;
  });

  useEffect(() => {
    const mq1 = window.matchMedia('(pointer: fine)');
    const mq2 = window.matchMedia('(hover: hover)');
    const check = () => {
      setIsDesktop(mq1.matches && mq2.matches && window.innerWidth >= 769);
    };
    mq1.addEventListener('change', check);
    mq2.addEventListener('change', check);
    window.addEventListener('resize', check);
    return () => {
      mq1.removeEventListener('change', check);
      mq2.removeEventListener('change', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return isDesktop;
}

// ── Migrate old saves ────────────────────────────────────────────────────────
function migrateCard(card) {
  if (card.stats) return card;
  return { ...card, stats: generateCardStats(card.title ?? card.id ?? '', card.views ?? 0, card.rarity ?? 'C') };
}

// ── Top bar ──────────────────────────────────────────────────────────────────
function TopBar({ tickets }) {
  const [muted, setMuted] = useState(isMuted());
  const handleMute = () => { const n = toggleMute(); setMuted(n); if (!n) soundClick(); };
  return (
    <div style={{
      flexShrink: 0,
      background: 'rgba(4,10,20,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(201,168,51,0.1)',
      padding: '10px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      // Extend into status bar area
      paddingTop: 'max(10px, calc(env(safe-area-inset-top, 0px) + 10px))',
    }}>
      <span style={{ color:'#c9a833', fontFamily:'monospace', fontSize:12, fontWeight:700, letterSpacing:'.15em' }}>
        🚂 RAIL GACHA
      </span>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ color:'#c9a833', fontFamily:'monospace', fontSize:12, fontWeight:700 }}>
          🎫 {tickets}
        </span>
        <button
          onClick={handleMute}
          title={muted ? 'Unmute' : 'Mute'}
          style={{
            background: 'rgba(201,168,51,0.08)',
            border: '1px solid rgba(201,168,51,0.18)',
            borderRadius: 7, padding: '5px 9px', cursor: 'pointer',
            color: muted ? 'rgba(201,168,51,0.3)' : 'rgba(201,168,51,0.75)',
            fontSize: 14, lineHeight: 1, transition: 'color 0.2s, background 0.2s',
            minWidth: 36, minHeight: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#06101c',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{ fontSize: 42, animation: 'packBob 1s ease-in-out infinite' }}>🚂</div>
      <div style={{ color: '#c9a833', fontFamily: 'monospace', fontSize: 11,
        letterSpacing: '.2em', animation: 'pulse 1.5s ease-in-out infinite' }}>
        LOADING…
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const isDesktop = useIsDesktop();

  const [save,         setSave]         = useState(null);
  const [screen,       setScreen]       = useState('loading');
  const [cardsPromise, setCardsPromise] = useState(null);
  const [busy,         setBusy]         = useState(false);
  const [toast,        setToast]        = useState(null);
  const [achQueue,     setAchQueue]     = useState([]);

  useEffect(() => {
    prewarmFandomCache();
    loadSave().then(data => {
      if (data) {
        const migratedCollection = Object.fromEntries(
          Object.entries(data.collection ?? {}).map(([id, c]) => [id, migrateCard(c)])
        );
        let merged = {
          ...data,
          collection:   migratedCollection,
          favourites:   data.favourites   ?? [],
          achievements: data.achievements ?? [],
          totalDailies: data.totalDailies ?? 0,
          loginStreak:  data.loginStreak  ?? 0,
          pityState:    data.pityState    ?? { rare:0, epic:0, legend: data.pity ?? 0 },
          battleWins:   data.battleWins   ?? 0,
          raidWins:     data.raidWins     ?? 0,
        };
        const timerPatch  = collectTimerCharges(merged);
        const streakPatch = updateLoginStreak(merged);
        if (timerPatch)  merged = { ...merged, ...timerPatch };
        if (streakPatch) merged = { ...merged, ...streakPatch };
        if (timerPatch || streakPatch) writeSave(merged);
        setSave(merged);
        setScreen('home');
      } else {
        setScreen('login');
      }
    });
  }, []); // eslint-disable-line

  const notify = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const updateSave = useCallback((patch) => {
    setSave(prev => { const next = { ...prev, ...patch }; writeSave(next); return next; });
  }, []);

  const triggerAchievements = useCallback((snap) => {
    const newOnes = checkNewAchievements(snap);
    if (!newOnes.length) return;
    const earned = new Set(snap.achievements ?? []);
    newOnes.forEach(a => earned.add(a.id));
    const next = { ...snap, achievements: [...earned] };
    writeSave(next); setSave(next);
    setAchQueue(q => [...q, ...newOnes]);
  }, []);

  const handleLogin = (username, imported = null) => {
    const now   = Date.now();
    const today = new Date().toISOString().split('T')[0];
    const data  = imported ?? {
      ...makeFreshSave(username),
      timerCharges:0, timerLastCollect:now, lastAdWatch:null,
      favourites:[], achievements:[],
      loginStreak:1, lastLoginDate:today, totalDailies:0,
      pityState:{ rare:0, epic:0, legend:0 },
      battleWins:0, raidWins:0,
    };
    if (!data.favourites)   data.favourites   = [];
    if (!data.achievements) data.achievements = [];
    if (!data.pityState)    data.pityState    = { rare:0, epic:0, legend: data.pity ?? 0 };
    writeSave(data); setSave(data); setScreen('home');
    notify(imported ? `Welcome back, ${data.username}!` : `All aboard, ${username}! ${data.tickets} starter tickets.`, 'success');
  };

  const handleDaily = () => {
    const today = new Date().toISOString().split('T')[0];
    if (save.dailyClaimedDate === today) { notify('Already claimed today!', 'warn'); return; }
    soundDailyClaim();
    setSave(prev => {
      const next = { ...prev, tickets: prev.tickets + DAILY_BONUS, dailyClaimedDate: today, totalDailies: (prev.totalDailies ?? 0) + 1 };
      writeSave(next);
      setTimeout(() => triggerAchievements(next), 100);
      return next;
    });
    notify(`+${DAILY_BONUS} tickets claimed!`, 'success');
  };

  const handlePack = () => {
    if (save.tickets < PACK_COST) { notify('Not enough tickets!', 'error'); return; }
    if (busy) return;
    setBusy(true);
    const ownedIds = new Set(Object.keys(save.collection ?? {}));
    const promise  = drawPack(save.pity ?? 0, ownedIds, save.pityState ?? {}).then(async ({ cards, newPityState }) => {
      if (!cards?.length) return { cards: [], newPityState };
      preloadCardImages(cards).catch(() => {});
      updateSave({ pityState: newPityState, pity: updatePity(save.pity ?? 0, cards) });
      return { cards, newPityState };
    });
    setCardsPromise(promise);
    updateSave({ tickets: save.tickets - PACK_COST });
    setScreen('opening');
    setBusy(false);
  };

  const handleOpeningDone = async () => {
    if (cardsPromise) {
      try {
        const result = await cardsPromise;
        const cards  = result?.cards ?? result ?? [];
        if (cards?.length) {
          setSave(prev => {
            const collection = { ...prev.collection };
            for (const card of cards) {
              if (collection[card.id]) {
                collection[card.id] = { ...collection[card.id], count:(collection[card.id].count??1)+1 };
              } else {
                collection[card.id] = { ...card, count:1, addedAt:new Date().toISOString() };
              }
            }
            const next = { ...prev, collection, totalPulls: (prev.totalPulls ?? 0) + cards.length };
            writeSave(next);
            setTimeout(() => triggerAchievements(next), 400);
            return next;
          });
        }
      } catch { /* network failed */ }
    }
    setCardsPromise(null);
    setScreen('shop');
  };

  const handleToggleFav = (id) => {
    setSave(prev => {
      const favs = new Set(prev.favourites ?? []);
      favs.has(id) ? favs.delete(id) : favs.add(id);
      const next = { ...prev, favourites: [...favs] };
      writeSave(next);
      setTimeout(() => triggerAchievements(next), 100);
      return next;
    });
  };

  const handleClaimCharges = () => {
    const charges = save.timerCharges ?? 0;
    if (!charges) return;
    const gained = charges * TIMER_TICKETS;
    updateSave({ tickets: save.tickets + gained, timerCharges: 0 });
    notify(`+${gained} ticket${gained > 1 ? 's' : ''} collected!`, 'success');
  };

  const handleWatchAd = () => {
    updateSave({ tickets: save.tickets + AD_TICKETS, lastAdWatch: Date.now() });
    notify(`+${AD_TICKETS} tickets! Thanks for watching.`, 'success');
  };

  const handleBattleEarn = (tickets, draftedCard = null) => {
    setSave(prev => {
      const collection = { ...prev.collection };
      if (draftedCard) {
        const id   = draftedCard.id ?? `draft_${Date.now()}`;
        const card = { ...draftedCard, id, count:1, addedAt:new Date().toISOString(),
          stats: draftedCard.stats ?? generateCardStats(draftedCard.title ?? '', draftedCard.views ?? 0, draftedCard.rarity ?? 'C') };
        collection[id] = card;
        notify(`📦 Drafted: ${draftedCard.title}!`, 'success');
      }
      if (tickets > 0) notify(`+${tickets} 🎫 battle reward!`, 'success');
      const next = { ...prev, tickets: prev.tickets + tickets, collection,
        battleWins: (prev.battleWins ?? 0) + (tickets > 1 ? 1 : 0) };
      writeSave(next);
      return next;
    });
  };

  const handleSetScreen = (s) => {
    if (s === 'shop' && save) {
      const patch = collectTimerCharges(save);
      if (patch) updateSave(patch);
    }
    setScreen(s);
  };

  const handleReset = () => { deleteSave(); setSave(null); setScreen('login'); };

  // ── Desktop: show landing page ──────────────────────────────────────────────
  // CSS also hides/shows via .mobile-only / .desktop-only for immediate render,
  // but we also skip heavy game logic on desktop for perf.
  if (isDesktop) return <DesktopLanding />;

  // ── Mobile render ───────────────────────────────────────────────────────────
  if (screen === 'loading') return <LoadingScreen />;
  if (screen === 'login')   return <LoginScreen onLogin={handleLogin} />;

  const favSet   = new Set(save.favourites ?? []);
  const achToast = achQueue.length > 0
    ? <AchievementToast key={achQueue[0].id} achievement={achQueue[0]} onDone={() => setAchQueue(q => q.slice(1))} />
    : null;

  if (screen === 'opening') {
    return (
      <div className="app-shell">
        {toast && <Toast message={toast.message} type={toast.type} />}
        {achToast}
        <TopBar tickets={save.tickets} />
        <div className="scroll-area">
          <OpeningScreen cardsPromise={cardsPromise} onDone={handleOpeningDone} />
        </div>
        <BottomNav screen="opening" setScreen={handleSetScreen} />
        <PWAInstallBanner />
      </div>
    );
  }

  return (
    <div className="app-shell">
      {toast && <Toast message={toast.message} type={toast.type} />}
      {achToast}
      <TopBar tickets={save.tickets} />
      <div className="scroll-area">
        {screen === 'home'       && <HomeScreen       save={save} onDaily={handleDaily} onPack={handlePack} goShop={() => handleSetScreen('shop')} />}
        {screen === 'shop'       && <ShopScreen       save={save} onPack={handlePack} onClaimCharges={handleClaimCharges} onWatchAd={handleWatchAd} />}
        {screen === 'collection' && <CollectionScreen collection={save.collection} favourites={favSet} onToggleFav={handleToggleFav} />}
        {screen === 'account'    && <AccountScreen    save={save} onReset={handleReset} />}
        {screen === 'battle'     && <BattleScreen     collection={save.collection} onEarn={handleBattleEarn} />}
        <Footer />
      </div>
      <BottomNav screen={screen} setScreen={handleSetScreen} />
      <PWAInstallBanner />
    </div>
  );
}
