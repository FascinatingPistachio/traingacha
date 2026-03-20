// Card back — dimensions MUST match RailCard SZ exactly so the flip looks right.
const SZ = {
  sm: { w: 120, h: 178 },
  md: { w: 158, h: 234 },
  lg: { w: 192, h: 285 },
};

export default function CardBack({ size = 'md', onClick = null, delay = 0 }) {
  const s = SZ[size];
  return (
    <div
      onClick={onClick}
      className={`tc-back${onClick ? ' tappable' : ''}`}
      style={{
        width: s.w, height: s.h,
        animation: `fadeUp 0.35s ease-out ${delay}s both`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      {/* Diagonal texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(45deg,transparent,transparent 11px,rgba(201,168,51,0.04) 11px,rgba(201,168,51,0.04) 12px)',
        borderRadius: 'inherit',
      }} />
      <div style={{ fontSize: 40, lineHeight: 1, filter: 'drop-shadow(0 0 9px rgba(201,168,51,0.5))', position: 'relative' }}>
        🚂
      </div>
      <div style={{ fontSize: 7.5, color: '#c9a833', letterSpacing: '.25em', fontFamily: 'monospace', fontWeight: 700, position: 'relative' }}>
        RAIL GACHA
      </div>
      {onClick && (
        <div style={{ position: 'absolute', bottom: 10, fontSize: 7.5, color: 'rgba(201,168,51,0.4)', fontFamily: 'monospace', letterSpacing: '.1em' }}>
          TAP TO REVEAL
        </div>
      )}
    </div>
  );
}
