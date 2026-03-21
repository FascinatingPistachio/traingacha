import { useState, useEffect, useRef, useCallback } from 'react';
import { soundBolt, soundCrane, soundHookAttach, soundCardSlide, soundPackHover, soundTear } from '../utils/sounds.js';

// Pack dimensions — tall portrait, real booster-pack proportions
const PW = 180;
const PH = 290;

// ── Particle system ───────────────────────────────────────────────────────────
function useParticles() {
  const [particles, setParticles] = useState([]);
  const id = useRef(0);

  const burst = useCallback((x, y, count = 28) => {
    const cols = ['#c9a833','#e8c040','#fff','#4fa8e8','#b57bee','#aaa','#ddd','#f0f0f0'];
    setParticles(p => [...p, ...Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 2.5 + Math.random() * 5;
      return {
        id: ++id.current,
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 3,
        color: cols[Math.floor(Math.random() * cols.length)],
        size: 2 + Math.random() * 3.5,
        life: 1,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 14,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
      };
    })]);
  }, []);

  useEffect(() => {
    if (!particles.length) return;
    const raf = requestAnimationFrame(() => setParticles(p =>
      p.map(q => ({
        ...q,
        x: q.x + q.vx, y: q.y + q.vy,
        vy: q.vy + 0.22, vx: q.vx * 0.97,
        life: q.life - 0.022,
        rot: q.rot + q.rotV,
      })).filter(q => q.life > 0)
    ));
    return () => cancelAnimationFrame(raf);
  }, [particles]);

  return { particles, burst };
}

function Particles({ particles }) {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:60, overflow:'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:p.x, top:p.y,
          width: p.shape==='circle' ? p.size : p.size * 1.6,
          height: p.shape==='circle' ? p.size : p.size * 0.6,
          background: p.color,
          borderRadius: p.shape==='circle' ? '50%' : 1,
          transform: `rotate(${p.rot}deg)`,
          opacity: Math.min(p.life * 2, 1),
          willChange: 'transform',
        }} />
      ))}
    </div>
  );
}

// ── Wikipedia globe SVG ───────────────────────────────────────────────────────
function WikiGlobe({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="white" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
      {/* Puzzle piece seams — simplified representation */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeDasharray="4 3" />
      {/* Vertical meridian */}
      <ellipse cx="50" cy="50" rx="16" ry="46" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" />
      {/* Horizontal parallels */}
      <ellipse cx="50" cy="50" rx="46" ry="16" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" />
      <ellipse cx="50" cy="30" rx="36" ry="10" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      <ellipse cx="50" cy="70" rx="36" ry="10" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      {/* W letter in centre */}
      <text x="50" y="56" textAnchor="middle" fontFamily="serif" fontSize="22" fontWeight="bold" fill="#222" letterSpacing="-1">W</text>
      {/* Puzzle piece cut lines */}
      <path d="M 50 4 C 55 4 57 8 57 12 C 57 16 54 18 54 18 L 54 30" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none"/>
      <path d="M 4 50 C 4 45 8 43 12 43 C 16 43 18 46 18 46 L 30 46" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none"/>
    </svg>
  );
}

// ── CC BY-SA badge ────────────────────────────────────────────────────────────
function CCBadge() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
      <div style={{
        display:'flex', alignItems:'center',
        background:'rgba(0,0,0,0.08)', borderRadius:3, overflow:'hidden',
        border:'1px solid rgba(0,0,0,0.2)',
      }}>
        <div style={{ background:'rgba(0,0,0,0.15)', padding:'1px 4px', fontSize:6.5, fontFamily:'sans-serif', fontWeight:700, color:'#333' }}>cc</div>
        <div style={{ padding:'1px 4px', fontSize:6, fontFamily:'sans-serif', color:'#444', letterSpacing:'.05em' }}>BY-SA</div>
      </div>
    </div>
  );
}

