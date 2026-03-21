import { useState, useEffect, useRef } from 'react';
import { RARITY } from '../constants.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';
import '../styles/cards.css';

// ── Exact 2:3 ratio (600:900) at three display sizes ─────────────────────────
const SZ = {
  sm: { w:128, h:192,  img:86,  name:9,    meta:7,   badge:6,   stars:9,  bp:'6px 7px'  },
  md: { w:160, h:240,  img:108, name:11,   meta:7.5, badge:7,   stars:11, bp:'7px 9px'  },
  lg: { w:192, h:288,  img:130, name:13,   meta:8,   badge:8,   stars:12, bp:'9px 11px' },
};

const STARS = { C:1, R:2, E:3, L:4, M:4 };
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

// ── Image component — handles cached images correctly ─────────────────────────
function CardImage({ src, alt }) {
  const [status, setStatus] = useState('loading');
  const ref = useRef(null);
  useEffect(() => { setStatus('loading'); }, [src]);
  useEffect(() => {
    const img = ref.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
  }, [src]);
  return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden', background:'#ffffff' }}>
      {status === 'loading' && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(240,240,240,0.5)' }}>
          <div className="spinner" style={{ borderColor:'rgba(0,0,0,0.12)', borderTopColor:'rgba(0,0,0,0.45)' }} />
        </div>
      )}
      {status === 'error' && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, background:'#f5f5f5' }}>
          <svg width="28" height="16" viewBox="0 0 80 42" fill="none">
            <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(0,0,0,0.12)"/>
            <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(0,0,0,0.12)"/>
            <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2"/>
            <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="2"/>
          </svg>
          <span style={{ fontSize:6, color:'rgba(255,255,255,0.15)', fontFamily:'monospace' }}>NO IMAGE</span>
        </div>
      )}
      <img ref={ref} src={src} alt={alt}
        onLoad={() => setStatus('loaded')} onError={() => setStatus('error')}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
          opacity:status==='loaded'?1:0, transition:'opacity 0.3s' }}
      />
    </div>
  );
}

