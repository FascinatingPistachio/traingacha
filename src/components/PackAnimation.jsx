import { useState, useEffect, useRef, useCallback } from 'react';
import { soundPackShake, soundTear, soundCardSlide } from '../utils/sounds.js';

const PW = 168;
const PH = 268;
const TEAR_Y = 52;   // where the top is ripped off (in px from top)

// ── Particle system ──────────────────────────────────────────────────────────
function useParticles() {
  const [particles, setParticles] = useState([]);
  const idRef = useRef(0);

  const burst = useCallback((x, y, count = 28) => {
    const colors = ['#c9a833','#e8c040','#fff7c0','#4fa8e8','#b57bee','#ff9d6e','#6fcf7f'];
    const newP = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      return {
        id:    ++idRef.current,
        x, y,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed - 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size:  2 + Math.random() * 4,
        life:  1,
        rot:   Math.random() * 360,
        rotV:  (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      };
    });
    setParticles(p => [...p, ...newP]);
  }, []);

  // Physics tick
  useEffect(() => {
    if (!particles.length) return;
    const id = requestAnimationFrame(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x:    p.x + p.vx,
            y:    p.y + p.vy,
            vy:   p.vy + 0.18,
            vx:   p.vx * 0.97,
            life: p.life - 0.022,
            rot:  p.rot + p.rotV,
          }))
          .filter(p => p.life > 0)
      );
    });
    return () => cancelAnimationFrame(id);
  }, [particles]);

  return { particles, burst };
}

