import { useState, useEffect, useRef } from 'react';
import { AD_DURATION_S, AD_TICKETS } from '../constants.js';

const SKIP_AFTER_S = 5;  // skippable after 5 seconds

const FAKE_ADS = [
  { brand:'PEAK RAIL TOURS',     tagline:'Scenic journeys through the Peak District.',  cta:'peakrailtours.com',     accent:'#4caf50', bg:'linear-gradient(160deg,#0a1e10,#051008)' },
  { brand:'RAILPHOTO WEEKLY',    tagline:'The magazine for locomotive enthusiasts.',      cta:'railphotoweekly.co.uk', accent:'#ff7043', bg:'linear-gradient(160deg,#1a0e08,#100805)' },
  { brand:'INTERRAIL PASS',      tagline:'Explore Europe by train — your way.',           cta:'interrail.eu',          accent:'#4fa8e8', bg:'linear-gradient(160deg,#08121e,#050c14)' },
  { brand:'HORNBY MODEL TRAINS', tagline:"Build the railway you've always imagined.",     cta:'hornby.com',            accent:'#ef5350', bg:'linear-gradient(160deg,#1a0808,#100505)' },
];

// Detect whether an ad blocker is likely active by trying to load a known
// tracking-named URL that ad blockers universally block.
async function detectAdBlocker() {
  try {
    await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
      method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(1500),
    });
    return false;
  } catch {
    return true;
  }
}

export default function AdScreen({ onComplete, onSkip }) {
  const [state,       setState]      = useState('checking'); // checking | blocked | playing | done
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_S);
  const [canSkip,     setCanSkip]    = useState(false);
  const [ad]                         = useState(() => FAKE_ADS[Math.floor(Math.random() * FAKE_ADS.length)]);
  const calledRef = useRef(false);

  // Check for ad blocker first
  useEffect(() => {
    detectAdBlocker().then(blocked => {
      if (blocked) {
        setState('blocked');
      } else {
        setState('playing');
      }
    });
  }, []);

  // Timer — only runs when playing
  useEffect(() => {
    if (state !== 'playing') return;
    const id = setInterval(() => {
      setSecondsLeft(s => {
        const next = s - 1;
        if (next <= AD_DURATION_S - SKIP_AFTER_S) setCanSkip(true);
        if (next <= 0) {
          clearInterval(id);
          if (!calledRef.current) { calledRef.current = true; onComplete?.(); }
        }
        return Math.max(next, 0);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkip = () => {
    if (canSkip && !calledRef.current) {
      calledRef.current = true;
      (onSkip ?? onComplete)?.();
    }
  };

  // Ad blocker detected
  if (state === 'checking') {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:600, background:'#06101c',
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:10, color:'rgba(201,168,51,0.5)', fontFamily:'monospace', animation:'pulse 1.2s infinite' }}>
          LOADING AD…
        </div>
      </div>
    );
  }

  if (state === 'blocked') {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:600, background:'#06101c',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:18, padding:24 }}>
        <div style={{ fontSize:40 }}>🚫</div>
        <div style={{ fontSize:16, color:'#e8e0d0', fontFamily:'Georgia,serif', fontWeight:700, textAlign:'center' }}>
          Ad Blocker Detected
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontFamily:'monospace', textAlign:'center', lineHeight:1.75, maxWidth:280 }}>
          It looks like you're using an ad blocker. Rail Gacha is free to play — ads help keep it running.
          <br/><br/>
          You can still claim your tickets if you disable your ad blocker, or come back later for your free daily bonus.
        </p>
        <button onClick={() => { calledRef.current = true; (onSkip ?? onComplete)?.(); }}
          style={{ padding:'10px 28px', background:'linear-gradient(135deg,#c9a833,#8a6e1a)', border:'none',
            borderRadius:8, color:'#06101c', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'monospace' }}>
          CLOSE
        </button>
      </div>
    );
  }

  const pct = ((AD_DURATION_S - secondsLeft) / AD_DURATION_S) * 100;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, background:'#000', display:'flex', flexDirection:'column' }}>
      {/* Progress bar */}
      <div style={{ height:3, background:'rgba(255,255,255,0.1)', flexShrink:0 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:ad.accent, transition:'width 1s linear' }} />
      </div>

      {/* Labels */}
      <div style={{ padding:'6px 12px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', letterSpacing:'.1em' }}>ADVERTISEMENT</span>
        <span style={{ fontSize:8.5, color:'rgba(255,255,255,0.35)', fontFamily:'monospace' }}>{secondsLeft}s</span>
      </div>

      {/* Creative */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        background:ad.bg, padding:'28px 24px', gap:20, animation:'fadeUp 0.3s ease-out' }}>
        <div style={{ width:68, height:68, borderRadius:16, background:ad.accent+'22',
          border:`2px solid ${ad.accent}44`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:30 }}>🚂</span>
        </div>
        <div style={{ textAlign:'center', maxWidth:300 }}>
          <div style={{ fontSize:21, fontWeight:700, color:ad.accent, fontFamily:'Georgia,serif', marginBottom:8 }}>{ad.brand}</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,0.75)', fontFamily:'Georgia,serif', lineHeight:1.6, marginBottom:14 }}>{ad.tagline}</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'monospace', letterSpacing:'.1em' }}>{ad.cta}</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:8, padding:'9px 18px', textAlign:'center' }}>
          <div style={{ fontSize:8.5, color:'rgba(255,255,255,0.35)', fontFamily:'monospace', letterSpacing:'.1em', marginBottom:3 }}>
            REWARD FOR WATCHING
          </div>
          <div style={{ fontSize:15, color:'#c9a833', fontFamily:'monospace', fontWeight:700 }}>🎫 +{AD_TICKETS} TICKETS</div>
        </div>
      </div>

      {/* Skip */}
      <div style={{ padding:'12px 16px', flexShrink:0, display:'flex', justifyContent:'flex-end', alignItems:'center',
        background:'rgba(0,0,0,0.5)', gap:12 }}>
        {!canSkip && (
          <span style={{ fontSize:10, color:'rgba(255,255,255,0.28)', fontFamily:'monospace' }}>
            Skip in {Math.max(0, SKIP_AFTER_S - (AD_DURATION_S - secondsLeft))}s
          </span>
        )}
        <button
          onClick={canSkip ? handleSkip : undefined}
          style={{
            padding:'7px 18px',
            background: canSkip ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${canSkip ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius:6, color: canSkip ? '#fff' : 'rgba(255,255,255,0.2)',
            fontSize:11, cursor: canSkip ? 'pointer' : 'not-allowed',
            fontFamily:'monospace', letterSpacing:'.08em', transition:'all 0.2s',
          }}
        >
          {canSkip ? 'SKIP AD →' : `SKIP (${Math.max(0, SKIP_AFTER_S - (AD_DURATION_S - secondsLeft))}s)`}
        </button>
      </div>
    </div>
  );
}