// ── Serrated edge (zigzag) ────────────────────────────────────────────────────
// Creates an SVG zigzag path for top or bottom of pack
function SerratedEdge({ width, position = 'top', color = '#f0f0f0', bgColor = '#06101c' }) {
  const teeth  = 18;
  const toothW = width / teeth;
  const h      = 10;

  // Build zigzag path
  let d = '';
  if (position === 'top') {
    d = `M 0 ${h}`;
    for (let i = 0; i <= teeth; i++) {
      const x = i * toothW;
      d += i % 2 === 0
        ? ` L ${x} ${h}`
        : ` L ${x - toothW / 2} 0 L ${x} ${h}`;
    }
    d += ` L ${width} ${h} L ${width} 0 L 0 0 Z`;
  } else {
    d = `M 0 0`;
    for (let i = 0; i <= teeth; i++) {
      const x = i * toothW;
      d += i % 2 === 0
        ? ` L ${x} 0`
        : ` L ${x - toothW / 2} ${h} L ${x} 0`;
    }
    d += ` L ${width} 0 L ${width} ${h} L 0 ${h} Z`;
  }

  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={{ display:'block', flexShrink:0 }}>
      {/* Background fill — hides the page behind teeth gaps */}
      <rect width={width} height={h} fill={bgColor} />
      {/* The serrated edge in pack colour */}
      <path d={d} fill={color} />
    </svg>
  );
}

