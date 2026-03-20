import { useState } from 'react';
import { RARITY } from '../constants.js';

export default function CardDetailModal({ card, count, onClose }) {
  const rs = RARITY[card.rarity] ?? RARITY.C;
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.88)',
        zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 18, right: 18,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%', width: 32, height: 32,
          color: '#888', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ×
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0c1825',
          border: `1.5px solid ${rs.border}`,
          borderRadius: 14,
          maxWidth: 340, width: '100%',
          overflow: 'hidden',
          boxShadow: `0 0 45px ${rs.glow}`,
          animation: 'fadeUp 0.3s ease-out',
        }}
      >
        {/* Full-width image */}
        <div style={{ height: 200, background: 'rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
          {!imgLoaded && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div className="spinner" />
            </div>
          )}
          <img
            src={card.imageHD ?? card.image}
            alt={card.title}
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.35s',
            }}
          />
          {/* Rarity strip at bottom of photo */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: `linear-gradient(transparent, ${rs.bg}ee)`,
            padding: '14px 12px 8px',
          }}>
            <span style={{
              fontSize: 7.5, color: rs.color, fontFamily: 'monospace',
              fontWeight: 700, letterSpacing: '.14em',
              background: rs.bg + 'cc', padding: '2px 8px', borderRadius: 3,
              border: `1px solid ${rs.border}`,
            }}>
              {rs.name.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 18px' }}>
          <h2 style={{
            fontSize: 17, color: '#e8e0d0',
            fontFamily: 'Georgia, serif', fontWeight: 700,
            margin: '0 0 10px', lineHeight: 1.3,
          }}>
            {card.title}
          </h2>

          {card.extract && (
            <p style={{
              fontSize: 11.5, color: '#5a7a9a',
              lineHeight: 1.75, margin: '0 0 14px',
              fontFamily: 'Georgia, serif',
            }}>
              {card.extract}
            </p>
          )}

          {card.views > 0 && (
            <p style={{
              fontSize: 8.5, color: '#1e3a50',
              fontFamily: 'monospace', margin: '0 0 14px',
            }}>
              📊 ~{card.views.toLocaleString()} Wikipedia views/month
            </p>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 9.5, color: '#4fa8e8',
                fontFamily: 'monospace', letterSpacing: '.06em',
                textDecoration: 'none',
                padding: '6px 11px',
                border: '1px solid rgba(79,168,232,0.35)',
                borderRadius: 5,
              }}
            >
              READ ON WIKIPEDIA →
            </a>
            {count > 1 && (
              <span style={{ fontSize: 9, color: rs.color, fontFamily: 'monospace' }}>
                ×{count} copies
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
