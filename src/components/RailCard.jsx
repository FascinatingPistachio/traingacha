import { useState, useEffect, useRef } from 'react';
import { RARITY } from '../constants.js';
import '../styles/cards.css';

// Fixed dimensions — ALL sizes identical regardless of content amount
const SZ = {
  sm: { w:130, total:192, img:100, infoH:92,  name:9.5,  meta:7.5, badge:6.5, stars:10, bp:'6px 7px'  },
  md: { w:162, total:240, img:124, infoH:116, name:11.5, meta:8,   badge:7.5, stars:12, bp:'8px 10px' },
  lg: { w:196, total:290, img:150, infoH:140, name:13,   meta:8.5, badge:8,   stars:13, bp:'9px 12px' },
};

const STARS = { C:1, R:2, E:3, L:4, M:4 };

// Card frame colours per rarity
const FRAME = {
  C: { top:'#1a2a3a', bot:'#0f1e2d' },
  R: { top:'#081828', bot:'#03101e' },
  E: { top:'#160a24', bot:'#0a0416' },
  L: { top:'#1e1000', bot:'#120a00' },
  M: { top:'#020205', bot:'#010103' }, // near-void black for Mythic
};

// Rarity badge strip colour
const BADGE_BG = {
  C: 'rgba(10,20,30,0.88)',
  R: 'rgba(4,14,28,0.88)',
  E: 'rgba(18,6,32,0.88)',
  L: 'rgba(22,10,0,0.88)',
  M: 'rgba(0,0,6,0.92)',
};

// ── Image with cached-image fix ───────────────────────────────────────────────
function CardImage({ src, alt }) {
  const [status, setStatus] = useState('loading');
  const imgRef = useRef(null);

  useEffect(() => { setStatus('loading'); }, [src]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
  }, [src]);

  return (
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden', background:'rgba(0,0,0,0.4)' }}>
      {status === 'loading' && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="spinner" />
        </div>
      )}
      {status === 'error' && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}>
          <svg width="28" height="16" viewBox="0 0 80 42" fill="none">
            <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(255,255,255,0.15)" />
            <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(255,255,255,0.18)" />
            <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          </svg>
          <span style={{ fontSize:6.5, color:'rgba(255,255,255,0.18)', fontFamily:'monospace' }}>NO IMAGE</span>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={()  => setStatus('loaded')}
        onError={() => setStatus('error')}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
          opacity: status==='loaded' ? 1 : 0, transition:'opacity 0.35s' }}
      />
    </div>
  );
}

// ── Character badge — overlaps top-right corner of photo ─────────────────────
// Shows the FICTIONAL character that the REAL locomotive inspired.
function CharacterBadge({ character, size }) {
  const sz       = SZ[size];
  const circleW  = size === 'sm' ? 24 : 30;
  return (
    <div className="char-badge" style={{ top: size==='sm' ? 4 : 6 }}>
      {/* Portrait circle */}
      <div style={{
        width: circleW, height: circleW, borderRadius: '50%',
        background: 'linear-gradient(135deg,#1e1e3a,#0a0a1e)',
        border: '2px solid rgba(255,255,255,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size==='sm' ? 13 : 17,
        boxShadow: '0 3px 12px rgba(0,0,0,0.75)',
      }}>
        {character.emoji}
      </div>
      {/* Name pill */}
      <div className="char-badge-bubble">
        <span style={{ fontSize: sz.badge - 0.5, color:'#e8d4ff', fontFamily:'monospace', fontWeight:700, letterSpacing:'.04em' }}>
          {character.character}
        </span>
      </div>
    </div>
  );
}

