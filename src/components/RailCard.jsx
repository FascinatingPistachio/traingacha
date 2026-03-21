import { useState, useEffect, useRef } from 'react';
import { RARITY } from '../constants.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';
import '../styles/cards.css';

const SZ = {
  sm: { w:130, total:192, img:100, infoH:92,  name:9.5,  meta:7.5, badge:6.5, stars:10, bp:'6px 7px'  },
  md: { w:162, total:240, img:124, infoH:116, name:11.5, meta:8,   badge:7.5, stars:12, bp:'8px 10px' },
  lg: { w:196, total:290, img:150, infoH:140, name:13,   meta:8.5, badge:8,   stars:13, bp:'9px 12px' },
};
const STARS = { C:1, R:2, E:3, L:4, M:4 };
const FRAME = {
  C: { top:'#1a2a3a', bot:'#0f1e2d' },
  R: { top:'#081828', bot:'#03101e' },
  E: { top:'#160a24', bot:'#0a0416' },
  L: { top:'#1e1000', bot:'#120a00' },
  M: { top:'#020205', bot:'#010103' },
};
const BADGE_BG = {
  C:'rgba(10,20,30,0.90)', R:'rgba(4,14,28,0.90)',
  E:'rgba(18,6,32,0.90)',  L:'rgba(22,10,0,0.90)', M:'rgba(0,0,8,0.95)',
};

// ── Image with cached-image fix ───────────────────────────────────────────────
function CardImage({ src, alt }) {
  const [status, setStatus] = useState('loading');
  const ref = useRef(null);
  useEffect(() => { setStatus('loading'); }, [src]);
  useEffect(() => {
    const img = ref.current;
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
          <svg width="30" height="18" viewBox="0 0 80 42" fill="none">
            <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(255,255,255,0.12)" />
            <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(255,255,255,0.14)" />
            <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          </svg>
          <span style={{ fontSize:6.5, color:'rgba(255,255,255,0.16)', fontFamily:'monospace' }}>NO IMAGE</span>
        </div>
      )}
      <img ref={ref} src={src} alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
          opacity:status==='loaded'?1:0, transition:'opacity 0.3s' }}
      />
    </div>
  );
}

