const TABS = [
  { id:'home',       icon:'🏠', label:'HOME'    },
  { id:'shop',       icon:'🎴', label:'PACKS'   },
  { id:'battle',     icon:'⚔️',  label:'BATTLE'  },
  { id:'collection', icon:'📋', label:'CARDS'   },
  { id:'account',    icon:'🎩', label:'ACCOUNT' },
];

export default function BottomNav({ screen, setScreen }) {
  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0, height:56,
      background:'rgba(6,16,28,0.97)', backdropFilter:'blur(10px)',
      borderTop:'1px solid rgba(201,168,51,0.1)',
      display:'flex', zIndex:200,
    }}>
      {TABS.map(tab => {
        const active = screen === tab.id;
        return (
          <button key={tab.id} className={`nav-btn${active?' active':''}`}
            onClick={() => setScreen(tab.id)}>
            <span style={{ fontSize:18 }}>{tab.icon}</span>
            <span style={{ fontSize:7, fontFamily:'monospace', letterSpacing:'.12em' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
