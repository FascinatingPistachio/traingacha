/**
 * DesktopLanding.jsx
 * Shown on desktop/laptop browsers. Advertises the mobile experience.
 * Animated steam train background, card previews, install instructions.
 */
import { useEffect, useRef, useState } from 'react';

// ── Animated steam canvas background ─────────────────────────────────────────
function SteamBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles
    const particles = [];

    class Puff {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height * (0.55 + Math.random() * 0.25);
        this.r = 6 + Math.random() * 12;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = -(0.4 + Math.random() * 0.7);
        this.life = 1;
        this.decay = 0.006 + Math.random() * 0.005;
        this.type = Math.random() < 0.6 ? 'steam' : 'smoke';
      }
      update() {
        this.x += this.vx + Math.sin(Date.now() * 0.001 + this.y) * 0.15;
        this.y += this.vy;
        this.r  *= 1.012;
        this.life -= this.decay;
        if (this.life <= 0) this.reset();
      }
      draw(ctx) {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        if (this.type === 'steam') {
          g.addColorStop(0,   `rgba(190,210,240,${this.life * 0.45})`);
          g.addColorStop(0.5, `rgba(160,190,220,${this.life * 0.25})`);
          g.addColorStop(1,   `rgba(140,180,220,0)`);
        } else {
          g.addColorStop(0,   `rgba(50,40,30,${this.life * 0.55})`);
          g.addColorStop(0.5, `rgba(70,55,40,${this.life * 0.3})`);
          g.addColorStop(1,   `rgba(40,35,25,0)`);
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Spawn 80 particles
    for (let i = 0; i < 80; i++) {
      const p = new Puff();
      p.y     = Math.random() * canvas.height; // stagger initial positions
      p.life  = Math.random();
      particles.push(p);
    }

    // Track lines
    function drawTracks(ctx) {
      const y = canvas.height * 0.78;
      // Rails
      ctx.strokeStyle = 'rgba(80,100,120,0.35)';
      ctx.lineWidth = 3;
      for (const offset of [-8, 8]) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(canvas.width, y + offset);
        ctx.stroke();
      }
      // Sleepers
      ctx.strokeStyle = 'rgba(60,45,30,0.4)';
      ctx.lineWidth = 2;
      const spacing = 40;
      const offset  = (Date.now() / 30) % spacing;
      for (let x = -offset; x < canvas.width + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, y - 14);
        ctx.lineTo(x, y + 14);
        ctx.stroke();
      }
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawTracks(ctx);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
    }} />
  );
}

// ── Fake card showcase ────────────────────────────────────────────────────────
const SHOWCASE_CARDS = [
  { title: 'Flying Scotsman',        rarity: 'L', power: 87, color: '#e8c040', bg: '#160f00', border: 'rgba(232,192,64,0.8)',  emoji: '⭐' },
  { title: 'Shinkansen N700',        rarity: 'L', power: 91, color: '#e8c040', bg: '#160f00', border: 'rgba(232,192,64,0.8)',  emoji: '⭐' },
  { title: "Stephenson's Rocket",    rarity: 'E', power: 74, color: '#b57bee', bg: '#140824', border: 'rgba(181,123,238,0.65)', emoji: '✨' },
  { title: 'LNER Class A4 Mallard',  rarity: 'M', power: 99, color: '#c0c8ff', bg: '#030308', border: 'rgba(140,160,255,0.9)', emoji: '✦' },
  { title: 'TGV Duplex',             rarity: 'E', power: 78, color: '#b57bee', bg: '#140824', border: 'rgba(181,123,238,0.65)', emoji: '✨' },
];

