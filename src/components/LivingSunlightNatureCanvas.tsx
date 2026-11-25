import React, { useEffect, useRef } from 'react';

export interface PetalBurstEvent {
  id: number;
  x: number;
  y: number;
  count: number;
}

interface LivingSunlightNatureCanvasProps {
  petalBurst: PetalBurstEvent | null;
}

export const LivingSunlightNatureCanvas: React.FC<LivingSunlightNatureCanvasProps> = ({
  petalBurst
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const burstParticlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rot: number;
      vRot: number;
      color: string;
      alpha: number;
      decay: number;
    }>
  >([]);

  useEffect(() => {
    if (!petalBurst || !petalBurst.id) return;
    const ox = petalBurst.x ?? window.innerWidth * 0.5;
    const oy = petalBurst.y ?? window.innerHeight * 0.45;
    const count = petalBurst.count ?? 65;
    const colors = ['#F59E0B', '#FBBF24', '#D97706', '#FDE047', '#65A30D'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 7.2;
      burstParticlesRef.current.push({
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.4,
        size: 5 + Math.random() * 7,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.13,
        color: colors[i % colors.length],
        alpha: 1,
        decay: 0.007 + Math.random() * 0.007
      });
    }
  }, [petalBurst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const pointer = { x: width * 0.5, y: height * 0.4, vx: 0, vy: 0, active: false };
    const sunSparkTrail: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    }> = [];

    const spawnTrailSpark = (x: number, y: number) => {
      if (sunSparkTrail.length > 45) return;
      sunSparkTrail.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -0.4 - Math.random() * 0.9,
        r: 1.6 + Math.random() * 2.2,
        alpha: 0.78
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      pointer.vx = e.clientX - pointer.x;
      pointer.vy = e.clientY - pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      if (!prefersReducedMotion && Math.hypot(pointer.vx, pointer.vy) > 3) {
        spawnTrailSpark(e.clientX, e.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const tx = e.touches[0].clientX;
        const ty = e.touches[0].clientY;
        pointer.vx = tx - pointer.x;
        pointer.vy = ty - pointer.y;
        pointer.x = tx;
        pointer.y = ty;
        pointer.active = true;
        if (!prefersReducedMotion) spawnTrailSpark(tx, ty);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    const clouds = Array.from({ length: 4 }, (_, i) => ({
      x: (i / 4) * width + Math.random() * 140,
      y: height * (0.09 + (i % 2) * 0.08),
      scale: 0.75 + Math.random() * 0.45,
      speed: 0.12 + Math.random() * 0.1
    }));

    const butterflies = Array.from({ length: width < 640 ? 5 : 9 }, () => ({
      x: Math.random() * width,
      y: height * (0.25 + Math.random() * 0.55),
      vx: (Math.random() - 0.5) * 1.1,
      vy: (Math.random() - 0.5) * 0.7,
      wingPhase: Math.random() * Math.PI * 2,
      size: 5.5 + Math.random() * 3.5,
      hue: Math.random() > 0.35 ? '#D97706' : '#EA580C'
    }));

    const pollenMotes = Array.from({ length: width < 640 ? 22 : 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1.5 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      speedX: 0.14 + Math.random() * 0.25,
      speedY: -0.15 - Math.random() * 0.26
    }));

    const driftingPetals = Array.from({ length: width < 640 ? 6 : 10 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 5.5 + Math.random() * 4.5,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.02,
      speedX: 0.3 + Math.random() * 0.4,
      speedY: 0.25 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2
    }));

    let grassBlades: Array<{ x: number; h: number; phase: number; thick: number; shade: string }> =
      [];
    let valleySunflowers: Array<{ x: number; h: number; headR: number; phase: number }> = [];
    const backdropCanvas = document.createElement('canvas');
    const backdropCtx = backdropCanvas.getContext('2d');

    const buildStaticBackdrop = () => {
      backdropCanvas.width = width;
      backdropCanvas.height = height;
      if (!backdropCtx) return;

      const skyGrad = backdropCtx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#FDFBF5');
      skyGrad.addColorStop(0.42, '#FAF0D7');
      skyGrad.addColorStop(0.76, '#F9E2AE');
      skyGrad.addColorStop(0.94, '#F4CF7B');
      skyGrad.addColorStop(1, '#E6F0C2');
      backdropCtx.fillStyle = skyGrad;
      backdropCtx.fillRect(0, 0, width, height);

      const sunX = width * 0.85;
      const sunY = height * 0.14;
      const sunRadius = Math.max(width, height) * 0.44;
      const sunHalo = backdropCtx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRadius);
      sunHalo.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
      sunHalo.addColorStop(0.16, 'rgba(254, 240, 138, 0.62)');
      sunHalo.addColorStop(0.45, 'rgba(251, 191, 36, 0.2)');
      sunHalo.addColorStop(1, 'rgba(254, 243, 199, 0)');
      backdropCtx.fillStyle = sunHalo;
      backdropCtx.fillRect(0, 0, width, height);

      const backHillGrad = backdropCtx.createLinearGradient(0, height * 0.77, 0, height);
      backHillGrad.addColorStop(0, '#96C93D');
      backHillGrad.addColorStop(1, '#5D8C18');
      backdropCtx.fillStyle = backHillGrad;
      backdropCtx.beginPath();
      backdropCtx.moveTo(0, height);
      backdropCtx.lineTo(0, height * 0.85);
      backdropCtx.quadraticCurveTo(width * 0.28, height * 0.79, width * 0.58, height * 0.85);
      backdropCtx.quadraticCurveTo(width * 0.84, height * 0.9, width, height * 0.82);
      backdropCtx.lineTo(width, height);
      backdropCtx.closePath();
      backdropCtx.fill();

      const frontHillGrad = backdropCtx.createLinearGradient(0, height * 0.86, 0, height);
      frontHillGrad.addColorStop(0, '#5E8E19');
      frontHillGrad.addColorStop(1, '#3A5A0F');
      backdropCtx.fillStyle = frontHillGrad;
      backdropCtx.beginPath();
      backdropCtx.moveTo(0, height);
      backdropCtx.lineTo(0, height * 0.91);
      backdropCtx.quadraticCurveTo(width * 0.45, height * 0.86, width * 0.76, height * 0.92);
      backdropCtx.quadraticCurveTo(width * 0.92, height * 0.94, width, height * 0.9);
      backdropCtx.lineTo(width, height);
      backdropCtx.closePath();
      backdropCtx.fill();
    };

    const buildMeadowElements = () => {
      buildStaticBackdrop();

      const bladeCount = Math.floor(width / 26);
      grassBlades = Array.from({ length: bladeCount }, (_, i) => ({
        x: (i / bladeCount) * width + (Math.random() - 0.5) * 10,
        h: 20 + Math.random() * 34,
        phase: Math.random() * Math.PI * 2,
        thick: 1.4 + Math.random() * 1.2,
        shade: i % 2 === 0 ? '#4D7C0F' : '#65A30D'
      }));

      const sfCount = width < 640 ? 5 : 10;
      valleySunflowers = Array.from({ length: sfCount }, (_, i) => ({
        x: ((i + 0.5) / sfCount) * width + (Math.random() - 0.5) * 28,
        h: 48 + Math.random() * 42,
        headR: 10 + Math.random() * 5,
        phase: Math.random() * Math.PI * 2
      }));
    };

    buildMeadowElements();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      buildMeadowElements();
    };
    window.addEventListener('resize', handleResize);

    let lastFrameTime = 0;
    const render = (now: number) => {
      if (!prefersReducedMotion || burstParticlesRef.current.length > 0) {
        animId = requestAnimationFrame(render);
      } else {
        animId = 0;
      }
      if (now - lastFrameTime < 55) {
        return;
      }
      lastFrameTime = now;
      const t = now * 0.001;
      ctx.clearRect(0, 0, width, height);

      pointer.vx *= 0.92;
      pointer.vy *= 0.92;

      // 1. Blit pre-rendered static sky, sun halo, and hills
      ctx.drawImage(backdropCanvas, 0, 0);

      // 2. Soft Drifting Clouds
      clouds.forEach((c) => {
        if (!prefersReducedMotion) {
          c.x += c.speed;
          if (c.x > width + 180) c.x = -180;
        }
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.scale(c.scale, c.scale);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.arc(26, -7, 35, 0, Math.PI * 2);
        ctx.arc(58, -2, 28, 0, Math.PI * 2);
        ctx.arc(-24, 5, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. Swaying Grass & Valley Sunflowers
      const breeze = prefersReducedMotion ? 0 : Math.sin(t * 1.1) * 5 + Math.sin(t * 2.1) * 1.8;

      grassBlades.forEach((b) => {
        const dist = Math.abs(b.x - pointer.x);
        const push = dist < 120 ? (1 - dist / 120) * pointer.vx * 0.4 : 0;
        const sway = breeze * 0.65 + (prefersReducedMotion ? 0 : Math.sin(t * 1.7 + b.phase) * 3.5) + push;

        ctx.strokeStyle = b.shade;
        ctx.lineWidth = b.thick;
        ctx.beginPath();
        ctx.moveTo(b.x, height);
        ctx.quadraticCurveTo(b.x + sway * 0.4, height - b.h * 0.55, b.x + sway, height - b.h);
        ctx.stroke();
      });

      valleySunflowers.forEach((sf) => {
        const dist = Math.abs(sf.x - pointer.x);
        const push = dist < 150 ? (1 - dist / 150) * pointer.vx * 0.5 : 0;
        const sway = breeze + (prefersReducedMotion ? 0 : Math.sin(t * 1.3 + sf.phase) * 4.5) + push;
        const topX = sf.x + sway;
        const topY = height - sf.h;

        ctx.strokeStyle = '#365314';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(sf.x, height);
        ctx.quadraticCurveTo(sf.x + sway * 0.45, height - sf.h * 0.5, topX, topY);
        ctx.stroke();

        ctx.save();
        ctx.translate(topX, topY);
        ctx.rotate(sway * 0.015);
        ctx.fillStyle = '#F59E0B';
        for (let p = 0; p < 12; p++) {
          ctx.rotate((Math.PI * 2) / 12);
          ctx.beginPath();
          ctx.ellipse(0, -sf.headR * 0.92, sf.headR * 0.25, sf.headR * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#451A03';
        ctx.beginPath();
        ctx.arc(0, 0, sf.headR * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (!prefersReducedMotion) {
        // 6. Floating Pollen Motes
        pollenMotes.forEach((pm) => {
          pm.phase += 0.022;
          pm.x += pm.speedX + Math.sin(pm.phase) * 0.3;
          pm.y += pm.speedY;

          if (pm.x > width + 15) pm.x = -15;
          if (pm.y < -15) {
            pm.y = height * 0.92;
            pm.x = Math.random() * width;
          }

          const glow = 0.32 + 0.42 * Math.sin(pm.phase * 1.4);
          ctx.fillStyle = `rgba(217, 119, 6, ${glow.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(pm.x, pm.y, pm.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // 7. Interactive Golden Butterflies
        butterflies.forEach((bf) => {
          bf.wingPhase += 0.22;

          if (pointer.active) {
            const dx = pointer.x - bf.x;
            const dy = pointer.y - bf.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 45 && dist < 320) {
              bf.vx += (dx / dist) * 0.032;
              bf.vy += (dy / dist) * 0.032;
            }
          }

          bf.vx += (Math.random() - 0.5) * 0.07;
          bf.vy += (Math.random() - 0.5) * 0.07;
          const speed = Math.hypot(bf.vx, bf.vy);
          if (speed > 1.7) {
            bf.vx = (bf.vx / speed) * 1.7;
            bf.vy = (bf.vy / speed) * 1.7;
          }

          bf.x += bf.vx;
          bf.y += bf.vy + Math.sin(bf.wingPhase * 0.35) * 0.32;

          if (bf.x < -25) bf.x = width + 25;
          if (bf.x > width + 25) bf.x = -25;
          if (bf.y < 30) bf.vy += 0.1;
          if (bf.y > height * 0.86) bf.vy -= 0.1;

          const flap = 0.32 + 0.68 * Math.abs(Math.sin(bf.wingPhase));
          const angle = Math.atan2(bf.vy, bf.vx);

          ctx.save();
          ctx.translate(bf.x, bf.y);
          ctx.rotate(angle + Math.PI / 2);

          ctx.fillStyle = bf.hue;
          ctx.beginPath();
          ctx.ellipse(-bf.size * 0.65 * flap, -2, bf.size * 0.7 * flap, bf.size * 0.5, -0.35, 0, Math.PI * 2);
          ctx.ellipse(bf.size * 0.65 * flap, -2, bf.size * 0.7 * flap, bf.size * 0.5, 0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FDE047';
          ctx.beginPath();
          ctx.ellipse(-bf.size * 0.5 * flap, 4, bf.size * 0.5 * flap, bf.size * 0.38, 0.35, 0, Math.PI * 2);
          ctx.ellipse(bf.size * 0.5 * flap, 4, bf.size * 0.5 * flap, bf.size * 0.38, -0.35, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#451A03';
          ctx.beginPath();
          ctx.ellipse(0, 0, 1.3, bf.size * 0.62, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // 8. Drifting Petals
        driftingPetals.forEach((fp) => {
          fp.phase += 0.022;
          fp.x += fp.speedX + Math.sin(fp.phase) * 0.5;
          fp.y += fp.speedY;
          fp.rot += fp.vRot;

          if (fp.x > width + 25) fp.x = -25;
          if (fp.y > height + 25) {
            fp.y = -20;
            fp.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(fp.x, fp.y);
          ctx.rotate(fp.rot);
          ctx.scale(1, 0.5 + 0.35 * Math.sin(fp.phase * 1.4));
          ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';
          ctx.beginPath();
          ctx.ellipse(0, 0, fp.size, fp.size * 0.44, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // 9. Cursor Trail Sparks
        for (let i = sunSparkTrail.length - 1; i >= 0; i--) {
          const ws = sunSparkTrail[i];
          ws.x += ws.vx;
          ws.y += ws.vy;
          ws.alpha -= 0.024;
          if (ws.alpha <= 0) {
            sunSparkTrail.splice(i, 1);
            continue;
          }
          ctx.fillStyle = `rgba(217, 119, 6, ${ws.alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(ws.x, ws.y, ws.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 10. Celebration Petal Bursts
      const bursts = burstParticlesRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.105;
        b.vx *= 0.99;
        b.rot += b.vRot;
        b.alpha -= b.decay;
        if (b.alpha <= 0) {
          bursts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.globalAlpha = Math.max(0, b.alpha);
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, b.size, b.size * 0.44, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
