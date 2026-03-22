/**
 * PWAInstallBanner.jsx
 * Shows "Add to Home Screen" banner for Chrome/Android PWA install.
 */
import { useState, useEffect } from 'react';

export default function PWAInstallBanner() {
  const [show, setShow]     = useState(false);
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = () => {
      setPrompt(window._pwaInstallPrompt);
      setShow(true);
    };

    if (window._pwaInstallPrompt) {
      handler();
    } else {
      window.addEventListener('pwa-installable', handler);
    }

    return () => window.removeEventListener('pwa-installable', handler);
  }, []);

  if (!show || installed) return null;

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShow(false);
    }
  };

  return (
    <div className="pwa-banner" style={{ zIndex: 9000 }}>
      <div style={{ fontSize: 28 }}>🚂</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontFamily: 'Georgia,serif', fontWeight: 700, color: '#f0e8d0' }}>
          Rail Gacha
        </div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', marginTop: 2 }}>
          Add to home screen for the full app experience
        </div>
      </div>
      <button
        onClick={install}
        style={{
          background: 'linear-gradient(135deg,#c9a833,#8a6d1a)',
          border: 'none', borderRadius: 8, padding: '8px 14px',
          color: '#1a0e00', fontFamily: 'monospace', fontWeight: 700,
          fontSize: 10, cursor: 'pointer', flexShrink: 0,
          letterSpacing: '.06em',
        }}
      >
        INSTALL
      </button>
      <button
        onClick={() => setShow(false)}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
          fontSize: 18, cursor: 'pointer', padding: '4px 6px', flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
