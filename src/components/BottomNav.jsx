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
      className="bottom-nav"
      style={{
        position: 'relative',
        background: 'rgba(4,10,20,0.98)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(201,168,51,0.12)',
        display: 'flex',
        zIndex: 200,
        flexShrink: 0,
        // Safe area bottom inset
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Subtle top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(201,168,51,0.25), transparent)',
        pointerEvents: 'none',
      }} />

      {TABS.map(tab => {
        const active = screen === tab.id || (screen === 'opening' && tab.id === 'shop');
        return (
          <button
            key={tab.id}
            className={`nav-btn${active ? ' active' : ''}`}
            onClick={() => handleTab(tab.id)}
            style={{
              flex: 1,
              minHeight: 52,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              borderTop: active ? '2px solid #c9a833' : '2px solid transparent',
              cursor: 'pointer',
              color: active ? '#c9a833' : 'rgba(255,255,255,0.22)',
              position: 'relative',
              transition: 'color 0.15s, border-color 0.15s',
              // Bigger tap target
              padding: '6px 0',
            }}
          >
            {/* Active dot */}
            {active && (
              <div style={{
                position: 'absolute',
                top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 32, height: 2,
                background: 'linear-gradient(90deg, transparent, #c9a833, transparent)',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: 7.5, fontFamily: 'monospace', letterSpacing: '.1em',
              fontWeight: active ? 700 : 400,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
