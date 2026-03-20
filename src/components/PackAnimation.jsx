import { useState, useEffect, useRef } from 'react';
import { soundPackShake, soundTear, soundCardSlide } from '../utils/sounds.js';

const PW = 168; // pack width  — same as card md width
const PH = 260; // pack height — taller than a card
const TEAR_Y = 58; // y-position of the tear line (top ~22%)

// ── Pack visual ───────────────────────────────────────────────────────────────
// clipTop / clipBottom control which half is rendered.
// When neither is set, the full pack is shown.
function PackBody({ clipTop = false, clipBottom = false, style = {} }) {
  const clipPath = clipTop
    ? `polygon(0 0, 100% 0, 100% ${TEAR_Y}px, 0 ${TEAR_Y}px)`
    : clipBottom
    ? `polygon(0 ${TEAR_Y}px, 100% ${TEAR_Y}px, 100% ${PH}px, 0 ${PH}px)`
    : 'none';

  return (
    <div style={{
      width: PW, height: PH, position: 'absolute', top: 0, left: 0,
      clipPath, ...style,
    }}>
      {/* Main pack body */}
      <div style={{
        width: PW, height: PH, borderRadius: 10, overflow: 'hidden',
        background: 'linear-gradient(160deg, #0e1f38 0%, #060f1c 55%, #0a1828 100%)',
        border: '2px solid rgba(201,168,51,0.55)',
        boxShadow: '0 0 32px rgba(201,168,51,0.18), 0 8px 40px rgba(0,0,0,0.75)',
        position: 'relative',
      }}>
        {/* Foil shimmer stripes */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(110deg,transparent 0px,transparent 18px,rgba(201,168,51,0.04) 18px,rgba(201,168,51,0.04) 19px)',
        }} />

        {/* Gold foil band across middle */}
        <div style={{
          position: 'absolute', top: '42%', left: 0, right: 0, height: 2,
          background: 'linear-gradient(to right, transparent 5%, rgba(201,168,51,0.55) 30%, rgba(255,230,120,0.75) 50%, rgba(201,168,51,0.55) 70%, transparent 95%)',
        }} />
        <div style={{
          position: 'absolute', top: 'calc(42% + 4px)', left: 0, right: 0, height: 1,
          background: 'linear-gradient(to right, transparent 10%, rgba(201,168,51,0.2) 40%, rgba(201,168,51,0.2) 60%, transparent 90%)',
        }} />

        {/* Tear perforation line */}
        <div style={{
          position: 'absolute', top: TEAR_Y, left: 0, right: 0, height: 2,
          background: 'repeating-linear-gradient(to right, rgba(201,168,51,0.6) 0px, rgba(201,168,51,0.6) 6px, transparent 6px, transparent 10px)',
          zIndex: 3,
        }} />
        <div style={{
          position: 'absolute', top: TEAR_Y - 8, right: 10,
          fontSize: 6.5, color: 'rgba(201,168,51,0.5)',
          fontFamily: 'monospace', letterSpacing: '.12em', zIndex: 3,
        }}>
          TEAR HERE
        </div>
        {/* Tiny notch at tear edge */}
        <div style={{
          position: 'absolute', top: TEAR_Y - 5, right: -1,
          width: 0, height: 0,
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderRight: '7px solid rgba(6,16,28,0.9)',
          zIndex: 4,
        }} />

        {/* Top section — lighter background */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: TEAR_Y,
          background: 'linear-gradient(135deg, rgba(20,35,55,0.9), rgba(10,20,35,0.9))',
          borderBottom: '1px solid rgba(201,168,51,0.15)',
        }} />

        {/* Top brand */}
        <div style={{
          position: 'absolute', top: 10, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          zIndex: 2,
        }}>
          <div style={{ fontSize: 8, color: 'rgba(201,168,51,0.85)', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.22em' }}>
            RAIL GACHA
          </div>
          <div style={{ fontSize: 6.5, color: 'rgba(201,168,51,0.4)', fontFamily: 'monospace', letterSpacing: '.15em' }}>
            BOOSTER PACK
          </div>
        </div>

        {/* Main artwork area */}
        <div style={{
          position: 'absolute', top: TEAR_Y + 14, left: 12, right: 12, bottom: 44,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <div style={{ fontSize: 56, lineHeight: 1, filter: 'drop-shadow(0 0 16px rgba(201,168,51,0.7))' }}>
            🚂
          </div>
          <div style={{ fontSize: 9, color: 'rgba(201,168,51,0.7)', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.1em', textAlign: 'center' }}>
            TRAINS OF THE WORLD
          </div>
        </div>

        {/* Bottom info */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
          background: 'rgba(0,0,0,0.3)',
          borderTop: '1px solid rgba(201,168,51,0.18)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <div style={{ fontSize: 7.5, color: 'rgba(201,168,51,0.65)', fontFamily: 'monospace', fontWeight: 700 }}>
            5 CARDS INSIDE
          </div>
          <div style={{ fontSize: 6.5, color: 'rgba(201,168,51,0.3)', fontFamily: 'monospace' }}>
            INFO FROM WIKIPEDIA
          </div>
        </div>

        {/* Specular shine streak */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.04) 48%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 52%, transparent 70%)',
        }} />
      </div>
    </div>
  );
}

// ── Card stack peeking out of pack ────────────────────────────────────────────
function CardStack({ progress }) {
  // progress: 0 = hidden, 1 = fully out
  const slideUp = Math.min(progress, 1) * 180;
  return (
    <div style={{
      position: 'absolute',
      left: '50%', transform: `translateX(-50%) translateY(${PH - TEAR_Y - slideUp + 10}px)`,
      bottom: 0,
      width: PW - 24,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      zIndex: 1,
      transition: 'none',
    }}>
      {/* Stack of card backs — slightly fanned */}
      {[4, 3, 2, 1, 0].map((i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: i * 3,
          left: i % 2 === 0 ? -i * 1.5 : i * 1.5,
          width: PW - 24,
          height: 10,
          background: i === 0 ? '#0d1f35' : `rgba(13,31,53,${0.7 - i * 0.1})`,
          border: `1px solid rgba(201,168,51,${0.4 - i * 0.06})`,
          borderRadius: 4,
          transform: `rotate(${(i - 2) * 0.8}deg)`,
        }} />
      ))}
      {/* Top card of stack — full back */}
      <div style={{
        width: PW - 24, height: 44,
        background: 'linear-gradient(165deg, #0d1f35, #060f1c)',
        border: '1.5px solid rgba(201,168,51,0.4)',
        borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
        filter: 'drop-shadow(0 -2px 8px rgba(201,168,51,0.3))',
        position: 'relative', zIndex: 5,
      }}>
        🚂
      </div>
    </div>
  );
}

