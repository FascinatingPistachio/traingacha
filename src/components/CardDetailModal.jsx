/**
 * CardDetailModal — big card zoom + train VFX + pinch-to-zoom
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import RailCard from './RailCard.jsx';
import TrainVFX from './TrainVFX.jsx';
import { RARITY } from '../constants.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';
import { detectTrainType, trainTypeEmoji, isHighSpeed } from '../utils/trainType.js';
import { soundSteamHiss, soundDieselRumble, soundElectricSpark, soundHighSpeedWhoosh, soundBoilerPressure, soundLegendaryBoom } from '../utils/sounds.js';

// ── Particle burst ─────────────────────────────────────────────────────────
function Sparks({ color, count = 20 }) {
  return (
    <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'visible', zIndex:60 }}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist  = 55 + Math.random() * 110;
        return (
          <div key={i} className="spark" style={{
            '--tx': `${Math.cos(angle) * dist}px`,
            '--ty': `${Math.sin(angle) * dist}px`,
            position: 'absolute', top: '50%', left: '50%',
            width:  4 + Math.random() * 5, height: 4 + Math.random() * 5,
            borderRadius: '50%',
            background: i % 4 === 0 ? '#fff' : color,
            boxShadow: `0 0 ${6 + Math.random() * 6}px ${i % 4 === 0 ? '#fff' : color}`,
            animationDelay: `${(Math.random() * 0.3).toFixed(2)}s`,
          }} />
        );
      })}
    </div>
  );
}

// ── Info panel ─────────────────────────────────────────────────────────────
function InfoPanel({ card, rs }) {
  const isTF = card.character?.show === 'Thomas & Friends';
  const [charImg, setCharImg] = useState(null);
  const [charOk,  setCharOk]  = useState(false);

  useEffect(() => {
    if (!isTF || !card.character?.character) return;
    let cancelled = false;
    fetchFandomCharacterImage(card.character.character, false)
      .then(u => { if (!cancelled) setCharImg(u); }).catch(() => {});
    return () => { cancelled = true; };
  }, [isTF, card.character?.character]);

  const trainType = detectTrainType(card.title);
  const typeLabel = trainTypeEmoji(card.title);

  return (
    <div className="slide-up" style={{ width:'100%', display:'flex', flexDirection:'column', gap:10 }}>
      {/* Train type badge */}
      <div style={{
        background: trainType === 'steam' ? 'rgba(255,200,100,0.08)'
                  : trainType === 'diesel' ? 'rgba(100,80,60,0.12)'
                  : trainType === 'electric' ? 'rgba(80,160,255,0.08)'
                  : trainType === 'maglev' ? 'rgba(160,100,255,0.08)'
                  : 'rgba(255,255,255,0.04)',
        border: `1px solid ${
          trainType === 'steam' ? 'rgba(255,180,60,0.3)'
          : trainType === 'diesel' ? 'rgba(120,90,60,0.3)'
          : trainType === 'electric' ? 'rgba(80,160,255,0.3)'
          : trainType === 'maglev' ? 'rgba(160,100,255,0.3)'
          : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 8, padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 15 }}>
          {trainType === 'steam' ? '♨️' : trainType === 'diesel' ? '🛢️' : trainType === 'electric' ? '⚡' : trainType === 'maglev' ? '🧲' : '🚂'}
        </span>
        <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
          color: 'rgba(255,255,255,0.6)', letterSpacing: '.1em' }}>
          {typeLabel}
        </span>
        {isHighSpeed(card.title) && (
          <span style={{ marginLeft: 'auto', fontSize: 8, fontFamily: 'monospace',
            color: '#4fa8e8', letterSpacing: '.08em' }}>🚄 HIGH-SPEED</span>
        )}
      </div>

      {/* Character block */}
      {card.character && (
        <div style={{
          background: `${card.character.color ?? '#1565c0'}1a`,
          border: `1px solid ${card.character.color ?? '#1565c0'}44`,
          borderRadius: 12, padding: 14,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
            background: card.character.color ?? '#1565c0',
            border: `2px solid ${card.character.color ?? '#1565c0'}`,
            boxShadow: `0 4px 16px ${card.character.color ?? '#1565c0'}55`,
            overflow: 'hidden', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'rgba(255,255,255,0.9)',
              fontFamily: 'Georgia,serif', position: 'absolute' }}>
              {card.character.character.charAt(0)}
            </span>
            {charImg && (
              <img src={charImg} alt={card.character.character}
                onLoad={() => setCharOk(true)} onError={() => setCharImg(null)}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', opacity: charOk ? 1 : 0, transition: 'opacity 0.3s' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace', letterSpacing: '.15em', marginBottom: 3 }}>
              {card.character.show.toUpperCase()}
            </div>
            <div style={{ fontSize: 15, fontFamily: 'Georgia,serif', fontWeight: 700, color: card.character.color ?? '#c9a833', marginBottom: 5 }}>
              {card.character.character}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', lineHeight: 1.55 }}>
              {card.character.note}
            </div>
          </div>
        </div>
      )}

      {/* Wikipedia extract */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
          <span style={{ fontSize: 13 }}>📖</span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '.12em', fontWeight: 700 }}>WIKIPEDIA</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(200,215,230,0.7)', fontFamily: 'Georgia,serif', fontStyle: 'italic', lineHeight: 1.7 }}>
          {card.fullExtract || card.extract || 'No description available.'}
        </div>
      </div>

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {card.views > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700,
              color: card.views >= 80000 ? '#e8c040' : card.views >= 18000 ? '#b57bee' : '#4fa8e8' }}>
              {card.views >= 1000000 ? `${(card.views/1000000).toFixed(1)}M` : card.views >= 1000 ? `${(card.views/1000).toFixed(0)}k` : card.views}
            </div>
            <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginTop: 2 }}>WIKIPEDIA VIEWS/MO</div>
          </div>
        )}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${rs.border}44`, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: rs.color }}>
            {card.rarity === 'M' ? '✦ MYTHIC' : rs.name.toUpperCase()}
          </div>
          <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginTop: 2 }}>RARITY</div>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {card.url && (
          <a href={card.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              background:'rgba(79,168,232,0.1)', border:'1px solid rgba(79,168,232,0.35)',
              borderRadius:8, padding:'11px 14px', textDecoration:'none',
              color:'#4fa8e8', fontFamily:'monospace', fontSize:10, letterSpacing:'.07em', fontWeight:700 }}>
            📖 READ ON WIKIPEDIA →
          </a>
        )}
        {isTF && card.character && (
          <a href={`https://ttte.fandom.com/wiki/${encodeURIComponent(card.character.character.replace(/ /g, '_'))}`}
            target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              background:`${card.character.color ?? '#b57bee'}18`,
              border:`1px solid ${card.character.color ?? '#b57bee'}44`,
              borderRadius:8, padding:'11px 14px', textDecoration:'none',
              color:card.character.color ?? '#b57bee',
              fontFamily:'monospace', fontSize:10, letterSpacing:'.07em', fontWeight:700 }}>
            🚂 {card.character.character.toUpperCase()} ON FANDOM →
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main modal ──────────────────────────────────────────────────────────────
export default function CardDetailModal({ card, count, onClose, isFav = false, onFav = null }) {
  const rs      = RARITY[card.rarity] ?? RARITY.C;
  const isHigh  = card.rarity === 'L' || card.rarity === 'M';

  const [tab,        setTab]       = useState('card');
  const [showSparks, setShowSparks]= useState(isHigh);
  const [pinchScale, setPinchScale]= useState(1);

  const trainType = detectTrainType(card.title);

  // Calculate responsive card scale — fill ~88vw
  const BASE_W = 200; // lg card width
  const BASE_H = 300;
  const viewW  = typeof window !== 'undefined' ? window.innerWidth : 390;
  const cardScale = Math.min(2.8, Math.max(1.4, (viewW - 24) / BASE_W));
  const scaledW = Math.round(BASE_W * cardScale * pinchScale);
  const scaledH = Math.round(BASE_H * cardScale * pinchScale);

  // Sparks timeout
  useEffect(() => {
    if (showSparks) {
      const t = setTimeout(() => setShowSparks(false), 1100);
      return () => clearTimeout(t);
    }
  }, [showSparks]);

  // Play train sound on open
  useEffect(() => {
    if (isHigh) {
      setTimeout(() => soundLegendaryBoom(), 300);
    } else {
      setTimeout(() => {
        if (trainType === 'steam')   soundSteamHiss();
        if (trainType === 'diesel')  soundDieselRumble();
        if (trainType === 'electric') soundElectricSpark();
        if (trainType === 'maglev') soundHighSpeedWhoosh();
      }, 200);
    }
  }, []);

  // Pinch-to-zoom touch handling
  const lastDist = useRef(null);
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.hypot(dx, dy);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length !== 2 || !lastDist.current) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const ratio = dist / lastDist.current;
    setPinchScale(s => Math.min(2.5, Math.max(0.5, s * ratio)));
    lastDist.current = dist;
  }, []);

  const handleTouchEnd = useCallback(() => { lastDist.current = null; }, []);

  // VFX active only on card tab
  const vfxActive = tab === 'card';

  return (
    <div
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(2,5,14,0.96)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflowY: 'auto', overflowX: 'hidden',
      }}
    >
      {/* VFX overlay — fullscreen ambient particles */}
      {vfxActive && trainType !== 'unknown' && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 501 }}>
          <TrainVFX trainType={trainType} width={viewW} height={window.innerHeight ?? 844} active />
        </div>
      )}

      {/* Close button */}
      <button onClick={onClose} style={{
        position: 'fixed', top: 14, right: 14, zIndex: 600,
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: '50%', width: 44, height: 44,
        color: 'rgba(255,255,255,0.8)', fontSize: 22, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}>×</button>

      {/* Pinch hint */}
      <div style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace',
        letterSpacing: '.08em', zIndex: 600, pointerEvents: 'none',
      }}>PINCH TO ZOOM</div>

      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 480,
        padding: `${Math.max(20, 60 - cardScale * 5)}px 12px 60px`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
      }}>

        {/* ── THE CARD — scaled to viewport ── */}
        <div style={{
          position: 'relative',
          width: scaledW, height: scaledH,
          flexShrink: 0,
          animation: isHigh
            ? 'legendBurst 0.65s cubic-bezier(0.34,1.56,0.64,1) both'
            : 'slideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both',
          transition: 'width 0.15s, height 0.15s',
        }}>
          {showSparks && <Sparks color={rs.color} count={isHigh ? 28 : 12} />}

          {/* Scale the lg card (200×300) to fill the target size */}
          <div style={{
            transform: `scale(${cardScale * pinchScale})`,
            transformOrigin: 'top left',
            width: BASE_W, height: BASE_H,
          }}>
            <RailCard card={card} size="lg" count={count ?? 1} isFav={isFav} onFav={onFav} />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 320 }}>
          <div style={{ display: 'flex', flex: 1, borderRadius: 10, overflow: 'hidden', border: `1px solid ${rs.border}55` }}>
            {[['card', '🃏 CARD'], ['info', '📖 INFO']].map(([t, lbl]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '11px 4px',
                background: tab === t ? rs.bg : 'rgba(0,0,0,0.25)',
                border: 'none', cursor: 'pointer', fontSize: 10,
                color: tab === t ? rs.color : 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.08em',
                transition: 'all 0.15s',
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* ── CARD tab ── */}
        {tab === 'card' && (
          <>
            {(count ?? 1) > 1 && (
              <div className="slide-up" style={{ width: '100%', maxWidth: 320 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${rs.border}44`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                  <span style={{ fontSize: 10, color: rs.color, fontFamily: 'monospace', fontWeight: 700 }}>You own ×{count} copies</span>
                </div>
              </div>
            )}
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.12)', fontFamily: 'monospace', textAlign: 'center', lineHeight: 1.8 }}>
              Hover/touch the card for 3D effects · Pinch to zoom<br />
              Stats seeded from article title — same for all players
            </div>
          </>
        )}

        {/* ── INFO tab ── */}
        {tab === 'info' && (
          <div style={{ width: '100%', maxWidth: 420 }}>
            <InfoPanel card={card} rs={rs} />
          </div>
        )}
      </div>
    </div>
  );
}
