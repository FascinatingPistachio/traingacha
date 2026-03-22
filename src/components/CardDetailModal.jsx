import { useState, useEffect, useRef, useCallback } from 'react';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent, formatStat } from '../utils/stats.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';

// ── Spark burst ──────────────────────────────────────────────────────────────
function Sparks({ color }) {
  return (
    <div aria-hidden style={{ position:'absolute', inset:0, pointerEvents:'none',
      overflow:'visible', zIndex:50 }}>
      {Array.from({length:14}, (_,i) => {
        const a = (i/14)*Math.PI*2, d = 45+Math.random()*55;
        return (
          <div key={i} className="spark" style={{
            '--sx':`${Math.cos(a)*d}px`, '--sy':`${Math.sin(a)*d}px`,
            position:'absolute', top:'50%', left:'50%',
            width:4+Math.random()*4, height:4+Math.random()*4,
            borderRadius:'50%',
            background: i%3===0 ? '#fff' : color,
            boxShadow:`0 0 6px ${i%3===0?'#fff':color}`,
            animationDelay:`${(Math.random()*0.25).toFixed(2)}s`,
          }} />
        );
      })}
    </div>
  );
}

// ── 3D tilt card face ────────────────────────────────────────────────────────
function CardFace3D({ card, rs }) {
  const ref = useRef(null);
  const raf = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const isTF = card.character?.show === 'Thomas & Friends';
  const isHigh = card.rarity === 'L' || card.rarity === 'M';
  const starCount = card.rarity==='C'?1:card.rarity==='R'?2:card.rarity==='E'?3:4;

  const onMove = useCallback((e) => {
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const r  = ref.current.getBoundingClientRect();
      const nx = ((e.clientX??e.touches?.[0]?.clientX??r.left+r.width/2) - r.left) / r.width;
      const ny = ((e.clientY??e.touches?.[0]?.clientY??r.top+r.height/2) - r.top)  / r.height;
      ref.current.style.transform =
        `perspective(800px) rotateX(${(ny-0.5)*-20}deg) rotateY(${(nx-0.5)*20}deg) scale(1.04) translateZ(16px)`;
      ref.current.style.setProperty('--hx', `${nx*100}%`);
      ref.current.style.setProperty('--hy', `${ny*100}%`);
      ref.current.style.setProperty('--hi', isHigh ? '0.2' : '0.05');
      const shine = ref.current.querySelector('.cf-shine');
      if (shine) { shine.style.opacity='1'; shine.style.setProperty('--sx',`${nx*100}%`); shine.style.setProperty('--sy',`${ny*100}%`); }
    });
  }, [isHigh]);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
    ref.current.style.setProperty('--hi', '0');
    const shine = ref.current.querySelector('.cf-shine');
    if (shine) shine.style.opacity = '0';
  }, []);

  // Image source — prefer HD
  const imgSrc = card.imageHD ?? card.image ?? null;

  return (
    <div style={{ perspective: 900 }}>
      <div ref={ref}
        onMouseMove={onMove} onMouseLeave={onLeave}
        onTouchMove={onMove} onTouchEnd={onLeave}
        style={{
          width: 200, borderRadius:12,
          overflow:'hidden', position:'relative',
          border:`2px solid ${rs.border}`,
          background:`linear-gradient(180deg,#111e2d,#060f1c)`,
          boxShadow:`0 24px 60px rgba(0,0,0,0.85), 0 0 32px ${rs.glow}55`,
          transformStyle:'preserve-3d',
          transition:'transform 0.1s ease-out',
          willChange:'transform',
          userSelect:'none',
        }}
        className={card.rarity==='L'?'glow-L':card.rarity==='M'?'glow-M':''}
      >
        {/* Holographic foil */}
        <div aria-hidden style={{
          position:'absolute', inset:0, zIndex:10, pointerEvents:'none',
          borderRadius:'inherit', mixBlendMode:'color-dodge',
          background: card.rarity==='M'
            ? 'linear-gradient(135deg,#ff6ec7,#7b2fff,#00d4ff,#0fff89,#ff6ec7)'
            : 'linear-gradient(135deg,#ffd700,#ffaa00,#ffe066,#ffd700)',
          backgroundSize:'200% 200%',
          backgroundPosition:'var(--hx,50%) var(--hy,50%)',
          opacity:'var(--hi,0)', transition:'opacity 0.2s',
        }} />
        {/* Shine */}
        <div className="cf-shine" aria-hidden style={{
          position:'absolute', inset:0, zIndex:11, pointerEvents:'none',
          borderRadius:'inherit', opacity:0, transition:'opacity 0.15s',
          background:'radial-gradient(ellipse 55% 40% at var(--sx,50%) var(--sy,50%),rgba(255,255,255,0.22) 0%,transparent 70%)',
        }} />

        {/* Rarity header */}
        <div style={{ padding:'5px 8px', display:'flex', alignItems:'center', gap:3,
          borderBottom:`1px solid ${rs.border}44`, background:'rgba(0,0,0,0.35)' }}>
          {Array.from({length:starCount}).map((_,i)=>(
            <span key={i} style={{fontSize:9,color:rs.color,filter:`drop-shadow(0 0 3px ${rs.glow})`}}>★</span>
          ))}
          <span style={{flex:1}} />
          <span style={{fontSize:8.5,color:rs.color,fontFamily:'monospace',fontWeight:700,
            letterSpacing:'.1em',textShadow:`0 0 6px ${rs.glow}`}}>
            {card.rarity==='M'?'✦ ???':rs.name.toUpperCase()}
          </span>
        </div>

        {/* Photo — single img, no position:absolute */}
        <div style={{ width:'100%', height:160, overflow:'hidden', position:'relative',
          background:`linear-gradient(135deg,${rs.bg},#060f1c)` }}>
          {/* Placeholder (always rendered behind) */}
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
            justifyContent:'center', opacity: imgLoaded ? 0 : 0.35, transition:'opacity 0.3s' }}>
            <span style={{ fontSize:44 }}>🚂</span>
          </div>
          {/* Real image */}
          {imgSrc && !imgFailed && (
            <img
              src={imgSrc}
              alt={card.title}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgFailed(true)}
              style={{
                position:'absolute', inset:0,
                width:'100%', height:'100%', objectFit:'cover', display:'block',
                opacity: imgLoaded ? 1 : 0,
                transition:'opacity 0.4s ease-out',
              }}
            />
          )}
          {/* Holo overlay on image */}
          {isHigh && (
            <div aria-hidden style={{ position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
              background: card.rarity==='M'
                ? 'linear-gradient(135deg,rgba(80,60,255,0.12),rgba(60,180,255,0.08),rgba(255,100,200,0.12))'
                : 'linear-gradient(135deg,rgba(255,215,0,0.1),transparent,rgba(255,165,0,0.1))',
              animation:'holo-shift 3s ease-in-out infinite' }} />
          )}
          {/* Thomas banner */}
          {isTF && card.character && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:24, zIndex:3,
              background:`linear-gradient(90deg,${card.character.color??'#1565c0'},${card.character.color??'#1565c0'}cc)`,
              display:'flex', alignItems:'center', paddingLeft:9,
              boxShadow:'0 -2px 8px rgba(0,0,0,0.5)' }}>
              <span style={{ fontSize:10, fontWeight:700, color:'#fff',
                fontFamily:'Georgia,serif', textShadow:'0 1px 4px rgba(0,0,0,0.8)' }}>
                {card.character.character}
              </span>
            </div>
          )}
          {/* Bottom gradient */}
          <div aria-hidden style={{ position:'absolute', bottom:0, left:0, right:0, height:40,
            background:'linear-gradient(transparent,#060f1c)', pointerEvents:'none', zIndex:2 }} />
        </div>

        {/* Title + overall */}
        <div style={{ padding:'10px 11px 12px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#f0e8d8',
            fontFamily:'Georgia,serif', lineHeight:1.25, marginBottom:6 }}>
            {card.title}
          </div>
          {card.stats && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              borderTop:`1px solid ${rs.border}33`, paddingTop:7 }}>
              <span style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>OVERALL POWER</span>
              <span style={{ fontSize:22, fontWeight:900, fontFamily:'monospace',
                color:rs.color, textShadow:`0 0 14px ${rs.glow}` }}>
                {card.stats.overall}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Animated stat bar ────────────────────────────────────────────────────────
