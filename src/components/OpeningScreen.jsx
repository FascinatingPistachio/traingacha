import { useState, useEffect, useRef } from 'react';
import RailCard from './RailCard.jsx';
import CardDetailModal from './CardDetailModal.jsx';
import PackAnimation from './PackAnimation.jsx';
import { RARITY } from '../constants.js';
import { soundFlip, soundPackHover, soundClick, soundSteamHiss, soundDieselRumble, soundElectricSpark, soundHighSpeedWhoosh, soundLegendaryBoom } from '../utils/sounds.js';
import { detectTrainType } from '../utils/trainType.js';
import { preloadCardImagesComplete } from '../utils/preload.js';

// ── Card back ─────────────────────────────────────────────────────────────────
function CardBack({ onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); soundPackHover(); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 160, height: 240, borderRadius: 8, cursor: 'pointer',
        background: 'linear-gradient(145deg,#0d1e35,#061020)',
        border: '2px solid rgba(201,168,51,0.35)',
        boxShadow: hovered
          ? '0 0 28px rgba(201,168,51,0.5), 0 12px 40px rgba(0,0,0,0.8)'
          : '0 4px 20px rgba(0,0,0,0.6)',
        transform: hovered ? 'translateY(-8px) scale(1.03)' : 'none',
        transition: 'transform 0.18s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.18s',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position:'absolute', inset:0, opacity:0.05,
        backgroundImage:`repeating-linear-gradient(45deg,#c9a833 0,#c9a833 1px,transparent 0,transparent 50%)`,
        backgroundSize:'14px 14px' }} />
      <div style={{ position:'absolute', inset:5,
        border:'1px solid rgba(201,168,51,0.12)', borderRadius:5 }} />
      <div style={{ fontSize:36, filter:'drop-shadow(0 0 14px rgba(201,168,51,0.7))' }}>🚂</div>
      <div style={{ color:'rgba(201,168,51,0.7)', fontFamily:'monospace', fontSize:9,
        letterSpacing:'.22em', fontWeight:700 }}>RAIL GACHA</div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function OpeningScreen({ cardsPromise, onDone }) {
  const [phase,   setPhase]   = useState('animating');
  const [cards,   setCards]   = useState([]);
  const [shown,   setShown]   = useState(new Set());
  const [preview, setPreview] = useState(null);

  const promiseRef = useRef(cardsPromise);
  useEffect(() => { promiseRef.current = cardsPromise; }, [cardsPromise]);

  const handleAnimDone = async () => {
    setPhase('waiting');
    try {
      const result = await promiseRef.current;
      const arr = Array.isArray(result) ? result : (result?.cards ?? []);
      const valid = arr.filter(Boolean);
      // Wait for all images to be cached before showing cards
      await preloadCardImagesComplete(valid, 5000);
      setCards(valid);
    } catch {
      setCards([]);
    }
    setPhase('revealing');
  };

  // Loading screen
  if (phase === 'animating') return (
    <div style={{ background:'#06101c', minHeight:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <PackAnimation onComplete={handleAnimDone} />
    </div>
  );

  if (phase === 'waiting') return (
    <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:32, height:32, borderRadius:'50%',
        border:'3px solid rgba(201,168,51,0.15)',
        borderTop:'3px solid #c9a833',
        animation:'spin 0.75s linear infinite' }} />
      <p style={{ fontSize:10, color:'rgba(201,168,51,0.4)', fontFamily:'monospace', margin:0 }}>
        loading your cards…
      </p>
    </div>
  );

  const allShown = cards.length > 0 && shown.size >= cards.length;

  const flip = (i) => {
    if (shown.has(i)) { soundClick(); setPreview(cards[i]); return; }
    const card = cards[i];
    soundFlip(card?.rarity ?? 'C');
    // Play train-type sound after flip sound
    setTimeout(() => {
      const tt = detectTrainType(card?.title ?? '');
      if (tt === 'steam')    soundSteamHiss();
      else if (tt === 'diesel')   soundDieselRumble();
      else if (tt === 'electric') soundElectricSpark();
      else if (tt === 'maglev')   soundHighSpeedWhoosh();
      if (card?.rarity === 'L' || card?.rarity === 'M') {
        setTimeout(() => soundLegendaryBoom(), 300);
      }
    }, 350);
    setShown(prev => new Set([...prev, i]));
  };

  const revealAll = () => {
    cards.forEach((c, i) => {
      if (!shown.has(i)) setTimeout(() => soundFlip(c?.rarity ?? 'C'), i * 90);
    });
    setShown(new Set(cards.map((_, i) => i)));
  };

  const best = allShown && cards.length
    ? cards.reduce((b, c) =>
        (RARITY[c?.rarity]?.rank ?? 0) > (RARITY[b?.rarity]?.rank ?? 0) ? c : b,
        cards[0])
    : null;

  return (
    <div style={{ minHeight:'60vh', padding:'18px 10px 80px',
      display:'flex', flexDirection:'column', alignItems:'center', maxWidth:640, margin:'0 auto' }}>

      <div style={{ textAlign:'center', marginBottom:22 }}>
        <div style={{ color:'#c9a833', fontFamily:'monospace', fontSize:13,
          fontWeight:700, letterSpacing:'.2em' }}>YOUR CARDS</div>
        <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)',
          fontFamily:'monospace', marginTop:4 }}>
          {allShown ? 'TAP ANY CARD TO INSPECT' : `${shown.size}/${cards.length} — TAP TO REVEAL`}
        </div>
      </div>

      {/* Card row */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center',
        marginBottom:28 }}>
        {cards.map((card, i) => {
          const isShown = shown.has(i);
          const trainType = detectTrainType(card?.title ?? '');
          return (
            <div key={i} style={{ position:'relative', animation: isShown ? 'flipIn 0.5s cubic-bezier(0.22,1,0.36,1) both' : 'none' }}>
              {isShown ? (
                <>
                  {trainType === 'steam' && (
                    <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', pointerEvents:'none', zIndex:5 }}>
                      {[0,1,2].map(j => (
                        <div key={j} style={{ position:'absolute', width:10+j*5, height:10+j*5, borderRadius:'50%',
                          background:'rgba(220,235,255,0.22)', filter:'blur(5px)',
                          left:(j-1)*16, animation:`steamPuff ${1.4+j*0.35}s ease-out infinite`, animationDelay:`${j*0.45}s` }} />
                      ))}
                    </div>
                  )}
                  {trainType === 'electric' && (
                    <div style={{ position:'absolute', inset:0, borderRadius:8, pointerEvents:'none', zIndex:5,
                      boxShadow:'0 0 16px rgba(80,180,255,0.2), inset 0 0 12px rgba(80,160,255,0.08)' }} />
                  )}
                  {trainType === 'maglev' && (
                    <div style={{ position:'absolute', bottom:-4, left:0, right:0, height:4, borderRadius:'0 0 4px 4px',
                      background:'linear-gradient(90deg, transparent, rgba(160,100,255,0.5), transparent)',
                      animation:'maglevShimmer 1.5s linear infinite', backgroundSize:'200% 100%',
                      pointerEvents:'none', zIndex:5 }} />
                  )}
                  <RailCard
                    card={card}
                    size="md"
                    onClick={() => { soundClick(); setPreview(card); }}
                  />
                </>
              ) : (
                <CardBack onClick={() => flip(i)} />
              )}
            </div>
          );
        })}
      </div>

      {/* Best pull highlight */}
      {best && (RARITY[best.rarity]?.rank ?? 0) >= 2 && (
        <div onClick={() => setPreview(best)} style={{
          background: `linear-gradient(135deg,${RARITY[best.rarity].bg},#030610)`,
          border: `2px solid ${RARITY[best.rarity].border}`,
          borderRadius: 12, padding: '12px 16px', marginBottom: 22,
          width: '100%', maxWidth: 340, cursor: 'pointer',
          boxShadow: `0 0 28px ${RARITY[best.rarity].glow}`,
          animation: 'fadeUp 0.45s ease-out',
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <div style={{ width:52, height:52, borderRadius:8, overflow:'hidden',
            flexShrink:0, background:'#1a2535' }}>
            {best.image && (
              <img src={best.image} alt={best.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                onError={e => { e.currentTarget.style.display='none'; }} />
            )}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:9, color:RARITY[best.rarity].color,
              fontFamily:'monospace', letterSpacing:'.1em', marginBottom:3 }}>
              {best.rarity==='M'?'✦ MYTHIC!':best.rarity==='L'?'⭐ LEGENDARY!':'✨ EPIC!'}
            </div>
            <div style={{ fontSize:13, color:'#f0e8d8', fontFamily:'Georgia,serif',
              fontWeight:700, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
              {best.title}
            </div>
            {best.stats && (
              <div style={{ fontSize:9, color:RARITY[best.rarity].color,
                fontFamily:'monospace', marginTop:3 }}>
                POWER: {best.stats.overall}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
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
          borderRadius: 8, cursor: 'pointer', fontFamily: 'monospace',
          letterSpacing: '.1em',
          color: allShown ? '#06101c' : 'rgba(255,255,255,0.35)',
          fontSize: 11, fontWeight: allShown ? 700 : 400,
          boxShadow: allShown ? '0 4px 20px rgba(201,168,51,0.4)' : 'none',
        }}>
          {allShown ? 'OPEN ANOTHER →' : 'SKIP'}
        </button>
      </div>

      {preview && (
        <CardDetailModal card={preview} count={1}
          isFav={false} onFav={null}
          onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
