import { useState, useEffect, useCallback, useRef } from 'react';

export interface ChessAudioControls {
  isMuted: boolean;
  toggleMute: () => void;
  playMoveSound: () => void;
  playCaptureSound: () => void;
  playCheckSound: () => void;
  playVictorySound: () => void;
  playDefeatSound: () => void;
}

const SOUND_STORAGE_KEY = 'chess_sound_muted';

export const useChessAudio = (): ChessAudioControls => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const handleStorageOrCustomSync = () => {
      const current = localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
      setIsMuted(current);
    };

    window.addEventListener('storage', handleStorageOrCustomSync);
    window.addEventListener('chess-sound-toggle', handleStorageOrCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageOrCustomSync);
      window.removeEventListener('chess-sound-toggle', handleStorageOrCustomSync);
    };
  }, []);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const checkIsActuallyMuted = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
  }, []);

  const toggleMute = useCallback(() => {
    const currentlyMuted = localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
    const nextState = !currentlyMuted;
    localStorage.setItem(SOUND_STORAGE_KEY, String(nextState));
    setIsMuted(nextState);
    window.dispatchEvent(new Event('chess-sound-toggle'));
  }, []);

  const playMoveSound = useCallback(() => {
    if (checkIsActuallyMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [checkIsActuallyMuted, getAudioContext]);

  const playCaptureSound = useCallback(() => {
    if (checkIsActuallyMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }, [checkIsActuallyMuted, getAudioContext]);

  const playCheckSound = useCallback(() => {
    if (checkIsActuallyMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    [0, 0.08].forEach((delay, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(index === 0 ? 587.33 : 880, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.12);
    });
  }, [checkIsActuallyMuted, getAudioContext]);

  const playVictorySound = useCallback(() => {
    if (checkIsActuallyMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime + idx * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }, [checkIsActuallyMuted, getAudioContext]);

  const playDefeatSound = useCallback(() => {
    if (checkIsActuallyMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }, [checkIsActuallyMuted, getAudioContext]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    isMuted,
    toggleMute,
    playMoveSound,
    playCaptureSound,
    playCheckSound,
    playVictorySound,
    playDefeatSound,
  };
};