function StatRow({ cfg, value, delay, isTop }) {
  const pct = statPercent(cfg.key, value);
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:16 }}>{cfg.icon}</span>
          <span style={{ fontSize:10.5, fontFamily:'monospace', fontWeight:700, letterSpacing:'.1em',
            color: isTop ? cfg.color : 'rgba(255,255,255,0.5)' }}>{cfg.label}</span>
          {isTop && <span style={{ fontSize:7.5, background:`${cfg.color}22`, color:cfg.color,
            border:`1px solid ${cfg.color}44`, borderRadius:3, padding:'1px 5px',
            fontFamily:'monospace', fontWeight:700 }}>TOP</span>}
        </div>
        <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:800,
          color: isTop ? cfg.color : '#f0e8d8',
          textShadow: isTop ? `0 0 10px ${cfg.color}88` : 'none',
          animation:'countUp 0.35s ease-out both', animationDelay:`${delay}s` }}>
          {formatStat(cfg.key, value)}
        </span>
      </div>
      <div style={{ height:7, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden',
        boxShadow:'inset 0 1px 3px rgba(0,0,0,0.4)' }}>
        <div className="stat-bar-fill" style={{
          '--w':`${pct}%`, '--delay':`${delay}s`,
          height:'100%', borderRadius:4,
          background: isTop
            ? `linear-gradient(90deg,${cfg.color}99,${cfg.color})`
            : `linear-gradient(90deg,${cfg.color}44,${cfg.color}77)`,
          boxShadow: isTop ? `0 0 10px ${cfg.color}77` : 'none',
          position:'relative', overflow:'hidden',
        }}>
          {isTop && <div style={{ position:'absolute', inset:0,
            background:'linear-gradient(90deg,transparent 50%,rgba(255,255,255,0.28))',
            animation:'shimmer 1.8s linear infinite', backgroundSize:'200% 100%' }} />}
        </div>
      </div>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────
