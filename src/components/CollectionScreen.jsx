import { useState, useMemo } from 'react';
import RailCard from './RailCard.jsx';
import CardDetailModal from './CardDetailModal.jsx';
import { RARITY } from '../constants.js';
import { soundFavourite } from '../utils/sounds.js';

const SORT_OPTIONS = [
  { value:'rarity',   label:'BY RARITY'         },
  { value:'overall',  label:'OVERALL SCORE ↓'   },
  { value:'speed',    label:'SPEED ↓'           },
  { value:'power',    label:'POWER ↓'           },
  { value:'heritage', label:'HERITAGE ↓'        },
  { value:'fame',     label:'FAME ↓'            },
  { value:'views',    label:'MOST FAMOUS'       },
  { value:'obscure',  label:'MOST OBSCURE'      },
  { value:'newest',   label:'NEWEST FIRST'      },
  { value:'name',     label:'A – Z'             },
  { value:'char',     label:'CHARACTERS FIRST'  },
];

function StatSummary({ cards }) {
  if (!cards.length) return null;
  const withStats = cards.filter(c => c.stats);
  if (!withStats.length) return null;
  const top = (key) => Math.max(...withStats.map(c => c.stats?.[key] ?? 0));
  return (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginBottom:10 }}>
      {[
        { label:'BEST SPEED',    val:`${top('speed')} km/h` },
        { label:'BEST POWER',    val:`${top('power') >= 1000 ? (top('power')/1000).toFixed(1)+'k' : top('power')} kW` },
        { label:'TOP SCORE',     val:top('overall') },
      ].map(s => (
        <div key={s.label} style={{ textAlign:'center' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', fontFamily:'monospace', fontWeight:700 }}>{s.val}</div>
          <div style={{ fontSize:7, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function CollectionScreen({ collection, favourites = new Set(), onToggleFav }) {
  const [filter,       setFilter]       = useState('ALL');
  const [sort,         setSort]         = useState('rarity');
  const [search,       setSearch]       = useState('');
  const [selected,     setSelected]     = useState(null);
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [showCharsOnly,setShowCharsOnly]= useState(false);

  const entries = useMemo(() => Object.values(collection), [collection]);

  const filtered = useMemo(() => entries
    .filter(e => filter === 'ALL' || e.rarity === filter)
    .filter(e => !showFavsOnly  || favourites.has(e.id))
    .filter(e => !showCharsOnly || !!e.character)
    .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase())
                         || e.character?.character?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'rarity')   return (RARITY[b.rarity]?.rank??0) - (RARITY[a.rarity]?.rank??0);
      if (sort === 'overall')  return (b.stats?.overall??0)   - (a.stats?.overall??0);
      if (sort === 'speed')    return (b.stats?.speed??0)     - (a.stats?.speed??0);
      if (sort === 'power')    return (b.stats?.power??0)     - (a.stats?.power??0);
      if (sort === 'heritage') return (b.stats?.heritage??0)  - (a.stats?.heritage??0);
      if (sort === 'fame')     return (b.stats?.fame??0)      - (a.stats?.fame??0);
      if (sort === 'views')    return (b.views??0)            - (a.views??0);
      if (sort === 'obscure')  return (a.views??9999)         - (b.views??9999);
      if (sort === 'newest')   return new Date(b.addedAt??0)  - new Date(a.addedAt??0);
      if (sort === 'name')     return a.title.localeCompare(b.title);
      if (sort === 'char')     return (a.character?0:1) - (b.character?0:1);
      return 0;
    }), [entries, filter, sort, search, showFavsOnly, showCharsOnly, favourites]);

  const byRarity    = useMemo(() => entries.reduce((acc, e) => { acc[e.rarity]=(acc[e.rarity]??0)+1; return acc; }, {}), [entries]);
  const charCount   = useMemo(() => entries.filter(e=>e.character).length, [entries]);
  const totalPulls  = entries.reduce((s,e)=>s+(e.count??1),0);

  return (
    <div style={{ padding:'12px 10px', maxWidth:540, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:12 }}>
        <div style={{ color:'#c9a833', fontSize:13, fontFamily:'monospace', fontWeight:700, letterSpacing:'.2em' }}>
          COLLECTION
        </div>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:3, letterSpacing:'.1em' }}>
          {entries.length} UNIQUE · {totalPulls} TOTAL · {charCount} CHARACTERS
        </div>
      </div>

      {/* Rarity counts */}
      {entries.length > 0 && (
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:10, flexWrap:'wrap' }}>
          {['M','L','E','R','C'].map(r => (
            <button key={r} onClick={()=>setFilter(f=>f===r?'ALL':r)} style={{
              background: filter===r ? RARITY[r].bg : 'transparent',
              border:`1px solid ${filter===r?RARITY[r].border:'rgba(255,255,255,0.07)'}`,
              borderRadius:5, padding:'4px 9px', cursor:'pointer',
              fontSize:8.5, color: filter===r?RARITY[r].color:'rgba(255,255,255,0.3)',
              fontFamily:'monospace', letterSpacing:'.1em',
            }}>
              {RARITY[r].short}: {byRarity[r]??0}
            </button>
          ))}
          {filter !== 'ALL' && (
            <button onClick={()=>setFilter('ALL')} style={{
              background:'transparent', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:5, padding:'4px 9px', cursor:'pointer',
              fontSize:8.5, color:'rgba(255,255,255,0.3)', fontFamily:'monospace',
            }}>ALL</button>
          )}
        </div>
      )}

      {/* Stat summary */}
      <StatSummary cards={entries} />

      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or character…"
        style={{ width:'100%', background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(201,168,51,0.15)', borderRadius:7, padding:'8px 12px',
          color:'#e8e0d0', fontSize:11, outline:'none', fontFamily:'monospace', marginBottom:8,
          boxSizing:'border-box' }} />

      {/* Controls row */}
      <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{
          padding:'5px 8px', background:'#0a1520', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:6, color:'rgba(255,255,255,0.5)', fontSize:8.5, cursor:'pointer',
          fontFamily:'monospace', outline:'none', flex:1,
        }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button onClick={()=>setShowFavsOnly(v=>!v)} style={{
          padding:'5px 9px',
          background: showFavsOnly?'rgba(255,80,80,0.12)':'transparent',
          border:`1px solid ${showFavsOnly?'rgba(255,80,80,0.45)':'rgba(255,255,255,0.07)'}`,
          borderRadius:6, color: showFavsOnly?'#ff6b6b':'rgba(255,255,255,0.3)',
          fontSize:8.5, cursor:'pointer', fontFamily:'monospace', whiteSpace:'nowrap',
        }}>♥ FAVS{favourites.size > 0 ? ` ${favourites.size}` : ''}</button>

        <button onClick={()=>setShowCharsOnly(v=>!v)} style={{
          padding:'5px 9px',
          background: showCharsOnly?'rgba(181,123,238,0.12)':'transparent',
          border:`1px solid ${showCharsOnly?'rgba(181,123,238,0.45)':'rgba(255,255,255,0.07)'}`,
          borderRadius:6, color: showCharsOnly?'#b57bee':'rgba(255,255,255,0.3)',
          fontSize:8.5, cursor:'pointer', fontFamily:'monospace', whiteSpace:'nowrap',
        }}>🚂 CHARS</button>
      </div>

      {/* Cards grid */}
      {entries.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(255,255,255,0.1)',
          fontFamily:'monospace', fontSize:11, lineHeight:1.8 }}>
          <div style={{ fontSize:40, marginBottom:14 }}>📋</div>
          <div>Your collection is empty.</div>
          <div>Open a pack to get started!</div>
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(162px,1fr))', gap:10 }}>
            {filtered.map(card => (
              <div key={card.id} style={{ display:'flex', justifyContent:'center' }}>
                <RailCard card={card} size="md" count={card.count}
                  isFav={favourites.has(card.id)}
                  onFav={() => { soundFavourite(); onToggleFav?.(card.id); }}
                  onClick={() => setSelected(card)} />
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.15)',
              fontFamily:'monospace', fontSize:10 }}>
              No cards match your filters.
            </div>
          )}
        </>
      )}

      {selected && (
        <CardDetailModal card={selected} count={selected.count}
          isFav={favourites.has(selected.id)}
          onFav={() => { soundFavourite(); onToggleFav?.(selected.id); }}
          onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
