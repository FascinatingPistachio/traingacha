/**
 * RailCard.jsx — Marvel Snap-style trading card component.
 *
 * Design principles:
 *  - NO fixed pixel height arithmetic — uses aspect-ratio + flex
 *  - Real 3D mouse-tracking tilt via CSS custom properties + transform
 *  - Holographic foil effect that follows mouse position
 *  - Robust image handling with proper loading/error states
 *  - Works identically in collection grid, opening screen, and battle
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent } from '../utils/stats.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';
import { fetchWikiThumbnail } from '../utils/wikiImage.js';

// ─── Rarity visual config ───────────────────────────────────────────────────
const RARITY_FRAME = {
  C: { headerBg:'#111e2d', bodyBg:'#0a1520' },
  R: { headerBg:'#071020', bodyBg:'#050e1c' },
  E: { headerBg:'#120620', bodyBg:'#0d0418' },
  L: { headerBg:'#1c0e00', bodyBg:'#140a00' },
  M: { headerBg:'#08050f', bodyBg:'#030208' },
};

// ─── Reliable image with loading + error states ─────────────────────────────
function CardImg({ src, title, alt }) {
  const [url,     setUrl]     = useState(src || null);
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);

  // If src changes (e.g. card swapped), reset
  useEffect(() => {
    setUrl(src || null);
    setLoaded(false);
    setErrored(false);
  }, [src]);

  // If src is null, try fetching from Wikipedia
  useEffect(() => {
    if (src || !title) return;
    let cancelled = false;
    fetchWikiThumbnail(title, 400).then(u => {
      if (!cancelled) { setUrl(u); setLoaded(false); setErrored(false); }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [src, title]);

  const handleError = () => {
    setErrored(true);
    setLoaded(false);
  };

  return (
    <div style={{ position:'absolute', inset:0, background:'#1a2535', overflow:'hidden' }}>
      {/* Loading spinner */}
      {url && !loaded && !errored && (
        <div style={{ position:'absolute', inset:0, display:'flex',
          alignItems:'center', justifyContent:'center',
          background:'linear-gradient(135deg,#1a2535,#0d1822)' }}>
          <div style={{ width:18, height:18, borderRadius:'50%',
            border:'2px solid rgba(255,255,255,0.1)',
            borderTop:'2px solid rgba(255,255,255,0.45)',
            animation:'spin 0.75s linear infinite' }} />
        </div>
      )}
      {/* Error / no-image placeholder */}
      {(!url || errored) && (
        <div style={{ position:'absolute', inset:0, display:'flex',
          alignItems:'center', justifyContent:'center',
          background:'linear-gradient(135deg,#151f2e,#0d1520)' }}>
          <svg width="38" height="22" viewBox="0 0 80 46" fill="none">
            <rect x="6" y="14" width="52" height="22" rx="5" fill="rgba(255,255,255,0.07)"/>
            <rect x="52" y="8" width="22" height="28" rx="4" fill="rgba(255,255,255,0.05)"/>
            <circle cx="20" cy="38" r="8" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5"/>
            <circle cx="42" cy="38" r="8" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5"/>
          </svg>
        </div>
      )}
      {/* Actual image */}
      {url && !errored && (
        <img src={url} alt={alt}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', display:'block',
            opacity: loaded ? 1 : 0, transition:'opacity 0.35s ease-out' }} />
      )}
    </div>
  );
}

// ─── Thomas & Friends character badge ───────────────────────────────────────
function CharBadge({ character }) {
  const [url,  setUrl]  = useState(null);
  const [ok,   setOk]   = useState(false);
  useEffect(() => {
    if (!character?.character) return;
    let cancelled = false;
    fetchFandomCharacterImage(character.character, false)
      .then(u => { if (!cancelled) setUrl(u); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [character?.character]);

  const col = character?.color ?? '#1565c0';
  const init = (character?.character ?? '?').charAt(0);

  return (
    <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0,
      background:col, border:'2px solid rgba(255,255,255,0.85)',
      boxShadow:`0 2px 10px ${col}88`,
      overflow:'hidden', position:'relative',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:13, fontWeight:900, color:'rgba(255,255,255,0.9)',
        fontFamily:'Georgia,serif', position:'absolute' }}>{init}</span>
      {url && (
        <img src={url} alt={character?.character}
          onLoad={() => setOk(true)}
          onError={() => setUrl(null)}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity: ok ? 1 : 0, transition:'opacity 0.3s' }} />
      )}
    </div>
  );
}

// ─── Holographic overlay — moves with mouse ──────────────────────────────────
function HoloLayer({ rarity }) {
  if (rarity !== 'L' && rarity !== 'M') return null;
  const isM = rarity === 'M';
  return (
    <div aria-hidden style={{
      position:'absolute', inset:0, pointerEvents:'none', zIndex:10,
      borderRadius:'inherit', mixBlendMode:'color-dodge',
      background: isM
        ? 'linear-gradient(135deg,#ff6ec7 0%,#7b2fff 25%,#00d4ff 50%,#0fff89 75%,#ff6ec7 100%)'
        : 'linear-gradient(135deg,#ffd700 0%,#ffaa00 30%,#ffe066 60%,#ffd700 100%)',
      backgroundSize:'200% 200%',
      backgroundPosition:'var(--hx,50%) var(--hy,50%)',
      opacity: 'var(--ho,0)',
      transition:'opacity 0.2s',
    }} />
  );
}

