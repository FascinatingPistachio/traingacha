import { useState, useEffect, useRef, useCallback } from 'react';
import { RARITY } from '../constants.js';
import { fetchFandomCharacterImage } from '../utils/fandom.js';
import { fetchWikiThumbnail } from '../utils/wikiImage.js';
import { STAT_CONFIG, statPercent } from '../utils/stats.js';
import '../styles/cards.css';

// Card sizes (2:3 ratio)
const SZ = {
  sm: { w:130, h:195, imgH:108, nameFs:8.5,  metaFs:6.5, badgeFs:5.5, bp:'5px 6px' },
  md: { w:162, h:243, imgH:132, nameFs:10.5, metaFs:7.5, badgeFs:6.5, bp:'7px 8px' },
  lg: { w:200, h:300, imgH:164, nameFs:12.5, metaFs:8.5, badgeFs:7.5, bp:'9px 11px' },
};
const STARS     = { C:1, R:2, E:3, L:4, M:4 };
const HDR_COLOR = { C:'#1a2a3a', R:'#071426', E:'#130620', L:'#1a0e00', M:'#02020a' };

// Card image — handles loading, errors, and null src (lazy Wikipedia fetch)
function CardImage({ src, alt, height, title }) {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const [status, setStatus] = useState(src ? 'loading' : 'fetching');
  const ref = useRef(null);

  // If src is null/undefined, try fetching from Wikipedia
  useEffect(() => {
    if (src) { setResolvedSrc(src); setStatus('loading'); return; }
    if (!title) { setStatus('error'); return; }
    setStatus('fetching');
    fetchWikiThumbnail(title, 400)
      .then(url => {
        if (url) { setResolvedSrc(url); setStatus('loading'); }
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, [src, title]);

  useEffect(() => {
    const img = ref.current;
    if (img?.complete && status === 'loading')
      setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
  }, [resolvedSrc, status]);
  return (
    <div style={{ width:'100%', height, position:'relative', overflow:'hidden', background:'#1a2535' }}>
      {(status === 'loading' || status === 'fetching') && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="spinner" style={{ borderColor:'rgba(255,255,255,0.08)', borderTopColor:'rgba(255,255,255,0.35)' }} />
        </div>
      )}
      {status === 'error' && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#1a2535,#0d1822)', gap:4 }}>
          <svg width="32" height="18" viewBox="0 0 80 42" fill="none">
            <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(255,255,255,0.08)"/>
            <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(255,255,255,0.06)"/>
            <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2"/>
            <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2"/>
          </svg>
        </div>
      )}
      {resolvedSrc && (
        <img ref={ref} src={resolvedSrc} alt={alt}
          onLoad={() => setStatus('loaded')} onError={() => setStatus('error')}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block',
            opacity:status==='loaded'?1:0, transition:'opacity 0.3s' }} />
      )}
    </div>
  );
}

// ── Thomas & Friends character portrait ─────────────────────────────────────
function CharBadge({ character, size }) {
  const d = size === 'sm' ? 28 : size === 'md' ? 34 : 42;
  const [url, setUrl] = useState(null);
  const [ok, setOk]   = useState(false);
  const [fail, setFail] = useState(false);
  useEffect(() => {
    let c = false;
    fetchFandomCharacterImage(character.character, false)
      .then(u => { if (!c) setUrl(u); }).catch(() => {});
    return () => { c = true; };
  }, [character.character]);
  const handleErr = () => {
    if (url?.startsWith('/characters/')) {
      setUrl(null); setOk(false);
      fetchFandomCharacterImage(character.character, true).then(u => setUrl(u));
    } else setFail(true);
  };
  const col = character.color ?? '#1565c0';
  const init = character.character.charAt(0);
  const showImg = url && !fail;
  return (
    <div style={{ width:d, height:d, borderRadius:'50%', overflow:'hidden', background:col,
      border:'2px solid rgba(255,255,255,0.9)', boxShadow:'0 2px 10px rgba(0,0,0,0.55)',
      flexShrink:0, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
      {!showImg && (
        <span style={{ fontSize:d*0.38, fontWeight:900, color:'rgba(255,255,255,0.9)', fontFamily:'Georgia,serif' }}>
          {init}
        </span>
      )}
      {showImg && (
        <img src={url} alt={character.character}
          onLoad={() => setOk(true)} onError={handleErr}
          style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0,
            opacity:ok?1:0, transition:'opacity 0.3s' }} />
      )}
    </div>
  );
}

