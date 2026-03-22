import { ACHIEVEMENTS } from '../utils/achievements.js';
import { useState } from 'react';
import { exportCode } from '../utils/storage.js';
import { RARITY } from '../constants.js';
import { STAT_CONFIG } from '../utils/stats.js';

export default function AccountScreen({ save, onReset }) {
  const [copied,  setCopied]  = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [importTxt, setImportTxt] = useState('');
  const [importErr, setImportErr] = useState('');

  const code = exportCode(save);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  };

  const entries    = Object.values(save.collection ?? {});
  const byRarity   = entries.reduce((acc,e) => { acc[e.rarity]=(acc[e.rarity]??0)+1; return acc; }, {});
  const totalCards = entries.reduce((s,e) => s+(e.count??1), 0);
  const withStats  = entries.filter(e=>e.stats);

  // Best card per stat
  const bestBy = (key) => {
    if (!withStats.length) return null;
    return withStats.reduce((a,b) => (a.stats[key]??0) > (b.stats[key]??0) ? a : b);
  };

  const earnedAchs = new Set(save.achievements ?? []);
  const achList    = ACHIEVEMENTS.filter(a => earnedAchs.has(a.id));
  const pending    = ACHIEVEMENTS.filter(a => !earnedAchs.has(a.id));

  const CARD_STYLE = {
    background:'#0c1825', border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:9, padding:'12px 14px',
  };
  const LABEL = { fontSize:7.5, color:'rgba(255,255,255,0.25)', fontFamily:'monospace', letterSpacing:'.12em', marginBottom:6 };

  return (
    <div style={{ padding:'16px 13px 80px', maxWidth:480, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ textAlign:'center', fontSize:13, color:'#c9a833', fontFamily:'monospace',
        letterSpacing:'.2em', marginBottom:4 }}>ACCOUNT</div>

      {/* Profile card */}
      <div style={{ ...CARD_STYLE, border:'1px solid rgba(201,168,51,0.16)', textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:6 }}>🎩</div>
        <div style={{ fontSize:15, color:'#e8e0d0', fontFamily:'Georgia,serif', marginBottom:2 }}>
          {save.username}
        </div>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', letterSpacing:'.08em' }}>
          CONDUCTOR SINCE {save.joinDate ?? '2026'}
        </div>
        {(save.loginStreak ?? 0) > 1 && (
          <div style={{ marginTop:6, fontSize:9, color:'rgba(255,140,0,0.7)', fontFamily:'monospace' }}>
            🔥 {save.loginStreak}-day login streak
          </div>
        )}
      </div>

      {/* Key stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7 }}>
        {[
          { label:'UNIQUE',   value:entries.length },
          { label:'TOTAL',    value:totalCards },
          { label:'PULLS',    value:save.totalPulls ?? 0 },
          { label:'TICKETS',  value:(save.tickets ?? 0).toLocaleString() },
          { label:'WINS',     value:save.battleWins ?? 0 },
          { label:'RAIDS',    value:save.raidWins ?? 0 },
        ].map(s => (
          <div key={s.label} style={{ ...CARD_STYLE, textAlign:'center', padding:'10px 8px' }}>
            <div style={{ fontSize:13, color:'#c9a833', fontFamily:'monospace', fontWeight:700 }}>{s.value}</div>
            <div style={{ fontSize:7, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Collection breakdown */}
      {entries.length > 0 && (
        <div style={CARD_STYLE}>
          <div style={LABEL}>RARITY BREAKDOWN</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {['M','L','E','R','C'].map(r => (
              <div key={r} style={{ fontSize:9, fontFamily:'monospace', color:RARITY[r].color }}>
                {RARITY[r].short}: <strong>{byRarity[r] ?? 0}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hall of fame — best stat cards */}
      {withStats.length > 0 && (
        <div style={CARD_STYLE}>
          <div style={LABEL}>🏆 HALL OF FAME</div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {STAT_CONFIG.map(cfg => {
              const best = bestBy(cfg.key);
              if (!best) return null;
              return (
                <div key={cfg.key} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:12, width:18, textAlign:'center' }}>{cfg.icon}</span>
                  <span style={{ flex:1, fontSize:8.5, color:'rgba(255,255,255,0.45)', fontFamily:'monospace',
                    overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                    {best.title}
                  </span>
                  <span style={{ fontSize:9, color:cfg.color, fontFamily:'monospace', fontWeight:700 }}>
                    {cfg.key === 'speed' ? `${best.stats[cfg.key]} km/h` :
                     cfg.key === 'power' ? `${best.stats[cfg.key] >= 1000 ? (best.stats[cfg.key]/1000).toFixed(1)+'k' : best.stats[cfg.key]} kW` :
                     best.stats[cfg.key]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achList.length > 0 && (
        <div style={CARD_STYLE}>
          <div style={LABEL}>ACHIEVEMENTS ({achList.length}/{ACHIEVEMENTS.length})</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {achList.map(a => (
              <div key={a.id} title={a.desc} style={{
                background:'rgba(232,192,64,0.08)', border:'1px solid rgba(232,192,64,0.2)',
                borderRadius:6, padding:'4px 8px', display:'flex', alignItems:'center', gap:4,
              }}>
                <span style={{ fontSize:12 }}>{a.icon}</span>
                <span style={{ fontSize:8, color:'rgba(232,192,64,0.8)', fontFamily:'monospace' }}>{a.title}</span>
              </div>
            ))}
          </div>
          {pending.length > 0 && (
            <div style={{ marginTop:8, fontSize:8, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>
              {pending.length} more to unlock
            </div>
          )}
        </div>
      )}

      {/* Next achievement hint */}
      {pending.length > 0 && (
        <div style={{ ...CARD_STYLE, border:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={LABEL}>NEXT UP</div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:20, opacity:0.4 }}>{pending[0].icon}</span>
            <div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'monospace' }}>{pending[0].title}</div>
              <div style={{ fontSize:8.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginTop:2 }}>{pending[0].desc}</div>
            </div>
          </div>
        </div>
      )}

      {/* Save code export */}
      <div style={CARD_STYLE}>
        <div style={LABEL}>SAVE CODE</div>
        <div style={{ fontSize:8.5, color:'rgba(255,255,255,0.2)', fontFamily:'monospace', marginBottom:8, lineHeight:1.5 }}>
          Copy this to back up or transfer your collection.
        </div>
        <button onClick={copy} style={{
          width:'100%', padding:'10px', borderRadius:7, cursor:'pointer',
          background: copied ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${copied ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.12)'}`,
          color: copied ? '#4caf50' : 'rgba(255,255,255,0.5)',
          fontFamily:'monospace', fontSize:10, letterSpacing:'.08em',
        }}>
          {copied ? '✓ COPIED!' : '📋 COPY SAVE CODE'}
        </button>
      </div>

      {/* Danger zone */}
      <div style={{ ...CARD_STYLE, border:'1px solid rgba(239,83,80,0.15)' }}>
        <div style={{ ...LABEL, color:'rgba(239,83,80,0.4)' }}>DANGER ZONE</div>
        {!confirm ? (
          <button onClick={() => setConfirm(true)} style={{
            width:'100%', padding:'9px', borderRadius:7, cursor:'pointer',
            background:'rgba(239,83,80,0.06)', border:'1px solid rgba(239,83,80,0.2)',
            color:'rgba(239,83,80,0.6)', fontFamily:'monospace', fontSize:9, letterSpacing:'.08em',
          }}>
            🗑 RESET ALL DATA
          </button>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onReset} style={{
              flex:1, padding:'9px', borderRadius:7, cursor:'pointer',
              background:'#ef5350', border:'none', color:'#fff',
              fontFamily:'monospace', fontSize:9, fontWeight:700,
            }}>CONFIRM RESET</button>
            <button onClick={() => setConfirm(false)} style={{
              flex:1, padding:'9px', borderRadius:7, cursor:'pointer',
              background:'transparent', border:'1px solid rgba(255,255,255,0.1)',
              color:'rgba(255,255,255,0.4)', fontFamily:'monospace', fontSize:9,
            }}>CANCEL</button>
          </div>
        )}
      </div>
    </div>
  );
}
