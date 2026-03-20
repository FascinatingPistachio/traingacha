let ctx = null;
let muted = false;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function toggleMute() { muted = !muted; return muted; }
export function isMuted()    { return muted; }

function play(fn) { if (muted) return; try { fn(getCtx()); } catch {} }

function noise(ac, duration, gain = 0.3) {
  const buf  = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const g   = ac.createGain(); g.gain.value = gain;
  src.connect(g); g.connect(ac.destination); src.start();
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  src.stop(ac.currentTime + duration);
}

function tone(ac, freq, duration, gainVal = 0.12, type = 'sine', delay = 0) {
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.type = type; osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ac.currentTime + delay);
  g.gain.linearRampToValueAtTime(gainVal, ac.currentTime + delay + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
  osc.connect(g); g.connect(ac.destination);
  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + duration + 0.02);
}

/** Gentle paper rustle on pack hover */
export function soundPackHover() {
  play(ac => {
    const buf  = ac.createBuffer(1, ac.sampleRate * 0.12, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ac.sampleRate;
      data[i] = (Math.random() * 2 - 1) * (1 - t / 0.12) * 0.18;
    }
    const src = ac.createBufferSource(); src.buffer = buf;
    const hp  = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
    const g   = ac.createGain(); g.gain.value = 0.25;
    src.connect(hp); hp.connect(g); g.connect(ac.destination);
    src.start(); src.stop(ac.currentTime + 0.15);
  });
}

/** Mechanical bolt unscrew click */
export function soundBolt() {
  play(ac => {
    // Metallic click
    tone(ac, 900, 0.06, 0.1, 'square');
    tone(ac, 600, 0.08, 0.06, 'sawtooth', 0.02);
    noise(ac, 0.05, 0.04);
  });
}

/** Crane cable squeak + crank */
export function soundCrane() {
  play(ac => {
    // Winch/motor hum
    tone(ac, 180, 0.6, 0.08, 'sawtooth');
    tone(ac, 200, 0.6, 0.04, 'square');
    // Cable tension creak
    [0.1, 0.25, 0.42].forEach(d => {
      tone(ac, 400 + Math.random()*200, 0.1, 0.05, 'sine', d);
    });
  });
}

/** Hook clink */
export function soundHookAttach() {
  play(ac => {
    tone(ac, 1200, 0.08, 0.12, 'triangle');
    tone(ac, 800,  0.1,  0.08, 'sine', 0.04);
    noise(ac, 0.06, 0.05);
  });
}

/** Card sliding out */
export function soundCardSlide() {
  play(ac => {
    const buf  = ac.createBuffer(1, ac.sampleRate * 0.14, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i/(ac.sampleRate*0.14)) * 0.4;
    }
    const src = ac.createBufferSource(); src.buffer = buf;
    const lp  = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    const g   = ac.createGain(); g.gain.value = 0.22;
    src.connect(lp); lp.connect(g); g.connect(ac.destination);
    src.start(); src.stop(ac.currentTime + 0.18);
  });
}

/** Paper tear */
export function soundTear() {
  play(ac => {
    const buf  = ac.createBuffer(1, ac.sampleRate * 0.32, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ac.sampleRate;
      const env = t < 0.04 ? t/0.04 : Math.max(0, 1-(t-0.04)/0.28);
      data[i] = (Math.random()*2-1) * env;
    }
    const src = ac.createBufferSource(); src.buffer = buf;
    const hp  = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
    const g   = ac.createGain(); g.gain.value = 0.38;
    src.connect(hp); hp.connect(g); g.connect(ac.destination);
    src.start(); src.stop(ac.currentTime + 0.36);
  });
}

/** Card reveal by rarity */
export function soundFlipCommon()    { play(ac => { tone(ac,440,0.12,0.1,'sine'); tone(ac,660,0.08,0.06,'sine',0.05); noise(ac,0.08,0.04); }); }
export function soundFlipRare()      { play(ac => { tone(ac,523,0.15,0.13,'sine'); tone(ac,784,0.12,0.07,'triangle',0.04); tone(ac,1046,0.1,0.05,'sine',0.09); }); }
export function soundFlipEpic()      { play(ac => { [523,659,784,988,1175].forEach((f,i)=>tone(ac,f,0.14,0.11,'sine',i*0.055)); noise(ac,0.12,0.06); }); }
export function soundFlipLegendary() { play(ac => { tone(ac,110,0.4,0.2,'sawtooth'); [523,659,784].forEach((f,i)=>tone(ac,f,0.5,0.11,'sine',0.05+i*0.02)); [1046,1318,1568,2093].forEach((f,i)=>tone(ac,f,0.18,0.07,'sine',0.12+i*0.07)); noise(ac,0.2,0.07); }); }
export function soundFlipMythic()    { play(ac => { // Eerie, ghostly
  tone(ac, 220, 1.2, 0.12, 'sine'); tone(ac, 440, 1.0, 0.08, 'sine', 0.1);
  [330,440,550,660,880].forEach((f,i)=>tone(ac,f,0.3,0.07,'sine',i*0.12));
  noise(ac, 0.3, 0.05);
}); }

export function soundFlip(rarity) {
  if (rarity === 'M') return soundFlipMythic();
  if (rarity === 'L') return soundFlipLegendary();
  if (rarity === 'E') return soundFlipEpic();
  if (rarity === 'R') return soundFlipRare();
  return soundFlipCommon();
}

export function soundDailyClaim() { play(ac => { [392,523,659,784].forEach((f,i)=>tone(ac,f,0.18,0.09,'sine',i*0.07)); }); }
export function soundClick()      { play(ac => tone(ac,600,0.06,0.08,'sine')); }
export function soundBuy()        { play(ac => { tone(ac,440,0.1,0.1,'sine'); tone(ac,554,0.12,0.09,'sine',0.06); }); }
export function soundFavourite()  { play(ac => { tone(ac,880,0.08,0.1,'sine'); tone(ac,1100,0.12,0.08,'sine',0.06); }); }