// ── Full pack visual ──────────────────────────────────────────────────────────
// clipTop = show only the top flap; clipBottom = show only the body below tear
function PackVisual({ showTop = true, showBottom = true, style = {}, onHover }) {
  const FLAP_H = 44; // height of top flap section before main artwork

  // We compose the pack as three vertical slices:
  // [serrated top edge] [top flap] [main art + bottom] [serrated bottom edge]
  const bodyStyle = {
    width: PW,
    position: 'absolute', left: 0, right: 0,
    ...style,
  };

  // The full pack height including serrated edges
  const fullH = PH;

  return (
    <div style={{ width:PW, height:fullH, position:'relative', ...style }}>

      {/* ── TOP SERRATED EDGE ── */}
      {showTop && (
        <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:4 }}>
          <SerratedEdge width={PW} position="top" color="#e8e8e8" bgColor="#06101c" />
        </div>
      )}

      {/* ── PACK BODY ── */}
      <div style={{
        position:'absolute',
        top: showTop ? 9 : 0,
        bottom: showBottom ? 9 : 0,
        left:0, right:0,
        overflow:'hidden',
        background: 'linear-gradient(175deg, #f5f5f0 0%, #e8e8e2 30%, #f0efea 60%, #e5e4de 100%)',
        boxShadow: showTop && showBottom
          ? '2px 0 12px rgba(0,0,0,0.4), -2px 0 12px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.5)'
          : '0 4px 24px rgba(0,0,0,0.3)',
      }}
        onMouseEnter={onHover}
      >
        {/* Subtle foil vertical sheen stripes */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:'repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(255,255,255,0.18) 18px, rgba(255,255,255,0.18) 19px)' }} />
        {/* Main sheen highlight */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:'linear-gradient(160deg, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(255,255,255,0.15) 65%, transparent 100%)' }} />

        {/* Rail Gacha branding strip at top */}
        <div style={{
          padding:'7px 12px 6px',
          borderBottom:'1px solid rgba(0,0,0,0.1)',
          background:'linear-gradient(135deg, rgba(0,0,0,0.07), rgba(0,0,0,0.04))',
          textAlign:'center',
        }}>
          <div style={{ fontSize:8, fontFamily:"'Courier New',monospace", fontWeight:700, color:'rgba(0,0,0,0.55)', letterSpacing:'.22em' }}>
            RAIL GACHA
          </div>
          <div style={{ fontSize:6, fontFamily:"'Courier New',monospace", color:'rgba(0,0,0,0.35)', letterSpacing:'.15em', marginTop:1 }}>
            BOOSTER PACK · 5 CARDS
          </div>
        </div>

        {/* Wikipedia globe — centrepiece */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 12px 10px' }}>
          <WikiGlobe size={82} />
          {/* Wikipedia wordmark */}
          <div style={{ marginTop:10, textAlign:'center' }}>
            <div style={{
              fontSize:18, fontFamily:"'Linux Libertine','Georgia','Times New Roman',serif",
              fontWeight:400, color:'#111', letterSpacing:'.04em', lineHeight:1,
            }}>
              W<span style={{ fontSize:14 }}>IKIPEDIA</span>
            </div>
            <div style={{ fontSize:9, fontFamily:"'Linux Libertine','Georgia',serif", color:'#444', marginTop:2, fontStyle:'italic', letterSpacing:'.02em' }}>
              The Free Encyclopedia
            </div>
          </div>
        </div>

        {/* Horizontal rule */}
        <div style={{ margin:'0 14px', height:1, background:'rgba(0,0,0,0.12)', flexShrink:0 }} />

        {/* Train silhouette */}
        <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 6px' }}>
          <svg width="110" height="52" viewBox="0 0 120 60" fill="none">
            {/* Track */}
            <line x1="0" y1="54" x2="120" y2="54" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
            <line x1="10" y1="54" x2="10" y2="58" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
            <line x1="30" y1="54" x2="30" y2="58" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
            <line x1="50" y1="54" x2="50" y2="58" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
            <line x1="70" y1="54" x2="70" y2="58" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
            <line x1="90" y1="54" x2="90" y2="58" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
            <line x1="110" y1="54" x2="110" y2="58" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
            {/* Boiler */}
            <rect x="12" y="22" width="68" height="24" rx="4" fill="rgba(0,0,0,0.55)"/>
            {/* Cab */}
            <rect x="70" y="16" width="28" height="30" rx="3" fill="rgba(0,0,0,0.6)"/>
            {/* Cab window */}
            <rect x="75" y="20" width="10" height="8" rx="1" fill="rgba(255,255,255,0.6)"/>
            {/* Smokebox */}
            <rect x="6" y="26" width="14" height="16" rx="2" fill="rgba(0,0,0,0.65)"/>
            {/* Chimney */}
            <rect x="16" y="12" width="6" height="12" rx="1" fill="rgba(0,0,0,0.6)"/>
            <rect x="14" y="10" width="10" height="4" rx="1" fill="rgba(0,0,0,0.55)"/>
            {/* Steam puff */}
            <circle cx="18" cy="6" r="4" fill="rgba(0,0,0,0.12)"/>
            <circle cx="23" cy="4" r="3" fill="rgba(0,0,0,0.09)"/>
            <circle cx="27" cy="6" r="2.5" fill="rgba(0,0,0,0.07)"/>
            {/* Dome */}
            <ellipse cx="42" cy="21" rx="7" ry="5" fill="rgba(0,0,0,0.58)"/>
            {/* Drive wheels */}
            <circle cx="28" cy="46" r="8" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="2.5"/>
            <circle cx="28" cy="46" r="2.5" fill="rgba(0,0,0,0.5)"/>
            <circle cx="48" cy="46" r="8" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="2.5"/>
            <circle cx="48" cy="46" r="2.5" fill="rgba(0,0,0,0.5)"/>
            <circle cx="68" cy="46" r="8" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="2.5"/>
            <circle cx="68" cy="46" r="2.5" fill="rgba(0,0,0,0.5)"/>
            {/* Pony wheel */}
            <circle cx="84" cy="47" r="6" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2"/>
            {/* Connecting rods */}
            <line x1="28" y1="46" x2="48" y2="46" stroke="rgba(0,0,0,0.5)" strokeWidth="2"/>
            <line x1="48" y1="46" x2="68" y2="46" stroke="rgba(0,0,0,0.5)" strokeWidth="2"/>
            {/* Buffer */}
            <rect x="0" y="30" width="8" height="8" rx="1" fill="rgba(0,0,0,0.5)"/>
          </svg>
        </div>

        {/* Bottom info */}
        <div style={{ padding:'8px 14px 10px', borderTop:'1px solid rgba(0,0,0,0.1)', marginTop:'auto' }}>
          <CCBadge />
          <div style={{ fontSize:6.5, fontFamily:"'Courier New',monospace", color:'rgba(0,0,0,0.4)', lineHeight:1.6 }}>
            Content is available under CC BY-SA 4.0
          </div>
        </div>
      </div>

      {/* ── BOTTOM SERRATED EDGE ── */}
      {showBottom && (
        <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:4 }}>
          <SerratedEdge width={PW} position="bottom" color="#e8e8e2" bgColor="#06101c" />
        </div>
      )}
    </div>
  );
}

