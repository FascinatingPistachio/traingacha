import { useState, useEffect, useRef } from 'react';
import { RARITY } from '../constants.js';
import '../styles/cards.css';

// All sizes fixed — cards never change dimensions regardless of content
const SZ = {
  sm: { w:130, total:192, img:100, infoH:92, name:9.5, meta:7.5, badge:6.5, stars:10, bp:'6px 7px' },
  md: { w:162, total:240, img:124, infoH:116, name:11.5, meta:8,  badge:7.5, stars:12, bp:'8px 9px' },
  lg: { w:196, total:290, img:150, infoH:140, name:13,  meta:8.5, badge:8,   stars:13, bp:'9px 11px' },
};

const STARS = { C:1, R:2, E:3, L:4, M:4 };

const FRAME = {
  C: ['#1a2a3a','#0f1e2d'],
  R: ['#081828','#03101e'],
  E: ['#160a24','#0a0416'],
  L: ['#1e1000','#120a00'],
  M: ['#060610','#030308'],
};

// ── Image component with proper cached-image handling ─────────────────────────
function CardImage({ src, alt }) {
  const [status, setStatus] = useState('loading');
  const imgRef = useRef(null);

  // Handle case where image is already in browser cache (onLoad fires before React mount)
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, [src]);

  // Reset when src changes
  useEffect(() => { setStatus('loading'); }, [src]);

  return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden', background:'rgba(0,0,0,0.35)' }}>
      {status === 'loading' && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="spinner" />
        </div>
      )}
      {status === 'error' && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:22 }}>🚂</div>
          <div style={{ fontSize:7, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>NO IMAGE</div>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
          opacity: status === 'loaded' ? 1 : 0, transition:'opacity 0.3s' }}
      />
    </div>
  );
}

function CharacterBadge({ character, size }) {
  const sz = SZ[size];
  const cSize = size === 'sm' ? 22 : 28;
  return (
    <div className="char-badge">
      <div style={{ width:cSize, height:cSize, borderRadius:'50%', background:'linear-gradient(135deg,#1e1e3a,#0a0a1e)',
        border:'1.5px solid rgba(255,255,255,0.28)', display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:size==='sm'?12:16, boxShadow:'0 2px 10px rgba(0,0,0,0.7)' }}>
        {character.emoji}
      </div>
      <div className="char-badge-bubble">
        <span style={{ fontSize:sz.badge-0.5, color:'#e8d0ff', fontFamily:'monospace', fontWeight:700, letterSpacing:'.04em' }}>
          {character.character}
        </span>
      </div>
    </div>
  );
}

