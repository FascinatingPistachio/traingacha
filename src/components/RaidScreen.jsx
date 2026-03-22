import { fetchWikiThumbnail } from '../utils/wikiImage.js';
import { useState, useEffect } from 'react';
import { generateCardStats, STAT_CONFIG, statPercent, formatStat } from '../utils/stats.js';
import { RAID_WIN_TICKETS, RARITY } from '../constants.js';
import RailCard from './RailCard.jsx';

// Daily raid bosses — rotate based on day of year
const RAID_BOSSES = [
  { title:"Flying Scotsman",        views:195000, rarity:'L', emoji:'🟢', weakness:'heritage', wNote:'Ancient — low heritage score' },
  { title:"Shinkansen",             views:210000, rarity:'L', emoji:'🔵', weakness:'endurance', wNote:'Precision over longevity' },
  { title:"Stephenson's Rocket",    views:180000, rarity:'L', emoji:'🟡', weakness:'speed',    wNote:'It was 1829 — slow by modern standards' },
  { title:"Pere Marquette 1225",    views:95000,  rarity:'L', emoji:'🔴', weakness:'power',    wNote:'Passenger hauler, not a freight beast' },
  { title:"ETR 300",                views:72000,  rarity:'L', emoji:'🩶', weakness:'endurance',wNote:'Retired early — low endurance' },
  { title:"LNER Class A4",          views:55000,  rarity:'E', emoji:'⚪', weakness:'power',    wNote:'Speed demon but low power rating' },
  { title:"LMS Princess Coronation class", views:48000, rarity:'E', emoji:'🔵', weakness:'fame', wNote:'Overshadowed by LNER rivals' },
  { title:"Talyllyn (locomotive)",  views:31000,  rarity:'E', emoji:'🔴', weakness:'speed',    wNote:'2 ft narrow gauge — tortoise pace' },
  { title:"Fairlie (locomotive)",   views:26000,  rarity:'E', emoji:'🟢', weakness:'fame',     wNote:'Ingenious but obscure' },
  { title:"River Esk (locomotive)", views:15000,  rarity:'R', emoji:'🔴', weakness:'power',    wNote:'Miniature railway — low power' },
  { title:"Dolgoch",                views:12000,  rarity:'R', emoji:'🔴', weakness:'speed',    wNote:'Museum-paced heritage engine' },
  { title:"Snowdon Mountain Railway",views:85000, rarity:'E', emoji:'🔴', weakness:'speed',    wNote:'Rack railway — slow by design' },
];

function getTodaysBoss() {
  const day = Math.floor(Date.now() / 86400000);
  return RAID_BOSSES[day % RAID_BOSSES.length];
}

