import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Flame, Heart, Plus } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import type { SurpriseAudioController } from '../hooks/useSurpriseAudio';

interface SkyLanternWishSectionProps {
  audio: SurpriseAudioController;
  onTriggerBurst: (x: number, y: number, count?: number) => void;
}

type LanternThemeId = 'gold' | 'rose' | 'twilight';

interface LanternTheme {
  id: LanternThemeId;
  label: string;
  bodyGradient: string;
  glowRgba: string;
  ringColor: string;
}

const LANTERN_THEMES: LanternTheme[] = [
  {
    id: 'gold',
    label: 'Emas Hangat',
    bodyGradient: 'from-amber-600 via-amber-300 to-amber-50',
    glowRgba: 'rgba(251, 191, 36, 0.78)',
    ringColor: '#FBBF24'
  },
  {
    id: 'rose',
    label: 'Mawar Senja',
    bodyGradient: 'from-rose-600 via-rose-300 to-amber-50',
    glowRgba: 'rgba(251, 113, 133, 0.78)',
    ringColor: '#FB7185'
  },
  {
    id: 'twilight',
    label: 'Lembayung Cinta',
    bodyGradient: 'from-amber-700 via-rose-400 to-yellow-100',
    glowRgba: 'rgba(244, 114, 182, 0.72)',
    ringColor: '#F59E0B'
  }
];

const SANCTUARY_STARS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: ((i * 37 + 13) % 92) + 4,
  top: ((i * 29 + 7) % 54) + 5,
  size: i % 3 === 0 ? 3 : 2,
  opacity: i % 2 === 0 ? 0.8 : 0.45
}));

interface ReleasedWishItem {
  id: number;
  text: string;
  themeLabel: string;
}

