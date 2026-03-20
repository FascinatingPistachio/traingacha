import { useState, useEffect, useRef, useCallback } from 'react';
import { soundBolt, soundCrane, soundHookAttach, soundCardSlide, soundPackHover } from '../utils/sounds.js';

// Pack is portrait, same proportions as a real booster pack (approx 63×88mm scaled up)
const PW = 162;
const PH = 252;
const BOLT_Y = 22;        // y of bolt row from top
const BOLT_XS = [28, 62, 100, 134]; // x positions of 4 bolts

// ── Particle system ───────────────────────────────────────────────────────────
function useParticles() {
  const [particles, setParticles] = useState([]);
  const id = useRef(0);
  const burst = useCallback((x, y, count = 24) => {
    const cols = ['#c9a833','#e8c040','#fff7c0','#4fa8e8','#b57bee','#ff9d6e','#6fcf7f','#ffffff'];
    setParticles(p => [...p, ...Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const spd   = 2 + Math.random() * 5.5;
      return { id: ++id.current, x, y, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd - 2.5,
        color: cols[Math.floor(Math.random()*cols.length)], size: 2.5 + Math.random()*3.5,
        life: 1, rot: Math.random()*360, rotV: (Math.random()-0.5)*14,
        shape: Math.random()>.45 ? 'rect' : 'circle' };
    })]);
  }, []);
  useEffect(() => {
    if (!particles.length) return;
    const raf = requestAnimationFrame(() => setParticles(p =>
      p.map(q => ({ ...q, x:q.x+q.vx, y:q.y+q.vy, vy:q.vy+0.2, vx:q.vx*.97, life:q.life-.024, rot:q.rot+q.rotV }))
       .filter(q => q.life > 0)
    ));
    return () => cancelAnimationFrame(raf);
  }, [particles]);
  return { particles, burst };
}

function Particles({ particles }) {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:50, overflow:'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:p.x, top:p.y,
          width: p.shape==='circle' ? p.size : p.size*1.5,
          height: p.shape==='circle' ? p.size : p.size*.6,
          background: p.color, borderRadius: p.shape==='circle' ? '50%' : 2,
          transform: `rotate(${p.rot}deg)`,
          opacity: Math.min(p.life*2, 1), willChange:'transform',
        }} />
      ))}
    </div>
  );
}