// ── Pack graphic ─────────────────────────────────────────────────────────────
function PackGraphic({ clipTop = false, clipBottom = false, style = {} }) {
  const clipPath = clipTop
    ? `polygon(0 0, 100% 0, 100% ${TEAR_Y}px, 0 ${TEAR_Y}px)`
    : clipBottom
    ? `polygon(0 ${TEAR_Y}px, 100% ${TEAR_Y}px, 100% 100%, 0 100%)`
    : 'none';

  return (
    <div style={{ width: PW, height: PH, position: 'absolute', inset: 0, clipPath, ...style }}>
      <div style={{
        width: PW, height: PH, borderRadius: 10, overflow: 'hidden',
        background: 'linear-gradient(165deg, #101f38 0%, #06101c 50%, #0b1a2c 100%)',
        border: '2px solid rgba(201,168,51,0.6)',
        boxShadow: '0 0 40px rgba(201,168,51,0.2), 0 8px 48px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)',
        position: 'relative',
      }}>
        {/* Diagonal foil texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(110deg, transparent, transparent 18px, rgba(201,168,51,0.035) 18px, rgba(201,168,51,0.035) 19px)',
        }} />
        {/* Vertical light streak (foil effect) */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 55%, transparent 75%)',
        }} />

        {/* ── TOP FLAP ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: TEAR_Y,
          background: 'linear-gradient(135deg, #182a45 0%, #0d1e34 100%)',
          borderBottom: '1px solid rgba(201,168,51,0.2)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <div style={{ fontSize: 8.5, color: 'rgba(201,168,51,0.9)', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.28em' }}>
            RAIL GACHA
          </div>
          <div style={{ fontSize: 6.5, color: 'rgba(201,168,51,0.4)', fontFamily: 'monospace', letterSpacing: '.18em' }}>
            BOOSTER PACK
          </div>
        </div>

        {/* Tear perforations */}
        <div style={{
          position: 'absolute', top: TEAR_Y - 1, left: 0, right: 0, height: 3,
          background: 'repeating-linear-gradient(to right, transparent, transparent 5px, rgba(201,168,51,0.7) 5px, rgba(201,168,51,0.7) 9px)',
          zIndex: 3,
        }} />
        {/* Right-side notch */}
        <div style={{
          position: 'absolute', top: TEAR_Y - 6, right: -1, zIndex: 4,
          width: 0, height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '8px solid rgba(6,16,28,0.95)',
        }} />
        <div style={{
          position: 'absolute', top: TEAR_Y - 10, right: 10, zIndex: 3,
          fontSize: 6, color: 'rgba(201,168,51,0.5)', fontFamily: 'monospace', letterSpacing: '.1em',
        }}>
          TEAR HERE ✂
        </div>

        {/* ── MAIN ART AREA ── */}
        <div style={{
          position: 'absolute', top: TEAR_Y + 16, left: 14, right: 14, bottom: 46,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {/* Glow ring behind icon */}
          <div style={{
            position: 'absolute',
            width: 90, height: 90, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,51,0.15) 0%, transparent 70%)',
          }} />
          <div style={{
            fontSize: 60, lineHeight: 1,
            filter: 'drop-shadow(0 0 18px rgba(201,168,51,0.8))',
            position: 'relative', zIndex: 1,
          }}>
            🚂
          </div>
          <div style={{
            fontSize: 9.5, color: 'rgba(201,168,51,0.75)', fontFamily: 'monospace',
            fontWeight: 700, letterSpacing: '.1em', textAlign: 'center',
            position: 'relative', zIndex: 1,
          }}>
            TRAINS OF THE WORLD
          </div>
          {/* Edition line */}
          <div style={{
            fontSize: 7, color: 'rgba(201,168,51,0.3)', fontFamily: 'monospace',
            letterSpacing: '.14em',
          }}>
            WIKIPEDIA EDITION
          </div>
        </div>

        {/* ── BOTTOM STRIP ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 44,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
          borderTop: '1px solid rgba(201,168,51,0.15)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <div style={{ fontSize: 8.5, color: 'rgba(201,168,51,0.7)', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.12em' }}>
            5 CARDS INSIDE
          </div>
          <div style={{ fontSize: 6.5, color: 'rgba(201,168,51,0.28)', fontFamily: 'monospace' }}>
            INFO FROM WIKIPEDIA
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Particle renderer ─────────────────────────────────────────────────────────
function Particles({ particles }) {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.x, top: p.y,
          width:  p.shape === 'circle' ? p.size : p.size * 1.4,
          height: p.shape === 'circle' ? p.size : p.size * 0.7,
          background: p.color,
          borderRadius: p.shape === 'circle' ? '50%' : '1px',
          transform: `rotate(${p.rot}deg)`,
          opacity: Math.min(p.life * 2, 1),
          willChange: 'transform',
        }} />
      ))}
    </div>
  );
}

// ── Card stack emerging from pack ─────────────────────────────────────────────
function CardStack({ progress }) {
  const maxRise = 200;
  const rise = Math.min(progress, 1) * maxRise;
  // Cards fan slightly then straighten as they come out
  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: '50%',
      transform: `translateX(-50%) translateY(${PH - TEAR_Y - rise}px)`,
      width: PW - 20,
      zIndex: 1,
    }}>
      {[4,3,2,1,0].map(i => (
        <div key={i} style={{
          position: 'absolute',
          bottom: i * 2.5,
          width: PW - 20,
          height: 8,
          background: i === 0 ? '#0d1f35' : `rgba(13,31,53,${0.8 - i*0.12})`,
          border: `1px solid rgba(201,168,51,${0.45 - i*0.08})`,
          borderRadius: 3,
          transform: `rotate(${(i - 2) * 0.9}deg) translateX(${(i-2)*1.5}px)`,
          transition: 'transform 0.1s',
        }} />
      ))}
      <div style={{
        position: 'relative', zIndex: 5,
        width: PW - 20, height: 50,
        background: 'linear-gradient(165deg, #0d1f35, #060f1c)',
        border: '1.5px solid rgba(201,168,51,0.5)',
        borderRadius: 7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
        boxShadow: '0 -4px 16px rgba(201,168,51,0.25)',
      }}>
        🚂
      </div>
    </div>
  );
}

// ── Screen flash ──────────────────────────────────────────────────────────────
function ScreenFlash({ visible }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 49,
      background: 'rgba(201,168,51,0.22)',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.15s',
    }} />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PackAnimation({ onComplete }) {
  const [phase,    setPhase]    = useState('idle');
  const [topY,     setTopY]     = useState(0);
  const [topRot,   setTopRot]   = useState(0);
  const [topOp,    setTopOp]    = useState(1);
  const [slideProgress, setSlide] = useState(0);
  const [glowOp,   setGlowOp]   = useState(0);
  const [flash,    setFlash]    = useState(false);
  const { particles, burst }    = useParticles();
  const rafRef = useRef(null);
  const containerRef = useRef(null);

  // Start shake after short delay
  useEffect(() => {
    const t = setTimeout(() => setPhase('shaking'), 180);
    return () => clearTimeout(t);
  }, []);

  // Shake sound
  useEffect(() => {
    if (phase !== 'shaking') return;
    soundPackShake();
    const t = setInterval(() => soundPackShake(), 540);
    return () => clearInterval(t);
  }, [phase]);

  const handleTap = () => {
    if (phase === 'tearing' || phase === 'sliding' || phase === 'done') return;
    setPhase('tearing');
    soundTear();

    // Flash
    setFlash(true);
    setTimeout(() => setFlash(false), 180);

    // Burst particles from tear point
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const tearScreenY = rect.top + TEAR_Y;
      burst(rect.left + PW / 2, tearScreenY, 35);
    }

    const start = performance.now();
    const TEAR_DUR = 340;

    const animTear = (now) => {
      const t    = Math.min((now - start) / TEAR_DUR, 1);
      const ease = 1 - Math.pow(1 - t, 2.8);
      setTopY(-200 * ease);
      setTopRot(-18 * ease);
      setTopOp(Math.max(0, 1 - ease * 1.4));
      setGlowOp(t);
      if (t < 0.5) {
        // Secondary particle burst as flap reaches apex
        const rect2 = containerRef.current?.getBoundingClientRect();
        if (rect2 && t > 0.45) burst(rect2.left + PW / 2, rect2.top - 40, 12);
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animTear);
      } else {
        setPhase('sliding');
        startSlide(performance.now());
      }
    };
    rafRef.current = requestAnimationFrame(animTear);
  };

  const startSlide = (start) => {
    const SLIDE_DUR = 800;
    let   lastSound = -1;
    const tick = (now) => {
      const t    = Math.min((now - start) / SLIDE_DUR, 1);
      const ease = 1 - Math.pow(1 - t, 2.2);
      setSlide(ease);
      const step = Math.floor(t * 5);
      if (step !== lastSound && step <= 4) {
        lastSound = step;
        setTimeout(() => soundCardSlide(), step * 40);
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('done');
        setTimeout(() => onComplete?.(), 320);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const showFull    = phase === 'idle' || phase === 'shaking';
  const showTearing = phase === 'tearing' || phase === 'sliding' || phase === 'done';

  return (
    <>
      <Particles particles={particles} />
      <ScreenFlash visible={flash} />

      <div
        onClick={handleTap}
        style={{
          minHeight: 'calc(100vh - 100px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 22, padding: '20px 16px',
          cursor: showFull ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {/* Prompt */}
        <p style={{
          fontSize: 10, color: 'rgba(201,168,51,0.55)', fontFamily: 'monospace',
          letterSpacing: '.2em', margin: 0,
          opacity: showFull ? 1 : 0, transition: 'opacity 0.3s',
          animation: phase === 'shaking' ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}>
          {phase === 'idle' ? 'FETCHING CARDS…' : 'TAP TO OPEN PACK'}
        </p>

        {/* Pack + glow halo */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: PW, height: PH + 80,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          {/* Background glow */}
          <div style={{
            position: 'absolute', inset: -60, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,51,0.3) 0%, transparent 65%)',
            opacity: glowOp, pointerEvents: 'none',
            transition: 'opacity 0.08s',
            filter: 'blur(2px)',
          }} />

          {/* Card stack peeking out */}
          {(phase === 'sliding' || phase === 'done') && (
            <CardStack progress={slideProgress} />
          )}

          {/* Pack body */}
          <div style={{
            position: 'absolute', bottom: 0, left: '50%',
            transform: `translateX(-50%)`,
            width: PW, height: PH,
          }}>
            {showFull && (
              <div
                className={phase === 'shaking' ? 'pack-shake' : ''}
                style={{ position: 'relative', width: PW, height: PH }}
              >
                <PackGraphic />
              </div>
            )}
            {showTearing && (
              <>
                {/* Torn top piece */}
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 3,
                  transform: `translateY(${topY}px) rotate(${topRot}deg)`,
                  opacity: topOp,
                  transformOrigin: '50% 0%',
                  transition: 'none',
                }}>
                  <PackGraphic clipTop />
                </div>
                {/* Bottom stays */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                  <PackGraphic clipBottom />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Loading dots */}
        {showFull && (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: 0.6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'rgba(201,168,51,0.5)',
                animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite`,
              }} />
            ))}
            <span style={{ fontSize: 8.5, color: 'rgba(201,168,51,0.4)', fontFamily: 'monospace', marginLeft: 4 }}>
              fetching from wikipedia…
            </span>
          </div>
        )}
      </div>
    </>
  );
}
