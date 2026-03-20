const STYLES = {
  success: { bg: '#1a3e18', border: 'rgba(74,175,74,0.55)' },
  error:   { bg: '#3e1010', border: 'rgba(239,83,80,0.55)' },
  warn:    { bg: '#3e3008', border: 'rgba(255,193,7,0.45)' },
  info:    { bg: '#0e2040', border: 'rgba(33,150,243,0.45)' },
};

export default function Toast({ message, type = 'info' }) {
  const s = STYLES[type] ?? STYLES.info;
  return (
    <div style={{
      position: 'fixed', top: 14, left: '50%',
      transform: 'translateX(-50%)',
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 8,
      padding: '10px 20px',
      color: '#e8e0d0',
      fontSize: 12,
      fontFamily: 'monospace',
      zIndex: 9999,
      whiteSpace: 'nowrap',
      animation: 'fadeUp 0.3s ease-out',
      boxShadow: '0 4px 24px rgba(0,0,0,0.65)',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  );
}