// ── Thomas & Friends character banner ─────────────────────────────────────────
// Styled like reference: coloured strip across bottom of photo, portrait circle
// overlapping the strip upward into the photo.
function ThomasBanner({ character, size }) {
  const [charImg,  setCharImg]  = useState(null);
  const [imgOk,    setImgOk]    = useState(false);

  useEffect(() => {
    fetchFandomCharacterImage(character.character)
      .then(url => setCharImg(url ?? null))
      .catch(() => {});
  }, [character.character]);

  const sz      = SZ[size];
  const stripH  = size === 'sm' ? 26 : size === 'md' ? 32 : 38;
  const circleD = size === 'sm' ? 38 : size === 'md' ? 48 : 58;
  const col     = character.color ?? '#1d6fc4';

  return (
    <div style={{
      position:'absolute', bottom:0, left:0, right:0,
      height:stripH, background:col, zIndex:8,
      display:'flex', alignItems:'center',
      paddingLeft: circleD + 8,
      paddingRight:6,
      boxShadow:'0 -1px 8px rgba(0,0,0,0.45)',
    }}>
      {/* Character portrait circle — fully contained in photo, left-aligned to banner */}
      <div style={{
        position:'absolute', left:5, bottom:4,
        width:circleD, height:circleD, borderRadius:'50%',
        overflow:'hidden',
        border:'2.5px solid rgba(255,255,255,0.95)',
        background:col,
        boxShadow:'0 2px 12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.2)',
        zIndex:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
      }}>
        {charImg ? (
          <img src={charImg} alt={character.character}
            onLoad={() => setImgOk(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:imgOk?1:0, transition:'opacity 0.3s' }}
          />
        ) : (
          <span style={{ fontSize:circleD*0.36, fontWeight:800, color:'#fff', fontFamily:'monospace', textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>
            {character.character.charAt(0)}
          </span>
        )}
      </div>

      {/* Text */}
      <div style={{ flex:1, minWidth:0, overflow:'hidden' }}>
        <div style={{ fontSize:size==='sm'?5:6.5, color:'rgba(255,255,255,0.75)', fontFamily:'monospace', fontWeight:700,
          letterSpacing:'.1em', lineHeight:1, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {character.show.toUpperCase()}
        </div>
        <div style={{ fontSize:size==='sm'?8:10, color:'#fff', fontFamily:'Georgia,serif', fontWeight:700, lineHeight:1,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {character.character}
        </div>
      </div>
    </div>
  );
}

// ── Main RailCard ─────────────────────────────────────────────────────────────
export default function RailCard({
  card, size='md', count=0, dimmed=false, revealed=false, onClick=null, isFav=false, onFav=null,
}) {
  const rs     = RARITY[card.rarity] ?? RARITY.C;
  const sz     = SZ[size];
  const isL    = card.rarity === 'L';
  const isE    = card.rarity === 'E';
  const isM    = card.rarity === 'M';
  const star   = STARS[card.rarity] ?? 1;
  const { top, bot } = FRAME[card.rarity] ?? FRAME.C;
  const infoH  = sz.h - sz.img;
  const isTF   = !!(card.character && card.character.show === 'Thomas & Friends');

  const classes = ['tc', `r-${card.rarity}`, revealed?'revealed':'', onClick?'clickable':''].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} style={{
      width:sz.w, height:sz.h,
      background:`linear-gradient(175deg,${top},${bot})`,
      border:`2px solid ${dimmed?'rgba(255,255,255,0.05)':rs.border}`,
      opacity:dimmed?0.17:1,
      boxShadow: isM ? undefined : dimmed ? 'none'
        : `0 0 18px ${rs.glow}, 0 4px 22px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.04)`,
      // Enforce aspect ratio
      aspectRatio: '2/3',
    }}>
      {(isL||isE||isM) && !dimmed && <div className={`tc-foil tc-foil-${card.rarity}`} />}
      {isM && !dimmed && <div className="tc-scanlines" />}

      {/* ── Photo ── */}
      <div style={{ height:sz.img, flexShrink:0, position:'relative',
        borderBottom:`2px solid ${rs.border}`, overflow:'hidden' }}>
        <CardImage src={card.image} alt={card.title} />

        {/* Rarity badge strip */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:19, zIndex:5,
          background:BADGE_BG[card.rarity],
          borderBottom:`1px solid ${rs.border}`,
          display:'flex', alignItems:'center', paddingLeft:5, gap:4,
        }}>
          {isM && <span style={{ fontSize:sz.badge-0.5, color:rs.color }}>✦</span>}
          <span style={{ fontSize:sz.badge, color:rs.color, fontFamily:'monospace', fontWeight:700, letterSpacing:'.1em',
            textShadow:`0 0 5px ${rs.glow}` }}>
            {rs.name.toUpperCase()}
          </span>
          {isM && <span style={{ fontSize:sz.badge-1.5, color:'rgba(140,160,255,0.45)', fontFamily:'monospace' }}>GHOST</span>}
        </div>

        {/* Bottom photo gradient (not shown when Thomas banner is present) */}
        {!isTF && (
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:26,
            background:`linear-gradient(transparent,${bot})`, zIndex:4 }} />
        )}

        {/* Count badge */}
        {count > 1 && (
          <div style={{ position:'absolute', top:22, left:4, zIndex:6,
            background:'rgba(0,0,0,0.85)', border:`1px solid ${rs.border}`,
            borderRadius:4, padding:'1px 5px', fontSize:sz.badge, color:rs.color, fontFamily:'monospace' }}>
            ×{count}
          </div>
        )}

        {/* Thomas & Friends coloured banner + portrait */}
        {isTF && !dimmed && <ThomasBanner character={card.character} size={size} />}

        {/* Other franchise badge (small circle, top-right) */}
        {card.character && !isTF && !dimmed && (
          <div style={{ position:'absolute', top:22, right:4, zIndex:7,
            width:size==='sm'?22:27, height:size==='sm'?22:27, borderRadius:'50%',
            background:card.character.color??'#4b5563',
            border:'2px solid rgba(255,255,255,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 8px rgba(0,0,0,0.6)' }}>
            <span style={{ fontSize:size==='sm'?8:10, fontWeight:800, color:'#fff', fontFamily:'monospace' }}>
              {card.character.character.charAt(0)}
            </span>
          </div>
        )}

        {/* Favourite */}
        {onFav && (
          <button onClick={e=>{e.stopPropagation();onFav();}} style={{
            position:'absolute', zIndex:10,
            bottom: isTF ? (size==='sm'?30:size==='md'?36:42) : 4,
            right:4,
            background:'rgba(0,0,0,0.7)',
            border:`1px solid ${isFav?'rgba(255,100,100,0.65)':'rgba(255,255,255,0.15)'}`,
            borderRadius:'50%', width:18, height:18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:9, color:isFav?'#ff6b6b':'rgba(255,255,255,0.38)',
          }}>
            {isFav?'♥':'♡'}
          </button>
        )}
      </div>

      {/* ── Info section ── */}
      <div style={{
        height:infoH, padding:sz.bp, display:'flex', flexDirection:'column', gap:2,
        background:`linear-gradient(to bottom,${bot},#030610)`,
        position:'relative', overflow:'hidden',
        paddingTop: isTF
          ? (size==='sm'?'9px':size==='md'?'11px':'13px')
          : undefined,
      }}>
        {/* Top rule */}
        <div style={{ position:'absolute', top:0, left:7, right:7, height:1,
          background:`linear-gradient(to right,transparent,${rs.border},transparent)` }} />

        {/* Title — fixed 2-line box */}
        <div style={{
          fontSize:sz.name, fontWeight:700, color:'#f0e8d8', lineHeight:1.22, fontFamily:'Georgia,serif',
          height:sz.name*1.22*2+2, overflow:'hidden',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
        }}>
          {card.title}
        </div>

        {/* Stars row */}
        <div style={{ display:'flex', gap:2, alignItems:'center', flexShrink:0 }}>
          {Array.from({length:star}).map((_,i)=>(
            <span key={i} style={{ fontSize:sz.stars, color:rs.color, lineHeight:1, filter:`drop-shadow(0 0 3px ${rs.glow})` }}>★</span>
          ))}
          {Array.from({length:Math.max(0,4-star)}).map((_,i)=>(
            <span key={i} style={{ fontSize:sz.stars, color:'rgba(255,255,255,0.1)', lineHeight:1 }}>★</span>
          ))}
          {size!=='sm' && card.views>0 && (
            <span style={{ fontSize:sz.badge-0.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginLeft:3 }}>
              {card.views<1000?`${card.views}/mo`:`${(card.views/1000).toFixed(0)}k/mo`}
            </span>
          )}
        </div>

        {/* Extract */}
        {card.extract && size!=='sm' && (
          <div style={{
            fontSize:sz.meta, color:isM?'rgba(140,160,255,0.4)':'rgba(200,215,230,0.38)',
            lineHeight:1.5, flex:1, overflow:'hidden',
            display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical',
            fontFamily:'Georgia,serif', fontStyle:'italic',
          }}>
            {card.extract}
          </div>
        )}

        {/* Character note */}
        {card.character && size!=='sm' && (
          <div style={{ flexShrink:0, fontSize:sz.badge-0.5,
            color: isTF ? `${card.character.color}90` : 'rgba(200,160,255,0.6)',
            fontFamily:'monospace', lineHeight:1.3,
            overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
            {card.character.note}
          </div>
        )}
      </div>
    </div>
  );
}
