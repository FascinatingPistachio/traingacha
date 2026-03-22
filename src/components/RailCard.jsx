/**
 * RailCard.jsx — Proper 2:3 Top Trumps card.
 *
 * SIZES (exact 2:3):  sm=120×180  md=160×240  lg=200×300
 *
 * Layout (all heights are explicit, no flex:1 tricks):
 *  BANNER  (10%) — rarity name + stars
 *  TITLE   (13%) — locomotive name
 *  PHOTO   (37%) — full-bleed image
 *  CHAR    ( 7%) — Thomas strip (only if T&F character)
 *  STATS   (29%) — 5 stat rows printed like Top Trumps
 *  SCORE   (~4%) — overall power score footer
 *
 * 3D: mouse-tracked perspective tilt + holographic foil + shine spot
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, formatStat } from '../utils/stats.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';
import { fetchWikiThumbnail } from '../utils/wikiImage.js';

const SIZES = {
  sm: { w:120, h:180 },
  md: { w:160, h:240 },
  lg: { w:200, h:300 },
};

const THEME = {
  C:{ banner:'#2a3f55', title:'#1a2e40', body:'#0d1e2e', border:'rgba(138,155,176,0.55)' },
  R:{ banner:'#0e2d50', title:'#071f38', body:'#040f20', border:'rgba(79,168,232,0.65)'  },
  E:{ banner:'#2a0a4a', title:'#1a0530', body:'#0e0220', border:'rgba(181,123,238,0.7)'  },
  L:{ banner:'#3d2200', title:'#2a1600', body:'#180d00', border:'rgba(232,192,64,0.8)'   },
  M:{ banner:'#0a0520', title:'#060312', body:'#030208', border:'rgba(140,160,255,0.9)'  },
};

// ── Card image — no position tricks, uses explicit h prop ───────────────────
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
    <div style={{ width:'100%', height:h, position:'relative',
      overflow:'hidden', background:'#0d1a28', flexShrink:0 }}>
      {/* Train silhouette */}
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
        justifyContent:'center', opacity: loaded ? 0 : 0.2,
        transition:'opacity 0.4s', pointerEvents:'none' }}>
        <svg viewBox="0 0 120 60" width="62%" fill="rgba(255,255,255,0.4)">
          <rect x="10" y="20" width="80" height="25" rx="5"/>
          <rect x="70" y="14" width="30" height="31" rx="3"/>
          <circle cx="25" cy="47" r="8"/><circle cx="55" cy="47" r="8"/>
          <circle cx="85" cy="47" r="8"/>
          <rect x="4" y="16" width="5" height="14" rx="2"/>
        </svg>
      </div>
      {/* Image */}
      {url && !failed && (
        <img src={url} alt={title}
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(false); }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%',
            objectFit:'cover', display:'block',
            opacity: loaded ? 1 : 0, transition:'opacity 0.35s ease-out' }} />
      )}
    </div>
  );
}

// ── Thomas & Friends character avatar ───────────────────────────────────────
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
    <div style={{ width:d, height:d, borderRadius:'50%', flexShrink:0,
      background:col, overflow:'hidden', position:'relative',
      border:'2px solid rgba(255,255,255,0.85)',
      boxShadow:`0 0 8px ${col}99`,
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ position:'absolute', fontSize:d*0.42, fontWeight:900,
        color:'rgba(255,255,255,0.95)', fontFamily:'Georgia,serif' }}>
        {(character?.character ?? '?').charAt(0)}
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