export default function RailCard({ card, size='md', count=0, dimmed=false, revealed=false, onClick=null, isFav=false, onFav=null }) {
  const rs = RARITY[card.rarity] ?? RARITY.C;
  const sz = SZ[size];
  const isL = card.rarity === 'L';
  const isE = card.rarity === 'E';
  const isM = card.rarity === 'M';
  const star = STARS[card.rarity] ?? 1;
  const [f1, f2] = FRAME[card.rarity] ?? FRAME.C;

  const classes = ['tc', `r-${card.rarity}`, revealed?'revealed':'', onClick?'clickable':''].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} style={{
      width:sz.w, height:sz.total,
      background:`linear-gradient(175deg,${f1},${f2})`,
      border:`2.5px solid ${dimmed?'rgba(255,255,255,0.05)':rs.border}`,
      opacity:dimmed?0.18:1,
      boxShadow:dimmed?'none':`0 0 20px ${rs.glow}, 0 4px 20px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.04)`,
    }}>
      {/* Foil overlays */}
      {(isL||isE||isM) && !dimmed && <div className={`tc-foil tc-foil-${card.rarity}`} />}

      {/* Image */}
      <div style={{ height:sz.img, flexShrink:0, position:'relative', borderBottom:`2px solid ${rs.border}`, overflow:'hidden' }}>
        <CardImage src={card.image} alt={card.title} />

        {/* Top rarity strip */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:18,
          background:`linear-gradient(to bottom,${f1}dd,transparent)`,
          display:'flex', alignItems:'center', paddingLeft:6, zIndex:2 }}>
          <span style={{ fontSize:sz.badge, color:rs.color, fontFamily:'monospace', fontWeight:700, letterSpacing:'.08em', textShadow:`0 0 6px ${rs.glow}` }}>
            {isM ? '✦ ' : ''}{rs.name.toUpperCase()}
          </span>
        </div>

        {/* Bottom gradient */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:28, background:`linear-gradient(transparent,${f2})`, zIndex:2 }} />

        {count > 1 && (
          <div style={{ position:'absolute', top:4, left:4, zIndex:3,
            background:'rgba(0,0,0,0.82)', border:`1px solid ${rs.border}`,
            borderRadius:4, padding:'1px 5px', fontSize:sz.badge, color:rs.color, fontFamily:'monospace' }}>
            ×{count}
          </div>
        )}

        {card.character && !dimmed && <CharacterBadge character={card.character} size={size} />}

        {/* Favourite button */}
        {onFav && (
          <button onClick={e=>{e.stopPropagation();onFav();}}
            style={{ position:'absolute', bottom:6, right:6, zIndex:4,
              background:'rgba(0,0,0,0.7)', border:`1px solid ${isFav?'rgba(255,100,100,0.6)':'rgba(255,255,255,0.15)'}`,
              borderRadius:'50%', width:22, height:22, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:11,
              color:isFav?'#ff6b6b':'rgba(255,255,255,0.4)',
              transition:'all 0.15s',
            }}>
            {isFav ? '♥' : '♡'}
          </button>
        )}
      </div>

      {/* Info */}
      <div style={{ height:sz.infoH, padding:sz.bp, display:'flex', flexDirection:'column', gap:3,
        background:`linear-gradient(to bottom,${f2},#06101c)`, position:'relative', overflow:'hidden' }}>
        {/* Decorative separator */}
        <div style={{ position:'absolute', top:0, left:8, right:8, height:1,
          background:`linear-gradient(to right,transparent,${rs.border},transparent)` }} />

        {/* Name — always same height */}
        <div style={{ fontSize:sz.name, fontWeight:700, color:'#f0e8d8', lineHeight:1.22,
          fontFamily:'Georgia,serif', minHeight: sz.name * 1.22 * 2, overflow:'hidden',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {card.title}
        </div>

        {/* Stars */}
        <div style={{ display:'flex', gap:2, alignItems:'center', flexShrink:0 }}>
          {Array.from({length:star}).map((_,i)=>(
            <span key={i} style={{ fontSize:sz.stars, color:rs.color, lineHeight:1, filter:`drop-shadow(0 0 3px ${rs.glow})` }}>★</span>
          ))}
          {Array.from({length:Math.max(0,4-star)}).map((_,i)=>(
            <span key={i} style={{ fontSize:sz.stars, color:'rgba(255,255,255,0.1)', lineHeight:1 }}>★</span>
          ))}
          {card.views > 0 && size !== 'sm' && (
            <span style={{ fontSize:sz.badge-0.5, color:'rgba(255,255,255,0.18)', fontFamily:'monospace', marginLeft:4 }}>
              {card.views < 1000 ? `${card.views}/mo` : `${(card.views/1000).toFixed(0)}k/mo`}
            </span>
          )}
          {isM && (
            <span style={{ fontSize:sz.badge-0.5, color:rs.color, fontFamily:'monospace', marginLeft:4, opacity:0.7 }}>ghost</span>
          )}
        </div>

        {/* Extract */}
        {card.extract && size !== 'sm' && (
          <div style={{ fontSize:sz.meta-0.5, color:'rgba(200,215,230,0.42)', lineHeight:1.52,
            flex:1, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical',
            fontFamily:'Georgia,serif', fontStyle:'italic' }}>
            {card.extract}
          </div>
        )}

        {/* Character note on sm */}
        {card.character && size==='sm' && (
          <div style={{ fontSize:6.5, color:'rgba(220,180,255,0.55)', fontFamily:'monospace', lineHeight:1.3, flexShrink:0 }}>
            {card.character.character} · {card.character.show}
          </div>
        )}
      </div>
    </div>
  );
}
