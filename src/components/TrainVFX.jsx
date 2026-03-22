/**
 * TrainVFX.jsx — Canvas-based particle effects for train type.
 * 
 * Steam trains:   billowing white steam puffs + boiler bubbles
 * Diesel trains:  dark grey/brown smoke plumes + oil drips
 * Electric trains: electric arcs + blue sparks
 * Maglev:          speed lines + shimmer
 * High-speed:      whoosh streaks
 */

import { useEffect, useRef } from 'react';

// ── Particle base ─────────────────────────────────────────────────────────────
class Particle {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y;
    this.vx = opts.vx ?? 0;
    this.vy = opts.vy ?? -1;
    this.life = 1.0;
    this.decay = opts.decay ?? 0.012;
    this.size = opts.size ?? 8;
    this.color = opts.color ?? 'rgba(255,255,255,0.7)';
    this.grow = opts.grow ?? 1.4;
    this.wobble = opts.wobble ?? 0;
  }
  update() {
    this.x += this.vx + Math.sin(Date.now() * 0.005 + this.y) * this.wobble;
    this.y += this.vy;
    this.life -= this.decay;
    this.size *= this.grow > 1 ? 1 + (this.grow - 1) * 0.03 : 1;
  }
  get alive() { return this.life > 0; }
}

// ── Steam puff ────────────────────────────────────────────────────────────────
function drawSteam(ctx, p) {
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
  g.addColorStop(0, `rgba(230,240,255,${p.life * 0.55})`);
  g.addColorStop(0.5, `rgba(200,220,240,${p.life * 0.35})`);
  g.addColorStop(1, `rgba(180,200,230,0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
}

// ── Diesel smoke ──────────────────────────────────────────────────────────────
function drawSmoke(ctx, p) {
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
  g.addColorStop(0, `rgba(60,50,40,${p.life * 0.7})`);
  g.addColorStop(0.4, `rgba(80,65,50,${p.life * 0.45})`);
  g.addColorStop(1, `rgba(40,35,30,0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
}

// ── Oil drip ──────────────────────────────────────────────────────────────────
function drawOilDrip(ctx, p) {
  ctx.fillStyle = `rgba(80,60,30,${p.life * 0.8})`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  // elongated drip
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + p.size * 0.3, p.size * 0.25, p.size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ── Electric spark ────────────────────────────────────────────────────────────
function drawSpark(ctx, p) {
  ctx.strokeStyle = `rgba(120,200,255,${p.life * 0.9})`;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(80,180,255,0.8)';
  ctx.shadowBlur = 8;
  // Zig-zag bolt
  const len = p.size * 2;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + p.vx * len * 0.5 + (Math.random()-0.5) * 6, p.y + p.vy * len * 0.5);
  ctx.lineTo(p.x + p.vx * len, p.y + p.vy * len);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Bright dot at origin
  ctx.fillStyle = `rgba(200,240,255,${p.life})`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
  ctx.fill();
}

// ── Boiling bubble ────────────────────────────────────────────────────────────
function drawBubble(ctx, p) {
  ctx.strokeStyle = `rgba(180,230,255,${p.life * 0.7})`;
  ctx.lineWidth = 1;
  ctx.fillStyle = `rgba(180,230,255,${p.life * 0.15})`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

// ── Speed line ────────────────────────────────────────────────────────────────
function drawSpeedLine(ctx, p) {
  ctx.strokeStyle = `rgba(200,220,255,${p.life * 0.6})`;
  ctx.lineWidth = p.size * 0.3;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x - p.vx * 30 * (1 - p.life), p.y - p.vy * 30 * (1 - p.life));
  ctx.stroke();
}

// ── Ember / coal particle ─────────────────────────────────────────────────────
function drawEmber(ctx, p) {
  const r = `rgba(255,${Math.round(100 + p.life * 100)},0,${p.life * 0.9})`;
  ctx.fillStyle = r;
  ctx.shadowColor = 'rgba(255,150,0,0.7)';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ── Particle system factory ───────────────────────────────────────────────────
function createSystem(type, w, h) {
  const spawn = [];
  const particles = [];
  let frame = 0;

  function spawnSteam() {
    // Main chimney steam
    const cx = w * (0.25 + Math.random() * 0.1);
    const cy = h * 0.05;
    for (let i = 0; i < 3; i++) {
      particles.push(new Particle(cx + (Math.random()-0.5)*8, cy, {
        vx: (Math.random()-0.5)*0.6, vy: -(0.6 + Math.random()*0.8),
        decay: 0.008 + Math.random()*0.006, size: 6 + Math.random()*8,
        grow: 1.4, wobble: 0.4,
      }));
    }
    // Exhaust puffs from wheels/boiler
    if (frame % 15 === 0) {
      particles.push(new Particle(w * 0.15, h * 0.55, {
        vx: (Math.random()-0.5)*0.4, vy: -(0.3+Math.random()*0.4),
        decay: 0.018, size: 4, grow: 1.3, wobble: 0.2,
      }));
    }
    // Boiling bubbles at bottom
    if (Math.random() < 0.4) {
      particles.push(new Particle(
        w * (0.15 + Math.random() * 0.7),
        h * (0.75 + Math.random() * 0.2),
        { vx: (Math.random()-0.5)*0.5, vy: -(0.8+Math.random()*1.2), decay: 0.025, size: 3+Math.random()*4, type: 'bubble' }
      ));
    }
    // Embers
    if (Math.random() < 0.15) {
      particles.push(Object.assign(new Particle(cx + (Math.random()-0.5)*6, cy+4, {
        vx: (Math.random()-0.5)*1.2, vy: -(0.4+Math.random()*1.5),
        decay: 0.02, size: 1.5+Math.random()*2,
      }), { type: 'ember' }));
    }
  }

  function spawnDiesel() {
    const cx = w * (0.2 + Math.random() * 0.1);
    const cy = h * 0.08;
    for (let i = 0; i < 2; i++) {
      particles.push(Object.assign(new Particle(cx + (Math.random()-0.5)*6, cy, {
        vx: (Math.random()-0.5)*0.5, vy: -(0.5+Math.random()*0.7),
        decay: 0.007+Math.random()*0.005, size: 8+Math.random()*10,
        grow: 1.5, wobble: 0.25,
      }), { type: 'smoke' }));
    }
    // Oil drips from underneath
    if (Math.random() < 0.08) {
      particles.push(Object.assign(new Particle(
        w*(0.2+Math.random()*0.6), h*0.88,
        { vx: (Math.random()-0.5)*0.2, vy: 0.5+Math.random()*0.5, decay: 0.015, size: 3+Math.random()*3 }
      ), { type: 'oil' }));
    }
  }

  function spawnElectric() {
    if (Math.random() < 0.3) {
      // Pantograph sparks from top
      const angle = (Math.random()-0.5) * Math.PI * 0.8;
      particles.push(Object.assign(new Particle(w * (0.3+Math.random()*0.4), h * 0.02, {
        vx: Math.sin(angle) * (1+Math.random()*2),
        vy: Math.cos(angle) * (0.5+Math.random()*1.5) - 0.5,
        decay: 0.04+Math.random()*0.04, size: 3+Math.random()*4,
      }), { type: 'spark' }));
    }
    // Blue glow particles
    if (Math.random() < 0.15) {
      particles.push(Object.assign(new Particle(
        w*(0.1+Math.random()*0.8), h*(0.1+Math.random()*0.8),
        { vx:(Math.random()-0.5)*1.5, vy:(Math.random()-0.5)*1.5, decay: 0.04, size:2+Math.random()*3 }
      ), { type: 'bubble', color: 'rgba(100,200,255,' }));
    }
  }

  function spawnMaglev() {
    // Speed lines
    const y = Math.random() * h;
    particles.push(Object.assign(new Particle(w, y, {
      vx: -(4+Math.random()*6), vy: (Math.random()-0.5)*0.2,
      decay: 0.03, size: 1+Math.random()*2,
    }), { type: 'speed' }));
  }

  return {
    update() {
      frame++;
      // Spawn
      if (type === 'steam')   spawnSteam();
      if (type === 'diesel')  spawnDiesel();
      if (type === 'electric') { if (frame % 2 === 0) spawnElectric(); }
      if (type === 'maglev')  { if (frame % 3 === 0) spawnMaglev(); }
      // Update + kill
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (!particles[i].alive || particles[i].y < -40 || particles[i].y > h + 40 || particles[i].x < -40 || particles[i].x > w + 40) {
          particles.splice(i, 1);
        }
      }
    },
    draw(ctx) {
      ctx.save();
      particles.forEach(p => {
        const t = p.type;
        if (t === 'smoke') drawSmoke(ctx, p);
        else if (t === 'oil')   drawOilDrip(ctx, p);
        else if (t === 'spark') drawSpark(ctx, p);
        else if (t === 'speed') drawSpeedLine(ctx, p);
        else if (t === 'ember') drawEmber(ctx, p);
        else if (t === 'bubble') drawBubble(ctx, p);
        else drawSteam(ctx, p); // default: steam
      });
      ctx.restore();
    }
  };
}

// ── React component ──────────────────────────────────────────────────────────
export default function TrainVFX({ trainType, width, height, active = true }) {
  const canvasRef = useRef(null);
  const systemRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    if (!active || !trainType || trainType === 'unknown') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    systemRef.current = createSystem(trainType, width, height);

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      systemRef.current.update();
      systemRef.current.draw(ctx);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [trainType, width, height, active]);

  if (!active || !trainType || trainType === 'unknown') return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
        borderRadius: 'inherit',
      }}
    />
  );
}

// ── One-shot burst VFX (for battle reveals) ──────────────────────────────────
export function burstVFX(canvas, trainType) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const particles = [];

  // spawn a burst of particles based on train type
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 2 + Math.random() * 5;
    const p = Object.assign(new Particle(w / 2, h / 2, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      decay: 0.025 + Math.random() * 0.02,
      size: 4 + Math.random() * 8,
    }), {
      type: trainType === 'diesel' ? 'smoke'
           : trainType === 'electric' ? 'spark'
           : trainType === 'maglev'  ? 'speed'
           : 'steam',
    });
    particles.push(p);
  }

  let raf;
  const loop = () => {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.update();
      const t = p.type;
      if (t === 'smoke')  drawSmoke(ctx, p);
      else if (t === 'spark') drawSpark(ctx, p);
      else if (t === 'speed') drawSpeedLine(ctx, p);
      else drawSteam(ctx, p);
    });
    if (particles.some(p => p.alive)) {
      raf = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  };
  raf = requestAnimationFrame(loop);
}
