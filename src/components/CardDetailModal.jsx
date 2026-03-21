import RailCard from './RailCard.jsx';
import { RARITY } from '../constants.js';

export default function CardDetailModal({ card, count, onClose, isFav = false, onFav = null }) {
  const rs  = RARITY[card.rarity] ?? RARITY.C;
  const isTF = !!(card.character?.show === 'Thomas & Friends');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 500,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '16px 16px 24px',
        overflowY: 'auto',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: 16, right: 16,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '50%', width: 34, height: 34,
          color: '#aaa', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10,
        }}
      >×</button>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 14,
          animation: 'fadeUp 0.3s ease-out',
        }}
      >
        {/* ── The exact same card at lg size ── */}
        <RailCard
          card={card}
          size="lg"
          count={count}
          isFav={isFav}
          onFav={onFav}
        />

        {/* ── Extra info panel below the card ── */}
        <div style={{
          width: 192,  // same as lg card width
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${rs.border}`,
          borderRadius: 10,
          padding: '11px 13px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Wikipedia views */}
          {card.views > 0 && (
            <div style={{
              fontSize: 9, color: 'rgba(255,255,255,0.25)',
              fontFamily: 'monospace',
            }}>
              📊 ~{card.views.toLocaleString()} Wikipedia views/month
            </div>
          )}

          {/* Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 9.5, color: '#4fa8e8',
                fontFamily: 'monospace', letterSpacing: '.06em',
                textDecoration: 'none', padding: '6px 10px',
                border: '1px solid rgba(79,168,232,0.35)', borderRadius: 6,
                textAlign: 'center', display: 'block',
              }}
            >
              READ ON WIKIPEDIA →
            </a>

            {isTF && card.character && (
              <a
                href={`https://ttte.fandom.com/wiki/${encodeURIComponent(card.character.character)}_(T%26F)`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 9.5,
                  color: card.character.color ?? '#b57bee',
                  fontFamily: 'monospace', letterSpacing: '.06em',
                  textDecoration: 'none', padding: '6px 10px',
                  border: `1px solid ${(card.character.color ?? '#b57bee') + '55'}`,
                  borderRadius: 6, textAlign: 'center', display: 'block',
                }}
              >
                {card.character.character.toUpperCase()} ON FANDOM →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
