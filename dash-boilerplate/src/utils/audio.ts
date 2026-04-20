export type ToastSoundType = 'success' | 'error' | 'warning' | 'info' | 'loading';

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    
    // Create a compressor to make the sounds punchier and cleaner
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, now);
    compressor.knee.setValueAtTime(40, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.attack.setValueAtTime(0, now);
    compressor.release.setValueAtTime(0.25, now);
    compressor.connect(ctx.destination);

    const masterVol = 0.12; // Slightly higher but compressed for clarity

    switch (type) {
      case 'success':
        // Elegant ascending chime
        playTone(ctx, 523.25, 'sine', now, 0.4, masterVol, compressor); // C5
        playTone(ctx, 659.25, 'sine', now + 0.08, 0.5, masterVol * 0.7, compressor); // E5
        break;
        
      case 'error':
        // Gentle but firm low thud
        playTone(ctx, 220, 'triangle', now, 0.3, masterVol * 1.5, compressor); // A3
        playTone(ctx, 164.81, 'triangle', now + 0.05, 0.4, masterVol, compressor); // E3
        break;
        
      case 'warning':
        // Two subtle warning pulses
        playTone(ctx, 440, 'triangle', now, 0.1, masterVol, compressor);
        playTone(ctx, 440, 'triangle', now + 0.12, 0.1, masterVol * 0.8, compressor);
        break;
        
      case 'info':
      case 'loading':
      default:
        // Soft liquid pop/blip
        playTone(ctx, 880, 'sine', now, 0.05, masterVol * 0.5, compressor);
        playTone(ctx, 1200, 'sine', now + 0.02, 0.1, masterVol * 0.3, compressor);
        break;
    }
  } catch (error) {
    console.warn("AudioContext processing failed", error);
  }
};
