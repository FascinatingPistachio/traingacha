import { useState, useEffect, useRef, useCallback } from 'react';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent, formatStat } from '../utils/stats.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';

// ── Particle burst effect ───────────────────────────────────────────────────
function Particles({ color, count = 12 }) {
  const sparks = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const dist  = 40 + Math.random() * 60;
    return {
      sx: `${Math.cos(angle) * dist}px`,
      sy: `${Math.sin(angle) * dist}px`,
      color: i % 3 === 0 ? '#fff' : color,
      delay: `${Math.random() * 0.3}s`,
      size: 4 + Math.random() * 5,
    };
  });
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'visible' }}>
      {sparks.map((s, i) => (
        <div key={i} className="spark" style={{
          '--sx': s.sx, '--sy': s.sy,
          top:'50%', left:'50%',
          width: s.size, height: s.size,
          background: s.color,
          animationDelay: s.delay,
          boxShadow: `0 0 6px ${s.color}`,
        }} />
      ))}
    </div>
  );
}

// ── Animated stat bar ───────────────────────────────────────────────────────
function StatRow({ cfg, value, delay, maxVal, isTop }) {
  const pct = statPercent(cfg.key, value);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 5 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 7 }}>
          <span style={{ fontSize: 18 }}>{cfg.icon}</span>
          <span style={{ fontSize: 11, fontFamily:'monospace', fontWeight:700, letterSpacing:'.1em',
            color: isTop ? cfg.color : 'rgba(255,255,255,0.55)' }}>
            {cfg.label}
          </span>
          {isTop && (
            <span style={{ fontSize: 8, background: cfg.color + '33', color: cfg.color,
              border: `1px solid ${cfg.color}66`, borderRadius: 3, padding:'1px 5px',
              fontFamily:'monospace', fontWeight:700, letterSpacing:'.08em' }}>
              BEST
            </span>
          )}
        </div>
        <span style={{ fontFamily:'monospace', fontSize: 14, fontWeight:800, color: isTop ? cfg.color : '#f0e8d8',
          textShadow: isTop ? `0 0 12px ${cfg.color}88` : 'none',
          animation:'countUp 0.4s ease-out both', animationDelay: `${delay}s` }}>
          {formatStat(cfg.key, value)}
        </span>
      </div>
      <div style={{ height: 8, background:'rgba(255,255,255,0.06)', borderRadius: 4, overflow:'hidden',
        boxShadow:'inset 0 1px 3px rgba(0,0,0,0.4)' }}>
        <div className="stat-bar-fill" style={{
          '--w': `${pct}%`,
          '--delay': `${delay}s`,
          height:'100%', borderRadius: 4,
          background: isTop
            ? `linear-gradient(90deg, ${cfg.color}bb, ${cfg.color})`
            : `linear-gradient(90deg, ${cfg.color}66, ${cfg.color}99)`,
          boxShadow: isTop ? `0 0 10px ${cfg.color}88` : 'none',
          position:'relative', overflow:'hidden',
        }}>
          {isTop && (
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 60%,rgba(255,255,255,0.3))',
              animation:'shimmer 1.5s linear infinite' }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── 3D tiltable card image ──────────────────────────────────────────────────
