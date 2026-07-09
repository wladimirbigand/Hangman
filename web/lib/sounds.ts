let audioCtx: AudioContext | null = null;
let muted = typeof window !== 'undefined' && localStorage.getItem('pendu_muted') === 'true';

function getCtx(): AudioContext {
  if (!audioCtx) {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextCtor();
  }
  return audioCtx;
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0, gainValue = 0.15) {
  if (muted || typeof window === 'undefined') return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const startAt = ctx.currentTime + delay;
    osc.start(startAt);
    gain.gain.setValueAtTime(gainValue, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
    osc.stop(startAt + duration + 0.02);
  } catch {
    // ignore (contexte audio indisponible avant interaction utilisateur)
  }
}

export const sounds = {
  correct: () => tone(880, 0.15, 'sine'),
  wrong: () => tone(140, 0.35, 'sawtooth'),
  victory: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', i * 0.12, 0.18));
  },
  defeat: () => {
    [400, 300, 200].forEach((f, i) => tone(f, 0.4, 'sawtooth', i * 0.18, 0.15));
  },
  turn: () => tone(600, 0.1, 'sine'),
  tick: () => tone(1000, 0.05, 'square', 0, 0.06),
};

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (typeof window !== 'undefined') localStorage.setItem('pendu_muted', String(value));
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}
