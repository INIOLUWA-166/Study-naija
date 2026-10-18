import confetti from 'canvas-confetti';

/**
 * High-energy confetti celebrations for StudyNaija
 * Green, Gold, Emerald, and White celebratory colors for Nigerian Academic Excellence!
 */
const NAIJA_COLORS = ['#10B981', '#059669', '#F59E0B', '#FBBF24', '#FFFFFF', '#3B82F6', '#8B5CF6'];

/**
 * Triggers an energetic multi-stage celebratory fireworks and confetti display
 * for successfully completing a JAMB/WAEC CBT Mock Exam.
 */
export function triggerExamCompletionConfetti(scorePercentage: number = 75) {
  try {
    if (typeof window === 'undefined') return;

    // Center burst
    confetti({
      particleCount: scorePercentage >= 70 ? 120 : 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: NAIJA_COLORS,
      ticks: 250,
      gravity: 0.85
    });

    // Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: NAIJA_COLORS
      });
    }, 200);

    // Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: NAIJA_COLORS
      });
    }, 400);

    // If score is exceptional (70%+), add a star/sparkle shower
    if (scorePercentage >= 70) {
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.4 },
          shapes: ['circle'],
          colors: ['#F59E0B', '#10B981', '#FBBF24']
        });
      }, 700);
    }
  } catch {
    // Non-critical if canvas is unsupported
  }
}

/**
 * Checks whether a given streak number constitutes a significant milestone
 * (e.g. 3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 100 days, or multiples of 5/7).
 */
export function isStreakMilestone(streak: number): boolean {
  if (streak <= 0) return false;
  const keyMilestones = [3, 5, 7, 10, 14, 21, 28, 30, 45, 50, 60, 75, 90, 100, 150, 200, 365];
  return keyMilestones.includes(streak) || (streak >= 15 && streak % 5 === 0);
}

/**
 * Returns a motivational title for the streak milestone
 */
export function getStreakMilestoneTitle(streak: number): string {
  if (streak >= 365) return '🏆 Legend of StudyNaija: 365-Day Academic Titan!';
  if (streak >= 100) return '💯 Triple Digit Master: 100-Day Study Streaker!';
  if (streak >= 50) return '🔥 Half-Century Scholar: 50 Consecutive Days!';
  if (streak >= 30) return '👑 1-Month Milestone: Elite Nigerian Scholar!';
  if (streak >= 21) return '🧠 3-Week Discipline: Habit Fully Formed!';
  if (streak >= 14) return '⚡ 2-Week Sprint: WAEC & JAMB Powerhouse!';
  if (streak >= 7) return '🇳🇬 7-Day Complete Week: National Contender!';
  if (streak >= 5) return '🎯 5-Day Focus: Distinction Target in Sight!';
  if (streak >= 3) return '🌱 3-Day Momentum: Study Streak Activated!';
  return `🔥 ${streak}-Day Streak Milestone!`;
}

/**
 * Triggers a celebratory confetti burst when hitting a daily streak milestone
 */
export function triggerStreakMilestoneConfetti(streak: number) {
  try {
    if (typeof window === 'undefined') return;

    // Warm gold & fire ember colors for streak milestone
    const streakColors = ['#F59E0B', '#EF4444', '#10B981', '#F97316', '#FBBF24', '#FFFFFF'];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.65 },
      colors: streakColors,
      ticks: 300,
      gravity: 0.9
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.8 },
        colors: streakColors
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.8 },
        colors: streakColors
      });
    }, 250);
  } catch {
    // Non-critical
  }
}

/**
 * Triggers a royal sparkle burst for unlocking an Achievement Badge!
 */
export function triggerBadgeUnlockConfetti() {
  try {
    if (typeof window === 'undefined') return;

    const badgeColors = ['#F59E0B', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899', '#FBBF24', '#FFFFFF'];

    confetti({
      particleCount: 90,
      spread: 85,
      origin: { y: 0.55 },
      colors: badgeColors,
      ticks: 280,
      gravity: 0.85
    });

    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.4 },
        shapes: ['circle', 'square'],
        colors: ['#F59E0B', '#FBBF24', '#10B981']
      });
    }, 200);
  } catch {}
}

/**
 * Triggers a massive, multi-barrage celebratory confetti and fireworks spectacle
 * for winning a Champions League tournament game against human scholars.
 */
export function triggerChampionsLeagueVictoryConfetti() {
  try {
    if (typeof window === 'undefined') return;

    const goldAndEmerald = ['#F59E0B', '#FBBF24', '#10B981', '#06B6D4', '#E0E7FF', '#FFFFFF', '#FCD34D'];

    // 1. Initial massive center burst
    confetti({
      particleCount: 160,
      spread: 100,
      origin: { y: 0.55 },
      colors: goldAndEmerald,
      ticks: 350,
      gravity: 0.8,
      scalar: 1.2
    });

    // 2. Dual cannon blast left & right
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 55,
        spread: 70,
        origin: { x: 0, y: 0.65 },
        colors: goldAndEmerald
      });
      confetti({
        particleCount: 80,
        angle: 125,
        spread: 70,
        origin: { x: 1, y: 0.65 },
        colors: goldAndEmerald
      });
    }, 250);

    // 3. Falling gold star & disc cascade
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.3 },
        colors: ['#F59E0B', '#FCD34D', '#10B981', '#FFFFFF'],
        ticks: 400,
        gravity: 0.65,
        scalar: 1.1
      });
    }, 550);

    // 4. Grand finale volley
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: goldAndEmerald,
        ticks: 300
      });
    }, 900);
  } catch {}
}