// ── Card stack emerging from torn top ────────────────────────────────────────
function CardStack({ riseAmount }) {
  const capped = Math.min(riseAmount, 1);
  return (
    <div style={{
      position:'absolute',
      left:'50%',
      transform:`translateX(-50%)`,
      bottom: 9 + (1 - capped) * 60,
      zIndex:2,
      pointerEvents:'none',
    }}>
      {/* Fanned card backs */}
      {[4,3,2,1,0].map(i => (
        <div key={i} style={{
          position:'absolute',
          bottom: i * 3,
          left: '50%',
          transform:`translateX(-50%) rotate(${(i-2)*1.5}deg)`,
          width: PW - 28,
          height: 12,
          background:`rgba(14,31,53,${0.9-i*0.1})`,
          border:`1px solid rgba(201,168,51,${0.5-i*0.07})`,
          borderRadius:3,
          boxShadow:'0 2px 8px rgba(0,0,0,0.3)',
        }} />
      ))}
      {/* Top card */}
      <div style={{
        position:'relative', zIndex:5,
        width: PW - 28, height:55,
        background:'linear-gradient(165deg,#0d1f35,#060f1c)',
        border:'2px solid rgba(201,168,51,0.55)',
        borderRadius:7,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 -4px 18px rgba(201,168,51,0.25), 0 4px 12px rgba(0,0,0,0.5)',
      }}>
        <svg width="36" height="20" viewBox="0 0 80 42" fill="none">
          <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(201,168,51,0.65)"/>
          <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(201,168,51,0.7)"/>
          <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(201,168,51,0.7)" strokeWidth="2"/>
          <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(201,168,51,0.7)" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  );
}

// ── Main pack animation component ─────────────────────────────────────────────
export default function PackAnimation({ onComplete }) {
  const [phase,      setPhase]    = useState('idle');
  // Torn flap animation
  const [flapY,      setFlapY]    = useState(0);
  const [flapRot,    setFlapRot]  = useState(0);
  const [flapOp,     setFlapOp]   = useState(1);
  // Card rise animation
  const [cardRise,   setCardRise] = useState(0);
  const [glowOp,     setGlowOp]   = useState(0);
  const [flash,      setFlash]    = useState(false);

  const { particles, burst } = useParticles();
  const packRef  = useRef(null);
  const rafRef   = useRef(null);

  // Start bobbing once loaded
  useEffect(() => {
    const t = setTimeout(() => setPhase('ready'), 250);
    return () => clearTimeout(t);
  }, []);

  const handleTap = () => {
    if (phase !== 'ready' && phase !== 'idle') return;
    setPhase('tearing');
    soundTear();

    // Screen flash
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    setGlowOp(1);

    // Burst at tear line
    const rect = packRef.current?.getBoundingClientRect();
    if (rect) burst(rect.left + PW / 2, rect.top + 10, 35);

    const start   = performance.now();
    const TEAR_MS = 400;

    const animTear = now => {
      const t    = Math.min((now - start) / TEAR_MS, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setFlapY(-230 * ease);
      setFlapRot(-20 * ease);
      setFlapOp(Math.max(0, 1 - ease * 1.6));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animTear);
      } else {
        setPhase('rising');
        soundHookAttach();
        animRise(performance.now());
      }
    };
    rafRef.current = requestAnimationFrame(animTear);
  };

  const animRise = start => {
    const RISE_MS  = 750;
    let lastSound  = -1;
    const tick = now => {
      const t    = Math.min((now - start) / RISE_MS, 1);
      const ease = 1 - Math.pow(1 - t, 2.2);
      setCardRise(ease);
      const step = Math.floor(t * 5);
      if (step !== lastSound) { lastSound = step; setTimeout(() => soundCardSlide(), step * 45); }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('done');
        setTimeout(() => onComplete?.(), 300);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const isTearing = phase === 'tearing';
  const isRising  = phase === 'rising' || phase === 'done';
  const isReady   = phase === 'ready' || phase === 'idle';

  return (
    <>
      <Particles particles={particles} />

      {/* Screen flash on tear */}
      {flash && (
        <div style={{ position:'fixed', inset:0, background:'rgba(255,255,255,0.25)', pointerEvents:'none', zIndex:49 }} />
      )}

      <div
        onClick={handleTap}
        style={{
          minHeight: 'calc(100vh - 100px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20, padding: '20px 16px',
          cursor: isReady ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {/* Instruction */}
        <p style={{
          fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace',
          letterSpacing: '.22em', margin: 0,
          opacity: isReady ? 1 : 0, transition: 'opacity 0.3s',
          animation: phase === 'ready' ? 'pulse 2s ease-in-out infinite' : 'none',
        }}>
          {phase === 'idle' ? 'FETCHING CARDS…' : '▲  TAP TO OPEN  ▲'}
        </p>

        {/* Pack wrapper — extra height for card rise above pack */}
        <div style={{ position:'relative', width:PW, height:PH + 100 }}>

          {/* Background glow */}
          <div style={{
            position:'absolute', inset:-50, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(220,220,200,0.12) 0%, transparent 68%)',
            opacity:glowOp, pointerEvents:'none', filter:'blur(4px)',
            transition:'opacity 0.1s',
          }} />

          {/* Cards rising out */}
          {isRising && <CardStack riseAmount={cardRise} />}

          {/* Pack body — positioned at bottom of wrapper */}
          <div
            ref={packRef}
            style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:PW, height:PH }}
          >
            {isReady && (
              <div style={{ animation: phase === 'ready' ? 'packBob 2.5s ease-in-out infinite' : 'none' }}>
                <PackVisual
                  onHover={() => soundPackHover()}
                />
              </div>
            )}

            {(isTearing || isRising) && (
              <>
                {/* Flap tears upward */}
                {flapOp > 0 && (
                  <div style={{
                    position:'absolute', inset:0,
                    transform:`translateY(${flapY}px) rotate(${flapRot}deg)`,
                    opacity: flapOp,
                    transformOrigin: '50% 0%',
                    zIndex:5,
                  }}>
                    {/* Only the top portion — clipped to FLAP_H px */}
                    <div style={{ overflow:'hidden', height:55 }}>
                      <PackVisual showBottom={false} />
                    </div>
                  </div>
                )}

                {/* Lower body stays */}
                <div style={{ position:'absolute', inset:0, zIndex:3 }}>
                  <div style={{ overflow:'hidden', position:'absolute', top:45, left:0, right:0, bottom:0 }}>
                    <PackVisual showTop={false} style={{ marginTop:-45 }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Loading dots */}
        {isReady && (
          <div style={{ display:'flex', gap:5, alignItems:'center', opacity:0.45 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:5, height:5, borderRadius:'50%',
                background:'rgba(255,255,255,0.45)',
                animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`,
              }} />
            ))}
            <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', marginLeft:4 }}>
              fetching from wikipedia…
            </span>
          </div>
        )}
      </div>
    </>
  );
}
