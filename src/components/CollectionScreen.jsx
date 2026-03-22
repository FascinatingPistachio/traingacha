import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import CardDetailModal from './CardDetailModal.jsx';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent, formatStat } from '../utils/stats.js';
import { soundFavourite } from '../utils/sounds.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';

const SORT_OPTIONS = [
  { value:'rarity',   label:'✦ Rarity'     },
  { value:'overall',  label:'⚡ Power'     },
  { value:'speed',    label:'💨 Speed'     },
  { value:'power',    label:'🔋 Power kW'  },
  { value:'heritage', label:'🏛 Heritage' },
  { value:'fame',     label:'⭐ Fame'      },
  { value:'views',    label:'📊 Famous'    },
  { value:'newest',   label:'🆕 New first' },
  { value:'name',     label:'🔤 A–Z'      },
];

// ── Safe image ──────────────────────────────────────────────────────────────
function SafeImg({ src, alt, className, style }) {
  const [status, setStatus] = useState('loading'); // loading | ok | err
  const ref = useRef(null);
  useEffect(() => { setStatus('loading'); }, [src]);
  useEffect(() => {
    const el = ref.current;
    if (el?.complete) setStatus(el.naturalWidth > 0 ? 'ok' : 'err');
  }, [src]);
  if (!src || status === 'err') {
    return (
      <div style={{ ...style, display:'flex', alignItems:'center', justifyContent:'center',
        background:'linear-gradient(135deg,#1a2a3a,#0d1822)', flexDirection:'column', gap:4 }}>
        <svg width="32" height="19" viewBox="0 0 80 42" fill="none">
          <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(255,255,255,0.12)"/>
          <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(255,255,255,0.08)"/>
          <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"/>
          <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"/>
        </svg>
      </div>
    );
  }
  return (
    <div style={{ ...style, position:'relative', overflow:'hidden' }}>
      {status === 'loading' && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
          justifyContent:'center', background:'#1a2535' }}>
          <div className="spinner" style={{ width:16, height:16 }} />
        </div>
      )}
      <img ref={ref} src={src} alt={alt} className={className}
        onLoad={() => setStatus('ok')} onError={() => setStatus('err')}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
          opacity: status==='ok' ? 1 : 0, transition:'opacity 0.3s' }} />
    </div>
  );
}

// ── Mini character face ──────────────────────────────────────────────────────
function CharFace({ character, size = 24 }) {
  const [url, setUrl] = useState(null);
  const [ok,  setOk]  = useState(false);
  useEffect(() => {
    if (!character?.character) return;
    let cancelled = false;
    fetchFandomCharacterImage(character.character, false)
      .then(u => { if (!cancelled) setUrl(u); }).catch(() => {});
    return () => { cancelled = true; };
  }, [character?.character]);

  const col = character?.color ?? '#1565c0';
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden',
      background:col, flexShrink:0, position:'relative',
      border:'1.5px solid rgba(255,255,255,0.7)',
      boxShadow:`0 1px 6px ${col}66`,
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:size*0.4, fontWeight:900, color:'rgba(255,255,255,0.9)',
        fontFamily:'Georgia,serif', position:'absolute', zIndex:1 }}>
        {character?.character?.charAt(0)}
      </span>
      {url && (
        <img src={url} alt="" onLoad={() => setOk(true)} onError={() => setUrl(null)}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity: ok ? 1 : 0, transition:'opacity 0.3s', zIndex:2 }} />
      )}
    </div>
  );
}

// ── Card tile with 3D tilt ───────────────────────────────────────────────────
const TILE_W = 150;
const TILE_H = 228;

