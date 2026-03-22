import { useState, useEffect, useRef } from 'react';
import RailCard from './RailCard.jsx';
import CardDetailModal from './CardDetailModal.jsx';
import PackAnimation from './PackAnimation.jsx';
import { RARITY } from '../constants.js';
import { soundFlip, soundPackHover, soundClick } from '../utils/sounds.js';
import { preloadCardImagesComplete } from '../utils/preload.js';

// ── Card back (face-down) ────────────────────────────────────────────────────
function CardBack({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); soundPackHover(); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:160, height:240, borderRadius:8, cursor:'pointer',
        background:'linear-gradient(145deg,#0d1e35,#061020)',
        border:'2px solid rgba(201,168,51,0.35)',
        boxShadow: hovered
          ? '0 0 28px rgba(201,168,51,0.5), 0 12px 40px rgba(0,0,0,0.8)'
          : '0 4px 20px rgba(0,0,0,0.7)',
        transform: hovered ? 'translateY(-10px) scale(1.04)' : 'translateY(0) scale(1)',
        transition:'transform 0.2s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.2s',
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', gap:12, position:'relative', overflow:'hidden',
      }}
    >
      {/* Diamond pattern */}
      <div style={{ position:'absolute', inset:0, opacity:0.06,
        backgroundImage:`repeating-linear-gradient(45deg,#c9a833 0,#c9a833 1px,transparent 0,transparent 50%)`,
        backgroundSize:'12px 12px' }} />
      {/* Logo */}
      <div style={{ fontSize:36, filter:'drop-shadow(0 0 12px rgba(201,168,51,0.6))' }}>🚂</div>
      <div style={{ color:'rgba(201,168,51,0.7)', fontFamily:'monospace', fontSize:9,
        letterSpacing:'.2em', fontWeight:700 }}>RAIL GACHA</div>
      <div style={{ position:'absolute', inset:4, border:'1px solid rgba(201,168,51,0.12)',
        borderRadius:7, pointerEvents:'none' }} />
    </div>
  );
}

// ── Revealed card (full 3D face-up card) ─────────────────────────────────────
function RevealedCard({ card, onClick }) {
  const rs  = RARITY[card.rarity] ?? RARITY.C;
  const ref = useRef(null);
  const raf = useRef(null);

  const onMove = (e) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r  = ref.current.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top)  / r.height;
      const rx = (ny - 0.5) * -20;
      const ry = (nx - 0.5) *  20;
      ref.current.style.transform =
        `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06) translateZ(14px)`;
      // Holographic position
      ref.current.style.setProperty('--hx', `${nx * 100}%`);
      ref.current.style.setProperty('--hy', `${ny * 100}%`);
      ref.current.style.setProperty('--hi', (card.rarity === 'L' || card.rarity === 'M') ? '0.22' : '0.06');
      // Shine spot
      const s = ref.current.querySelector('.rev-shine');
      if (s) { s.style.opacity = '1'; s.style.setProperty('--sx', `${nx*100}%`); s.style.setProperty('--sy', `${ny*100}%`); }
    });
  };
  const onLeave = () => {
    cancelAnimationFrame(raf.current);
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
    ref.current.style.setProperty('--hi', '0');
    const s = ref.current.querySelector('.rev-shine');
    if (s) s.style.opacity = '0';
  };

  const isTF = card.character?.show === 'Thomas & Friends';
  const starCount = card.rarity === 'C' ? 1 : card.rarity === 'R' ? 2 : card.rarity === 'E' ? 3 : 4;
  const isHigh = card.rarity === 'L' || card.rarity === 'M';

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        width:160, borderRadius:8, cursor:'pointer',
        overflow:'hidden', flexShrink:0, position:'relative',
        border:`2px solid ${rs.border}`,
        background:`linear-gradient(180deg,#111e2d,#060f1c)`,
        boxShadow: isHigh
          ? `0 0 22px ${rs.glow}, 0 8px 30px rgba(0,0,0,0.8)`
          : '0 6px 24px rgba(0,0,0,0.7)',
        transition:'transform 0.1s ease-out, box-shadow 0.2s',
        willChange:'transform',
        animation:'flipIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
      }}
      className={isHigh ? (card.rarity === 'L' ? 'glow-L' : 'glow-M') : ''}
    >
      {/* Holographic foil */}
      <div aria-hidden style={{
        position:'absolute', inset:0, zIndex:10, pointerEvents:'none',
        borderRadius:'inherit', mixBlendMode:'color-dodge',
        background: card.rarity === 'M'
          ? 'linear-gradient(135deg,#ff6ec7,#7b2fff,#00d4ff,#0fff89,#ff6ec7)'
          : 'linear-gradient(135deg,#ffd700,#ffaa00,#ffe066,#ffd700)',
        backgroundSize:'200% 200%',
        backgroundPosition:'var(--hx,50%) var(--hy,50%)',
        opacity:'var(--hi,0)',
        transition:'opacity 0.2s',
      }} />
      {/* Shine spot */}
      <div className="rev-shine" style={{
        position:'absolute', inset:0, zIndex:11, pointerEvents:'none',
        borderRadius:'inherit', opacity:0, transition:'opacity 0.15s',
        background:'radial-gradient(ellipse 55% 40% at var(--sx,50%) var(--sy,50%),rgba(255,255,255,0.2) 0%,transparent 70%)',
      }} />

      {/* Rarity strip */}
      <div style={{ padding:'4px 7px', display:'flex', alignItems:'center', gap:2,
        borderBottom:`1px solid ${rs.border}44`, background:'rgba(0,0,0,0.3)' }}>
        {Array.from({length:starCount}).map((_,i)=>(
          <span key={i} style={{fontSize:8,color:rs.color,filter:`drop-shadow(0 0 3px ${rs.glow})`}}>★</span>
        ))}
        <span style={{flex:1}} />
        <span style={{fontSize:7.5,color:rs.color,fontFamily:'monospace',fontWeight:700,letterSpacing:'.08em',
          textShadow:`0 0 6px ${rs.glow}`}}>
          {card.rarity === 'M' ? '✦ ???' : rs.name.toUpperCase()}
        </span>
      </div>

      {/* Image */}
      <CardPhotoStrip card={card} isTF={isTF} rs={rs} />

      {/* Title */}
      <div style={{ padding:'6px 7px 4px' }}>
        <div style={{ fontSize:9.5, fontWeight:700, color:'#f0e8d8', fontFamily:'Georgia,serif',
          lineHeight:1.25, overflow:'hidden', display:'-webkit-box',
          WebkitLineClamp:2, WebkitBoxOrient:'vertical', minHeight:22 }}>
          {card.title}
        </div>
        {card.stats && (
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:3 }}>
            <span style={{ fontSize:14, fontWeight:900, fontFamily:'monospace',
              color:rs.color, textShadow:`0 0 8px ${rs.glow}` }}>
              {card.stats.overall}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Card photo strip (no position:absolute tricks) ────────────────────────────
