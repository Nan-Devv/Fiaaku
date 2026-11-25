import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Play, Pause, Gift, Magnet, Zap, Copy, Check, Heart } from 'lucide-react';
import { SURPRISE_CONFIG } from '../config/surpriseConfig';
import type { SurpriseAudioController } from '../hooks/useSurpriseAudio';
import {
  computeCatchResult,
  computeRewardProgress,
  getTwilightBlend,
  type GameItemType
} from '../utils/surpriseLogic';

interface SunlitButterflyGameProps {
  audio: SurpriseAudioController;
  onTriggerBurst: (x: number, y: number, count?: number) => void;
}

type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export const SunlitButterflyGame: React.FC<SunlitButterflyGameProps> = ({
  audio,
  onTriggerBurst
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [gameState, setGameState] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('lembah_matahari_best_v2') || '0', 10) || 0;
    } catch {
      return 0;
    }
  });
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [magnetActive, setMagnetActive] = useState(false);
  const [gardenCount, setGardenCount] = useState(0);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const engineRef = useRef({
    status: 'IDLE' as GameStatus,
    width: 640,
    height: 440,
    score: 0,
    lives: 3,
    combo: 0,
    comboTimer: 0,
    magnetTimer: 0,
    rewardUnlocked: false,
    basket: { x: 320, targetX: 320, y: 380, w: 88, h: 40 },
    basketTrail: [] as Array<{ x: number; y: number; alpha: number }>,
    keys: { left: false, right: false },
    items: [] as Array<{
      type: GameItemType;
      x: number;
      y: number;
      r: number;
      vy: number;
      phase: number;
    }>,
    shockwaves: [] as Array<{ x: number; y: number; r: number; alpha: number }>,
    tethers: [] as Array<{ x1: number; y1: number; x2: number; y2: number; alpha: number }>,
    particles: [] as Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
      alpha: number;
    }>,
    flowers: [] as Array<{
      x: number;
      height: number;
      targetHeight: number;
      bloom: number;
      phase: number;
      kind: 'sunflower' | 'rose';
    }>,
    gardenButterflies: [] as Array<{
      baseX: number;
      baseY: number;
      phase: number;
      wingPhase: number;
    }>,
    skyStars: Array.from({ length: 26 }, (_, i) => ({
      rx: ((i * 73 + 17) % 97) / 100,
      ry: ((i * 41 + 11) % 62) / 100,
      r: 0.9 + (i % 3) * 0.65,
      phase: i * 0.7
    })),
    floatingTexts: [] as Array<{ x: number; y: number; text: string; color: string; life: number }>,
    spawnTimer: 0,
    lastTime: 0
  });

  const startLoopRef = useRef<(() => void) | null>(null);
  const drawStaticRef = useRef<(() => void) | null>(null);
  const backdropCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const rebuildBackdrop = (w: number, h: number) => {
      if (!backdropCanvasRef.current) {
        backdropCanvasRef.current = document.createElement('canvas');
      }
      const bg = backdropCanvasRef.current;
      bg.width = Math.max(1, Math.floor(w));
      bg.height = Math.max(1, Math.floor(h));
      const bctx = bg.getContext('2d');
      if (!bctx) return;

      const skyGrad = bctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#FFFDF7');
      skyGrad.addColorStop(0.45, '#FBEFD9');
      skyGrad.addColorStop(0.82, '#F7D7A8');
      skyGrad.addColorStop(1, '#E7F0BE');
      bctx.fillStyle = skyGrad;
      bctx.fillRect(0, 0, w, h);

      const sunGlow = bctx.createRadialGradient(w - 58, 48, 8, w - 58, 48, 150);
      sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
      sunGlow.addColorStop(0.35, 'rgba(253, 224, 71, 0.52)');
      sunGlow.addColorStop(0.7, 'rgba(251, 146, 60, 0.16)');
      sunGlow.addColorStop(1, 'rgba(254, 243, 199, 0)');
      bctx.fillStyle = sunGlow;
      bctx.beginPath();
      bctx.arc(w - 58, 48, 150, 0, Math.PI * 2);
      bctx.fill();

      // Distant soft romantic hill
      bctx.fillStyle = 'rgba(132, 169, 44, 0.34)';
      bctx.beginPath();
      bctx.moveTo(0, h - 20);
      bctx.quadraticCurveTo(w * 0.28, h - 56, w * 0.62, h - 28);
      bctx.quadraticCurveTo(w * 0.85, h - 14, w, h - 42);
      bctx.lineTo(w, h);
      bctx.lineTo(0, h);
      bctx.closePath();
      bctx.fill();

      const groundY = h - 22;
      const meadowGrad = bctx.createLinearGradient(0, groundY - 8, 0, h);
      meadowGrad.addColorStop(0, '#65A30D');
      meadowGrad.addColorStop(1, '#365314');
      bctx.fillStyle = meadowGrad;
      bctx.beginPath();
      bctx.moveTo(0, groundY);
      bctx.quadraticCurveTo(w * 0.5, groundY - 9, w, groundY);
      bctx.lineTo(w, h);
      bctx.lineTo(0, h);
      bctx.closePath();
      bctx.fill();
    };

    const updateSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      engineRef.current.width = rect.width;
      engineRef.current.height = rect.height;
      engineRef.current.basket.y = rect.height - 62;
      engineRef.current.basket.x = Math.min(
        rect.width - 48,
        Math.max(48, engineRef.current.basket.x || rect.width / 2)
      );
      engineRef.current.basket.targetX = engineRef.current.basket.x;
      rebuildBackdrop(rect.width, rect.height);
      drawStaticRef.current?.();
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.keys.right = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engineRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engineRef.current.keys.right = false;
      }
    };
    const clearKeys = () => {
      engineRef.current.keys.left = false;
      engineRef.current.keys.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, []);

  const spawnGardenBloom = useCallback((eng: typeof engineRef.current) => {
    const x = 36 + Math.random() * Math.max(80, eng.width - 72);
    const targetHeight = 46 + Math.random() * 32;
    const kind: 'sunflower' | 'rose' = eng.flowers.length % 3 === 1 ? 'rose' : 'sunflower';
    eng.flowers.push({
      x,
      height: 2,
      targetHeight,
      bloom: 0.1,
      phase: Math.random() * Math.PI * 2,
      kind
    });
    setGardenCount(eng.flowers.length);

    if (eng.flowers.length % 2 === 1 && eng.gardenButterflies.length < 9) {
      eng.gardenButterflies.push({
        baseX: x,
        baseY: eng.height - targetHeight - 36,
        phase: Math.random() * Math.PI * 2,
        wingPhase: Math.random() * Math.PI * 2
      });
    }
  }, []);

  const emitSparkBurst = (
    eng: typeof engineRef.current,
    x: number,
    y: number,
    color: string,
    count = 10
  ) => {
    if (eng.particles.length > 90) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const spd = 45 + Math.random() * 95;
      eng.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 20,
        r: 2 + Math.random() * 2.2,
        color,
        alpha: 1
      });
    }
  };

  const applyItemInteraction = useCallback(
    (eng: typeof engineRef.current, item: { type: GameItemType; x: number; y: number }) => {
      const outcome = computeCatchResult({
        itemType: item.type,
        currentScore: eng.score,
        currentCombo: eng.combo,
        currentLives: eng.lives,
        alreadyUnlockedReward: eng.rewardUnlocked,
        rewardThreshold: SURPRISE_CONFIG.gameReward.targetScore
      });

      if (outcome.isPenalty) {
        eng.lives = outcome.nextLives;
        eng.combo = outcome.nextCombo;
        eng.comboTimer = 0;
        setLives(eng.lives);
        setCombo(0);
        audio.playErrorTone();
        emitSparkBurst(eng, item.x, item.y, '#94A3B8', 8);
        eng.floatingTexts.push({
          x: item.x,
          y: item.y - 12,
          text: 'Gerimis · Combo Reset',
          color: '#BE123C',
          life: 1
        });
        if (eng.lives <= 0) {
          eng.status = 'GAMEOVER';
          setGameState('GAMEOVER');
        }
        return;
      }

      eng.score = outcome.nextScore;
      eng.combo = outcome.nextCombo;
      eng.comboTimer = 3.4;
      setScore(eng.score);
      setCombo(eng.combo);

      if (outcome.activateMagnetSeconds > 0) {
        eng.magnetTimer = outcome.activateMagnetSeconds;
        setMagnetActive(true);
      }

      const isSpecial = item.type !== 'SUNBEAM';
      audio.playComboCatchChime(eng.combo, isSpecial);

      let labelColor = '#9F1239';
      let burstColor = '#FB7185';
      if (item.type === 'FIREFLY') {
        labelColor = '#B45309';
        burstColor = '#FBBF24';
      } else if (item.type === 'PETAL') {
        labelColor = '#D97706';
        burstColor = '#FACC15';
      } else if (item.type === 'MAGNET') {
        labelColor = '#0284C7';
        burstColor = '#38BDF8';
      }

      emitSparkBurst(eng, item.x, item.y, burstColor, isSpecial ? 12 : 8);

      const bonusTag = outcome.multiplier > 1 ? ` (x${outcome.multiplier})` : '';
      const extraTag =
        item.type === 'MAGNET' ? ' MAGNET' : item.type === 'PETAL' ? ' +Bunga' : '';

      eng.floatingTexts.push({
        x: item.x,
        y: item.y - 12,
        text: `+${outcome.gainedPoints}${bonusTag}${extraTag}`,
        color: labelColor,
        life: 1
      });

      setHighScore((prev) => {
        const best = Math.max(prev, eng.score);
        try {
          localStorage.setItem('lembah_matahari_best_v2', String(best));
        } catch {
          // Ignore storage errors
        }
        return best;
      });

      for (let f = 0; f < outcome.flowersToGrow; f++) {
        spawnGardenBloom(eng);
      }

      if (outcome.unlockedReward && !eng.rewardUnlocked) {
        eng.rewardUnlocked = true;
        eng.status = 'PAUSED';
        setRewardUnlocked(true);
        setGameState('PAUSED');
        setShowRewardModal(true);
        audio.playCelebrationChime();
        onTriggerBurst(window.innerWidth * 0.5, window.innerHeight * 0.45, 85);
      }
    },
    [audio, onTriggerBurst, spawnGardenBloom]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;

    const drawBloomedPlant = (
      f: {
        x: number;
        height: number;
        bloom: number;
        phase: number;
        kind: 'sunflower' | 'rose';
      },
      groundY: number
    ) => {
      const sway = Math.sin(f.phase) * 4.5;
      const topX = f.x + sway;
      const topY = groundY - f.height;

      ctx.strokeStyle = '#3F6212';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(f.x, groundY + 2);
      ctx.quadraticCurveTo(f.x, groundY - f.height * 0.5, topX, topY);
      ctx.stroke();

      ctx.save();
      ctx.translate(topX, topY);
      ctx.scale(f.bloom, f.bloom);

      if (f.kind === 'rose') {
        ctx.fillStyle = '#E11D48';
        for (let p = 0; p < 6; p++) {
          ctx.rotate((Math.PI * 2) / 6);
          ctx.beginPath();
          ctx.arc(0, -5.5, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#FB7185';
        ctx.beginPath();
        ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFE4E6';
        ctx.beginPath();
        ctx.arc(-1, -1, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#F59E0B';
        for (let p = 0; p < 12; p++) {
          ctx.rotate((Math.PI * 2) / 12);
          ctx.beginPath();
          ctx.ellipse(0, -11, 3.8, 8.8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#451A03';
        ctx.beginPath();
        ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawHeart = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy + size * 0.35);
      ctx.bezierCurveTo(
        cx - size * 0.9,
        cy - size * 0.35,
        cx - size * 0.45,
        cy - size * 1.05,
        cx,
        cy - size * 0.35
      );
      ctx.bezierCurveTo(
        cx + size * 0.45,
        cy - size * 1.05,
        cx + size * 0.9,
        cy - size * 0.35,
        cx,
        cy + size * 0.35
      );
      ctx.closePath();
    };

    let lastPlayDraw = 0;
    const renderFrame = (now: number) => {
      animId = 0;
      const eng = engineRef.current;
      if (eng.status === 'PLAYING' && lastPlayDraw && now - lastPlayDraw < 30) {
        animId = requestAnimationFrame(renderFrame);
        return;
      }
      lastPlayDraw = now;
      const dt = Math.min((now - (eng.lastTime || now)) / 1000, 0.05);
      eng.lastTime = now;

      const w = eng.width;
      const h = eng.height;
      const groundY = h - 22;
      ctx.clearRect(0, 0, w, h);

      if (backdropCanvasRef.current && backdropCanvasRef.current.width > 0) {
        ctx.drawImage(backdropCanvasRef.current, 0, 0, w, h);
      } else {
        ctx.fillStyle = '#FDFBF5';
        ctx.fillRect(0, 0, w, h);
      }

      // Romantic sky transition from Golden Hour toward Starry Rose Dusk as score rises
      const twilight = getTwilightBlend(eng.score, SURPRISE_CONFIG.gameReward.targetScore);
      if (twilight > 0.02) {
        const duskGrad = ctx.createLinearGradient(0, 0, 0, h - 22);
        duskGrad.addColorStop(0, `rgba(49, 22, 35, ${(twilight * 0.62).toFixed(3)})`);
        duskGrad.addColorStop(0.55, `rgba(159, 18, 57, ${(twilight * 0.28).toFixed(3)})`);
        duskGrad.addColorStop(1, `rgba(245, 158, 11, ${(twilight * 0.14).toFixed(3)})`);
        ctx.fillStyle = duskGrad;
        ctx.fillRect(0, 0, w, h - 20);

        if (twilight > 0.18) {
          eng.skyStars.forEach((st) => {
            const tw = 0.35 + 0.65 * Math.abs(Math.sin(now * 0.002 + st.phase));
            ctx.fillStyle = `rgba(254, 240, 138, ${(twilight * tw * 0.85).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(st.rx * w, st.ry * (h - 40), st.r, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      if (eng.status === 'PLAYING') {
        const prevBasketX = eng.basket.x;
        const moveSpeed = 540;
        if (eng.keys.left) eng.basket.targetX -= moveSpeed * dt;
        if (eng.keys.right) eng.basket.targetX += moveSpeed * dt;
        eng.basket.targetX = Math.max(46, Math.min(w - 46, eng.basket.targetX));
        eng.basket.x += (eng.basket.targetX - eng.basket.x) * 0.25;

        if (Math.abs(eng.basket.x - prevBasketX) > 1.2) {
          eng.basketTrail.push({ x: eng.basket.x, y: eng.basket.y + 4, alpha: 0.72 });
          if (eng.basketTrail.length > 14) eng.basketTrail.shift();
        }

        if (eng.comboTimer > 0) {
          eng.comboTimer -= dt;
          if (eng.comboTimer <= 0) {
            eng.combo = 0;
            setCombo(0);
          }
        }
        if (eng.magnetTimer > 0) {
          eng.magnetTimer -= dt;
          if (eng.magnetTimer <= 0) {
            eng.magnetTimer = 0;
            setMagnetActive(false);
          }
        }

        eng.spawnTimer += dt;
        const spawnInterval = Math.max(0.4, 0.8 - eng.score * 0.0012);
        if (eng.spawnTimer >= spawnInterval) {
          eng.spawnTimer = 0;
          const r = Math.random();
          let type: GameItemType = 'SUNBEAM';
          let speed = 152 + Math.min(eng.score * 0.42, 185);

          if (r > 0.85) {
            type = 'CLOUD';
            speed *= 1.04;
          } else if (r > 0.76) {
            type = 'MAGNET';
            speed *= 1.08;
          } else if (r > 0.64) {
            type = 'PETAL';
            speed *= 1.12;
          } else if (r > 0.42) {
            type = 'FIREFLY';
            speed *= 1.06;
          }

          eng.items.push({
            type,
            x: 36 + Math.random() * Math.max(60, w - 72),
            y: -26,
            r: type === 'CLOUD' ? 22 : 17,
            vy: speed,
            phase: Math.random() * Math.PI * 2
          });
        }

        for (let i = eng.shockwaves.length - 1; i >= 0; i--) {
          const sw = eng.shockwaves[i];
          sw.r += 370 * dt;
          sw.alpha -= 1.85 * dt;
          if (sw.alpha <= 0) {
            eng.shockwaves.splice(i, 1);
            continue;
          }

          for (let j = eng.items.length - 1; j >= 0; j--) {
            const item = eng.items[j];
            if (item.type === 'CLOUD') continue;
            const d = Math.hypot(item.x - sw.x, item.y - sw.y);
            if (d <= sw.r + item.r) {
              eng.items.splice(j, 1);
              eng.tethers.push({
                x1: item.x,
                y1: item.y,
                x2: eng.basket.x,
                y2: eng.basket.y,
                alpha: 1
              });
              applyItemInteraction(eng, item);
            }
          }
        }

        for (let i = eng.items.length - 1; i >= 0; i--) {
          const item = eng.items[i];
          item.y += item.vy * dt;
          item.phase += 4.2 * dt;

          if (item.type === 'FIREFLY') {
            item.x += Math.sin(item.phase) * 1.45;
          } else {
            item.x += Math.sin(item.phase * 0.7) * 0.45;
          }

          if (eng.magnetTimer > 0 && item.type !== 'CLOUD') {
            const dx = eng.basket.x - item.x;
            const dy = eng.basket.y - item.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 255 && dist > 1) {
              item.x += (dx / dist) * 355 * dt;
              item.y += (dy / dist) * 270 * dt;
            }
          }

          const hitX = Math.abs(item.x - eng.basket.x) < eng.basket.w * 0.58 + item.r * 0.5;
          const hitY = Math.abs(item.y - eng.basket.y) < eng.basket.h * 0.65 + item.r * 0.5;

          if (hitX && hitY) {
            eng.items.splice(i, 1);
            applyItemInteraction(eng, item);
            continue;
          }

          if (item.y > h + 30) {
            eng.items.splice(i, 1);
          }
        }

        eng.flowers.forEach((f) => {
          f.phase += 2.2 * dt;
          if (f.height < f.targetHeight) {
            f.height += 44 * dt;
          } else if (f.bloom < 1) {
            f.bloom = Math.min(1, f.bloom + 2.0 * dt);
          }
        });

        eng.gardenButterflies.forEach((gb) => {
          gb.phase += 1.6 * dt;
          gb.wingPhase += 12 * dt;
        });
      }

      // Fade transient FX cleanly even right after pause/gameover
      for (let i = eng.basketTrail.length - 1; i >= 0; i--) {
        eng.basketTrail[i].alpha -= 2.4 * dt;
        if (eng.basketTrail[i].alpha <= 0) eng.basketTrail.splice(i, 1);
      }
      for (let i = eng.tethers.length - 1; i >= 0; i--) {
        eng.tethers[i].alpha -= 2.8 * dt;
        if (eng.tethers[i].alpha <= 0) eng.tethers.splice(i, 1);
      }
      for (let i = eng.particles.length - 1; i >= 0; i--) {
        const pt = eng.particles[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 120 * dt;
        pt.alpha -= 1.8 * dt;
        if (pt.alpha <= 0) eng.particles.splice(i, 1);
      }
      for (let i = eng.floatingTexts.length - 1; i >= 0; i--) {
        const ft = eng.floatingTexts[i];
        ft.y -= 42 * dt;
        ft.life -= 1.25 * dt;
        if (ft.life <= 0) eng.floatingTexts.splice(i, 1);
      }

      eng.flowers.forEach((f) => drawBloomedPlant(f, groundY));

      eng.gardenButterflies.forEach((gb) => {
        const bx = gb.baseX + Math.sin(gb.phase) * 26;
        const by = gb.baseY + Math.cos(gb.phase * 1.4) * 10;
        const flap = 0.35 + 0.65 * Math.abs(Math.sin(gb.wingPhase));
        ctx.save();
        ctx.translate(bx, by);
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(-4 * flap, 0, 4.5 * flap, 3, -0.3, 0, Math.PI * 2);
        ctx.ellipse(4 * flap, 0, 4.5 * flap, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Silky Basket Light Trail
      eng.basketTrail.forEach((tr) => {
        ctx.fillStyle = `rgba(251, 113, 133, ${(tr.alpha * 0.25).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 12 * tr.alpha, 0, Math.PI * 2);
        ctx.fill();
      });

      eng.shockwaves.forEach((sw) => {
        ctx.save();
        ctx.strokeStyle = `rgba(251, 191, 36, ${Math.max(0, sw.alpha).toFixed(3)})`;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(251, 113, 133, ${(Math.max(0, sw.alpha) * 0.55).toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(4, sw.r * 0.72), 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(253, 224, 71, ${(sw.alpha * 0.14).toFixed(3)})`;
        ctx.fill();
        ctx.restore();
      });

      eng.tethers.forEach((th) => {
        ctx.save();
        ctx.strokeStyle = `rgba(251, 113, 133, ${Math.max(0, th.alpha).toFixed(3)})`;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(th.x1, th.y1);
        ctx.lineTo(th.x2, th.y2);
        ctx.stroke();
        ctx.restore();
      });

      // Ornate Golden & Rose Heart-Lantern Basket
      const bx = eng.basket.x;
      const by = eng.basket.y;
      const bw = eng.basket.w;
      const bh = eng.basket.h;

      if (eng.magnetTimer > 0 || eng.combo >= 10) {
        const auraColor =
          eng.magnetTimer > 0 ? 'rgba(56, 189, 248, 0.24)' : 'rgba(251, 113, 133, 0.28)';
        const strokeColor =
          eng.magnetTimer > 0 ? 'rgba(2, 132, 199, 0.7)' : 'rgba(225, 29, 72, 0.75)';
        ctx.save();
        ctx.fillStyle = auraColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by - 4, bw * 0.96, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      const glow = ctx.createRadialGradient(bx, by - 6, 4, bx, by - 6, bw * 0.9);
      glow.addColorStop(0, 'rgba(253, 224, 71, 0.72)');
      glow.addColorStop(0.5, 'rgba(251, 113, 133, 0.25)');
      glow.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by - 6, bw * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Basket Body
      const basketGrad = ctx.createLinearGradient(bx - bw * 0.5, by - bh * 0.35, bx + bw * 0.5, by + bh * 0.45);
      basketGrad.addColorStop(0, '#F59E0B');
      basketGrad.addColorStop(1, '#B45309');
      ctx.fillStyle = basketGrad;
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(bx - bw * 0.5, by - bh * 0.35);
      ctx.lineTo(bx + bw * 0.5, by - bh * 0.35);
      ctx.lineTo(bx + bw * 0.34, by + bh * 0.48);
      ctx.lineTo(bx - bw * 0.34, by + bh * 0.48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Woven Rib Lines
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx - bw * 0.2, by - bh * 0.35);
      ctx.lineTo(bx - bw * 0.14, by + bh * 0.48);
      ctx.moveTo(bx + bw * 0.2, by - bh * 0.35);
      ctx.lineTo(bx + bw * 0.14, by + bh * 0.48);
      ctx.stroke();

      // Rim
      ctx.fillStyle = '#FDE047';
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(bx - bw * 0.54, by - bh * 0.5, bw * 1.08, 9, 4.5);
      ctx.fill();
      ctx.stroke();

      // Glowing Heart Crest on Basket
      ctx.fillStyle = '#FB7185';
      drawHeart(bx, by + 5, 11);
      ctx.fill();

      // Collectibles
      eng.items.forEach((item) => {
        ctx.save();
        ctx.translate(item.x, item.y);

        if (item.type === 'SUNBEAM') {
          const g = ctx.createRadialGradient(0, 0, 2, 0, 0, item.r * 1.45);
          g.addColorStop(0, 'rgba(255, 251, 235, 0.95)');
          g.addColorStop(0.45, 'rgba(251, 113, 133, 0.55)');
          g.addColorStop(1, 'rgba(251, 113, 133, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, item.r * 1.45, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#F43F5E';
          ctx.strokeStyle = '#FFF1F2';
          ctx.lineWidth = 1.2;
          drawHeart(0, 2, 13);
          ctx.fill();
          ctx.stroke();
        } else if (item.type === 'FIREFLY') {
          const flap = 0.35 + 0.65 * Math.abs(Math.sin(item.phase * 2.4));
          ctx.fillStyle = '#F59E0B';
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(-8 * flap, -2, 9.5 * flap, 6.2, -0.35, 0, Math.PI * 2);
          ctx.ellipse(8 * flap, -2, 9.5 * flap, 6.2, 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FEF08A';
          ctx.beginPath();
          ctx.ellipse(-6 * flap, 5, 6.8 * flap, 4.5, 0.35, 0, Math.PI * 2);
          ctx.ellipse(6 * flap, 5, 6.8 * flap, 4.5, -0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#451A03';
          ctx.beginPath();
          ctx.ellipse(0, 0, 1.8, 7.2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'PETAL') {
          ctx.rotate(item.phase * 0.6);
          ctx.fillStyle = '#FACC15';
          ctx.strokeStyle = '#B45309';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 8.5, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#FEF9C3';
          ctx.beginPath();
          ctx.ellipse(0, -3, 3.2, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'MAGNET') {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.stroke();

          ctx.rotate(item.phase * 0.5);
          ctx.fillStyle = '#38BDF8';
          ctx.strokeStyle = '#0369A1';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const a1 = (s * Math.PI * 2) / 6 - Math.PI / 2;
            const a2 = a1 + Math.PI / 6;
            if (s === 0) ctx.moveTo(Math.cos(a1) * 14, Math.sin(a1) * 14);
            else ctx.lineTo(Math.cos(a1) * 14, Math.sin(a1) * 14);
            ctx.lineTo(Math.cos(a2) * 6, Math.sin(a2) * 6);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillStyle = '#64748B';
          ctx.beginPath();
          ctx.arc(-8, 2, 10, 0, Math.PI * 2);
          ctx.arc(8, 2, 10, 0, Math.PI * 2);
          ctx.arc(0, -4, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-6, 14);
          ctx.lineTo(-9, 20);
          ctx.moveTo(2, 15);
          ctx.lineTo(-1, 21);
          ctx.moveTo(9, 13);
          ctx.lineTo(6, 19);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Sparkle Burst Particles
      eng.particles.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      eng.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      if (
        eng.status === 'PLAYING' ||
        eng.particles.length > 0 ||
        eng.shockwaves.length > 0 ||
        eng.tethers.length > 0 ||
        eng.floatingTexts.length > 0
      ) {
        animId = requestAnimationFrame(renderFrame);
      }
    };

    startLoopRef.current = () => {
      if (!animId) {
        engineRef.current.lastTime = performance.now();
        animId = requestAnimationFrame(renderFrame);
      }
    };

    drawStaticRef.current = () => {
      renderFrame(performance.now());
    };

    renderFrame(performance.now());
    return () => {
      if (animId) cancelAnimationFrame(animId);
      animId = 0;
      startLoopRef.current = null;
      drawStaticRef.current = null;
    };
  }, [applyItemInteraction]);

  const startNewGame = () => {
    const eng = engineRef.current;
    eng.score = 0;
    eng.lives = 3;
    eng.combo = 0;
    eng.comboTimer = 0;
    eng.magnetTimer = 0;
    eng.items = [];
    eng.shockwaves = [];
    eng.tethers = [];
    eng.particles = [];
    eng.basketTrail = [];
    eng.flowers = [];
    eng.gardenButterflies = [];
    eng.floatingTexts = [];
    eng.basket.x = eng.width / 2;
    eng.basket.targetX = eng.width / 2;
    eng.status = 'PLAYING';
    eng.lastTime = performance.now();

    setScore(0);
    setLives(3);
    setCombo(0);
    setMagnetActive(false);
    setGardenCount(0);
    setGameState('PLAYING');
    audio.playComboCatchChime(2, true);
    startLoopRef.current?.();
  };

  const togglePause = () => {
    const eng = engineRef.current;
    if (eng.status === 'PLAYING') {
      eng.status = 'PAUSED';
      setGameState('PAUSED');
    } else if (eng.status === 'PAUSED') {
      eng.status = 'PLAYING';
      eng.lastTime = performance.now();
      setGameState('PLAYING');
      startLoopRef.current?.();
    }
  };

  const handlePointerMove = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || engineRef.current.status !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    engineRef.current.basket.targetX = clientX - rect.left;
  };

  const handleCanvasTapPulse = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const eng = engineRef.current;
    if (!canvas || eng.status !== 'PLAYING') return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    eng.basket.targetX = x;
    eng.shockwaves.push({ x, y, r: 16, alpha: 0.95 });
    audio.playShockwavePulse();
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(SURPRISE_CONFIG.gameReward.code);
    } catch {
      // Clipboard fallback ignored
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const progress = computeRewardProgress(score, SURPRISE_CONFIG.gameReward.targetScore);
  const multiplierBadge =
    combo >= 10 ? 'x5 Golden Fever' : combo >= 6 ? 'x3 Combo' : combo >= 3 ? 'x2 Combo' : null;

  return (
    <section
      id="game"
      data-game-state={gameState}
      className="relative z-10 py-14 sm:py-28 px-4 sm:px-8 max-w-5xl mx-auto scroll-mt-10"
    >
      <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-10">
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.22em] sm:tracking-[0.24em] uppercase text-amber-800 mb-2 sm:mb-3">
          Permainan Interaktif
        </p>
        <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#2C1205] mb-3 sm:mb-4 text-balance">
          Taman Cahaya &amp; Kupu-Kupu Emas
        </h2>
        <p className="text-[13px] sm:text-base text-[#6E4726] font-medium leading-[1.7] sm:leading-relaxed max-w-[300px] sm:max-w-2xl mx-auto text-pretty">
          Geser keranjang atau <strong className="text-[#2C1205]">ketuk langsung di layar</strong> untuk memancarkan gelombang cahaya. Tangkap Cahaya Hati (+10), Kupu-Kupu Emas (+25), Kelopak Matahari (+35), dan Bintang Magnet — hindari awan gerimis!
        </p>
      </div>

      <article className="surface-champagne rounded-[1.75rem] sm:rounded-[2rem] p-3.5 sm:p-7 lg:p-8">
        {/* Clean HUD Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-3.5 sm:mb-4 tabular-nums">
          <div className="surface-monograph rounded-xl p-2.5 sm:p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-[#6E4726]">
              Skor Cahaya
            </div>
            <div
              data-testid="game-score"
              className="font-editorial text-xl sm:text-3xl font-bold text-amber-800 mt-0.5"
            >
              {score}
            </div>
          </div>

          <div className="surface-monograph rounded-xl p-2.5 sm:p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-[#6E4726]">
              Rekor Terbaik
            </div>
            <div className="font-editorial text-xl sm:text-3xl font-bold text-[#2C1205] mt-0.5">
              {highScore}
            </div>
          </div>

          <div className="surface-monograph rounded-xl p-2.5 sm:p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-[#6E4726]">
              Taman Mekar
            </div>
            <div className="font-editorial text-xl sm:text-3xl font-bold text-lime-800 mt-0.5">
              {gardenCount} Bunga
            </div>
          </div>

          <div className="surface-monograph rounded-xl p-2.5 sm:p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-[#6E4726]">
              Energi Hati
            </div>
            <div className="font-editorial text-xl sm:text-3xl font-bold text-rose-800 mt-0.5">
              {lives} / 3
            </div>
          </div>
        </div>

        {/* Coupon Unlock Progress Bar */}
        <div className="mb-3 pl-1 pr-7 sm:px-1 tabular-nums">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#6E4726] mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-700 fill-rose-400/50" />
              <span>
                {rewardUnlocked
                  ? 'Kupon Kejutan Ulang Tahun Terbuka'
                  : `Progres Kupon Cinta · ${progress.current} / ${progress.target} Poin`}
              </span>
            </span>
            <span className="text-amber-800">{rewardUnlocked ? '100%' : `${progress.percent}%`}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-amber-200/70 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-400 transition-all duration-300 ease-silky"
              style={{ width: `${rewardUnlocked ? 100 : progress.percent}%` }}
            />
          </div>
        </div>

        {/* Active Boosters Status */}
        <div className="min-h-[24px] mb-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
          {multiplierBadge && (
            <span className="inline-flex items-center gap-1.5 text-amber-800">
              <Zap className="w-3.5 h-3.5" />
              <span>{multiplierBadge}</span>
            </span>
          )}
          {magnetActive && (
            <span className="inline-flex items-center gap-1.5 text-sky-800">
              <Magnet className="w-3.5 h-3.5" />
              <span>Aura Magnet Aktif</span>
            </span>
          )}
        </div>

        {/* Canvas Arena */}
        <div
          ref={wrapperRef}
          className="relative w-full h-[310px] sm:h-[440px] rounded-2xl overflow-hidden border border-amber-700/25 shadow-inner"
        >
          <canvas
            ref={canvasRef}
            data-testid="game-canvas"
            onMouseDown={(e) => handleCanvasTapPulse(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onTouchStart={(e) => {
              if (e.touches[0]) {
                handleCanvasTapPulse(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => e.touches[0] && handlePointerMove(e.touches[0].clientX)}
            className="block w-full h-full touch-none select-none cursor-pointer"
          />

          {gameState !== 'PLAYING' && (
            <div className="absolute inset-0 bg-[#FDFBF5]/92 flex flex-col items-center justify-center p-5 sm:p-6 text-center transition-opacity duration-300">
              <h3 className="font-editorial text-2xl sm:text-4xl font-bold text-[#2C1205] mb-2 text-balance">
                {gameState === 'IDLE' && 'Siap Menumbuhkan Taman Matahari & Mawar?'}
                {gameState === 'PAUSED' && 'Permainan Dijeda'}
                {gameState === 'GAMEOVER' && `Panen Selesai · Skor ${score}`}
              </h3>

              <p className="text-[13px] sm:text-sm text-[#6E4726] font-medium max-w-[265px] sm:max-w-md mx-auto mb-5 sm:mb-6 leading-[1.68] sm:leading-relaxed text-pretty">
                {gameState === 'GAMEOVER'
                  ? `Kamu telah menumbuhkan ${gardenCount} bunga indah. Capai 200 poin untuk membuka Kupon Kejutan Ulang Tahun.`
                  : 'Saat skormu bertambah, langit sore keemasan akan berubah menjadi malam senja berbintang yang romantis.'}
              </p>

              <button
                type="button"
                onClick={gameState === 'PAUSED' ? togglePause : startNewGame}
                className="px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 text-[#2C1205] font-extrabold text-sm sm:text-base shadow-md transition-all duration-200 hover:scale-105 whitespace-nowrap"
              >
                {gameState === 'PAUSED'
                  ? 'Lanjutkan Bermain'
                  : gameState === 'GAMEOVER'
                  ? 'Main Lagi'
                  : 'Mulai Bermain'}
              </button>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              type="button"
              onClick={togglePause}
              disabled={gameState === 'IDLE' || gameState === 'GAMEOVER'}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-full surface-monograph text-xs font-bold text-[#2C1205] disabled:opacity-40 hover:bg-amber-100 transition whitespace-nowrap"
            >
              {gameState === 'PAUSED' ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
              <span>{gameState === 'PAUSED' ? 'Lanjut' : 'Jeda'}</span>
            </button>

            <button
              type="button"
              onClick={startNewGame}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-full surface-monograph text-xs font-bold text-[#2C1205] hover:bg-amber-100 transition whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ulangi</span>
            </button>
          </div>

          <button
            type="button"
            disabled={!rewardUnlocked}
            onClick={() => {
              if (rewardUnlocked) {
                setShowRewardModal(true);
                audio.playCelebrationChime();
              }
            }}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 whitespace-nowrap ${
              rewardUnlocked
                ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md cursor-pointer hover:scale-105'
                : 'surface-monograph text-[#6E4726]/70 cursor-not-allowed'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>
              {rewardUnlocked ? 'Lihat Kupon Kejutanmu' : 'Hadiah Kejutan (200 Poin)'}
            </span>
          </button>
        </div>
      </article>

      {/* Reward Modal */}
      {showRewardModal && (
        <div
          onClick={() => setShowRewardModal(false)}
          className="fixed inset-0 z-50 bg-[#2C1205]/78 flex items-center justify-center p-4 animate-reveal-smooth"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-lg w-full bg-[#FFFDF8] rounded-[1.75rem] sm:rounded-[2rem] p-6 sm:p-10 text-center border border-amber-500/60 shadow-2xl"
          >
            <div className="w-14 h-14 rounded-full surface-romantic-seal flex items-center justify-center mx-auto mb-4 text-amber-100">
              <Gift className="w-7 h-7" />
            </div>

            <p className="text-xs font-bold tracking-[0.2em] uppercase text-amber-800 tabular-nums">
              Kode Kupon · {SURPRISE_CONFIG.gameReward.code}
            </p>

            <h3 className="font-editorial text-2xl sm:text-4xl font-bold text-[#2C1205] mt-2 mb-4 sm:mb-5 text-balance">
              {SURPRISE_CONFIG.gameReward.title}
            </h3>

            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/90 border border-dashed border-amber-500/60 mb-6">
              <p className="font-editorial italic text-lg sm:text-2xl font-bold text-[#2C1205] leading-relaxed text-pretty">
                “{SURPRISE_CONFIG.gameReward.description}”
              </p>
              <p className="text-xs text-[#6E4726] font-semibold mt-3 text-pretty">
                Berlaku kapan saja saat ditunjukkan kepada {SURPRISE_CONFIG.husbandName}.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 py-3 px-4 rounded-full surface-monograph text-[#2C1205] font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 hover:bg-amber-100 transition whitespace-nowrap"
              >
                {copiedCode ? <Check className="w-4 h-4 text-lime-700" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Kode Disalin' : 'Salin Kode Kupon'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRewardModal(false)}
                className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[#2C1205] font-extrabold text-xs sm:text-sm shadow-sm hover:brightness-105 transition whitespace-nowrap"
              >
                Simpan &amp; Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
