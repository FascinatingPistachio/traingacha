import { useState } from 'react';
import { RARITY } from '../constants.js';

export default function CardDetailModal({ card, count, onClose, isFav=false, onFav=null }) {
  const rs = RARITY[card.rarity] ?? RARITY.C;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr,    setImgErr]    = useState(false);
  const STARS = { C:1, R:2, E:3, L:4, M:4 };
  const star  = STARS[card.rarity] ?? 1;
  const isM   = card.rarity === 'M';

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', zIndex:500,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <button onClick={onClose} style={{ position:'absolute', top:18, right:18,
        background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:'50%', width:32, height:32, color:'#888', fontSize:16, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>

      <div onClick={e=>e.stopPropagation()} style={{
        background:`linear-gradient(170deg,${RARITY[card.rarity]?.bg??'#0c1825'},#06101c)`,
        border:`2px solid ${rs.border}`, borderRadius:16, maxWidth:340, width:'100%',
        overflow:'hidden', boxShadow:`0 0 50px ${rs.glow}, 0 20px 60px rgba(0,0,0,0.8)`,
        animation:'fadeUp 0.3s ease-out',
      }}>
        {/* Photo */}
        <div style={{ height:210, background:'rgba(0,0,0,0.3)', position:'relative', overflow:'hidden' }}>
          {!imgLoaded && !imgErr && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div className="spinner" />
            </div>
          )}
          {imgErr && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:6 }}>
              <div style={{ fontSize:36 }}>🚂</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontFamily:'monospace' }}>IMAGE UNAVAILABLE</div>
            </div>
          )}
          {!imgErr && (
            <img src={card.imageHD??card.image} alt={card.title}
              onLoad={()=>setImgLoaded(true)} onError={()=>setImgErr(true)}
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity:imgLoaded?1:0, transition:'opacity 0.35s' }}
            />
          )}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:50, background:'linear-gradient(transparent,#06101c)' }} />
          {/* Stars */}
          <div style={{ position:'absolute', bottom:10, left:12, display:'flex', gap:3 }}>
            {Array.from({length:star}).map((_,i)=>(
              <span key={i} style={{ fontSize:14, color:rs.color, filter:`drop-shadow(0 0 4px ${rs.glow})` }}>★</span>
            ))}
          </div>
          {/* Character badge */}
          {card.character && (
            <div style={{ position:'absolute', top:10, right:10, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#1e1e3a,#0a0a1e)',
                border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:20, boxShadow:'0 2px 10px rgba(0,0,0,0.7)' }}>
                {card.character.emoji}
              </div>
              <div style={{ background:'rgba(10,10,30,0.88)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:20, padding:'2px 8px' }}>
                <span style={{ fontSize:7.5, color:'#e8d0ff', fontFamily:'monospace', fontWeight:700 }}>{card.character.character}</span>
              </div>
            </div>
          )}
          {/* Fav button */}
          {onFav && (
            <button onClick={onFav} style={{ position:'absolute', top:10, left:10,
              background:'rgba(0,0,0,0.7)', border:`1px solid ${isFav?'rgba(255,100,100,0.6)':'rgba(255,255,255,0.2)'}`,
              borderRadius:'50%', width:32, height:32, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, color:isFav?'#ff6b6b':'rgba(255,255,255,0.5)' }}>
              {isFav?'♥':'♡'}
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding:'14px 16px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
            <div>
              <div style={{ fontSize:8.5, color:rs.color, fontFamily:'monospace', letterSpacing:'.14em', marginBottom:3 }}>
                {isM && '✦ '}{ rs.name.toUpperCase()}
              </div>
              <h2 style={{ fontSize:17, color:'#f0e8d8', fontFamily:'Georgia,serif', fontWeight:700, margin:0, lineHeight:1.3 }}>
                {card.title}
              </h2>
            </div>
          </div>

          {/* Mythic flavour text */}
          {isM && (
            <div style={{ background:'rgba(100,120,255,0.08)', border:'1px solid rgba(160,180,255,0.2)',
              borderRadius:7, padding:'8px 11px', marginBottom:12,
              fontSize:10, color:'rgba(180,200,255,0.7)', fontFamily:'Georgia,serif', fontStyle:'italic', lineHeight:1.65 }}>
              This is a GHOST TRAIN — almost invisible on Wikipedia, with fewer than {card.views??'a handful of'} people searched for on Wikipedia last month. Fewer than 1 in 100 packs yields a Mythic. You may be among the very first to own this card.
            </div>
          )}

          {/* Character callout */}
          {card.character && (
            <div style={{ background:'rgba(180,100,255,0.08)', border:'1px solid rgba(180,100,255,0.22)',
              borderRadius:8, padding:'8px 11px', marginBottom:12, display:'flex', gap:9, alignItems:'flex-start' }}>
              <span style={{ fontSize:20, lineHeight:1.2 }}>{card.character.emoji}</span>
              <div>
                <div style={{ fontSize:8.5, color:'#c8a0ff', fontFamily:'monospace', fontWeight:700, letterSpacing:'.06em', marginBottom:2 }}>
                  {card.character.character} · {card.character.show}
                </div>
                <div style={{ fontSize:10.5, color:'rgba(200,160,255,0.7)', fontFamily:'Georgia,serif', lineHeight:1.55 }}>
                  {card.character.note}
                </div>
              </div>
            </div>
          )}

          {card.extract && (
            <p style={{ fontSize:11.5, color:'#5a7a9a', lineHeight:1.75, margin:'0 0 12px', fontFamily:'Georgia,serif' }}>
              {card.extract}
            </p>
          )}

          {card.views !== undefined && (
            <p style={{ fontSize:8.5, color:'#1e3a50', fontFamily:'monospace', margin:'0 0 14px' }}>
              📊 {card.views === 0 ? 'No recorded Wikipedia views' : `~${card.views.toLocaleString()} Wikipedia views/month`}
            </p>
          )}

          <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>
            <a href={card.url} target="_blank" rel="noreferrer" style={{ fontSize:9.5, color:'#4fa8e8', fontFamily:'monospace',
              letterSpacing:'.06em', textDecoration:'none', padding:'6px 11px',
              border:'1px solid rgba(79,168,232,0.35)', borderRadius:5 }}>
              READ ON WIKIPEDIA →
            </a>
            {count > 1 && <span style={{ fontSize:9, color:rs.color, fontFamily:'monospace' }}>×{count} copies</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
