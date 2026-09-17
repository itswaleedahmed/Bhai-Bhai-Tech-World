// Web Audio API synthesized subtle 'pop' sound effect
let lastPopTime = 0;
let sharedAudioCtx: AudioContext | null = null;
let soundEnabled = true;

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('bhaibhai_sound_enabled');
  if (saved !== null) {
    soundEnabled = saved === '1';
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('bhaibhai_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === '1';
    }
  }
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('bhaibhai_sound_enabled', enabled ? '1' : '0');
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays an organic, soft, high-frequency bubble 'pop' sound effect on hover.
 * Zero external audio assets required; uses purely browser Web Audio synthesis.
 * Respects the global sound mute setting.
 */
export function playPopSound(): void {
  if (!isSoundEnabled()) return;

  const now = Date.now();
  // Throttle to avoid repeated firing on micro-mouse jitter
  if (now - lastPopTime < 140) return;
  lastPopTime = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Fast acoustic bubble pitch sweep (sine wave)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(920, t + 0.035);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.08);

    // Subtle, unobtrusive volume curve
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.075, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  } catch {
    // Graceful no-op if audio context fails or browser blocks
  }
}