function CardPhotoStrip({ card, isTF, rs }) {
  const [imgSrc, setImgSrc] = useState(card.image || null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!card.image);

  return (
    <div style={{ width:'100%', height:110, background: failed ? rs.bg : '#1a2535',
      overflow:'hidden', position:'relative', flexShrink:0 }}>
      {/* Placeholder train icon */}
      {(failed || !loaded) && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
          justifyContent:'center', background:`linear-gradient(135deg,${rs.bg},#060f1c)` }}>
          <span style={{ fontSize:32, opacity:0.3 }}>🚂</span>
        </div>
      )}
      {imgSrc && !failed && (
        <img
          src={imgSrc}
          alt={card.title}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', display:'block',
            opacity: loaded ? 1 : 0,
            transition:'opacity 0.35s ease-out',
          }}
        />
      )}
      {/* Thomas banner */}
      {isTF && card.character && (
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:22,
          background:`linear-gradient(90deg,${card.character.color ?? '#1565c0'},${card.character.color ?? '#1565c0'}cc)`,
          display:'flex', alignItems:'center', paddingLeft:8, zIndex:5,
          boxShadow:'0 -1px 8px rgba(0,0,0,0.5)',
        }}>
          <span style={{ fontSize:9, fontWeight:700, color:'#fff',
            fontFamily:'Georgia,serif', textShadow:'0 1px 4px rgba(0,0,0,0.7)' }}>
            {card.character.character}
          </span>
        </div>
      )}
      {/* Gradient fade at bottom */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:30,
        background:'linear-gradient(transparent,#060f1c)', pointerEvents:'none', zIndex:4 }} />
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function OpeningScreen({ cardsPromise, onDone }) {
  const [phase,   setPhase]   = useState('animating');
  const [cards,   setCards]   = useState([]);
  const [shown,   setShown]   = useState(new Set());
  const [preview, setPreview] = useState(null);

  // Keep a ref to cardsPromise so handleAnimDone always sees latest value
  const promiseRef = useRef(cardsPromise);
  useEffect(() => { promiseRef.current = cardsPromise; }, [cardsPromise]);

  const handleAnimDone = async () => {
    setPhase('waiting');
    try {
      const result = await promiseRef.current;
      const arr = Array.isArray(result) ? result : (result?.cards ?? []);
      const validCards = arr.filter(Boolean);
      // Preload all images BEFORE showing cards — no loading spinners
      await preloadCardImagesComplete(validCards, 5000);
      setCards(validCards);
    } catch {
      setCards([]);
    }
    setPhase('revealing');
  };

  if (phase === 'animating') return (
    <div style={{ background:'#06101c', minHeight:'calc(100vh - 100px)' }}>
      <PackAnimation onComplete={handleAnimDone} />
    </div>
  );

  if (phase === 'waiting') return (
    <div style={{ minHeight:'calc(100vh - 100px)', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:28, height:28, borderRadius:'50%',
        border:'3px solid rgba(201,168,51,0.2)', borderTop:'3px solid #c9a833',
        animation:'spin 0.75s linear infinite' }} />
      <p style={{ fontSize:10, color:'rgba(201,168,51,0.4)', fontFamily:'monospace', margin:0 }}>
        pulling from wikipedia…
      </p>
    </div>
  );

  const allShown = cards.length > 0 && shown.size >= cards.length;

  const flip = (i) => {
    if (shown.has(i)) { soundClick(); setPreview(cards[i]); return; }
    soundFlip(cards[i]?.rarity ?? 'C');
    setShown(prev => new Set([...prev, i]));
  };

  const revealAll = () => {
    cards.forEach((c, i) => {
      if (!shown.has(i)) setTimeout(() => soundFlip(c?.rarity ?? 'C'), i * 100);
    });
    setShown(new Set(cards.map((_, i) => i)));
  };

  const best = allShown && cards.length
    ? cards.reduce((b, c) => (RARITY[c?.rarity]?.rank ?? 0) > (RARITY[b?.rarity]?.rank ?? 0) ? c : b, cards[0])
    : null;

  return (
    <div style={{ minHeight:'calc(100vh - 100px)', padding:'16px 10px 32px',
      display:'flex', flexDirection:'column', alignItems:'center', maxWidth:640, margin:'0 auto' }}>

      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ color:'#c9a833', fontFamily:'monospace', fontSize:13,
          fontWeight:700, letterSpacing:'.2em' }}>YOUR CARDS</div>
        <div style={{ fontSize:8.5, color:'rgba(255,255,255,0.25)', fontFamily:'monospace', marginTop:4 }}>
          {allShown ? 'TAP CARD TO INSPECT' : `${shown.size}/${cards.length} REVEALED — TAP TO FLIP`}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', marginBottom:24 }}>
        {cards.map((card, i) => {
          if (!card) return null;
          const isShown = shown.has(i);
          return (
            <div key={i}>
              {isShown ? (
                <div onClick={() => { soundClick(); setPreview(card); }}>
                  <RailCard card={card} size="md" />
                </div>
              ) : (
                <CardBack onClick={() => flip(i)} />
              )}
            </div>
          );
        })}
      </div>

      {/* Best card highlight */}
      {best && (RARITY[best.rarity]?.rank ?? 0) >= 2 && (
        <div onClick={() => setPreview(best)} style={{
          background:`linear-gradient(135deg,${RARITY[best.rarity].bg},#030610)`,
          border:`2px solid ${RARITY[best.rarity].border}`,
          borderRadius:12, padding:'12px 16px', marginBottom:20,
          width:'100%', maxWidth:340, cursor:'pointer',
          boxShadow:`0 0 28px ${RARITY[best.rarity].glow}`,
          animation:'fadeUp 0.45s ease-out',
          display:'flex', gap:12, alignItems:'center',
        }}>
          <div style={{ width:48, height:48, borderRadius:8, overflow:'hidden',
            flexShrink:0, background:'#1a2535' }}>
            {best.image && (
              <img src={best.image} alt={best.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                onError={e => { e.currentTarget.style.display='none'; }} />
            )}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:8, color:RARITY[best.rarity].color,
              fontFamily:'monospace', letterSpacing:'.1em', marginBottom:2 }}>
              {best.rarity === 'M' ? '✦ MYTHIC!' : best.rarity === 'L' ? '⭐ LEGENDARY!' : '✨ EPIC!'}
            </div>
            <div style={{ fontSize:12, color:'#f0e8d8', fontFamily:'Georgia,serif',
              fontWeight:700, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
              {best.title}
            </div>
            {best.stats && (
              <div style={{ fontSize:8.5, color:RARITY[best.rarity].color, fontFamily:'monospace', marginTop:2 }}>
                POWER: {best.stats.overall}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap:10 }}>
        {!allShown && (
          <button onClick={revealAll} style={{
            padding:'9px 22px', background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(201,168,51,0.3)', borderRadius:8,
            color:'#c9a833', fontSize:10, cursor:'pointer', fontFamily:'monospace',
          }}>REVEAL ALL</button>
        )}
        <button onClick={onDone} style={{
          padding:'12px 32px',
          background: allShown ? 'linear-gradient(135deg,#c9a833,#8a6d1a)' : 'rgba(255,255,255,0.05)',
          border: allShown ? 'none' : '1px solid rgba(255,255,255,0.1)',
          borderRadius:8, cursor:'pointer', fontFamily:'monospace', letterSpacing:'.1em',
          color: allShown ? '#06101c' : 'rgba(255,255,255,0.35)',
          fontSize:11, fontWeight: allShown ? 700 : 400,
          boxShadow: allShown ? '0 4px 20px rgba(201,168,51,0.4)' : 'none',
        }}>
          {allShown ? 'OPEN ANOTHER →' : 'SKIP →'}
        </button>
      </div>

      {preview && (
        <CardDetailModal card={preview} count={1} isFav={false} onFav={null}
          onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