function TiltCard({ card, rs, children }) {
  const ref    = useRef(null);
  const raf    = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = (e.clientX ?? e.touches?.[0]?.clientX ?? rect.left + rect.width/2) - rect.left;
    const cy = (e.clientY ?? e.touches?.[0]?.clientY ?? rect.top + rect.height/2) - rect.top;
    const rx = ((cy / rect.height) - 0.5) * -18;
    const ry = ((cx / rect.width)  - 0.5) *  18;
    const mx = (cx / rect.width)  * 100;
    const my = (cy / rect.height) * 100;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      ref.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
      const shine = ref.current.querySelector('.card-shine');
      if (shine) shine.style.setProperty('--mx', `${mx}%`);
      if (shine) shine.style.setProperty('--my', `${my}%`);
    });
  }, []);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (ref.current) ref.current.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  return (
    <div style={{ perspective: 900, perspectiveOrigin:'50% 50%' }}>
      <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
        onTouchMove={onMove} onTouchEnd={onLeave}
        style={{ transformStyle:'preserve-3d', transition:'transform 0.08s ease-out',
          borderRadius: 12, position:'relative',
          boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 30px ${rs.glow}`,
        }}
        className={card.rarity === 'L' ? 'glow-L' : card.rarity === 'M' ? 'glow-M' : ''}
      >
        {children}
        <div className="card-shine" style={{ borderRadius: 12 }} />
      </div>
    </div>
  );
}

// ── Wikipedia info panel ────────────────────────────────────────────────────
function WikiPanel({ card, rs, isTF, charImgUrl }) {
  return (
    <div className="slide-up" style={{ animationDelay:'0.1s', width:'100%', display:'flex', flexDirection:'column', gap:14 }}>

      {/* Character spotlight */}
      {card.character && (
        <div style={{
          background: `linear-gradient(135deg, ${card.character.color ?? '#1565c0'}22, transparent)`,
          border: `1px solid ${card.character.color ?? '#1565c0'}44`,
          borderRadius: 12, padding: 14, display:'flex', gap:12, alignItems:'center',
        }}>
          {isTF && charImgUrl && (
            <img src={charImgUrl} alt={card.character.character}
              style={{ width:54, height:54, borderRadius:'50%', objectFit:'cover', flexShrink:0,
                border:`2px solid ${card.character.color ?? '#1565c0'}`,
                boxShadow:`0 4px 16px ${card.character.color ?? '#1565c0'}66` }} />
          )}
          {isTF && !charImgUrl && (
            <div style={{ width:54, height:54, borderRadius:'50%', flexShrink:0,
              background: card.character.color ?? '#1565c0',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, fontWeight:900, color:'rgba(255,255,255,0.9)', fontFamily:'Georgia,serif',
              boxShadow:`0 4px 16px ${card.character.color ?? '#1565c0'}66` }}>
              {card.character.character.charAt(0)}
            </div>
          )}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontFamily:'monospace',
              letterSpacing:'.15em', marginBottom:3 }}>
              {card.character.show.toUpperCase()}
            </div>
            <div style={{ fontSize:16, fontFamily:'Georgia,serif', fontWeight:700,
              color: card.character.color ?? '#c9a833', marginBottom:5 }}>
              {card.character.character}
            </div>
            <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.5)', fontFamily:'monospace',
              lineHeight: 1.5 }}>
              {card.character.note}
            </div>
          </div>
        </div>
      )}

      {/* Wikipedia extract */}
      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
        borderRadius: 10, padding: 14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
          <span style={{ fontSize:14 }}>📖</span>
          <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.3)', fontFamily:'monospace',
            letterSpacing:'.12em', fontWeight:700 }}>WIKIPEDIA</span>
        </div>
        <div style={{ fontSize:11.5, color:'rgba(200,215,230,0.75)', fontFamily:'Georgia,serif',
          fontStyle:'italic', lineHeight:1.7 }}>
          {card.fullExtract || card.extract || 'No description available.'}
        </div>
      </div>

      {/* Meta info */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {card.views > 0 && (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontFamily:'monospace', fontWeight:700,
              color: card.views >= 80000 ? '#e8c040' : card.views >= 18000 ? '#b57bee' : '#4fa8e8' }}>
              {card.views >= 1000000
                ? `${(card.views/1000000).toFixed(1)}M`
                : card.views >= 1000
                ? `${(card.views/1000).toFixed(0)}k`
                : card.views}
            </div>
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:2 }}>
              WIKIPEDIA VIEWS/MO
            </div>
          </div>
        )}
        {card.count > 1 && (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
            <div style={{ fontSize:14, fontFamily:'monospace', fontWeight:700, color:'#c9a833' }}>
              ×{card.count}
            </div>
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:2 }}>
              COPIES OWNED
            </div>
          </div>
        )}
      </div>

      {/* Links */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <a href={card.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            background:'rgba(79,168,232,0.1)', border:'1px solid rgba(79,168,232,0.35)',
            borderRadius:8, padding:'11px', textDecoration:'none',
            color:'#4fa8e8', fontFamily:'monospace', fontSize:10, letterSpacing:'.08em',
            fontWeight:700, transition:'background 0.15s' }}>
          📖 READ ON WIKIPEDIA →
        </a>
        {isTF && card.character && (
          <a href={`https://ttte.fandom.com/wiki/${encodeURIComponent(card.character.character.replace(/ /g,'_'))}`}
            target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              background:`${card.character.color ?? '#b57bee'}18`,
              border:`1px solid ${card.character.color ?? '#b57bee'}44`,
              borderRadius:8, padding:'11px', textDecoration:'none',
              color: card.character.color ?? '#b57bee', fontFamily:'monospace', fontSize:10,
              letterSpacing:'.08em', fontWeight:700 }}>
            🚂 {card.character.character.toUpperCase()} ON FANDOM →
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main Modal ──────────────────────────────────────────────────────────────
export default function CardDetailModal({ card, count, onClose, isFav = false, onFav = null }) {
  const rs    = RARITY[card.rarity] ?? RARITY.C;
  const isTF  = card.character?.show === 'Thomas & Friends';
  const isHigh = card.rarity === 'L' || card.rarity === 'M';

  const [tab,        setTab]      = useState('stats');
  const [showBurst,  setBurst]    = useState(isHigh);
  const [charImg,    setCharImg]  = useState(null);

  // Fetch character image for info panel
  useEffect(() => {
    if (!isTF || !card.character) return;
    fetchFandomCharacterImage(card.character.character, false)
      .then(u => setCharImg(u)).catch(() => {});
  }, [isTF, card.character]);

  useEffect(() => {
    if (showBurst) setTimeout(() => setBurst(false), 900);
  }, [showBurst]);

  // Find top stat
  const topStat = card.stats
    ? STAT_CONFIG.reduce((best, cfg) => {
        const pct = statPercent(cfg.key, card.stats[cfg.key] ?? 0);
        return pct > statPercent(best.key, card.stats[best.key] ?? 0) ? cfg : best;
      }, STAT_CONFIG[0])
    : null;

  // Rarity label with richer badge
  const RarityBadge = () => (
    <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:6 }}>
      <div style={{ background: rs.bg, border:`1px solid ${rs.border}`,
        borderRadius:6, padding:'4px 12px', display:'inline-flex', alignItems:'center', gap:6 }}>
        {Array.from({ length: card.rarity === 'C' ? 1 : card.rarity === 'R' ? 2 : card.rarity === 'E' ? 3 : 4 }).map((_,i) => (
          <span key={i} style={{ color:rs.color, fontSize:12, filter:`drop-shadow(0 0 4px ${rs.glow})` }}>★</span>
        ))}
        <span style={{ color:rs.color, fontFamily:'monospace', fontWeight:700, fontSize:11,
          letterSpacing:'.12em', textShadow:`0 0 8px ${rs.glow}` }}>
          {card.rarity === 'M' ? 'MYTHIC ✦' : rs.name.toUpperCase()}
        </span>
      </div>
      {isFav && <span style={{ fontSize:16 }}>♥</span>}
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(3,6,16,0.92)', zIndex:500,
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'0', overflowY:'auto',
      backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
    }}>
      {/* Close */}
      <button onClick={onClose} style={{
        position:'fixed', top:14, right:14, zIndex:20,
        background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:'50%', width:36, height:36, color:'rgba(255,255,255,0.6)',
        fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        backdropFilter:'blur(8px)',
      }}>×</button>

      <div onClick={e => e.stopPropagation()} style={{
        width:'100%', maxWidth:380, padding:'20px 16px 40px',
        display:'flex', flexDirection:'column', alignItems:'center', gap:16,
        minHeight:'100vh',
      }}>

        {/* Card with 3D tilt + burst particles */}
        <div style={{ position:'relative', marginTop:8 }}
          className={isHigh ? 'legend-burst' : ''}>
          {showBurst && <Particles color={rs.color} count={16} />}

          <TiltCard card={card} rs={rs}>
            {/* The actual card image */}
            <div style={{ width:200, borderRadius:12, overflow:'hidden',
              border:`2px solid ${rs.border}`,
              background: `linear-gradient(180deg, ${rs.bg}, #030610)` }}>
              {/* Rarity header */}
              <div style={{ height:18, background:`linear-gradient(90deg, ${rs.bg}, #030610)`,
                borderBottom:`1px solid ${rs.border}55`,
                display:'flex', alignItems:'center', paddingLeft:8, gap:3 }}>
                {Array.from({ length: Math.min(4, card.rarity === 'C' ? 1 : card.rarity === 'R' ? 2 : card.rarity === 'E' ? 3 : 4) }).map((_,i) => (
                  <span key={i} style={{ color:rs.color, fontSize:9, filter:`drop-shadow(0 0 3px ${rs.glow})` }}>★</span>
                ))}
                <span style={{ flex:1 }} />
                <span style={{ fontSize:9, color:rs.color, fontFamily:'monospace', fontWeight:700,
                  letterSpacing:'.1em', paddingRight:8, textShadow:`0 0 6px ${rs.glow}` }}>
                  {card.rarity === 'M' ? '???' : rs.name.toUpperCase()}
                </span>
              </div>
              {/* Image */}
              <div style={{ height:150, overflow:'hidden', position:'relative', background:'#e8e8e8' }}>
                <img src={card.imageHD ?? card.image} alt={card.title}
                  style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                {(card.rarity === 'L' || card.rarity === 'M') && (
                  <div style={{ position:'absolute', inset:0,
                    background: card.rarity === 'M'
                      ? 'linear-gradient(135deg,rgba(80,60,255,0.15),rgba(60,180,255,0.1),rgba(255,100,200,0.15))'
                      : 'linear-gradient(135deg,rgba(255,215,0,0.12),transparent,rgba(255,165,0,0.12))',
                    animation:'holo-shift 3s ease-in-out infinite' }} />
                )}
              </div>
              {/* Title */}
              <div style={{ padding:'10px 10px 4px' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#f0e8d8', fontFamily:'Georgia,serif',
                  lineHeight:1.25, marginBottom:4, minHeight:32 }}>
                  {card.title}
                </div>
                {card.stats && (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    paddingBottom:8, borderBottom:`1px solid ${rs.border}33` }}>
                    <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.3)', fontFamily:'monospace' }}>OVERALL</span>
                    <span style={{ fontSize:18, fontWeight:800, fontFamily:'monospace',
                      color:rs.color, textShadow:`0 0 10px ${rs.glow}` }}>
                      {card.stats.overall}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TiltCard>
        </div>

        <RarityBadge />

        {/* Fav + Tab row */}
        <div style={{ display:'flex', gap:8, width:'100%' }}>
          {onFav && (
            <button onClick={() => onFav()} style={{
              width:44, height:36, borderRadius:8, cursor:'pointer',
              background: isFav ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.04)',
              border:`1px solid ${isFav ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: isFav ? '#ff6b6b' : 'rgba(255,255,255,0.35)', fontSize:18, flexShrink:0,
            }}>{isFav ? '♥' : '♡'}</button>
          )}
          <div style={{ display:'flex', flex:1, borderRadius:8, overflow:'hidden',
            border:`1px solid ${rs.border}44` }}>
            {[['stats','📊 STATS'],['info','📖 INFO']].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex:1, padding:'8px 4px', background: tab === t ? rs.bg : 'rgba(255,255,255,0.02)',
                border:'none', cursor:'pointer', fontSize:9, color: tab === t ? rs.color : 'rgba(255,255,255,0.3)',
                fontFamily:'monospace', fontWeight:700, letterSpacing:'.08em', transition:'all 0.15s',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* ── Stats Tab ── */}
        {tab === 'stats' && card.stats && (
          <div className="slide-up" style={{ width:'100%' }}>
            {/* Overall score ring */}
            <div style={{ textAlign:'center', marginBottom:20, position:'relative' }}>
              <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center',
                background:`radial-gradient(circle, ${rs.bg} 0%, transparent 70%)`,
                padding:'16px 32px', borderRadius:16 }}>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
                  letterSpacing:'.2em', marginBottom:4 }}>OVERALL POWER</div>
                <div style={{ fontSize:56, fontWeight:900, fontFamily:'Georgia,serif', lineHeight:1,
                  color:rs.color, textShadow:`0 0 24px ${rs.glow}, 0 0 48px ${rs.glow}55`,
                  animation:'countUp 0.5s ease-out both' }}>
                  {card.stats.overall}
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>/ 100</div>
              </div>
            </div>

            {/* Stat rows */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${rs.border}33`,
              borderRadius:12, padding:'16px 14px' }}>
              {STAT_CONFIG.map((cfg, i) => (
                <StatRow key={cfg.key} cfg={cfg}
                  value={card.stats[cfg.key] ?? 0}
                  delay={0.1 + i * 0.09}
                  maxVal={cfg.max}
                  isTop={topStat?.key === cfg.key} />
              ))}
              <div style={{ fontSize:8, color:'rgba(255,255,255,0.15)', fontFamily:'monospace',
                textAlign:'center', paddingTop:8, borderTop:`1px solid rgba(255,255,255,0.06)`,
                lineHeight:1.6 }}>
                Stats are deterministic — seeded from article title.
                Any player who pulls this card gets identical stats.
              </div>
            </div>
          </div>
        )}

        {/* ── Info Tab ── */}
        {tab === 'info' && (
          <WikiPanel card={card} rs={rs} isTF={isTF} charImgUrl={charImg} />
        )}
      </div>
    </div>
  );
}
