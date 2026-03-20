import { RARITY, PACK_COST, VIEW_THRESHOLDS } from '../constants.js';

const ODDS = [
  { r: 'C', rate: '–',    note: 'below 6k monthly views', threshold: null },
  { r: 'R', rate: '–',    note: `6k–30k monthly views`,   threshold: null },
  { r: 'E', rate: '–',    note: `30k–120k monthly views`, threshold: null },
  { r: 'L', rate: '–',    note: `120k+ monthly views`,    threshold: null },
];

export default function ShopScreen({ save, onPack }) {
  const can = save.tickets >= PACK_COST;

  return (
    <div style={{ padding: '18px 14px', maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{
        color: '#c9a833', margin: '0 0 16px', fontSize: 13,
        fontFamily: 'monospace', letterSpacing: '.2em', textAlign: 'center',
      }}>
        TICKET WINDOW
      </h2>

      {/* Ticket count */}
      <div style={{
        background: '#0c1825', border: '1px solid rgba(201,168,51,0.16)',
        borderRadius: 9, padding: '13px', marginBottom: 13, textAlign: 'center',
      }}>
        <div style={{ fontSize: 22, color: '#c9a833', fontFamily: 'monospace', fontWeight: 700 }}>
          🎫 {save.tickets} tickets
        </div>
      </div>

      {/* Rarity explanation */}
      <div style={{
        background: '#0c1825', border: '1px solid rgba(201,168,51,0.11)',
        borderRadius: 9, padding: '14px', marginBottom: 13,
      }}>
        <div style={{ fontSize: 9, color: '#c9a833', fontFamily: 'monospace', letterSpacing: '.18em', marginBottom: 10 }}>
          HOW RARITY WORKS
        </div>
        <p style={{ fontSize: 8.5, color: '#2a4060', fontFamily: 'monospace', margin: '0 0 12px', lineHeight: 1.75 }}>
          Every card is a real Wikipedia article about a train, locomotive, or railway.
          Rarity is determined by how many people read that article each month — the
          more famous the train, the rarer the card.
        </p>

        {['L', 'E', 'R', 'C'].map((r) => {
          const rs = RARITY[r];
          const labels = {
            L: `≥ ${(VIEW_THRESHOLDS.L / 1000).toFixed(0)}k views/month`,
            E: `${(VIEW_THRESHOLDS.E / 1000).toFixed(0)}k – ${(VIEW_THRESHOLDS.L / 1000).toFixed(0)}k views/month`,
            R: `${(VIEW_THRESHOLDS.R / 1000).toFixed(0)}k – ${(VIEW_THRESHOLDS.E / 1000).toFixed(0)}k views/month`,
            C: `< ${(VIEW_THRESHOLDS.R / 1000).toFixed(0)}k views/month`,
          };
          return (
            <div key={r} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
            }}>
              <span style={{ fontSize: 9, color: rs.color, fontFamily: 'monospace', fontWeight: 700, minWidth: 62 }}>
                {rs.name}
              </span>
              <span style={{ fontSize: 8.5, color: '#2a4060', fontFamily: 'monospace' }}>
                {labels[r]}
              </span>
            </div>
          );
        })}

        <p style={{ fontSize: 8, color: '#0e2030', fontFamily: 'monospace', margin: '10px 0 0', lineHeight: 1.7 }}>
          Pity counter: the longer you go without a high-rarity pull, the more pulls
          come from categories likely to contain famous trains. Resets on Legendary.
        </p>
      </div>

      {/* Pack purchase */}
      <div style={{
        background: 'linear-gradient(160deg, #0d1f35, #060f1c)',
        border: '1px solid rgba(201,168,51,0.28)',
        borderRadius: 12, padding: '24px 20px', textAlign: 'center',
        boxShadow: '0 0 28px rgba(201,168,51,0.06)',
      }}>
        <div style={{ fontSize: 44, marginBottom: 7 }}>📦</div>
        <div style={{ fontSize: 14, color: '#e8e0d0', fontFamily: 'Georgia, serif', fontWeight: 700, marginBottom: 3 }}>
          Standard Pack
        </div>
        <div style={{ fontSize: 9, color: '#1e3a5a', fontFamily: 'monospace', marginBottom: 18 }}>
          5 CARDS · REAL WIKIPEDIA PHOTOS &amp; INFO
        </div>
        <button
          className="btn"
          onClick={can ? onPack : undefined}
          style={{
            padding: '12px 42px',
            background: can ? 'linear-gradient(135deg, #c9a833, #8a6e1a)' : '#111e30',
            border: 'none', borderRadius: 8,
            color: can ? '#06101c' : '#2a3a4a',
            fontSize: 13.5, fontWeight: 700,
            cursor: can ? 'pointer' : 'not-allowed',
            fontFamily: 'monospace', letterSpacing: '.1em', transition: 'all 0.2s',
          }}
        >
          {can ? `🎫 OPEN — ${PACK_COST} TICKETS` : 'NOT ENOUGH TICKETS'}
        </button>
        {!can && (
          <p style={{ fontSize: 8.5, color: '#1e3050', marginTop: 9, fontFamily: 'monospace' }}>
            Claim your daily bonus to earn more!
          </p>
        )}
      </div>
    </div>
  );
}
