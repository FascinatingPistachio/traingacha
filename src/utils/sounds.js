/**
 * sounds.js — All SFX for Rail Gacha.
 * Web Audio API synthesis.
 */

let ctx = null;
let muted = false;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function toggleMute() { muted = !muted; return muted; }
export function isMuted()    { return muted; }

function play(fn) { if (muted) return; try { fn(getCtx()); } catch(e) {} }

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

function bandNoise(ac, freq, q, duration, gain = 0.25, delay = 0) {
  const buf  = ac.createBuffer(1, ac.sampleRate * (duration + 0.1), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf;
  const bp  = ac.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.value = freq; bp.Q.value = q;
  const g   = ac.createGain();
  g.gain.setValueAtTime(0, ac.currentTime + delay);
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + delay + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
  src.connect(bp); bp.connect(g); g.connect(ac.destination);
  src.start(ac.currentTime + delay);
  src.stop(ac.currentTime + delay + duration + 0.1);
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

function toneGlide(ac, freq1, freq2, duration, gainVal = 0.12, type = 'sine', delay = 0) {
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq1, ac.currentTime + delay);
  osc.frequency.linearRampToValueAtTime(freq2, ac.currentTime + delay + duration);
  g.gain.setValueAtTime(0, ac.currentTime + delay);
  g.gain.linearRampToValueAtTime(gainVal, ac.currentTime + delay + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
  osc.connect(g); g.connect(ac.destination);
  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + duration + 0.02);
}

// STEAM SOUNDS
export function soundSteamWhistle() {
  play(ac => {
    [440, 880, 1320, 1760].forEach((f, i) => tone(ac, f, 1.1, [0.14,0.11,0.08,0.05][i], 'sine', 0.02));
    bandNoise(ac, 2000, 3, 1.0, 0.07);
  });
}

export function soundSteamHiss() {
  play(ac => {
    bandNoise(ac, 3500, 0.4, 0.7, 0.18);
    bandNoise(ac, 7000, 0.8, 0.5, 0.09);
    tone(ac, 80, 0.5, 0.06, 'sawtooth');
  });
}

export function soundChugChug() {
  play(ac => {
    [0, 0.18, 0.36, 0.54, 0.72, 0.9].forEach(t => {
      bandNoise(ac, 400, 1.5, 0.12, 0.22, t);
      tone(ac, 120, 0.10, 0.10, 'sawtooth', t);
    });
    tone(ac, 60, 1.1, 0.07, 'sawtooth');
  });
}

export function soundBoilerPressure() {
  play(ac => {
    tone(ac, 55, 1.5, 0.12, 'sawtooth');
    tone(ac, 110, 1.2, 0.08, 'square');
    for (let i = 0; i < 8; i++) {
      bandNoise(ac, 200 + Math.random()*300, 4, 0.08, 0.06 + Math.random()*0.06, Math.random()*1.2);
    }
    bandNoise(ac, 2500, 0.6, 1.4, 0.06);
  });
}

export function soundValveClank() {
  play(ac => {
    tone(ac, 800, 0.03, 0.2, 'square');
    tone(ac, 400, 0.06, 0.12, 'sawtooth', 0.01);
    noise(ac, 0.05, 0.15);
  });
}

// DIESEL SOUNDS
export function soundDieselHorn() {
  play(ac => {
    [330, 415, 494].forEach((f, i) => {
      tone(ac, f, 1.4, 0.14, 'sawtooth', i * 0.05);
      tone(ac, f * 2, 1.2, 0.04, 'sine', i * 0.05);
    });
    bandNoise(ac, 1000, 2, 1.2, 0.04);
  });
}

export function soundDieselRumble() {
  play(ac => {
    tone(ac, 90, 1.8, 0.14, 'sawtooth');
    tone(ac, 180, 1.6, 0.08, 'square');
    tone(ac, 270, 1.4, 0.05, 'sawtooth');
    for (let i = 0; i < 5; i++) tone(ac, 600 + Math.random()*200, 0.04, 0.05, 'square', i*0.22);
    bandNoise(ac, 150, 2, 1.5, 0.09);
  });
}

export function soundDieselAccel() {
  play(ac => {
    toneGlide(ac, 80, 160, 1.0, 0.15, 'sawtooth');
    toneGlide(ac, 160, 280, 0.9, 0.08, 'square');
    bandNoise(ac, 300, 2, 0.8, 0.12);
    toneGlide(ac, 2000, 4500, 1.0, 0.05, 'sine');
  });
}

// ELECTRIC SOUNDS
export function soundElectricHum() {
  play(ac => {
    toneGlide(ac, 1200, 3500, 0.8, 0.08, 'sine');
    toneGlide(ac, 2400, 7000, 0.7, 0.04, 'sine');
    for (let i = 0; i < 4; i++) {
      bandNoise(ac, 4000 + Math.random()*2000, 5, 0.04, 0.07, Math.random()*0.5);
    }
  });
}

export function soundElectricSpark() {
  play(ac => {
    noise(ac, 0.03, 0.3);
    tone(ac, 3000, 0.04, 0.15, 'sawtooth');
    tone(ac, 6000, 0.03, 0.08, 'square');
    tone(ac, 120, 0.15, 0.06, 'sawtooth', 0.02);
  });
}

export function soundHighSpeedWhoosh() {
  play(ac => {
    toneGlide(ac, 900, 200, 0.7, 0.10, 'sawtooth');
    bandNoise(ac, 2000, 0.4, 0.5, 0.15);
    bandNoise(ac, 600, 0.6, 0.4, 0.12);
    tone(ac, 80, 0.3, 0.12, 'sine');
  });
}

// ORIGINAL SOUNDS (kept)
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

export function soundBolt() {
  play(ac => {
    tone(ac, 900, 0.06, 0.1, 'square');
    tone(ac, 600, 0.08, 0.06, 'sawtooth', 0.02);
    noise(ac, 0.05, 0.04);
  });
}

export function soundCrane() {
  play(ac => {
    tone(ac, 180, 0.6, 0.08, 'sawtooth');
    tone(ac, 200, 0.6, 0.04, 'square');
    [0.1, 0.25, 0.42].forEach(d => tone(ac, 400 + Math.random()*200, 0.1, 0.05, 'sine', d));
  });
}

export function soundHookAttach() {
  play(ac => {
    tone(ac, 1200, 0.08, 0.12, 'triangle');
    tone(ac, 800,  0.1,  0.08, 'sine', 0.04);
    noise(ac, 0.06, 0.05);
  });
}

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

export function soundFlipCommon()    { play(ac => { tone(ac,440,0.12,0.1,'sine'); tone(ac,660,0.08,0.06,'sine',0.05); noise(ac,0.08,0.04); }); }
export function soundFlipRare()      { play(ac => { tone(ac,523,0.15,0.13,'sine'); tone(ac,784,0.12,0.07,'triangle',0.04); tone(ac,1046,0.1,0.05,'sine',0.09); }); }
export function soundFlipEpic()      { play(ac => { [523,659,784,988,1175].forEach((f,i)=>tone(ac,f,0.14,0.11,'sine',i*0.055)); noise(ac,0.12,0.06); }); }
export function soundFlipLegendary() { play(ac => { tone(ac,110,0.4,0.2,'sawtooth'); [523,659,784].forEach((f,i)=>tone(ac,f,0.5,0.11,'sine',0.05+i*0.02)); [1046,1318,1568,2093].forEach((f,i)=>tone(ac,f,0.18,0.07,'sine',0.12+i*0.07)); noise(ac,0.2,0.07); }); }
export function soundFlipMythic()    { play(ac => {
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

// BATTLE SOUNDS
export function soundBattleVictory() {
  play(ac => {
    const melody = [523,659,784,1046,784,880,1046];
    const times  = [0,0.1,0.2,0.32,0.5,0.62,0.75];
    melody.forEach((f,i) => {
      tone(ac, f, 0.18, 0.18, 'sawtooth', times[i]);
      tone(ac, f*2, 0.15, 0.06, 'sine', times[i]);
    });
    tone(ac, 110, 0.4, 0.18, 'sawtooth', 0.75);
    noise(ac, 0.1, 0.08);
  });
}

export function soundBattleDefeat() {
  play(ac => {
    toneGlide(ac, 440, 220, 0.8, 0.12, 'sawtooth');
    toneGlide(ac, 330, 165, 0.6, 0.08, 'sine', 0.1);
    tone(ac, 110, 0.5, 0.10, 'sine', 0.2);
  });
}

export function soundStatWin() {
  play(ac => {
    tone(ac, 784, 0.12, 0.14, 'sine');
    tone(ac, 1046, 0.15, 0.10, 'sine', 0.08);
    tone(ac, 1568, 0.10, 0.06, 'sine', 0.16);
  });
}

export function soundStatLose() {
  play(ac => {
    tone(ac, 220, 0.15, 0.12, 'sawtooth');
    tone(ac, 165, 0.20, 0.08, 'sine', 0.05);
    noise(ac, 0.08, 0.06);
  });
}

export function soundStatDraw() {
  play(ac => {
    tone(ac, 523, 0.1, 0.08, 'sine');
    tone(ac, 523, 0.1, 0.08, 'sine', 0.12);
  });
}

export function soundPlayCard(trainType) {
  if (trainType === 'steam')    return soundSteamWhistle();
  if (trainType === 'diesel')   return soundDieselHorn();
  if (trainType === 'electric') return soundElectricHum();
  if (trainType === 'maglev')   return soundHighSpeedWhoosh();
  return soundChugChug();
}

export function soundLegendaryBoom() {
  play(ac => {
    tone(ac, 40, 0.8, 0.25, 'sine');
    tone(ac, 60, 0.6, 0.18, 'sawtooth');
    noise(ac, 0.5, 0.22);
    bandNoise(ac, 2500, 0.5, 0.4, 0.15, 0.1);
    tone(ac, 880, 0.3, 0.10, 'sine', 0.2);
  });
}
