const SIZES = {
  sm: { w: 130, h: 158 },
  md: { w: 168, h: 208 },
  lg: { w: 200, h: 248 },
};

export default function CardBack({ size = 'md', onClick = null, delay = 0 }) {
  const s = SIZES[size];
  return (
    <div
      onClick={onClick}
      className={`card-back${onClick ? ' tappable' : ''}`}
      style={{
        width: s.w,
        height: s.h,
        background: 'linear-gradient(165deg, #0d1f35, #060f1c)',
        border: '1.5px solid rgba(201,168,51,0.3)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        animation: `fadeUp 0.35s ease-out ${delay}s both`,
      }}
    >
      {/* Diagonal stripe texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(45deg, transparent, transparent 11px, rgba(201,168,51,0.03) 11px, rgba(201,168,51,0.03) 12px)',
      }} />

      <div style={{
        fontSize: 40, lineHeight: 1,
        filter: 'drop-shadow(0 0 9px rgba(201,168,51,0.5))',
        position: 'relative',
      }}>
        🚂
      </div>
      <div style={{
        fontSize: 7.5,
        color: '#c9a833',
        letterSpacing: '.25em',
        fontFamily: 'monospace',
        fontWeight: 700,
        position: 'relative',
      }}>
        RAIL GACHA
      </div>
      {onClick && (
        <div style={{
          position: 'absolute', bottom: 10,
          fontSize: 7.5,
          color: 'rgba(201,168,51,0.4)',
          fontFamily: 'monospace',
          letterSpacing: '.1em',
        }}>
          TAP TO REVEAL
        </div>
      )}
    </div>
  );
}
