/**
 * CardDetailModal
 * 
 * Shows the FULL card (RailCard lg = 200×300) as centrepiece.
 * INFO tab slides up with Wikipedia extract + character details.
 * Sparks burst for Legendary / Mythic.
 */
import { useState, useEffect } from 'react';
import RailCard from './RailCard.jsx';
import { RARITY } from '../constants.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';

// ── Particle burst ────────────────────────────────────────────────────────────
function Sparks({ color, count = 20 }) {
  return (
    <div aria-hidden style={{
      position:'absolute', inset:0, pointerEvents:'none',
      overflow:'visible', zIndex:60,
    }}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist  = 55 + Math.random() * 110;
        return (
          <div key={i} className="spark" style={{
            '--tx': `${Math.cos(angle) * dist}px`,
            '--ty': `${Math.sin(angle) * dist}px`,
            position: 'absolute', top: '50%', left: '50%',
            width:  4 + Math.random() * 5,
            height: 4 + Math.random() * 5,
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

// ── Info panel ────────────────────────────────────────────────────────────────
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

  return (
    <div className="slide-up" style={{ width:'100%', display:'flex', flexDirection:'column', gap:10 }}>

      {/* Character block */}
      {card.character && (
        <div style={{
          background: `${card.character.color ?? '#1565c0'}1a`,
          border: `1px solid ${card.character.color ?? '#1565c0'}44`,
          borderRadius: 12, padding: 14,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          {/* Portrait */}
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
            <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace',
              letterSpacing: '.15em', marginBottom: 3 }}>
              {card.character.show.toUpperCase()}
            </div>
            <div style={{ fontSize: 15, fontFamily: 'Georgia,serif', fontWeight: 700,
              color: card.character.color ?? '#c9a833', marginBottom: 5 }}>
              {card.character.character}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', lineHeight: 1.55 }}>
              {card.character.note}
            </div>
          </div>
        </div>
      )}

      {/* Wikipedia extract */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
          <span style={{ fontSize: 13 }}>📖</span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace',
            letterSpacing: '.12em', fontWeight: 700 }}>WIKIPEDIA</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(200,215,230,0.7)', fontFamily: 'Georgia,serif',
          fontStyle: 'italic', lineHeight: 1.7 }}>
          {card.fullExtract || card.extract || 'No description available.'}
        </div>
      </div>

      {/* Meta grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {card.views > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700,
              color: card.views >= 80000 ? '#e8c040' : card.views >= 18000 ? '#b57bee' : '#4fa8e8' }}>
              {card.views >= 1000000 ? `${(card.views/1000000).toFixed(1)}M`
                : card.views >= 1000 ? `${(card.views/1000).toFixed(0)}k`
                : card.views}
            </div>
            <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginTop: 2 }}>
              WIKIPEDIA VIEWS/MO
            </div>
          </div>
        )}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${rs.border}44`,
          borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: rs.color }}>
            {card.rarity === 'M' ? '✦ MYTHIC' : rs.name.toUpperCase()}
          </div>
          <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginTop: 2 }}>
            RARITY
          </div>
        </div>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {card.url && (
          <a href={card.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: 'rgba(79,168,232,0.1)', border: '1px solid rgba(79,168,232,0.35)',
              borderRadius: 8, padding: '11px 14px', textDecoration: 'none',
              color: '#4fa8e8', fontFamily: 'monospace', fontSize: 10, letterSpacing: '.07em', fontWeight: 700 }}>
            📖 READ ON WIKIPEDIA →
          </a>
        )}
        {isTF && card.character && (
          <a href={`https://ttte.fandom.com/wiki/${encodeURIComponent(card.character.character.replace(/ /g, '_'))}`}
            target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              background: `${card.character.color ?? '#b57bee'}18`,
              border: `1px solid ${card.character.color ?? '#b57bee'}44`,
              borderRadius: 8, padding: '11px 14px', textDecoration: 'none',
              color: card.character.color ?? '#b57bee',
              fontFamily: 'monospace', fontSize: 10, letterSpacing: '.07em', fontWeight: 700 }}>
            🚂 {card.character.character.toUpperCase()} ON FANDOM →
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────
export default function CardDetailModal({ card, count, onClose, isFav = false, onFav = null }) {
  const rs      = RARITY[card.rarity] ?? RARITY.C;
  const isHigh  = card.rarity === 'L' || card.rarity === 'M';

  const [tab,        setTab]       = useState('card');
  const [showSparks, setShowSparks]= useState(isHigh);

  useEffect(() => {
    if (showSparks) {
      const t = setTimeout(() => setShowSparks(false), 1100);
      return () => clearTimeout(t);
    }
  }, [showSparks]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(2,5,14,0.94)',
        backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflowY: 'auto', overflowX: 'hidden',
      }}
    >
      {/* Close button */}
      <button onClick={onClose} style={{
        position: 'fixed', top: 14, right: 14, zIndex: 600,
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '50%', width: 40, height: 40,
        color: 'rgba(255,255,255,0.7)', fontSize: 20, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>×</button>

      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420,
        padding: '24px 16px 52px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>

        {/* ── THE CARD — full size, lg (200×300) ── */}
        <div style={{
          position: 'relative',
          animation: isHigh
            ? 'legendBurst 0.65s cubic-bezier(0.34,1.56,0.64,1) both'
            : 'slideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both',
        }}>
          {showSparks && <Sparks color={rs.color} count={isHigh ? 24 : 10} />}
          <RailCard card={card} size="lg" count={count ?? 1} isFav={isFav} onFav={onFav} />
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 260 }}>
          <div style={{ display: 'flex', flex: 1, borderRadius: 8, overflow: 'hidden',
            border: `1px solid ${rs.border}44` }}>
            {[['card', '🃏 CARD'], ['info', '📖 INFO']].map(([t, lbl]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '9px 4px',
                background: tab === t ? rs.bg : 'rgba(0,0,0,0.2)',
                border: 'none', cursor: 'pointer', fontSize: 9,
                color: tab === t ? rs.color : 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.08em',
                transition: 'all 0.15s',
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* ── CARD tab ── */}
        {tab === 'card' && (count ?? 1) > 1 && (
          <div className="slide-up" style={{ width: '100%', maxWidth: 260 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${rs.border}44`,
              borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
              <span style={{ fontSize: 10, color: rs.color, fontFamily: 'monospace', fontWeight: 700 }}>
                You own ×{count} copies
              </span>
            </div>
          </div>
        )}
        {tab === 'card' && (
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.12)', fontFamily: 'monospace',
            textAlign: 'center', lineHeight: 1.8 }}>
            Hover/touch the card for 3D effects<br/>
            Stats seeded from article title — same for all players
          </div>
        )}

        {/* ── INFO tab ── */}
        {tab === 'info' && (
          <div style={{ width: '100%', maxWidth: 360 }}>
            <InfoPanel card={card} rs={rs} />
          </div>
        )}
      </div>
    </div>
  );
}
