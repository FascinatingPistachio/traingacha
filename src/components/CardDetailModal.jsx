import { useState } from 'react';
import { RARITY } from '../constants.js';

/**
 * Image component that tries imageHD first, silently falls back to image,
 * and only shows an error if BOTH fail.
 */
function ModalImage({ card }) {
  const [src,    setSrc]    = useState(card.imageHD ?? card.image);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleError = () => {
    // If we were trying imageHD, fall back to regular image
    if (src === card.imageHD && card.image && card.image !== card.imageHD) {
      setSrc(card.image);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div style={{ height:210, background:'rgba(0,0,0,0.35)', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:8 }}>
        <svg width="48" height="28" viewBox="0 0 80 42" fill="none">
          <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(255,255,255,0.15)" />
          <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(255,255,255,0.18)" />
          <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        </svg>
        <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.25)', fontFamily:'monospace' }}>
          Image not available from Wikipedia
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:210, position:'relative', overflow:'hidden', background:'rgba(0,0,0,0.3)' }}>
      {!loaded && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="spinner" />
        </div>
      )}
      <img
        key={src}   // key forces remount when src changes on fallback
        src={src}
        alt={card.title}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
          opacity:loaded?1:0, transition:'opacity 0.35s' }}
      />
    </div>
  );
}