// ── Pack visual ───────────────────────────────────────────────────────────────
function PackBody({ boltsRemoved = 0, clipTop = false, clipBottom = false, style = {} }) {
  const clip = clipTop
    ? `polygon(0 0, ${PW}px 0, ${PW}px ${BOLT_Y + 18}px, 0 ${BOLT_Y + 18}px)`
    : clipBottom
    ? `polygon(0 ${BOLT_Y + 18}px, ${PW}px ${BOLT_Y + 18}px, ${PW}px ${PH}px, 0 ${PH}px)`
    : 'none';

  return (
    <div style={{ width:PW, height:PH, position:'absolute', inset:0, clipPath:clip, ...style }}>
      <div style={{
        width:PW, height:PH, borderRadius:10, overflow:'hidden',
        background:'linear-gradient(165deg,#101f38 0%,#06101c 50%,#0b1a2c 100%)',
        border:'2px solid rgba(201,168,51,0.65)',
        boxShadow:'0 0 40px rgba(201,168,51,0.18), 0 8px 48px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
        position:'relative',
      }}>
        {/* Foil diagonal texture */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:'repeating-linear-gradient(110deg,transparent,transparent 18px,rgba(201,168,51,0.03) 18px,rgba(201,168,51,0.03) 19px)' }} />
        {/* Specular sheen */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:'linear-gradient(120deg,transparent 28%,rgba(255,255,255,0.04) 46%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 54%,transparent 72%)' }} />

        {/* TOP SEAL STRIP with bolts */}
        <div style={{
          position:'absolute', top:0, left:0, right:0, height: BOLT_Y + 18,
          background:'linear-gradient(135deg,#182a45,#0d1e34)',
          borderBottom:'2px solid rgba(201,168,51,0.45)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end',
          paddingBottom:4,
        }}>
          {/* Brand name in seal */}
          <div style={{ fontSize:7.5, color:'rgba(201,168,51,0.85)', fontFamily:'monospace', fontWeight:700, letterSpacing:'.3em', marginBottom:4 }}>
            RAIL GACHA
          </div>
          {/* Bolts row */}
          <div style={{ position:'absolute', bottom:6, left:0, right:0, display:'flex', justifyContent:'space-around', paddingLeft:14, paddingRight:14 }}>
            {BOLT_XS.map((x, i) => (
              <div key={i} style={{
                width:10, height:10, borderRadius:2,
                background: i < boltsRemoved ? 'transparent' : 'rgba(201,168,51,0.75)',
                border: i < boltsRemoved ? '1px dashed rgba(201,168,51,0.2)' : '1px solid rgba(201,168,51,0.5)',
                boxShadow: i < boltsRemoved ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.3)',
                transition:'all 0.2s',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                {i >= boltsRemoved && (
                  <div style={{ width:4, height:4, borderRadius:'50%', background:'rgba(100,80,30,0.8)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main art area */}
        <div style={{ position:'absolute', top:BOLT_Y+20, left:12, right:12, bottom:44,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
          {/* Glow halo */}
          <div style={{ position:'absolute', width:88, height:88, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,168,51,0.18) 0%,transparent 70%)' }} />
          {/* Clean locomotive silhouette in CSS (no emoji) */}
          <svg width="80" height="42" viewBox="0 0 80 42" fill="none" style={{ position:'relative', zIndex:1, filter:'drop-shadow(0 0 12px rgba(201,168,51,0.7))' }}>
            {/* Boiler/body */}
            <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(201,168,51,0.85)" />
            {/* Cab */}
            <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(201,168,51,0.9)" />
            {/* Cab window */}
            <rect x="54" y="13" width="7" height="7" rx="1" fill="rgba(6,16,28,0.8)" />
            {/* Smokebox */}
            <rect x="4" y="17" width="12" height="12" rx="2" fill="rgba(160,130,40,0.9)" />
            {/* Chimney */}
            <rect x="12" y="8" width="5" height="10" rx="1" fill="rgba(201,168,51,0.8)" />
            {/* Smoke puff */}
            <circle cx="14" cy="5" r="3" fill="rgba(201,168,51,0.3)" />
            <circle cx="18" cy="3" r="2" fill="rgba(201,168,51,0.2)" />
            {/* Wheels */}
            <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(201,168,51,0.9)" strokeWidth="2" />
            <circle cx="20" cy="34" r="2" fill="rgba(201,168,51,0.7)" />
            <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(201,168,51,0.9)" strokeWidth="2" />
            <circle cx="40" cy="34" r="2" fill="rgba(201,168,51,0.7)" />
            <circle cx="60" cy="35" r="5" fill="none" stroke="rgba(201,168,51,0.8)" strokeWidth="1.5" />
            {/* Connecting rod */}
            <line x1="20" y1="34" x2="40" y2="34" stroke="rgba(201,168,51,0.6)" strokeWidth="2" />
            {/* Buffer */}
            <rect x="0" y="22" width="6" height="6" rx="1" fill="rgba(201,168,51,0.6)" />
          </svg>
          <div style={{ fontSize:8.5, color:'rgba(201,168,51,0.7)', fontFamily:'monospace', fontWeight:700, letterSpacing:'.1em', position:'relative', zIndex:1 }}>
            TRAINS OF THE WORLD
          </div>
          <div style={{ fontSize:6.5, color:'rgba(201,168,51,0.3)', fontFamily:'monospace', letterSpacing:'.14em' }}>
            WIKIPEDIA EDITION
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:42,
          background:'linear-gradient(to top,rgba(0,0,0,0.55),transparent)',
          borderTop:'1px solid rgba(201,168,51,0.15)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 }}>
          <div style={{ fontSize:8, color:'rgba(201,168,51,0.65)', fontFamily:'monospace', fontWeight:700, letterSpacing:'.12em' }}>5 CARDS INSIDE</div>
          <div style={{ fontSize:6.5, color:'rgba(201,168,51,0.28)', fontFamily:'monospace' }}>INFO FROM WIKIPEDIA</div>
        </div>
      </div>
    </div>
  );
}

// ── Spanner tool ─────────────────────────────────────────────────────────────
function Spanner({ x, y, spinning }) {
  return (
    <div style={{
      position:'absolute',
      left: x - 10, top: y - 10,
      width:20, height:20,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:16,
      animation: spinning ? 'boltSpin 0.35s linear 2' : 'none',
      zIndex:10,
      filter:'drop-shadow(0 0 4px rgba(201,168,51,0.8))',
      transformOrigin:'center center',
    }}>
      🔧
    </div>
  );
}

// ── Crane ─────────────────────────────────────────────────────────────────────
function Crane({ cableH, hookY, attached }) {
  return (
    <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:0, zIndex:6, pointerEvents:'none' }}>
      {/* Cable */}
      <div style={{ width:2, background:'rgba(201,168,51,0.7)', height:cableH, margin:'0 auto',
        boxShadow:'0 0 3px rgba(201,168,51,0.4)' }} />
      {/* Hook */}
      <div style={{
        marginLeft:-8, marginTop:-1,
        width:18, height:22,
        border:'3px solid rgba(201,168,51,0.9)',
        borderTop:'none',
        borderRadius:'0 0 14px 14px',
        boxShadow:'0 0 6px rgba(201,168,51,0.5)',
        animation: attached ? 'hookSwing 0.6s ease-in-out infinite' : 'none',
        transformOrigin:'top center',
      }} />
      {/* Hook tip */}
      <div style={{ marginLeft:8, marginTop:-3, width:3, height:8,
        background:'rgba(201,168,51,0.9)', borderRadius:'0 0 2px 2px' }} />
    </div>
  );
}

// ── Card stack emerging ───────────────────────────────────────────────────────
function CardStack({ craneY, cardCount = 5 }) {
  return (
    <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:craneY + 28, zIndex:5, pointerEvents:'none' }}>
      {/* Cable to cards */}
      <div style={{ width:1, height:16, background:'rgba(201,168,51,0.5)', margin:'0 auto' }} />
      {/* Fanned cards */}
      <div style={{ position:'relative', width:PW-24, height:50 }}>
        {Array.from({ length: Math.min(cardCount, 5) }).map((_, i) => (
          <div key={i} style={{
            position:'absolute', bottom:0, left:'50%',
            transform:`translateX(-50%) rotate(${(i-2)*4}deg) translateY(${i*-3}px)`,
            width:PW-24, height:48,
            background:`rgba(13,31,53,${0.9-i*0.1})`,
            border:`1.5px solid rgba(201,168,51,${0.55-i*0.08})`,
            borderRadius:6,
            boxShadow:'0 -2px 8px rgba(201,168,51,0.2)',
          }} />
        ))}
        {/* Top card shows loco silhouette */}
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)',
          width:PW-24, height:48, background:'linear-gradient(165deg,#0d1f35,#060f1c)',
          border:'1.5px solid rgba(201,168,51,0.6)', borderRadius:6, zIndex:5,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="36" height="20" viewBox="0 0 80 42" fill="none">
            <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(201,168,51,0.7)" />
            <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(201,168,51,0.75)" />
            <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(201,168,51,0.8)" strokeWidth="2" />
            <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(201,168,51,0.8)" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PackAnimation({ onComplete }) {
  // phases: idle → unscrewing → crane_descend → lifting → card_hoist → done
  const [phase,       setPhase]      = useState('idle');
  const [boltsDone,   setBoltsDone]  = useState(0);
  const [activeBolt,  setActiveBolt] = useState(-1);  // which bolt is being unscrewed
  const [cableH,      setCableH]     = useState(0);   // crane cable length px
  const [hookY,       setHookY]      = useState(0);
  const [lidY,        setLidY]       = useState(0);
  const [lidRot,      setLidRot]     = useState(0);
  const [lidOp,       setLidOp]      = useState(1);
  const [cardY,       setCardY]      = useState(0);   // crane hoist position for cards
  const [glowOp,      setGlowOp]     = useState(0);
  const [flash,       setFlash]      = useState(false);
  const { particles, burst }         = useParticles();
  const packRef  = useRef(null);
  const rafRef   = useRef(null);

  // Target cable length to reach bolt row
  const TARGET_CABLE = 160;

  useEffect(() => {
    // Small delay before bobbing starts
    const t = setTimeout(() => setPhase('ready'), 300);
    return () => clearTimeout(t);
  }, []);

  // Unscrew sequence when user taps
  const handleTap = () => {
    if (phase !== 'ready' && phase !== 'idle') return;
    setPhase('unscrewing');
    unscrewNext(0);
  };

  const unscrewNext = (boltIdx) => {
    if (boltIdx >= BOLT_XS.length) {
      // All bolts done — bring in the crane
      setTimeout(() => startCrane(), 200);
      return;
    }
    setActiveBolt(boltIdx);
    soundBolt();
    // Particles at bolt position
    const rect = packRef.current?.getBoundingClientRect();
    if (rect) {
      const bx = rect.left + BOLT_XS[boltIdx];
      const by = rect.top  + BOLT_Y + 10;
      burst(bx, by, 8);
    }
    setTimeout(() => {
      setBoltsDone(boltIdx + 1);
      setActiveBolt(-1);
      setTimeout(() => unscrewNext(boltIdx + 1), 120);
    }, 420);
  };

  const startCrane = () => {
    setPhase('crane_descend');
    soundCrane();
    const start = performance.now();
    const DESCEND_DUR = 900;
    const tick = (now) => {
      const t    = Math.min((now - start) / DESCEND_DUR, 1);
      const ease = 1 - Math.pow(1 - t, 2.5);
      setCableH(TARGET_CABLE * ease);
      setHookY(TARGET_CABLE * ease);
      if (t < 1) { rafRef.current = requestAnimationFrame(tick); }
      else {
        soundHookAttach();
        setTimeout(() => startLift(), 350);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const startLift = () => {
    setPhase('lifting');
    setFlash(true);
    setTimeout(() => setFlash(false), 160);
    const rect = packRef.current?.getBoundingClientRect();
    if (rect) burst(rect.left + PW/2, rect.top + BOLT_Y + 18, 32);
    setGlowOp(1);

    const start = performance.now();
    const LIFT_DUR = 550;
    const tick = (now) => {
      const t    = Math.min((now - start) / LIFT_DUR, 1);
      const ease = 1 - Math.pow(1 - t, 2.8);
      // Lid flies off, crane cable shortens a bit then extends for cards
      setLidY(-220 * ease);
      setLidRot(-16 * ease);
      setLidOp(1 - ease);
      setCableH(TARGET_CABLE - 30 * ease);
      if (t < 1) { rafRef.current = requestAnimationFrame(tick); }
      else {
        setPhase('card_hoist');
        setTimeout(() => hoistCards(), 200);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const hoistCards = () => {
    const start = performance.now();
    const HOIST_DUR = 800;
    let lastSound = -1;
    const tick = (now) => {
      const t    = Math.min((now - start) / HOIST_DUR, 1);
      const ease = 1 - Math.pow(1 - t, 2.2);
      // Crane rises up pulling cards
      const newCableH = TARGET_CABLE + 60 * ease;
      setCableH(newCableH);
      setCardY(newCableH);
      const step = Math.floor(t * 5);
      if (step !== lastSound) { lastSound = step; setTimeout(() => soundCardSlide(), step * 40); }
      if (t < 1) { rafRef.current = requestAnimationFrame(tick); }
      else {
        setPhase('done');
        setTimeout(() => onComplete?.(), 300);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const showFull    = phase === 'idle' || phase === 'ready' || phase === 'unscrewing';
  const showCrane   = phase === 'crane_descend' || phase === 'lifting' || phase === 'card_hoist' || phase === 'done';
  const showLid     = phase === 'lifting';
  const showCards   = phase === 'card_hoist' || phase === 'done';
  const showBottom  = phase === 'lifting' || phase === 'card_hoist' || phase === 'done';

  return (
    <>
      <Particles particles={particles} />
      {flash && <div style={{ position:'fixed', inset:0, background:'rgba(201,168,51,0.2)', pointerEvents:'none', zIndex:49 }} />}

      <div
        onClick={handleTap}
        style={{
          minHeight:'calc(100vh - 100px)',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          gap:20, padding:'20px 16px',
          cursor: phase==='ready' || phase==='idle' ? 'pointer' : 'default',
          userSelect:'none',
        }}
      >
        {/* Hint text */}
        <p style={{
          fontSize:10, color:'rgba(201,168,51,0.55)', fontFamily:'monospace',
          letterSpacing:'.2em', margin:0,
          opacity: showFull ? 1 : 0, transition:'opacity 0.3s',
          animation: phase==='ready' ? 'pulse 1.8s ease-in-out infinite' : 'none',
        }}>
          {phase==='idle' ? 'FETCHING CARDS…' : phase==='unscrewing' ? 'REMOVING BOLTS…' : 'TAP TO OPEN PACK'}
        </p>

        {/* Pack container — 260px tall to give crane room above */}
        <div style={{ position:'relative', width:PW, height:PH + 120, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          {/* Background glow */}
          <div style={{ position:'absolute', inset:-60, borderRadius:'50%',
            background:'radial-gradient(circle,rgba(201,168,51,0.28) 0%,transparent 65%)',
            opacity:glowOp, pointerEvents:'none', transition:'opacity 0.1s', filter:'blur(4px)' }} />

          {/* Crane */}
          {showCrane && <Crane cableH={cableH} hookY={hookY} attached={phase==='card_hoist' || phase==='done'} />}

          {/* Cards being hoisted */}
          {showCards && <CardStack craneY={cardY} />}

          {/* Pack body */}
          <div ref={packRef} style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:PW, height:PH }}>
            {/* Full pack (pre-crane) */}
            {showFull && (
              <div style={{ position:'relative', width:PW, height:PH, animation: phase==='ready' ? 'packBob 2.2s ease-in-out infinite' : 'none' }}>
                <PackBody boltsRemoved={boltsDone} />
                {/* Active spanner */}
                {activeBolt >= 0 && (
                  <Spanner x={BOLT_XS[activeBolt]} y={BOLT_Y + 10} spinning />
                )}
              </div>
            )}

            {/* Split view during/after crane */}
            {showCrane && !showFull && (
              <>
                {/* Lid flying off */}
                {showLid && (
                  <div style={{ position:'absolute', inset:0, zIndex:3,
                    transform:`translateY(${lidY}px) rotate(${lidRot}deg)`,
                    opacity:lidOp, transformOrigin:'50% 0%' }}>
                    <PackBody boltsRemoved={4} clipTop />
                  </div>
                )}
                {/* Bottom half stays */}
                {showBottom && (
                  <div style={{ position:'absolute', inset:0, zIndex:2 }}>
                    <PackBody boltsRemoved={4} clipBottom />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Loading dots */}
        {(phase === 'idle' || phase === 'ready') && (
          <div style={{ display:'flex', gap:5, alignItems:'center', opacity:0.5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:'rgba(201,168,51,0.5)', animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
            ))}
            <span style={{ fontSize:8.5, color:'rgba(201,168,51,0.4)', fontFamily:'monospace', marginLeft:4 }}>fetching from wikipedia…</span>
          </div>
        )}
      </div>
    </>
  );
}
