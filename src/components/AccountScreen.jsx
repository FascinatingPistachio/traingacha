import { useState } from 'react';
import { exportCode } from '../utils/storage.js';
import { RARITY } from '../constants.js';

export default function AccountScreen({ save, onReset }) {
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const code = exportCode(save);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  };

  const entries = Object.values(save.collection ?? {});
  const byRarity = entries.reduce((acc, e) => {
    acc[e.rarity] = (acc[e.rarity] ?? 0) + 1;
    return acc;
  }, {});

  const totalCards = entries.reduce((s, e) => s + (e.count ?? 1), 0);

  const stats = [
    { label: 'UNIQUE',      value: entries.length },
    { label: 'TOTAL CARDS', value: totalCards },
    { label: 'PULLS',       value: save.totalPulls ?? 0 },
    { label: 'TICKETS',     value: save.tickets },
  ];

  return (
    <div style={{ padding: '18px 14px', maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{
        color: '#c9a833', margin: '0 0 16px', fontSize: 13,
        fontFamily: 'monospace', letterSpacing: '.2em', textAlign: 'center',
      }}>
        ACCOUNT
      </h2>

      {/* Profile */}
      <div style={{
        background: '#0c1825', border: '1px solid rgba(201,168,51,0.16)',
        borderRadius: 9, padding: '15px', marginBottom: 12, textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 5 }}>🎩</div>
        <div style={{ fontSize: 15, color: '#e8e0d0', fontFamily: 'Georgia, serif', marginBottom: 2 }}>
          {save.username}
        </div>
        <div style={{ fontSize: 8, color: '#1a3050', fontFamily: 'monospace' }}>
          CONDUCTOR SINCE {save.joinDate}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 12 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: '#0c1825', border: '1px solid rgba(201,168,51,0.08)',
            borderRadius: 7, padding: '10px 5px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, color: '#c9a833', fontFamily: 'monospace', fontWeight: 700 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 6.5, color: '#1a2e40', fontFamily: 'monospace', marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Rarity breakdown */}
      {entries.length > 0 && (
        <div style={{
          background: '#0c1825', border: '1px solid rgba(201,168,51,0.08)',
          borderRadius: 9, padding: '12px 14px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 8.5, color: '#1e3050', fontFamily: 'monospace', marginBottom: 8 }}>
            RARITY BREAKDOWN
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {['L', 'E', 'R', 'C'].map((r) => (
              <div key={r}>
                <div style={{ fontSize: 14, color: RARITY[r].color, fontFamily: 'monospace', fontWeight: 700 }}>
                  {byRarity[r] ?? 0}
                </div>
                <div style={{ fontSize: 7.5, color: '#1e3050', fontFamily: 'monospace' }}>
                  {RARITY[r].name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export save */}
      <div style={{
        background: '#0c1825', border: '1px solid rgba(201,168,51,0.11)',
        borderRadius: 9, padding: '14px', marginBottom: 12,
      }}>
        <div style={{ fontSize: 9, color: '#c9a833', fontFamily: 'monospace', letterSpacing: '.15em', marginBottom: 8 }}>
          EXPORT SAVE CODE
        </div>
        <p style={{ fontSize: 8.5, color: '#1e3a5a', fontFamily: 'monospace', margin: '0 0 9px', lineHeight: 1.75 }}>
          Copy this code and paste it into the login screen on any other device to restore your full collection.
        </p>
        <div style={{
          background: '#06101c', borderRadius: 5, padding: '7px 9px', marginBottom: 8,
          fontSize: 7.5, color: '#1a2e40', fontFamily: 'monospace',
          wordBreak: 'break-all', lineHeight: 1.5, maxHeight: 44, overflow: 'hidden',
        }}>
          {code.slice(0, 110)}…
        </div>
        <button
          onClick={copy}
          style={{
            padding: '7px 16px',
            background: copied ? 'rgba(74,175,74,0.11)' : 'rgba(201,168,51,0.07)',
            border: `1px solid ${copied ? 'rgba(74,175,74,0.38)' : 'rgba(201,168,51,0.22)'}`,
            borderRadius: 5,
            color: copied ? '#6fcf7f' : '#c9a833',
            fontSize: 9, cursor: 'pointer',
            fontFamily: 'monospace', letterSpacing: '.1em', transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ COPIED!' : 'COPY FULL CODE'}
        </button>
      </div>

      {/* Danger zone */}
      <div style={{
        background: '#150808', border: '1px solid rgba(239,83,80,0.15)',
        borderRadius: 9, padding: '13px',
      }}>
        <div style={{ fontSize: 9, color: '#ef5350', fontFamily: 'monospace', marginBottom: 7 }}>
          DANGER ZONE
        </div>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            style={{
              padding: '6px 12px', background: 'transparent',
              border: '1px solid rgba(239,83,80,0.28)',
              borderRadius: 5, color: '#ef5350',
              fontSize: 9, cursor: 'pointer', fontFamily: 'monospace',
            }}
          >
            RESET ALL DATA
          </button>
        ) : (
          <div>
            <p style={{ fontSize: 8.5, color: '#8a2828', fontFamily: 'monospace', margin: '0 0 9px', lineHeight: 1.6 }}>
              This permanently deletes all cards and progress. Are you sure?
            </p>
            <div style={{ display: 'flex', gap: 7 }}>
              <button
                onClick={onReset}
                style={{
                  padding: '6px 12px', background: '#420808',
                  border: '1px solid rgba(239,83,80,0.4)',
                  borderRadius: 5, color: '#ef5350',
                  fontSize: 9, cursor: 'pointer', fontFamily: 'monospace',
                }}
              >
                YES, RESET
              </button>
              <button
                onClick={() => setConfirm(false)}
                style={{
                  padding: '6px 12px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 5, color: '#1e3a5a',
                  fontSize: 9, cursor: 'pointer', fontFamily: 'monospace',
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