export default function PackAnimation({ onComplete }) {
  // phases: idle → shaking → prompt → tearing → sliding → done
  const [phase, setPhase]       = useState('idle');
  const [topY,  setTopY]        = useState(0);      // torn top flies upward
  const [topRot, setTopRot]     = useState(0);
  const [topOp,  setTopOp]      = useState(1);
  const [slideProgress, setSlideProgress] = useState(0);
  const [glowOp, setGlowOp]     = useState(0);
  const rafRef = useRef(null);

  // Start shake soon after mount
  useEffect(() => {
    const t = setTimeout(() => setPhase('shaking'), 200);
    return () => clearTimeout(t);
  }, []);

  // Shake sound every cycle
  useEffect(() => {
    if (phase !== 'shaking') return;
    soundPackShake();
    const t = setInterval(() => soundPackShake(), 550);
    return () => clearInterval(t);
  }, [phase]);

  const handleTap = () => {
    if (phase !== 'shaking' && phase !== 'idle' && phase !== 'prompt') return;
    setPhase('tearing');
    soundTear();

    const start = performance.now();
    const TEAR_DUR = 380; // ms for top to fly off

    const animTear = (now) => {
      const t    = Math.min((now - start) / TEAR_DUR, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setTopY(-180 * ease);
      setTopRot(-14 * ease);
      setTopOp(1 - ease);
      setGlowOp(t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animTear);
      } else {
        setPhase('sliding');
        animSlide(performance.now());
      }
    };
    rafRef.current = requestAnimationFrame(animTear);
  };

  const animSlide = (start) => {
    const SLIDE_DUR = 700;
    let lastSound = -1;
    const tick = (now) => {
      const t    = Math.min((now - start) / SLIDE_DUR, 1);
      const ease = 1 - Math.pow(1 - t, 2.5);
      setSlideProgress(ease);

      // Play card slide sounds at intervals
      const soundStep = Math.floor(t * 5);
      if (soundStep !== lastSound && soundStep <= 4) {
        lastSound = soundStep;
        setTimeout(() => soundCardSlide(), soundStep * 30);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('done');
        setTimeout(() => onComplete?.(), 300);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => rafRef.current && cancelAnimationFrame(rafRef.current), []);

  return (
    <div
      onClick={handleTap}
      style={{
        minHeight: 'calc(100vh - 100px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 22, padding: '20px 16px',
        cursor: phase === 'tearing' || phase === 'sliding' || phase === 'done' ? 'default' : 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Instruction */}
      <p style={{
        fontSize: 10, color: 'rgba(201,168,51,0.55)', fontFamily: 'monospace',
        letterSpacing: '.18em', margin: 0,
        animation: phase === 'shaking' ? 'pulse 1.5s ease-in-out infinite' : 'none',
        opacity: phase === 'tearing' || phase === 'sliding' || phase === 'done' ? 0 : 1,
        transition: 'opacity 0.3s',
      }}>
        {phase === 'idle' ? 'LOADING…' : 'TAP TO OPEN'}
      </p>

      {/* Pack wrapper — clips the sliding cards */}
      <div style={{
        position: 'relative',
        width: PW, height: PH + 60,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}>
        {/* Glow halo behind pack */}
        <div style={{
          position: 'absolute', inset: -40, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,51,0.28) 0%, transparent 68%)',
          opacity: glowOp, pointerEvents: 'none',
          transition: 'opacity 0.1s',
        }} />

        {/* Card stack emerging from the opening */}
        {(phase === 'sliding' || phase === 'done') && (
          <CardStack progress={slideProgress} />
        )}

        {/* Pack bottom half (stays put) */}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: PW, height: PH }}>
          {phase !== 'tearing' && phase !== 'sliding' && phase !== 'done' ? (
            // Full pack (pre-tear)
            <div className={phase === 'shaking' ? 'pack-shake' : ''} style={{ position: 'relative', width: PW, height: PH }}>
              <PackBody />
            </div>
          ) : (
            <>
              {/* Torn top piece flying up */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: PW, height: PH,
                transform: `translateY(${topY}px) rotate(${topRot}deg)`,
                opacity: topOp,
                transformOrigin: 'center top',
              }}>
                <PackBody clipTop />
              </div>
              {/* Bottom portion (stays) */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: PW, height: PH }}>
                <PackBody clipBottom />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fetching indicator */}
      {(phase === 'idle' || phase === 'shaking') && (
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {[0,1,2].map((i) => (
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
