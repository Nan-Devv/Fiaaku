import React, { useState } from 'react';
import { Sun, Heart } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import type { SurpriseAudioController } from '../hooks/useSurpriseAudio';

interface LoveLetterSectionProps {
  audio: SurpriseAudioController;
  onTriggerBurst: (x: number, y: number, count?: number) => void;
}

export const LoveLetterSection: React.FC<LoveLetterSectionProps> = ({
  audio,
  onTriggerBurst
}) => {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpenEnvelope = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOpened) return;
    setIsOpened(true);
    audio.playCelebrationChime();
    const cx = e.clientX || (typeof window !== 'undefined' ? window.innerWidth * 0.5 : 500);
    const cy = e.clientY || (typeof window !== 'undefined' ? window.innerHeight * 0.45 : 400);
    onTriggerBurst(cx, cy, 65);
  };

  return (
    <section
      id="surat"
      className="relative z-10 py-14 sm:py-28 px-4 sm:px-8 max-w-4xl mx-auto scroll-mt-10"
    >
      <div className="text-center max-w-xl mx-auto mb-7 sm:mb-10">
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.22em] sm:tracking-[0.24em] uppercase text-amber-800 mb-2">
          Sepucuk Surat Khusus
        </p>
        <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2C1205] text-balance">
          {isOpened ? 'Dari Lubuk Hati Terdalam' : 'Ketuk Segel Lilin Matahari'}
        </h2>
      </div>

      {!isOpened ? (
        <button
          type="button"
          onClick={handleOpenEnvelope}
          aria-label="Ketuk segel lilin matahari untuk membuka surat cinta"
          className="group relative w-full max-w-2xl mx-auto aspect-[5/4] sm:aspect-[16/9] rounded-[1.75rem] sm:rounded-[2rem] surface-champagne overflow-hidden cursor-pointer transition-all duration-500 ease-silky hover:scale-[1.012] hover:border-amber-600/50 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-amber-700"
        >
          <svg
            viewBox="0 0 600 360"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <defs>
              <linearGradient id="sunlitEnvTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(251, 191, 36, 0.22)" />
                <stop offset="100%" stopColor="rgba(254, 243, 199, 0.42)" />
              </linearGradient>
              <linearGradient id="sunlitEnvPocket" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="rgba(245, 158, 11, 0.14)" />
                <stop offset="100%" stopColor="rgba(255, 251, 235, 0.35)" />
              </linearGradient>
            </defs>

            <polygon
              points="0,360 300,165 600,360"
              fill="url(#sunlitEnvPocket)"
              stroke="rgba(198,138,30,0.3)"
              strokeWidth="1.4"
            />
            <polygon
              points="0,0 265,180 0,360"
              fill="rgba(255,255,255,0.28)"
              stroke="rgba(198,138,30,0.2)"
              strokeWidth="1"
            />
            <polygon
              points="600,0 335,180 600,360"
              fill="rgba(255,255,255,0.28)"
              stroke="rgba(198,138,30,0.2)"
              strokeWidth="1"
            />
            <polygon
              points="0,0 300,205 600,0"
              fill="url(#sunlitEnvTop)"
              stroke="rgba(198,138,30,0.4)"
              strokeWidth="1.6"
            />
          </svg>

          <div className="absolute top-4 left-5 sm:top-6 sm:left-7 text-left pointer-events-none">
            <span className="block text-[10px] sm:text-[11px] font-bold tracking-[0.18em] sm:tracking-[0.22em] uppercase text-amber-800">
              Teruntuk Istriku
            </span>
            <span className="font-editorial italic text-xl sm:text-3xl font-bold text-[#2C1205]">
              {SURPRISE_CONFIG.wifeName}
            </span>
          </div>

          <div className="absolute top-4 right-5 sm:top-6 sm:right-7 text-right pointer-events-none">
            <span className="block text-[10px] sm:text-[11px] font-bold tracking-[0.18em] sm:tracking-[0.22em] uppercase text-rose-800/80">
              Dengan Cinta
            </span>
            <span className="font-editorial italic text-base sm:text-lg font-semibold text-[#6E4726]">
              {SURPRISE_CONFIG.husbandName}
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center mt-5 sm:mt-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full surface-romantic-seal p-1.5 sm:p-2 transition-transform duration-300 group-hover:scale-108">
              <div className="w-full h-full rounded-full border-2 border-amber-200/85 bg-gradient-to-tl from-rose-900/90 via-rose-700 to-amber-500 flex flex-col items-center justify-center text-[#FFFDF8] shadow-inner">
                <Heart className="w-7 h-7 sm:w-9 sm:h-9 fill-amber-200/90 text-amber-100" />
              </div>
            </div>
            <span className="mt-3 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full surface-monograph text-[11px] sm:text-xs font-bold tracking-[0.12em] sm:tracking-[0.14em] uppercase text-[#2C1205] group-hover:text-rose-800 whitespace-nowrap">
              Sentuh untuk Membuka Segel
            </span>
          </div>
        </button>
      ) : (
        <article className="relative bg-[#FFFDF8] rounded-[1.75rem] sm:rounded-[2rem] px-6 py-8 sm:p-14 lg:p-16 border border-amber-700/25 shadow-[0_30px_75px_-18px_rgba(44,18,5,0.16)] overflow-hidden animate-reveal-smooth">
          <svg
            aria-hidden="true"
            viewBox="0 0 80 80"
            className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 w-7 h-7 sm:w-14 sm:h-14 text-amber-600/40 pointer-events-none"
          >
            <path
              d="M4 76 V20 Q4 4 20 4 H76 M14 76 V26 Q14 14 26 14 H76"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="22" cy="22" r="2.5" fill="currentColor" />
          </svg>

          <svg
            aria-hidden="true"
            viewBox="0 0 80 80"
            className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 w-7 h-7 sm:w-14 sm:h-14 text-amber-600/40 pointer-events-none rotate-180"
          >
            <path
              d="M4 76 V20 Q4 4 20 4 H76 M14 76 V26 Q14 14 26 14 H76"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="22" cy="22" r="2.5" fill="currentColor" />
          </svg>

          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 sm:gap-3.5 mb-5 sm:mb-7 pb-4 sm:pb-5 border-b border-amber-700/15">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-100 border border-amber-400/50 text-amber-800 shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400/40" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] sm:tracking-[0.2em] uppercase text-amber-800">
                  {SURPRISE_CONFIG.birthdayDate}
                </p>
                <h3 className="font-editorial italic text-2xl sm:text-4xl font-bold text-[#2C1205] leading-tight">
                  {SURPRISE_CONFIG.loveLetter.greeting}
                </h3>
              </div>
            </div>

            <div className="font-editorial text-[18px] sm:text-2xl text-[#2C1205] leading-[1.68] sm:leading-relaxed space-y-4 sm:space-y-5">
              {SURPRISE_CONFIG.loveLetter.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? 'first-letter:float-left first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:mr-2.5 sm:first-letter:mr-3 first-letter:leading-[0.88] first-letter:text-amber-800'
                      : ''
                  }
                >
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-amber-700/15 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className="w-11 h-11 rounded-full surface-romantic-seal flex items-center justify-center text-amber-100 shrink-0"
                >
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-[#6E4726] italic mb-0.5">
                    {SURPRISE_CONFIG.loveLetter.closing}
                  </p>
                  <p className="font-editorial italic text-3xl sm:text-4xl font-bold text-amber-900">
                    {SURPRISE_CONFIG.loveLetter.signature}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpened(false)}
                className="px-5 py-2.5 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-400/60 text-xs font-bold text-[#2C1205] transition whitespace-nowrap"
              >
                Lipat Amplop
              </button>
            </div>
          </div>
        </article>
      )}
    </section>
  );
};