// ── Main card ────────────────────────────────────────────────────────────────
export default function RailCard({
  card, size='md', count=0, dimmed=false,
  onClick=null, isFav=false, onFav=null,
}) {
  const ref = useRef(null);
  const raf = useRef(null);

  if (!card) return null;

  const rs    = RARITY[card.rarity] ?? RARITY.C;
  const th    = THEME[card.rarity]  ?? THEME.C;
  const ac    = rs.color;
  const sz    = SIZES[size] ?? SIZES.md;
  const isTF  = card.character?.show === 'Thomas & Friends';
  const isHigh= card.rarity === 'L' || card.rarity === 'M';
  const stats = card.stats;
  const sc    = sz.w / 160; // scale factor

  // Heights — all explicit, sum = sz.h
  const bH = Math.round(sz.h * 0.10); // banner
  const nH = Math.round(sz.h * 0.13); // name/title
  const pH = Math.round(sz.h * 0.37); // photo
  const cH = isTF ? Math.round(sz.h * 0.07) : 0; // char strip
  const sH = Math.round(sz.h * 0.29); // stats
  const fH = sz.h - bH - nH - pH - cH - sH; // footer (score)

  const stars   = card.rarity==='C'?1:card.rarity==='R'?2:card.rarity==='E'?3:4;
  const avatarD = Math.round(cH * 0.82);

  const topStatKey = stats
    ? STAT_CONFIG.reduce((b,c) => {
        const bv = b.max > 0 ? (stats[b.key]??0)/b.max : 0;
        const cv = c.max > 0 ? (stats[c.key]??0)/c.max : 0;
        return cv > bv ? c : b;
      }, STAT_CONFIG[0]).key
    : null;

  // 3D tilt
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el || dimmed) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r  = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top)  / r.height;
      el.style.transform =
        `perspective(${sz.w*4}px) rotateX(${(ny-0.5)*-18}deg) rotateY(${(nx-0.5)*18}deg) scale(1.06) translateZ(12px)`;
      el.style.setProperty('--hx', `${nx*100}%`);
      el.style.setProperty('--hy', `${ny*100}%`);
      el.style.setProperty('--hi', isHigh ? '0.20' : '0');
      const shine = el.querySelector('.rc-shine');
      if (shine) { shine.style.opacity='1'; shine.style.setProperty('--sx',`${nx*100}%`); shine.style.setProperty('--sy',`${ny*100}%`); }
    });
  }, [dimmed, isHigh, sz.w]);

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(${sz.w*4}px) rotateX(0) rotateY(0) scale(1) translateZ(0)`;
    el.style.setProperty('--hi','0');
    const shine = el.querySelector('.rc-shine');
    if (shine) shine.style.opacity = '0';
  }, [sz.w]);

  return (
    <div ref={ref}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        width:sz.w, height:sz.h,  // explicit 2:3
        display:'flex', flexDirection:'column',
        borderRadius:Math.round(sz.w*0.05),
        overflow:'hidden', flexShrink:0,
        cursor:onClick?'pointer':'default',
        opacity:dimmed?0.38:1,
        position:'relative',
        border:`${Math.max(1.5,sc*1.5)}px solid ${th.border}`,
        background:th.body,
        boxShadow:isHigh
          ?`0 0 ${Math.round(24*sc)}px ${rs.glow}, 0 ${Math.round(6*sc)}px ${Math.round(26*sc)}px rgba(0,0,0,0.85)`
          :`0 ${Math.round(4*sc)}px ${Math.round(18*sc)}px rgba(0,0,0,0.7)`,
        transition:'transform 0.1s ease-out, box-shadow 0.2s',
        willChange:'transform', userSelect:'none',
      }}
      className={card.rarity==='L'?'glow-L':card.rarity==='M'?'glow-M':''}
    >
      {/* Holographic foil */}
      <div aria-hidden style={{
        position:'absolute', inset:0, zIndex:10, pointerEvents:'none',
        borderRadius:'inherit', mixBlendMode:'color-dodge',
        background:card.rarity==='M'
          ?'linear-gradient(125deg,#ff6ec7,#7b2fff,#00d4ff,#0fff89,#ff6ec7)'
          :'linear-gradient(125deg,#fff5cc,#ffd700,#fff5cc,#ffd700)',
        backgroundSize:'250% 250%',
        backgroundPosition:'var(--hx,50%) var(--hy,50%)',
        opacity:'var(--hi,0)', transition:'opacity 0.2s',
      }}/>
      {/* Shine */}
      <div className="rc-shine" aria-hidden style={{
        position:'absolute', inset:0, zIndex:11, pointerEvents:'none',
        borderRadius:'inherit', opacity:0, transition:'opacity 0.15s',
        background:'radial-gradient(ellipse 55% 40% at var(--sx,50%) var(--sy,50%),rgba(255,255,255,0.22) 0%,transparent 68%)',
      }}/>

      {/* ▌BANNER */}
      <div style={{ height:bH, flexShrink:0,
        background:`linear-gradient(90deg,${th.banner},${th.title})`,
        borderBottom:`1px solid ${th.border}55`,
        display:'flex', alignItems:'center',
        paddingLeft:Math.round(6*sc), paddingRight:Math.round(6*sc), gap:3 }}>
        {Array.from({length:stars}).map((_,i)=>(
          <span key={i} style={{fontSize:Math.round(8.5*sc),color:ac,
            filter:`drop-shadow(0 0 3px ${rs.glow})`,lineHeight:1}}>★</span>
        ))}
        <span style={{flex:1}}/>
        {card.character && (
          <span style={{fontSize:Math.round(6.5*sc),color:ac,fontFamily:'monospace',
            fontWeight:700,letterSpacing:'.05em',opacity:0.75,marginRight:5}}>
            {isTF?'T&F':card.character.show.toUpperCase().slice(0,6)}
          </span>
        )}
        <span style={{fontSize:Math.round(8.5*sc),color:ac,fontFamily:'monospace',fontWeight:700,
          letterSpacing:'.08em',textShadow:`0 0 7px ${rs.glow}`}}>
          {card.rarity==='M'?'✦ MYTHIC':rs.name.toUpperCase()}
        </span>
      </div>

      {/* ▌TITLE */}
      <div style={{ height:nH, flexShrink:0, background:th.title,
        display:'flex', alignItems:'center',
        padding:`0 ${Math.round(7*sc)}px`,
        borderBottom:`1px solid ${th.border}33`, position:'relative' }}>
        <div style={{ fontSize:Math.round(10*sc), fontWeight:900, color:'#f5f0e0',
          fontFamily:'Georgia,serif', lineHeight:1.2, flex:1,
          overflow:'hidden', display:'-webkit-box',
          WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {card.title}
        </div>
        {/* Badges */}
        {count>1 && (
          <div style={{ flexShrink:0, background:`${ac}22`, border:`1px solid ${ac}55`,
            borderRadius:4, padding:`1px ${Math.round(5*sc)}px`,
            fontSize:Math.round(7*sc), color:ac, fontFamily:'monospace', fontWeight:700, marginLeft:4 }}>
            ×{count}
          </div>
        )}
        {onFav && (
          <button onClick={e=>{e.stopPropagation();onFav();}} style={{
            background:'none', border:'none', cursor:'pointer', flexShrink:0,
            fontSize:Math.round(13*sc), lineHeight:1, padding:`0 0 0 ${Math.round(3*sc)}px`,
            color:isFav?'#ff6b6b':'rgba(255,255,255,0.22)',
          }}>{isFav?'♥':'♡'}</button>
        )}
      </div>

      {/* ▌PHOTO */}
      <div style={{ position:'relative', flexShrink:0 }}>
        <CardPhoto src={card.image} title={card.title} h={pH} />
        {/* Top fade */}
        <div aria-hidden style={{ position:'absolute', top:0, left:0, right:0, height:Math.round(pH*0.22),
          background:`linear-gradient(${th.title},transparent)`, pointerEvents:'none', zIndex:2 }}/>
        {/* Bottom fade */}
        <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:Math.round(pH*0.28),
          background:`linear-gradient(transparent,${th.body})`, pointerEvents:'none', zIndex:2 }}/>
      </div>

      {/* ▌THOMAS STRIP */}
      {isTF && card.character && (
        <div style={{ height:cH, flexShrink:0, position:'relative',
          background:`linear-gradient(90deg,${card.character.color??'#1565c0'},${card.character.color??'#1565c0'}99)`,
          display:'flex', alignItems:'center',
          paddingLeft:avatarD+Math.round(8*sc), paddingRight:Math.round(6*sc),
          boxShadow:'0 -1px 8px rgba(0,0,0,0.5)' }}>
          <div style={{ position:'absolute', left:Math.round(4*sc), top:'50%', transform:'translateY(-50%)' }}>
            <CharAvatar character={card.character} d={avatarD} />
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:Math.round(6*sc),color:'rgba(255,255,255,0.6)',
              fontFamily:'monospace',letterSpacing:'.05em',lineHeight:1}}>
              {card.character.show.toUpperCase()}
            </div>
            <div style={{fontSize:Math.round(8.5*sc),fontWeight:700,color:'#fff',
              fontFamily:'Georgia,serif',whiteSpace:'nowrap',
              overflow:'hidden',textOverflow:'ellipsis',lineHeight:1.2,marginTop:1}}>
              {card.character.character}
            </div>
          </div>
        </div>
      )}

      {/* ▌STATS — exact height sH, rows use equal flex */}
      <div style={{ height:sH, flexShrink:0,
        background:`linear-gradient(180deg,${th.body},#020810)`,
        borderTop:`2px solid ${ac}55`,
        display:'flex', flexDirection:'column',
        padding:`${Math.round(2*sc)}px ${Math.round(6*sc)}px`, gap:0 }}>
        {STAT_CONFIG.map((cfg,i) => {
          const val   = stats ? (stats[cfg.key]??0) : 0;
          const isTop = topStatKey===cfg.key;
          const statRowH = (sH - Math.round(4*sc)) / STAT_CONFIG.length;
          return (
            <div key={cfg.key} style={{ height:statRowH, flexShrink:0,
              display:'flex', alignItems:'center', gap:Math.round(4*sc),
              borderBottom:i<STAT_CONFIG.length-1?`1px solid ${th.border}44`:'none',
              background:isTop?`${ac}16`:'transparent',
              paddingLeft:isTop?Math.round(2*sc):0, borderRadius:isTop?3:0 }}>
              {/* Left accent */}
              <div style={{ width:3, height:'70%', borderRadius:2, flexShrink:0,
                background:isTop?ac:`${ac}33`,
                boxShadow:isTop?`0 0 5px ${ac}99`:'none' }}/>
              {/* Label */}
              <span style={{ fontFamily:'monospace', fontWeight:700, flex:1,
                fontSize:Math.round(7.5*sc), letterSpacing:'.05em', lineHeight:1,
                color:isTop?ac:`${ac}66` }}>
                {cfg.label}
              </span>
              {/* Value */}
              <span style={{ fontFamily:'monospace', fontWeight:900, flexShrink:0,
                fontSize:Math.round(9.5*sc), letterSpacing:'-.01em', lineHeight:1,
                color:isTop?ac:'rgba(255,255,255,0.72)',
                textShadow:isTop?`0 0 8px ${ac}99`:'none' }}>
                {stats ? formatStat(cfg.key, val) : '—'}
              </span>
              {/* Unit */}
              <span style={{ fontFamily:'monospace', flexShrink:0, lineHeight:1,
                fontSize:Math.round(6*sc), color:`${ac}44`,
                width:Math.round(22*sc), textAlign:'left' }}>
                {cfg.unit}
              </span>
            </div>
          );
        })}
      </div>

      {/* ▌SCORE FOOTER */}
      <div style={{ height:fH, flexShrink:0,
        background:`linear-gradient(90deg,${ac}18,${ac}09,${ac}18)`,
        borderTop:`1px solid ${ac}44`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        paddingLeft:Math.round(7*sc), paddingRight:Math.round(7*sc) }}>
        <span style={{fontSize:Math.round(6.5*sc),color:`${ac}66`,fontFamily:'monospace',fontWeight:700,letterSpacing:'.07em'}}>
          {card.views>0?(card.views>=1000?`${(card.views/1000).toFixed(0)}k/mo`:`${card.views}/mo`):'RAIL GACHA'}
        </span>
        {stats && (
          <span style={{fontSize:Math.round(15*sc),fontWeight:900,fontFamily:'monospace',
            color:ac,textShadow:`0 0 10px ${rs.glow}`,letterSpacing:'-.02em'}}>
            {stats.overall}
          </span>
        )}
      </div>
    </div>
  );
}
