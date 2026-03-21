const SZ = {
  sm: { w:130, h:192 },
  md: { w:162, h:240 },
  lg: { w:196, h:290 },
};

export default function CardBack({ size='md', onClick=null, delay=0, onHover=null }) {
  const s = SZ[size];
  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      className={`tc-back${onClick?' tappable':''}`}
      style={{ width:s.w, height:s.h, animation:`fadeUp 0.35s ease-out ${delay}s both`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}
    >
      {/* Foil vertical stripe texture */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', borderRadius:'inherit',
        background:'repeating-linear-gradient(90deg,transparent,transparent 14px,rgba(255,255,255,0.04) 14px,rgba(255,255,255,0.04) 15px)' }} />
      {/* Sheen highlight */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', borderRadius:'inherit',
        background:'linear-gradient(155deg,rgba(255,255,255,0.18) 0%,transparent 45%,rgba(255,255,255,0.07) 70%,transparent 100%)' }} />

      {/* Wikipedia globe */}
      <svg width="38" height="38" viewBox="0 0 100 100" fill="none" style={{ position:'relative', opacity:0.75 }}>
        <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
        <ellipse cx="50" cy="50" rx="17" ry="46" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"/>
        <ellipse cx="50" cy="50" rx="46" ry="17" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"/>
        <ellipse cx="50" cy="30" rx="36" ry="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <ellipse cx="50" cy="70" rx="36" ry="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <text x="50" y="57" textAnchor="middle" fontFamily="serif" fontSize="24" fontWeight="bold" fill="rgba(255,255,255,0.5)">W</text>
      </svg>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, position:'relative' }}>
        <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.55)', letterSpacing:'.04em', fontFamily:"Georgia,'Times New Roman',serif", fontWeight:400 }}>
          RAIL GACHA
        </div>
        <div style={{ fontSize:6, color:'rgba(255,255,255,0.28)', letterSpacing:'.08em', fontFamily:'monospace' }}>
          5 CARDS INSIDE
        </div>
      </div>

      {onClick && (
        <div style={{ position:'absolute', bottom:9, fontSize:7, color:'rgba(255,255,255,0.25)', fontFamily:'monospace', letterSpacing:'.12em' }}>
          TAP TO REVEAL
        </div>
      )}
    </div>
  );
}