function ShowcaseCard({ card, delay = 0 }) {
  return (
    <div style={{
      width: 130, height: 195,
      borderRadius: 10, overflow: 'hidden',
      background: card.bg,
      border: `1.5px solid ${card.border}`,
      boxShadow: `0 0 20px ${card.border.replace('0.', '0.3').replace('0.9', '0.5')}, 0 8px 32px rgba(0,0,0,0.8)`,
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
      animation: `floatCard 3s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      transition: 'transform 0.3s',
    }}>
      {/* Banner */}
      <div style={{
        height: 22, background: `linear-gradient(90deg,${card.bg},rgba(0,0,0,0.3))`,
        borderBottom: `1px solid ${card.border}55`,
        display: 'flex', alignItems: 'center', padding: '0 6px', justifyContent: 'space-between',
      }}>
        <span style={{ color: card.color, fontSize: 8, fontFamily: 'monospace', fontWeight: 700 }}>
          {'★'.repeat(card.rarity === 'M' ? 4 : card.rarity === 'L' ? 4 : card.rarity === 'E' ? 3 : 2)}
        </span>
        <span style={{ color: card.color, fontSize: 7, fontFamily: 'monospace', fontWeight: 700 }}>
          {card.rarity === 'M' ? '✦ MYTHIC' : card.rarity === 'L' ? 'LEGENDARY' : 'EPIC'}
        </span>
      </div>
      {/* Title */}
      <div style={{
        height: 28, background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', padding: '0 6px',
        fontSize: 9, fontFamily: 'Georgia,serif', fontWeight: 700, color: '#f0e8d8',
        lineHeight: 1.2,
      }}>
        {card.title}
      </div>
      {/* Photo area */}
      <div style={{
        flex: 1, background: `linear-gradient(135deg,${card.bg},rgba(0,0,0,0.6))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
      }}>
        🚂
      </div>
      {/* Stats preview */}
      <div style={{
        height: 52, background: `linear-gradient(180deg,${card.bg},#020810)`,
        borderTop: `1.5px solid ${card.border}66`,
        padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        {['SPEED','POWER','HERITAGE'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 6, color: `${card.color}88`, fontFamily: 'monospace', width: 38 }}>{s}</span>
            <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1 }}>
              <div style={{ width: `${55 + i * 12 + card.power * 0.25}%`, height: '100%', background: card.color, borderRadius: 1, opacity: 0.7 }} />
            </div>
          </div>
        ))}
      </div>
      {/* Score footer */}
      <div style={{
        height: 18, background: `rgba(0,0,0,0.4)`,
        borderTop: `1px solid ${card.border}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 6px',
      }}>
        <span style={{ fontSize: 6, color: `${card.color}55`, fontFamily: 'monospace' }}>RAIL GACHA</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: card.color, fontFamily: 'monospace' }}>{card.power}</span>
      </div>
    </div>
  );
}

// ── QR Code (SVG path generated for the vercel URL) ──────────────────────────
// Simple URL display since we can't generate real QR without library
function PhoneMockup() {
  return (
    <div style={{
      width: 220, height: 440,
      background: 'linear-gradient(160deg,#1a2a3a,#0a1420)',
      borderRadius: 36,
      border: '3px solid rgba(255,255,255,0.12)',
      boxShadow: '0 0 60px rgba(201,168,51,0.15), 0 30px 80px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.3)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Notch */}
      <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 70, height: 14, background: '#0d1828', borderRadius: 7,
          border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
      {/* Screen content */}
      <div style={{ flex: 1, background: '#06101c', overflow: 'hidden', position: 'relative' }}>
        {/* Top bar */}
        <div style={{ background: 'rgba(6,16,28,0.96)', padding: '6px 10px',
          borderBottom: '1px solid rgba(201,168,51,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#c9a833', fontFamily: 'monospace', fontSize: 8, fontWeight: 700 }}>🚂 RAIL GACHA</span>
          <span style={{ color: '#c9a833', fontFamily: 'monospace', fontSize: 8 }}>🎫 20</span>
        </div>
        {/* Mini cards */}
        <div style={{ padding: '10px 6px', display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
          {SHOWCASE_CARDS.slice(0,4).map((card, i) => (
            <div key={i} style={{
              width: 60, height: 90, borderRadius: 5,
              background: card.bg, border: `1px solid ${card.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
              boxShadow: `0 0 8px ${card.border.replace('0.', '0.2')}`,
              animation: `packBob ${1.8+i*0.3}s ease-in-out infinite`,
              animationDelay: `${i*0.3}s`,
            }}>🚂</div>
          ))}
        </div>
        {/* Bottom nav */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(4,10,20,0.98)', borderTop: '1px solid rgba(201,168,51,0.1)',
          display: 'flex', height: 38,
        }}>
          {['🏠','🎴','⚔️','📋'].map((icon, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, opacity: i === 0 ? 1 : 0.3,
              borderTop: i === 0 ? '2px solid #c9a833' : '2px solid transparent' }}>
              {icon}
            </div>
          ))}
        </div>
      </div>
      {/* Home bar */}
      <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
      </div>
    </div>
  );
}

