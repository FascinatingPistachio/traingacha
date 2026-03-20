// All sounds generated procedurally via Web Audio API.
// No external files, no network requests.

let ctx = null;
let muted = false;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function toggleMute() { muted = !muted; return muted; }
export function isMuted()    { return muted; }

function play(buildFn) {
  if (muted) return;
  try { buildFn(getCtx()); } catch { /* audio not supported */ }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function noise(ac, duration, gain = 0.3) {
  const buf    = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
  const data   = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(ac.destination);
  src.start();
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  src.stop(ac.currentTime + duration);
}

function tone(ac, freq, duration, gainVal = 0.15, type = 'sine', startDelay = 0) {
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.type      = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime + startDelay);
  g.gain.linearRampToValueAtTime(gainVal, ac.currentTime + startDelay + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startDelay + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(ac.currentTime + startDelay);
  osc.stop(ac.currentTime + startDelay + duration + 0.02);
}

// ── Sound effects ─────────────────────────────────────────────────────────────

/** Pack shake — a light paper rattle */
export function soundPackShake() {
  play((ac) => {
    noise(ac, 0.18, 0.08);
    noise(ac, 0.12, 0.06);
  });
}

/** Paper ripping / tearing */
export function soundTear() {
  play((ac) => {
    // White noise burst shaped like a rip
    const buf  = ac.createBuffer(1, ac.sampleRate * 0.35, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t   = i / ac.sampleRate;
      const env = t < 0.05 ? t / 0.05 : Math.max(0, 1 - (t - 0.05) / 0.3);
      data[i]   = (Math.random() * 2 - 1) * env;
    }
    const src  = ac.createBufferSource();
    src.buffer = buf;

    // High-pass filter to sound papery
    const hp = ac.createBiquadFilter();
    hp.type            = 'highpass';
    hp.frequency.value = 2000;

    const g = ac.createGain();
    g.gain.value = 0.4;

    src.connect(hp);
    hp.connect(g);
    g.connect(ac.destination);
    src.start();
    src.stop(ac.currentTime + 0.4);
  });
}

/** Card sliding out of pack */
export function soundCardSlide() {
  play((ac) => {
    const buf  = ac.createBuffer(1, ac.sampleRate * 0.14, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ac.sampleRate;
      data[i] = (Math.random() * 2 - 1) * (1 - t / 0.14) * 0.4;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    const lp = ac.createBiquadFilter();
    lp.type            = 'lowpass';
    lp.frequency.value = 800;
    const g = ac.createGain();
    g.gain.value = 0.25;
    src.connect(lp);
    lp.connect(g);
    g.connect(ac.destination);
    src.start();
    src.stop(ac.currentTime + 0.18);
  });
}

/** Card flip reveal — common */
export function soundFlipCommon() {
  play((ac) => {
    tone(ac, 440, 0.12, 0.12, 'sine');
    tone(ac, 660, 0.08, 0.06, 'sine', 0.05);
    noise(ac, 0.08, 0.04);
  });
}

/** Card flip reveal — rare (brighter) */
export function soundFlipRare() {
  play((ac) => {
    tone(ac, 523, 0.15, 0.14, 'sine');
    tone(ac, 784, 0.12, 0.08, 'triangle', 0.04);
    tone(ac, 1046, 0.1,  0.05, 'sine',     0.09);
  });
}

/** Card flip reveal — epic (ascending sparkle) */
export function soundFlipEpic() {
  play((ac) => {
    [523, 659, 784, 988, 1175].forEach((f, i) => {
      tone(ac, f, 0.14, 0.12, 'sine', i * 0.055);
    });
    noise(ac, 0.12, 0.06);
  });
}

/** Card flip reveal — legendary (triumphant) */
export function soundFlipLegendary() {
  play((ac) => {
    // Bass hit
    tone(ac, 110, 0.4, 0.22, 'sawtooth');
    // Chord
    [523, 659, 784].forEach((f, i) => {
      tone(ac, f, 0.5, 0.12, 'sine', 0.05 + i * 0.02);
    });
    // Sparkle cascade
    [1046, 1318, 1568, 2093].forEach((f, i) => {
      tone(ac, f, 0.18, 0.07, 'sine', 0.12 + i * 0.07);
    });
    noise(ac, 0.2, 0.08);
  });
}

/** Play the right flip sound based on rarity */
export function soundFlip(rarity) {
  if (rarity === 'L') return soundFlipLegendary();
  if (rarity === 'E') return soundFlipEpic();
  if (rarity === 'R') return soundFlipRare();
  return soundFlipCommon();
}

/** Daily bonus claimed */
export function soundDailyClaim() {
  play((ac) => {
    [392, 523, 659, 784].forEach((f, i) => {
      tone(ac, f, 0.18, 0.1, 'sine', i * 0.07);
    });
  });
}

/** Button click — subtle */
export function soundClick() {
  play((ac) => {
    tone(ac, 600, 0.06, 0.08, 'sine');
  });
}

/** Pack purchased */
export function soundBuy() {
  play((ac) => {
    tone(ac, 440, 0.1,  0.1, 'sine');
    tone(ac, 554, 0.12, 0.1, 'sine', 0.06);
  });
}
