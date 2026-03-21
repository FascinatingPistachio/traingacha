import { useState } from 'react';
import RailCard from './RailCard.jsx';
import { RARITY } from '../constants.js';
import { STAT_CONFIG, statPercent, formatStat } from '../utils/stats.js';

export default function CardDetailModal({ card, count, onClose, isFav = false, onFav = null }) {
  const rs   = RARITY[card.rarity] ?? RARITY.C;
  const isTF = card.character?.show === 'Thomas & Friends';
  const [tab, setTab] = useState('stats'); // 'stats' | 'info'

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.93)', zIndex:500,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'16px 16px 24px', overflowY:'auto',
    }}>
      <button onClick={onClose} style={{
        position:'fixed', top:16, right:16, background:'rgba(255,255,255,0.08)',
        border:'1px solid rgba(255,255,255,0.15)', borderRadius:'50%', width:34, height:34,
        color:'#aaa', fontSize:16, cursor:'pointer', display:'flex',
        alignItems:'center', justifyContent:'center', zIndex:10,
      }}>×</button>

      <div onClick={e=>e.stopPropagation()} style={{
        display:'flex', flexDirection:'column', alignItems:'center', gap:14,
        animation:'fadeUp 0.3s ease-out', width:'100%', maxWidth:240,
      }}>
        <RailCard card={card} size="lg" count={count} isFav={isFav} onFav={onFav} />

        {/* Tab switcher */}
        <div style={{ display:'flex', gap:0, borderRadius:8, overflow:'hidden',
          border:`1px solid ${rs.border}44`, width:'100%' }}>
          {['stats','info'].map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1, padding:'7px', background: tab===t ? rs.bg : 'transparent',
              border:'none', cursor:'pointer', fontSize:8.5,
              color: tab===t ? rs.color : 'rgba(255,255,255,0.3)',
              fontFamily:'monospace', fontWeight:700, letterSpacing:'.1em',
              transition:'all 0.15s',
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === 'stats' && card.stats && (
          <div style={{ width:'100%', background:'rgba(255,255,255,0.03)',
            border:`1px solid ${rs.border}44`, borderRadius:10, padding:'14px 14px', display:'flex', flexDirection:'column', gap:10 }}>

            {/* Overall score */}
            <div style={{ textAlign:'center', paddingBottom:10, borderBottom:`1px solid ${rs.border}33` }}>
              <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', fontFamily:'monospace', letterSpacing:'.15em', marginBottom:4 }}>
                OVERALL SCORE
              </div>
              <div style={{ fontSize:32, fontWeight:700, fontFamily:'Georgia,serif',
                color:rs.color, textShadow:`0 0 16px ${rs.glow}` }}>
                {card.stats.overall}
              </div>
              <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>/ 100</div>
            </div>

            {/* Individual stats */}
            {STAT_CONFIG.map(cfg => {
              const val = card.stats[cfg.key] ?? 0;
              const pct = statPercent(cfg.key, val);
              return (
                <div key={cfg.key}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ fontSize:13 }}>{cfg.icon}</span>
                      <span style={{ fontSize:9, color:'rgba(255,255,255,0.5)', fontFamily:'monospace',
                        fontWeight:700, letterSpacing:'.1em' }}>{cfg.label}</span>
                    </div>
                    <span style={{ fontSize:10, fontFamily:'monospace', fontWeight:700, color:cfg.color }}>
                      {formatStat(cfg.key, val)}
                    </span>
                  </div>
                  <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:cfg.color, borderRadius:3,
                      boxShadow:`0 0 6px ${cfg.color}88`, transition:'width 0.6s ease-out' }} />
                  </div>
                </div>
              );
            })}

            {/* Rarity note */}
            <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace',
              textAlign:'center', paddingTop:6, borderTop:`1px solid ${rs.border}22` }}>
              Stats are deterministic — same card = same stats for all players
            </div>
          </div>
        )}

        {/* Info tab */}
        {tab === 'info' && (
          <div style={{ width:'100%', background:'rgba(255,255,255,0.03)',
            border:`1px solid ${rs.border}44`, borderRadius:10, padding:'14px', display:'flex', flexDirection:'column', gap:10 }}>

            {/* Full extract */}
            {card.extract && (
              <div>
                <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
                  letterSpacing:'.12em', marginBottom:5 }}>ABOUT</div>
                <div style={{ fontSize:10, color:'rgba(200,215,230,0.6)', fontFamily:'Georgia,serif',
                  fontStyle:'italic', lineHeight:1.6 }}>
                  {card.extract}
                </div>
              </div>
            )}

            {/* Character note */}
            {card.character && (
              <div style={{ background:`${card.character.color ?? '#4b5563'}22`,
                border:`1px solid ${card.character.color ?? '#4b5563'}44`,
                borderRadius:7, padding:'8px 10px' }}>
                <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.25)', fontFamily:'monospace',
                  letterSpacing:'.12em', marginBottom:4 }}>
                  {card.character.show.toUpperCase()}
                </div>
                <div style={{ fontSize:10, color:card.character.color ?? '#b57bee',
                  fontFamily:'Georgia,serif', fontWeight:700, marginBottom:4 }}>
                  {card.character.character}
                </div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:'monospace', lineHeight:1.4 }}>
                  {card.character.note}
                </div>
              </div>
            )}

            {/* Views */}
            {card.views > 0 && (
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>
                📊 ~{card.views.toLocaleString()} Wikipedia views/month
              </div>
            )}

            {/* Count */}
            {count > 1 && (
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>
                📦 You own {count} copies
              </div>
            )}

            {/* Links */}
            <div style={{ display:'flex', flexDirection:'column', gap:6, paddingTop:4 }}>
              <a href={card.url} target="_blank" rel="noreferrer" style={{
                fontSize:9.5, color:'#4fa8e8', fontFamily:'monospace', letterSpacing:'.06em',
                textDecoration:'none', padding:'7px 10px',
                border:'1px solid rgba(79,168,232,0.35)', borderRadius:6, textAlign:'center', display:'block',
              }}>
                READ ON WIKIPEDIA →
              </a>
              {isTF && card.character && (
                <a href={`https://ttte.fandom.com/wiki/${encodeURIComponent(card.character.character.replace(/ /g,'_'))}`}
                  target="_blank" rel="noreferrer" style={{
                    fontSize:9.5, color:card.character.color ?? '#b57bee',
                    fontFamily:'monospace', letterSpacing:'.06em',
                    textDecoration:'none', padding:'7px 10px',
                    border:`1px solid ${(card.character.color ?? '#b57bee')}55`,
                    borderRadius:6, textAlign:'center', display:'block',
                  }}>
                  {card.character.character.toUpperCase()} ON FANDOM →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
