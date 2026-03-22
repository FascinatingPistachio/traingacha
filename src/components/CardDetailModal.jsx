import { useState, useEffect, useRef, useCallback } from 'react';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent, formatStat } from '../utils/stats.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';

// ── Safe image with error state ─────────────────────────────────────────────
function SafeImg({ src, alt, style, fallbackStyle }) {
  const [state, setState] = useState('loading'); // loading | ok | error
  useEffect(() => { setState('loading'); }, [src]);
  if (!src || state === 'error') {
    return (
      <div style={{ ...style, ...fallbackStyle,
        display:'flex', alignItems:'center', justifyContent:'center',
        background: fallbackStyle?.background ?? '#1a2535' }}>
        <svg width="48" height="28" viewBox="0 0 80 42" fill="none">
          <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(255,255,255,0.1)"/>
          <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(255,255,255,0.07)"/>
          <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
          <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
        </svg>
      </div>
    );
  }
  return (
    <>
      {state === 'loading' && (
        <div style={{ ...style, background:'#1a2535',
          display:'flex', alignItems:'center', justifyContent:'center',
          position:'absolute', inset:0 }}>
          <div style={{ width:20, height:20, borderRadius:'50%',
            border:'2px solid rgba(255,255,255,0.1)',
            borderTop:'2px solid rgba(255,255,255,0.5)',
            animation:'spin 0.75s linear infinite' }} />
        </div>
      )}
      <img
        src={src} alt={alt}
        onLoad={() => setState('ok')}
        onError={() => setState('error')}
        style={{ ...style, opacity: state === 'ok' ? 1 : 0, transition:'opacity 0.3s' }}
      />
    </>
  );
}

// ── Particle burst ──────────────────────────────────────────────────────────
function Sparks({ color }) {
  const sparks = Array.from({length:14}, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const d = 45 + Math.random() * 55;
    return {
      sx: `${Math.cos(a) * d}px`,
      sy: `${Math.sin(a) * d}px`,
      c:  i % 3 === 0 ? '#fff' : color,
      delay: `${(Math.random() * 0.25).toFixed(2)}s`,
      size: 4 + Math.random() * 4,
    };
  });
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none',
      overflow:'visible', zIndex:50 }}>
      {sparks.map((s, i) => (
        <div key={i} className="spark" style={{
          '--sx': s.sx, '--sy': s.sy,
          position:'absolute', top:'50%', left:'50%',
          width:s.size, height:s.size,
          borderRadius:'50%',
          background: s.c,
          boxShadow:`0 0 6px ${s.c}`,
          animationDelay: s.delay,
        }} />
      ))}
    </div>
  );
}

// ── 3D tilt wrapper ─────────────────────────────────────────────────────────
function TiltWrap({ children, rs, rarity }) {
  const ref = useRef(null);
  const raf = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r  = el.getBoundingClientRect();
      const cx = (e.clientX ?? e.touches?.[0]?.clientX ?? r.left + r.width/2) - r.left;
      const cy = (e.clientY ?? e.touches?.[0]?.clientY ?? r.top  + r.height/2) - r.top;
      const rx = (cy / r.height - 0.5) * -16;
      const ry = (cx / r.width  - 0.5) *  16;
      const mx = (cx / r.width)  * 100;
      const my = (cy / r.height) * 100;
      ref.current.style.transform =
        `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04) translateZ(12px)`;
      const shine = ref.current.querySelector('.modal-shine');
      if (shine) {
        shine.style.setProperty('--mx', `${mx}%`);
        shine.style.setProperty('--my', `${my}%`);
        shine.style.opacity = '1';
      }
    });
  }, []);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (ref.current) ref.current.style.transform =
      'rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)';
    const shine = ref.current?.querySelector('.modal-shine');
    if (shine) shine.style.opacity = '0';
  }, []);

  return (
    <div style={{ perspective: 900 }}>
      <div
        ref={ref}
        onMouseMove={onMove} onMouseLeave={onLeave}
        onTouchMove={onMove} onTouchEnd={onLeave}
        style={{
          transformStyle:'preserve-3d',
          transition:'transform 0.1s ease-out',
          borderRadius:12, position:'relative',
          boxShadow:`0 24px 60px rgba(0,0,0,0.8), 0 0 40px ${rs.glow}55`,
        }}
        className={rarity === 'L' ? 'glow-L' : rarity === 'M' ? 'glow-M' : ''}
      >
        {children}
        {/* Shine */}
        <div className="modal-shine" style={{
          position:'absolute', inset:0, borderRadius:'inherit',
          pointerEvents:'none', zIndex:30, opacity:0,
          transition:'opacity 0.15s',
          background:'radial-gradient(ellipse at var(--mx,50%) var(--my,50%),rgba(255,255,255,0.25) 0%,transparent 65%)',
        }} />
        {/* Holographic foil */}
        {(rarity === 'L' || rarity === 'M') && (
          <div className={rarity === 'M' ? 'tc-foil-M' : 'tc-foil-L'}
            style={{ position:'absolute', inset:0, zIndex:20,
              pointerEvents:'none', borderRadius:'inherit', mixBlendMode:'overlay' }} />
        )}
      </div>
    </div>
  );
}

