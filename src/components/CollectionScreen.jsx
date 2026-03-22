import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import CardDetailModal from './CardDetailModal.jsx';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent } from '../utils/stats.js';
import { soundFavourite } from '../utils/sounds.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';

const SORT_OPTS = [
  { v:'rarity',  l:'✦ Rarity'   }, { v:'overall', l:'⚡ Power'   },
  { v:'speed',   l:'💨 Speed'   }, { v:'power',   l:'🔋 kW'     },
  { v:'fame',    l:'⭐ Fame'    }, { v:'views',   l:'📊 Famous' },
  { v:'newest',  l:'🆕 Newest' }, { v:'name',    l:'🔤 A–Z'   },
];

// ── Card image that actually works ──────────────────────────────────────────
function CardImg({ src, title, alt, rs }) {
  const [url,     setUrl]     = useState(src || null);
  const [loaded,  setLoaded]  = useState(false);
  const [failed,  setFailed]  = useState(!src);

  useEffect(() => { setUrl(src||null); setLoaded(false); setFailed(!src); }, [src]);

  // Fetch from Wikipedia if null
  useEffect(() => {
    if (src || !title || failed) return;
    let cancelled = false;
    import('../utils/wikiImage.js').then(m =>
      m.fetchWikiThumbnail(title, 300).then(u => {
        if (cancelled) return;
        if (u) { setUrl(u); setLoaded(false); setFailed(false); }
        else setFailed(true);
      })
    ).catch(() => setFailed(true));
    return () => { cancelled = true; };
  }, [src, title, failed]);

  return (
    // Relative container — no percentage heights on children needed
    <div style={{ width:'100%', paddingBottom:'66%', position:'relative',
      background: failed ? `linear-gradient(135deg,${rs.bg},#060f1c)` : '#1a2535',
      overflow:'hidden' }}>
      {/* Placeholder */}
      {(!loaded || failed) && (
        <div style={{ position:'absolute', inset:0, display:'flex',
          alignItems:'center', justifyContent:'center', opacity: loaded ? 0 : 0.3 }}>
          <span style={{ fontSize:28 }}>🚂</span>
        </div>
      )}
      {/* Image */}
      {url && !failed && (
        <img src={url} alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(false); }}
          style={{
            position:'absolute', top:0, left:0,
            width:'100%', height:'100%', objectFit:'cover', display:'block',
            opacity: loaded ? 1 : 0, transition:'opacity 0.35s ease-out',
          }} />
      )}
    </div>
  );
}

// ── Character portrait circle ────────────────────────────────────────────────
function CharCircle({ character, size }) {
  const [url, setUrl] = useState(null);
  const [ok,  setOk]  = useState(false);
  useEffect(() => {
    if (!character?.character) return;
    let c = false;
    fetchFandomCharacterImage(character.character, false)
      .then(u => { if (!c) setUrl(u); }).catch(() => {});
    return () => { c = true; };
  }, [character?.character]);
  const col = character?.color ?? '#1565c0';
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:col, border:'2px solid rgba(255,255,255,0.8)',
      boxShadow:`0 2px 8px ${col}77`,
      overflow:'hidden', position:'relative',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:size*0.4, fontWeight:900, color:'rgba(255,255,255,0.9)',
        fontFamily:'Georgia,serif', position:'absolute' }}>
        {(character?.character??'?').charAt(0)}
      </span>
      {url && (
        <img src={url} alt={character?.character}
          onLoad={()=>setOk(true)} onError={()=>setUrl(null)}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity:ok?1:0, transition:'opacity 0.3s' }} />
      )}
    </div>
  );
}