// ── Mythic "GHOST TRAIN" watermark ────────────────────────────────────────────
function MythicWatermark({ size }) {
  const sz = SZ[size];
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontSize: size==='sm' ? 7 : size==='md' ? 8 : 9,
        color: 'rgba(140,160,255,0.12)',
        fontFamily: 'monospace',
        fontWeight: 700,
        letterSpacing: '.4em',
        transform: 'rotate(-30deg)',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}>
        GHOST TRAIN
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function RailCard({
  card,
  size = 'md',
  count = 0,
  dimmed = false,
  revealed = false,
  onClick = null,
  isFav = false,
  onFav = null,
}) {
  const rs    = RARITY[card.rarity] ?? RARITY.C;
  const sz    = SZ[size];
  const isL   = card.rarity === 'L';
  const isE   = card.rarity === 'E';
  const isM   = card.rarity === 'M';
  const isHigh = isL || isE || isM;
  const star  = STARS[card.rarity] ?? 1;
  const frame = FRAME[card.rarity] ?? FRAME.C;

  const classes = ['tc', `r-${card.rarity}`, revealed?'revealed':'', onClick?'clickable':'']
    .filter(Boolean).join(' ');

  // Box shadow is handled by CSS animation for M; manual for others
  const boxShadow = isM
    ? undefined
    : dimmed
      ? 'none'
      : `0 0 18px ${rs.glow}, 0 4px 22px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.04)`;

  return (
    <div
      className={classes}
      onClick={onClick}
      style={{
        width:  sz.w,
        height: sz.total,
        background: `linear-gradient(175deg, ${frame.top}, ${frame.bot})`,
        border: `2px solid ${dimmed ? 'rgba(255,255,255,0.05)' : rs.border}`,
        opacity: dimmed ? 0.17 : 1,
        boxShadow,
      }}
    >
      {/* Foil overlays */}
      {isHigh && !dimmed && <div className={`tc-foil tc-foil-${card.rarity}`} />}
      {/* Mythic scanlines */}
      {isM && !dimmed && <div className="tc-scanlines" />}

      {/* ── Photo section ── */}
      <div style={{ height: sz.img, flexShrink: 0, position: 'relative', borderBottom: `2px solid ${rs.border}`, overflow: 'hidden' }}>
        <CardImage src={card.image} alt={card.title} />

        {/* Mythic watermark on photo */}
        {isM && !dimmed && <MythicWatermark size={size} />}

        {/* Rarity strip across top of photo */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 19, zIndex: 5,
          background: BADGE_BG[card.rarity],
          borderBottom: `1px solid ${rs.border}`,
          display: 'flex', alignItems: 'center', paddingLeft: 6, gap: 5,
        }}>
          {isM && (
            <span style={{ fontSize: sz.badge - 0.5, color: rs.color, lineHeight: 1 }}>✦</span>
          )}
          <span style={{
            fontSize: sz.badge, color: rs.color, fontFamily: 'monospace',
            fontWeight: 700, letterSpacing: '.1em',
            textShadow: isM ? `0 0 8px ${rs.glow}, 0 0 16px ${rs.glow}` : `0 0 6px ${rs.glow}`,
          }}>
            {rs.name.toUpperCase()}
          </span>
          {isM && (
            <span style={{ fontSize: sz.badge - 1, color: 'rgba(140,160,255,0.5)', fontFamily: 'monospace', marginLeft: 2 }}>
              GHOST TRAIN
            </span>
          )}
        </div>

        {/* Bottom photo fade */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:28,
          background:`linear-gradient(transparent, ${frame.bot})`, zIndex:4 }} />

        {/* Count badge */}
        {count > 1 && (
          <div style={{ position:'absolute', top:22, left:5, zIndex:6,
            background:'rgba(0,0,0,0.84)', border:`1px solid ${rs.border}`,
            borderRadius:4, padding:'1px 5px', fontSize:sz.badge, color:rs.color, fontFamily:'monospace' }}>
            ×{count}
          </div>
        )}

        {/* Character badge — shows fictional character inspired by this real loco */}
        {card.character && !dimmed && <CharacterBadge character={card.character} size={size} />}

        {/* Favourite */}
        {onFav && (
          <button
            onClick={e => { e.stopPropagation(); onFav(); }}
            style={{
              position:'absolute', bottom:5, right:5, zIndex:7,
              background:'rgba(0,0,0,0.72)',
              border:`1px solid ${isFav ? 'rgba(255,100,100,0.65)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius:'50%', width:20, height:20, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:10, color:isFav?'#ff6b6b':'rgba(255,255,255,0.38)',
              transition:'all 0.15s',
            }}
          >
            {isFav ? '♥' : '♡'}
          </button>
        )}
      </div>

      {/* ── Info section ── */}
      <div style={{
        height: sz.infoH, padding: sz.bp, display:'flex', flexDirection:'column', gap:3,
        background: `linear-gradient(to bottom, ${frame.bot}, #030610)`,
        position:'relative', overflow:'hidden',
      }}>
        {/* Top separator line */}
        <div style={{ position:'absolute', top:0, left:8, right:8, height:1,
          background:`linear-gradient(to right, transparent, ${rs.border}, transparent)` }} />

        {/* Title — fixed 2-line height so cards don't resize */}
        <div style={{
          fontSize: sz.name, fontWeight:700, color:'#f0e8d8', lineHeight:1.2,
          fontFamily:'Georgia,serif',
          height: sz.name * 1.2 * 2 + 2,
          overflow:'hidden', display:'-webkit-box',
          WebkitLineClamp:2, WebkitBoxOrient:'vertical',
        }}>
          {card.title}
        </div>

        {/* Stars row */}
        <div style={{ display:'flex', gap:2, alignItems:'center', flexShrink:0, height:16 }}>
          {Array.from({ length: star }).map((_,i) => (
            <span key={i} style={{ fontSize:sz.stars, color:rs.color, lineHeight:1, filter:`drop-shadow(0 0 3px ${rs.glow})` }}>★</span>
          ))}
          {Array.from({ length: Math.max(0, 4-star) }).map((_,i) => (
            <span key={i} style={{ fontSize:sz.stars, color:'rgba(255,255,255,0.1)', lineHeight:1 }}>★</span>
          ))}
          {size !== 'sm' && card.views > 0 && (
            <span style={{ fontSize:sz.badge-0.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginLeft:4 }}>
              {card.views < 1000 ? `${card.views}/mo` : `${(card.views/1000).toFixed(0)}k/mo`}
            </span>
          )}
        </div>

        {/* Extract — italic flavour text, clamped */}
        {card.extract && size !== 'sm' && (
          <div style={{
            fontSize: sz.meta-0.5, color: isM ? 'rgba(140,160,255,0.45)' : 'rgba(200,215,230,0.42)',
            lineHeight:1.5, flex:1, overflow:'hidden',
            display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical',
            fontFamily:'Georgia,serif', fontStyle:'italic',
          }}>
            {card.extract}
          </div>
        )}

        {/* Character inspiration note (small, at bottom) */}
        {card.character && (
          <div style={{
            flexShrink:0,
            fontSize: sz.badge - 0.5,
            color:'rgba(200,160,255,0.6)',
            fontFamily:'monospace',
            lineHeight:1.3,
            overflow:'hidden',
            whiteSpace:'nowrap',
            textOverflow:'ellipsis',
          }}>
            {card.character.emoji} {card.character.note}
          </div>
        )}
      </div>
    </div>
  );
}
