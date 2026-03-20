import { useState } from 'react';
import RailCard from './RailCard.jsx';
import CardBack from './CardBack.jsx';
import { RARITY } from '../constants.js';

export default function OpeningScreen({ cards, onDone }) {
  const [revealed, setRevealed] = useState(new Set());
  const done = revealed.size === cards.length;

  const reveal = (i) => setRevealed((prev) => new Set([...prev, i]));
  const revealAll = () => setRevealed(new Set(cards.map((_, i) => i)));

  const best = cards.reduce(
    (b, c) => (RARITY[c.rarity]?.rank ?? 0) > (RARITY[b.rarity]?.rank ?? 0) ? c : b,
    cards[0]
  );
  const bestRank = RARITY[best?.rarity]?.rank ?? 0;

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      padding: '18px 10px 28px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      maxWidth: 560, margin: '0 auto',
    }}>
      <h2 style={{
        color: '#c9a833', margin: '0 0 4px', fontSize: 13,
        fontFamily: 'monospace', letterSpacing: '.2em',
      }}>
        PACK OPENING
      </h2>
      <p style={{ fontSize: 8.5, color: '#1e3a5a', margin: '0 0 20px', fontFamily: 'monospace' }}>
        {done ? 'ALL CARDS REVEALED' : `TAP TO REVEAL · ${revealed.size}/${cards.length}`}
      </p>

      {/* Cards row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
        {cards.map((card, i) =>
          revealed.has(i)
            ? <RailCard key={i} card={card} size="md" revealed />
            : <CardBack key={i} size="md" onClick={() => reveal(i)} delay={i * 0.07} />
        )}
      </div>

      {/* Best pull banner */}
      {revealed.size > 0 && bestRank >= 2 && (
        <div style={{
          background: `linear-gradient(135deg, ${RARITY[best.rarity].bg}, #06101c)`,
          border: `1.5px solid ${RARITY[best.rarity].border}`,
          borderRadius: 10,
          padding: '10px 18px',
          marginBottom: 14,
          maxWidth: 320,
          boxShadow: `0 0 22px ${RARITY[best.rarity].glow}`,
          animation: 'fadeUp 0.4s ease-out',
          display: 'flex', gap: 11, alignItems: 'center',
        }}>
          <div style={{ width: 46, height: 46, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <img
              src={best.image}
              alt={best.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{
              fontSize: 8, color: RARITY[best.rarity].color,
              fontFamily: 'monospace', letterSpacing: '.1em', marginBottom: 2,
            }}>
              {bestRank === 3 ? '⭐ LEGENDARY PULL!' : '✨ EPIC PULL!'}
            </div>
            <div style={{
              fontSize: 11.5, color: '#e8e0d0',
              fontFamily: 'Georgia, serif', fontWeight: 700,
            }}>
              {best.title}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 9 }}>
        {!done && (
          <button
            onClick={revealAll}
            style={{
              padding: '9px 22px',
              background: '#0c1825',
              border: '1px solid rgba(201,168,51,0.28)',
              borderRadius: 8, color: '#c9a833',
              fontSize: 10.5, cursor: 'pointer', fontFamily: 'monospace',
            }}
          >
            REVEAL ALL
          </button>
        )}
        {done && (
          <button
            className="btn"
            onClick={onDone}
            style={{
              padding: '12px 38px',
              background: 'linear-gradient(135deg, #c9a833, #8a6e1a)',
              border: 'none', borderRadius: 8,
              color: '#06101c', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '.1em',
            }}
          >
            DONE →
          </button>
        )}
      </div>
    </div>
  );
}