// ── Animated stat row ───────────────────────────────────────────────────────
function StatRow({ cfg, value, delay, isTop }) {
  const pct = statPercent(cfg.key, value);
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:5 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:17 }}>{cfg.icon}</span>
          <span style={{ fontSize:10.5, fontFamily:'monospace', fontWeight:700,
            letterSpacing:'.1em',
            color: isTop ? cfg.color : 'rgba(255,255,255,0.5)' }}>
            {cfg.label}
          </span>
          {isTop && (
            <span style={{ fontSize:7.5, background:`${cfg.color}22`, color:cfg.color,
              border:`1px solid ${cfg.color}55`, borderRadius:3, padding:'1px 5px',
              fontFamily:'monospace', fontWeight:700 }}>TOP</span>
          )}
        </div>
        <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:800,
          color: isTop ? cfg.color : '#f0e8d8',
          textShadow: isTop ? `0 0 10px ${cfg.color}88` : 'none',
          animation:'countUp 0.35s ease-out both',
          animationDelay:`${delay}s` }}>
          {formatStat(cfg.key, value)}
        </span>
      </div>
      <div style={{ height:7, background:'rgba(255,255,255,0.06)', borderRadius:4,
        overflow:'hidden', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.4)' }}>
        <div className="stat-bar-fill" style={{
          '--w': `${pct}%`, '--delay': `${delay}s`,
          height:'100%', borderRadius:4,
          background: isTop
            ? `linear-gradient(90deg, ${cfg.color}99, ${cfg.color})`
            : `linear-gradient(90deg, ${cfg.color}55, ${cfg.color}88)`,
          boxShadow: isTop ? `0 0 10px ${cfg.color}77` : 'none',
          position:'relative', overflow:'hidden',
        }}>
          {isTop && (
            <div style={{ position:'absolute', inset:0,
              background:'linear-gradient(90deg,transparent 50%,rgba(255,255,255,0.3))',
              animation:'shimmer 1.8s linear infinite',
              backgroundSize:'200% 100%' }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Character portrait in info panel ───────────────────────────────────────
function CharPortrait({ character, url }) {
  const [ok, setOk] = useState(false);
  const col = character.color ?? '#1565c0';
  return (
    <div style={{ width:56, height:56, borderRadius:'50%', overflow:'hidden',
      background:col, flexShrink:0,
      border:`2.5px solid ${col}`, boxShadow:`0 4px 18px ${col}66`,
      position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:22, fontWeight:900, color:'rgba(255,255,255,0.9)',
        fontFamily:'Georgia,serif' }}>{character.character.charAt(0)}</span>
      {url && (
        <img src={url} alt={character.character}
          onLoad={() => setOk(true)}
          onError={() => {}}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity: ok ? 1 : 0, transition:'opacity 0.3s' }} />
      )}
    </div>
  );
}

// ── Main Modal ──────────────────────────────────────────────────────────────
export default function CardDetailModal({ card, count, onClose, isFav = false, onFav = null }) {
  const rs     = RARITY[card.rarity] ?? RARITY.C;
  const isTF   = card.character?.show === 'Thomas & Friends';
  const isHigh = card.rarity === 'L' || card.rarity === 'M';

  const [tab,       setTab]      = useState('stats');
  const [showSparks,setShowSparks] = useState(isHigh);
  const [charImg,   setCharImg]  = useState(null);

  useEffect(() => {
    if (showSparks) {
      const t = setTimeout(() => setShowSparks(false), 900);
      return () => clearTimeout(t);
    }
  }, [showSparks]);

  // Fetch character image (fixed: has dependency array)
  useEffect(() => {
    if (!isTF || !card.character) return;
    let cancelled = false;
    fetchFandomCharacterImage(card.character.character, false)
      .then(u => { if (!cancelled) setCharImg(u); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isTF, card.character?.character]); // ← correct dependency

  // Top stat
  const topStat = card.stats
    ? STAT_CONFIG.reduce((best, cfg) => {
        const pct = statPercent(cfg.key, card.stats[cfg.key] ?? 0);
        return pct > statPercent(best.key, card.stats[best.key] ?? 0) ? cfg : best;
      }, STAT_CONFIG[0])
    : null;

  const starCount = card.rarity === 'C' ? 1 : card.rarity === 'R' ? 2
    : card.rarity === 'E' ? 3 : 4;

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:500,
        background:'rgba(3,6,16,0.92)',
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
        display:'flex', flexDirection:'column', alignItems:'center',
        overflowY:'auto', overflowX:'hidden',
        animation:'backdropIn 0.2s ease-out both',
      }}
    >
      {/* Close button */}
      <button onClick={onClose} style={{
        position:'fixed', top:14, right:14, zIndex:600,
        background:'rgba(255,255,255,0.07)',
        border:'1px solid rgba(255,255,255,0.15)',
        borderRadius:'50%', width:36, height:36,
        color:'rgba(255,255,255,0.65)', fontSize:18, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>×</button>

      <div
        onClick={e => e.stopPropagation()}
        style={{ width:'100%', maxWidth:380, padding:'22px 16px 48px',
          display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}
      >
        {/* 3D card */}
        <div style={{ position:'relative', marginTop:4 }}
          className={isHigh ? 'legend-burst' : 'slide-up'}>
          {showSparks && <Sparks color={rs.color} />}

          <TiltWrap rs={rs} rarity={card.rarity}>
            {/* Card face */}
            <div style={{ width:190, borderRadius:12, overflow:'hidden',
              border:`2px solid ${rs.border}`,
              background:`linear-gradient(180deg, ${rs.bg} 0%, #030610 100%)` }}>

              {/* Rarity header */}
              <div style={{ height:17,
                background:`linear-gradient(90deg, ${rs.bg}, rgba(0,0,0,0))`,
                borderBottom:`1px solid ${rs.border}44`,
                display:'flex', alignItems:'center', paddingLeft:7, gap:2 }}>
                {Array.from({length:starCount}).map((_,i)=>(
                  <span key={i} style={{fontSize:8,color:rs.color,
                    filter:`drop-shadow(0 0 3px ${rs.glow})`}}>★</span>
                ))}
                <span style={{flex:1}}/>
                <span style={{fontSize:8,color:rs.color,fontFamily:'monospace',
                  fontWeight:700,letterSpacing:'.1em',paddingRight:7,
                  textShadow:`0 0 6px ${rs.glow}`}}>
                  {card.rarity==='M'?'???':rs.name.toUpperCase()}
                </span>
              </div>

              {/* Image — proper loading/error state */}
              <div style={{ height:140, position:'relative', overflow:'hidden',
                background: rs.bg }}>
                <SafeImg
                  src={card.imageHD ?? card.image}
                  alt={card.title}
                  fallbackStyle={{ background: rs.bg }}
                  style={{ width:'100%', height:'100%', objectFit:'cover',
                    display:'block', position:'absolute', inset:0 }}
                />
                {/* Holo overlay on image */}
                {isHigh && (
                  <div style={{ position:'absolute', inset:0, pointerEvents:'none',
                    background: card.rarity === 'M'
                      ? 'linear-gradient(135deg,rgba(80,60,255,0.12),rgba(60,180,255,0.08),rgba(255,100,200,0.12))'
                      : 'linear-gradient(135deg,rgba(255,215,0,0.10),transparent,rgba(255,165,0,0.10))',
                    animation:'holo-shift 3s ease-in-out infinite' }} />
                )}
              </div>

              {/* Title + overall */}
              <div style={{ padding:'9px 10px 10px' }}>
                <div style={{ fontSize:12.5, fontWeight:700, color:'#f0e8d8',
                  fontFamily:'Georgia,serif', lineHeight:1.25, marginBottom:6 }}>
                  {card.title}
                </div>
                {card.stats && (
                  <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', borderTop:`1px solid ${rs.border}33`, paddingTop:6 }}>
                    <span style={{fontSize:8,color:'rgba(255,255,255,0.25)',
                      fontFamily:'monospace'}}>OVERALL</span>
                    <span style={{fontSize:20,fontWeight:900,fontFamily:'monospace',
                      color:rs.color,textShadow:`0 0 12px ${rs.glow}`}}>
                      {card.stats.overall}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TiltWrap>
        </div>

        {/* Fav + Tab switcher */}
        <div style={{ display:'flex', gap:8, width:'100%' }}>
          {onFav && (
            <button onClick={onFav} style={{
              width:42, flexShrink:0, borderRadius:8, cursor:'pointer',
              background: isFav?'rgba(255,80,80,0.15)':'rgba(255,255,255,0.04)',
              border:`1px solid ${isFav?'rgba(255,80,80,0.5)':'rgba(255,255,255,0.1)'}`,
              color: isFav?'#ff6b6b':'rgba(255,255,255,0.3)', fontSize:18,
            }}>{isFav?'♥':'♡'}</button>
          )}
          <div style={{ display:'flex', flex:1, borderRadius:8,
            overflow:'hidden', border:`1px solid ${rs.border}44` }}>
            {[['stats','📊 STATS'],['info','📖 INFO']].map(([t,lbl]) => (
              <button key={t} onClick={()=>setTab(t)} style={{
                flex:1, padding:'9px 4px', background: tab===t ? rs.bg : 'rgba(0,0,0,0.2)',
                border:'none', cursor:'pointer', fontSize:9,
                color: tab===t ? rs.color : 'rgba(255,255,255,0.3)',
                fontFamily:'monospace', fontWeight:700, letterSpacing:'.08em',
                transition:'all 0.15s',
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* ── STATS TAB ── */}
        {tab === 'stats' && card.stats && (
          <div className="slide-up" style={{ width:'100%' }}>
            {/* Big overall number */}
            <div style={{ textAlign:'center', marginBottom:18 }}>
              <div style={{ display:'inline-flex', flexDirection:'column',
                alignItems:'center', padding:'14px 40px', borderRadius:14,
                background:`radial-gradient(ellipse at 50% 50%, ${rs.bg} 0%, transparent 80%)`,
                border:`1px solid ${rs.border}33` }}>
                <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.25)',
                  fontFamily:'monospace', letterSpacing:'.2em', marginBottom:3 }}>
                  OVERALL POWER
                </div>
                <div style={{ fontSize:54, fontWeight:900, fontFamily:'Georgia,serif',
                  lineHeight:1, color:rs.color,
                  textShadow:`0 0 28px ${rs.glow}, 0 0 56px ${rs.glow}44`,
                  animation:'countUp 0.4s ease-out both' }}>
                  {card.stats.overall}
                </div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.18)',
                  fontFamily:'monospace', marginTop:2 }}>/ 100</div>
              </div>
            </div>

            {/* Stat bars */}
            <div style={{ background:'rgba(255,255,255,0.02)',
              border:`1px solid ${rs.border}33`, borderRadius:12,
              padding:'14px 14px 4px' }}>
              {STAT_CONFIG.map((cfg, i) => (
                <StatRow key={cfg.key} cfg={cfg}
                  value={card.stats[cfg.key] ?? 0}
                  delay={0.08 + i * 0.09}
                  isTop={topStat?.key === cfg.key} />
              ))}
              <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.12)',
                fontFamily:'monospace', textAlign:'center', paddingBottom:10,
                borderTop:`1px solid rgba(255,255,255,0.05)`, paddingTop:8, lineHeight:1.6 }}>
                Stats seeded from article title — identical for all players
              </div>
            </div>
          </div>
        )}

        {/* ── INFO TAB ── */}
        {tab === 'info' && (
          <div className="slide-up" style={{ width:'100%', display:'flex',
            flexDirection:'column', gap:12 }}>

            {/* Character block */}
            {card.character && (
              <div style={{
                background:`linear-gradient(135deg, ${card.character.color??'#1565c0'}1a, transparent)`,
                border:`1px solid ${card.character.color??'#1565c0'}44`,
                borderRadius:12, padding:14,
                display:'flex', gap:12, alignItems:'flex-start' }}>
                <CharPortrait character={card.character} url={isTF ? charImg : null} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.28)',
                    fontFamily:'monospace', letterSpacing:'.15em', marginBottom:3 }}>
                    {card.character.show.toUpperCase()}
                  </div>
                  <div style={{ fontSize:15, fontFamily:'Georgia,serif', fontWeight:700,
                    color: card.character.color ?? '#c9a833', marginBottom:5 }}>
                    {card.character.character}
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)',
                    fontFamily:'monospace', lineHeight:1.55 }}>
                    {card.character.note}
                  </div>
                </div>
              </div>
            )}

            {/* Wikipedia extract */}
            <div style={{ background:'rgba(255,255,255,0.03)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:10, padding:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:9 }}>
                <span style={{ fontSize:13 }}>📖</span>
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.3)',
                  fontFamily:'monospace', letterSpacing:'.12em', fontWeight:700 }}>
                  WIKIPEDIA
                </span>
              </div>
              <div style={{ fontSize:11, color:'rgba(200,215,230,0.72)',
                fontFamily:'Georgia,serif', fontStyle:'italic', lineHeight:1.7 }}>
                {card.fullExtract || card.extract || 'No description available.'}
              </div>
            </div>

            {/* Meta grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {card.views > 0 && (
                <div style={{ background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:13, fontFamily:'monospace', fontWeight:700,
                    color: card.views >= 80000 ? '#e8c040'
                         : card.views >= 18000 ? '#b57bee' : '#4fa8e8' }}>
                    {card.views >= 1000000 ? `${(card.views/1000000).toFixed(1)}M`
                      : card.views >= 1000 ? `${(card.views/1000).toFixed(0)}k`
                      : card.views}
                  </div>
                  <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.2)',
                    fontFamily:'monospace', marginTop:2 }}>VIEWS/MO</div>
                </div>
              )}
              {(count ?? 1) > 1 && (
                <div style={{ background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:13, fontFamily:'monospace',
                    fontWeight:700, color:'#c9a833' }}>×{count}</div>
                  <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.2)',
                    fontFamily:'monospace', marginTop:2 }}>COPIES</div>
                </div>
              )}
            </div>

            {/* Links */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {card.url && (
                <a href={card.url} target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center',
                    gap:7, background:'rgba(79,168,232,0.1)',
                    border:'1px solid rgba(79,168,232,0.35)',
                    borderRadius:8, padding:'11px 14px', textDecoration:'none',
                    color:'#4fa8e8', fontFamily:'monospace', fontSize:9.5,
                    letterSpacing:'.07em', fontWeight:700 }}>
                  📖 READ ON WIKIPEDIA →
                </a>
              )}
              {isTF && card.character && (
                <a href={`https://ttte.fandom.com/wiki/${encodeURIComponent(card.character.character.replace(/ /g,'_'))}`}
                  target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center',
                    gap:7,
                    background:`${card.character.color??'#b57bee'}18`,
                    border:`1px solid ${card.character.color??'#b57bee'}44`,
                    borderRadius:8, padding:'11px 14px', textDecoration:'none',
                    color: card.character.color ?? '#b57bee',
                    fontFamily:'monospace', fontSize:9.5, letterSpacing:'.07em',
                    fontWeight:700 }}>
                  🚂 {card.character.character.toUpperCase()} ON FANDOM →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
