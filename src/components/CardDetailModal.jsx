import { useState, useEffect, useRef } from 'react';
import { RARITY } from '../constants.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';

// ── Shared helpers (duplicated from RailCard to avoid circular deps) ──────────
const FRAME = {
  C:{ top:'#1a2a3a', bot:'#0f1e2d' },
  R:{ top:'#081828', bot:'#03101e' },
  E:{ top:'#160a24', bot:'#0a0416' },
  L:{ top:'#1e1000', bot:'#120a00' },
  M:{ top:'#020205', bot:'#010103' },
};
const BADGE_BG = {
  C:'rgba(10,20,30,0.92)', R:'rgba(4,14,28,0.92)',
  E:'rgba(18,6,32,0.92)',  L:'rgba(22,10,0,0.92)', M:'rgba(0,0,8,0.96)',
};

// ── Modal image with imageHD → image fallback ─────────────────────────────────
function ModalImage({ card }) {
  const [src,    setSrc]    = useState(card.imageHD ?? card.image);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(card.imageHD ?? card.image);
    setLoaded(false);
    setFailed(false);
  }, [card.id]);

  const handleError = () => {
    if (src === card.imageHD && card.image && card.image !== card.imageHD) {
      setSrc(card.image);
      setLoaded(false);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div style={{ width:'100%', height:'100%', background:'rgba(0,0,0,0.35)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
        <svg width="48" height="28" viewBox="0 0 80 42" fill="none">
          <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(255,255,255,0.15)"/>
          <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(255,255,255,0.18)"/>
          <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
          <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
        </svg>
        <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.25)', fontFamily:'monospace' }}>
          Image not available
        </div>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="spinner" />
        </div>
      )}
      <img key={src} src={src} alt={card.title}
        onLoad={() => setLoaded(true)} onError={handleError}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
          opacity:loaded?1:0, transition:'opacity 0.35s' }}
      />
    </>
  );
}

// ── Thomas banner (same proportions as RailCard but scaled for modal) ──────────
function ModalThomasBanner({ character }) {
  const [charImg, setCharImg] = useState(null);
  const [imgOk,   setImgOk]   = useState(false);

  useEffect(() => {
    fetchFandomCharacterImage(character.character).then(url => setCharImg(url ?? null));
  }, [character.character]);

  const col     = character.color ?? '#1d6fc4';
  const stripH  = 48;
  const circleD = 66;

  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0,
      height:stripH, background:col, zIndex:8,
      display:'flex', alignItems:'center',
      paddingLeft: circleD + 10,
      paddingRight:10,
      boxShadow:'0 -1px 10px rgba(0,0,0,0.45)',
    }}>
      {/* Portrait circle — stays fully within photo area */}
      <div style={{
        position:'absolute', left:7, bottom:5,
        width:circleD, height:circleD, borderRadius:'50%',
        overflow:'hidden',
        border:'3px solid rgba(255,255,255,0.95)',
        background:col,
        boxShadow:'0 3px 16px rgba(0,0,0,0.6)',
        zIndex:9, display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {charImg ? (
          <img src={charImg} alt={character.character}
            onLoad={() => setImgOk(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:imgOk?1:0, transition:'opacity 0.3s' }}
          />
        ) : (
          <span style={{ fontSize:circleD*0.36, fontWeight:800, color:'#fff', fontFamily:'monospace' }}>
            {character.character.charAt(0)}
          </span>
        )}
      </div>
      {/* Text */}
      <div style={{ flex:1, minWidth:0, overflow:'hidden' }}>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.75)', fontFamily:'monospace',
          fontWeight:700, letterSpacing:'.1em', lineHeight:1, marginBottom:3 }}>
          {character.show.toUpperCase()}
        </div>
        <div style={{ fontSize:15, color:'#fff', fontFamily:'Georgia,serif', fontWeight:700, lineHeight:1 }}>
          {character.character}
        </div>
      </div>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────────
