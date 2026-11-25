import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Lock, Delete, Check } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import type { SurpriseAudioController } from '../hooks/useSurpriseAudio';
import { validatePasscode } from '../utils/surpriseLogic';

interface PasscodeGateProps {
  isUnlocked: boolean;
  onUnlockSuccess: () => void;
  audio: SurpriseAudioController;
}

export const PasscodeGate: React.FC<PasscodeGateProps> = ({
  isUnlocked,
  onUnlockSuccess,
  audio
}) => {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [blooming, setBlooming] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [unmounted, setUnmounted] = useState(isUnlocked);

  const TARGET_CODE = SURPRISE_CONFIG.passcode;

  const verifyCode = useCallback(
    (codeToCheck: string) => {
      if (blooming) return;

      const check = validatePasscode(codeToCheck, TARGET_CODE);
      if (check.isValid) {
        setIsError(false);
        setErrorMessage('');
        setBlooming(true);
        audio.playCelebrationChime();

        setTimeout(() => {
          setFadingOut(true);
          onUnlockSuccess();
          setTimeout(() => setUnmounted(true), 750);
        }, 760);
      } else {
        setIsError(true);
        setErrorMessage('Tanggal belum tepat, coba ingat kembali momen indah kita.');
        audio.playErrorTone();
        setTimeout(() => {
          setIsError(false);
          setPin('');
        }, 620);
      }
    },
    [TARGET_CODE, audio, blooming, onUnlockSuccess]
  );

  const handleDigitPress = useCallback(
    (digit: string) => {
      if (blooming || isError || pin.length >= TARGET_CODE.length) return;
      const next = pin + digit;
      setPin(next);
      setErrorMessage('');
      audio.playKeyTap(next.length - 1);

      if (next.length === TARGET_CODE.length) {
        setTimeout(() => verifyCode(next), 140);
      }
    },
    [TARGET_CODE.length, audio, blooming, isError, pin, verifyCode]
  );

  const handleBackspace = useCallback(() => {
    if (blooming || isError || pin.length === 0) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
    audio.playKeyTap(0);
  }, [audio, blooming, isError, pin.length]);

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

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#FDFBF5] via-[#FAF3E3] to-[#F5E7C6] flex flex-col items-center justify-center p-4 sm:p-6 text-center transition-all duration-700 ease-silky ${
        fadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Kunci Taman Rahasia"
    >
      <div className="absolute w-[300px] h-[300px] sm:w-[460px] sm:h-[460px] rounded-full bg-amber-300/25 blur-3xl animate-sun-halo pointer-events-none" />

      <div
        className={`relative max-w-sm sm:max-w-md w-full surface-champagne rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-9 my-auto transition-transform duration-500 ${
          isError ? 'animate-shake-gentle border-rose-400' : ''
        }`}
      >
        <div className="flex justify-center mb-3 sm:mb-4">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 transition-all duration-700 ease-silky ${
              blooming
                ? 'bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 scale-110 shadow-[0_0_45px_rgba(245,158,11,0.7)]'
                : 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_12px_28px_rgba(198,138,30,0.28)] animate-float-gentle'
            }`}
          >
            <div className="w-full h-full rounded-full bg-[#FDFBF5] border border-amber-300 flex items-center justify-center text-[#2C1205]">
              {blooming ? (
                <Sun className="w-7 h-7 sm:w-9 sm:h-9 text-amber-600" />
              ) : (
                <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-amber-800" />
              )}
            </div>
          </div>
        </div>

        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-amber-800">
          {blooming ? 'Kunci Terbuka' : 'Kunci Taman Rahasia'}
        </p>

        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-[#2C1205] mt-1 mb-1.5 sm:mb-2 text-balance">
          {blooming ? `Selamat Datang, ${SURPRISE_CONFIG.wifeName}` : 'Lembah Matahari & Cinta'}
        </h1>

        <p className="text-xs sm:text-sm text-[#6E4726] max-w-[270px] sm:max-w-sm mx-auto mb-4 sm:mb-6 leading-relaxed text-pretty">
          {blooming ? 'Membuka kejutan spesial untukmu...' : SURPRISE_CONFIG.passcodeHint}
        </p>

        {/* 8 Indikator Pin Emas */}
        <div
          className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3 tabular-nums"
          aria-label={`Sandi terisi ${pin.length} dari 8 digit`}
        >
          {Array.from({ length: TARGET_CODE.length }).map((_, idx) => {
            const filled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-7 h-8 sm:w-8 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  blooming
                    ? 'bg-amber-500 border border-amber-600 text-white scale-105'
                    : isError
                    ? 'bg-rose-50 border border-rose-400 text-rose-700'
                    : filled
                    ? 'bg-amber-400/90 border border-amber-600 text-[#2C1205] scale-105'
                    : 'bg-white/80 border border-amber-300/70'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-transform duration-150 ${
                    filled || blooming ? 'bg-[#2C1205] scale-100' : 'bg-amber-300/50 scale-75'
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="min-h-[20px] mb-3 sm:mb-4 flex items-center justify-center">
          {errorMessage && (
            <p role="alert" className="text-xs font-semibold text-rose-700 animate-reveal-smooth">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Keypad Numerik Sentuh */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[288px] mx-auto select-none">
          {keypadRows.map((row) =>
            row.map((digit) => (
              <button
                key={digit}
                type="button"
                disabled={blooming}
                aria-label={`Angka ${digit}`}
                onClick={() => handleDigitPress(digit)}
                className="h-12 rounded-xl bg-white/90 hover:bg-amber-100/90 active:scale-95 border border-amber-300/75 text-[#2C1205] font-bold text-lg shadow-xs transition-all duration-150 focus-visible:outline-2 focus-visible:outline-amber-600 tabular-nums"
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
            className="h-12 rounded-xl bg-amber-100/70 hover:bg-amber-200/80 active:scale-95 disabled:opacity-40 border border-amber-300/60 text-[#6E4726] font-semibold text-xs flex items-center justify-center gap-1 transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <Delete className="w-4 h-4" />
            <span>Hapus</span>
          </button>

          <button
            type="button"
            disabled={blooming}
            aria-label="Angka 0"
            onClick={() => handleDigitPress('0')}
            className="h-12 rounded-xl bg-white/90 hover:bg-amber-100/90 active:scale-95 border border-amber-300/75 text-[#2C1205] font-bold text-lg shadow-xs transition-all duration-150 focus-visible:outline-2 focus-visible:outline-amber-600 tabular-nums"
          >
            0
          </button>

          <button
            type="button"
            disabled={blooming || pin.length === 0}
            onClick={() => verifyCode(pin)}
            aria-label="Buka Kunci"
            className="h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 active:scale-95 disabled:opacity-45 text-[#2C1205] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-sm transition-all duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-700"
          >
            <Check className="w-4 h-4" />
            <span>Buka</span>
          </button>
        </div>
      </div>
    </div>
  );
};
