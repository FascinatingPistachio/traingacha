import { useState, useEffect, useRef } from 'react';
import { AD_DURATION_S, AD_TICKETS } from '../constants.js';

const FAKE_ADS = [
  { brand:'PEAK RAIL TOURS',     tagline:'Scenic journeys through the Peak District.',  cta:'peakrailtours.com',     accent:'#4caf50', bg:'linear-gradient(160deg,#0a1e10,#051008)' },
  { brand:'RAILPHOTO WEEKLY',    tagline:'The magazine for locomotive enthusiasts.',      cta:'railphotoweekly.co.uk', accent:'#ff7043', bg:'linear-gradient(160deg,#1a0e08,#100805)' },
  { brand:'INTERRAIL PASS',      tagline:'Explore Europe by train — your way.',           cta:'interrail.eu',          accent:'#4fa8e8', bg:'linear-gradient(160deg,#08121e,#050c14)' },
  { brand:'HORNBY MODEL TRAINS', tagline:"Build the railway you've always imagined.",     cta:'hornby.com',            accent:'#ef5350', bg:'linear-gradient(160deg,#1a0808,#100505)' },
];

export default function AdScreen({ onComplete, onSkip }) {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_S);
  const [canSkip,     setCanSkip]     = useState(false);
  const [ad]                          = useState(() => FAKE_ADS[Math.floor(Math.random() * FAKE_ADS.length)]);
  const calledRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(s => {
        const next = s - 1;
        if (next <= 5) setCanSkip(true);
        if (next <= 0) {
          clearInterval(id);
          if (!calledRef.current) {
            calledRef.current = true;
            onComplete?.();
          }
        }
        return Math.max(next, 0);
      });
    }, 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkip = () => {
    if (!calledRef.current) {
      calledRef.current = true;
      (onSkip ?? onComplete)?.();
    }
  };

  const pct = ((AD_DURATION_S - secondsLeft) / AD_DURATION_S) * 100;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:600, background:'#000',
      display:'flex', flexDirection:'column',
    }}>
      {/* Progress bar */}
      <div style={{ height:3, background:'rgba(255,255,255,0.1)', flexShrink:0 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:ad.accent, transition:'width 1s linear' }} />
      </div>

      {/* Labels */}
      <div style={{ padding:'6px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', letterSpacing:'.1em' }}>ADVERTISEMENT</span>
        <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.35)', fontFamily:'monospace' }}>{secondsLeft}s</span>
      </div>

      {/* Ad creative */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        background:ad.bg, padding:'30px 24px', gap:22, animation:'fadeUp 0.3s ease-out' }}>
        {/* Brand icon placeholder */}
        <div style={{ width:72, height:72, borderRadius:16, background:ad.accent + '22',
          border:`2px solid ${ad.accent}44`,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:32 }}>🚂</span>
        </div>

        <div style={{ textAlign:'center', maxWidth:300 }}>
          <div style={{ fontSize:22, fontWeight:700, color:ad.accent, fontFamily:'Georgia,serif', marginBottom:10 }}>
            {ad.brand}
          </div>
          <div style={{ fontSize:15, color:'rgba(255,255,255,0.75)', fontFamily:'Georgia,serif', lineHeight:1.6, marginBottom:16 }}>
            {ad.tagline}
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'monospace', letterSpacing:'.1em' }}>
            {ad.cta}
          </div>
        </div>

        {/* Reward */}
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:8, padding:'10px 20px', textAlign:'center' }}>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', letterSpacing:'.1em', marginBottom:4 }}>
            REWARD FOR WATCHING
          </div>
          <div style={{ fontSize:16, color:'#c9a833', fontFamily:'monospace', fontWeight:700 }}>
            🎫 +{AD_TICKETS} TICKETS
          </div>
        </div>
      </div>

      {/* Skip button / countdown */}
      <div style={{ padding:'14px 16px', flexShrink:0, textAlign:'right', background:'rgba(0,0,0,0.5)' }}>
        {canSkip ? (
          <button onClick={handleSkip} style={{
            padding:'8px 20px', background:'rgba(255,255,255,0.1)',
            border:'1px solid rgba(255,255,255,0.25)', borderRadius:6,
            color:'#fff', fontSize:11, cursor:'pointer', fontFamily:'monospace', letterSpacing:'.08em',
          }}>
            SKIP AD →
          </button>
        ) : (
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontFamily:'monospace', letterSpacing:'.08em' }}>
            Skip in {Math.max(0, secondsLeft - (AD_DURATION_S - 5))}s
          </span>
        )}
      </div>
    </div>
  );
}
