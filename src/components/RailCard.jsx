/**
 * RailCard.jsx — True Top Trumps 600:900 trading card.
 *
 * Layout (proportional to card height):
 *  ┌─────────────────────────────┐
 *  │  RARITY BANNER  (≈8%)       │  gold/purple/etc band
 *  │  TITLE ZONE     (≈12%)      │  card name
 *  │  PHOTO          (≈38%)      │  full-bleed image
 *  │  CHARACTER TAG  (≈5%)       │  Thomas banner (if applicable)
 *  │  STATS TABLE    (≈30%)      │  5 rows, each stat printed
 *  │  OVERALL SCORE  (≈7%)       │  big number footer
 *  └─────────────────────────────┘
 *
 * Sizes:
 *  sm  → 120×180  (2:3)
 *  md  → 160×240  (2:3)
 *  lg  → 200×300  (2:3)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent, formatStat } from '../utils/stats.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';
import { fetchWikiThumbnail } from '../utils/wikiImage.js';

// Exact 2:3 sizes
const SIZES = {
  sm: { w:120, h:180 },
  md: { w:160, h:240 },
  lg: { w:200, h:300 },
};

// Per-rarity visual theme
const THEME = {
  C: { banner:'#2a3f55', title:'#1a2e40', body:'#0d1e2e', text:'#8ab4d0', border:'rgba(138,155,176,0.55)' },
  R: { banner:'#0e2d50', title:'#071f38', body:'#040f20', text:'#4fa8e8', border:'rgba(79,168,232,0.65)' },
  E: { banner:'#2a0a4a', title:'#1a0530', body:'#0e0220', text:'#c97eff', border:'rgba(181,123,238,0.7)'  },
  L: { banner:'#3d2200', title:'#2a1600', body:'#180d00', text:'#e8c040', border:'rgba(232,192,64,0.8)'  },
  M: { banner:'#0a0520', title:'#060312', body:'#030208', text:'#c0c8ff', border:'rgba(140,160,255,0.9)'  },
};

// Rarity accent colours
const ACCENT = {
  C:'#8ab4d0', R:'#4fa8e8', E:'#c97eff', L:'#e8c040', M:'#c0c8ff',
};

// ── Card image (reliable, works in flex containers) ─────────────────────────
function CardPhoto({ src, title, h }) {
  const [url,    setUrl]    = useState(src || null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => { setUrl(src||null); setLoaded(false); setFailed(false); }, [src]);

  useEffect(() => {
    if (src || !title || failed) return;
    let cancelled = false;
    fetchWikiThumbnail(title, 400).then(u => {
      if (cancelled) return;
      if (u) { setUrl(u); setLoaded(false); }
      else setFailed(true);
    }).catch(() => setFailed(true));
    return () => { cancelled = true; };
  }, [src, title, failed]);

  return (
    <div style={{ width:'100%', height:h, position:'relative', overflow:'hidden',
      background:'#101c2c', flexShrink:0 }}>
      {/* Train silhouette placeholder */}
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
        justifyContent:'center', opacity: loaded ? 0 : 0.2, transition:'opacity 0.4s',
        pointerEvents:'none' }}>
        <svg viewBox="0 0 120 60" width="70%" height="70%" fill="rgba(255,255,255,0.3)">
          <rect x="10" y="20" width="80" height="25" rx="5"/>
          <rect x="70" y="14" width="30" height="31" rx="3"/>
          <circle cx="25" cy="47" r="9"/><circle cx="55" cy="47" r="9"/>
          <circle cx="85" cy="47" r="9"/>
          <rect x="5" y="17" width="5" height="12" rx="2"/>
        </svg>
      </div>
      {url && !failed && (
        <img src={url} alt={title}
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(false); }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', display:'block',
            opacity: loaded ? 1 : 0, transition:'opacity 0.4s ease-out' }} />
      )}
    </div>
  );
}

