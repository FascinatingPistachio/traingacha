/**
 * CardDetailModal — Full-screen Marvel Snap-style card reveal.
 *
 * Shows the RailCard at LARGE size (lg = 200×300) centred on screen.
 * The card IS the stat display — no separate panel below.
 * INFO tab slides up from beneath with Wikipedia text + character data.
 * 
 * 3D effects:
 *  - Card floats in from below with spring bounce
 *  - Mouse-tracked perspective tilt on the full card
 *  - Holographic foil follows cursor
 *  - Particle burst on Legendary / Mythic open
 *  - Parallax depth on image vs card face
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent, formatStat } from '../utils/stats.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';

// ── Particle burst ───────────────────────────────────────────────────────────
function Sparks({ color, count = 18 }) {
  const sparks = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const dist  = 60 + Math.random() * 100;
    return {
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      size: 3 + Math.random() * 6,
      color: i % 4 === 0 ? '#fff' : color,
      delay: Math.random() * 0.3,
      dur: 0.6 + Math.random() * 0.4,
    };
  });
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none',
      overflow:'visible', zIndex:60 }}>
      {sparks.map((s, i) => (
        <div key={i} style={{
          position:'absolute', top:'40%', left:'50%',
          width:s.size, height:s.size, borderRadius:'50%',
          background:s.color, boxShadow:`0 0 ${s.size * 2}px ${s.color}`,
          animation:`spark ${s.dur}s ${s.delay}s ease-out both`,
          '--tx': `${s.tx}px`, '--ty': `${s.ty}px`,
        }} />
      ))}
    </div>
  );
}

// ── Large interactive card face ──────────────────────────────────────────────
function BigCard({ card, rs, th, isHigh }) {
  const ref     = useRef(null);
  const raf     = useRef(null);
  const [imgLoaded,  setImgLoaded]  = useState(false);
  const [imgFailed,  setImgFailed]  = useState(false);
  const [charImg,    setCharImg]    = useState(null);
  const [charImgOk,  setCharImgOk]  = useState(false);

  const isTF = card.character?.show === 'Thomas & Friends';
  const starCount = card.rarity==='C'?1:card.rarity==='R'?2:card.rarity==='E'?3:4;
  const stats = card.stats;
  const topStatKey = stats
    ? STAT_CONFIG.reduce((b,c)=>statPercent(c.key,stats[c.key]??0)>statPercent(b.key,stats[b.key]??0)?c:b,STAT_CONFIG[0]).key
    : null;
  const ac = rs.color;

  // Fetch character image
  useEffect(() => {
    if (!isTF || !card.character?.character) return;
    let cancelled = false;
    fetchFandomCharacterImage(card.character.character, false)
      .then(u => { if (!cancelled) setCharImg(u); }).catch(() => {});
    return () => { cancelled = true; };
  }, [isTF, card.character?.character]);

  // 3D tilt + holographic tracking
  const onMove = useCallback((e) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      const r  = el.getBoundingClientRect();
      const cx = (e.clientX ?? e.touches?.[0]?.clientX ?? r.left + r.width/2);
      const cy = (e.clientY ?? e.touches?.[0]?.clientY ?? r.top  + r.height/2);
      const nx = (cx - r.left) / r.width;
      const ny = (cy - r.top)  / r.height;
      const rx = (ny - 0.5) * -22;
      const ry = (nx - 0.5) *  22;
      el.style.transform =
        `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04) translateZ(20px)`;
      // Holographic foil position
      el.style.setProperty('--hx', `${nx * 100}%`);
      el.style.setProperty('--hy', `${ny * 100}%`);
      el.style.setProperty('--hi', isHigh ? '0.24' : '0.05');
      // Image parallax depth
      const img = el.querySelector('.bc-img');
      if (img) {
        img.style.transform = `translate(${(nx-0.5)*-10}px, ${(ny-0.5)*-10}px) scale(1.08)`;
      }
      // Shine spot
      const shine = el.querySelector('.bc-shine');
      if (shine) {
        shine.style.opacity = '1';
        shine.style.setProperty('--sx', `${nx*100}%`);
        shine.style.setProperty('--sy', `${ny*100}%`);
      }
    });
  }, [isHigh]);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
    el.style.setProperty('--hi', '0');
    const img = el.querySelector('.bc-img');
    if (img) img.style.transform = '';
    const shine = el.querySelector('.bc-shine');
    if (shine) shine.style.opacity = '0';
  }, []);

  // Card dimensions at 'lg' = 200x300, but we scale up 30% for the modal
  const W = 220, H = 330;
  const scale = W / 200;
  const bannerH = Math.round(H * 0.09);
  const titleH  = Math.round(H * 0.12);
  const photoH  = Math.round(H * 0.36);
  const charH   = isTF ? Math.round(H * 0.07) : 0;
  const statsH  = Math.round(H * 0.29);
  const scoreH  = H - bannerH - titleH - photoH - charH - statsH;
  const avatarD = Math.round(charH * 0.84);

  const imgSrc = card.imageHD ?? card.image ?? null;

  return (
    <div ref={ref}
      onMouseMove={onMove} onMouseLeave={onLeave}
      onTouchMove={onMove} onTouchEnd={onLeave}
      style={{
        width:W, height:H, borderRadius:Math.round(W*0.055),
        overflow:'hidden', flexShrink:0, position:'relative',
        display:'flex', flexDirection:'column',
        border:`2px solid ${th.border}`,
        background: th.body,
        boxShadow: isHigh
          ? `0 0 40px ${rs.glow}, 0 0 80px ${rs.glow}44, 0 30px 60px rgba(0,0,0,0.9)`
          : `0 20px 50px rgba(0,0,0,0.85)`,
        transition:'transform 0.12s ease-out, box-shadow 0.2s',
        willChange:'transform', userSelect:'none',
      }}
      className={card.rarity==='L'?'glow-L':card.rarity==='M'?'glow-M':''}
    >
      {/* Holographic foil */}
      <div aria-hidden style={{
        position:'absolute', inset:0, zIndex:10, pointerEvents:'none',
        borderRadius:'inherit', mixBlendMode:'color-dodge',
        background: card.rarity==='M'
          ? 'linear-gradient(125deg,#ff6ec7,#7b2fff,#00d4ff,#0fff89,#ff6ec7)'
          : 'linear-gradient(125deg,#fff5cc,#ffd700,#fff5cc,#ffd700)',
        backgroundSize:'250% 250%',
        backgroundPosition:'var(--hx,50%) var(--hy,50%)',
        opacity:'var(--hi,0)', transition:'opacity 0.2s',
      }}/>
      {/* Shine */}
      <div className="bc-shine" aria-hidden style={{
        position:'absolute', inset:0, zIndex:11, pointerEvents:'none',
        borderRadius:'inherit', opacity:0, transition:'opacity 0.15s',
        background:'radial-gradient(ellipse 55% 40% at var(--sx,50%) var(--sy,50%),rgba(255,255,255,0.28) 0%,transparent 65%)',
      }}/>

      {/* BANNER */}
      <div style={{ height:bannerH, flexShrink:0,
        background:`linear-gradient(90deg,${th.banner},${th.title})`,
        borderBottom:`1px solid ${th.border}55`,
        display:'flex', alignItems:'center',
        paddingLeft:Math.round(8*scale), paddingRight:Math.round(8*scale), gap:3 }}>
        {Array.from({length:starCount}).map((_,i)=>(
          <span key={i} style={{fontSize:Math.round(9*scale),color:ac,
            filter:`drop-shadow(0 0 4px ${rs.glow})`,lineHeight:1}}>★</span>
        ))}
        <span style={{flex:1}}/>
        {card.character && (
          <span style={{fontSize:Math.round(7*scale),color:ac,fontFamily:'monospace',
            fontWeight:700,letterSpacing:'.06em',opacity:0.8,marginRight:6}}>
            {card.character.show==='Thomas & Friends'?'T&F':card.character.show.toUpperCase().slice(0,8)}
          </span>
        )}
        <span style={{fontSize:Math.round(9*scale),color:ac,fontFamily:'monospace',fontWeight:700,
          letterSpacing:'.1em',textShadow:`0 0 8px ${rs.glow}`}}>
          {card.rarity==='M'?'✦ MYTHIC':rs.name.toUpperCase()}
        </span>
      </div>

      {/* TITLE */}
      <div style={{ height:titleH, flexShrink:0, background:th.title,
        display:'flex', alignItems:'center',
        padding:`0 ${Math.round(8*scale)}px`,
        borderBottom:`1px solid ${th.border}33` }}>
        <div style={{ fontSize:Math.round(12*scale), fontWeight:900, color:'#f5f0e0',
          fontFamily:'Georgia,serif', lineHeight:1.2,
          overflow:'hidden', display:'-webkit-box',
          WebkitLineClamp:2, WebkitBoxOrient:'vertical', flex:1 }}>
          {card.title}
        </div>
      </div>

      {/* PHOTO with parallax */}
      <div style={{ height:photoH, flexShrink:0, position:'relative',
        overflow:'hidden', background:'#101c2c' }}>
        {/* Train placeholder */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
          justifyContent:'center', opacity: imgLoaded ? 0 : 0.18, transition:'opacity 0.4s', zIndex:1 }}>
          <svg viewBox="0 0 120 60" width="60%" fill="rgba(255,255,255,0.3)">
            <rect x="10" y="20" width="80" height="25" rx="5"/>
            <rect x="70" y="14" width="30" height="31" rx="3"/>
            <circle cx="25" cy="47" r="9"/><circle cx="55" cy="47" r="9"/>
            <circle cx="85" cy="47" r="9"/>
          </svg>
        </div>
        {imgSrc && !imgFailed && (
          <img className="bc-img" src={imgSrc} alt={card.title}
            onLoad={()=>setImgLoaded(true)} onError={()=>setImgFailed(true)}
            style={{ position:'absolute', inset:'-8px',
              width:'calc(100% + 16px)', height:'calc(100% + 16px)',
              objectFit:'cover', display:'block',
              opacity: imgLoaded ? 1 : 0, transition:'opacity 0.4s ease-out',
              transformOrigin:'center', zIndex:2 }} />
        )}
        {/* Top fade */}
        <div aria-hidden style={{ position:'absolute', top:0, left:0, right:0, height:'25%',
          background:`linear-gradient(${th.title},transparent)`, zIndex:3 }}/>
        {/* Bottom fade */}
        <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:'30%',
          background:`linear-gradient(transparent,${th.body})`, zIndex:3 }}/>
      </div>

      {/* THOMAS CHARACTER STRIP */}
      {isTF && card.character && (
        <div style={{ height:charH, flexShrink:0,
          background:`linear-gradient(90deg,${card.character.color??'#1565c0'},${card.character.color??'#1565c0'}99)`,
          display:'flex', alignItems:'center',
          paddingLeft:avatarD + Math.round(7*scale), paddingRight:Math.round(6*scale),
          position:'relative', boxShadow:'0 -2px 10px rgba(0,0,0,0.6)' }}>
          {/* Avatar */}
          <div style={{ position:'absolute', left:Math.round(4*scale), top:'50%',
            transform:'translateY(-50%)',
            width:avatarD, height:avatarD, borderRadius:'50%', overflow:'hidden',
            border:'2px solid rgba(255,255,255,0.9)',
            boxShadow:`0 0 10px ${card.character.color??'#1565c0'}99`,
            background:card.character.color??'#1565c0',
            display:'flex', alignItems:'center', justifyContent:'center', position:'absolute',
            left:Math.round(4*scale) }}>
            <span style={{ fontSize:avatarD*0.42, fontWeight:900, color:'rgba(255,255,255,0.95)',
              fontFamily:'Georgia,serif', position:'absolute' }}>
              {card.character.character.charAt(0)}
            </span>
            {charImg && (
              <img src={charImg} alt={card.character.character}
                onLoad={()=>setCharImgOk(true)} onError={()=>setCharImg(null)}
                style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                  objectFit:'cover', opacity:charImgOk?1:0, transition:'opacity 0.3s' }} />
            )}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:Math.round(6.5*scale),color:'rgba(255,255,255,0.6)',
              fontFamily:'monospace',letterSpacing:'.06em',lineHeight:1}}>
              {card.character.show.toUpperCase()}
            </div>
            <div style={{fontSize:Math.round(9*scale),fontWeight:700,color:'#fff',
              fontFamily:'Georgia,serif',whiteSpace:'nowrap',
              overflow:'hidden',textOverflow:'ellipsis',lineHeight:1.2,marginTop:1}}>
              {card.character.character}
            </div>
          </div>
        </div>
      )}

      {/* STATS TABLE */}
      {stats && (
        <div style={{ flex:1, flexShrink:0, background:`linear-gradient(180deg,${th.body},#020810)`,
          borderTop:`2px solid ${ac}66`, display:'flex', flexDirection:'column',
          padding:`${Math.round(3*scale)}px ${Math.round(7*scale)}px`, gap:0 }}>
          {STAT_CONFIG.map((cfg,i) => {
            const val = stats[cfg.key]??0;
            const isTop = topStatKey===cfg.key;
            return (
              <div key={cfg.key} style={{ flex:1, display:'flex', alignItems:'center',
                gap:Math.round(5*scale),
                borderBottom:i<STAT_CONFIG.length-1?`1px solid ${th.border}44`:'none',
                background: isTop ? `${ac}16` : 'transparent',
                paddingLeft: isTop ? Math.round(2*scale) : 0,
                borderRadius: isTop ? 4 : 0 }}>
                <div style={{ width:3, alignSelf:'stretch', margin:`${Math.round(2*scale)}px 0`,
                  borderRadius:2, flexShrink:0,
                  background: isTop ? ac : `${ac}44`,
                  boxShadow: isTop ? `0 0 6px ${ac}` : 'none' }}/>
                <span style={{ fontSize:Math.round(8.5*scale), fontFamily:'monospace',
                  fontWeight:700, letterSpacing:'.06em', flex:1, lineHeight:1,
                  color: isTop ? ac : `${ac}77` }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize:Math.round(11*scale), fontFamily:'monospace',
                  fontWeight:900, lineHeight:1, flexShrink:0,
                  color: isTop ? ac : 'rgba(255,255,255,0.7)',
                  textShadow: isTop ? `0 0 10px ${ac}88` : 'none',
                  letterSpacing:'-.02em' }}>
                  {formatStat(cfg.key, val)}
                </span>
                <span style={{ fontSize:Math.round(6.5*scale), color:`${ac}55`,
                  fontFamily:'monospace', lineHeight:1, flexShrink:0,
                  width:Math.round(26*scale), textAlign:'left' }}>
                  {cfg.unit}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* OVERALL SCORE */}
      <div style={{ height:scoreH, flexShrink:0,
        background:`linear-gradient(90deg,${ac}22,${ac}11,${ac}22)`,
        borderTop:`1px solid ${ac}55`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        paddingLeft:Math.round(8*scale), paddingRight:Math.round(8*scale) }}>
        <span style={{fontSize:Math.round(7*scale),color:`${ac}66`,fontFamily:'monospace',fontWeight:700,letterSpacing:'.08em'}}>
          {card.views>0?(card.views>=1000?`${(card.views/1000).toFixed(0)}k/mo`:`${card.views}/mo`):'RAIL GACHA'}
        </span>
        {stats && (
          <span style={{fontSize:Math.round(17*scale),fontWeight:900,fontFamily:'monospace',
            color:ac,textShadow:`0 0 12px ${rs.glow}`,letterSpacing:'-.02em'}}>
            {stats.overall}
          </span>
        )}
      </div>
    </div>
  );
}

const THEME = {
  C:{ banner:'#2a3f55', title:'#1a2e40', body:'#0d1e2e', border:'rgba(138,155,176,0.55)' },
  R:{ banner:'#0e2d50', title:'#071f38', body:'#040f20', border:'rgba(79,168,232,0.65)'  },
  E:{ banner:'#2a0a4a', title:'#1a0530', body:'#0e0220', border:'rgba(181,123,238,0.7)'  },
  L:{ banner:'#3d2200', title:'#2a1600', body:'#180d00', border:'rgba(232,192,64,0.8)'   },
  M:{ banner:'#0a0520', title:'#060312', body:'#030208', border:'rgba(140,160,255,0.9)'  },
};

// ── Info panel (slides up) ────────────────────────────────────────────────────
function InfoPanel({ card, rs, isFav, onFav, charImg }) {
  const isTF = card.character?.show === 'Thomas & Friends';
  return (
    <div className="slide-up" style={{ width:'100%', display:'flex', flexDirection:'column', gap:10, paddingTop:4 }}>

      {card.character && (
        <div style={{ background:`${card.character.color??'#1565c0'}1a`,
          border:`1px solid ${card.character.color??'#1565c0'}44`,
          borderRadius:12, padding:14, display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:52, height:52, borderRadius:'50%', flexShrink:0,
            background:card.character.color??'#1565c0', overflow:'hidden', position:'relative',
            border:`2px solid ${card.character.color??'#1565c0'}`,
            boxShadow:`0 4px 16px ${card.character.color??'#1565c0'}66`,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{fontSize:22,fontWeight:900,color:'rgba(255,255,255,0.9)',fontFamily:'Georgia,serif',position:'absolute'}}>
              {card.character.character.charAt(0)}
            </span>
            {charImg && <img src={charImg} alt={card.character.character}
              style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:7.5,color:'rgba(255,255,255,0.28)',fontFamily:'monospace',letterSpacing:'.15em',marginBottom:3}}>
              {card.character.show.toUpperCase()}
            </div>
            <div style={{fontSize:15,fontFamily:'Georgia,serif',fontWeight:700,
              color:card.character.color??'#c9a833',marginBottom:5}}>
              {card.character.character}
            </div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.45)',fontFamily:'monospace',lineHeight:1.55}}>
              {card.character.note}
            </div>
          </div>
        </div>
      )}

      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:14}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:9}}>
          <span style={{fontSize:13}}>📖</span>
          <span style={{fontSize:8,color:'rgba(255,255,255,0.3)',fontFamily:'monospace',letterSpacing:'.12em',fontWeight:700}}>WIKIPEDIA</span>
        </div>
        <div style={{fontSize:11.5,color:'rgba(200,215,230,0.72)',fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:1.7}}>
          {card.fullExtract || card.extract || 'No description available.'}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {card.views>0 && (
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
            <div style={{fontSize:14,fontFamily:'monospace',fontWeight:700,
              color:card.views>=80000?'#e8c040':card.views>=18000?'#b57bee':'#4fa8e8'}}>
              {card.views>=1000000?`${(card.views/1000000).toFixed(1)}M`:card.views>=1000?`${(card.views/1000).toFixed(0)}k`:card.views}
            </div>
            <div style={{fontSize:7.5,color:'rgba(255,255,255,0.2)',fontFamily:'monospace',marginTop:2}}>WIKIPEDIA VIEWS/MO</div>
          </div>
        )}
        <div style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${rs.border}44`,borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
          <div style={{fontSize:14,fontFamily:'monospace',fontWeight:700,color:rs.color}}>
            {card.rarity==='M'?'✦ MYTHIC':rs.name.toUpperCase()}
          </div>
          <div style={{fontSize:7.5,color:'rgba(255,255,255,0.2)',fontFamily:'monospace',marginTop:2}}>RARITY</div>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {card.url && (
          <a href={card.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,
              background:'rgba(79,168,232,0.1)',border:'1px solid rgba(79,168,232,0.35)',
              borderRadius:8,padding:'11px 14px',textDecoration:'none',
              color:'#4fa8e8',fontFamily:'monospace',fontSize:10,letterSpacing:'.07em',fontWeight:700}}>
            📖 READ ON WIKIPEDIA →
          </a>
        )}
        {isTF && card.character && (
          <a href={`https://ttte.fandom.com/wiki/${encodeURIComponent(card.character.character.replace(/ /g,'_'))}`}
            target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:7,
              background:`${card.character.color??'#b57bee'}18`,
              border:`1px solid ${card.character.color??'#b57bee'}44`,
              borderRadius:8,padding:'11px 14px',textDecoration:'none',
              color:card.character.color??'#b57bee',fontFamily:'monospace',fontSize:10,letterSpacing:'.07em',fontWeight:700}}>
            🚂 {card.character.character.toUpperCase()} ON FANDOM →
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function CardDetailModal({ card, count, onClose, isFav=false, onFav=null }) {
  const rs     = RARITY[card.rarity] ?? RARITY.C;
  const th     = THEME[card.rarity]  ?? THEME.C;
  const isHigh = card.rarity==='L' || card.rarity==='M';

  const [tab,        setTab]       = useState('card');
  const [showSparks, setShowSparks]= useState(isHigh);
  const [charImg,    setCharImg]   = useState(null);
  const isTF = card.character?.show==='Thomas & Friends';

  useEffect(() => {
    if (showSparks) { const t=setTimeout(()=>setShowSparks(false),1000); return()=>clearTimeout(t); }
  },[showSparks]);

  useEffect(() => {
    if (!isTF || !card.character?.character) return;
    let c=false;
    fetchFandomCharacterImage(card.character.character,false).then(u=>{if(!c)setCharImg(u);}).catch(()=>{});
    return()=>{c=true;};
  },[isTF,card.character?.character]);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(2,5,14,0.94)',
      backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)',
      display:'flex', flexDirection:'column', alignItems:'center',
      overflowY:'auto', overflowX:'hidden',
    }}>
      {/* Close */}
      <button onClick={onClose} style={{
        position:'fixed', top:14, right:14, zIndex:600,
        background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
        borderRadius:'50%', width:40, height:40,
        color:'rgba(255,255,255,0.7)', fontSize:20, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>×</button>

      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxWidth:400,
        padding:'20px 16px 48px',
        display:'flex', flexDirection:'column', alignItems:'center', gap:14,
      }}>

        {/* BIG CARD — the star of the show */}
        <div style={{ position:'relative', animation: isHigh ? 'legendBurst 0.65s cubic-bezier(0.34,1.56,0.64,1) both' : 'slideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both' }}>
          {showSparks && <Sparks color={rs.color} count={isHigh ? 22 : 10} />}
          <BigCard card={card} rs={rs} th={th} isHigh={isHigh} />
        </div>

        {/* Fav + tab row */}
        <div style={{ display:'flex', gap:8, width:'100%', maxWidth:260 }}>
          {onFav && (
            <button onClick={onFav} style={{
              width:44, flexShrink:0, borderRadius:8, cursor:'pointer',
              background:isFav?'rgba(255,80,80,0.15)':'rgba(255,255,255,0.04)',
              border:`1px solid ${isFav?'rgba(255,80,80,0.5)':'rgba(255,255,255,0.1)'}`,
              color:isFav?'#ff6b6b':'rgba(255,255,255,0.3)', fontSize:20,
            }}>{isFav?'♥':'♡'}</button>
          )}
          <div style={{display:'flex',flex:1,borderRadius:8,overflow:'hidden',
            border:`1px solid ${rs.border}44`}}>
            {[['card','🃏 CARD'],['info','📖 INFO']].map(([t,lbl])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                flex:1, padding:'9px 4px',
                background:tab===t?rs.bg:'rgba(0,0,0,0.2)',
                border:'none', cursor:'pointer', fontSize:9,
                color:tab===t?rs.color:'rgba(255,255,255,0.3)',
                fontFamily:'monospace', fontWeight:700, letterSpacing:'.08em',
                transition:'all 0.15s',
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* CARD tab: show count if multiple */}
        {tab==='card' && (
          <div className="slide-up" style={{width:'100%',maxWidth:260,display:'flex',flexDirection:'column',gap:8}}>
            {(count??1)>1 && (
              <div style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${rs.border}44`,
                borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
                <span style={{fontSize:10,color:`${rs.color}`,fontFamily:'monospace',fontWeight:700}}>
                  You own ×{count} copies of this card
                </span>
              </div>
            )}
            <div style={{fontSize:7.5,color:'rgba(255,255,255,0.12)',fontFamily:'monospace',
              textAlign:'center',lineHeight:1.6}}>
              Hover/touch the card for 3D effects
              <br/>Stats are deterministic — same for all players
            </div>
          </div>
        )}

        {/* INFO tab */}
        {tab==='info' && (
          <div style={{width:'100%',maxWidth:340}}>
            <InfoPanel card={card} rs={rs} isFav={isFav} onFav={onFav} charImg={charImg} />
          </div>
        )}
      </div>
    </div>
  );
}
