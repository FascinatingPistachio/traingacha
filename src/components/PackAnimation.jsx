import { useState, useEffect } from 'react';

// ── Phases ──────────────────────────────────────────────────────────────────
// idle → shaking → tearing → burst → done
// The parent starts a fetch immediately on click; the animation covers load time.

const PACK_W = 200;
const PACK_H = 310;

function PackGraphic({ style, half = null }) {
  // half = null (full), 'top', 'bottom'
  const clipTop    = 'polygon(0 0, 100% 0, 105% 52%, -5% 48%)';
  const clipBottom = 'polygon(-5% 52%, 105% 48%, 100% 100%, 0 100%)';
  const clip = half === 'top' ? clipTop : half === 'bottom' ? clipBottom : 'none';

  return (
    <div style={{
      width: PACK_W, height: PACK_H, borderRadius: 14,
      background: 'linear-gradient(160deg, #0d1f35 0%, #06101c 100%)',
      border: '2.5px solid rgba(201,168,51,0.45)',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 0 40px rgba(201,168,51,0.15), 0 8px 32px rgba(0,0,0,0.7)',
      clipPath: clip,
      ...style,
    }}>
      {/* Diagonal stripe texture */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(45deg,transparent,transparent 14px,rgba(201,168,51,0.04) 14px,rgba(201,168,51,0.04) 15px)',
      }} />
      {/* Gold horizontal band in middle */}
      <div style={{
        position: 'absolute', top: '38%', left: 0, right: 0, height: 2,
        background: 'linear-gradient(to right,transparent,rgba(201,168,51,0.5),transparent)',
      }} />
      {/* Logo */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <div style={{ fontSize: 52, lineHeight: 1, filter: 'drop-shadow(0 0 14px rgba(201,168,51,0.6))' }}>🚂</div>
        <div style={{ fontSize: 11, color: '#c9a833', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.28em' }}>
          RAIL GACHA
        </div>
        <div style={{ fontSize: 8, color: 'rgba(201,168,51,0.4)', fontFamily: 'monospace', letterSpacing: '.18em' }}>
          5 CARDS INSIDE
        </div>
      </div>
      {/* Shine streak */}
      <div style={{
        position: 'absolute', top: '-20%', left: '30%', width: 30, height: '140%',
        background: 'linear-gradient(to right,transparent,rgba(255,255,255,0.07),transparent)',
        transform: 'rotate(15deg)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

export default function PackAnimation({ onComplete }) {
  const [phase, setPhase] = useState('idle');   // idle | shaking | tearing | burst | done
  const [topY,   setTopY]   = useState(0);
  const [botY,   setBotY]   = useState(0);
  const [glowOp, setGlowOp] = useState(0);

  // Auto-start shake on mount
  useEffect(() => {
    const t = setTimeout(() => setPhase('shaking'), 120);
    return () => clearTimeout(t);
  }, []);

  // Shaking → prompt user to tap
  const handleTap = () => {
    if (phase === 'idle' || phase === 'shaking') {
      setPhase('tearing');
      // Animate halves apart
      let frame = 0;
      const tick = () => {
        frame++;
        const pct = Math.min(frame / 28, 1);
        const ease = 1 - Math.pow(1 - pct, 3); // ease-out cubic
        setTopY(-140 * ease);
        setBotY( 140 * ease);
        setGlowOp(pct);
        if (pct < 1) requestAnimationFrame(tick);
        else {
          setPhase('burst');
          setTimeout(() => {
            setPhase('done');
            onComplete?.();
          }, 420);
        }
      };
      requestAnimationFrame(tick);
    }
  };

  return (
    <div
      onClick={handleTap}
      style={{
        minHeight: 'calc(100vh - 56px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 24, padding: '20px 16px',
        cursor: phase === 'tearing' || phase === 'burst' ? 'default' : 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Hint text */}
      {(phase === 'idle' || phase === 'shaking') && (
        <p style={{ fontSize: 10, color: 'rgba(201,168,51,0.55)', fontFamily: 'monospace', letterSpacing: '.18em', animation: 'pulse 1.6s ease-in-out infinite' }}>
          TAP TO OPEN
        </p>
      )}

      {/* Pack container */}
      <div style={{ position: 'relative', width: PACK_W, height: PACK_H }}>
        {/* Glow burst on tear */}
        {(phase === 'tearing' || phase === 'burst') && (
          <div style={{
            position: 'absolute', inset: -60, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,51,0.35) 0%, transparent 70%)',
            opacity: glowOp,
            animation: phase === 'burst' ? 'glowBurst 0.42s ease-out forwards' : 'none',
            pointerEvents: 'none', zIndex: 0,
          }} />
        )}

        {phase === 'idle' && (
          <PackGraphic />
        )}

        {phase === 'shaking' && (
          <div className="pack-shake">
            <PackGraphic />
          </div>
        )}

        {(phase === 'tearing' || phase === 'burst') && (
          <>
            {/* Top half flies up */}
            <div style={{ position: 'absolute', inset: 0, transform: `translateY(${topY}px) rotate(${-topY * 0.04}deg)`, opacity: 1 - Math.abs(topY) / 160, zIndex: 2 }}>
              <PackGraphic half="top" />
            </div>
            {/* Bottom half flies down */}
            <div style={{ position: 'absolute', inset: 0, transform: `translateY(${botY}px) rotate(${botY * 0.04}deg)`, opacity: 1 - Math.abs(botY) / 160, zIndex: 2 }}>
              <PackGraphic half="bottom" />
            </div>
          </>
        )}
      </div>

      {/* Loading dots while fetching */}
      {(phase === 'idle' || phase === 'shaking') && (
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'rgba(201,168,51,0.4)',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
          <span style={{ fontSize: 8.5, color: 'rgba(201,168,51,0.4)', fontFamily: 'monospace', marginLeft: 4 }}>
            fetching from wikipedia…
          </span>
        </div>
      )}
    </div>
  );
}
