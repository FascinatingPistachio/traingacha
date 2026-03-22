import { soundClick } from '../utils/sounds.js';

const TABS = [
  { id:'home',       icon:'🏠', label:'HOME'    },
  { id:'shop',       icon:'🎴', label:'PACKS'   },
  { id:'battle',     icon:'⚔️',  label:'BATTLE'  },
  { id:'collection', icon:'📋', label:'CARDS'   },
  { id:'account',    icon:'🎩', label:'ACCOUNT' },
];

export default function BottomNav({ screen, setScreen }) {
  const handleTab = (id) => {
    soundClick();
    setScreen(id);
  };

  return (
    <nav
      style={{
        flexShrink: 0,
        position: 'relative',
        background: 'rgba(4,10,20,0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(201,168,51,0.1)',
        display: 'flex',
        zIndex: 200,
        // Bottom safe area for home indicator
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Subtle glow line at top */}
      <div style={{
        position: 'absolute', top: 0, left: '5%', right: '5%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(201,168,51,0.2), transparent)',
        pointerEvents: 'none',
      }} />

      {TABS.map(tab => {
        const active = screen === tab.id || (screen === 'opening' && tab.id === 'shop');
        return (
          <button
            key={tab.id}
            onClick={() => handleTab(tab.id)}
            style={{
              flex: 1,
              height: 54,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              borderTop: `2px solid ${active ? '#c9a833' : 'transparent'}`,
              cursor: 'pointer',
              color: active ? '#c9a833' : 'rgba(255,255,255,0.22)',
              position: 'relative',
              transition: 'color 0.15s, border-color 0.15s',
              padding: '6px 0 4px',
              // Minimum tap target
              minWidth: 44,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {active && (
              <div style={{
                position: 'absolute',
                top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 28, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(201,168,51,0.8), transparent)',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <span style={{ fontSize: 19, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: 7.5,
              fontFamily: 'monospace',
              letterSpacing: '.08em',
              fontWeight: active ? 700 : 400,
              lineHeight: 1,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
