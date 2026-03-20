import { useState, useEffect, useRef } from 'react';
import { AD_DURATION_S, AD_TICKETS } from '../constants.js';

// Simulated ad creative — rotates through a few fake "sponsors".
// In production you'd replace this entire component with your real ad SDK
// (e.g. Google AdSense, AdMob, etc.) and call onComplete when the ad finishes.
const FAKE_ADS = [
  {
    emoji: '🏔️',
    brand: 'PEAK RAIL TOURS',
    tagline: 'Scenic journeys through the Peaks.',
    cta: 'Book now at peakrailtours.com',
    bg: 'linear-gradient(135deg, #0a1e10, #051008)',
    accent: '#4caf50',
  },
  {
    emoji: '📸',
    brand: 'RAILPHOTO WEEKLY',
    tagline: 'The magazine for locomotive enthusiasts.',
    cta: 'Subscribe at railphotoweekly.co.uk',
    bg: 'linear-gradient(135deg, #1a0e08, #100805)',
    accent: '#ff7043',
  },
  {
    emoji: '🗺️',
    brand: 'INTERRAIL PASS',
    tagline: 'Explore Europe by train — your way.',
    cta: 'interrail.eu',
    bg: 'linear-gradient(135deg, #08121e, #050c14)',
    accent: '#4fa8e8',
  },
  {
    emoji: '🚂',
    brand: 'HORNBY MODELS',
    tagline: 'Build the railway you\'ve always imagined.',
    cta: 'hornby.com',
    bg: 'linear-gradient(135deg, #1a0808, #100505)',
    accent: '#ef5350',
  },
];

export default function AdScreen({ onComplete, onSkip }) {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_S);
  const [canSkip,     setCanSkip]     = useState(false);
  const [ad]  = useState(() => FAKE_ADS[Math.floor(Math.random() * FAKE_ADS.length)]);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        if (next <= 5) setCanSkip(true);
        if (next <= 0) {
          clearInterval(timer.current);
          onComplete();
        }
        return Math.max(next, 0);
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [onComplete]);

  const pct = ((AD_DURATION_S - secondsLeft) / AD_DURATION_S) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: ad.accent, transition: 'width 1s linear' }} />
      </div>

      {/* Ad label */}
      <div style={{
        padding: '6px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '.1em' }}>
          ADVERTISEMENT
        </span>
        <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
          {secondsLeft}s
        </span>
      </div>

      {/* Ad creative */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: ad.bg, padding: '30px 24px', gap: 20,
        animation: 'fadeUp 0.3s ease-out',
      }}>
        <div style={{ fontSize: 72, filter: `drop-shadow(0 0 20px ${ad.accent}66)` }}>
          {ad.emoji}
        </div>
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <div style={{
            fontSize: 22, fontWeight: 700, color: ad.accent,
            fontFamily: 'Georgia, serif', marginBottom: 10, letterSpacing: '.02em',
          }}>
            {ad.brand}
          </div>
          <div style={{
            fontSize: 15, color: 'rgba(255,255,255,0.75)',
            fontFamily: 'Georgia, serif', lineHeight: 1.6, marginBottom: 16,
          }}>
            {ad.tagline}
          </div>
          <div style={{
            fontSize: 10, color: 'rgba(255,255,255,0.3)',
            fontFamily: 'monospace', letterSpacing: '.1em',
          }}>
            {ad.cta}
          </div>
        </div>

        {/* Reward callout */}
        <div style={{
          marginTop: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '10px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', letterSpacing: '.1em', marginBottom: 4 }}>
            REWARD FOR WATCHING
          </div>
          <div style={{ fontSize: 16, color: '#c9a833', fontFamily: 'monospace', fontWeight: 700 }}>
            🎫 +{AD_TICKETS} TICKETS
          </div>
        </div>
      </div>

      {/* Skip / countdown */}
      <div style={{
        padding: '14px 16px', flexShrink: 0, textAlign: 'right',
        background: 'rgba(0,0,0,0.6)',
      }}>
        {canSkip ? (
          <button
            onClick={onSkip ?? onComplete}
            style={{
              padding: '8px 20px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 6, color: '#fff',
              fontSize: 11, cursor: 'pointer', fontFamily: 'monospace',
              letterSpacing: '.08em', transition: 'background 0.2s',
            }}
          >
            SKIP AD →
          </button>
        ) : (
          <span style={{
            fontSize: 10, color: 'rgba(255,255,255,0.25)',
            fontFamily: 'monospace', letterSpacing: '.08em',
          }}>
            Skip in {secondsLeft - (AD_DURATION_S - 5)}s
          </span>
        )}
      </div>
    </div>
  );
}
