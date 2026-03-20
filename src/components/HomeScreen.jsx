import { RARITY, PACK_COST, DAILY_BONUS } from '../constants.js';

export default function HomeScreen({ save, onDaily, onPack, goShop }) {
  const today       = new Date().toISOString().split('T')[0];
  const canClaim    = save.dailyClaimedDate !== today;
  const uniqueOwned = Object.keys(save.collection).length;

  const byRarity = Object.values(save.collection).reduce((acc, entry) => {
    acc[entry.rarity] = (acc[entry.rarity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: '18px 14px', maxWidth: 480, margin: '0 auto' }}>
      {/* Station */}
      <div className="fade-up" style={{
        background: 'linear-gradient(135deg,#0d1e32,#081525)',
        border: '1px solid rgba(201,168,51,0.18)',
        borderRadius: 12, padding: '18px 16px', marginBottom: 12, textAlign: 'center',
      }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>🚉</div>
        <h2 style={{ color: '#c9a833', margin: '0 0 4px', fontSize: 16, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
          {save.username}'s Station
        </h2>
        <p style={{ color: '#1e3a5a', fontSize: 9, margin: 0, fontFamily: 'monospace' }}>
          {uniqueOwned} UNIQUE CARDS · {save.totalPulls ?? 0} TOTAL PULLS · PITY {save.pity ?? 0}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 12 }}>
        {[
          { icon: '🎫', val: save.tickets,           label: 'GOLD TICKETS' },
          { icon: '📅', val: canClaim ? 'READY!' : 'CLAIMED', label: 'DAILY BONUS' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#0c1825', border: '1px solid rgba(201,168,51,0.11)', borderRadius: 9, padding: '13px 14px' }}>
            <div style={{ fontSize: 18, color: '#c9a833', fontFamily: 'monospace', fontWeight: 700 }}>{s.icon} {s.val}</div>
            <div style={{ fontSize: 7.5, color: '#1e3050', marginTop: 3, fontFamily: 'monospace' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Collection breakdown */}
      {uniqueOwned > 0 && (
        <div style={{ background: '#0c1825', border: '1px solid rgba(201,168,51,0.11)', borderRadius: 9, padding: '12px 14px', marginBottom: 12 }}>
          <div style={{ fontSize: 8.5, color: '#1e3050', fontFamily: 'monospace', marginBottom: 8 }}>YOUR COLLECTION</div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {['L', 'E', 'R', 'C'].map((r) => (
              <div key={r} style={{ fontSize: 8.5, fontFamily: 'monospace', color: RARITY[r].color }}>
                {RARITY[r].short}: {byRarity[r] ?? 0}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily */}
      <button onClick={canClaim ? onDaily : undefined} style={{
        width: '100%', padding: '13px', marginBottom: 9,
        background: canClaim ? 'linear-gradient(135deg,#1a3a1a,#0e2a0e)' : '#0c1825',
        border: `1px solid ${canClaim ? 'rgba(74,175,74,0.4)' : 'rgba(201,168,51,0.08)'}`,
        borderRadius: 9, color: canClaim ? '#6fcf7f' : '#1a3040',
        fontSize: 12, fontFamily: 'monospace', cursor: canClaim ? 'pointer' : 'not-allowed',
        letterSpacing: '.07em', transition: 'all 0.2s',
        animation: canClaim ? 'pulse 2.2s ease-in-out infinite' : 'none',
      }}>
        {canClaim ? `🎁 CLAIM DAILY BONUS (+${DAILY_BONUS} TICKETS)` : '✓ DAILY CLAIMED — COME BACK TOMORROW'}
      </button>

      {/* Open pack */}
      <button className="btn" onClick={save.tickets >= PACK_COST ? onPack : goShop} style={{
        width: '100%', padding: '13px',
        background: save.tickets >= PACK_COST ? 'linear-gradient(135deg,#0f2240,#09162d)' : '#0a1420',
        border: `1px solid ${save.tickets >= PACK_COST ? 'rgba(79,168,232,0.38)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 9, color: save.tickets >= PACK_COST ? '#4fa8e8' : '#1e3050',
        fontSize: 12, fontFamily: 'monospace', cursor: 'pointer',
        letterSpacing: '.07em', transition: 'all 0.2s', marginBottom: 22,
      }}>
        {save.tickets >= PACK_COST ? `🎴 OPEN A PACK — ${PACK_COST} TICKETS` : `🎴 GO TO PACK SHOP (need ${PACK_COST - save.tickets} more)`}
      </button>

      {/* WikiGacha attribution */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: 16, textAlign: 'center',
      }}>
        <p style={{ fontSize: 8.5, color: '#1a2e40', fontFamily: 'monospace', lineHeight: 1.8, margin: 0 }}>
          Inspired by{' '}
          <a
            href="https://wikigacha.com/?lang=EN"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#2a4a6a', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            WikiGacha
          </a>
          {' '}— the original Wikipedia card game.
          <br />Card info &amp; images sourced live from Wikipedia.
        </p>
      </div>
    </div>
  );
}