function buildBossCard(boss) {
  const rawStats = generateCardStats(boss.title, boss.views, boss.rarity);
  // Apply weakness — cut that stat by 40%
  const stats = { ...rawStats, [boss.weakness]: Math.round(rawStats[boss.weakness] * 0.6) };
  return {
    id: `raid_boss_${boss.title.replace(/\W/g,'_')}`,
    title: boss.title,
    image: null,
    extract: `Today's raid boss. Weakness: ${boss.weakness.toUpperCase()}.`,
    rarity: boss.rarity,
    views: boss.views,
    stats,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(boss.title.replace(/ /g,'_'))}`,
  };
}

function autoResolveBattle(teamCards, bossCard, boss) {
  const rounds = [];
  let bossHp = 100;
  // 3 rounds — each uses a different auto-chosen stat
  const stats = ['speed','power','heritage'];
  for (const stat of stats) {
    const best = teamCards.reduce((a,b) =>
      (a.stats?.[stat]??0) > (b.stats?.[stat]??0) ? a : b
    );
    const pVal = best.stats?.[stat] ?? 0;
    const bVal = bossCard.stats?.[stat] ?? 0;
    const isWeak = stat === boss.weakness;
    const bonus  = isWeak ? 1.5 : 1.0;
    const win    = (pVal * bonus) > bVal;
    const dmg    = win ? Math.round(25 + (isWeak ? 20 : 0)) : 10;
    bossHp       = Math.max(0, bossHp - (win ? dmg : -5));
    rounds.push({ stat, card:best, pVal, bVal, win, isWeak, bossHp: Math.max(0,bossHp) });
  }
  return { rounds, victory: bossHp <= 0 };
}

export default function RaidScreen({ collection, onEarn }) {
  const [phase, setPhase]       = useState('lobby'); // lobby | team | fighting | result
  const [team, setTeam]         = useState([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [rounds, setRounds]     = useState([]);
  const [victory, setVictory]   = useState(false);
  const [bossHp, setBossHp]     = useState(100);

  const boss     = getTodaysBoss();
  const bossCard = buildBossCard(boss);
  const collCards = Object.values(collection ?? {}).filter(c => c.stats);

  const toggleTeam = (card) => {
    setTeam(prev => {
      const has = prev.find(c => c.id === card.id);
      if (has) return prev.filter(c => c.id !== card.id);
      if (prev.length >= 3) return prev;
      return [...prev, card];
    });
  };

  const launchRaid = () => {
    if (team.length < 1) return;
    const result = autoResolveBattle(team, bossCard, boss);
    setRounds(result.rounds);
    setVictory(result.victory);
    setBossHp(100);
    setRoundIdx(0);
    setPhase('fighting');
  };

  // Animate rounds one by one
  useEffect(() => {
    if (phase !== 'fighting') return;
    if (roundIdx >= rounds.length) {
      setTimeout(() => setPhase('result'), 800);
      return;
    }
    const t = setTimeout(() => {
      setBossHp(rounds[roundIdx].bossHp);
      setRoundIdx(i => i + 1);
    }, 1400);
    return () => clearTimeout(t);
  }, [phase, roundIdx, rounds]);

  // ── LOBBY ────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    const rs = RARITY[boss.rarity] ?? RARITY.E;
    return (
      <div style={{ padding:'16px 12px 80px', display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontFamily:'monospace',
            letterSpacing:'.15em', marginBottom:4 }}>DAILY RAID</div>
          <div style={{ fontSize:18, color:'#e8c040', fontFamily:'Georgia,serif', fontWeight:700 }}>
            ⚔️ Boss Raid
          </div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontFamily:'monospace', marginTop:4 }}>
            Resets at midnight UTC
          </div>
        </div>

        {/* Boss card */}
        <div style={{ background:`linear-gradient(135deg,${rs.bg},#030610)`, borderRadius:12,
          border:`1px solid ${rs.border}`, padding:'16px', display:'flex', flexDirection:'column',
          gap:12, alignItems:'center' }}>
          <div style={{ fontSize:boss.emoji?20:0 }}>{boss.emoji}</div>
          <div style={{ fontSize:16, color:rs.color, fontFamily:'Georgia,serif', fontWeight:700,
            textAlign:'center', textShadow:`0 0 8px ${rs.glow}` }}>
            {boss.title}
          </div>
          <div style={{ display:'flex', gap:3 }}>
            {Array.from({length:boss.rarity==='L'?4:boss.rarity==='E'?3:2}).map((_,i) => (
              <span key={i} style={{ color:rs.color, fontSize:12 }}>★</span>
            ))}
          </div>

          {/* Boss stats */}
          <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:6 }}>
            {STAT_CONFIG.map(cfg => {
              const val = bossCard.stats?.[cfg.key] ?? 0;
              const pct = statPercent(cfg.key, val);
              const isWeak = cfg.key === boss.weakness;
              return (
                <div key={cfg.key} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:11, width:16, textAlign:'center' }}>{cfg.icon}</span>
                  <span style={{ fontSize:8, color: isWeak?'#4caf50':rs.color, fontFamily:'monospace',
                    width:64, letterSpacing:'.06em' }}>
                    {cfg.label}{isWeak?' 💚':''}
                  </span>
                  <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.06)', borderRadius:2 }}>
                    <div style={{ width:`${pct}%`, height:'100%', borderRadius:2,
                      background: isWeak ? '#4caf50' : rs.color }} />
                  </div>
                  <span style={{ fontSize:8, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', width:28, textAlign:'right' }}>
                    {val > 999 ? `${Math.round(val/1000)}k` : val}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ background:'rgba(76,175,80,0.12)', border:'1px solid rgba(76,175,80,0.3)',
            borderRadius:6, padding:'6px 12px', textAlign:'center' }}>
            <div style={{ fontSize:8, color:'#4caf50', fontFamily:'monospace', letterSpacing:'.1em' }}>
              WEAKNESS
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', fontFamily:'monospace', marginTop:2 }}>
              {boss.wNote}
            </div>
          </div>
        </div>

        <div style={{ background:'rgba(232,192,64,0.08)', border:'1px solid rgba(232,192,64,0.2)',
          borderRadius:8, padding:'10px 14px', textAlign:'center' }}>
          <div style={{ fontSize:9, color:'rgba(232,192,64,0.6)', fontFamily:'monospace', letterSpacing:'.1em' }}>
            WIN REWARD
          </div>
          <div style={{ fontSize:14, color:'#e8c040', fontFamily:'monospace', fontWeight:700, marginTop:4 }}>
            +{RAID_WIN_TICKETS} 🎫 + Spirit Card
          </div>
        </div>

        {collCards.length < 1 ? (
          <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', fontFamily:'monospace',
            fontSize:10 }}>Pull some cards first!</div>
        ) : (
          <button onClick={() => setPhase('team')} style={{
            background:'linear-gradient(135deg,#c62828,#8b0000)',
            border:'none', borderRadius:10, padding:'14px', cursor:'pointer',
            color:'#fff', fontFamily:'monospace', fontWeight:700, fontSize:12, letterSpacing:'.12em',
          }}>
            SELECT TEAM →
          </button>
        )}
      </div>
    );
  }

  // ── TEAM SELECTION ────────────────────────────────────────────────────────
  if (phase === 'team') return (
    <div style={{ padding:'12px', display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={() => setPhase('lobby')} style={{ background:'transparent',
          border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, padding:'4px 10px',
          color:'rgba(255,255,255,0.4)', fontSize:9, fontFamily:'monospace', cursor:'pointer' }}>
          ← BACK
        </button>
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'monospace' }}>
          Select up to 3 cards
        </div>
        <div style={{ fontSize:11, color:'#e8c040', fontFamily:'monospace', fontWeight:700 }}>
          {team.length}/3
        </div>
      </div>

      {/* Selected team preview */}
      {team.length > 0 && (
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          {team.map(c => <RailCard key={c.id} card={c} size="sm" />)}
        </div>
      )}

      {/* Card grid */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
        {collCards.sort((a,b)=>(b.stats?.overall??0)-(a.stats?.overall??0)).map(card => {
          const inTeam = team.find(c => c.id === card.id);
          return (
            <div key={card.id} onClick={() => toggleTeam(card)} style={{ position:'relative', cursor:'pointer' }}>
              <RailCard card={card} size="sm" dimmed={!inTeam && team.length >= 3} />
              {inTeam && (
                <div style={{ position:'absolute', inset:0, border:'2px solid #4caf50',
                  borderRadius:8, pointerEvents:'none', boxShadow:'0 0 12px rgba(76,175,80,0.4)' }}>
                  <div style={{ position:'absolute', top:4, right:4, background:'#4caf50',
                    borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:9, color:'#fff', fontWeight:700 }}>✓</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={launchRaid} disabled={team.length < 1} style={{
        background: team.length >= 1 ? 'linear-gradient(135deg,#c62828,#8b0000)' : 'rgba(255,255,255,0.06)',
        border:'none', borderRadius:10, padding:'14px', cursor:team.length>=1?'pointer':'not-allowed',
        color: team.length >= 1 ? '#fff' : 'rgba(255,255,255,0.25)',
        fontFamily:'monospace', fontWeight:700, fontSize:12, letterSpacing:'.12em',
      }}>
        LAUNCH RAID ⚔️
      </button>
    </div>
  );

  // ── FIGHTING ─────────────────────────────────────────────────────────────
  if (phase === 'fighting') {
    const rs = RARITY[boss.rarity] ?? RARITY.E;
    return (
      <div style={{ padding:'20px 16px', display:'flex', flexDirection:'column', gap:16, alignItems:'center' }}>
        <div style={{ fontSize:14, color:'#e8c040', fontFamily:'Georgia,serif', fontWeight:700 }}>
          ⚔️ Raid in Progress
        </div>

        {/* Boss HP bar */}
        <div style={{ width:'100%' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:10, color:rs.color, fontFamily:'monospace' }}>{boss.title}</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'monospace' }}>{bossHp}% HP</span>
          </div>
          <div style={{ height:8, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ width:`${bossHp}%`, height:'100%', background:rs.color, borderRadius:4,
              transition:'width 0.8s ease-out', boxShadow:`0 0 8px ${rs.glow}` }} />
          </div>
        </div>

        {/* Rounds */}
        <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:8 }}>
          {rounds.slice(0, roundIdx).map((r, i) => {
            const cfg = STAT_CONFIG.find(s => s.key === r.stat);
            return (
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8,
                padding:'10px 12px', border:`1px solid ${r.win?'rgba(76,175,80,0.3)':'rgba(239,83,80,0.3)'}`,
                animation:'fadeUp 0.3s ease-out' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontFamily:'monospace' }}>
                    {cfg?.icon} {cfg?.label}
                    {r.isWeak && <span style={{ color:'#4caf50' }}> ×1.5 WEAKNESS!</span>}
                  </span>
                  <span style={{ fontSize:11, fontWeight:700, fontFamily:'monospace',
                    color: r.win?'#4caf50':'#ef5350' }}>
                    {r.win ? '✅ HIT' : '❌ BLOCKED'}
                  </span>
                </div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', marginTop:4 }}>
                  {r.card.title}: {formatStat(r.stat, r.pVal)} vs Boss: {formatStat(r.stat, r.bVal)}
                </div>
              </div>
            );
          })}
          {roundIdx < rounds.length && (
            <div style={{ textAlign:'center', padding:12 }}>
              <div className="spinner" style={{ display:'inline-block', width:20, height:20,
                border:'2px solid rgba(232,192,64,0.2)', borderTop:'2px solid #c9a833' }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const spiritCard = victory ? {
      ...bossCard,
      id: `spirit_${bossCard.id}_${Date.now()}`,
      title: `✦ ${bossCard.title} Spirit`,
      rarity: 'L',
      extract: `A Spirit earned by defeating ${boss.title} in a raid!`,
    } : null;

    return (
      <div style={{ padding:'24px 16px', display:'flex', flexDirection:'column', gap:20, alignItems:'center' }}>
        <div style={{ fontSize:52, animation:'popIn 0.4s ease-out' }}>
          {victory ? '🏆' : '💀'}
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:22, fontFamily:'Georgia,serif', fontWeight:700,
            color: victory ? '#e8c040' : '#ef5350', marginBottom:6 }}>
            {victory ? 'RAID CLEAR!' : 'DEFEATED'}
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'monospace' }}>
            {victory ? `${boss.title} has been defeated!` : 'Better luck tomorrow...'}
          </div>
        </div>

        {victory && (
          <div style={{ background:'rgba(232,192,64,0.08)', border:'1px solid rgba(232,192,64,0.3)',
            borderRadius:12, padding:'16px 20px', width:'100%', textAlign:'center' }}>
            <div style={{ fontSize:8, color:'rgba(232,192,64,0.5)', fontFamily:'monospace',
              letterSpacing:'.15em', marginBottom:8 }}>REWARDS</div>
            <div style={{ fontSize:18, color:'#e8c040', fontFamily:'monospace', fontWeight:700,
              marginBottom:12 }}>
              +{RAID_WIN_TICKETS} 🎫
            </div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:'monospace',
              letterSpacing:'.1em', marginBottom:8 }}>SPIRIT CARD EARNED</div>
            <div style={{ display:'flex', justifyContent:'center' }}>
              <RailCard card={{ ...bossCard, title:`✦ ${boss.title}`, rarity:'L' }} size="md" />
            </div>
          </div>
        )}

        <button onClick={() => {
          onEarn?.(victory ? RAID_WIN_TICKETS : 0, victory ? spiritCard : null);
          setPhase('lobby');
          setTeam([]);
        }} style={{
          background: victory
            ? 'linear-gradient(135deg,#c9a833,#8a6d1a)'
            : 'rgba(255,255,255,0.08)',
          border:'none', borderRadius:10, padding:'14px 32px',
          color: victory ? '#1a0e00' : 'rgba(255,255,255,0.5)',
          fontFamily:'monospace', fontWeight:700, fontSize:12, letterSpacing:'.12em',
          cursor:'pointer', width:'100%',
        }}>
          {victory ? 'CLAIM REWARDS' : 'BACK TO RAID'}
        </button>
      </div>
    );
  }

  return null;
}