export default function CardDetailModal({ card, count, onClose, isFav = false, onFav = null }) {
  const rs     = RARITY[card.rarity] ?? RARITY.C;
  const isTF   = card.character?.show === 'Thomas & Friends';
  const isHigh = card.rarity === 'L' || card.rarity === 'M';

  const [tab,       setTab]       = useState('stats');
  const [showSparks,setShowSparks]= useState(isHigh);
  const [charImg,   setCharImg]   = useState(null);
  const [charImgOk, setCharImgOk] = useState(false);

  useEffect(() => {
    if (showSparks) { const t=setTimeout(()=>setShowSparks(false),900); return()=>clearTimeout(t); }
  }, [showSparks]);

  useEffect(() => {
    if (!isTF || !card.character?.character) return;
    let cancelled = false;
    fetchFandomCharacterImage(card.character.character, false)
      .then(u=>{ if(!cancelled) setCharImg(u); }).catch(()=>{});
    return () => { cancelled = true; };
  }, [isTF, card.character?.character]);

  const topStat = card.stats
    ? STAT_CONFIG.reduce((best,cfg) =>
        statPercent(cfg.key,card.stats[cfg.key]??0) > statPercent(best.key,card.stats[best.key]??0) ? cfg : best,
        STAT_CONFIG[0])
    : null;

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(3,6,16,0.93)',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      display:'flex', flexDirection:'column', alignItems:'center',
      overflowY:'auto', overflowX:'hidden',
    }}>
      {/* Close */}
      <button onClick={onClose} style={{
        position:'fixed', top:14, right:14, zIndex:600,
        background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
        borderRadius:'50%', width:38, height:38,
        color:'rgba(255,255,255,0.7)', fontSize:20, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>×</button>

      <div onClick={e=>e.stopPropagation()} style={{
        width:'100%', maxWidth:380, padding:'22px 16px 48px',
        display:'flex', flexDirection:'column', alignItems:'center', gap:14,
      }}>
        {/* 3D card face */}
        <div style={{ position:'relative', marginTop:4 }}
          className={isHigh ? 'legend-burst' : 'slide-up'}>
          {showSparks && <Sparks color={rs.color} />}
          <CardFace3D card={card} rs={rs} />
        </div>

        {/* Fav + tabs */}
        <div style={{ display:'flex', gap:8, width:'100%' }}>
          {onFav && (
            <button onClick={onFav} style={{
              width:44, flexShrink:0, borderRadius:8, cursor:'pointer',
              background: isFav?'rgba(255,80,80,0.15)':'rgba(255,255,255,0.04)',
              border:`1px solid ${isFav?'rgba(255,80,80,0.5)':'rgba(255,255,255,0.1)'}`,
              color: isFav?'#ff6b6b':'rgba(255,255,255,0.3)', fontSize:20,
            }}>{isFav?'♥':'♡'}</button>
          )}
          <div style={{ display:'flex', flex:1, borderRadius:8,
            overflow:'hidden', border:`1px solid ${rs.border}44` }}>
            {[['stats','📊 STATS'],['info','📖 INFO']].map(([t,lbl])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                flex:1, padding:'9px 4px', background: tab===t?rs.bg:'rgba(0,0,0,0.2)',
                border:'none', cursor:'pointer', fontSize:9,
                color: tab===t?rs.color:'rgba(255,255,255,0.3)',
                fontFamily:'monospace', fontWeight:700, letterSpacing:'.08em',
                transition:'all 0.15s',
              }}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* STATS TAB */}
        {tab === 'stats' && card.stats && (
          <div className="slide-up" style={{ width:'100%' }}>
            <div style={{ textAlign:'center', marginBottom:18 }}>
              <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center',
                padding:'14px 40px', borderRadius:14,
                background:`radial-gradient(ellipse at 50% 50%,${rs.bg} 0%,transparent 80%)`,
                border:`1px solid ${rs.border}33` }}>
                <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
                  letterSpacing:'.2em', marginBottom:3 }}>OVERALL POWER</div>
                <div style={{ fontSize:52, fontWeight:900, fontFamily:'Georgia,serif', lineHeight:1,
                  color:rs.color, textShadow:`0 0 28px ${rs.glow}, 0 0 56px ${rs.glow}44`,
                  animation:'countUp 0.4s ease-out both' }}>
                  {card.stats.overall}
                </div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.18)', fontFamily:'monospace', marginTop:2 }}>
                  / 100
                </div>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${rs.border}33`,
              borderRadius:12, padding:'14px 14px 4px' }}>
              {STAT_CONFIG.map((cfg,i) => (
                <StatRow key={cfg.key} cfg={cfg}
                  value={card.stats[cfg.key]??0}
                  delay={0.08+i*0.09}
                  isTop={topStat?.key===cfg.key} />
              ))}
              <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.12)', fontFamily:'monospace',
                textAlign:'center', paddingBottom:10, borderTop:'1px solid rgba(255,255,255,0.05)',
                paddingTop:8, lineHeight:1.6 }}>
                Stats are seeded from article title — same for all players
              </div>
            </div>
          </div>
        )}

        {/* INFO TAB */}
        {tab === 'info' && (
          <div className="slide-up" style={{ width:'100%', display:'flex', flexDirection:'column', gap:12 }}>

            {/* Character */}
            {card.character && (
              <div style={{ background:`${card.character.color??'#1565c0'}1a`,
                border:`1px solid ${card.character.color??'#1565c0'}44`,
                borderRadius:12, padding:14, display:'flex', gap:12, alignItems:'flex-start' }}>
                {/* Portrait */}
                <div style={{ width:54, height:54, borderRadius:'50%', flexShrink:0, overflow:'hidden',
                  background: card.character.color??'#1565c0',
                  border:`2.5px solid ${card.character.color??'#1565c0'}`,
                  boxShadow:`0 4px 18px ${card.character.color??'#1565c0'}66`,
                  display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <span style={{ fontSize:22, fontWeight:900, color:'rgba(255,255,255,0.9)',
                    fontFamily:'Georgia,serif', position:'absolute' }}>
                    {card.character.character.charAt(0)}
                  </span>
                  {charImg && (
                    <img src={charImg} alt={card.character.character}
                      onLoad={()=>setCharImgOk(true)}
                      onError={()=>setCharImg(null)}
                      style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                        objectFit:'cover', opacity: charImgOk?1:0, transition:'opacity 0.3s' }} />
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.28)', fontFamily:'monospace',
                    letterSpacing:'.15em', marginBottom:3 }}>
                    {card.character.show.toUpperCase()}
                  </div>
                  <div style={{ fontSize:15, fontFamily:'Georgia,serif', fontWeight:700,
                    color: card.character.color??'#c9a833', marginBottom:5 }}>
                    {card.character.character}
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)', fontFamily:'monospace', lineHeight:1.55 }}>
                    {card.character.note}
                  </div>
                </div>
              </div>
            )}

            {/* Wikipedia */}
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:10, padding:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:9 }}>
                <span style={{ fontSize:13 }}>📖</span>
                <span style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontFamily:'monospace',
                  letterSpacing:'.12em', fontWeight:700 }}>WIKIPEDIA</span>
              </div>
              <div style={{ fontSize:11, color:'rgba(200,215,230,0.72)', fontFamily:'Georgia,serif',
                fontStyle:'italic', lineHeight:1.7 }}>
                {card.fullExtract || card.extract || 'No description available.'}
              </div>
            </div>

            {/* Meta */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {card.views > 0 && (
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:13, fontFamily:'monospace', fontWeight:700,
                    color: card.views>=80000?'#e8c040':card.views>=18000?'#b57bee':'#4fa8e8' }}>
                    {card.views>=1000000?`${(card.views/1000000).toFixed(1)}M`:card.views>=1000?`${(card.views/1000).toFixed(0)}k`:card.views}
                  </div>
                  <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:2 }}>VIEWS/MO</div>
                </div>
              )}
              {(count??1)>1 && (
                <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
                  borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:13, fontFamily:'monospace', fontWeight:700, color:'#c9a833' }}>×{count}</div>
                  <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:2 }}>COPIES</div>
                </div>
              )}
            </div>

            {/* Links */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {card.url && (
                <a href={card.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                    background:'rgba(79,168,232,0.1)', border:'1px solid rgba(79,168,232,0.35)',
                    borderRadius:8, padding:'11px 14px', textDecoration:'none',
                    color:'#4fa8e8', fontFamily:'monospace', fontSize:9.5, letterSpacing:'.07em', fontWeight:700 }}>
                  📖 READ ON WIKIPEDIA →
                </a>
              )}
              {isTF && card.character && (
                <a href={`https://ttte.fandom.com/wiki/${encodeURIComponent(card.character.character.replace(/ /g,'_'))}`}
                  target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                    background:`${card.character.color??'#b57bee'}18`,
                    border:`1px solid ${card.character.color??'#b57bee'}44`,
                    borderRadius:8, padding:'11px 14px', textDecoration:'none',
                    color: card.character.color??'#b57bee',
                    fontFamily:'monospace', fontSize:9.5, letterSpacing:'.07em', fontWeight:700 }}>
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
