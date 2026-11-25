import { useState, useEffect, useCallback } from 'react';
import { Sun, Star } from 'lucide-react';
import { SURPRISE_CONFIG } from './config/surpriseConfig';
import { useSurpriseAudio } from './hooks/useSurpriseAudio';
import {
  LivingSunlightNatureCanvas,
  type PetalBurstEvent
} from './components/LivingSunlightNatureCanvas';
import { PasscodeGate } from './components/PasscodeGate';
import { HeroSunflowerStage } from './components/HeroSunflowerStage';
import { LoveLetterSection } from './components/LoveLetterSection';
import { MemoryShowcase } from './components/MemoryShowcase';
import { SunlitButterflyGame } from './components/SunlitButterflyGame';
import { SkyLanternWishSection } from './components/SkyLanternWishSection';
import { UnifiedBottomDock } from './components/UnifiedBottomDock';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  });
  const [activeSection, setActiveSection] = useState('taman');
  const [petalBurst, setPetalBurst] = useState<PetalBurstEvent | null>(null);

  const audio = useSurpriseAudio();

  const triggerBurst = useCallback((x: number, y: number, count = 65) => {
    setPetalBurst({ id: Date.now() + Math.random(), x, y, count });
  }, []);

  useEffect(() => {
    const ids = ['taman', 'surat', 'kenangan', 'game', 'harapan'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.05 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleUnlockSuccess = useCallback(() => {
    setIsUnlocked(true);
    audio.startBackgroundMusic();
    triggerBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 85);
    setTimeout(() => {
      audio.playWelcomeVoice();
    }, 320);
  }, [audio, triggerBurst]);

  const handlePetalSelect = useCallback(
    (idx: number, x: number, y: number) => {
      audio.playPetalChime(idx);
      triggerBurst(x, y, 22);
    },
    [audio, triggerBurst]
  );

  const handleAllBloomed = useCallback(() => {
    audio.playCelebrationChime();
    triggerBurst(window.innerWidth * 0.35, window.innerHeight * 0.4, 80);
  }, [audio, triggerBurst]);

  return (
    <div className="min-h-screen bg-[#FDFBF5] text-[#2C1205] relative selection:bg-amber-300 selection:text-[#2C1205]">
      {/* 1. Latar Belakang Alam Cerah Golden-Hour (60fps) */}
      <LivingSunlightNatureCanvas petalBurst={petalBurst} />

      {/* 2. Gerbang Sandi Wajib (24022024) */}
      <PasscodeGate
        isUnlocked={isUnlocked}
        onUnlockSuccess={handleUnlockSuccess}
        audio={audio}
      />

      {/* 3–5. Konten Utama */}
      <div>
        {/* 3. Hero Bunga Matahari Heliotropic 12 Kelopak */}
        <HeroSunflowerStage
          onPetalSelect={handlePetalSelect}
          onAllBloomed={handleAllBloomed}
          audio={audio}
        />

        {/* 4. Konten Utama */}
        <main className="relative z-10 divide-y divide-amber-700/15">
          <LoveLetterSection audio={audio} onTriggerBurst={triggerBurst} />

          <MemoryShowcase />

          <SunlitButterflyGame audio={audio} onTriggerBurst={triggerBurst} />

          <SkyLanternWishSection audio={audio} onTriggerBurst={triggerBurst} />
        </main>

        {/* 5. Footer Penutup */}
        <footer className="relative z-10 border-t border-amber-700/15 pt-12 pb-16 px-6 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-amber-700 mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <Sun className="w-4 h-4" />
            <Star className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <p className="font-editorial italic text-xl sm:text-2xl font-bold text-[#2C1205] max-w-xl mx-auto leading-relaxed text-pretty">
            “Di lembah mentari mana pun aku berdiri, kamulah cahaya yang selalu kutuju.”
          </p>
          <p className="text-[11px] sm:text-xs font-bold text-[#6E4726] mt-2.5 tracking-widest uppercase leading-relaxed max-w-md mx-auto text-pretty">
            Dibuat dengan Sepenuh Cinta oleh {SURPRISE_CONFIG.husbandName} untuk{' '}
            {SURPRISE_CONFIG.wifeName}
          </p>
        </footer>
      </div>

      {/* 6. Navbar Oval Tema Matahari di Samping Kanan */}
      <UnifiedBottomDock activeSection={activeSection} audio={audio} />
    </div>
  );
}