export default function CardDetailModal({ card, count, onClose, isFav=false, onFav=null }) {
  const rs   = RARITY[card.rarity] ?? RARITY.C;
  const isM  = card.rarity === 'M';
  const isL  = card.rarity === 'L';
  const isE  = card.rarity === 'E';
  const isTF = !!(card.character && card.character.show === 'Thomas & Friends');
  const STARS = { C:1, R:2, E:3, L:4, M:4 };
  const star  = STARS[card.rarity] ?? 1;
  const { top, bot } = FRAME[card.rarity] ?? FRAME.C;

  // Modal card is the same layout as the card but wider (max 320px)
  // Photo = 60% of total height, info = 40%
  const CARD_W  = 300;
  const CARD_H  = 450;   // 2:3 ratio
  const IMG_H   = 270;   // 60% of height
  const INFO_H  = CARD_H - IMG_H;

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0,
        background:'rgba(0,0,0,0.92)',
        zIndex:500,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:16,
      }}
    >
      <button onClick={onClose} style={{
        position:'absolute', top:18, right:18,
        background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:'50%', width:32, height:32, color:'#aaa', fontSize:16,
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      }}>×</button>

      {/* ── Card — same layout as RailCard ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: CARD_W,
          height: CARD_H,
          background:`linear-gradient(175deg,${top},${bot})`,
          border:`3px solid ${rs.border}`,
          borderRadius:16,
          overflow:'hidden',
          boxShadow: isM
            ? undefined
            : `0 0 40px ${rs.glow}, 0 20px 60px rgba(0,0,0,0.8)`,
          animation:'fadeUp 0.3s ease-out',
          position:'relative',
          // Mythic animations
          ...(isM ? { animation:'fadeUp 0.3s ease-out, mythicBorder 3s linear 0.3s infinite' } : {}),
        }}
      >
        {/* Foil */}
        {(isL||isE||isM) && <div className={`tc-foil tc-foil-${card.rarity}`} />}
        {isM && <div className="tc-scanlines" />}

        {/* ── Photo section ── */}
        <div style={{ height:IMG_H, position:'relative', borderBottom:`2.5px solid ${rs.border}`, overflow:'hidden' }}>
          <ModalImage card={card} />

          {/* Rarity badge */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:26, zIndex:5,
            background:BADGE_BG[card.rarity],
            borderBottom:`1px solid ${rs.border}`,
            display:'flex', alignItems:'center', paddingLeft:8, gap:5,
          }}>
            {isM && <span style={{ fontSize:9, color:rs.color }}>✦</span>}
            <span style={{ fontSize:10, color:rs.color, fontFamily:'monospace', fontWeight:700, letterSpacing:'.12em',
              textShadow:`0 0 6px ${rs.glow}` }}>
              {rs.name.toUpperCase()}
            </span>
            {isM && <span style={{ fontSize:8, color:'rgba(140,160,255,0.45)', fontFamily:'monospace' }}>GHOST TRAIN</span>}
          </div>

          {/* Bottom gradient (when no Thomas banner) */}
          {!isTF && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:40,
              background:`linear-gradient(transparent,${bot})`, zIndex:4 }} />
          )}

          {/* Stars on photo */}
          {!isTF && (
            <div style={{ position:'absolute', bottom:10, left:10, zIndex:5, display:'flex', gap:4 }}>
              {Array.from({length:star}).map((_,i)=>(
                <span key={i} style={{ fontSize:16, color:rs.color, filter:`drop-shadow(0 0 4px ${rs.glow})` }}>★</span>
              ))}
              {Array.from({length:Math.max(0,4-star)}).map((_,i)=>(
                <span key={i} style={{ fontSize:16, color:'rgba(255,255,255,0.1)' }}>★</span>
              ))}
            </div>
          )}

          {/* Fav button */}
          {onFav && (
            <button onClick={onFav} style={{
              position:'absolute', top:30, left:8, zIndex:7,
              background:'rgba(0,0,0,0.72)',
              border:`1px solid ${isFav?'rgba(255,100,100,0.65)':'rgba(255,255,255,0.2)'}`,
              borderRadius:'50%', width:28, height:28, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:14, color:isFav?'#ff6b6b':'rgba(255,255,255,0.4)',
            }}>
              {isFav?'♥':'♡'}
            </button>
          )}

          {/* Non-Thomas character badge */}
          {card.character && !isTF && (
            <div style={{ position:'absolute', top:30, right:10, zIndex:7,
              display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <div style={{ width:40, height:40, borderRadius:'50%',
                background:card.character.color??'#4b5563',
                border:'2px solid rgba(255,255,255,0.35)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 2px 12px rgba(0,0,0,0.7)' }}>
                <span style={{ fontSize:14, fontWeight:800, color:'#fff', fontFamily:'monospace' }}>
                  {card.character.character.charAt(0)}
                </span>
              </div>
              <div style={{ background:'rgba(10,10,30,0.9)', border:'1px solid rgba(255,255,255,0.18)',
                borderRadius:20, padding:'2px 8px' }}>
                <span style={{ fontSize:8, color:'#e8d0ff', fontFamily:'monospace', fontWeight:700 }}>
                  {card.character.character}
                </span>
              </div>
            </div>
          )}

          {/* Thomas banner */}
          {isTF && <ModalThomasBanner character={card.character} />}
        </div>

        {/* ── Info section — same structure as RailCard ── */}
        <div style={{
          height:INFO_H, padding:'10px 14px', display:'flex', flexDirection:'column', gap:5,
          background:`linear-gradient(to bottom,${bot},#030610)`,
          position:'relative', overflow:'hidden',
          paddingTop: '10px',
        }}>
          {/* Top rule */}
          <div style={{ position:'absolute', top:0, left:10, right:10, height:1,
            background:`linear-gradient(to right,transparent,${rs.border},transparent)` }} />

          {/* Stars (when Thomas banner occupies photo bottom) */}
          {isTF && (
            <div style={{ display:'flex', gap:3, alignItems:'center', flexShrink:0 }}>
              {Array.from({length:star}).map((_,i)=>(
                <span key={i} style={{ fontSize:14, color:rs.color, filter:`drop-shadow(0 0 3px ${rs.glow})` }}>★</span>
              ))}
              {Array.from({length:Math.max(0,4-star)}).map((_,i)=>(
                <span key={i} style={{ fontSize:14, color:'rgba(255,255,255,0.1)' }}>★</span>
              ))}
            </div>
          )}

          {/* Title */}
          <div style={{ fontSize:16, fontWeight:700, color:'#f0e8d8', lineHeight:1.25,
            fontFamily:'Georgia,serif', flexShrink:0 }}>
            {card.title}
          </div>

          {/* Mythic flavour */}
          {isM && (
            <div style={{ background:'rgba(80,80,200,0.08)', border:'1px solid rgba(120,140,255,0.2)',
              borderRadius:7, padding:'7px 10px', flexShrink:0,
              fontSize:10, color:'rgba(160,180,255,0.7)', fontFamily:'Georgia,serif', fontStyle:'italic', lineHeight:1.65 }}>
              Ghost train — fewer than {card.views ?? '15'} Wikipedia views/month.
              Rarer than Legendary.
            </div>
          )}

          {/* Extract */}
          {card.extract && (
            <div style={{ fontSize:11, color:'rgba(190,210,230,0.6)', lineHeight:1.65,
              flex:1, overflow:'hidden', fontFamily:'Georgia,serif', fontStyle:'italic',
              display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical' }}>
              {card.extract}
            </div>
          )}

          {/* Character note */}
          {card.character?.note && (
            <div style={{ fontSize:9, color: isTF ? `${card.character.color}99` : 'rgba(200,160,255,0.65)',
              fontFamily:'monospace', lineHeight:1.4, flexShrink:0,
              overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
              {card.character.note}
            </div>
          )}

          {/* Footer row */}
          <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'space-between',
            flexWrap:'wrap', flexShrink:0, marginTop:'auto' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <a href={card.url} target="_blank" rel="noreferrer" style={{
                fontSize:9, color:'#4fa8e8', fontFamily:'monospace', letterSpacing:'.06em',
                textDecoration:'none', padding:'5px 10px',
                border:'1px solid rgba(79,168,232,0.35)', borderRadius:5,
              }}>
                WIKIPEDIA →
              </a>
              {card.character && isTF && (
                <a href={`https://ttte.fandom.com/wiki/${encodeURIComponent(card.character.character)}_(T%26F)`}
                  target="_blank" rel="noreferrer" style={{
                    fontSize:9, color: card.character.color, fontFamily:'monospace', letterSpacing:'.06em',
                    textDecoration:'none', padding:'5px 10px',
                    border:`1px solid ${card.character.color}55`, borderRadius:5,
                  }}>
                  FANDOM →
                </a>
              )}
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
              {card.views > 0 && (
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>
                  {card.views < 1000 ? `${card.views}/mo` : `${(card.views/1000).toFixed(0)}k/mo`}
                </span>
              )}
              {count > 1 && (
                <span style={{ fontSize:9, color:rs.color, fontFamily:'monospace' }}>×{count}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
