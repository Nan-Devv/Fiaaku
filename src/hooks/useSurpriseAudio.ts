import { useState, useEffect, useRef, useCallback } from 'react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import { selectBestMaleVoice } from '../utils/surpriseLogic';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export interface SurpriseAudioController {
  isMusicPlaying: boolean;
  isSpeaking: boolean;
  activeVoiceCaption: string;
  startBackgroundMusic: () => void;
  toggleBackgroundMusic: () => void;
  playWelcomeVoice: () => void;
  stopWelcomeVoice: () => void;
  playKeyTap: (digitIdx?: number) => void;
  playErrorTone: () => void;
  playPetalChime: (idx: number) => void;
  playComboCatchChime: (combo?: number, isSpecial?: boolean) => void;
  playShockwavePulse: () => void;
  playCelebrationChime: () => void;
}

export function useSurpriseAudio(): SurpriseAudioController {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeVoiceCaption, setActiveVoiceCaption] = useState('');

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const useSynthFallbackRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthMasterGainRef = useRef<GainNode | null>(null);
  const synthLoopTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chordStepRef = useRef(0);

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechAbortRef = useRef(false);
  const phraseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const BASE_MUSIC_VOLUME = 0.52;
  const DUCKED_MUSIC_VOLUME = 0.16;

  const ensureAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const master = ctx.createGain();
        master.gain.setValueAtTime(BASE_MUSIC_VOLUME, ctx.currentTime);
        master.connect(ctx.destination);
        audioCtxRef.current = ctx;
        synthMasterGainRef.current = master;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playAcousticNote = useCallback(
    (freq = 523.25, duration = 1.1, volume = 0.07, delay = 0) => {
      try {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        const start = ctx.currentTime + delay;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        const overGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, start);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, start);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, start);

        overGain.gain.setValueAtTime(0.15, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(volume, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        osc1.connect(filter);
        osc2.connect(overGain);
        overGain.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(start);
        osc2.start(start);
        osc1.stop(start + duration + 0.05);
        osc2.stop(start + duration + 0.05);
      } catch {
        // Ignore browser autoplay restrictions until user interacts
      }
    },
    [ensureAudioContext]
  );

  const playWarmAcousticBar = useCallback(() => {
    const ctx = ensureAudioContext();
    const master = synthMasterGainRef.current;
    if (!ctx || !master) return;

    const progressions = [
      [130.81, 261.63, 329.63, 392.0, 493.88, 587.33],
      [110.0, 220.0, 261.63, 329.63, 392.0, 493.88],
      [87.31, 174.61, 220.0, 261.63, 329.63, 392.0],
      [98.0, 196.0, 246.94, 293.66, 349.23, 440.0]
    ];

    const notes = progressions[chordStepRef.current % progressions.length];
    chordStepRef.current += 1;

    notes.forEach((freq, idx) => {
      const start = ctx.currentTime + idx * 0.38;
      const dur = 2.75;

      const osc = ctx.createOscillator();
      const harm = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const noteGain = ctx.createGain();
      const harmGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      harm.type = 'triangle';
      harm.frequency.setValueAtTime(freq * 2, start);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(920, start);

      harmGain.gain.setValueAtTime(0.11, start);

      const peak = idx === 0 ? 0.072 : 0.045;
      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.linearRampToValueAtTime(peak, start + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

      osc.connect(filter);
      harm.connect(harmGain);
      harmGain.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(master);

      osc.start(start);
      harm.start(start);
      osc.stop(start + dur + 0.05);
      harm.stop(start + dur + 0.05);
    });
  }, [ensureAudioContext]);

  const startSynthMusicLoop = useCallback(() => {
    useSynthFallbackRef.current = true;
    ensureAudioContext();
    if (synthLoopTimerRef.current) clearInterval(synthLoopTimerRef.current);
    playWarmAcousticBar();
    synthLoopTimerRef.current = setInterval(playWarmAcousticBar, 2600);
  }, [ensureAudioContext, playWarmAcousticBar]);

  const stopSynthMusicLoop = useCallback(() => {
    if (synthLoopTimerRef.current) {
      clearInterval(synthLoopTimerRef.current);
      synthLoopTimerRef.current = null;
    }
  }, []);

  const audioFileExists = useCallback(async (url: string): Promise<boolean> => {
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (!res.ok) return false;
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (!ct) return true;
      return !ct.includes('text/html');
    } catch {
      return false;
    }
  }, []);

  const startBackgroundMusic = useCallback(async () => {
    setIsMusicPlaying(true);

    if (useSynthFallbackRef.current) {
      startSynthMusicLoop();
      return;
    }

    if (!bgAudioRef.current) {
      const exists = await audioFileExists(SURPRISE_CONFIG.bgMusicUrl);
      if (!exists) {
        startSynthMusicLoop();
        return;
      }
      stopSynthMusicLoop();
      const cacheBustSep = SURPRISE_CONFIG.bgMusicUrl.includes('?') ? '&' : '?';
      const audio = new Audio(`${SURPRISE_CONFIG.bgMusicUrl}${cacheBustSep}v=${Date.now()}`);
      audio.loop = true;
      audio.volume = isSpeaking ? DUCKED_MUSIC_VOLUME : BASE_MUSIC_VOLUME;
      audio.onerror = () => {
        startSynthMusicLoop();
      };
      bgAudioRef.current = audio;
    }

    stopSynthMusicLoop();
    bgAudioRef.current.play().catch(() => {
      startSynthMusicLoop();
    });
  }, [audioFileExists, isSpeaking, startSynthMusicLoop, stopSynthMusicLoop]);

  const toggleBackgroundMusic = useCallback(() => {
    if (isMusicPlaying) {
      setIsMusicPlaying(false);
      if (bgAudioRef.current) bgAudioRef.current.pause();
      stopSynthMusicLoop();
    } else {
      void startBackgroundMusic();
    }
  }, [isMusicPlaying, startBackgroundMusic, stopSynthMusicLoop]);

  // Auto audio-ducking saat suara sambutan pria berbicara
  useEffect(() => {
    const targetVol = isSpeaking ? DUCKED_MUSIC_VOLUME : BASE_MUSIC_VOLUME;

    if (bgAudioRef.current) {
      const audio = bgAudioRef.current;
      const stepTimer = setInterval(() => {
        const diff = targetVol - audio.volume;
        if (Math.abs(diff) < 0.02) {
          audio.volume = targetVol;
          clearInterval(stepTimer);
        } else {
          audio.volume = Math.max(0, Math.min(1, audio.volume + diff * 0.25));
        }
      }, 45);
      return () => clearInterval(stepTimer);
    }

    if (synthMasterGainRef.current && audioCtxRef.current) {
      try {
        synthMasterGainRef.current.gain.setTargetAtTime(
          targetVol,
          audioCtxRef.current.currentTime,
          0.28
        );
      } catch {
        // Ignore audio context ramp errors
      }
    }
  }, [isSpeaking]);

  const stopWelcomeVoice = useCallback(() => {
    speechAbortRef.current = true;
    if (phraseTimerRef.current) {
      clearTimeout(phraseTimerRef.current);
      phraseTimerRef.current = null;
    }
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore speech cancel error
      }
    }
    setIsSpeaking(false);
    setActiveVoiceCaption('');
  }, []);

  const waitForVoices = useCallback((): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve([]);
        return;
      }

      const initial = window.speechSynthesis.getVoices();
      if (initial.length > 0) {
        resolve(initial);
        return;
      }

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        resolve(window.speechSynthesis.getVoices());
      };

      const onVoices = () => finish();
      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
      setTimeout(finish, 350);
    });
  }, []);

  // Studio-tuned male Indonesian welcome voice fallback
  const speakFallbackMaleVoice = useCallback(async () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setActiveVoiceCaption('');
      return;
    }

    speechAbortRef.current = false;
    setIsSpeaking(true);

    const voices = await waitForVoices();
    if (speechAbortRef.current) return;

    const { voice: selectedVoice, pitch, rate } = selectBestMaleVoice(voices);

    const sentences = SURPRISE_CONFIG.welcomeVoiceText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    let idx = 0;
    const speakNext = () => {
      if (speechAbortRef.current || idx >= sentences.length) {
        setIsSpeaking(false);
        setActiveVoiceCaption('');
        return;
      }

      const line = sentences[idx];
      setActiveVoiceCaption(line);

      const utter = new SpeechSynthesisUtterance(line);
      utter.lang = selectedVoice?.lang || 'id-ID';
      utter.pitch = pitch;
      utter.rate = rate;
      utter.volume = 1.0;
      if (selectedVoice) utter.voice = selectedVoice;

      // Fallback timer in case browser headless engine does not fire onend reliably
      const estimatedMs = Math.max(2400, line.length * 72);
      let settled = false;

      const advance = () => {
        if (settled) return;
        settled = true;
        if (phraseTimerRef.current) {
          clearTimeout(phraseTimerRef.current);
          phraseTimerRef.current = null;
        }
        idx += 1;
        if (!speechAbortRef.current && idx < sentences.length) {
          phraseTimerRef.current = setTimeout(speakNext, 320);
        } else {
          setIsSpeaking(false);
          setActiveVoiceCaption('');
        }
      };

      utter.onend = advance;
      utter.onerror = advance;
      phraseTimerRef.current = setTimeout(advance, estimatedMs + 1400);

      try {
        window.speechSynthesis.speak(utter);
      } catch {
        setIsSpeaking(false);
        setActiveVoiceCaption('');
      }
    };

    speakNext();
  }, [waitForVoices]);

  const playWelcomeVoice = useCallback(async () => {
    stopWelcomeVoice();
    speechAbortRef.current = false;

    const exists = await audioFileExists(SURPRISE_CONFIG.welcomeVoiceUrl);
    if (!exists) {
      void speakFallbackMaleVoice();
      return;
    }

    const cacheBustSep = SURPRISE_CONFIG.welcomeVoiceUrl.includes('?') ? '&' : '?';
    const audio = new Audio(`${SURPRISE_CONFIG.welcomeVoiceUrl}${cacheBustSep}v=${Date.now()}`);
    voiceAudioRef.current = audio;
    setIsSpeaking(true);
    setActiveVoiceCaption(SURPRISE_CONFIG.welcomeVoiceText);

    audio.onended = () => {
      setIsSpeaking(false);
      setActiveVoiceCaption('');
    };
    audio.onerror = () => {
      void speakFallbackMaleVoice();
    };

    audio.play().catch(() => {
      void speakFallbackMaleVoice();
    });
  }, [audioFileExists, speakFallbackMaleVoice, stopWelcomeVoice]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      stopWelcomeVoice();
      stopSynthMusicLoop();
      if (bgAudioRef.current) bgAudioRef.current.pause();
    };
  }, [stopSynthMusicLoop, stopWelcomeVoice]);

  return {
    isMusicPlaying,
    isSpeaking,
    activeVoiceCaption,
    startBackgroundMusic,
    toggleBackgroundMusic,
    playWelcomeVoice,
    stopWelcomeVoice,
    playKeyTap: (digitIdx = 0) => {
      const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      playAcousticNote(pentatonic[digitIdx % pentatonic.length], 0.35, 0.045, 0);
    },
    playErrorTone: () => {
      playAcousticNote(220.0, 0.35, 0.055, 0);
      playAcousticNote(196.0, 0.45, 0.055, 0.12);
    },
    playPetalChime: (idx: number) => {
      const notes = [
        523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1396.91, 1567.98, 1760.0,
        2093.0
      ];
      const base = notes[idx % notes.length];
      playAcousticNote(base, 1.15, 0.072, 0);
      playAcousticNote(base * 1.5, 1.35, 0.028, 0.06);
    },
    playComboCatchChime: (combo = 1, isSpecial = false) => {
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
      const freq = scale[Math.min(Math.max(0, combo - 1), scale.length - 1)];
      playAcousticNote(freq, 0.42, 0.062, 0);
      if (isSpecial) {
        playAcousticNote(freq * 1.5, 0.65, 0.042, 0.06);
      }
    },
    playShockwavePulse: () => {
      playAcousticNote(659.25, 0.45, 0.035, 0);
      playAcousticNote(987.77, 0.55, 0.025, 0.05);
    },
    playCelebrationChime: () => {
      [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51, 1567.98].forEach((freq, i) => {
        playAcousticNote(freq, 1.55, 0.072, i * 0.085);
      });
    }
  };
}
