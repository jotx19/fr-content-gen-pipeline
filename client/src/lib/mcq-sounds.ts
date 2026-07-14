type Tone = {
  freq: number;
  duration: number;
  delay?: number;
  type?: OscillatorType;
  volume?: number;
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }

  return audioContext;
}

function playTones(tones: Tone[]) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const start = ctx.currentTime;

  for (const tone of tones) {
    const { freq, duration, delay = 0, type = 'sine', volume = 0.12 } = tone;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start + delay);

    gain.gain.setValueAtTime(volume, start + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, start + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start + delay);
    osc.stop(start + delay + duration + 0.02);
  }
}

export function playMcqCorrectSound() {
  playTones([
    { freq: 523.25, duration: 0.1, volume: 0.1 },
    { freq: 659.25, duration: 0.12, delay: 0.08, volume: 0.11 },
    { freq: 783.99, duration: 0.18, delay: 0.16, volume: 0.12 },
  ]);
}

export function playMcqWrongSound() {
  playTones([
    { freq: 220, duration: 0.14, type: 'triangle', volume: 0.11 },
    { freq: 165, duration: 0.22, delay: 0.1, type: 'triangle', volume: 0.1 },
  ]);
}