export default function CardDetailModal({ card, count, onClose, isFav=false, onFav=null }) {
  const rs   = RARITY[card.rarity] ?? RARITY.C;
  const isM  = card.rarity === 'M';
  const STARS = { C:1, R:2, E:3, L:4, M:4 };
  const star  = STARS[card.rarity] ?? 1;

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', zIndex:500,
      display:'flex', alignItems:'center', justifyContent:'center', padding:16,
    }}>
      <button onClick={onClose} style={{
        position:'absolute', top:18, right:18,
        background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:'50%', width:32, height:32, color:'#aaa', fontSize:16,
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      }}>×</button>

      <div onClick={e => e.stopPropagation()} style={{
        background:`linear-gradient(170deg, ${rs.bg}, #030610)`,
        border:`2px solid ${rs.border}`,
        borderRadius:16, maxWidth:340, width:'100%',
        overflow:'hidden',
        boxShadow:`0 0 50px ${rs.glow}, 0 20px 60px rgba(0,0,0,0.8)`,
        animation:'fadeUp 0.3s ease-out',
        maxHeight:'90vh', overflowY:'auto',
      }}>
        {/* ── Photo ── */}
        <div style={{ position:'relative' }}>
          <ModalImage card={card} />

          {/* Bottom gradient */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:50,
            background:'linear-gradient(transparent, #030610)', pointerEvents:'none' }} />

          {/* Stars */}
          <div style={{ position:'absolute', bottom:10, left:12, display:'flex', gap:3 }}>
            {Array.from({length:star}).map((_,i)=>(
              <span key={i} style={{ fontSize:14, color:rs.color, filter:`drop-shadow(0 0 4px ${rs.glow})` }}>★</span>
            ))}
          </div>

          {/* Fav button */}
          {onFav && (
            <button onClick={onFav} style={{
              position:'absolute', top:10, left:10,
              background:'rgba(0,0,0,0.72)',
              border:`1px solid ${isFav?'rgba(255,100,100,0.65)':'rgba(255,255,255,0.2)'}`,
              borderRadius:'50%', width:32, height:32, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, color:isFav?'#ff6b6b':'rgba(255,255,255,0.5)',
            }}>
              {isFav?'♥':'♡'}
            </button>
          )}

          {/* Character badge on photo */}
          {card.character && (
            <div style={{ position:'absolute', top:10, right:10,
              display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <div style={{
                width:36, height:36, borderRadius:'50%',
                background:card.character.color??'#4b5563',
                border:'2px solid rgba(255,255,255,0.35)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 2px 12px rgba(0,0,0,0.7)',
              }}>
                <span style={{ fontSize:12, fontWeight:800, color:'#fff', fontFamily:'monospace' }}>
                  {card.character.character.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </span>
              </div>
              <div style={{ background:'rgba(10,10,30,0.9)', border:'1px solid rgba(255,255,255,0.18)',
                borderRadius:20, padding:'2px 8px' }}>
                <span style={{ fontSize:7.5, color:'#e8d0ff', fontFamily:'monospace', fontWeight:700 }}>
                  {card.character.character}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding:'14px 16px 18px' }}>
          {/* Rarity + title */}
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:8.5, color:rs.color, fontFamily:'monospace', letterSpacing:'.14em', marginBottom:3 }}>
              {isM && '✦ '}{ rs.name.toUpperCase()}
              {isM && <span style={{ color:'rgba(140,160,255,0.5)', marginLeft:6 }}>GHOST TRAIN</span>}
            </div>
            <h2 style={{ fontSize:17, color:'#f0e8d8', fontFamily:'Georgia,serif', fontWeight:700, margin:0, lineHeight:1.3 }}>
              {card.title}
            </h2>
          </div>

          {/* Mythic flavour */}
          {isM && (
            <div style={{ background:'rgba(80,80,200,0.08)', border:'1px solid rgba(120,140,255,0.2)',
              borderRadius:8, padding:'9px 12px', marginBottom:12,
              fontSize:10.5, color:'rgba(160,180,255,0.7)', fontFamily:'Georgia,serif', fontStyle:'italic', lineHeight:1.7 }}>
              A ghost train — almost invisible on Wikipedia with fewer than {card.views ?? 'a handful of'} recorded views per month.
              Fewer than 1 in 100 packs yields a Mythic. You may be among the very first collectors to own this card.
            </div>
          )}

          {/* Character callout */}
          {card.character && (
            <>
              <div style={{ background:'rgba(100,60,200,0.07)', border:'1px solid rgba(150,100,255,0.2)',
                borderRadius:10, padding:'10px 13px', marginBottom:8,
                display:'flex', gap:11, alignItems:'center' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', flexShrink:0,
                  background:card.character.color??'#4b5563',
                  border:'2px solid rgba(255,255,255,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 2px 12px rgba(0,0,0,0.5)' }}>
                  <span style={{ fontSize:14, fontWeight:800, color:'#fff', fontFamily:'monospace' }}>
                    {card.character.character.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:7.5, color:'rgba(180,140,255,0.55)', fontFamily:'monospace', letterSpacing:'.1em', marginBottom:3 }}>
                    INSPIRED THIS CHARACTER
                  </div>
                  <div style={{ fontSize:13, color:'#e8d8ff', fontFamily:'Georgia,serif', fontWeight:700, marginBottom:1 }}>
                    {card.character.character}
                  </div>
                  <div style={{ fontSize:8.5, color:'rgba(200,160,255,0.55)', fontFamily:'monospace' }}>
                    {card.character.show}
                  </div>
                </div>
              </div>
              {card.character.note && (
                <p style={{ fontSize:11, color:'rgba(190,155,255,0.65)', lineHeight:1.72, margin:'0 0 12px',
                  fontFamily:'Georgia,serif', fontStyle:'italic',
                  borderLeft:'2px solid rgba(150,100,255,0.3)', paddingLeft:10 }}>
                  {card.character.note}
                </p>
              )}
            </>
          )}

          {/* Extract */}
          {card.extract && (
            <p style={{ fontSize:11.5, color:'#5a7a9a', lineHeight:1.75, margin:'0 0 12px', fontFamily:'Georgia,serif' }}>
              {card.extract}
            </p>
          )}

          {/* Views */}
          {card.views !== undefined && card.views !== null && (
            <p style={{ fontSize:8.5, color:'#1e3a50', fontFamily:'monospace', margin:'0 0 14px' }}>
              📊 {card.views === 0
                ? 'No recorded Wikipedia views'
                : `~${card.views.toLocaleString()} Wikipedia views/month`}
            </p>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>
            <a href={card.url} target="_blank" rel="noreferrer" style={{
              fontSize:9.5, color:'#4fa8e8', fontFamily:'monospace', letterSpacing:'.06em',
              textDecoration:'none', padding:'6px 11px',
              border:'1px solid rgba(79,168,232,0.35)', borderRadius:5,
            }}>
              READ ON WIKIPEDIA →
            </a>
            {count > 1 && (
              <span style={{ fontSize:9, color:rs.color, fontFamily:'monospace' }}>×{count} copies</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
