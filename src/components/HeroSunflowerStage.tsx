import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import type { SurpriseAudioController } from '../hooks/useSurpriseAudio';

interface HeroSunflowerStageProps {
  onPetalSelect: (idx: number, x: number, y: number) => void;
  onAllBloomed: () => void;
  audio: SurpriseAudioController;
}

export const HeroSunflowerStage: React.FC<HeroSunflowerStageProps> = ({
  onPetalSelect,
  onAllBloomed,
  audio
}) => {
  const [openedPetals, setOpenedPetals] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tiltBoxRef = useRef<HTMLDivElement | null>(null);
  const targetTiltRef = useRef({ x: 0, y: 0 });
  const currentTiltRef = useRef({ x: 0, y: 0 });
  const tiltRafRef = useRef<number>(0);

  const stepTilt = () => {
    const dx = targetTiltRef.current.x - currentTiltRef.current.x;
    const dy = targetTiltRef.current.y - currentTiltRef.current.y;
    currentTiltRef.current.x += dx * 0.12;
    currentTiltRef.current.y += dy * 0.12;

    if (tiltBoxRef.current) {
      tiltBoxRef.current.style.transform = `perspective(950px) rotateY(${currentTiltRef.current.x.toFixed(2)}deg) rotateX(${currentTiltRef.current.y.toFixed(2)}deg)`;
    }

    if (Math.abs(dx) > 0.04 || Math.abs(dy) > 0.04) {
      tiltRafRef.current = requestAnimationFrame(stepTilt);
    } else {
      tiltRafRef.current = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    };
  }, []);

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((clientY - rect.top) / rect.height - 0.5) * 2;
    targetTiltRef.current = { x: nx * 11, y: -ny * 11 };
    if (!tiltRafRef.current) {
      tiltRafRef.current = requestAnimationFrame(stepTilt);
    }
  };

  const handlePointerLeave = () => {
    targetTiltRef.current = { x: 0, y: 0 };
    if (!tiltRafRef.current) {
      tiltRafRef.current = requestAnimationFrame(stepTilt);
    }
  };

  const handleSelectPetal = (idx: number, clientX?: number, clientY?: number) => {
    const isNew = !openedPetals.includes(idx);
    const updated = isNew ? [...openedPetals, idx] : openedPetals;
    setOpenedPetals(updated);
    setActiveIndex(idx);

    const cx = clientX ?? (typeof window !== 'undefined' ? window.innerWidth * 0.35 : 400);
    const cy = clientY ?? (typeof window !== 'undefined' ? window.innerHeight * 0.42 : 350);
    onPetalSelect(idx, cx, cy);

    if (isNew && updated.length === SURPRISE_CONFIG.petalMessages.length) {
      onAllBloomed();
    }
  };

  const activePetal = activeIndex !== null ? SURPRISE_CONFIG.petalMessages[activeIndex] : null;
  const totalPetals = SURPRISE_CONFIG.petalMessages.length;
  const progressPct = Math.round((openedPetals.length / totalPetals) * 100);
  const cx = 215;
  const cy = 205;

  const handlePrevPetal = () => {
    const next = activeIndex === null ? 0 : (activeIndex - 1 + totalPetals) % totalPetals;
    handleSelectPetal(next);
  };

  const handleNextPetal = () => {
    const next = activeIndex === null ? 0 : (activeIndex + 1) % totalPetals;
    handleSelectPetal(next);
  };

  return (
    <header
      id="taman"
      className="relative z-10 pt-5 pb-14 sm:pt-9 sm:pb-20 px-4 sm:px-8 max-w-6xl mx-auto scroll-mt-8"
    >
      {/* Clean Editorial Monograph Masthead (Zero-Pill Rule) */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6 sm:mb-9 animate-reveal-smooth">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] font-bold tracking-[0.18em] sm:tracking-[0.22em] uppercase text-amber-800 mb-2">
          <span>{SURPRISE_CONFIG.editionLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{SURPRISE_CONFIG.birthdayDate}</span>
          <span aria-hidden="true">·</span>
          <span className="text-rose-800">
            Untuk {SURPRISE_CONFIG.wifeName}
          </span>
        </div>

        <h1 className="font-editorial text-[2.15rem] sm:text-5xl lg:text-[3.65rem] font-bold tracking-tight text-[#2C1205] leading-[1.06] mb-2.5 sm:mb-3 text-balance">
          {SURPRISE_CONFIG.heroTitle}
        </h1>

        <p className="text-[13px] sm:text-base text-[#6E4726] font-medium leading-[1.7] sm:leading-relaxed max-w-2xl mb-4 px-2 text-pretty">
          {SURPRISE_CONFIG.heroSubtitle}
        </p>

        {/* Male Welcome Voice Control & Live Spoken Dedication Ribbon */}
        <div className="flex flex-col items-center gap-2.5 w-full max-w-xl">
          <button
            type="button"
            onClick={() => (audio.isSpeaking ? audio.stopWelcomeVoice() : audio.playWelcomeVoice())}
            className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-amber-700 ${
              audio.isSpeaking
                ? 'bg-[#2C1205] text-[#FDFBF5] shadow-md'
                : 'surface-monograph text-[#2C1205] hover:bg-amber-100/70'
            }`}
          >
            {audio.isSpeaking ? (
              <VolumeX className="w-4 h-4 text-amber-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-700" />
            )}
            <span>
              {audio.isSpeaking
                ? 'Hentikan Suara Sambutan'
                : `Dengarkan ${SURPRISE_CONFIG.welcomeVoiceLabel}`}
            </span>
          </button>

          {audio.isSpeaking && audio.activeVoiceCaption && (
            <p
              aria-live="polite"
              className="surface-monograph rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-editorial italic font-semibold text-[#2C1205] leading-relaxed text-pretty animate-reveal-smooth"
            >
              “{audio.activeVoiceCaption}”
            </p>
          )}
        </div>
      </div>

      {/* Split Botanical Sunflower + Editorial Whisper Folio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left: 3D-Tilt Interactive 12-Petal Sunflower */}
        <div
          ref={stageRef}
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerLeave}
          className="lg:col-span-6 flex flex-col items-center justify-center select-none"
        >
          <div
            ref={tiltBoxRef}
            className="relative w-full max-w-[268px] sm:max-w-[360px] aspect-square flex items-center justify-center transition-transform duration-300 ease-silky"
          >
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber-300/40 via-yellow-200/30 to-transparent blur-3xl animate-sun-halo pointer-events-none" />

            <svg
              viewBox="0 0 430 470"
              className="w-full h-full overflow-visible drop-shadow-[0_22px_36px_rgba(44,18,5,0.2)]"
              role="img"
              aria-label="Bunga Matahari Interaktif 12 Kelopak"
            >
              <defs>
                <linearGradient id="sunlitStem" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#65A30D" />
                  <stop offset="100%" stopColor="#3F6212" />
                </linearGradient>

                <linearGradient id="sunlitOuterPetal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>

                <linearGradient id="sunlitDormantPetal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="50%" stopColor="#FACC15" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>

                <linearGradient id="sunlitBloomedPetal" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#FDE047" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>

                <radialGradient id="sunlitSeedCenter" cx="42%" cy="38%" r="62%">
                  <stop offset="0%" stopColor="#78350F" />
                  <stop offset="68%" stopColor="#451A03" />
                  <stop offset="100%" stopColor="#290F02" />
                </radialGradient>
              </defs>

              {/* Stem & Leaves */}
              <g>
                <path
                  d={`M${cx} ${cy + 30} Q${cx - 8} 350 ${cx + 4} 465`}
                  stroke="url(#sunlitStem)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M${cx - 3} 330 C145 305, 110 334, 122 362 C142 376, 180 358, ${cx - 3} 342 Z`}
                  fill="url(#sunlitStem)"
                />
                <path
                  d={`M${cx + 2} 375 C276 350, 310 378, 298 406 C278 420, 238 402, ${cx + 2} 387 Z`}
                  fill="url(#sunlitStem)"
                />
              </g>

              {/* 24 Background Petals */}
              <g opacity="0.88">
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = i * 15 + 7.5;
                  return (
                    <path
                      key={`outer-p-${i}`}
                      d={`M${cx} ${cy - 48} C${cx - 18} ${cy - 105}, ${cx - 12} ${cy - 158}, ${cx} ${cy - 172} C${cx + 12} ${cy - 158}, ${cx + 18} ${cy - 105}, ${cx} ${cy - 48} Z`}
                      fill="url(#sunlitOuterPetal)"
                      transform={`rotate(${angle} ${cx} ${cy})`}
                    />
                  );
                })}
              </g>

              {/* 12 Interactive Golden Petals */}
              <g>
                {SURPRISE_CONFIG.petalMessages.map((petal, idx) => {
                  const angle = idx * 30;
                  const isBloomed = openedPetals.includes(idx);
                  const isActive = activeIndex === idx;
                  const rad = ((angle - 90) * Math.PI) / 180;
                  const bx = cx + Math.cos(rad) * 138;
                  const by = cy + Math.sin(rad) * 138;

                  return (
                    <g
                      key={petal.id}
                      onClick={(e) => handleSelectPetal(idx, e.clientX, e.clientY)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectPetal(idx);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={petal.chapter}
                      className="cursor-pointer focus:outline-none"
                      style={{
                        transformOrigin: `${cx}px ${cy}px`,
                        transform: isActive
                          ? 'scale(1.08)'
                          : isBloomed
                          ? 'scale(1.03)'
                          : 'scale(1)',
                        transition:
                          'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease',
                        filter: isActive
                          ? 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.85))'
                          : isBloomed
                          ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.42))'
                          : 'none'
                      }}
                    >
                      <path
                        d={`M${cx} ${cy - 44} C${cx - 24} ${cy - 106}, ${cx - 15} ${cy - 166}, ${cx} ${cy - 185} C${cx + 15} ${cy - 166}, ${cx + 24} ${cy - 106}, ${cx} ${cy - 44} Z`}
                        fill={isBloomed ? 'url(#sunlitBloomedPetal)' : 'url(#sunlitDormantPetal)'}
                        stroke={isActive ? '#451A03' : 'rgba(146, 64, 14, 0.45)'}
                        strokeWidth={isActive ? '2' : '1.2'}
                        transform={`rotate(${angle} ${cx} ${cy})`}
                      />

                      <circle
                        cx={bx}
                        cy={by}
                        r="11"
                        fill={
                          isActive
                            ? '#2C1205'
                            : isBloomed
                            ? '#FDFBF5'
                            : 'rgba(253, 251, 245, 0.94)'
                        }
                        stroke="#B45309"
                        strokeWidth="1.4"
                      />
                      <text
                        x={bx}
                        y={by + 3.5}
                        textAnchor="middle"
                        fill={isActive ? '#FDE047' : '#2C1205'}
                        fontSize="10"
                        fontWeight="800"
                      >
                        {idx + 1}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Fibonacci Seed Core */}
              <g
                onClick={() => {
                  const nextIdx = SURPRISE_CONFIG.petalMessages.findIndex(
                    (_, i) => !openedPetals.includes(i)
                  );
                  handleSelectPetal(nextIdx !== -1 ? nextIdx : 0);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const nextIdx = SURPRISE_CONFIG.petalMessages.findIndex(
                      (_, i) => !openedPetals.includes(i)
                    );
                    handleSelectPetal(nextIdx !== -1 ? nextIdx : 0);
                  }
                }}
                aria-label="Mekarkan kelopak berikutnya"
                className="cursor-pointer focus:outline-none"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r="58"
                  fill="url(#sunlitSeedCenter)"
                  stroke="#F59E0B"
                  strokeWidth="2.8"
                />
                {Array.from({ length: 42 }).map((_, i) => {
                  const r = 34 + (i % 3) * 7.5;
                  const theta = i * 2.39996;
                  return (
                    <circle
                      key={`fib-seed-${i}`}
                      cx={cx + Math.cos(theta) * r}
                      cy={cy + Math.sin(theta) * r}
                      r="1.7"
                      fill="#FACC15"
                      opacity="0.72"
                    />
                  );
                })}
                <text
                  x={cx}
                  y={cy - 3}
                  textAnchor="middle"
                  fill="#FDFBF5"
                  fontSize="9.5"
                  fontWeight="800"
                  letterSpacing="2"
                >
                  SENTUH
                </text>
                <text
                  x={cx}
                  y={cy + 11}
                  textAnchor="middle"
                  fill="#FDE047"
                  fontSize="9.5"
                  fontWeight="800"
                  letterSpacing="2"
                >
                  KELOPAK
                </text>
              </g>
            </svg>
          </div>

          {/* Clean Bloom Progress Bar */}
          <div className="mt-4 flex items-center gap-3.5 px-5 py-2.5 rounded-full surface-monograph tabular-nums">
            <div className="w-32 sm:w-40 h-2 bg-amber-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500 ease-silky"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#2C1205] whitespace-nowrap">
              {openedPetals.length} / {totalPetals} Kelopak Mekar
            </span>
          </div>
        </div>

        {/* Right: Editorial Whisper Folio */}
        <div className="lg:col-span-6">
          <article
            key={activeIndex !== null ? `petal-card-${activeIndex}` : 'petal-card-intro'}
            className="surface-champagne rounded-[1.75rem] sm:rounded-[2rem] pl-5 pr-10 py-6 sm:p-8 relative overflow-hidden animate-reveal-smooth"
          >
            <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-amber-700/15">
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase text-amber-800">
                {activePetal ? activePetal.chapter : 'Dua Belas Bisikan Cinta'}
              </span>
              <span className="text-xs font-semibold text-[#6E4726] tabular-nums whitespace-nowrap shrink-0">
                {activeIndex !== null ? `${activeIndex + 1} / ${totalPetals}` : '0 / 12'}
              </span>
            </div>

            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-[2.1rem] font-bold text-[#2C1205] leading-snug mb-2.5 sm:mb-3 text-balance">
              {activePetal
                ? activePetal.title
                : 'Dua Belas Alasan Mengapa Hidupku Selalu Hangat Bersamamu'}
            </h2>

            <p className="text-[#6E4726] text-[13.5px] sm:text-base font-medium leading-[1.72] sm:leading-relaxed mb-5 text-pretty">
              {activePetal
                ? activePetal.note
                : 'Sentuh salah satu dari dua belas kelopak emas pada bunga matahari ini. Setiap kelopak menyimpan melodi harpa lembut dan bisikan kasihku untukmu.'}
            </p>

            {/* Quick Numbered Selector 1-12: Symmetrical 6x2 grid on mobile, 12-col single row on desktop */}
            <div
              className="grid grid-cols-6 sm:flex sm:flex-wrap items-center justify-items-center gap-1.5 mb-5 max-w-[260px] sm:max-w-none mx-auto sm:mx-0"
              role="tablist"
            >
              {SURPRISE_CONFIG.petalMessages.map((p, idx) => {
                const isAct = activeIndex === idx;
                const isOp = openedPetals.includes(idx);
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={isAct}
                    onClick={(e) => handleSelectPetal(idx, e.clientX, e.clientY)}
                    aria-label={p.chapter}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-200 tabular-nums focus-visible:outline-2 focus-visible:outline-amber-700 ${
                      isAct
                        ? 'bg-[#2C1205] text-[#FDE047] scale-105 shadow-sm'
                        : isOp
                        ? 'bg-amber-200/90 text-[#2C1205] border border-amber-400'
                        : 'bg-white/80 text-[#6E4726] border border-amber-300/70 hover:bg-amber-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="pt-4 sm:pt-5 border-t border-amber-700/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPetal}
                  className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-full surface-monograph text-xs font-bold text-[#2C1205] hover:bg-amber-100/80 transition whitespace-nowrap"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextPetal}
                  className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-full surface-monograph text-xs font-bold text-[#2C1205] hover:bg-amber-100/80 transition whitespace-nowrap"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <a
                href="#surat"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-900 hover:text-amber-700 transition-colors whitespace-nowrap"
              >
                <span>Buka Surat Cinta</span>
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </header>
  );
};