// ── Thomas & Friends character portrait (circle) ────────────────────────────
function CharAvatar({ character, d }) {
  const [url, setUrl] = useState(null);
  const [ok,  setOk]  = useState(false);
  useEffect(() => {
    if (!character?.character) return;
    let cancelled = false;
    fetchFandomCharacterImage(character.character, false)
      .then(u => { if (!cancelled) setUrl(u); }).catch(() => {});
    return () => { cancelled = true; };
  }, [character?.character]);
  const col = character?.color ?? '#1565c0';
  return (
    <div style={{ width:d, height:d, borderRadius:'50%', flexShrink:0, overflow:'hidden',
      background:col, border:'2px solid rgba(255,255,255,0.85)',
      boxShadow:`0 0 8px ${col}99, 0 2px 6px rgba(0,0,0,0.6)`,
      display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
      <span style={{ fontSize:d*0.42, fontWeight:900, color:'rgba(255,255,255,0.95)',
        fontFamily:'Georgia,serif', position:'absolute' }}>
        {(character?.character??'?').charAt(0)}
      </span>
      {url && (
        <img src={url} alt={character?.character}
          onLoad={() => setOk(true)} onError={() => setUrl(null)}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', opacity: ok ? 1 : 0, transition:'opacity 0.3s' }} />
      )}
    </div>
  );
}

// ── Holographic foil ────────────────────────────────────────────────────────
function HoloFoil({ rarity }) {
  if (rarity !== 'L' && rarity !== 'M') return null;
  return (
    <div aria-hidden style={{
      position:'absolute', inset:0, zIndex:10, pointerEvents:'none',
      borderRadius:'inherit', mixBlendMode:'color-dodge',
      background: rarity === 'M'
        ? 'linear-gradient(125deg,#ff6ec7,#7b2fff,#00d4ff,#0fff89,#ff6ec7)'
        : 'linear-gradient(125deg,#fff5cc,#ffd700,#fff5cc,#ffd700)',
      backgroundSize:'250% 250%',
      backgroundPosition:'var(--hx,50%) var(--hy,50%)',
      opacity: 'var(--ho,0)', transition:'opacity 0.2s',
    }} />
  );
}

// ── Main RailCard ─────────────────────────────────────────────────────────────
export default function RailCard({
  card,
  size = 'md',
  count = 0,
  dimmed = false,
  onClick = null,
  isFav = false,
  onFav = null,
}) {
  const cardRef = useRef(null);
  const rafRef  = useRef(null);

  if (!card) return null;

  const rs     = RARITY[card.rarity] ?? RARITY.C;
  const th     = THEME[card.rarity]  ?? THEME.C;
  const ac     = ACCENT[card.rarity] ?? ACCENT.C;
  const sz     = SIZES[size]         ?? SIZES.md;
  const isTF   = card.character?.show === 'Thomas & Friends';
  const isHigh = card.rarity === 'L' || card.rarity === 'M';
  const stats  = card.stats;

  const starCount  = card.rarity==='C'?1:card.rarity==='R'?2:card.rarity==='E'?3:4;

  // Proportional heights (must sum to 1.0)
  const bannerH  = Math.round(sz.h * 0.10);  // rarity banner
  const titleH   = Math.round(sz.h * 0.13);  // card name
  const photoH   = Math.round(sz.h * 0.37);  // photo
  const charH    = isTF ? Math.round(sz.h * 0.07) : 0; // thomas strip
  const statsH   = Math.round(sz.h * 0.29);  // stats table
  const scoreH   = sz.h - bannerH - titleH - photoH - charH - statsH; // remainder

  // Scale fonts proportionally
  const scale   = sz.w / 160;
  const bannerFs= Math.round(8.5  * scale);
  const titleFs = Math.round(10   * scale);
  const statFs  = Math.round(8    * scale);
  const valFs   = Math.round(9.5  * scale);
  const scoreFs = Math.round(16   * scale);
  const avatarD = Math.round(charH * 0.82);

  // 3D tilt
  const onMouseMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el || dimmed) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const r  = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top)  / r.height;
      el.style.transform =
        `perspective(${sz.w * 4}px) rotateX(${(ny-0.5)*-18}deg) rotateY(${(nx-0.5)*18}deg) scale(1.06) translateZ(12px)`;
      el.style.setProperty('--hx', `${nx*100}%`);
      el.style.setProperty('--hy', `${ny*100}%`);
      el.style.setProperty('--ho', isHigh ? '0.20' : '0');
      const shine = el.querySelector('.card-shine');
      if (shine) { shine.style.opacity='1'; shine.style.setProperty('--sx',`${nx*100}%`); shine.style.setProperty('--sy',`${ny*100}%`); }
    });
  }, [dimmed, isHigh, sz.w]);

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = `perspective(${sz.w*4}px) rotateX(0) rotateY(0) scale(1) translateZ(0)`;
    el.style.setProperty('--ho', '0');
    const shine = el.querySelector('.card-shine');
    if (shine) shine.style.opacity = '0';
  }, [sz.w]);

  const topStatKey = stats
    ? STAT_CONFIG.reduce((b,c) => statPercent(c.key,stats[c.key]??0)>statPercent(b.key,stats[b.key]??0)?c:b, STAT_CONFIG[0]).key
    : null;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        width: sz.w, height: sz.h,
        borderRadius: Math.round(sz.w * 0.05),
        overflow: 'hidden',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        opacity: dimmed ? 0.38 : 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        border: `${Math.max(1.5, scale * 1.5)}px solid ${th.border}`,
        background: th.body,
        boxShadow: isHigh
          ? `0 0 ${Math.round(24*scale)}px ${rs.glow}, 0 ${Math.round(8*scale)}px ${Math.round(28*scale)}px rgba(0,0,0,0.85)`
          : `0 ${Math.round(4*scale)}px ${Math.round(18*scale)}px rgba(0,0,0,0.7)`,
        transition: 'transform 0.1s ease-out, box-shadow 0.2s',
        willChange: 'transform',
        userSelect: 'none',
      }}
      className={card.rarity==='L'?'glow-L':card.rarity==='M'?'glow-M':''}
    >
      <HoloFoil rarity={card.rarity} />

      {/* Shine spot */}
      <div className="card-shine" aria-hidden style={{
        position:'absolute', inset:0, zIndex:12, pointerEvents:'none',
        borderRadius:'inherit', opacity:0, transition:'opacity 0.15s',
        background:'radial-gradient(ellipse 55% 40% at var(--sx,50%) var(--sy,50%),rgba(255,255,255,0.22) 0%,transparent 70%)',
      }} />

      {/* ═══ BANNER ═══ */}
      <div style={{
        height: bannerH, flexShrink:0,
        background: `linear-gradient(90deg, ${th.banner}, ${th.title})`,
        borderBottom: `1px solid ${th.border}55`,
        display:'flex', alignItems:'center',
        paddingLeft: Math.round(6*scale), paddingRight: Math.round(6*scale),
        gap: Math.round(3*scale),
      }}>
        {Array.from({length:starCount}).map((_,i)=>(
          <span key={i} style={{ fontSize:bannerFs-1, color:ac,
            filter:`drop-shadow(0 0 3px ${rs.glow})`, lineHeight:1 }}>★</span>
        ))}
        <span style={{ flex:1 }} />
        {/* Category badge */}
        {card.character && (
          <span style={{ fontSize:bannerFs-1.5, color:ac, fontFamily:'monospace',
            fontWeight:700, letterSpacing:'.06em', opacity:0.85 }}>
            {card.character.show === 'Thomas & Friends' ? 'T&F' : card.character.show.toUpperCase().slice(0,8)}
          </span>
        )}
        <span style={{ fontSize:bannerFs, color:ac, fontFamily:'monospace', fontWeight:700,
          letterSpacing:'.08em', textShadow:`0 0 6px ${rs.glow}`, marginLeft:4 }}>
          {card.rarity==='M' ? '✦ MYTHIC' : rs.name.toUpperCase()}
        </span>
      </div>

      {/* ═══ TITLE ═══ */}
      <div style={{
        height: titleH, flexShrink:0,
        background: th.title,
        display:'flex', alignItems:'center',
        padding: `0 ${Math.round(7*scale)}px`,
        borderBottom: `1px solid ${th.border}33`,
        position:'relative',
      }}>
        <div style={{
          fontSize: titleFs, fontWeight:900, color:'#f5f0e0',
          fontFamily:'Georgia,serif', lineHeight:1.2,
          overflow:'hidden', display:'-webkit-box',
          WebkitLineClamp:2, WebkitBoxOrient:'vertical',
          flex:1,
        }}>
          {card.title}
        </div>
        {/* Dup count */}
        {count > 1 && (
          <div style={{ position:'absolute', top:3, right:4,
            background:`${ac}22`, border:`1px solid ${ac}66`,
            borderRadius:4, padding:'1px 5px',
            fontSize:bannerFs-1, color:ac, fontFamily:'monospace', fontWeight:700 }}>
            ×{count}
          </div>
        )}
        {/* Fav */}
        {onFav && (
          <button onClick={e=>{e.stopPropagation();onFav();}} style={{
            background:'none', border:'none', cursor:'pointer',
            fontSize:Math.round(13*scale), lineHeight:1, padding:'0 0 0 4px',
            color: isFav?'#ff6b6b':'rgba(255,255,255,0.25)', flexShrink:0,
          }}>{isFav?'♥':'♡'}</button>
        )}
      </div>

      {/* ═══ PHOTO ═══ */}
      <div style={{ position:'relative', flexShrink:0 }}>
        <CardPhoto src={card.image} title={card.title} h={photoH} />
        {/* Gradient into title and stats */}
        <div aria-hidden style={{ position:'absolute', top:0, left:0, right:0, height:Math.round(photoH*0.25),
          background:`linear-gradient(${th.title},transparent)`, pointerEvents:'none', zIndex:2 }} />
        <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:Math.round(photoH*0.3),
          background:`linear-gradient(transparent,${th.body})`, pointerEvents:'none', zIndex:2 }} />
      </div>

      {/* ═══ THOMAS CHARACTER STRIP ═══ */}
      {isTF && card.character && (
        <div style={{
          height: charH, flexShrink:0,
          background: `linear-gradient(90deg, ${card.character.color??'#1565c0'}, ${card.character.color??'#1565c0'}aa)`,
          display:'flex', alignItems:'center', gap: Math.round(5*scale),
          paddingLeft: avatarD + Math.round(7*scale), paddingRight: Math.round(6*scale),
          position:'relative', boxShadow:'0 -1px 6px rgba(0,0,0,0.5)',
        }}>
          <div style={{ position:'absolute', left:Math.round(4*scale), top:'50%', transform:'translateY(-50%)' }}>
            <CharAvatar character={card.character} d={avatarD} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:bannerFs-1.5, color:'rgba(255,255,255,0.65)',
              fontFamily:'monospace', letterSpacing:'.06em', lineHeight:1 }}>
              {card.character.show.toUpperCase()}
            </div>
            <div style={{ fontSize:bannerFs+1, fontWeight:700, color:'#fff',
              fontFamily:'Georgia,serif', whiteSpace:'nowrap',
              overflow:'hidden', textOverflow:'ellipsis', lineHeight:1.2, marginTop:1 }}>
              {card.character.character}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STATS TABLE — Top Trumps style ═══ */}
      {stats ? (
        <div style={{
          flex:1, flexShrink:0,
          background: `linear-gradient(180deg, ${th.body}, #020810)`,
          borderTop: `2px solid ${ac}55`,
          display:'flex', flexDirection:'column',
          padding: `${Math.round(3*scale)}px ${Math.round(6*scale)}px`,
          gap: 0,
        }}>
          {STAT_CONFIG.map((cfg, i) => {
            const val = stats[cfg.key] ?? 0;
            const pct = statPercent(cfg.key, val);
            const isTop = topStatKey === cfg.key;
            return (
              <div key={cfg.key} style={{
                flex:1,
                display:'flex', alignItems:'center',
                gap: Math.round(4*scale),
                borderBottom: i < STAT_CONFIG.length-1 ? `1px solid ${th.border}44` : 'none',
                background: isTop ? `${ac}14` : 'transparent',
                borderRadius: isTop ? 4 : 0,
                paddingLeft: isTop ? Math.round(2*scale) : 0,
                paddingRight: isTop ? Math.round(2*scale) : 0,
              }}>
                {/* Stat bar on left */}
                <div style={{ width:3, alignSelf:'stretch', margin:`${Math.round(2*scale)}px 0`,
                  borderRadius:2, background: isTop ? ac : `${ac}44`,
                  boxShadow: isTop ? `0 0 6px ${ac}` : 'none' }} />

                {/* Label */}
                <span style={{ fontSize:statFs, fontFamily:'monospace', fontWeight:700,
                  letterSpacing:'.06em', color: isTop ? ac : `${ac}77`,
                  flex:1, lineHeight:1 }}>
                  {cfg.label}
                </span>

                {/* Value — the big number like real Top Trumps */}
                <span style={{ fontSize:valFs, fontFamily:'monospace', fontWeight:900,
                  color: isTop ? ac : 'rgba(255,255,255,0.65)',
                  textShadow: isTop ? `0 0 8px ${ac}88` : 'none',
                  letterSpacing:'-.02em', lineHeight:1, flexShrink:0 }}>
                  {cfg.key === 'speed' ? `${val}` : cfg.key === 'power' ? `${val}` : `${val}`}
                </span>

                {/* Unit */}
                <span style={{ fontSize:statFs-1.5, color:`${ac}55`, fontFamily:'monospace',
                  lineHeight:1, width:Math.round(24*scale), flexShrink:0 }}>
                  {cfg.unit}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ flex:1, background:`linear-gradient(180deg,${th.body},#020810)` }} />
      )}

      {/* ═══ OVERALL SCORE FOOTER ═══ */}
      <div style={{
        height: scoreH, flexShrink:0,
        background: `linear-gradient(90deg, ${ac}22, ${ac}11, ${ac}22)`,
        borderTop: `1px solid ${ac}55`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        paddingLeft: Math.round(7*scale), paddingRight: Math.round(7*scale),
      }}>
        <span style={{ fontSize:bannerFs-1, color:`${ac}77`, fontFamily:'monospace',
          fontWeight:700, letterSpacing:'.08em' }}>
          {card.views > 0 ? (card.views >= 1000 ? `${(card.views/1000).toFixed(0)}k VIEWS/MO` : `${card.views}/MO`) : 'RAIL GACHA'}
        </span>
        {stats && (
          <span style={{ fontSize:scoreFs, fontWeight:900, fontFamily:'monospace',
            color:ac, textShadow:`0 0 10px ${rs.glow}`, letterSpacing:'-.02em' }}>
            {stats.overall}
          </span>
        )}
      </div>
    </div>
  );
}
