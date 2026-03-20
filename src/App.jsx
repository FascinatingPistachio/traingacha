import { useState, useEffect, useCallback } from 'react';

import LoginScreen      from './components/LoginScreen.jsx';
import HomeScreen       from './components/HomeScreen.jsx';
import ShopScreen       from './components/ShopScreen.jsx';
import OpeningScreen    from './components/OpeningScreen.jsx';
import CollectionScreen from './components/CollectionScreen.jsx';
import AccountScreen    from './components/AccountScreen.jsx';
import BottomNav        from './components/BottomNav.jsx';
import Toast            from './components/Toast.jsx';

import { drawPack, updatePity } from './utils/gacha.js';
import { loadSave, writeSave, deleteSave, makeFreshSave } from './utils/storage.js';
import { preloadCardImages } from './utils/preload.js';
import { PACK_COST, DAILY_BONUS } from './constants.js';

function TopBar({ tickets }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(6,16,28,0.96)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(201,168,51,0.08)',
      padding: '9px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ color: '#c9a833', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, letterSpacing: '.15em' }}>
        🚂 RAIL GACHA
      </span>
      <span style={{ color: '#c9a833', fontFamily: 'monospace', fontSize: 12 }}>
        🎫 {tickets}
      </span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#06101c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#c9a833', fontFamily: 'monospace', fontSize: 13, animation: 'pulse 1.5s infinite' }}>
        🚂 LOADING…
      </div>
    </div>
  );
}

export default function App() {
  const [save, setSave]               = useState(null);
  const [screen, setScreen]           = useState('loading');
  // cardsPromise is kicked off the moment user clicks "open pack"
  // so fetching happens during the animation, not after.
  const [cardsPromise, setCardsPromise] = useState(null);
  const [busy, setBusy]               = useState(false);
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    loadSave().then((data) => {
      if (data) { setSave(data); setScreen('home'); }
      else        setScreen('login');
    });
  }, []);

  const notify = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const updateSave = useCallback(async (patch) => {
    setSave((prev) => {
      const next = { ...prev, ...patch };
      writeSave(next);
      return next;
    });
  }, []);

  const handleLogin = async (username, imported = null) => {
    const data = imported ?? makeFreshSave(username);
    await writeSave(data);
    setSave(data);
    setScreen('home');
    notify(
      imported
        ? `Welcome back, ${data.username}!`
        : `All aboard, ${username}! You have ${data.tickets} starter tickets.`,
      'success'
    );
  };

  const handleDaily = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (save.dailyClaimedDate === today) { notify('Already claimed today!', 'warn'); return; }
    await updateSave({ tickets: save.tickets + DAILY_BONUS, dailyClaimedDate: today });
    notify(`+${DAILY_BONUS} tickets claimed!`, 'success');
  };

  const handlePack = async () => {
    if (save.tickets < PACK_COST) { notify('Not enough tickets!', 'error'); return; }
    if (busy) return;
    setBusy(true);

    // ── KEY CHANGE: start the Wikipedia fetch IMMEDIATELY, before the animation.
    // We wrap it in a promise and pass it to OpeningScreen, which awaits it
    // after the pack-tear animation completes.
    const promise = drawPack(save.pity ?? 0).then(async (cards) => {
      if (!cards?.length) return [];
      // Preload images while user is still on the animation/reveal screen
      preloadCardImages(cards).catch(() => {});
      return cards;
    });

    setCardsPromise(promise);

    // Deduct tickets and update pity optimistically so the UI feels instant
    await updateSave({ tickets: save.tickets - PACK_COST });

    setScreen('opening');
    setBusy(false);
  };

  // Called when the OpeningScreen "DONE" button is pressed.
  // At this point we have the resolved cards and can persist them.
  const handleOpeningDone = async () => {
    if (!cardsPromise) { setScreen('collection'); return; }
    try {
      const cards = await cardsPromise;
      if (cards?.length) {
        setSave((prev) => {
          const collection = { ...prev.collection };
          for (const card of cards) {
            if (collection[card.id]) {
              collection[card.id] = { ...collection[card.id], count: (collection[card.id].count ?? 1) + 1 };
            } else {
              collection[card.id] = { ...card, count: 1, addedAt: new Date().toISOString() };
            }
          }
          const newPity   = updatePity(prev.pity ?? 0, cards);
          const newPulls  = (prev.totalPulls ?? 0) + cards.length;
          const next      = { ...prev, collection, pity: newPity, totalPulls: newPulls };
          writeSave(next);
          return next;
        });
      }
    } catch { /* fetch failed — tickets already deducted, nothing to add */ }
    setCardsPromise(null);
    setScreen('collection');
  };

  const handleReset = async () => {
    await deleteSave();
    setSave(null);
    setScreen('login');
  };

  if (screen === 'loading') return <LoadingScreen />;
  if (screen === 'login')   return <LoginScreen onLogin={handleLogin} />;

  if (screen === 'opening') {
    return (
      <div style={{ background: '#06101c', minHeight: '100vh', paddingBottom: 56 }}>
        {toast && <Toast message={toast.message} type={toast.type} />}
        <TopBar tickets={save.tickets} />
        <OpeningScreen cardsPromise={cardsPromise} onDone={handleOpeningDone} />
        <BottomNav screen="opening" setScreen={setScreen} />
      </div>
    );
  }

  return (
    <div style={{ background: '#06101c', minHeight: '100vh', paddingBottom: 62 }}>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <TopBar tickets={save.tickets} />
      <div className="scroll-area" style={{ height: 'calc(100vh - 44px - 56px)', overflowY: 'auto' }}>
        {screen === 'home'       && <HomeScreen       save={save} onDaily={handleDaily} onPack={handlePack} goShop={() => setScreen('shop')} />}
        {screen === 'shop'       && <ShopScreen       save={save} onPack={handlePack} />}
        {screen === 'collection' && <CollectionScreen collection={save.collection} />}
        {screen === 'account'    && <AccountScreen    save={save} onReset={handleReset} />}
      </div>
      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}
