import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import CardDetailModal from './CardDetailModal.jsx';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent, formatStat } from '../utils/stats.js';
import { soundFavourite } from '../utils/sounds.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';

const SORT_OPTIONS = [
  { value:'rarity',   label:'✦ Rarity'        },
  { value:'overall',  label:'⚡ Power Score'  },
  { value:'speed',    label:'💨 Speed'        },
  { value:'power',    label:'⚡ Power'        },
  { value:'heritage', label:'🏛 Heritage'    },
  { value:'fame',     label:'⭐ Fame'         },
  { value:'views',    label:'📊 Most Famous' },
  { value:'newest',   label:'🆕 Newest'      },
  { value:'name',     label:'🔤 A – Z'       },
];

// ── Mini character portrait ─────────────────────────────────────────────────
function MiniChar({ character, size = 26 }) {
  const [url, setUrl] = useState(null);
  const [ok,  setOk]  = useState(false);
  useEffect(() => {
    fetchFandomCharacterImage(character.character, false)
      .then(u => setUrl(u)).catch(() => {});
  });
  const col = character.color ?? '#1565c0';
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden',
      background:col, border:'1.5px solid rgba(255,255,255,0.7)', flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:`0 2px 8px ${col}66`, position:'relative' }}>
      <span style={{ fontSize:size*0.38, fontWeight:900, color:'rgba(255,255,255,0.9)',
        fontFamily:'Georgia,serif', position:'absolute' }}>
        {character.character.charAt(0)}
      </span>
      {url && <img src={url} alt={character.character} onLoad={() => setOk(true)}
        style={{ position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', opacity: ok ? 1 : 0, transition:'opacity 0.3s' }} />}
    </div>
  );
}

// ── Compact Top-Trumps card tile ────────────────────────────────────────────
function CardTile({ card, isFav, onFav, onClick }) {
  const rs     = RARITY[card.rarity] ?? RARITY.C;
  const tiltRef = useRef(null);
  const rafRef  = useRef(null);
  const isTF   = card.character?.show === 'Thomas & Friends';
  const stats  = card.stats;

  // Top stat for this card
  const topStat = stats
    ? STAT_CONFIG.reduce((best, cfg) =>
        statPercent(cfg.key, stats[cfg.key]??0) > statPercent(best.key, stats[best.key]??0) ? cfg : best,
        STAT_CONFIG[0])
    : null;

  const onMouseMove = useCallback((e) => {
    const el = tiltRef.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!tiltRef.current) return;
      const r  = el.getBoundingClientRect();
      const rx = ((e.clientY - r.top)  / r.height - 0.5) * -12;
      const ry = ((e.clientX - r.left) / r.width  - 0.5) *  12;
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top)  / r.height) * 100;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.05) translateZ(8px)`;
      const shine = el.querySelector('.tile-shine');
      if (shine) { shine.style.setProperty('--mx',`${mx}%`); shine.style.setProperty('--my',`${my}%`); shine.style.opacity='1'; }
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (tiltRef.current) tiltRef.current.style.transform = 'rotateX(0) rotateY(0) scale(1) translateZ(0)';
    const shine = tiltRef.current?.querySelector('.tile-shine');
    if (shine) shine.style.opacity = '0';
  }, []);

  const W = 155, H = 220;

  return (
    <div style={{ perspective:700 }} onClick={onClick}>
      <div ref={tiltRef}
        onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
        style={{
          width: W, height: H,
          borderRadius: 10, overflow:'hidden', cursor:'pointer',
          border:`1.5px solid ${rs.border}`,
          background:`linear-gradient(180deg,${rs.bg},#030610)`,
          transformStyle:'preserve-3d',
          transition:'transform 0.08s ease-out',
          boxShadow: card.rarity === 'L'
            ? `0 0 18px ${rs.glow}, 0 6px 24px rgba(0,0,0,0.7)`
            : card.rarity === 'M'
            ? `0 0 22px rgba(140,100,255,0.5), 0 6px 24px rgba(0,0,0,0.7)`
            : '0 4px 16px rgba(0,0,0,0.6)',
          position:'relative',
        }}
        className={card.rarity === 'L' ? 'glow-L' : card.rarity === 'M' ? 'glow-M' : ''}
      >
        {/* Shine overlay */}
        <div className="tile-shine" style={{
          position:'absolute', inset:0, zIndex:20, pointerEvents:'none',
          borderRadius:'inherit', opacity:0, transition:'opacity 0.15s',
          background:'radial-gradient(ellipse at var(--mx,50%) var(--my,50%),rgba(255,255,255,0.18) 0%,transparent 65%)',
        }} />

        {/* Holographic foil for high rarity */}
        {(card.rarity === 'L' || card.rarity === 'M') && (
          <div className={card.rarity === 'M' ? 'tc-foil-M' : 'tc-foil-L'} style={{
            position:'absolute', inset:0, zIndex:15, pointerEvents:'none', borderRadius:'inherit',
          }} />
        )}

        {/* Rarity strip */}
        <div style={{ height:14, background:`linear-gradient(90deg,${rs.bg},transparent)`,
          borderBottom:`1px solid ${rs.border}44`,
          display:'flex', alignItems:'center', paddingLeft:6, paddingRight:6, gap:2 }}>
          {Array.from({length: card.rarity==='C'?1:card.rarity==='R'?2:card.rarity==='E'?3:4}).map((_,i)=>(
            <span key={i} style={{fontSize:7,color:rs.color,filter:`drop-shadow(0 0 2px ${rs.glow})`}}>★</span>
          ))}
          <span style={{flex:1}}/>
          <span style={{fontSize:7,color:rs.color,fontFamily:'monospace',fontWeight:700,letterSpacing:'.08em'}}>
            {card.rarity==='M'?'???':rs.name.toUpperCase()}
          </span>
        </div>

        {/* Photo */}
        <div style={{ height:100, overflow:'hidden', position:'relative', background:'#d0d0d0', flexShrink:0 }}>
          <img src={card.image} alt={card.title}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          {/* Bottom gradient */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:30,
            background:`linear-gradient(transparent,${rs.bg})` }} />
          {/* Thomas badge overlay */}
          {isTF && card.character && (
            <div style={{ position:'absolute', bottom:4, left:4, display:'flex', alignItems:'center', gap:4 }}>
              <MiniChar character={card.character} size={24} />
              <span style={{ fontSize:8, fontWeight:700, color:'#fff', fontFamily:'Georgia,serif',
                textShadow:'0 1px 4px rgba(0,0,0,0.8)', whiteSpace:'nowrap', overflow:'hidden',
                maxWidth:80, textOverflow:'ellipsis' }}>
                {card.character.character}
              </span>
            </div>
          )}
          {/* Dup badge */}
          {(card.count ?? 1) > 1 && (
            <div style={{ position:'absolute', top:4, left:4, background:'rgba(0,0,0,0.82)',
              border:`1px solid ${rs.border}`, borderRadius:4, padding:'1px 5px',
              fontSize:7.5, color:rs.color, fontFamily:'monospace' }}>
              ×{card.count}
            </div>
          )}
          {/* Fav */}
          {onFav && (
            <button onClick={e=>{e.stopPropagation();onFav();}} style={{
              position:'absolute', top:4, right:4, background:'rgba(0,0,0,0.7)',
              border:`1px solid ${isFav?'rgba(255,80,80,0.6)':'rgba(255,255,255,0.12)'}`,
              borderRadius:'50%', width:17, height:17, display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:8.5, cursor:'pointer',
              color: isFav?'#ff6b6b':'rgba(255,255,255,0.3)',
            }}>{isFav?'♥':'♡'}</button>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding:'6px 7px', flex:1, display:'flex', flexDirection:'column', gap:4 }}>
          {/* Title */}
          <div style={{ fontSize:9.5, fontWeight:700, color:'#f0e8d8', fontFamily:'Georgia,serif',
            lineHeight:1.25, overflow:'hidden', display:'-webkit-box',
            WebkitLineClamp:2, WebkitBoxOrient:'vertical', minHeight:23, flexShrink:0 }}>
            {card.title}
          </div>

          {/* Stats — Top Trumps style mini bars */}
          {stats && (
            <div style={{ display:'flex', flexDirection:'column', gap:3, flex:1 }}>
              {STAT_CONFIG.slice(0, 4).map(cfg => {
                const val = stats[cfg.key] ?? 0;
                const pct = statPercent(cfg.key, val);
                const isTop = topStat?.key === cfg.key;
                return (
                  <div key={cfg.key} style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <span style={{ fontSize:8.5, width:13, textAlign:'center', lineHeight:1, flexShrink:0 }}>{cfg.icon}</span>
                    <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', borderRadius:2,
                        background: isTop ? cfg.color : `${cfg.color}88`,
                        boxShadow: isTop ? `0 0 4px ${cfg.color}` : 'none' }} />
                    </div>
                    <span style={{ fontSize:7.5, color: isTop ? cfg.color : 'rgba(255,255,255,0.38)',
                      fontFamily:'monospace', width:22, textAlign:'right', lineHeight:1, flexShrink:0,
                      fontWeight: isTop ? 700 : 400 }}>
                      {cfg.key === 'speed' ? val : cfg.key === 'power' && val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Overall score */}
          {stats && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              borderTop:`1px solid ${rs.border}33`, paddingTop:4, flexShrink:0 }}>
              <span style={{ fontSize:7.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>PWR</span>
              <span style={{ fontSize:12, fontWeight:800, fontFamily:'monospace',
                color:rs.color, textShadow:`0 0 6px ${rs.glow}` }}>
                {stats.overall}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Deck stats dashboard ────────────────────────────────────────────────────
function DeckDashboard({ entries }) {
  const withStats = entries.filter(e => e.stats);
  if (withStats.length === 0) return null;
  const topOverall = [...withStats].sort((a,b)=>(b.stats.overall??0)-(a.stats.overall??0))[0];
  const avgScore   = Math.round(withStats.reduce((s,c)=>s+(c.stats.overall??0),0)/withStats.length);
  const topSpeed   = Math.max(...withStats.map(c=>c.stats.speed??0));
  const byRarity   = entries.reduce((acc,e)=>{acc[e.rarity]=(acc[e.rarity]??0)+1;return acc;},{});

  return (
    <div style={{ background:'linear-gradient(135deg,#0d1e32,#081525)',
      border:'1px solid rgba(201,168,51,0.18)', borderRadius:12, padding:'14px', marginBottom:14 }}>
      <div style={{ fontSize:8, color:'rgba(201,168,51,0.5)', fontFamily:'monospace',
        letterSpacing:'.15em', marginBottom:10 }}>⚡ DECK STATS</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:10 }}>
        {[
          { label:'CARDS',   val:entries.length },
          { label:'AVG PWR', val:avgScore },
          { label:'TOP SPD', val:`${topSpeed}` },
          { label:'CHARS',   val:entries.filter(e=>e.character).length },
        ].map(s => (
          <div key={s.label} style={{ textAlign:'center' }}>
            <div style={{ fontSize:14, color:'#c9a833', fontFamily:'monospace', fontWeight:700 }}>{s.val}</div>
            <div style={{ fontSize:6.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:1 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Rarity breakdown bar */}
      <div style={{ height:6, borderRadius:3, overflow:'hidden', display:'flex', gap:1 }}>
        {['M','L','E','R','C'].map(r => {
          const n = byRarity[r] ?? 0;
          if (!n) return null;
          const pct = (n / entries.length) * 100;
          return (
            <div key={r} style={{ width:`${pct}%`, height:'100%',
              background:RARITY[r].color, opacity:0.9,
              transition:'width 0.4s ease-out' }}
              title={`${RARITY[r].name}: ${n}`} />
          );
        })}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
        {['M','L','E','R','C'].filter(r => byRarity[r] > 0).map(r => (
          <span key={r} style={{ fontSize:8, fontFamily:'monospace', color:RARITY[r].color }}>
            {RARITY[r].short}: {byRarity[r]}
          </span>
        ))}
      </div>
      {topOverall && (
        <div style={{ marginTop:8, fontSize:8.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>
          👑 Best card: <span style={{ color:'rgba(255,255,255,0.45)' }}>{topOverall.title}</span>
          {' '}({topOverall.stats.overall} pts)
        </div>
      )}
    </div>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function CollectionScreen({ collection, favourites = new Set(), onToggleFav }) {
  const [filter,  setFilter]  = useState('ALL');
  const [sort,    setSort]    = useState('rarity');
  const [search,  setSearch]  = useState('');
  const [selected,setSelected]= useState(null);
  const [favOnly, setFavOnly] = useState(false);
  const [charOnly,setCharOnly]= useState(false);

  const entries = useMemo(() => Object.values(collection), [collection]);

  const filtered = useMemo(() => entries
    .filter(e => filter === 'ALL' || e.rarity === filter)
    .filter(e => !favOnly  || favourites.has(e.id))
    .filter(e => !charOnly || !!e.character)
    .filter(e => !search   || e.title.toLowerCase().includes(search.toLowerCase())
                           || e.character?.character?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'rarity')   return (RARITY[b.rarity]?.rank??0)-(RARITY[a.rarity]?.rank??0);
      if (sort === 'overall')  return (b.stats?.overall??0)-(a.stats?.overall??0);
      if (sort === 'speed')    return (b.stats?.speed??0)-(a.stats?.speed??0);
      if (sort === 'power')    return (b.stats?.power??0)-(a.stats?.power??0);
      if (sort === 'heritage') return (b.stats?.heritage??0)-(a.stats?.heritage??0);
      if (sort === 'fame')     return (b.stats?.fame??0)-(a.stats?.fame??0);
      if (sort === 'views')    return (b.views??0)-(a.views??0);
      if (sort === 'newest')   return new Date(b.addedAt??0)-new Date(a.addedAt??0);
      if (sort === 'name')     return a.title.localeCompare(b.title);
      return 0;
    }), [entries, filter, sort, search, favOnly, charOnly, favourites]);

  const byRarity = useMemo(() =>
    entries.reduce((acc,e)=>{acc[e.rarity]=(acc[e.rarity]??0)+1;return acc;},{}),
    [entries]);

  if (entries.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'60vh', gap:16, padding:32 }}>
      <div style={{ fontSize:52 }}>📦</div>
      <div style={{ color:'rgba(255,255,255,0.3)', fontFamily:'monospace', fontSize:12, textAlign:'center', lineHeight:2 }}>
        Collection empty.<br/>Open a pack to get started!
      </div>
    </div>
  );

  return (
    <div style={{ padding:'12px 10px', maxWidth:560, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:12 }}>
        <div style={{ color:'#c9a833', fontSize:13, fontFamily:'monospace', fontWeight:700,
          letterSpacing:'.2em' }}>COLLECTION</div>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace',
          marginTop:3, letterSpacing:'.1em' }}>
          {entries.length} UNIQUE · {entries.reduce((s,e)=>s+(e.count??1),0)} TOTAL
        </div>
      </div>

      {/* Deck dashboard */}
      <DeckDashboard entries={entries} />

      {/* Rarity filter chips */}
      <div style={{ display:'flex', gap:6, marginBottom:10, overflowX:'auto', paddingBottom:2 }}>
        <button onClick={()=>setFilter('ALL')} style={{
          background: filter==='ALL'?'rgba(201,168,51,0.15)':'transparent',
          border:`1px solid ${filter==='ALL'?'rgba(201,168,51,0.5)':'rgba(255,255,255,0.08)'}`,
          borderRadius:20, padding:'5px 12px', cursor:'pointer', flexShrink:0,
          fontSize:9, color:filter==='ALL'?'#c9a833':'rgba(255,255,255,0.35)',
          fontFamily:'monospace', fontWeight:700,
        }}>ALL {entries.length}</button>
        {['M','L','E','R','C'].filter(r=>byRarity[r]>0).map(r => (
          <button key={r} onClick={()=>setFilter(f=>f===r?'ALL':r)} style={{
            background: filter===r ? RARITY[r].bg : 'transparent',
            border:`1px solid ${filter===r?RARITY[r].border:'rgba(255,255,255,0.07)'}`,
            borderRadius:20, padding:'5px 11px', cursor:'pointer', flexShrink:0,
            fontSize:9, color:filter===r?RARITY[r].color:'rgba(255,255,255,0.3)',
            fontFamily:'monospace', fontWeight:700,
            boxShadow: filter===r?`0 0 8px ${RARITY[r].glow}`:'none',
          }}>
            {RARITY[r].short} {byRarity[r]??0}
          </button>
        ))}
      </div>

      {/* Search + Controls */}
      <div style={{ display:'flex', gap:6, marginBottom:10, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
            fontSize:11, color:'rgba(255,255,255,0.25)', pointerEvents:'none' }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search cards…"
            style={{ width:'100%', background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.08)', borderRadius:8,
              padding:'7px 10px 7px 28px', color:'#e8e0d0', fontSize:10,
              outline:'none', fontFamily:'monospace', boxSizing:'border-box' }} />
        </div>
        <button onClick={()=>setFavOnly(v=>!v)} style={{
          width:34, height:34, borderRadius:8, cursor:'pointer', flexShrink:0, fontSize:15,
          background: favOnly?'rgba(255,80,80,0.15)':'rgba(255,255,255,0.04)',
          border:`1px solid ${favOnly?'rgba(255,80,80,0.4)':'rgba(255,255,255,0.08)'}`,
          color: favOnly?'#ff6b6b':'rgba(255,255,255,0.3)',
        }}>♥</button>
        <button onClick={()=>setCharOnly(v=>!v)} style={{
          width:34, height:34, borderRadius:8, cursor:'pointer', flexShrink:0, fontSize:14,
          background: charOnly?'rgba(181,123,238,0.15)':'rgba(255,255,255,0.04)',
          border:`1px solid ${charOnly?'rgba(181,123,238,0.4)':'rgba(255,255,255,0.08)'}`,
          color: charOnly?'#b57bee':'rgba(255,255,255,0.3)',
        }}>🚂</button>
      </div>

      {/* Sort */}
      <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
        {SORT_OPTIONS.map(o => (
          <button key={o.value} onClick={()=>setSort(o.value)} style={{
            background: sort===o.value?'rgba(201,168,51,0.12)':'transparent',
            border:`1px solid ${sort===o.value?'rgba(201,168,51,0.4)':'rgba(255,255,255,0.06)'}`,
            borderRadius:20, padding:'4px 10px', cursor:'pointer', flexShrink:0,
            fontSize:8.5, color:sort===o.value?'#c9a833':'rgba(255,255,255,0.3)',
            fontFamily:'monospace', whiteSpace:'nowrap',
          }}>{o.label}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 20px', color:'rgba(255,255,255,0.2)',
          fontFamily:'monospace', fontSize:10 }}>
          No cards match your filters.
        </div>
      ) : (
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
          {filtered.map(card => (
            <CardTile key={card.id} card={card}
              isFav={favourites.has(card.id)}
              onFav={() => { soundFavourite(); onToggleFav?.(card.id); }}
              onClick={() => setSelected(card)} />
          ))}
        </div>
      )}

      {/* Result count */}
      {filtered.length > 0 && (
        <div style={{ textAlign:'center', marginTop:16, fontSize:8.5, color:'rgba(255,255,255,0.15)',
          fontFamily:'monospace' }}>
          {filtered.length} card{filtered.length !== 1 ? 's' : ''} shown
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <CardDetailModal card={selected} count={selected.count ?? 1}
          isFav={favourites.has(selected.id)}
          onFav={() => { soundFavourite(); onToggleFav?.(selected.id); }}
          onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