export const SkyLanternWishSection: React.FC<SkyLanternWishSectionProps> = ({
  audio,
  onTriggerBurst
}) => {
  const [holding, setHolding] = useState(false);
  const [charge, setCharge] = useState(0);
  const [released, setReleased] = useState(false);
  const [personalWish, setPersonalWish] = useState('');
  const [sealedWish, setSealedWish] = useState('');
  const [wishHistory, setWishHistory] = useState<ReleasedWishItem[]>([]);
  const [themeId, setThemeId] = useState<LanternThemeId>('gold');
  const [skyLanterns, setSkyLanterns] = useState<
    Array<{
      id: number;
      leftPct: number;
      delaySec: number;
      scale: number;
      wishLabel?: string;
      gradient: string;
      glow: string;
    }>
  >([]);

  const chargeRef = useRef(0);
  const lastTsRef = useRef(0);
  const activeTheme = LANTERN_THEMES.find((t) => t.id === themeId) ?? LANTERN_THEMES[0];

  const launchLanterns = useCallback(
    (wishText?: string) => {
      const batch = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        leftPct: 8 + i * 9.2 + (Math.random() - 0.5) * 4,
        delaySec: i * 0.2,
        scale: i === 4 ? 1.22 : 0.76 + (i % 3) * 0.14,
        wishLabel: i === 4 && wishText ? wishText : undefined,
        gradient: activeTheme.bodyGradient,
        glow: activeTheme.glowRgba
      }));
      setSkyLanterns(batch);
    },
    [activeTheme.bodyGradient, activeTheme.glowRgba]
  );

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - (lastTsRef.current || now)) / 1000, 0.05);
      lastTsRef.current = now;

      if (holding && !released) {
        chargeRef.current = Math.min(1, chargeRef.current + dt / 1.45);
        setCharge(chargeRef.current);

        if (chargeRef.current >= 1) {
          const trimmed = personalWish.trim();
          setReleased(true);
          setHolding(false);
          setSealedWish(trimmed);
          if (trimmed) {
            setWishHistory((prev) => [
              { id: Date.now(), text: trimmed, themeLabel: activeTheme.label },
              ...prev.slice(0, 4)
            ]);
          }
          launchLanterns(trimmed);
          audio.playCelebrationChime();
          onTriggerBurst(window.innerWidth * 0.5, window.innerHeight * 0.52, 95);
          return;
        }
        raf = requestAnimationFrame(tick);
      } else if (!released && chargeRef.current > 0) {
        chargeRef.current = Math.max(0, chargeRef.current - dt * 1.4);
        setCharge(chargeRef.current);
        if (chargeRef.current > 0) {
          raf = requestAnimationFrame(tick);
        }
      }
    };

    if (holding || (!released && chargeRef.current > 0)) {
      lastTsRef.current = performance.now();
      raf = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(raf);
  }, [holding, released, personalWish, activeTheme.label, audio, launchLanterns, onTriggerBurst]);

  const circumference = 2 * Math.PI * 72;
  const dashOffset = circumference * (1 - charge);

  const handleStartHold = () => {
    if (released) {
      launchLanterns(sealedWish);
      audio.playCelebrationChime();
      onTriggerBurst(window.innerWidth * 0.5, window.innerHeight * 0.52, 70);
    } else {
      setHolding(true);
    }
  };

  const handlePrepareAnotherWish = () => {
    chargeRef.current = 0;
    setCharge(0);
    setReleased(false);
    setPersonalWish('');
  };

  return (
    <section
      id="harapan"
      className="relative z-10 py-14 sm:py-28 px-4 sm:px-8 max-w-4xl mx-auto scroll-mt-10"
    >
      {/* Ascending Illuminated Sky Lantern Fleet */}
      {skyLanterns.length > 0 && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-30 overflow-hidden"
        >
          {skyLanterns.map((l) => (
            <div
              key={l.id}
              style={{
                left: `${l.leftPct}%`,
                bottom: '-110px',
                transform: `scale(${l.scale})`,
                animation: `lanternRise 9.8s cubic-bezier(0.22, 1, 0.36, 1) ${l.delaySec}s forwards`
              }}
              className="absolute flex flex-col items-center"
            >
              <div
                style={{ boxShadow: `0 0 36px ${l.glow}` }}
                className={`w-12 h-16 rounded-t-[1.5rem] rounded-b-lg bg-gradient-to-t ${l.gradient} border border-amber-200/70 flex flex-col items-center justify-between py-2 px-1 relative overflow-hidden`}
              >
                <span className="w-full h-px bg-amber-900/15" />
                {l.wishLabel && (
                  <span className="text-[7px] font-bold text-[#2C1205] text-center leading-tight line-clamp-2 px-0.5">
                    {l.wishLabel}
                  </span>
                )}
                <span className="w-3 h-3 rounded-full bg-amber-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Starlit Twilight Night Sanctuary */}
      <article className="surface-twilight rounded-[1.85rem] sm:rounded-[2.25rem] px-5 py-7 sm:p-14 text-center relative overflow-hidden text-[#FDFBF5]">
        {/* Twinkling Stars Canopy */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          {SANCTUARY_STARS.map((s) => (
            <span
              key={s.id}
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity
              }}
              className="absolute rounded-full bg-amber-100"
            />
          ))}
          <div
            className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[520px] h-[220px]"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.22) 0%, transparent 70%)'
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.22em] sm:tracking-[0.24em] uppercase text-amber-300 mb-2.5 sm:mb-3">
            Ritual Lentera Harapan
          </p>

          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#FFFDF7] mb-3 sm:mb-4 max-w-[265px] sm:max-w-xl mx-auto text-balance">
            Terbangkan Doa ke Langit Berbintang
          </h2>

          <p className="text-[13px] sm:text-base text-amber-100/85 font-medium max-w-[262px] sm:max-w-xl mx-auto mb-6 sm:mb-7 leading-[1.72] sm:leading-relaxed text-pretty">
            Pilih cahaya lenteramu, tuliskan satu doa indah di tahun barumu, lalu{' '}
            <strong className="text-amber-200">tekan dan tahan Lentera Cinta</strong> hingga cahayanya penuh dan mengangkasa.
          </p>

          {/* Segmented Glow Theme Selector: Clean single-row 3-col strip on mobile */}
          <div
            role="radiogroup"
            aria-label="Pilih warna cahaya lentera"
            className="w-full max-w-sm sm:w-auto sm:max-w-none grid grid-cols-[1fr_1fr_1.22fr] sm:inline-flex items-center gap-0.5 sm:gap-1 p-1 rounded-full bg-white/10 border border-amber-300/20 mb-5 sm:mb-6"
          >
            {LANTERN_THEMES.map((t) => {
              const selected = themeId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setThemeId(t.id)}
                  className={`px-1.5 sm:px-3.5 py-2 sm:py-1.5 rounded-full text-[10.5px] sm:text-xs font-bold transition-all whitespace-nowrap text-center ${
                    selected
                      ? 'bg-amber-300 text-[#2C1205] shadow-sm'
                      : 'text-amber-100/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {!released && (
            <div className="w-full max-w-md mx-auto mb-6 sm:mb-8">
              <label htmlFor="birthday-wish-input" className="sr-only">
                Tuliskan harapan ulang tahunmu
              </label>
              <input
                id="birthday-wish-input"
                type="text"
                value={personalWish}
                onChange={(e) => setPersonalWish(e.target.value)}
                maxLength={120}
                placeholder="Tulis harapan indahmu di sini..."
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-white/12 border border-amber-300/35 text-xs sm:text-sm text-[#FFFDF7] placeholder:text-amber-100/55 focus:outline-2 focus:outline-amber-300 text-center"
              />
            </div>
          )}

          {/* 3D-Shaded Interactive Hold Silk Lantern */}
          <div className="relative inline-flex items-center justify-center mb-4 sm:mb-8">
            <div
              aria-hidden="true"
              style={{
                opacity: holding ? 0.35 + charge * 0.6 : released ? 0.6 : 0.22,
                background: `radial-gradient(circle, ${activeTheme.glowRgba} 0%, transparent 70%)`
              }}
              className="absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full pointer-events-none transition-opacity duration-200"
            />

            <svg
              className="w-48 h-48 sm:w-60 sm:h-60 -rotate-90 pointer-events-none"
              viewBox="0 0 160 160"
            >
              <circle
                cx="80"
                cy="80"
                r="72"
                stroke="rgba(254, 240, 138, 0.18)"
                strokeWidth="4.5"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="72"
                stroke={activeTheme.ringColor}
                strokeWidth="5.5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>

            <button
              type="button"
              onMouseDown={handleStartHold}
              onMouseUp={() => setHolding(false)}
              onMouseLeave={() => setHolding(false)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleStartHold();
              }}
              onTouchEnd={() => setHolding(false)}
              onKeyDown={(e) => {
                if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                  e.preventDefault();
                  handleStartHold();
                }
              }}
              onKeyUp={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  setHolding(false);
                }
              }}
              aria-label="Tekan dan tahan untuk menerbangkan lentera harapan"
              className={`absolute w-32 h-40 sm:w-36 sm:h-44 rounded-t-[2.4rem] rounded-b-2xl bg-gradient-to-t ${activeTheme.bodyGradient} text-[#2C1205] flex flex-col items-center justify-between py-4 px-2 shadow-[0_18px_46px_rgba(251,191,36,0.45)] border-2 border-amber-200/80 select-none transition-transform duration-200 ease-silky active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-200 overflow-hidden`}
              style={{
                transform: holding
                  ? `scale(${1 + charge * 0.12}) translateY(-${charge * 10}px)`
                  : 'scale(1)'
              }}
            >
              {/* Silk Rib Highlight */}
              <span className="w-16 h-0.5 rounded-full bg-amber-900/20" aria-hidden="true" />

              <div className="flex flex-col items-center">
                <Flame
                  className={`w-8 h-8 mb-1.5 text-[#2C1205] transition-transform ${
                    holding ? 'scale-125' : ''
                  }`}
                />
                <span className="text-[11px] font-extrabold tracking-widest uppercase whitespace-nowrap">
                  {released
                    ? 'Terbangkan Lagi'
                    : holding
                    ? `${Math.round(charge * 100)}% Cahaya`
                    : 'Tahan Lentera'}
                </span>
              </div>

              {/* Brass Lantern Burner Base */}
              <span
                className="w-14 h-1.5 rounded-full bg-amber-900/45 border border-amber-200/40"
                aria-hidden="true"
              />
            </button>
          </div>

          {released && (
            <div className="max-w-2xl mx-auto p-5 sm:p-9 rounded-3xl bg-[#FFFDF8] text-[#2C1205] border border-amber-300/70 text-center shadow-xl animate-reveal-smooth">
              <div className="inline-flex items-center gap-2 text-rose-800 text-[10.5px] sm:text-xs font-extrabold tracking-[0.16em] sm:tracking-[0.2em] uppercase mb-3">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-700 shrink-0" />
                <span>Amin · Lentera Doamu Telah Mengangkasa</span>
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-700 shrink-0" />
              </div>

              {sealedWish && (
                <p className="text-xs sm:text-sm font-semibold text-amber-900 mb-3 text-pretty">
                  Harapanmu: “{sealedWish}”
                </p>
              )}

              <p className="font-editorial italic text-xl sm:text-3xl font-bold text-[#2C1205] leading-relaxed mb-5 sm:mb-6 text-pretty max-w-lg mx-auto">
                “Selamat ulang tahun, {SURPRISE_CONFIG.wifeName}. Semoga cahaya kebahagiaan selalu menyertai setiap langkah kita berdua.”
              </p>

              <button
                type="button"
                onClick={handlePrepareAnotherWish}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full surface-monograph text-xs font-bold text-[#2C1205] hover:bg-amber-100 transition whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-amber-800" />
                <span>Tulis &amp; Terbangkan Doa Baru</span>
              </button>

              {wishHistory.length > 0 && (
                <div className="mt-6 pt-5 border-t border-amber-700/15 text-left">
                  <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-amber-800 mb-2">
                    Jejak Doa yang Telah Terbang
                  </p>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-[#6E4726] font-medium">
                    {wishHistory.map((item) => (
                      <li key={item.id} className="flex items-baseline gap-2">
                        <span className="text-amber-700 shrink-0">{item.themeLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#2C1205] italic">“{item.text}”</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </section>
  );
};