// ─── Main RailCard ───────────────────────────────────────────────────────────
export default function RailCard({
  card,
  size = 'md',         // 'sm' | 'md' | 'lg'
  count = 0,
  dimmed = false,
  onClick = null,
  isFav = false,
  onFav = null,
}) {
  const ref = useRef(null);
  const raf = useRef(null);
  const rs  = RARITY[card?.rarity] ?? RARITY.C;
  const fr  = RARITY_FRAME[card?.rarity] ?? RARITY_FRAME.C;
  const isTF    = card?.character?.show === 'Thomas & Friends';
  const isHigh  = card?.rarity === 'L' || card?.rarity === 'M';
  const stats   = card?.stats;
  const starCount = card?.rarity === 'C' ? 1 : card?.rarity === 'R' ? 2
    : card?.rarity === 'E' ? 3 : 4;

  const W = size === 'sm' ? 128 : size === 'lg' ? 200 : 160;

  // ─ 3D tilt + holographic mouse tracking ─────────────────────────────────
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el || dimmed) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r  = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;   // 0..1
      const ny = (e.clientY - r.top)  / r.height;  // 0..1
      const rx = (ny - 0.5) * -18;  // tilt X axis
      const ry = (nx - 0.5) *  18;  // tilt Y axis
      el.style.transform =
        `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06) translateZ(10px)`;
      el.style.setProperty('--hx', `${nx * 100}%`);
      el.style.setProperty('--hy', `${ny * 100}%`);
      el.style.setProperty('--ho', isHigh ? '0.18' : '0.06');
      // Shine spot
      const shine = el.querySelector('.card-shine-spot');
      if (shine) {
        shine.style.opacity = '1';
        shine.style.setProperty('--sx', `${nx * 100}%`);
        shine.style.setProperty('--sy', `${ny * 100}%`);
      }
    });
  }, [dimmed, isHigh]);

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)';
    el.style.setProperty('--ho', '0');
    const shine = el.querySelector('.card-shine-spot');
    if (shine) shine.style.opacity = '0';
  }, []);

  const topStat = stats
    ? STAT_CONFIG.reduce((best, cfg) =>
        statPercent(cfg.key, stats[cfg.key] ?? 0) >
        statPercent(best.key, stats[best.key] ?? 0) ? cfg : best,
        STAT_CONFIG[0])
    : null;

  const barsToShow = size === 'sm' ? 3 : 4;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        width: W,
        borderRadius: 10,
        overflow: 'hidden',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        opacity: dimmed ? 0.4 : 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        border: `1.5px solid ${rs.border}`,
        background: fr.bodyBg,
        boxShadow: isHigh
          ? `0 0 22px ${rs.glow}, 0 6px 28px rgba(0,0,0,0.75)`
          : '0 4px 18px rgba(0,0,0,0.6)',
        transition: 'transform 0.12s ease-out, box-shadow 0.2s',
        userSelect: 'none',
        willChange: 'transform',
      }}
    >
      {/* Holographic foil */}
      <HoloLayer rarity={card?.rarity} />

      {/* Shine spot */}
      <div className="card-shine-spot" aria-hidden style={{
        position:'absolute', inset:0, zIndex:11, pointerEvents:'none',
        borderRadius:'inherit', opacity:0, transition:'opacity 0.15s',
        background:'radial-gradient(ellipse 60% 50% at var(--sx,50%) var(--sy,50%),' +
          'rgba(255,255,255,0.22) 0%,transparent 70%)',
      }} />

      {/* ── Header strip ─────────────────────────────────────────────────── */}
      <div style={{
        background: fr.headerBg,
        borderBottom: `1px solid ${rs.border}55`,
        padding: '4px 8px',
        display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0,
      }}>
        {Array.from({length: starCount}).map((_, i) => (
          <span key={i} style={{ fontSize: 8, color: rs.color, lineHeight:1,
            filter:`drop-shadow(0 0 3px ${rs.glow})` }}>★</span>
        ))}
        <span style={{ flex:1 }} />
        <span style={{ fontSize: 7.5, color: rs.color, fontFamily:'monospace',
          fontWeight:700, letterSpacing:'.1em',
          textShadow:`0 0 6px ${rs.glow}` }}>
          {card?.rarity === 'M' ? '✦ ???' : rs.name.toUpperCase()}
        </span>
      </div>

      {/* ── Photo area ───────────────────────────────────────────────────── */}
      <div style={{ position:'relative', aspectRatio:'1.1/1', flexShrink:0 }}>
        <CardImg src={card?.image} title={card?.title} alt={card?.title} />

        {/* Bottom fade into body */}
        <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:36,
          background:`linear-gradient(transparent, ${fr.bodyBg})`, pointerEvents:'none', zIndex:2 }} />

        {/* Thomas & Friends banner */}
        {isTF && card?.character && (
          <div style={{
            position:'absolute', bottom:0, left:0, right:0,
            height: 28,
            background: card.character.color ?? '#1565c0',
            display:'flex', alignItems:'center', gap:7,
            paddingLeft: 42, paddingRight:6, zIndex:3,
            boxShadow:'0 -2px 12px rgba(0,0,0,0.6)',
          }}>
            <div style={{ position:'absolute', left:5, bottom:4, zIndex:4 }}>
              <CharBadge character={card.character} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize: 6.5, color:'rgba(255,255,255,0.65)',
                fontFamily:'monospace', letterSpacing:'.08em', lineHeight:1 }}>
                {card.character.show.toUpperCase()}
              </div>
              <div style={{ fontSize: size === 'sm' ? 8 : 9.5, color:'#fff',
                fontWeight:700, fontFamily:'Georgia,serif',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {card.character.character}
              </div>
            </div>
          </div>
        )}

        {/* Non-TF character dot */}
        {card?.character && !isTF && (
          <div style={{
            position:'absolute', top:4, right:4, zIndex:4,
            width:22, height:22, borderRadius:'50%',
            background: card.character.color ?? '#4b5563',
            border:'2px solid rgba(255,255,255,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 8px rgba(0,0,0,0.7)',
          }}>
            <span style={{ fontSize:9, fontWeight:800, color:'#fff', fontFamily:'monospace' }}>
              {card.character.character.charAt(0)}
            </span>
          </div>
        )}

        {/* Dup badge */}
        {count > 1 && (
          <div style={{ position:'absolute', top:4, left:4, zIndex:4,
            background:'rgba(0,0,0,0.85)', border:`1px solid ${rs.border}`,
            borderRadius:4, padding:'1px 6px', fontSize:7.5,
            color:rs.color, fontFamily:'monospace', fontWeight:700 }}>
            ×{count}
          </div>
        )}

        {/* Fav */}
        {onFav && (
          <button
            onClick={e => { e.stopPropagation(); onFav(); }}
            style={{
              position:'absolute', zIndex:5,
              bottom: isTF ? 30 : 4, right:4,
              width:18, height:18, borderRadius:'50%', cursor:'pointer',
              background:'rgba(0,0,0,0.75)',
              border:`1px solid ${isFav ? 'rgba(255,80,80,0.7)' : 'rgba(255,255,255,0.18)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:9, color: isFav ? '#ff6b6b' : 'rgba(255,255,255,0.35)',
            }}>
            {isFav ? '♥' : '♡'}
          </button>
        )}
      </div>

      {/* ── Info body ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '7px 8px 8px', display:'flex', flexDirection:'column', gap:4 }}>
        {/* Divider */}
        <div style={{ height:1,
          background:`linear-gradient(90deg,transparent,${rs.border},transparent)`,
          marginBottom:1 }} />

        {/* Title */}
        <div style={{
          fontSize: size === 'sm' ? 8.5 : 10,
          fontWeight:700, color:'#f0e8d8', fontFamily:'Georgia,serif',
          lineHeight:1.25, overflow:'hidden',
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
        }}>
          {card?.title ?? '—'}
        </div>

        {/* Stat bars — Top Trumps style */}
        {stats && (
          <div style={{ display:'flex', flexDirection:'column', gap: size==='sm' ? 2 : 3 }}>
            {STAT_CONFIG.slice(0, barsToShow).map(cfg => {
              const val  = stats[cfg.key] ?? 0;
              const pct  = statPercent(cfg.key, val);
              const top  = topStat?.key === cfg.key;
              return (
                <div key={cfg.key} style={{ display:'flex', alignItems:'center', gap:3 }}>
                  <span style={{ fontSize:9, width:13, textAlign:'center', lineHeight:1 }}>
                    {cfg.icon}
                  </span>
                  <div style={{ flex:1, height:3.5, background:'rgba(255,255,255,0.08)',
                    borderRadius:2, overflow:'hidden' }}>
                    <div style={{
                      width:`${pct}%`, height:'100%', borderRadius:2,
                      background: top ? cfg.color : `${cfg.color}66`,
                      boxShadow: top ? `0 0 5px ${cfg.color}` : 'none',
                    }} />
                  </div>
                  <span style={{
                    fontSize:7.5, fontFamily:'monospace', lineHeight:1,
                    color: top ? cfg.color : 'rgba(255,255,255,0.35)',
                    width:24, textAlign:'right', fontWeight: top ? 700 : 400,
                  }}>
                    {cfg.key === 'speed' ? val
                      : cfg.key === 'power' && val >= 1000 ? `${(val/1000).toFixed(0)}k`
                      : val}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer: views + overall */}
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'center', marginTop:1 }}>
          <span style={{ fontSize:7, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>
            {card?.views > 0
              ? card.views >= 1000
                ? `${(card.views/1000).toFixed(0)}k/mo`
                : `${card.views}/mo`
              : ''}
          </span>
          {stats && (
            <span style={{ fontSize: size === 'sm' ? 11 : 13, fontWeight:900,
              fontFamily:'monospace', color:rs.color,
              textShadow:`0 0 8px ${rs.glow}` }}>
              {stats.overall}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