// ── Main desktop landing ──────────────────────────────────────────────────────
export default function DesktopLanding() {
  const [copied, setCopied] = useState(false);
  const url = window.location.origin;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg,#06101c 0%,#0a1828 40%,#06101c 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes floatCard {
          0%,100% { transform: translateY(0px) rotate(var(--rot,0deg)); }
          50%      { transform: translateY(-12px) rotate(var(--rot,0deg)); }
        }
        @keyframes trainRoll {
          from { transform: translateX(-300px); }
          to   { transform: translateX(calc(100vw + 300px)); }
        }
        @keyframes trackGlow {
          0%,100% { opacity: 0.3; }
          50%      { opacity: 0.7; }
        }
      `}</style>

      {/* Steam background */}
      <SteamBackground />

      {/* Floating train across screen */}
      <div style={{
        position: 'absolute', bottom: '18%', fontSize: 48, zIndex: 2,
        animation: 'trainRoll 18s linear infinite',
        animationDelay: '2s',
        filter: 'drop-shadow(0 0 12px rgba(201,168,51,0.4))',
      }}>
        🚂
      </div>

      {/* Gold track line */}
      <div style={{
        position: 'absolute', bottom: '17%', left: 0, right: 0, height: 2, zIndex: 1,
        background: 'linear-gradient(90deg,transparent,rgba(201,168,51,0.4),rgba(201,168,51,0.4),transparent)',
        animation: 'trackGlow 3s ease-in-out infinite',
      }} />

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 24px',
        position: 'relative', zIndex: 10, gap: 48,
      }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', animation: 'slideUp 0.6s ease-out both' }}>
          <div style={{ fontSize: 52, marginBottom: 12, filter: 'drop-shadow(0 0 20px rgba(201,168,51,0.6))' }}>🚂</div>
          <h1 style={{
            fontFamily: 'Georgia,serif', fontSize: 'clamp(36px,5vw,64px)',
            fontWeight: 900, color: '#f0e8d0',
            textShadow: '0 0 40px rgba(201,168,51,0.4)',
            marginBottom: 10, letterSpacing: '-.01em',
          }}>
            Rail Gacha
          </h1>
          <p style={{
            fontFamily: 'monospace', fontSize: 14, letterSpacing: '.18em',
            color: 'rgba(201,168,51,0.65)', marginBottom: 6,
          }}>
            COLLECT · BATTLE · DISCOVER
          </p>
          <p style={{
            fontFamily: 'Georgia,serif', fontSize: 16, color: 'rgba(200,215,230,0.55)',
            maxWidth: 420, lineHeight: 1.6,
          }}>
            Pull real locomotive cards sourced from Wikipedia.<br />
            Steam, diesel, electric — thousands to collect.
          </p>
        </div>

        {/* Middle row: cards + phone */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 48,
          animation: 'slideUp 0.7s ease-out 0.1s both',
        }}>
          {/* Card fan left */}
          <div style={{ display: 'flex', gap: -20, position: 'relative' }}>
            {SHOWCASE_CARDS.slice(0, 3).map((card, i) => (
              <div key={i} style={{
                '--rot': `${(i - 1) * 7}deg`,
                transform: `rotate(${(i - 1) * 7}deg) translateY(${Math.abs(i - 1) * 10}px)`,
                marginLeft: i > 0 ? -30 : 0,
                zIndex: i === 1 ? 3 : i === 0 ? 2 : 1,
              }}>
                <ShowcaseCard card={card} delay={i * 0.5} />
              </div>
            ))}
          </div>

          {/* Phone mockup */}
          <PhoneMockup />

          {/* Card fan right */}
          <div style={{ display: 'flex', gap: -20, position: 'relative' }}>
            {SHOWCASE_CARDS.slice(2, 5).map((card, i) => (
              <div key={i} style={{
                '--rot': `${(i - 1) * -6}deg`,
                transform: `rotate(${(i - 1) * -6}deg) translateY(${Math.abs(i - 1) * 8}px)`,
                marginLeft: i > 0 ? -30 : 0,
                zIndex: i === 1 ? 3 : i === 0 ? 2 : 1,
              }}>
                <ShowcaseCard card={card} delay={i * 0.4 + 0.8} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA: open on phone */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          animation: 'slideUp 0.8s ease-out 0.2s both',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,rgba(201,168,51,0.12),rgba(201,168,51,0.04))',
            border: '1px solid rgba(201,168,51,0.25)',
            borderRadius: 20, padding: '28px 36px',
            textAlign: 'center', maxWidth: 480,
          }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>📱</div>
            <h2 style={{
              fontFamily: 'Georgia,serif', fontSize: 22, color: '#f0e8d0',
              fontWeight: 700, marginBottom: 10,
            }}>
              Made for Mobile
            </h2>
            <p style={{
              fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.7, marginBottom: 20,
            }}>
              Open this URL on your phone to play.<br />
              Then install it to your home screen for the full app experience.
            </p>

            {/* URL copy */}
            <div style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(201,168,51,0.2)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, color: '#c9a833',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {url}
              </span>
              <button onClick={copy} style={{
                background: copied ? 'rgba(76,175,80,0.2)' : 'rgba(201,168,51,0.15)',
                border: `1px solid ${copied ? 'rgba(76,175,80,0.4)' : 'rgba(201,168,51,0.3)'}`,
                borderRadius: 6, padding: '5px 10px',
                color: copied ? '#4caf50' : '#c9a833',
                fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
                {copied ? '✓ COPIED' : 'COPY'}
              </button>
            </div>

            {/* Install instructions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '🟢', browser: 'Chrome Android', steps: 'Menu → Add to Home Screen' },
                { icon: '🦁', browser: 'Brave Android', steps: 'Menu (⋮) → Add to Home Screen' },
              ].map(({ icon, browser, steps }) => (
                <div key={browser} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '12px 10px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 10, color: '#c9a833', fontFamily: 'monospace',
                    fontWeight: 700, marginBottom: 4 }}>
                    {browser}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)',
                    fontFamily: 'monospace', lineHeight: 1.5 }}>
                    {steps}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              '♨️ Steam VFX','🛢️ Diesel smoke','⚡ Electric arcs',
              '🎴 500+ cards','⚔️ Top Trumps battles','🧲 Maglev trains',
              '🔊 Real train sounds','🏆 Raids & achievements',
            ].map(f => (
              <div key={f} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '5px 12px',
                fontSize: 11, color: 'rgba(200,215,230,0.6)',
                fontFamily: 'monospace',
              }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', zIndex: 10,
      }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
          🚂 RAIL GACHA — Open source · Data from Wikipedia
        </span>
      </div>
    </div>
  );
}
