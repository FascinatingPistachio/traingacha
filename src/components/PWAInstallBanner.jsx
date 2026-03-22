/**
 * PWAInstallBanner.jsx
 *
 * Shows an install prompt for:
 *   1. Chrome Android / Edge Android  → beforeinstallprompt fires → show banner
 *   2. Brave Android                  → beforeinstallprompt fires (same as Chrome)
 *   3. Samsung Internet               → beforeinstallprompt fires
 *   4. Safari iOS                     → no beforeinstallprompt → show manual hint
 *
 * Brave on Android fires beforeinstallprompt just like Chrome because it's
 * Chromium-based. No special handling needed — the same prompt works.
 *
 * The banner is placed ABOVE the bottom nav so it doesn't cover content.
 */
import { useState, useEffect } from 'react';

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function PWAInstallBanner() {
  const [state, setState] = useState('hidden'); // 'hidden' | 'chromium' | 'ios'
  const [prompt, setPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed — don't show
    if (isInStandaloneMode()) return;
    // Already dismissed this session
    if (sessionStorage.getItem('pwa_banner_dismissed')) return;

    // Chromium-based (Chrome, Brave, Edge, Samsung Internet, Opera)
    const handleInstallable = () => {
      if (isInStandaloneMode()) return;
      setPrompt(window._pwaInstallPrompt);
      setState('chromium');
    };

    if (window._pwaInstallPrompt) {
      handleInstallable();
    } else {
      window.addEventListener('pwa-installable', handleInstallable);
    }

    // iOS Safari fallback (after 3s delay so it doesn't flash immediately)
    let iosTimer;
    if (isIOS()) {
      iosTimer = setTimeout(() => {
        if (!isInStandaloneMode() && !sessionStorage.getItem('pwa_banner_dismissed')) {
          setState(s => s === 'hidden' ? 'ios' : s);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('pwa_banner_dismissed', '1');
    setState('hidden');
    setDismissed(true);
  };

  const installChromium = async () => {
    if (!prompt) return;
    try {
      prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') setState('hidden');
    } catch {}
  };

  if (state === 'hidden' || dismissed) return null;

  // ── Chromium banner (Chrome / Brave / Edge / Samsung) ──
  if (state === 'chromium') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        background: 'linear-gradient(135deg,#1a1200,#0d0a00)',
        borderTop: '1px solid rgba(201,168,51,0.3)',
        flexShrink: 0, zIndex: 50,
        animation: 'slideUp 0.35s ease-out',
      }}>
        <div style={{ fontSize: 26, flexShrink: 0 }}>🚂</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontFamily: 'Georgia,serif', fontWeight: 700, color: '#f0e8d0' }}>
            Install Rail Gacha
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', marginTop: 1 }}>
            Add to home screen · Play offline
          </div>
        </div>
        <button
          onClick={installChromium}
          style={{
            background: 'linear-gradient(135deg,#c9a833,#7a5c10)',
            border: 'none', borderRadius: 8,
            padding: '8px 14px', minHeight: 36,
            color: '#1a0e00', fontFamily: 'monospace',
            fontWeight: 700, fontSize: 10, cursor: 'pointer',
            letterSpacing: '.06em', flexShrink: 0,
            boxShadow: '0 2px 10px rgba(201,168,51,0.3)',
          }}
        >
          INSTALL
        </button>
        <button
          onClick={dismiss}
          style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.25)', fontSize: 20,
            cursor: 'pointer', padding: '4px', flexShrink: 0,
            minWidth: 32, minHeight: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>
    );
  }

  // ── iOS Safari hint ──
  if (state === 'ios') {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'linear-gradient(135deg,#0d1828,#060f1c)',
        borderTop: '1px solid rgba(79,168,232,0.3)',
        flexShrink: 0, zIndex: 50,
        animation: 'slideUp 0.35s ease-out',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🚂</span>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 11, fontWeight: 700, color: '#f0e8d0' }}>
            Install Rail Gacha
          </span>
          <button onClick={dismiss} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.3)', fontSize: 18, cursor: 'pointer',
            padding: '2px 4px',
          }}>×</button>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 10, color: 'rgba(200,215,230,0.55)', fontFamily: 'monospace',
          lineHeight: 1.6,
        }}>
          <span>Tap</span>
          <span style={{
            background: 'rgba(79,168,232,0.15)',
            border: '1px solid rgba(79,168,232,0.3)',
            borderRadius: 5, padding: '2px 6px', fontSize: 9,
          }}>⬆ Share</span>
          <span>then</span>
          <span style={{
            background: 'rgba(79,168,232,0.15)',
            border: '1px solid rgba(79,168,232,0.3)',
            borderRadius: 5, padding: '2px 6px', fontSize: 9,
          }}>Add to Home Screen</span>
        </div>
      </div>
    );
  }

  return null;
}
