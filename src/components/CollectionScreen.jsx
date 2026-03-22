import { useState, useMemo } from 'react';
import RailCard from './RailCard.jsx';
import CardDetailModal from './CardDetailModal.jsx';
import { RARITY } from '../constants.js';
import { soundFavourite } from '../utils/sounds.js';

const SORT_OPTS = [
  { v:'rarity',  l:'✦ Rarity'   }, { v:'overall', l:'⚡ Power'   },
  { v:'speed',   l:'💨 Speed'   }, { v:'power',   l:'🔋 kW'     },
  { v:'fame',    l:'⭐ Fame'    }, { v:'views',   l:'📊 Famous' },
  { v:'newest',  l:'🆕 Newest' }, { v:'name',    l:'🔤 A–Z'   },
];

// ── Card tile — uses RailCard for consistent 2:3 Top Trumps look ────────────
function CardTile({ card, isFav, onFav, onClick }) {
  return (
    <div style={{ cursor:'pointer' }} onClick={onClick}>
      <RailCard card={card} size="sm" count={card.count ?? 1}
        isFav={isFav} onFav={onFav} />
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
    <div style={{ padding:'12px 10px 80px', maxWidth:560, margin:'0 auto' }}>
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
      <div style={{ display:'flex', gap:5, marginBottom:10, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none', msOverflowStyle:'none', WebkitOverflowScrolling:'touch' }}>
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
      <div style={{ display:'flex', gap:5, marginBottom:12, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none', msOverflowStyle:'none', WebkitOverflowScrolling:'touch' }}>
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