// ── Thomas-style character banner ─────────────────────────────────────────────
// Matches the reference image: coloured banner with character portrait circle
// overlapping the photo/banner boundary, show logo text, character name.
function ThomasBanner({ character, size, imgH }) {
  const [charImg, setCharImg]   = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    fetchFandomCharacterImage(character.character)
      .then(url => setCharImg(url))
      .catch(() => {});
  }, [character.character]);

  const bannerH   = size === 'sm' ? 28 : size === 'md' ? 34 : 40;
  const circleD   = size === 'sm' ? 40 : size === 'md' ? 52 : 62;
  const charColor = character.color ?? '#2563eb';

  return (
    // Banner sits at the bottom of the image area, overlapping into info section
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: bannerH,
      background: charColor,
      zIndex: 8,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: circleD * 0.6 + 6,
      paddingRight: 8,
      boxShadow: `0 -2px 12px rgba(0,0,0,0.4)`,
    }}>
      {/* Thomas & Friends logo text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: size === 'sm' ? 5.5 : 7,
          color: 'rgba(255,255,255,0.8)',
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          lineHeight: 1,
          marginBottom: 2,
        }}>
          {character.show}
        </div>
        <div style={{
          fontSize: size === 'sm' ? 8 : 10,
          color: '#ffffff',
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          lineHeight: 1,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {character.character}
        </div>
      </div>

      {/* Character portrait circle — overlaps photo/banner boundary */}
      <div style={{
        position: 'absolute',
        left: 6,
        // Shift up so circle overlaps the photo above the banner
        bottom: bannerH * 0.3,
        width: circleD,
        height: circleD,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `2.5px solid rgba(255,255,255,0.9)`,
        background: charColor,
        boxShadow: `0 3px 14px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.3)`,
        zIndex: 9,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {charImg ? (
          <img
            src={charImg}
            alt={character.character}
            onLoad={() => setImgLoaded(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:imgLoaded?1:0, transition:'opacity 0.3s' }}
          />
        ) : (
          // Fallback: coloured circle with initial
          <span style={{ fontSize: circleD * 0.35, fontWeight:800, color:'#fff', fontFamily:'monospace',
            textShadow:'0 1px 3px rgba(0,0,0,0.4)' }}>
            {character.character.charAt(0)}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main RailCard ─────────────────────────────────────────────────────────────
export default function RailCard({
  card, size='md', count=0, dimmed=false, revealed=false, onClick=null, isFav=false, onFav=null,
}) {
  const rs    = RARITY[card.rarity] ?? RARITY.C;
  const sz    = SZ[size];
  const isL   = card.rarity === 'L';
  const isE   = card.rarity === 'E';
  const isM   = card.rarity === 'M';
  const star  = STARS[card.rarity] ?? 1;
  const { top, bot } = FRAME[card.rarity] ?? FRAME.C;
  const hasBanner = !!(card.character && card.character.show === 'Thomas & Friends');

  const classes = ['tc', `r-${card.rarity}`, revealed?'revealed':'', onClick?'clickable':''].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} style={{
      width:sz.w, height:sz.total,
      background:`linear-gradient(175deg, ${top}, ${bot})`,
      border:`2px solid ${dimmed?'rgba(255,255,255,0.05)':rs.border}`,
      opacity:dimmed?0.17:1,
      boxShadow: isM
        ? undefined
        : dimmed ? 'none'
        : `0 0 18px ${rs.glow}, 0 4px 22px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.04)`,
    }}>
      {(isL||isE||isM) && !dimmed && <div className={`tc-foil tc-foil-${card.rarity}`} />}
      {isM && !dimmed && <div className="tc-scanlines" />}

      {/* ── Photo section ── */}
      <div style={{ height:sz.img, flexShrink:0, position:'relative', borderBottom:`2px solid ${rs.border}`, overflow:'hidden' }}>
        <CardImage src={card.image} alt={card.title} />

        {/* Rarity strip at top of photo */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:20, zIndex:5,
          background:BADGE_BG[card.rarity],
          borderBottom:`1px solid ${rs.border}`,
          display:'flex', alignItems:'center', paddingLeft:6, gap:4,
        }}>
          {isM && <span style={{ fontSize:sz.badge-0.5, color:rs.color }}>✦</span>}
          <span style={{ fontSize:sz.badge, color:rs.color, fontFamily:'monospace', fontWeight:700, letterSpacing:'.1em',
            textShadow:isM?`0 0 8px ${rs.glow}`:`0 0 5px ${rs.glow}` }}>
            {rs.name.toUpperCase()}
          </span>
          {isM && <span style={{ fontSize:sz.badge-1.5, color:'rgba(140,160,255,0.5)', fontFamily:'monospace' }}>GHOST TRAIN</span>}
        </div>

        {/* Bottom photo fade */}
        {!hasBanner && (
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:28, background:`linear-gradient(transparent,${bot})`, zIndex:4 }} />
        )}

        {/* Count */}
        {count > 1 && (
          <div style={{ position:'absolute', top:23, left:5, zIndex:6,
            background:'rgba(0,0,0,0.85)', border:`1px solid ${rs.border}`,
            borderRadius:4, padding:'1px 5px', fontSize:sz.badge, color:rs.color, fontFamily:'monospace' }}>
            ×{count}
          </div>
        )}

        {/* Thomas-style blue banner + character portrait */}
        {hasBanner && !dimmed && (
          <ThomasBanner character={card.character} size={size} imgH={sz.img} />
        )}

        {/* Non-Thomas character badge (small circle, top right) */}
        {card.character && !hasBanner && !dimmed && (
          <div style={{ position:'absolute', top:22, right:4, zIndex:7,
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.7))' }}>
            <div style={{ width:size==='sm'?22:28, height:size==='sm'?22:28, borderRadius:'50%',
              background:card.character.color??'#4b5563',
              border:'2px solid rgba(255,255,255,0.32)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:size==='sm'?11:14, boxShadow:'0 2px 10px rgba(0,0,0,0.7)' }}>
              <span style={{ fontSize:size==='sm'?8:10, fontWeight:800, color:'#fff', fontFamily:'monospace' }}>
                {card.character.character.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Favourite */}
        {onFav && (
          <button onClick={e=>{e.stopPropagation();onFav();}} style={{
            position:'absolute', bottom: hasBanner ? (size==='sm'?32:size==='md'?38:44) : 5,
            right:5, zIndex:10,
            background:'rgba(0,0,0,0.72)',
            border:`1px solid ${isFav?'rgba(255,100,100,0.65)':'rgba(255,255,255,0.15)'}`,
            borderRadius:'50%', width:20, height:20, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:10, color:isFav?'#ff6b6b':'rgba(255,255,255,0.38)',
            transition:'all 0.15s',
          }}>
            {isFav?'♥':'♡'}
          </button>
        )}
      </div>

      {/* ── Info section ── */}
      <div style={{
        height:sz.infoH, padding:sz.bp, display:'flex', flexDirection:'column', gap:3,
        background:`linear-gradient(to bottom,${bot},#030610)`,
        position:'relative', overflow:'hidden',
        // If Thomas banner, add top padding so text doesn't hide behind portrait
        paddingTop: hasBanner
          ? (size==='sm' ? '10px' : size==='md' ? '12px' : '14px')
          : sz.bp.split(' ')[0],
      }}>
        <div style={{ position:'absolute', top:0, left:8, right:8, height:1,
          background:`linear-gradient(to right,transparent,${rs.border},transparent)` }} />

        {/* Title */}
        <div style={{
          fontSize:sz.name, fontWeight:700, color:'#f0e8d8', lineHeight:1.2, fontFamily:'Georgia,serif',
          height:sz.name*1.2*2+2, overflow:'hidden',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
        }}>
          {card.title}
        </div>

        {/* Stars */}
        <div style={{ display:'flex', gap:2, alignItems:'center', flexShrink:0, height:16 }}>
          {Array.from({length:star}).map((_,i)=>(
            <span key={i} style={{ fontSize:sz.stars, color:rs.color, lineHeight:1, filter:`drop-shadow(0 0 3px ${rs.glow})` }}>★</span>
          ))}
          {Array.from({length:Math.max(0,4-star)}).map((_,i)=>(
            <span key={i} style={{ fontSize:sz.stars, color:'rgba(255,255,255,0.1)', lineHeight:1 }}>★</span>
          ))}
          {size!=='sm' && card.views > 0 && (
            <span style={{ fontSize:sz.badge-0.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginLeft:4 }}>
              {card.views<1000?`${card.views}/mo`:`${(card.views/1000).toFixed(0)}k/mo`}
            </span>
          )}
        </div>

        {/* Extract */}
        {card.extract && size!=='sm' && (
          <div style={{
            fontSize:sz.meta-0.5,
            color:isM?'rgba(140,160,255,0.42)':'rgba(200,215,230,0.4)',
            lineHeight:1.5, flex:1, overflow:'hidden',
            display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical',
            fontFamily:'Georgia,serif', fontStyle:'italic',
          }}>
            {card.extract}
          </div>
        )}

        {/* Character note — only for non-Thomas characters */}
        {card.character && !hasBanner && (
          <div style={{ flexShrink:0, fontSize:sz.badge-0.5, color:'rgba(200,160,255,0.62)',
            fontFamily:'monospace', lineHeight:1.3, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
            {card.character.note}
          </div>
        )}

        {/* Thomas character note in info area */}
        {hasBanner && size !== 'sm' && (
          <div style={{ flexShrink:0, fontSize:sz.badge-0.5, color:`${card.character.color}88`,
            fontFamily:'monospace', lineHeight:1.3, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
            {card.character.note}
          </div>
        )}
      </div>
    </div>
  );
}
