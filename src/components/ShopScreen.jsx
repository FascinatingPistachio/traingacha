import { useState, useEffect } from 'react';
import { RARITY, PACK_COST, TIMER_TICKETS, TIMER_MAX_CHARGES, TIMER_INTERVAL_MS, AD_TICKETS, AD_COOLDOWN_MS, VIEW_THRESHOLDS } from '../constants.js';
import { msUntilNextCharge, fmtMs, adOnCooldown, msUntilAdReady } from '../utils/tickets.js';
import AdScreen from './AdScreen.jsx';

function TimerBar({ pct, color }) {
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 1s linear' }} />
    </div>
  );
}

function ChargeIcon({ filled }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: 4,
      background: filled ? 'rgba(201,168,51,0.85)' : 'rgba(255,255,255,0.07)',
      border: `1px solid ${filled ? 'rgba(201,168,51,0.6)' : 'rgba(255,255,255,0.1)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9,
    }}>
      {filled ? '🎫' : ''}
    </div>
  );
}

export default function ShopScreen({ save, onPack, onClaimCharges, onWatchAd }) {
  const [, setTick] = useState(0);   // force re-render for live countdowns
  const [showAd, setShowAd] = useState(false);

  // Re-render every second to keep timers live
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const can       = save.tickets >= PACK_COST;
  const charges   = save.timerCharges ?? 0;
  const msNext    = msUntilNextCharge(save);
  const nextPct   = ((TIMER_INTERVAL_MS - msNext) / TIMER_INTERVAL_MS) * 100;
  const cooldown  = adOnCooldown(save);
  const msAd      = msUntilAdReady(save);

  const handleAdDone = () => {
    setShowAd(false);
    onWatchAd();
  };

  if (showAd) {
    return <AdScreen onComplete={handleAdDone} onSkip={handleAdDone} />;
  }

  return (
    <div style={{ padding: '18px 14px', maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ color: '#c9a833', margin: '0 0 16px', fontSize: 13, fontFamily: 'monospace', letterSpacing: '.2em', textAlign: 'center' }}>
        TICKET WINDOW
      </h2>

      {/* Current tickets */}
      <div style={{ background: '#0c1825', border: '1px solid rgba(201,168,51,0.18)', borderRadius: 9, padding: '13px', marginBottom: 13, textAlign: 'center' }}>
        <div style={{ fontSize: 24, color: '#c9a833', fontFamily: 'monospace', fontWeight: 700 }}>🎫 {save.tickets.toLocaleString()}</div>
        <div style={{ fontSize: 8, color: '#1e3050', fontFamily: 'monospace', marginTop: 3 }}>CURRENT BALANCE · {PACK_COST} PER PACK</div>
      </div>

      {/* ── Timer charges ── */}
      <div style={{ background: '#0c1825', border: '1px solid rgba(201,168,51,0.13)', borderRadius: 9, padding: '14px', marginBottom: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
          <div>
            <div style={{ fontSize: 9.5, color: '#c9a833', fontFamily: 'monospace', letterSpacing: '.15em' }}>⏱ FREE TICKETS</div>
            <div style={{ fontSize: 7.5, color: '#1e3050', fontFamily: 'monospace', marginTop: 2 }}>+{TIMER_TICKETS} every 30 min · up to {TIMER_MAX_CHARGES} stored</div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: TIMER_MAX_CHARGES }).map((_, i) => (
              <ChargeIcon key={i} filled={i < charges} />
            ))}
          </div>
        </div>

        {/* Progress bar to next charge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
          <TimerBar pct={charges >= TIMER_MAX_CHARGES ? 100 : nextPct} color="#c9a833" />
          <span style={{ fontSize: 9, color: '#2a4060', fontFamily: 'monospace', whiteSpace: 'nowrap', minWidth: 36 }}>
            {charges >= TIMER_MAX_CHARGES ? 'FULL' : fmtMs(msNext)}
          </span>
        </div>

        <button
          onClick={charges > 0 ? onClaimCharges : undefined}
          style={{
            width: '100%', padding: '10px',
            background: charges > 0 ? 'linear-gradient(135deg,#1a3a1a,#0e2a0e)' : '#0a1420',
            border: `1px solid ${charges > 0 ? 'rgba(74,175,74,0.45)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 7, color: charges > 0 ? '#6fcf7f' : '#1a3040',
            fontSize: 11, fontFamily: 'monospace', cursor: charges > 0 ? 'pointer' : 'not-allowed',
            letterSpacing: '.07em', transition: 'all 0.2s',
            animation: charges > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
          }}
        >
          {charges > 0
            ? `COLLECT ${charges} CHARGE${charges > 1 ? 'S' : ''} (+${charges * TIMER_TICKETS} TICKETS)`
            : charges >= TIMER_MAX_CHARGES
            ? `ALL CHARGES COLLECTED — SPEND SOME!`
            : `NEXT CHARGE IN ${fmtMs(msNext)}`}
        </button>
      </div>

      {/* ── Watch ad ── */}
      <div style={{ background: '#0c1825', border: '1px solid rgba(79,168,232,0.18)', borderRadius: 9, padding: '14px', marginBottom: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9.5, color: '#4fa8e8', fontFamily: 'monospace', letterSpacing: '.15em' }}>📺 WATCH AN AD</div>
            <div style={{ fontSize: 7.5, color: '#1e3050', fontFamily: 'monospace', marginTop: 2 }}>+{AD_TICKETS} tickets · {AD_COOLDOWN_MS / 60000} min cooldown</div>
          </div>
          <div style={{ fontSize: 18, color: '#4fa8e8' }}>🎫 +{AD_TICKETS}</div>
        </div>

        {cooldown && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <TimerBar pct={((AD_COOLDOWN_MS - msAd) / AD_COOLDOWN_MS) * 100} color="#4fa8e8" />
            <span style={{ fontSize: 9, color: '#2a4060', fontFamily: 'monospace', whiteSpace: 'nowrap', minWidth: 36 }}>{fmtMs(msAd)}</span>
          </div>
        )}

        <button
          onClick={!cooldown ? () => setShowAd(true) : undefined}
          style={{
            width: '100%', padding: '10px',
            background: !cooldown ? 'linear-gradient(135deg,#0f2240,#09162d)' : '#0a1420',
            border: `1px solid ${!cooldown ? 'rgba(79,168,232,0.45)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 7, color: !cooldown ? '#4fa8e8' : '#1a3040',
            fontSize: 11, fontFamily: 'monospace', cursor: !cooldown ? 'pointer' : 'not-allowed',
            letterSpacing: '.07em', transition: 'all 0.2s',
          }}
        >
          {cooldown ? `NEXT AD READY IN ${fmtMs(msAd)}` : '▶ WATCH AD FOR +50 TICKETS'}
        </button>
      </div>

      {/* ── Open pack ── */}
      <div style={{ background: 'linear-gradient(160deg,#0d1f35,#060f1c)', border: '1px solid rgba(201,168,51,0.28)', borderRadius: 12, padding: '20px', textAlign: 'center', boxShadow: '0 0 28px rgba(201,168,51,0.06)', marginBottom: 16 }}>
        <div style={{ fontSize: 40, marginBottom: 7 }}>📦</div>
        <div style={{ fontSize: 13, color: '#e8e0d0', fontFamily: 'Georgia, serif', fontWeight: 700, marginBottom: 3 }}>Standard Pack</div>
        <div style={{ fontSize: 8.5, color: '#1e3a5a', fontFamily: 'monospace', marginBottom: 16 }}>5 CARDS · REAL WIKIPEDIA PHOTOS &amp; INFO</div>
        <button className="btn" onClick={can ? onPack : undefined} style={{
          padding: '11px 38px',
          background: can ? 'linear-gradient(135deg,#c9a833,#8a6e1a)' : '#111e30',
          border: 'none', borderRadius: 8, color: can ? '#06101c' : '#2a3a4a',
          fontSize: 13.5, fontWeight: 700, cursor: can ? 'pointer' : 'not-allowed',
          fontFamily: 'monospace', letterSpacing: '.1em', transition: 'all 0.2s',
        }}>
          {can ? `🎫 OPEN — ${PACK_COST} TICKETS` : 'NOT ENOUGH TICKETS'}
        </button>
      </div>

      {/* ── Rarity guide ── */}
      <div style={{ background: '#0c1825', border: '1px solid rgba(201,168,51,0.09)', borderRadius: 9, padding: '13px' }}>
        <div style={{ fontSize: 8.5, color: '#c9a833', fontFamily: 'monospace', letterSpacing: '.15em', marginBottom: 10 }}>HOW RARITY WORKS</div>
        <p style={{ fontSize: 8, color: '#1e3050', fontFamily: 'monospace', margin: '0 0 10px', lineHeight: 1.75 }}>
          Rarity is determined by monthly Wikipedia page views — the more famous the train, the rarer the card.
        </p>
        {['L', 'E', 'R', 'C'].map((r) => {
          const rs = RARITY[r];
          const labels = {
            L: `≥ ${(VIEW_THRESHOLDS.L/1000).toFixed(0)}k views/month`,
            E: `${(VIEW_THRESHOLDS.E/1000).toFixed(0)}k – ${(VIEW_THRESHOLDS.L/1000).toFixed(0)}k/month`,
            R: `${(VIEW_THRESHOLDS.R/1000).toFixed(0)}k – ${(VIEW_THRESHOLDS.E/1000).toFixed(0)}k/month`,
            C: `< ${(VIEW_THRESHOLDS.R/1000).toFixed(0)}k/month`,
          };
          return (
            <div key={r} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: 8.5, color: rs.color, fontFamily: 'monospace', fontWeight: 700, minWidth: 60 }}>{rs.name}</span>
              <span style={{ fontSize: 8, color: '#1e3050', fontFamily: 'monospace' }}>{labels[r]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
