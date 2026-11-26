import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Lock, Delete, Check, Heart, Clock } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import type { SurpriseAudioController } from '../hooks/useSurpriseAudio';
import { evaluateUnlockSchedule, validatePasscode } from '../utils/surpriseLogic';

interface PasscodeGateProps {
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  audio: SurpriseAudioController;
}

const GATE_PETALS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  leftPct: 5 + ((i * 7.1 + (i % 3) * 4) % 90),
  delaySec: -((i * 1.35) % 10),
  durationSec: 10 + (i % 5) * 2.2,
  size: 10 + (i % 4) * 3,
  isHeart: i % 3 === 0
}));

export const PasscodeGate: React.FC<PasscodeGateProps> = ({
  isUnlocked,
  onUnlockSuccess,
  audio
}) => {
  const [pin, setPin] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isError, setIsError] = useState(false);
  const [isScheduleDenied, setIsScheduleDenied] = useState(false);
  const [denyBurstKey, setDenyBurstKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [blooming, setBlooming] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [unmounted, setUnmounted] = useState(isUnlocked);

  const TARGET_CODE = SURPRISE_CONFIG.passcode;
  const schedule = evaluateUnlockSchedule(SURPRISE_CONFIG.unlockAt, nowMs);

  useEffect(() => {
    if (isUnlocked || unmounted || !schedule.isScheduleLocked) return;
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isUnlocked, unmounted, schedule.isScheduleLocked]);

  const triggerScheduleDeniedFeedback = useCallback(() => {
    setIsError(false);
    setIsScheduleDenied(true);
    setDenyBurstKey((prev) => prev + 1);
    setErrorMessage(
      `Belum waktunya, Sayang. Tunggu hingga ${schedule.targetDateLabel} (${schedule.targetTimeLabel}) ya.`
    );
    audio.playErrorTone();
    window.setTimeout(() => {
      setIsScheduleDenied(false);
      setPin('');
    }, 850);
  }, [audio, schedule.targetDateLabel, schedule.targetTimeLabel]);

  const verifyCode = useCallback(
    (codeToCheck: string) => {
      if (blooming) return;

      const latestSchedule = evaluateUnlockSchedule(SURPRISE_CONFIG.unlockAt, Date.now());
      if (latestSchedule.isScheduleLocked) {
        triggerScheduleDeniedFeedback();
        return;
      }

      const check = validatePasscode(codeToCheck, TARGET_CODE);
      if (check.isValid) {
        setIsError(false);
        setIsScheduleDenied(false);
        setErrorMessage('');
        setBlooming(true);
        audio.playCelebrationChime();

        setTimeout(() => {
          setFadingOut(true);
          onUnlockSuccess();
          setTimeout(() => setUnmounted(true), 750);
        }, 760);
      } else {
        setIsScheduleDenied(false);
        setIsError(true);
        setErrorMessage('Tanggal belum tepat, coba ingat kembali momen indah kita.');
        audio.playErrorTone();
        setTimeout(() => {
          setIsError(false);
          setPin('');
        }, 620);
      }
    },
    [TARGET_CODE, audio, blooming, onUnlockSuccess, triggerScheduleDeniedFeedback]
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (blooming || isError || isScheduleDenied || pin.length >= TARGET_CODE.length) return;
      const next = pin + digit;
      setPin(next);
      if (!schedule.isScheduleLocked) {
        setErrorMessage('');
      }
      audio.playKeyTap(next.length - 1);

      if (next.length === TARGET_CODE.length) {
        setTimeout(() => verifyCode(next), 140);
      }
    },
    [
      TARGET_CODE.length,
      audio,
      blooming,
      isError,
      isScheduleDenied,
      pin,
      schedule.isScheduleLocked,
      verifyCode
    ]
  );

  const handleBackspace = useCallback(() => {
    if (blooming || isError || isScheduleDenied || pin.length === 0) return;
    setPin((prev) => prev.slice(0, -1));
    if (!schedule.isScheduleLocked) {
      setErrorMessage('');
    }
    audio.playKeyTap(0);
  }, [audio, blooming, isError, isScheduleDenied, pin.length, schedule.isScheduleLocked]);

  useEffect(() => {
    if (isUnlocked) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter' && pin.length > 0) {
        e.preventDefault();
        verifyCode(pin);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleBackspace, handleDigitPress, isUnlocked, pin, verifyCode]);

  if (unmounted || (isUnlocked && !fadingOut)) return null;

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9']
  ];

  const pad2 = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-[#FDFBF5] via-[#FAF2DF] to-[#F5E4BE] flex flex-col items-center p-3 sm:p-5 text-center transition-all duration-700 ease-silky ${
        fadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Kunci Taman Rahasia"
    >
      {/* Ambient Sunlit & Rose-Gold Halos */}
      <div
        aria-hidden="true"
        className="absolute w-[310px] h-[310px] sm:w-[460px] sm:h-[460px] rounded-full bg-amber-300/30 blur-3xl animate-sun-halo pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -right-12 w-[260px] h-[260px] sm:w-[360px] sm:h-[360px] rounded-full bg-rose-300/20 blur-3xl pointer-events-none"
      />

      {/* Romantic Floating Golden Petals & Soft Hearts */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        {GATE_PETALS.map((p) => (
          <div
            key={p.id}
            style={{
              left: `${p.leftPct}%`,
              bottom: '-8vh',
              animationDuration: `${p.durationSec}s`,
              animationDelay: `${p.delaySec}s`
            }}
            className="absolute animate-petal-drift"
          >
            {p.isHeart ? (
              <Heart
                style={{ width: p.size, height: p.size }}
                className="text-rose-400/55 fill-rose-300/45"
              />
            ) : (
              <span
                style={{ width: p.size, height: p.size * 1.45 }}
                className="block rounded-full bg-gradient-to-b from-yellow-200/80 to-amber-400/65 shadow-xs"
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Glass Champagne Entrance Card */}
      <div
        className={`relative shrink-0 max-w-sm sm:max-w-md w-full surface-champagne rounded-[1.75rem] sm:rounded-[2.1rem] px-4 py-4 sm:px-7 sm:py-5 my-auto overflow-hidden animate-gate-enter transition-transform duration-500 ${
          isError || isScheduleDenied ? 'animate-shake-gentle border-rose-400/80' : ''
        }`}
      >
        {/* Subtle Diagonal Golden Foil Shimmer */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/55 to-transparent animate-foil-sweep"
        />

        {/* Orbiting Romantic Crest Medallion */}
        <div className="relative flex justify-center mb-2 sm:mb-2.5">
          <div className="relative flex items-center justify-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 96 96"
              className="absolute w-[68px] h-[68px] sm:w-[78px] sm:h-[78px] text-amber-600/45 animate-orbit-slow pointer-events-none"
            >
              <circle
                cx="48"
                cy="48"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="3 5"
              />
              <circle cx="48" cy="3" r="2.2" fill="#D97706" />
              <circle cx="48" cy="93" r="2.2" fill="#E11D48" />
            </svg>

            {denyBurstKey > 0 && (
              <div
                key={`deny-burst-${denyBurstKey}`}
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-4 h-4 -translate-x-5 text-rose-500 fill-rose-400 animate-burst-heart" />
                <Heart
                  style={{ animationDelay: '0.12s' }}
                  className="w-3.5 h-3.5 translate-x-5 text-amber-500 fill-amber-400 animate-burst-heart"
                />
              </div>
            )}

            <div
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 transition-all duration-700 ease-silky ${
                blooming
                  ? 'bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 scale-110 shadow-[0_0_50px_rgba(245,158,11,0.75)]'
                  : schedule.isScheduleLocked
                  ? 'bg-gradient-to-br from-rose-300 via-amber-400 to-amber-600 shadow-[0_12px_28px_rgba(190,18,60,0.22)] animate-heart-romantic'
                  : 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_12px_28px_rgba(198,138,30,0.28)] animate-float-gentle'
              }`}
            >
              <div className="w-full h-full rounded-full bg-[#FDFBF5] border border-amber-300 flex items-center justify-center text-[#2C1205]">
                {blooming ? (
                  <Sun className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
                ) : schedule.isScheduleLocked ? (
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 fill-rose-400/35" />
                ) : (
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800" />
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[10px] font-bold tracking-[0.22em] uppercase text-amber-800">
          {blooming
            ? 'Kunci Terbuka'
            : schedule.isScheduleLocked
            ? 'Menunggu Hari Spesial'
            : 'Kunci Taman Rahasia'}
        </p>

        <h1 className="relative z-10 font-editorial text-2xl sm:text-3xl font-bold text-[#2C1205] mt-0.5 mb-2 text-balance">
          {blooming ? `Selamat Datang, ${SURPRISE_CONFIG.wifeName}` : 'Lembah Matahari & Cinta'}
        </h1>

        {schedule.isScheduleLocked ? (
          <div className="relative z-10 mb-2.5 sm:mb-3 space-y-2">
            {/* Live Romantic Countdown Strip */}
            <div
              aria-label="Hitung mundur waktu pembukaan"
              className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-[280px] mx-auto tabular-nums"
            >
              {[
                { value: pad2(schedule.days), label: 'Hari' },
                { value: pad2(schedule.hours), label: 'Jam' },
                { value: pad2(schedule.minutes), label: 'Menit' },
                { value: pad2(schedule.seconds), label: 'Detik' }
              ].map((unit, idx) => (
                <div
                  key={unit.label}
                  className={`rounded-xl bg-white/85 border py-1 sm:py-1.5 px-1 shadow-xs transition-colors ${
                    idx === 3 ? 'border-rose-300/80' : 'border-amber-300/75'
                  }`}
                >
                  <div
                    className={`font-editorial text-base sm:text-lg font-bold leading-none ${
                      idx === 3 ? 'text-rose-700' : 'text-[#2C1205]'
                    }`}
                  >
                    {unit.value}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#6E4726] mt-0.5">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Romantic Early-Login Notice Box */}
            <div
              role="status"
              aria-live="polite"
              className={`rounded-2xl border px-3 py-1.5 sm:px-3.5 sm:py-2 transition-all duration-300 max-w-[296px] mx-auto ${
                isScheduleDenied
                  ? 'bg-rose-50/95 border-rose-400 text-rose-800 shadow-sm scale-[1.02]'
                  : 'bg-amber-50/85 border-amber-400/50 text-[#6E4726]'
              }`}
            >
              <p className="text-[11px] sm:text-xs font-bold leading-snug text-pretty">
                <Clock className="inline-block w-3.5 h-3.5 text-rose-700 mr-1.5 -mt-0.5 align-middle" />
                {isScheduleDenied ? 'Belum waktunya, Sayang! Tunggu sampai ' : 'Belum waktunya, Sayang. Tunggu '}
                <strong className="text-[#2C1205] whitespace-nowrap">
                  {schedule.targetDateLabel}
                </strong>{' '}
                <strong className="text-[#2C1205] whitespace-nowrap">
                  · {schedule.targetTimeLabel}
                </strong>
                {isScheduleDenied ? ' ya' : ''}
              </p>
            </div>
          </div>
        ) : (
          <p className="relative z-10 text-xs sm:text-sm text-[#6E4726] max-w-[270px] sm:max-w-sm mx-auto mb-3 sm:mb-4 leading-relaxed text-pretty">
            {blooming ? 'Membuka kejutan spesial untukmu...' : SURPRISE_CONFIG.passcodeHint}
          </p>
        )}

        {/* 8 Indikator Pin Emas */}
        <div
          className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 tabular-nums"
          aria-label={`Sandi terisi ${pin.length} dari 8 digit`}
        >
          {Array.from({ length: TARGET_CODE.length }).map((_, idx) => {
            const filled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  blooming
                    ? 'bg-amber-500 border border-amber-600 text-white scale-105'
                    : isError || isScheduleDenied
                    ? 'bg-rose-50 border border-rose-400 text-rose-700'
                    : filled
                    ? 'bg-amber-400/90 border border-amber-600 text-[#2C1205] scale-105 shadow-xs'
                    : 'bg-white/80 border border-amber-300/70'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-transform duration-150 ${
                    filled || blooming
                      ? 'bg-[#2C1205] animate-dot-pop'
                      : 'bg-amber-300/50 scale-75'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {errorMessage && !schedule.isScheduleLocked && (
          <p role="alert" className="relative z-10 text-xs font-semibold text-rose-700 mb-2 animate-reveal-smooth">
            {errorMessage}
          </p>
        )}

        {/* Keypad Numerik Sentuh */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-2 max-w-[280px] mx-auto select-none">
          {keypadRows.map((row) =>
            row.map((digit) => (
              <button
                key={digit}
                type="button"
                disabled={blooming}
                aria-label={`Angka ${digit}`}
                onClick={() => handleDigitPress(digit)}
                className="h-10 sm:h-11 rounded-xl bg-white/92 hover:bg-amber-100/90 active:scale-95 border border-amber-300/75 text-[#2C1205] font-bold text-base sm:text-lg shadow-xs transition-all duration-150 focus-visible:outline-2 focus-visible:outline-amber-600 tabular-nums"
              >
                {digit}
              </button>
            ))
          )}

          <button
            type="button"
            disabled={blooming || pin.length === 0}
            onClick={handleBackspace}
            aria-label="Hapus"
            className="h-10 sm:h-11 rounded-xl bg-amber-100/70 hover:bg-amber-200/80 active:scale-95 disabled:opacity-40 border border-amber-300/60 text-[#6E4726] font-semibold text-xs flex items-center justify-center gap-1 transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <Delete className="w-4 h-4" />
            <span>Hapus</span>
          </button>

          <button
            type="button"
            disabled={blooming}
            aria-label="Angka 0"
            onClick={() => handleDigitPress('0')}
            className="h-10 sm:h-11 rounded-xl bg-white/92 hover:bg-amber-100/90 active:scale-95 border border-amber-300/75 text-[#2C1205] font-bold text-base sm:text-lg shadow-xs transition-all duration-150 focus-visible:outline-2 focus-visible:outline-amber-600 tabular-nums"
          >
            0
          </button>

          <button
            type="button"
            disabled={blooming || (pin.length === 0 && !schedule.isScheduleLocked)}
            onClick={() => verifyCode(pin)}
            aria-label="Buka Kunci"
            className="h-10 sm:h-11 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 active:scale-95 disabled:opacity-45 text-[#2C1205] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-sm transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-700"
          >
            <Check className="w-4 h-4" />
            <span>Buka</span>
          </button>
        </div>
      </div>
    </div>
  );
};
