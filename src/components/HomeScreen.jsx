import { RARITY, PACK_COST, DAILY_BONUS, PITY } from '../constants.js';
import { soundDailyClaim, soundBuy, soundClick } from '../utils/sounds.js';
import RailCard from './RailCard.jsx';

function PityBar({ label, current, soft, hard, color }) {
  const pct     = Math.min(100, (current / hard) * 100);
  const softPct = (soft / hard) * 100;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontFamily:'monospace' }}>{label}</span>
        <span style={{ fontSize:8, fontFamily:'monospace', color: pct >= softPct ? color : 'rgba(255,255,255,0.35)' }}>
          {current}/{hard}
        </span>
      </div>
      <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:3, position:'relative', overflow:'hidden' }}>
        {/* Soft pity marker */}
        <div style={{ position:'absolute', left:`${softPct}%`, top:0, bottom:0, width:1,
          background:'rgba(255,255,255,0.2)' }} />
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:3,
          boxShadow: pct >= softPct ? `0 0 6px ${color}` : 'none',
          transition:'width 0.4s ease-out' }} />
      </div>
    </div>
  );
}

export default function HomeScreen({ save, onDaily, onPack, goShop }) {
  const today        = new Date().toISOString().split('T')[0];
  const canClaim     = save.dailyClaimedDate !== today;
  const uniqueOwned  = Object.keys(save.collection).length;
  const pityState    = save.pityState ?? { rare:0, epic:0, legend: save.pity ?? 0 };

  const byRarity = Object.values(save.collection).reduce((acc, e) => {
    acc[e.rarity] = (acc[e.rarity] ?? 0) + 1; return acc;
  }, {});

  // Recent cards (last 4 pulled)
  const recentCards = Object.values(save.collection)
    .filter(c => c.addedAt)
    .sort((a,b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 4);

  // Best card by overall stat
  const bestCard = Object.values(save.collection)
    .filter(c => c.stats)
    .sort((a,b) => (b.stats?.overall ?? 0) - (a.stats?.overall ?? 0))[0];

  return (
    <div style={{ padding:'16px 13px', maxWidth:480, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>

      {/* Station banner */}
      <div style={{ background:'linear-gradient(135deg,#0d1e32,#081525)',
        border:'1px solid rgba(201,168,51,0.2)', borderRadius:12, padding:'16px',
        textAlign:'center', position:'relative', overflow:'hidden' }}>
        {/* Subtle grid background */}
        <div style={{ position:'absolute', inset:0, opacity:0.03,
          backgroundImage:'linear-gradient(rgba(201,168,51,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,51,1) 1px,transparent 1px)',
          backgroundSize:'20px 20px' }} />
        <div style={{ fontSize:26, marginBottom:5 }}>🚉</div>
        <div style={{ color:'#c9a833', fontSize:16, fontWeight:700, fontFamily:'Georgia,serif' }}>
          {save.username}'s Station
        </div>
        <div style={{ color:'rgba(255,255,255,0.2)', fontSize:8.5, fontFamily:'monospace', marginTop:4, letterSpacing:'.1em' }}>
          {uniqueOwned} CARDS · {save.totalPulls ?? 0} PULLS
          {(save.battleWins ?? 0) > 0 && ` · ${save.battleWins} WINS`}
          {(save.raidWins ?? 0) > 0 && ` · ${save.raidWins} RAIDS`}
        </div>
        {(save.loginStreak ?? 0) > 1 && (
          <div style={{ marginTop:6, fontSize:9, color:'rgba(255,140,0,0.8)', fontFamily:'monospace' }}>
            🔥 {save.loginStreak}-DAY STREAK
          </div>
        )}
      </div>

      {/* Tickets + Daily row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
        <div style={{ background:'#0a1520', border:'1px solid rgba(201,168,51,0.12)', borderRadius:9, padding:'12px 13px' }}>
          <div style={{ fontSize:20, color:'#c9a833', fontFamily:'monospace', fontWeight:700 }}>🎫 {save.tickets}</div>
          <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.2)', marginTop:3, fontFamily:'monospace' }}>GOLD TICKETS</div>
        </div>
        <div style={{ background:'#0a1520', border:'1px solid rgba(201,168,51,0.12)', borderRadius:9, padding:'12px 13px' }}>
          <div style={{ fontSize:14, color: canClaim?'#6fcf7f':'rgba(255,255,255,0.2)', fontFamily:'monospace', fontWeight:700 }}>
            {canClaim ? '🎁 READY' : '✓ CLAIMED'}
          </div>
          <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.2)', marginTop:3, fontFamily:'monospace' }}>
            DAILY (+{DAILY_BONUS} 🎫)
          </div>
        </div>
      </div>

      {/* Pity tracker */}
      <div style={{ background:'#0a1520', border:'1px solid rgba(255,255,255,0.06)', borderRadius:9, padding:'12px 14px' }}>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
          letterSpacing:'.12em', marginBottom:10 }}>⚙️ PITY TRACKER</div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          <PityBar label="RARE+"   current={pityState.rare   ?? 0} soft={8}               hard={PITY.RARE_HARD}   color="#4fa8e8" />
          <PityBar label="EPIC+"   current={pityState.epic   ?? 0} soft={PITY.EPIC_SOFT}  hard={PITY.EPIC_HARD}   color="#b57bee" />
          <PityBar label="LEGEND"  current={pityState.legend ?? 0} soft={PITY.LEGEND_SOFT} hard={PITY.LEGEND_HARD} color="#e8c040" />
        </div>
      </div>

      {/* Collection breakdown */}
      {uniqueOwned > 0 && (
        <div style={{ background:'#0a1520', border:'1px solid rgba(255,255,255,0.06)', borderRadius:9, padding:'12px 14px' }}>
          <div style={{ fontSize:8, color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
            letterSpacing:'.12em', marginBottom:8 }}>COLLECTION</div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {['M','L','E','R','C'].map(r => (
              <div key={r} style={{ fontSize:9, fontFamily:'monospace', color:RARITY[r].color }}>
                {RARITY[r].short}: <span style={{ fontWeight:700 }}>{byRarity[r] ?? 0}</span>
              </div>
            ))}
          </div>
          {bestCard && (
            <div style={{ marginTop:8, fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>
              👑 Best: {bestCard.title} ({bestCard.stats?.overall ?? '—'} pts)
            </div>
          )}
        </div>
      )}

      {/* Recent cards */}
      {recentCards.length > 0 && (
        <div>
          <div style={{ fontSize:8, color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
            letterSpacing:'.12em', marginBottom:8 }}>RECENTLY PULLED</div>
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
            {recentCards.map(card => (
              <RailCard key={card.id} card={card} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Daily claim button */}
      <button onClick={() => { if (canClaim) { soundDailyClaim(); onDaily(); } }} style={{
        width:'100%', padding:'13px',
        background: canClaim ? 'linear-gradient(135deg,#1a3a1a,#0e2a0e)' : '#0a1520',
        border:`1px solid ${canClaim?'rgba(74,175,74,0.4)':'rgba(255,255,255,0.05)'}`,
        borderRadius:9, color: canClaim?'#6fcf7f':'rgba(255,255,255,0.2)',
        fontSize:11, fontFamily:'monospace', cursor: canClaim?'pointer':'not-allowed',
        letterSpacing:'.07em', transition:'all 0.2s',
        animation: canClaim ? 'pulse 2.2s ease-in-out infinite' : 'none',
      }}>
        {canClaim ? `🎁 CLAIM DAILY BONUS (+${DAILY_BONUS} TICKETS)` : '✓ DAILY CLAIMED — COME BACK TOMORROW'}
      </button>

      {/* Open pack button */}
      <button onClick={() => { if (save.tickets >= PACK_COST) { soundBuy(); onPack(); } else { soundClick(); goShop(); } }}
        style={{
          width:'100%', padding:'15px',
          background: save.tickets >= PACK_COST
            ? 'linear-gradient(135deg,#0f2240,#09162d)'
            : '#0a1420',
          border:`1px solid ${save.tickets >= PACK_COST?'rgba(79,168,232,0.4)':'rgba(255,255,255,0.06)'}`,
          borderRadius:9, color: save.tickets >= PACK_COST?'#4fa8e8':'rgba(255,255,255,0.2)',
          fontSize:12, fontFamily:'monospace', cursor:'pointer',
          letterSpacing:'.07em', transition:'all 0.2s',
        }}>
        {save.tickets >= PACK_COST ? `🎴 OPEN PACK — ${PACK_COST} TICKET` : `🎴 NEED ${PACK_COST - save.tickets} MORE TICKET${PACK_COST - save.tickets !== 1 ? 'S' : ''}`}
      </button>

      {/* Attribution */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:14, textAlign:'center' }}>
        <p style={{ fontSize:8, color:'rgba(255,255,255,0.12)', fontFamily:'monospace', lineHeight:1.8, margin:0 }}>
          Inspired by{' '}
          <a href="https://wikigacha.com/?lang=EN" target="_blank" rel="noreferrer"
            style={{ color:'rgba(255,255,255,0.2)', textDecoration:'underline' }}>
            WikiGacha
          </a>
          {' '}— cards sourced live from Wikipedia.
        </p>
      </div>
    </div>
  );
}
