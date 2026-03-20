import { useState } from 'react';
import { RARITY } from '../constants.js';

function CardImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="spinner" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.35s',
        }}
      />
    </div>
  );
}

const SIZES = {
  sm: { w: 130, imgH: 82,  infoH: 76,  nameSz: 9.5,  metaSz: 7.5, badgeSz: 6.5, lines: 2 },
  md: { w: 168, imgH: 108, infoH: 100, nameSz: 11.5, metaSz: 8.5, badgeSz: 7.5, lines: 3 },
  lg: { w: 200, imgH: 130, infoH: 118, nameSz: 13,   metaSz: 9,   badgeSz: 8,   lines: 4 },
};

export default function RailCard({
  card,
  size = 'md',
  count = 0,
  dimmed = false,
  revealed = false,
  onClick = null,
}) {
  const rs = RARITY[card.rarity] ?? RARITY.C;
  const isL = card.rarity === 'L';
  const isE = card.rarity === 'E';
  const s = SIZES[size];

  const rarityClass = isL ? 'legendary' : isE ? 'epic' : '';
  const classes = [
    'rail-card',
    rarityClass,
    revealed ? 'revealed' : '',
    onClick ? 'clickable' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      style={{
        width: s.w,
        height: s.imgH + s.infoH,
        background: rs.bg,
        border: `1.5px solid ${dimmed ? 'rgba(255,255,255,0.05)' : rs.border}`,
        borderRadius: 10,
        boxShadow: dimmed ? 'none' : `0 0 18px ${rs.glow}`,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        opacity: dimmed ? 0.18 : 1,
      }}
    >
      {/* Shimmer overlay for epic / legendary */}
      {(isL || isE) && !dimmed && (
        <div
          className="shimmer-overlay"
          style={{
            background: `linear-gradient(115deg, transparent 32%, ${
              isL ? 'rgba(232,192,64,0.14)' : 'rgba(181,123,238,0.11)'
            } 50%, transparent 68%)`,
          }}
        />
      )}

      {/* Photo */}
      <div style={{ height: s.imgH, overflow: 'hidden', flexShrink: 0 }}>
        <CardImage src={card.image} alt={card.title} />
      </div>

      {/* Rarity badge */}
      <div style={{
        position: 'absolute', top: 5, left: 5, zIndex: 2,
        background: rs.bg + 'ee',
        border: `1px solid ${rs.border}`,
        borderRadius: 3,
        padding: `1px ${s.badgeSz - 1}px`,
        fontSize: s.badgeSz,
        color: rs.color,
        fontFamily: 'monospace',
        fontWeight: 700,
        letterSpacing: '.1em',
      }}>
        {rs.name.toUpperCase()}
      </div>

      {/* Duplicate count badge */}
      {count > 1 && (
        <div style={{
          position: 'absolute', top: 5, right: 5, zIndex: 2,
          background: 'rgba(0,0,0,0.85)',
          borderRadius: 4,
          fontSize: s.badgeSz,
          padding: '1px 5px',
          color: rs.color,
          fontFamily: 'monospace',
        }}>
          ×{count}
        </div>
      )}

      {/* Text info */}
      <div style={{
        padding: '6px 8px 5px',
        height: s.infoH - 11,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          fontSize: s.nameSz,
          fontWeight: 700,
          color: '#e8e0d0',
          lineHeight: 1.25,
          fontFamily: 'Georgia, serif',
        }}>
          {card.title}
        </div>
        {card.extract && size !== 'sm' && (
          <div style={{
            fontSize: s.metaSz - 0.5,
            color: '#4a6880',
            lineHeight: 1.5,
            flex: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: s.lines,
            WebkitBoxOrient: 'vertical',
            fontFamily: 'Georgia, serif',
          }}>
            {card.extract}
          </div>
        )}
      </div>
    </div>
  );
}
