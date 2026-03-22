import { useEffect } from 'react';

export default function AchievementToast({ achievement, onDone }) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      onClick={onDone}
      style={{
        position:'fixed', top:'max(52px, calc(env(safe-area-inset-top, 0px) + 52px))', left:'50%', transform:'translateX(-50%)',
        zIndex:9998,
        background:'linear-gradient(135deg,#1a1200,#0e0c00)',
        border:'1.5px solid rgba(232,192,64,0.65)',
        borderRadius:12,
        padding:'10px 16px',
        display:'flex', gap:12, alignItems:'center',
        boxShadow:'0 0 28px rgba(232,192,64,0.35), 0 8px 24px rgba(0,0,0,0.7)',
        animation:'fadeUp 0.4s ease-out',
        cursor:'pointer',
        maxWidth:340, minWidth:240,
      }}
    >
      {/* Progress bar at bottom */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2,
        background:'rgba(232,192,64,0.15)', borderRadius:'0 0 12px 12px', overflow:'hidden' }}>
        <div style={{ height:'100%', background:'rgba(232,192,64,0.5)',
          animation:'ach-drain 4s linear forwards' }} />
      </div>

      <div style={{ fontSize:26, lineHeight:1, filter:'drop-shadow(0 0 6px rgba(232,192,64,0.6))' }}>
        {achievement.icon}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:8, color:'rgba(232,192,64,0.6)', fontFamily:'monospace',
          letterSpacing:'.18em', marginBottom:2 }}>
          ACHIEVEMENT UNLOCKED
        </div>
        <div style={{ fontSize:13, color:'#e8c040', fontFamily:'Georgia,serif', fontWeight:700, marginBottom:1 }}>
          {achievement.title}
        </div>
        <div style={{ fontSize:9.5, color:'rgba(255,255,255,0.45)', fontFamily:'monospace' }}>
          {achievement.desc}
        </div>
      </div>
    </div>
  );
}
