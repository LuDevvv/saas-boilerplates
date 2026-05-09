export type ToastSoundType = 'success' | 'error' | 'warning' | 'info' | 'loading';

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  time: number,
  duration: number,
  vol: number,
  destination: AudioNode
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(gain);
  gain.connect(destination);

  osc.start(time);
  osc.stop(time + duration);
};

export const playToastSound = (type: ToastSoundType) => {
  try {
    const ctx = initAudio();
    const now = ctx.currentTime;
    
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, now);
    compressor.knee.setValueAtTime(40, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.attack.setValueAtTime(0, now);
    compressor.release.setValueAtTime(0.25, now);
    compressor.connect(ctx.destination);

    // Refined master volume for a "subtle & quiet" feel
    const masterVol = 0.05; 

    switch (type) {
      case 'success':
        // Ascending chime - short and pure
        playTone(ctx, 523.25, 'sine', now, 0.3, masterVol, compressor); // C5
        playTone(ctx, 659.25, 'sine', now + 0.05, 0.3, masterVol * 0.6, compressor); // E5
        break;
        
      case 'error':
        // Soft thud
        playTone(ctx, 220, 'sine', now, 0.2, masterVol * 0.8, compressor); // A3
        break;
        
      case 'warning':
        // Gentle double blip
        playTone(ctx, 440, 'sine', now, 0.08, masterVol * 0.7, compressor);
        playTone(ctx, 440, 'sine', now + 0.1, 0.08, masterVol * 0.5, compressor);
        break;
        
      case 'info':
      case 'loading':
      default:
        // Tiny pop
        playTone(ctx, 880, 'sine', now, 0.04, masterVol * 0.4, compressor);
        break;
    }
  } catch {
    // Silent fail
  }
};
