import React from 'react';
import {
  Sun,
  BookOpen,
  Camera,
  Gamepad2,
  Flame,
  Disc,
  Volume2,
  VolumeX
} from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import type { SurpriseAudioController } from '../hooks/useSurpriseAudio';

interface UnifiedBottomDockProps {
  activeSection: string;
  audio: SurpriseAudioController;
}

export const UnifiedBottomDock: React.FC<UnifiedBottomDockProps> = ({
  activeSection,
  audio
}) => {
  const navItems = [
    { id: 'taman', label: 'Taman', icon: Sun },
    { id: 'surat', label: 'Surat', icon: BookOpen },
    { id: 'kenangan', label: 'Kenangan', icon: Camera },
    { id: 'game', label: 'Game', icon: Gamepad2 },
    { id: 'harapan', label: 'Harapan', icon: Flame }
  ];

  const isDarkSection = activeSection === 'harapan';

  return (
    <nav
      aria-label="Navigasi Lembah Matahari"
      className={`fixed right-1.5 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 rounded-full backdrop-blur-[2px] border px-1 md:px-1.5 py-2 md:py-3 flex flex-col items-center gap-1.5 md:gap-2 transition-all duration-300 opacity-88 hover:opacity-100 ${
        isDarkSection
          ? 'bg-[#1E0F18]/26 border-amber-300/35 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,245,214,0.22)]'
          : 'bg-[#FFFDF7]/20 md:bg-[#FFFDF7]/28 border-amber-400/35 shadow-[0_8px_24px_-8px_rgba(198,138,30,0.14),inset_0_1px_0_rgba(255,255,255,0.45)]'
      }`}
    >
      {/* Top Solar Emblem: Rotating Golden Music Vinyl */}
      <button
        type="button"
        onClick={audio.toggleBackgroundMusic}
        title={
          audio.isMusicPlaying
            ? `Jeda ${SURPRISE_CONFIG.bgMusicTitle}`
            : `Putar ${SURPRISE_CONFIG.bgMusicTitle}`
        }
        aria-label={audio.isMusicPlaying ? 'Jeda Lagu Latar' : 'Putar Lagu Latar'}
        className="group relative flex flex-col items-center gap-1 focus-visible:outline-2 focus-visible:outline-amber-700 rounded-full"
      >
        <span className="relative w-7 h-7 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-amber-600/80 via-amber-400/80 to-yellow-200/80 p-[2px] flex items-center justify-center shadow-[0_3px_10px_rgba(198,138,30,0.2)]">
          {/* Delicate 12-Ray Solar Corona Ring */}
          <svg
            aria-hidden="true"
            viewBox="0 0 44 44"
            className={`absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] pointer-events-none ${
              isDarkSection ? 'text-amber-300/80' : 'text-amber-600/70'
            } ${audio.isMusicPlaying ? 'animate-spin-vinyl' : ''}`}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="22"
                y1="1"
                x2="22"
                y2="3.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                transform={`rotate(${i * 30} 22 22)`}
              />
            ))}
          </svg>
          <span
            className={`w-full h-full rounded-full bg-[#2C1205]/85 flex items-center justify-center ${
              audio.isMusicPlaying ? 'animate-spin-vinyl' : ''
            }`}
          >
            <Disc className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-300" />
          </span>
        </span>

        <span className="flex items-end gap-[2px] h-2.5" aria-hidden="true">
          <span
            className={`w-[2px] rounded-full ${
              isDarkSection ? 'bg-amber-200/85' : 'bg-amber-900/75'
            } ${audio.isMusicPlaying ? 'eq-1' : 'h-1'}`}
          />
          <span
            className={`w-[2px] rounded-full ${
              isDarkSection ? 'bg-amber-300/90' : 'bg-amber-700/80'
            } ${audio.isMusicPlaying ? 'eq-2' : 'h-2'}`}
          />
          <span
            className={`w-[2px] rounded-full ${
              isDarkSection ? 'bg-amber-200/85' : 'bg-amber-900/75'
            } ${audio.isMusicPlaying ? 'eq-3' : 'h-1'}`}
          />
        </span>

        <span className="hidden md:block pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-[#2C1205]/90 text-[#FDFBF5] text-xs font-bold whitespace-nowrap shadow-md">
          {audio.isMusicPlaying ? `Jeda · ${SURPRISE_CONFIG.bgMusicTitle}` : `Putar · ${SURPRISE_CONFIG.bgMusicTitle}`}
        </span>
      </button>

      <span
        className={`w-3.5 md:w-5 h-px ${isDarkSection ? 'bg-amber-200/25' : 'bg-amber-700/25'}`}
        aria-hidden="true"
      />

      {/* Center Section Links inside Sun Oval */}
      <div className="flex flex-col items-center gap-1 md:gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-label={item.label}
              title={item.label}
              className={`group relative w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-800 ${
                isActive
                  ? isDarkSection
                    ? 'bg-amber-300/92 text-[#2C1205] shadow-sm ring-1.5 ring-amber-200/80 scale-105'
                    : 'bg-[#2C1205]/86 text-[#FDE047] shadow-sm ring-1.5 ring-amber-400/70 scale-105'
                  : isDarkSection
                  ? 'text-amber-100/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] hover:text-white hover:bg-white/15'
                  : 'text-[#2C1205]/85 drop-shadow-[0_1px_1px_rgba(255,253,245,0.9)] hover:text-[#2C1205] hover:bg-amber-200/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5 md:w-[17px] md:h-[17px] shrink-0" />
              <span className="hidden md:block pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 absolute right-full mr-3 px-3 py-1 rounded-full bg-[#2C1205]/90 text-[#FDFBF5] text-xs font-bold whitespace-nowrap shadow-md">
                {item.label}
              </span>
            </a>
          );
        })}
      </div>

      <span
        className={`w-3.5 md:w-5 h-px ${isDarkSection ? 'bg-amber-200/20' : 'bg-amber-800/20'}`}
        aria-hidden="true"
      />

      {/* Bottom Solar Medallion: Male Welcome Voice */}
      <button
        type="button"
        onClick={() =>
          audio.isSpeaking ? audio.stopWelcomeVoice() : audio.playWelcomeVoice()
        }
        title={audio.isSpeaking ? 'Hentikan Suara Sambutan' : 'Dengar Suara Sambutan'}
        aria-label="Dengar Suara Sambutan"
        className={`group relative w-7 h-7 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-amber-800 ${
          audio.isSpeaking
            ? 'bg-rose-800/85 text-[#FDE047] shadow-sm ring-1.5 ring-amber-300'
            : isDarkSection
            ? 'bg-white/12 hover:bg-white/20 border border-amber-300/35 text-amber-100/90 hover:text-white'
            : 'bg-amber-100/30 hover:bg-amber-200/45 border border-amber-500/25 text-[#2C1205]/80 hover:text-[#2C1205]'
        }`}
      >
        {audio.isSpeaking ? (
          <VolumeX className="w-3.5 h-3.5 md:w-[17px] md:h-[17px]" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 md:w-[17px] md:h-[17px]" />
        )}
        <span className="hidden md:block pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 absolute right-full mr-3 px-3 py-1 rounded-full bg-[#2C1205]/90 text-[#FDFBF5] text-xs font-bold whitespace-nowrap shadow-md">
          {audio.isSpeaking ? 'Hentikan Sambutan' : 'Suara Sambutan'}
        </span>
      </button>
    </nav>
  );
};
