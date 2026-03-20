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
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        background:'repeating-linear-gradient(45deg,transparent,transparent 11px,rgba(201,168,51,0.04) 11px,rgba(201,168,51,0.04) 12px)',
        borderRadius:'inherit' }} />
      {/* CSS loco silhouette instead of emoji */}
      <svg width="48" height="26" viewBox="0 0 80 42" fill="none" style={{ position:'relative', filter:'drop-shadow(0 0 8px rgba(201,168,51,0.5))' }}>
        <rect x="8" y="14" width="50" height="18" rx="4" fill="rgba(201,168,51,0.75)" />
        <rect x="50" y="10" width="20" height="22" rx="3" fill="rgba(201,168,51,0.8)" />
        <rect x="54" y="13" width="7" height="7" rx="1" fill="rgba(6,16,28,0.9)" />
        <rect x="4" y="17" width="12" height="12" rx="2" fill="rgba(160,130,40,0.8)" />
        <rect x="12" y="8" width="5" height="10" rx="1" fill="rgba(201,168,51,0.7)" />
        <circle cx="20" cy="34" r="7" fill="none" stroke="rgba(201,168,51,0.8)" strokeWidth="2" />
        <circle cx="40" cy="34" r="7" fill="none" stroke="rgba(201,168,51,0.8)" strokeWidth="2" />
        <circle cx="60" cy="35" r="5" fill="none" stroke="rgba(201,168,51,0.7)" strokeWidth="1.5" />
      </svg>
      <div style={{ fontSize:7.5, color:'#c9a833', letterSpacing:'.25em', fontFamily:'monospace', fontWeight:700, position:'relative' }}>
        RAIL GACHA
      </div>
      {onClick && (
        <div style={{ position:'absolute', bottom:10, fontSize:7.5, color:'rgba(201,168,51,0.4)', fontFamily:'monospace', letterSpacing:'.1em' }}>
          TAP TO REVEAL
        </div>
      )}
    </div>
  );
}
