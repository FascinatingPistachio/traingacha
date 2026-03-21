/**
 * CharacterBadge
 * Shows on the top-right corner of a card image when the real locomotive
 * inspired a fictional character.
 *
 * Uses a coloured circle (matching the character's canonical colour) with
 * the character's initial(s), plus a name pill below — since we can't use
 * actual copyrighted character artwork.
 */
export default function CharacterBadge({ character, size }) {
  const circleW = size === 'sm' ? 22 : size === 'md' ? 28 : 34;
  const fontSize = size === 'sm' ? 8 : size === 'md' ? 9.5 : 11;
  const badgeFontSize = size === 'sm' ? 6 : size === 'md' ? 7 : 8;

  // Derive initials from character name
  const initials = character.character
    .split(' ')
    .filter(w => /^[A-Z]/i.test(w))
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <div style={{
      position: 'absolute',
      top: size === 'sm' ? 20 : 22,
      right: -3,
      zIndex: 7,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
      pointerEvents: 'none',
    }}>
      {/* Character colour circle with initial */}
      <div style={{
        width: circleW,
        height: circleW,
        borderRadius: '50%',
        background: character.color ?? '#4b5563',
        border: '2px solid rgba(255,255,255,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 2px 12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)`,
      }}>
        <span style={{
          fontSize: fontSize,
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: 'monospace',
          lineHeight: 1,
          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
          letterSpacing: '-0.02em',
        }}>
          {initials}
        </span>
      </div>

      {/* Name pill */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(10,10,30,0.95), rgba(5,5,20,0.95))',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 20,
        padding: `2px ${badgeFontSize - 1}px`,
        backdropFilter: 'blur(4px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        whiteSpace: 'nowrap',
      }}>
        <span style={{
          fontSize: badgeFontSize,
          color: '#f0e8ff',
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '.04em',
        }}>
          {character.character}
        </span>
      </div>

      {/* Show name (only on md/lg) */}
      {size !== 'sm' && (
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          borderRadius: 10,
          padding: '1px 5px',
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            fontSize: badgeFontSize - 1,
            color: 'rgba(220,200,255,0.6)',
            fontFamily: 'monospace',
          }}>
            {character.show}
          </span>
        </div>
      )}
    </div>
  );
}