function CardTile({ card, isFav, onFav, onClick }) {
  const rs      = RARITY[card.rarity] ?? RARITY.C;
  const isTF    = card.character?.show === 'Thomas & Friends';
  const stats   = card.stats;
  const ref     = useRef(null);
  const raf     = useRef(null);

  const topStat = useMemo(() => stats
    ? STAT_CONFIG.reduce((best, cfg) =>
        statPercent(cfg.key, stats[cfg.key]??0) > statPercent(best.key, stats[best.key]??0) ? cfg : best
      , STAT_CONFIG[0])
    : null, [stats]);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r  = el.getBoundingClientRect();
      const cx = (e.clientX ?? e.touches?.[0]?.clientX) - r.left;
      const cy = (e.clientY ?? e.touches?.[0]?.clientY) - r.top;
      if (cx == null || isNaN(cx)) return;
      const rx = ((cy / r.height) - 0.5) * -14;
      const ry = ((cx / r.width)  - 0.5) *  14;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06) translateZ(6px)`;
      const shine = el.querySelector('.t-shine');
      if (shine) {
        const mx = (cx/r.width)*100, my = (cy/r.height)*100;
        shine.style.background = `radial-gradient(ellipse at ${mx}% ${my}%,rgba(255,255,255,0.18) 0%,transparent 65%)`;
        shine.style.opacity = '1';
      }
    });
  }, []);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (!ref.current) return;
    ref.current.style.transform = 'rotateX(0) rotateY(0) scale(1) translateZ(0)';
    const shine = ref.current.querySelector('.t-shine');
    if (shine) shine.style.opacity = '0';
  }, []);

  const starsN = { C:1, R:2, E:3, L:4, M:4 }[card.rarity] ?? 1;

  return (
    <div style={{ perspective: 700, cursor:'pointer' }} onClick={onClick}>
      <div ref={ref}
        onMouseMove={onMove} onMouseLeave={onLeave}
        style={{
          width:TILE_W, height:TILE_H,
          borderRadius:10,
          border:`1.5px solid ${rs.border}`,
          background:`linear-gradient(180deg,${rs.bg},#020610)`,
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          transformStyle:'preserve-3d',
          transition:'transform 0.08s ease-out, box-shadow 0.2s',
          boxShadow: card.rarity==='L'
            ? `0 6px 24px rgba(0,0,0,0.7),0 0 16px ${rs.glow}`
            : card.rarity==='M'
            ? `0 6px 24px rgba(0,0,0,0.7),0 0 20px rgba(140,100,255,0.4)`
            : '0 4px 14px rgba(0,0,0,0.55)',
          position:'relative',
        }}
        className={card.rarity==='L'?'glow-L':card.rarity==='M'?'glow-M':''}
      >
        {/* Shine */}
        <div className="t-shine" style={{
          position:'absolute', inset:0, zIndex:25, pointerEvents:'none',
          borderRadius:'inherit', opacity:0, transition:'opacity 0.12s',
        }}/>

        {/* Holo foil */}
        {(card.rarity==='L'||card.rarity==='M') && (
          <div className={card.rarity==='M'?'tc-foil-M':'tc-foil-L'}
            style={{position:'absolute',inset:0,zIndex:15,pointerEvents:'none',borderRadius:'inherit'}}/>
        )}

        {/* Rarity strip */}
        <div style={{ height:13, flexShrink:0,
          background:`linear-gradient(90deg,${rs.bg},transparent)`,
          borderBottom:`1px solid ${rs.border}44`,
          display:'flex', alignItems:'center', paddingLeft:5, paddingRight:5, gap:2 }}>
          {Array.from({length:starsN}).map((_,i)=>(
            <span key={i} style={{fontSize:6.5,color:rs.color,filter:`drop-shadow(0 0 2px ${rs.glow})`}}>★</span>
          ))}
          <span style={{flex:1}}/>
          <span style={{fontSize:6.5,color:rs.color,fontFamily:'monospace',fontWeight:700,letterSpacing:'.08em'}}>
            {card.rarity==='M'?'???':rs.name.toUpperCase()}
          </span>
        </div>

        {/* Image */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <SafeImg src={card.image} alt={card.title}
            style={{ width:TILE_W-3, height:96 }} />
          {/* Bottom gradient */}
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:28,
            background:`linear-gradient(transparent,${rs.bg})`,pointerEvents:'none'}}/>
          {/* Thomas badge */}
          {isTF && card.character && (
            <div style={{position:'absolute',bottom:4,left:4,
              display:'flex',alignItems:'center',gap:3}}>
              <CharFace character={card.character} size={22}/>
              <span style={{fontSize:7.5,fontWeight:700,color:'#fff',fontFamily:'Georgia,serif',
                textShadow:'0 1px 4px rgba(0,0,0,0.9)',
                maxWidth:70,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
                {card.character.character}
              </span>
            </div>
          )}
          {/* Duplicate badge */}
          {(card.count??1) > 1 && (
            <div style={{position:'absolute',top:3,left:3,
              background:'rgba(0,0,0,0.82)',border:`1px solid ${rs.border}`,
              borderRadius:4,padding:'1px 4px',
              fontSize:7,color:rs.color,fontFamily:'monospace'}}>
              ×{card.count}
            </div>
          )}
          {/* Fav */}
          {onFav && (
            <button onClick={e=>{e.stopPropagation();onFav();}} style={{
              position:'absolute',top:3,right:3,zIndex:10,
              background:'rgba(0,0,0,0.72)',
              border:`1px solid ${isFav?'rgba(255,80,80,0.6)':'rgba(255,255,255,0.12)'}`,
              borderRadius:'50%',width:16,height:16,cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:8,color:isFav?'#ff6b6b':'rgba(255,255,255,0.3)',
            }}>{isFav?'♥':'♡'}</button>
          )}
        </div>

        {/* Card body */}
        <div style={{ flex:1, padding:'5px 6px', display:'flex', flexDirection:'column', gap:3,
          overflow:'hidden', minHeight:0 }}>
          {/* Title */}
          <div style={{ fontSize:9, fontWeight:700, color:'#f0e8d8',
            fontFamily:'Georgia,serif', lineHeight:1.25,
            overflow:'hidden', display:'-webkit-box',
            WebkitLineClamp:2, WebkitBoxOrient:'vertical', flexShrink:0 }}>
            {card.title}
          </div>

          {/* Top Trumps stat bars */}
          {stats ? (
            <div style={{ display:'flex', flexDirection:'column', gap:2.5, flex:1, justifyContent:'center' }}>
              {STAT_CONFIG.slice(0,4).map(cfg => {
                const val = stats[cfg.key] ?? 0;
                const pct = statPercent(cfg.key, val);
                const top = topStat?.key === cfg.key;
                return (
                  <div key={cfg.key} style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <span style={{ fontSize:8, width:13, textAlign:'center', lineHeight:1 }}>{cfg.icon}</span>
                    <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.07)',
                      borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', borderRadius:2,
                        background: top ? cfg.color : `${cfg.color}77`,
                        boxShadow: top ? `0 0 4px ${cfg.color}` : 'none' }}/>
                    </div>
                    <span style={{ fontSize:7, fontFamily:'monospace', lineHeight:1, flexShrink:0,
                      width:24, textAlign:'right',
                      color: top ? cfg.color : 'rgba(255,255,255,0.35)',
                      fontWeight: top ? 700 : 400 }}>
                      {cfg.key==='speed' ? val
                        : cfg.key==='power' && val>=1000 ? `${Math.round(val/1000)}k`
                        : val}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.15)', fontFamily:'monospace' }}>
                no stats
              </span>
            </div>
          )}

          {/* Power score */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
            borderTop:`1px solid ${rs.border}33`, paddingTop:3, flexShrink:0 }}>
            <span style={{ fontSize:7, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>PWR</span>
            <span style={{ fontSize:11, fontWeight:800, fontFamily:'monospace',
              color:rs.color, textShadow:`0 0 5px ${rs.glow}` }}>
              {stats?.overall ?? '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Deck banner ─────────────────────────────────────────────────────────────
function DeckBanner({ entries }) {
  const ws = entries.filter(e => e.stats);
  if (!ws.length) return null;
  const byR    = entries.reduce((a,e)=>{a[e.rarity]=(a[e.rarity]??0)+1;return a;},{});
  const avg    = Math.round(ws.reduce((s,c)=>s+(c.stats.overall??0),0)/ws.length);
  const best   = [...ws].sort((a,b)=>(b.stats.overall??0)-(a.stats.overall??0))[0];
  const topSpd = Math.max(...ws.map(c=>c.stats.speed??0));

  return (
    <div style={{ background:'linear-gradient(135deg,#0d1f33,#081524)',
      border:'1px solid rgba(201,168,51,0.2)', borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
      <div style={{ fontSize:7.5, color:'rgba(201,168,51,0.5)', fontFamily:'monospace',
        letterSpacing:'.15em', marginBottom:10 }}>⚡ DECK OVERVIEW</div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:10 }}>
        {[
          { l:'CARDS',   v:entries.length },
          { l:'AVG PWR', v:avg },
          { l:'TOP SPD', v:topSpd },
          { l:'CHARS',   v:entries.filter(e=>e.character).length },
        ].map(s=>(
          <div key={s.l} style={{textAlign:'center'}}>
            <div style={{fontSize:13,color:'#c9a833',fontFamily:'monospace',fontWeight:700}}>{s.v}</div>
            <div style={{fontSize:6.5,color:'rgba(255,255,255,0.2)',fontFamily:'monospace',marginTop:1}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Rarity bar */}
      <div style={{ display:'flex', gap:1.5, height:5, borderRadius:3, overflow:'hidden', marginBottom:6 }}>
        {['M','L','E','R','C'].map(r=>{
          const n = byR[r]??0;
          if(!n) return null;
          return (
            <div key={r} title={`${RARITY[r].name}: ${n}`}
              style={{ flex:n, background:RARITY[r].color, opacity:0.85 }}/>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {['M','L','E','R','C'].filter(r=>byR[r]>0).map(r=>(
          <span key={r} style={{fontSize:8,fontFamily:'monospace',color:RARITY[r].color}}>
            {RARITY[r].short}:{byR[r]}
          </span>
        ))}
      </div>
      {best && (
        <div style={{marginTop:8,fontSize:8.5,color:'rgba(255,255,255,0.2)',fontFamily:'monospace'}}>
          👑 <span style={{color:'rgba(255,255,255,0.4)'}}>{best.title}</span> — {best.stats.overall} pts
        </div>
      )}
    </div>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function CollectionScreen({ collection, favourites = new Set(), onToggleFav }) {
  const [filter,   setFilter]   = useState('ALL');
  const [sort,     setSort]     = useState('rarity');
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [favOnly,  setFavOnly]  = useState(false);
  const [charOnly, setCharOnly] = useState(false);

  const entries = useMemo(() => Object.values(collection ?? {}), [collection]);

  const filtered = useMemo(() => entries
    .filter(e => filter==='ALL' || e.rarity===filter)
    .filter(e => !favOnly  || favourites.has(e.id))
    .filter(e => !charOnly || !!e.character)
    .filter(e => !search
      || e.title?.toLowerCase().includes(search.toLowerCase())
      || e.character?.character?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort==='rarity')   return (RARITY[b.rarity]?.rank??0)-(RARITY[a.rarity]?.rank??0);
      if (sort==='overall')  return (b.stats?.overall??0)-(a.stats?.overall??0);
      if (sort==='speed')    return (b.stats?.speed??0)-(a.stats?.speed??0);
      if (sort==='power')    return (b.stats?.power??0)-(a.stats?.power??0);
      if (sort==='heritage') return (b.stats?.heritage??0)-(a.stats?.heritage??0);
      if (sort==='fame')     return (b.stats?.fame??0)-(a.stats?.fame??0);
      if (sort==='views')    return (b.views??0)-(a.views??0);
      if (sort==='newest')   return new Date(b.addedAt??0)-new Date(a.addedAt??0);
      if (sort==='name')     return (a.title??'').localeCompare(b.title??'');
      return 0;
    }),
    [entries, filter, sort, search, favOnly, charOnly, favourites]
  );

  const byR = useMemo(() =>
    entries.reduce((a,e)=>{a[e.rarity]=(a[e.rarity]??0)+1;return a;},{}),
    [entries]);

  if (!entries.length) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'60vh', gap:16, padding:32 }}>
      <div style={{ fontSize:52 }}>📦</div>
      <div style={{ color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
        fontSize:12, textAlign:'center', lineHeight:2 }}>
        No cards yet.<br/>Open a pack to get started!
      </div>
    </div>
  );

  return (
    <div style={{ padding:'12px 10px', maxWidth:560, margin:'0 auto' }}>

      <div style={{ textAlign:'center', marginBottom:12 }}>
        <div style={{ color:'#c9a833', fontSize:13, fontFamily:'monospace',
          fontWeight:700, letterSpacing:'.2em' }}>COLLECTION</div>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.18)', fontFamily:'monospace',
          marginTop:2 }}>
          {entries.length} UNIQUE · {entries.reduce((s,e)=>s+(e.count??1),0)} TOTAL
        </div>
      </div>

      <DeckBanner entries={entries} />

      {/* Rarity chips */}
      <div style={{ display:'flex', gap:5, marginBottom:10, overflowX:'auto', paddingBottom:2 }}>
        {[['ALL', entries.length, 'rgba(201,168,51,0.5)', 'rgba(201,168,51,0.15)', '#c9a833'],
          ...['M','L','E','R','C'].filter(r=>byR[r]>0).map(r=>[r, byR[r], RARITY[r].border, RARITY[r].bg, RARITY[r].color])
        ].map(([r, n, bdr, bg, col]) => {
          const active = filter===r;
          return (
            <button key={r} onClick={()=>setFilter(f=>f===r?'ALL':r)} style={{
              background: active ? bg : 'transparent',
              border:`1px solid ${active ? bdr : 'rgba(255,255,255,0.07)'}`,
              borderRadius:20, padding:'5px 11px', cursor:'pointer', flexShrink:0,
              fontSize:8.5, color: active ? col : 'rgba(255,255,255,0.3)',
              fontFamily:'monospace', fontWeight:700,
              boxShadow: active ? `0 0 8px ${bdr}` : 'none',
              transition:'all 0.15s',
            }}>
              {r==='ALL'?`ALL ${n}`:`${RARITY[r]?.short??r} ${n}`}
            </button>
          );
        })}
      </div>

      {/* Search + fav/char toggles */}
      <div style={{ display:'flex', gap:6, marginBottom:8, alignItems:'center' }}>
        <div style={{ flex:1, position:'relative' }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)',
            fontSize:11, color:'rgba(255,255,255,0.2)', pointerEvents:'none' }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search…"
            style={{ width:'100%', boxSizing:'border-box',
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:8, padding:'7px 8px 7px 28px',
              color:'#e8e0d0', fontSize:10, outline:'none', fontFamily:'monospace' }} />
        </div>
        {[
          [favOnly, ()=>setFavOnly(v=>!v), '♥', 'rgba(255,80,80,0.15)', 'rgba(255,80,80,0.4)', '#ff6b6b'],
          [charOnly, ()=>setCharOnly(v=>!v), '🚂', 'rgba(181,123,238,0.15)', 'rgba(181,123,238,0.4)', '#b57bee'],
        ].map(([active, toggle, icon, activeBg, activeBdr, activeCol], i)=>(
          <button key={i} onClick={toggle} style={{
            width:34, height:34, borderRadius:8, cursor:'pointer',
            background: active ? activeBg : 'rgba(255,255,255,0.04)',
            border:`1px solid ${active ? activeBdr : 'rgba(255,255,255,0.08)'}`,
            color: active ? activeCol : 'rgba(255,255,255,0.3)',
            fontSize:15, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
          }}>{icon}</button>
        ))}
      </div>

      {/* Sort chips */}
      <div style={{ display:'flex', gap:5, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
        {SORT_OPTIONS.map(o=>(
          <button key={o.value} onClick={()=>setSort(o.value)} style={{
            background: sort===o.value?'rgba(201,168,51,0.12)':'transparent',
            border:`1px solid ${sort===o.value?'rgba(201,168,51,0.4)':'rgba(255,255,255,0.06)'}`,
            borderRadius:20, padding:'4px 10px', cursor:'pointer', flexShrink:0,
            fontSize:8.5, color:sort===o.value?'#c9a833':'rgba(255,255,255,0.28)',
            fontFamily:'monospace', whiteSpace:'nowrap',
          }}>{o.label}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 20px',
          color:'rgba(255,255,255,0.18)', fontFamily:'monospace', fontSize:10 }}>
          No cards match.
        </div>
      ) : (
        <>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
            {filtered.map(card=>(
              <CardTile key={card.id} card={card}
                isFav={favourites.has(card.id)}
                onFav={()=>{ soundFavourite(); onToggleFav?.(card.id); }}
                onClick={()=>setSelected(card)} />
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:14, fontSize:8,
            color:'rgba(255,255,255,0.12)', fontFamily:'monospace' }}>
            {filtered.length} card{filtered.length!==1?'s':''} · tap to inspect
          </div>
        </>
      )}

      {selected && (
        <CardDetailModal
          card={selected}
          count={selected.count ?? 1}
          isFav={favourites.has(selected.id)}
          onFav={()=>{ soundFavourite(); onToggleFav?.(selected.id); }}
          onClose={()=>setSelected(null)}
        />
      )}
    </div>
  );
}
