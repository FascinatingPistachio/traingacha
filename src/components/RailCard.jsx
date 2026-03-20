import { useState } from 'react';
import { RARITY } from '../constants.js';
import '../styles/cards.css';

const SZ = {
  sm: { w: 120, total: 178, img: 96,  name: 9.5, meta: 7,   badge: 6,   lines: 2, stars: 10, bp: '6px 7px' },
  md: { w: 158, total: 234, img: 126, name: 12,  meta: 8,   badge: 7.5, lines: 3, stars: 12, bp: '8px 9px' },
  lg: { w: 192, total: 285, img: 155, name: 14,  meta: 8.5, badge: 8,   lines: 4, stars: 13, bp: '9px 11px' },
};
const STARS      = { C: 1, R: 2, E: 3, L: 4 };
const FRAME_STOPS = {
  C: ['#1a2a3a', '#0f1e2d'],
  R: ['#081828', '#03101e'],
  E: ['#160a24', '#0a0416'],
  L: ['#1e1000', '#120a00'],
};

function CardImage({ src, alt }) {
  const [ok, setOk] = useState(false);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {!ok && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      )}
      <img src={src} alt={alt} onLoad={() => setOk(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: ok ? 1 : 0, transition: 'opacity 0.3s' }} />
    </div>
  );
}

function CharacterBadge({ character, size }) {
  const sz = SZ[size];
  const circleSize = size === 'sm' ? 22 : 28;
  return (
    <div className="char-badge">
      <div style={{
        width: circleSize, height: circleSize, borderRadius: '50%',
        background: 'linear-gradient(135deg,#1e1e3a,#0a0a1e)',
        border: '1.5px solid rgba(255,255,255,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size === 'sm' ? 12 : 16,
        boxShadow: '0 2px 10px rgba(0,0,0,0.7)',
      }}>
        {character.emoji}
      </div>
      <div className="char-badge-bubble">
        <span style={{ fontSize: sz.badge - 0.5, color: '#e8d0ff', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.04em' }}>
          {character.character}
        </span>
      </div>
    </div>
  );
}

export default function RailCard({ card, size = 'md', count = 0, dimmed = false, revealed = false, onClick = null }) {
  const rs   = RARITY[card.rarity] ?? RARITY.C;
  const sz   = SZ[size];
  const isL  = card.rarity === 'L';
  const isE  = card.rarity === 'E';
  const star = STARS[card.rarity] ?? 1;
  const [f1, f2] = FRAME_STOPS[card.rarity] ?? FRAME_STOPS.C;
  const infoH = sz.total - sz.img;

  const classes = ['tc', `r-${card.rarity}`, revealed ? 'revealed' : '', onClick ? 'clickable' : ''].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} style={{
      width: sz.w, height: sz.total,
      background: `linear-gradient(175deg, ${f1}, ${f2})`,
      border: `2.5px solid ${dimmed ? 'rgba(255,255,255,0.06)' : rs.border}`,
      opacity: dimmed ? 0.18 : 1,
      boxShadow: dimmed ? 'none' : `0 0 20px ${rs.glow}, 0 4px 20px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.05)`,
    }}>
      {(isL || isE) && !dimmed && <div className={`tc-foil tc-foil-${card.rarity}`} />}

      {/* Image */}
      <div style={{ height: sz.img, position: 'relative', borderBottom: `2px solid ${rs.border}`, overflow: 'hidden' }}>
        <CardImage src={card.image} alt={card.title} />
        {/* Top fade */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 20, background: `linear-gradient(to bottom, ${f1}dd, transparent)`, display: 'flex', alignItems: 'center', paddingLeft: 6, zIndex: 2 }}>
          <span style={{ fontSize: sz.badge, color: rs.color, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.08em', textShadow: `0 0 6px ${rs.glow}` }}>
            {rs.name.toUpperCase()}
          </span>
        </div>
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: `linear-gradient(transparent, ${f2})`, zIndex: 2 }} />
        {count > 1 && (
          <div style={{ position: 'absolute', top: 4, left: 4, zIndex: 3, background: 'rgba(0,0,0,0.82)', border: `1px solid ${rs.border}`, borderRadius: 4, padding: '1px 5px', fontSize: sz.badge, color: rs.color, fontFamily: 'monospace' }}>
            ×{count}
          </div>
        )}
        {card.character && !dimmed && <CharacterBadge character={card.character} size={size} />}
      </div>

      {/* Info */}
      <div style={{ height: infoH, padding: sz.bp, display: 'flex', flexDirection: 'column', gap: 3, background: `linear-gradient(to bottom, ${f2}, #06101c)`, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 8, right: 8, height: 1, background: `linear-gradient(to right, transparent, ${rs.border}, transparent)` }} />
        <div style={{ fontSize: sz.name, fontWeight: 700, color: '#f0e8d8', lineHeight: 1.22, fontFamily: 'Georgia, serif' }}>
          {card.title}
        </div>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {Array.from({ length: star }).map((_, i) => (
            <span key={i} style={{ fontSize: sz.stars, color: rs.color, lineHeight: 1, filter: `drop-shadow(0 0 3px ${rs.glow})` }}>★</span>
          ))}
          {Array.from({ length: 4 - star }).map((_, i) => (
            <span key={i} style={{ fontSize: sz.stars, color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>★</span>
          ))}
          {card.views > 0 && size !== 'sm' && (
            <span style={{ fontSize: sz.badge - 0.5, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginLeft: 4 }}>
              {(card.views / 1000).toFixed(0)}k/mo
            </span>
          )}
        </div>
        {card.extract && size !== 'sm' && (
          <div style={{ fontSize: sz.meta - 0.5, color: 'rgba(200,215,230,0.45)', lineHeight: 1.55, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: sz.lines, WebkitBoxOrient: 'vertical', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            {card.extract}
          </div>
        )}
        {card.character && size === 'sm' && (
          <div style={{ fontSize: 6.5, color: 'rgba(220,180,255,0.55)', fontFamily: 'monospace', lineHeight: 1.3 }}>
            {card.character.character} · {card.character.show}
          </div>
        )}
      </div>
    </div>
  );
}
