import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  Swords, 
  Zap, 
  Play, 
  Volume2, 
  VolumeX, 
  Flame,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { tournamentAudio } from '../utils/tournamentAudio';

interface AdminChampionsCutsceneProps {
  onComplete: () => void;
  adminName?: string;
  onOpenFullscreenModal?: () => void;
}

export const AdminChampionsCutscene: React.FC<AdminChampionsCutsceneProps> = ({
  onComplete,
  adminName = 'Administrator',
  onOpenFullscreenModal
}) => {
  const [phase, setPhase] = useState<'starball' | 'stadium' | 'crescendo' | 'finished'>('starball');
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [audioMuted, setAudioMuted] = useState<boolean>(() => tournamentAudio.getIsMuted());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioStopRef = useRef<(() => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const progressTimerRef = useRef<any>(null);

  const totalDuration = 11.5; // seconds

  const triggerCelebrationConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#06b6d4', '#38bdf8', '#f59e0b', '#fbbf24', '#ffffff']
      });
      setTimeout(() => {
        confetti({
          particleCount: 75,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8']
        });
        confetti({
          particleCount: 75,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#38bdf8']
        });
      }, 350);
    } catch {}
  };

  const startAnthemAndTimer = () => {
    if (audioStopRef.current) {
      audioStopRef.current();
      audioStopRef.current = null;
    }
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    setPhase('starball');
    setCurrentTimeSec(0);

    const stopAudio = tournamentAudio.playChampionsLeagueAnthem({
      onPhaseChange: (newPhase) => {
        setPhase(newPhase);
        if (newPhase === 'crescendo') {
          triggerCelebrationConfetti();
        }
      }
    });
    audioStopRef.current = stopAudio;

    const startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTimeSec(Math.min(totalDuration, elapsed));
      if (elapsed >= totalDuration + 0.5) {
        setPhase('finished');
        clearInterval(progressTimerRef.current);
      }
    }, 50);
  };

  useEffect(() => {
    startAnthemAndTimer();

    return () => {
      if (audioStopRef.current) {
        audioStopRef.current();
        audioStopRef.current = null;
      }
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const toggleMute = () => {
    const next = !audioMuted;
    setAudioMuted(next);
    tournamentAudio.setMuted(next);
  };

  const handleSkip = () => {
    if (audioStopRef.current) {
      audioStopRef.current();
      audioStopRef.current = null;
    }
    onComplete();
  };

  const handleReplay = () => {
    startAnthemAndTimer();
  };

  // High-performance Canvas Renderer for 3D Starball, Star Stadium & Volumetric Spotlights
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 520);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.3 + 0.1
    }));

    const animStart = performance.now();

    const render = (time: number) => {
      const elapsed = (time - animStart) / 1000;

      // Clear with rich deep space gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.45, 10,
        width * 0.5, height * 0.45, width * 0.85
      );
      bgGrad.addColorStop(0, '#0a1647'); // Deep Champions League Navy Blue
      bgGrad.addColorStop(0.4, '#040d2a');
      bgGrad.addColorStop(0.85, '#010515');
      bgGrad.addColorStop(1, '#00020a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw cosmic drifting stars
      stars.forEach(s => {
        s.y -= s.speed;
        if (s.y < 0) s.y = height;
        const twinkle = Math.sin(time * 0.003 + s.x) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // SCENE 1: THE 3D STARBALL FACETS (0s to 4.8s)
      if (elapsed < 5.0) {
        const starballAlpha = elapsed > 4.2 ? Math.max(0, 1 - (elapsed - 4.2) / 0.8) : 1;
        ctx.save();
        ctx.globalAlpha = starballAlpha;
        ctx.translate(width * 0.5, height * 0.46);

        const rotY = elapsed * 0.45;
        const rotX = Math.sin(elapsed * 0.6) * 0.2;
        const scale = 1.0 + elapsed * 0.08;
        ctx.scale(scale, scale);

        const starCount = 5;
        const baseRadius = Math.min(width, height) * 0.28;

        for (let i = 0; i < starCount; i++) {
          const angle = (i * (Math.PI * 2)) / starCount + rotY;
          const x = Math.cos(angle) * baseRadius * 0.85;
          const y = Math.sin(angle) * baseRadius * 0.45 + Math.sin(rotX + i) * 25;
          const starSize = baseRadius * 0.52;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle * 0.5 + rotX);

          drawChampionsStar(ctx, 0, 0, starSize * 0.9, starSize * 0.42, 5, elapsed, i);
          ctx.restore();
        }

        // Center primary radiant star
        drawChampionsStar(ctx, 0, 0, baseRadius * 0.75, baseRadius * 0.35, 5, elapsed, 99);

        // Volumetric light sweep
        const sweepX = ((elapsed * 350) % (width * 1.5)) - width * 0.75;
        const lightSweep = ctx.createLinearGradient(sweepX - 80, -200, sweepX + 80, 200);
        lightSweep.addColorStop(0, 'rgba(6, 182, 212, 0)');
        lightSweep.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        lightSweep.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = lightSweep;
        ctx.fillRect(-width * 0.5, -height * 0.5, width, height);

        ctx.restore();
      }

      // SCENE 2 & 3: THE STAR DOME STADIUM BY NIGHT (4.2s to End)
      if (elapsed >= 4.2) {
        const stadiumAlpha = Math.min(1, (elapsed - 4.2) / 0.8);
        ctx.save();
        ctx.globalAlpha = stadiumAlpha;

        const camProgress = Math.min(1, (elapsed - 4.2) / 7.0);
        const camScale = 1.0 + camProgress * 0.15;
        ctx.translate(width * 0.5, height * 0.55);
        ctx.scale(camScale, camScale);
        ctx.translate(-width * 0.5, -height * 0.55);

        // Sweeping Searchlights
        const spotlight1Angle = -0.3 + Math.sin(elapsed * 0.9) * 0.45;
        const spotlight2Angle = 0.3 - Math.sin(elapsed * 0.85 + 1.0) * 0.45;

        drawSpotlight(ctx, width * 0.32, height * 0.62, spotlight1Angle, height * 0.95);
        drawSpotlight(ctx, width * 0.68, height * 0.62, spotlight2Angle, height * 0.95);

        // Midnight Lagoon Water Reflection
        const waterY = height * 0.72;
        const waterGrad = ctx.createLinearGradient(0, waterY, 0, height);
        waterGrad.addColorStop(0, '#020921');
        waterGrad.addColorStop(0.3, '#041038');
        waterGrad.addColorStop(1, '#010515');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, waterY, width, height - waterY);

        // Shimmering reflection ripples
        for (let r = 0; r < 18; r++) {
          const ry = waterY + 8 + r * 10;
          const rAlpha = (1 - r / 18) * 0.25;
          const waveShift = Math.sin(time * 0.003 + r * 0.4) * 15;
          ctx.strokeStyle = `rgba(14, 165, 233, ${rAlpha})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(width * 0.2 + waveShift, ry);
          ctx.lineTo(width * 0.8 - waveShift, ry);
          ctx.stroke();
        }

        // Champions Star Stadium Dome
        const stadiumCx = width * 0.5;
        const stadiumCy = height * 0.62;
        const stadiumW = Math.min(width * 0.85, 800);
        const stadiumH = stadiumW * 0.38;

        drawStarDomeStadium(ctx, stadiumCx, stadiumCy, stadiumW, stadiumH, elapsed);

        // Climax Fireworks & Flares (8.0s+)
        if (elapsed >= 8.0) {
          const flareGrad = ctx.createRadialGradient(
            stadiumCx, stadiumCy - stadiumH * 0.35, 10,
            stadiumCx, stadiumCy - stadiumH * 0.35, stadiumW * 0.65
          );
          flareGrad.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
          flareGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.2)');
          flareGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.06)');
          flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = flareGrad;
          ctx.fillRect(0, 0, width, height);
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const drawChampionsStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    points: number,
    elapsed: number,
    index: number
  ) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    const starGrad = ctx.createLinearGradient(
      cx - outerR, cy - outerR,
      cx + outerR, cy + outerR
    );
    starGrad.addColorStop(0, '#ffffff');
    starGrad.addColorStop(0.25, '#7dd3fc');
    starGrad.addColorStop(0.5, '#0284c7');
    starGrad.addColorStop(0.85, '#0369a1');
    starGrad.addColorStop(1, '#0c4a6e');

    ctx.fillStyle = starGrad;
    ctx.fill();

    const hue = (elapsed * 60 + index * 40) % 360;
    ctx.strokeStyle = `hsl(${hue}, 90%, 75%)`;
    ctx.lineWidth = 3;
    ctx.shadowColor = `hsl(${hue}, 90%, 65%)`;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const drawSpotlight = (
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    angle: number,
    beamLength: number
  ) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(angle);

    const beamW = 120;
    const beamGrad = ctx.createLinearGradient(0, 0, 0, -beamLength);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    beamGrad.addColorStop(0.2, 'rgba(56, 189, 248, 0.25)');
    beamGrad.addColorStop(0.6, 'rgba(14, 165, 233, 0.08)');
    beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-beamW, -beamLength);
    ctx.lineTo(beamW, -beamLength);
    ctx.lineTo(15, 0);
    ctx.closePath();

    ctx.fillStyle = beamGrad;
    ctx.fill();
    ctx.restore();
  };

  const drawStarDomeStadium = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    elapsed: number
  ) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.5, h * 0.45, 0, 0, Math.PI * 2);
    const glowGrad = ctx.createRadialGradient(cx, cy - h * 0.15, 10, cx, cy, w * 0.5);
    glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.85)');
    glowGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.4)');
    glowGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.1)');
    glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fill();

    const starAngles = [
      -Math.PI * 0.7, -Math.PI * 0.55, -Math.PI * 0.4,
      -Math.PI * 0.25, -Math.PI * 0.1
    ];

    starAngles.forEach((ang, idx) => {
      const rx = cx + Math.cos(ang) * (w * 0.42);
      const ry = cy + Math.sin(ang) * (h * 0.65);

      ctx.beginPath();
      ctx.moveTo(cx, cy + h * 0.1);
      ctx.quadraticCurveTo(
        cx + (rx - cx) * 0.5, ry - 35,
        rx, ry
      );
      ctx.strokeStyle = idx % 2 === 0 ? '#38bdf8' : '#7dd3fc';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 18;
      ctx.stroke();

      drawChampionsStar(ctx, rx, ry, 18, 8, 5, elapsed, idx);
    });

    // LED Ribbon
    ctx.fillStyle = '#020617';
    ctx.fillRect(cx - w * 0.35, cy - 7, w * 0.7, 14);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(cx - w * 0.35, cy - 7, w * 0.7, 14);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ STUDYNAIJA CHAMPIONS LEAGUE ★ ADMIN GODMODE ARENA ★ 100% WIN ★', cx, cy + 3);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 border-2 border-amber-500/80 text-white shadow-[0_0_60px_rgba(245,158,11,0.4)] min-h-[520px] flex flex-col justify-between select-none animate-in fade-in duration-500">
      
      {/* Dynamic UEFA Starball & Stadium Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Top HUD Controls */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-6 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-black text-amber-300 uppercase tracking-widest">
                ADMIN COMMAND BROADCAST • UEFA INTRO
              </span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <p className="text-[11px] text-slate-300 font-semibold hidden sm:block">
              StudyNaija Monthly Champions League Official Arena
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
              audioMuted
                ? 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-white'
                : 'bg-amber-950/80 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
            }`}
            title={audioMuted ? 'Turn Anthem ON' : 'Mute Anthem'}
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
            <span className="hidden sm:inline">{audioMuted ? 'MUTED' : 'HYMN ON'}</span>
          </button>

          {/* Replay */}
          <button
            type="button"
            onClick={handleReplay}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            title="Replay from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          {/* Fullscreen Modal Launcher (if available) */}
          {onOpenFullscreenModal && (
            <button
              type="button"
              onClick={onOpenFullscreenModal}
              className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 text-xs font-bold border border-cyan-400/40 transition flex items-center gap-1 cursor-pointer"
              title="Launch full screen modal"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          )}

          {/* Skip Intro */}
          <button
            type="button"
            onClick={handleSkip}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white hover:text-amber-300 border border-slate-700 hover:border-amber-400/50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Skip</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Center Cinematic Stage: Synced Lyrics & Admin Accreditation */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 text-center space-y-4 max-w-2xl mx-auto w-full py-4">
        
        {/* PHASE 1: STARBALL & OPENING LYRICS (0s - 4.5s) */}
        {phase === 'starball' && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NIGERIA'S PREMIER ACADEMIC CHAMPIONSHIP</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-['Outfit'] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-200 tracking-tight drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]">
              {currentTimeSec < 2.2 ? 'Ce sont les meilleurs...' : 'Sie sind die Besten...'}
            </h1>

            <p className="text-xs sm:text-sm text-cyan-200/90 font-mono tracking-wider max-w-lg mx-auto">
              {currentTimeSec < 2.2 
                ? '« THESE ARE THE VERY BEST »' 
                : '« THEY ARE THE BEST IN ACADEMICS »'}
            </p>
          </div>
        )}

        {/* PHASE 2: STADIUM UNVEILING (4.5s - 8.0s) */}
        {phase === 'stadium' && (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-400/40 text-blue-200 text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>ADMIN SOVEREIGN ENTRY</span>
              <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-['Outfit'] text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-white to-cyan-300 tracking-tight drop-shadow-[0_0_30px_rgba(56,189,248,0.7)]">
              Les grandes équipes...
            </h1>

            <p className="text-xs sm:text-sm text-sky-200 font-mono tracking-wider">
              « THE MASTER MERIT TEAMS // SITE OWNER EXHIBITION »
            </p>
          </div>
        )}

        {/* PHASE 3: CRESCENDO & THE CHAAAMPIONS (8.0s+) */}
        {(phase === 'crescendo' || phase === 'finished') && (
          <div className="space-y-4 animate-in zoom-in-90 fade-in duration-300 w-full">
            
            {/* Climax Banner */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-black tracking-widest uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-pulse">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>OFFICIAL UEFA CHAMPIONS LEAGUE ANTHEM</span>
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-black font-['Outfit'] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 tracking-tight drop-shadow-[0_0_35px_rgba(245,158,11,0.85)] scale-105">
                THE CHAAAAMPIONS! 🏆
              </h1>
            </div>

            {/* Admin Command Card */}
            <div className="bg-slate-950/85 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border-2 border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.3)] text-left space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-black tracking-wider text-amber-400">
                      SOVEREIGN SITE OWNER & ADMIN
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                      {adminName}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase tracking-wider">
                    GODMODE ACTIVE
                  </span>
                  <div className="text-[10px] font-mono text-cyan-300 font-bold mt-0.5">
                    100% Guaranteed Victory
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Prize Bounty</div>
                  <div className="text-xs sm:text-sm font-black text-amber-400 font-mono">₦9,500</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Arena Format</div>
                  <div className="text-xs sm:text-sm font-black text-cyan-300 font-mono">8 Groups of 4</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Match Pace</div>
                  <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono">10 Qs / 2 Mins</div>
                </div>
              </div>

              {/* Action: Enter Arena */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onComplete}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-amber-500/30 transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer font-['Outfit']"
                >
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>ENTER AI BATTLE ARENA</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Bottom Progress Bar & Timeline */}
      <div className="relative z-20 p-4 sm:p-5 max-w-2xl mx-auto w-full space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300/80">
          <span>0:{Math.floor(currentTimeSec).toString().padStart(2, '0')}</span>
          <span className="text-[11px] uppercase font-bold text-amber-300">
            {phase === 'starball' ? 'Phase 1: 3D Starball' : phase === 'stadium' ? 'Phase 2: Star Dome Stadium' : 'Phase 3: The Climax'}
          </span>
          <span>0:11</span>
        </div>

        <div className="w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden p-0.5 border border-cyan-500/20 backdrop-blur-md">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 h-full rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
            style={{ width: `${Math.min(100, (currentTimeSec / totalDuration) * 100)}%` }}
          />
        </div>
      </div>

    </div>
  );
};
