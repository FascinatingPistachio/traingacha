// Card back — styled like the Wikipedia booster pack (silver/white with globe)
// All text is high-contrast and clearly readable.

const SZ = {
  sm: { w:128, h:192 },  // 2:3
  md: { w:160, h:240 },  // 2:3
  lg: { w:192, h:288 },  // 2:3
};

function WikiGlobeSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.9)" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5"/>
      <ellipse cx="50" cy="50" rx="17" ry="46" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2"/>
      <ellipse cx="50" cy="50" rx="46" ry="17" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.2"/>
      <ellipse cx="50" cy="30" rx="36" ry="10" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1"/>
      <ellipse cx="50" cy="70" rx="36" ry="10" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="1"/>
      <text x="50" y="57" textAnchor="middle" fontFamily="serif" fontSize="24" fontWeight="bold" fill="rgba(0,0,0,0.65)">W</text>
    </svg>
  );
}

export default function CardBack({ size='md', onClick=null, delay=0, onHover=null }) {
  const s    = SZ[size];
  const glob = size === 'sm' ? 32 : size === 'md' ? 42 : 52;

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      className={`tc-back${onClick ? ' tappable' : ''}`}
      style={{
        width: s.w, height: s.h,
        animation: `fadeUp 0.35s ease-out ${delay}s both`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: size === 'sm' ? 5 : 8,
      }}
    >
      {/* Subtle foil vertical stripe texture */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', borderRadius:'inherit',
        background:'repeating-linear-gradient(90deg,transparent,transparent 14px,rgba(255,255,255,0.12) 14px,rgba(255,255,255,0.12) 15px)' }} />
      {/* Top-left diagonal sheen */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', borderRadius:'inherit',
        background:'linear-gradient(155deg,rgba(255,255,255,0.35) 0%,transparent 45%)' }} />

      {/* Wikipedia globe — dark on light, fully readable */}
      <WikiGlobeSVG size={glob} />

      {/* WIKIPEDIA wordmark */}
      <div style={{
        fontSize: size === 'sm' ? 9 : size === 'md' ? 11 : 13,
        fontFamily: "Georgia,'Times New Roman',serif",
        fontWeight: 700,
        color: 'rgba(0,0,0,0.75)',
        letterSpacing: '.06em',
        lineHeight: 1,
        position: 'relative',
      }}>
        WIKIPEDIA
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: size === 'sm' ? 6 : 7.5,
        fontFamily: "Georgia,'Times New Roman',serif",
        fontStyle: 'italic',
        color: 'rgba(0,0,0,0.5)',
        letterSpacing: '.02em',
        position: 'relative',
      }}>
        The Free Encyclopedia
      </div>

      {/* Rail Gacha label */}
      <div style={{
        position: 'absolute', bottom: size === 'sm' ? 6 : 10,
        left: 0, right: 0, textAlign: 'center',
        fontSize: size === 'sm' ? 6 : 7,
        fontFamily: 'monospace',
        color: 'rgba(0,0,0,0.4)',
        letterSpacing: '.18em',
      }}>
        {onClick ? 'TAP TO REVEAL' : 'RAIL GACHA'}
      </div>
    </div>
  );
}