// ── Stat mini bar (shown on card) ────────────────────────────────────────────
function MiniStat({ cfg, value, fontSize }) {
  const pct = statPercent(cfg.key, value);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      <span style={{ fontSize, lineHeight:1, width:11, textAlign:'center' }}>{cfg.icon}</span>
      <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:cfg.color,
          boxShadow:`0 0 4px ${cfg.color}88`, borderRadius:2 }} />
      </div>
      <span style={{ fontSize:fontSize-0.5, color:'rgba(255,255,255,0.55)', fontFamily:'monospace',
        width:26, textAlign:'right', lineHeight:1 }}>
        {value > 999 ? `${Math.round(value/1000)}k` : value}
      </span>
    </div>
  );
}

// ── Holographic shimmer overlay (Legendary+) ─────────────────────────────────
function HoloOverlay({ rarity }) {
  if (rarity !== 'L' && rarity !== 'M') return null;
  const isM = rarity === 'M';
  return (
    <div className={isM ? 'holo-mythic' : 'holo-legendary'}
      style={{ position:'absolute', inset:0, zIndex:20, pointerEvents:'none', borderRadius:8 }} />
  );
}

// ── Main RailCard ─────────────────────────────────────────────────────────────
export default function RailCard({
  card, size='md', count=0, dimmed=false, onClick=null, isFav=false, onFav=null,
  showAllStats=false,
}) {
  const rs     = RARITY[card.rarity] ?? RARITY.C;
  const sz     = SZ[size];
  const stars  = STARS[card.rarity] ?? 1;
  const isHigh = card.rarity === 'L' || card.rarity === 'M';
  const isTF   = card.character?.show === 'Thomas & Friends';
  const hdrH   = size === 'sm' ? 13 : size === 'md' ? 15 : 17;
  const infoH  = sz.h - sz.imgH - hdrH;
  const stats  = card.stats;

  // How many stat bars to show in card footer
  const statsToShow = size === 'sm' ? 3 : size === 'md' ? 4 : 5;

  return (
    <div
      onClick={onClick}
      style={{
        width:sz.w, height:sz.h, borderRadius:8, overflow:'hidden', flexShrink:0,
        cursor:onClick?'pointer':'default',
        border:`1.5px solid ${rs.border}`,
        boxShadow: isHigh
          ? `0 0 20px ${rs.glow}, 0 4px 20px rgba(0,0,0,0.7)`
          : '0 2px 12px rgba(0,0,0,0.6)',
        opacity: dimmed ? 0.4 : 1,
        transition: 'transform 0.15s, box-shadow 0.15s',
        position: 'relative',
        background: HDR_COLOR[card.rarity] ?? '#0a1520',
        display: 'flex', flexDirection: 'column',
      }}
      className={`rail-card${isHigh?' rail-card--high':''}`}
    >
      <HoloOverlay rarity={card.rarity} />

      {/* ── Rarity header bar ───────────────────────────────────────────── */}
      <div style={{
        height:hdrH, background:`linear-gradient(90deg,${HDR_COLOR[card.rarity]},${rs.bg})`,
        borderBottom:`1px solid ${rs.border}55`,
        display:'flex', alignItems:'center', paddingLeft:5, paddingRight:5, gap:3, flexShrink:0,
      }}>
        {Array.from({length:stars}).map((_,i) => (
          <span key={i} style={{ fontSize:hdrH*0.55, color:rs.color, lineHeight:1,
            filter:`drop-shadow(0 0 3px ${rs.glow})` }}>★</span>
        ))}
        <span style={{ flex:1 }} />
        <span style={{ fontSize:hdrH*0.58, color:rs.color, fontFamily:'monospace', fontWeight:700,
          letterSpacing:'.12em', textShadow:`0 0 6px ${rs.glow}` }}>
          {card.rarity === 'M' ? '???' : rs.name.toUpperCase()}
        </span>
        {card.rarity === 'M' && <span style={{ fontSize:hdrH*0.55, color:rs.color }}>✦</span>}
      </div>

      {/* ── Card image ──────────────────────────────────────────────────── */}
      <div style={{ position:'relative', flexShrink:0 }}>
        <CardImage src={card.image} alt={card.title} height={sz.imgH} title={card.title} />

        {/* Thomas & Friends banner strip */}
        {isTF && !dimmed && (
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:size==='sm'?20:size==='md'?24:28,
            background:card.character.color ?? '#1565c0',
            display:'flex', alignItems:'center', gap:6,
            paddingLeft: (size==='sm'?28:size==='md'?36:44) + 6, paddingRight:6,
            boxShadow:'0 -2px 8px rgba(0,0,0,0.5)',
          }}>
            <div style={{ position:'absolute', left:4, bottom:4 }}>
              <CharBadge character={card.character} size={size} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:sz.badgeFs-0.5, color:'rgba(255,255,255,0.7)', fontFamily:'monospace',
                letterSpacing:'.1em', lineHeight:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {card.character.show.toUpperCase()}
              </div>
              <div style={{ fontSize:size==='sm'?7.5:9, color:'#fff', fontWeight:700, fontFamily:'Georgia,serif',
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {card.character.character}
              </div>
            </div>
          </div>
        )}

        {/* Non-TF character badge (top-right circle) */}
        {card.character && !isTF && !dimmed && (
          <div style={{
            position:'absolute', top:4, right:4, zIndex:7,
            width:size==='sm'?20:25, height:size==='sm'?20:25, borderRadius:'50%',
            background:card.character.color??'#4b5563', border:'2px solid rgba(255,255,255,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.6)',
          }}>
            <span style={{ fontSize:size==='sm'?7:9, fontWeight:800, color:'#fff', fontFamily:'monospace' }}>
              {card.character.character.charAt(0)}
            </span>
          </div>
        )}

        {/* Duplicate count badge */}
        {count > 1 && (
          <div style={{ position:'absolute', top:4, left:4, zIndex:8,
            background:'rgba(0,0,0,0.85)', border:`1px solid ${rs.border}`,
            borderRadius:4, padding:'1px 5px', fontSize:sz.badgeFs, color:rs.color, fontFamily:'monospace' }}>
            ×{count}
          </div>
        )}

        {/* Fav button */}
        {onFav && (
          <button onClick={e=>{e.stopPropagation();onFav();}} style={{
            position:'absolute', zIndex:10, bottom:isTF?(size==='sm'?22:28):4, right:4,
            background:'rgba(0,0,0,0.7)', border:`1px solid ${isFav?'rgba(255,100,100,0.65)':'rgba(255,255,255,0.15)'}`,
            borderRadius:'50%', width:17, height:17, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:8.5, color:isFav?'#ff6b6b':'rgba(255,255,255,0.35)',
          }}>
            {isFav?'♥':'♡'}
          </button>
        )}
      </div>

      {/* ── Info footer ─────────────────────────────────────────────────── */}
      <div style={{
        height:infoH, padding:sz.bp, display:'flex', flexDirection:'column', gap:2,
        background:`linear-gradient(180deg, ${rs.bg} 0%, #030610 100%)`,
        overflow:'hidden', paddingTop: isTF ? (size==='sm'?'8px':size==='md'?'10px':'12px') : undefined,
      }}>
        {/* Divider */}
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${rs.border},transparent)`,
          marginBottom:1, flexShrink:0 }} />

        {/* Title */}
        <div style={{ fontSize:sz.nameFs, fontWeight:700, color:'#f0e8d8', fontFamily:'Georgia,serif',
          lineHeight:1.2, overflow:'hidden', display:'-webkit-box',
          WebkitLineClamp:2, WebkitBoxOrient:'vertical', flexShrink:0 }}>
          {card.title}
        </div>

        {/* Stats bars */}
        {stats && (
          <div style={{ display:'flex', flexDirection:'column', gap:size==='sm'?1.5:2.5, flex:1 }}>
            {STAT_CONFIG.slice(0, statsToShow).map(cfg => (
              <MiniStat key={cfg.key} cfg={cfg} value={stats[cfg.key] ?? 0} fontSize={sz.badgeFs} />
            ))}
          </div>
        )}

        {/* Views / overall score */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          {card.views > 0 && (
            <span style={{ fontSize:sz.badgeFs-0.5, color:'rgba(255,255,255,0.22)', fontFamily:'monospace' }}>
              {card.views < 1000 ? `${card.views}/mo` : `${(card.views/1000).toFixed(0)}k/mo`}
            </span>
          )}
          {stats && (
            <span style={{ fontSize:sz.badgeFs, color:rs.color, fontFamily:'monospace', fontWeight:700,
              textShadow:`0 0 4px ${rs.glow}` }}>
              {stats.overall}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