// ── 3D card tile ─────────────────────────────────────────────────────────────
function CardTile({ card, isFav, onFav, onClick }) {
  const rs     = RARITY[card.rarity] ?? RARITY.C;
  const ref    = useRef(null);
  const raf    = useRef(null);
  const isTF   = card.character?.show === 'Thomas & Friends';
  const stats  = card.stats;
  const isHigh = card.rarity === 'L' || card.rarity === 'M';

  const topStat = stats
    ? STAT_CONFIG.reduce((b,c) => statPercent(c.key,stats[c.key]??0) > statPercent(b.key,stats[b.key]??0) ? c : b, STAT_CONFIG[0])
    : null;

  const onMove = useCallback((e) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r  = ref.current.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top)  / r.height;
      ref.current.style.transform =
        `perspective(600px) rotateX(${(ny-0.5)*-14}deg) rotateY(${(nx-0.5)*14}deg) scale(1.05) translateZ(10px)`;
      ref.current.style.setProperty('--hx', `${nx*100}%`);
      ref.current.style.setProperty('--hy', `${ny*100}%`);
      ref.current.style.setProperty('--hi', isHigh ? '0.18' : '0.04');
      const sh = ref.current.querySelector('.tile-sh');
      if (sh) { sh.style.opacity='1'; sh.style.setProperty('--sx',`${nx*100}%`); sh.style.setProperty('--sy',`${ny*100}%`); }
    });
  }, [isHigh]);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
    ref.current.style.setProperty('--hi','0');
    const sh = ref.current.querySelector('.tile-sh');
    if (sh) sh.style.opacity='0';
  }, []);

  const starCount = card.rarity==='C'?1:card.rarity==='R'?2:card.rarity==='E'?3:4;

  return (
    <div style={{ perspective:600 }} onClick={onClick}>
      <div ref={ref}
        onMouseMove={onMove} onMouseLeave={onLeave}
        style={{
          width:148, borderRadius:10, cursor:'pointer',
          overflow:'hidden', display:'flex', flexDirection:'column',
          border:`1.5px solid ${rs.border}`,
          background:`linear-gradient(180deg,#111e2d,#060f1c)`,
          transition:'transform 0.1s ease-out, box-shadow 0.2s',
          willChange:'transform',
          boxShadow: isHigh
            ? `0 0 18px ${rs.glow}, 0 6px 24px rgba(0,0,0,0.7)`
            : '0 4px 18px rgba(0,0,0,0.6)',
          position:'relative',
        }}
        className={card.rarity==='L'?'glow-L':card.rarity==='M'?'glow-M':''}
      >
        {/* Holographic foil */}
        <div aria-hidden style={{
          position:'absolute', inset:0, zIndex:10, pointerEvents:'none',
          borderRadius:'inherit', mixBlendMode:'color-dodge',
          background: card.rarity==='M'
            ? 'linear-gradient(135deg,#ff6ec7,#7b2fff,#00d4ff,#0fff89,#ff6ec7)'
            : 'linear-gradient(135deg,#ffd700,#ffaa00,#ffe066,#ffd700)',
          backgroundSize:'200% 200%',
          backgroundPosition:'var(--hx,50%) var(--hy,50%)',
          opacity:'var(--hi,0)', transition:'opacity 0.2s',
        }} />
        {/* Shine */}
        <div className="tile-sh" aria-hidden style={{
          position:'absolute', inset:0, zIndex:11, pointerEvents:'none',
          borderRadius:'inherit', opacity:0, transition:'opacity 0.15s',
          background:'radial-gradient(ellipse 55% 40% at var(--sx,50%) var(--sy,50%),rgba(255,255,255,0.2) 0%,transparent 68%)',
        }} />

        {/* Rarity strip */}
        <div style={{ padding:'3px 7px', display:'flex', alignItems:'center', gap:2,
          borderBottom:`1px solid ${rs.border}44`, background:'rgba(0,0,0,0.3)', flexShrink:0 }}>
          {Array.from({length:starCount}).map((_,i)=>(
            <span key={i} style={{fontSize:7,color:rs.color,filter:`drop-shadow(0 0 2px ${rs.glow})`}}>★</span>
          ))}
          <span style={{flex:1}} />
          <span style={{fontSize:7,color:rs.color,fontFamily:'monospace',fontWeight:700,letterSpacing:'.08em'}}>
            {card.rarity==='M'?'???':rs.name.toUpperCase()}
          </span>
        </div>

        {/* Photo (uses padding-bottom trick for aspect ratio — works in all contexts) */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <CardImg src={card.image} title={card.title} alt={card.title} rs={rs} />
          {/* Thomas banner overlaid */}
          {isTF && card.character && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:20, zIndex:5,
              background:`linear-gradient(90deg,${card.character.color??'#1565c0'},${card.character.color??'#1565c0'}bb)`,
              display:'flex', alignItems:'center', paddingLeft:26 }}>
              <div style={{ position:'absolute', left:3, bottom:2 }}>
                <CharCircle character={card.character} size={20} />
              </div>
              <span style={{ fontSize:8, fontWeight:700, color:'#fff', fontFamily:'Georgia,serif',
                textShadow:'0 1px 3px rgba(0,0,0,0.8)', overflow:'hidden',
                whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:80 }}>
                {card.character.character}
              </span>
            </div>
          )}
          {/* Badges */}
          {(card.count??1)>1 && (
            <div style={{ position:'absolute', top:3, left:3, zIndex:6,
              background:'rgba(0,0,0,0.85)', border:`1px solid ${rs.border}`,
              borderRadius:4, padding:'1px 5px', fontSize:7, color:rs.color, fontFamily:'monospace' }}>
              ×{card.count}
            </div>
          )}
          {onFav && (
            <button onClick={e=>{e.stopPropagation();onFav();}} style={{
              position:'absolute', top:3, right:3, zIndex:6,
              background:'rgba(0,0,0,0.75)',
              border:`1px solid ${isFav?'rgba(255,80,80,0.65)':'rgba(255,255,255,0.15)'}`,
              borderRadius:'50%', width:16, height:16,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:8, cursor:'pointer', color:isFav?'#ff6b6b':'rgba(255,255,255,0.3)',
            }}>{isFav?'♥':'♡'}</button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:'5px 7px 7px', flex:1, display:'flex', flexDirection:'column', gap:3 }}>
          <div style={{ fontSize:9, fontWeight:700, color:'#f0e8d8', fontFamily:'Georgia,serif',
            lineHeight:1.25, overflow:'hidden', display:'-webkit-box',
            WebkitLineClamp:2, WebkitBoxOrient:'vertical', minHeight:21, flexShrink:0 }}>
            {card.title}
          </div>
          {/* Stat bars */}
          {stats && (
            <div style={{ display:'flex', flexDirection:'column', gap:2.5, flex:1 }}>
              {STAT_CONFIG.slice(0,4).map(cfg => {
                const val = stats[cfg.key]??0;
                const pct = statPercent(cfg.key, val);
                const top = topStat?.key === cfg.key;
                return (
                  <div key={cfg.key} style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <span style={{ fontSize:8.5, width:12, textAlign:'center', lineHeight:1 }}>{cfg.icon}</span>
                    <div style={{ flex:1, height:3.5, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', borderRadius:2,
                        background: top ? cfg.color : `${cfg.color}66`,
                        boxShadow: top ? `0 0 5px ${cfg.color}` : 'none' }} />
                    </div>
                    <span style={{ fontSize:7, fontFamily:'monospace', color:top?cfg.color:'rgba(255,255,255,0.35)',
                      width:22, textAlign:'right', lineHeight:1, fontWeight:top?700:400 }}>
                      {cfg.key==='speed'?val:cfg.key==='power'&&val>=1000?`${(val/1000).toFixed(0)}k`:val}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          {/* Power score */}
          {stats && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              borderTop:`1px solid ${rs.border}33`, paddingTop:3, marginTop:1, flexShrink:0 }}>
              <span style={{ fontSize:7, color:'rgba(255,255,255,0.18)', fontFamily:'monospace' }}>PWR</span>
              <span style={{ fontSize:13, fontWeight:900, fontFamily:'monospace',
                color:rs.color, textShadow:`0 0 8px ${rs.glow}` }}>
                {stats.overall}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Deck bar ─────────────────────────────────────────────────────────────────
function DeckBar({ entries }) {
  const ws = entries.filter(e=>e.stats);
  if (!ws.length) return null;
  const avg = Math.round(ws.reduce((s,c)=>s+(c.stats.overall??0),0)/ws.length);
  const top = Math.max(...ws.map(c=>c.stats.overall??0));
  const byR = entries.reduce((a,e)=>{a[e.rarity]=(a[e.rarity]??0)+1;return a;},{});
  return (
    <div style={{ background:'linear-gradient(135deg,#0d1e32,#081525)',
      border:'1px solid rgba(201,168,51,0.18)', borderRadius:10, padding:'10px 14px', marginBottom:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:8 }}>
        {[{l:'CARDS',v:entries.length},{l:'AVG PWR',v:avg},{l:'TOP',v:top},
          {l:'CHARS',v:entries.filter(e=>e.character).length}].map(s=>(
          <div key={s.l} style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:'#c9a833', fontFamily:'monospace', fontWeight:700 }}>{s.v}</div>
            <div style={{ fontSize:6.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:1 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ height:5, borderRadius:3, overflow:'hidden', display:'flex' }}>
        {['M','L','E','R','C'].map(r=>{
          const n=byR[r]??0; if(!n) return null;
          return <div key={r} style={{ width:`${(n/entries.length)*100}%`, height:'100%',
            background:RARITY[r].color, opacity:0.85 }} title={`${RARITY[r].name}: ${n}`} />;
        })}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:5, flexWrap:'wrap' }}>
        {['M','L','E','R','C'].filter(r=>byR[r]>0).map(r=>(
          <span key={r} style={{ fontSize:7.5, fontFamily:'monospace', color:RARITY[r].color }}>
            {RARITY[r].short}:{byR[r]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function CollectionScreen({ collection, favourites = new Set(), onToggleFav }) {
  const [filter,  setFilter]  = useState('ALL');
  const [sort,    setSort]    = useState('rarity');
  const [search,  setSearch]  = useState('');
  const [selected,setSelected]= useState(null);
  const [favOnly, setFavOnly] = useState(false);
  const [charOnly,setCharOnly]= useState(false);

  // Ensure collection is always an object
  const safeCollection = collection ?? {};
  const entries = useMemo(() => Object.values(safeCollection), [safeCollection]);

  const byRarity = useMemo(() =>
    entries.reduce((a,e)=>{a[e.rarity]=(a[e.rarity]??0)+1;return a;},{}), [entries]);

  const filtered = useMemo(() => entries
    .filter(e => filter==='ALL' || e.rarity===filter)
    .filter(e => !favOnly  || favourites.has(e.id))
    .filter(e => !charOnly || !!e.character)
    .filter(e => !search
      || (e.title??'').toLowerCase().includes(search.toLowerCase())
      || (e.character?.character??'').toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      switch(sort) {
        case 'rarity':   return (RARITY[b.rarity]?.rank??0)-(RARITY[a.rarity]?.rank??0);
        case 'overall':  return (b.stats?.overall??0)-(a.stats?.overall??0);
        case 'speed':    return (b.stats?.speed??0)-(a.stats?.speed??0);
        case 'power':    return (b.stats?.power??0)-(a.stats?.power??0);
        case 'fame':     return (b.stats?.fame??0)-(a.stats?.fame??0);
        case 'views':    return (b.views??0)-(a.views??0);
        case 'newest':   return new Date(b.addedAt??0).getTime()-new Date(a.addedAt??0).getTime();
        case 'name':     return (a.title??'').localeCompare(b.title??'');
        default:         return 0;
      }
    }), [entries, filter, sort, search, favOnly, charOnly, favourites]);

  if (entries.length === 0) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'60vh', gap:16, padding:32 }}>
      <div style={{ fontSize:52 }}>📦</div>
      <div style={{ color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
        fontSize:11, textAlign:'center', lineHeight:2 }}>
        Collection empty.<br/>Open a pack to start!
      </div>
    </div>
  );

  return (
    <div style={{ padding:'12px 10px', maxWidth:560, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:10 }}>
        <div style={{ color:'#c9a833', fontSize:13, fontFamily:'monospace', fontWeight:700, letterSpacing:'.2em' }}>
          COLLECTION
        </div>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:3 }}>
          {entries.length} UNIQUE · {entries.reduce((s,e)=>s+(e.count??1),0)} TOTAL
        </div>
      </div>

      <DeckBar entries={entries} />

      {/* Rarity filter chips */}
      <div style={{ display:'flex', gap:5, marginBottom:10, overflowX:'auto', paddingBottom:2 }}>
        <button onClick={()=>setFilter('ALL')} style={{
          background:filter==='ALL'?'rgba(201,168,51,0.15)':'transparent',
          border:`1px solid ${filter==='ALL'?'rgba(201,168,51,0.5)':'rgba(255,255,255,0.07)'}`,
          borderRadius:20, padding:'5px 11px', cursor:'pointer', flexShrink:0,
          fontSize:8.5, color:filter==='ALL'?'#c9a833':'rgba(255,255,255,0.3)', fontFamily:'monospace',fontWeight:700,
        }}>ALL {entries.length}</button>
        {['M','L','E','R','C'].filter(r=>byRarity[r]>0).map(r=>(
          <button key={r} onClick={()=>setFilter(f=>f===r?'ALL':r)} style={{
            background:filter===r?RARITY[r].bg:'transparent',
            border:`1px solid ${filter===r?RARITY[r].border:'rgba(255,255,255,0.07)'}`,
            borderRadius:20, padding:'5px 11px', cursor:'pointer', flexShrink:0,
            fontSize:8.5, color:filter===r?RARITY[r].color:'rgba(255,255,255,0.3)',
            fontFamily:'monospace',fontWeight:700,
            boxShadow:filter===r?`0 0 8px ${RARITY[r].glow}`:'none',
          }}>{RARITY[r].short} {byRarity[r]}</button>
        ))}
      </div>

      {/* Search + icon buttons */}
      <div style={{ display:'flex', gap:6, marginBottom:8, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1 }}>
          <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)',
            fontSize:11, color:'rgba(255,255,255,0.2)', pointerEvents:'none' }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            style={{ width:'100%', background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.08)', borderRadius:8,
              padding:'7px 10px 7px 26px', color:'#e8e0d0', fontSize:10,
              outline:'none', fontFamily:'monospace', boxSizing:'border-box' }} />
        </div>
        <button onClick={()=>setFavOnly(v=>!v)} title="Favourites" style={{
          width:33, height:33, borderRadius:7, cursor:'pointer', flexShrink:0,
          background:favOnly?'rgba(255,80,80,0.15)':'rgba(255,255,255,0.04)',
          border:`1px solid ${favOnly?'rgba(255,80,80,0.45)':'rgba(255,255,255,0.08)'}`,
          color:favOnly?'#ff6b6b':'rgba(255,255,255,0.3)', fontSize:14,
        }}>♥</button>
        <button onClick={()=>setCharOnly(v=>!v)} title="Characters only" style={{
          width:33, height:33, borderRadius:7, cursor:'pointer', flexShrink:0,
          background:charOnly?'rgba(181,123,238,0.15)':'rgba(255,255,255,0.04)',
          border:`1px solid ${charOnly?'rgba(181,123,238,0.45)':'rgba(255,255,255,0.08)'}`,
          color:charOnly?'#b57bee':'rgba(255,255,255,0.3)', fontSize:13,
        }}>🚂</button>
      </div>

      {/* Sort pills */}
      <div style={{ display:'flex', gap:5, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
        {SORT_OPTS.map(o=>(
          <button key={o.v} onClick={()=>setSort(o.v)} style={{
            background:sort===o.v?'rgba(201,168,51,0.1)':'transparent',
            border:`1px solid ${sort===o.v?'rgba(201,168,51,0.4)':'rgba(255,255,255,0.06)'}`,
            borderRadius:20, padding:'4px 10px', cursor:'pointer', flexShrink:0,
            fontSize:8.5, color:sort===o.v?'#c9a833':'rgba(255,255,255,0.28)',
            fontFamily:'monospace', whiteSpace:'nowrap',
          }}>{o.l}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length===0 ? (
        <div style={{ textAlign:'center', padding:'40px 20px',
          color:'rgba(255,255,255,0.2)', fontFamily:'monospace', fontSize:10 }}>
          No cards match.
        </div>
      ) : (
        <>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
            {filtered.map(card => (
              <CardTile key={card.id ?? card.title}
                card={card}
                isFav={favourites.has(card.id)}
                onFav={()=>{ soundFavourite(); onToggleFav?.(card.id); }}
                onClick={()=>setSelected(card)} />
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:14, fontSize:8,
            color:'rgba(255,255,255,0.12)', fontFamily:'monospace' }}>
            {filtered.length}/{entries.length} cards
          </div>
        </>
      )}

      {selected && (
        <CardDetailModal card={selected} count={selected.count??1}
          isFav={favourites.has(selected.id)}
          onFav={()=>{ soundFavourite(); onToggleFav?.(selected.id); }}
          onClose={()=>setSelected(null)} />
      )}
    </div>
  );
}
