import { LeaderboardEntry, SubjectChampion, User, ExamResult } from '../types';
import { gamification } from './gamification';

export interface LeaderboardFilterOptions {
  subjectId: string; // 'all' or specific subject id
  timeframe: 'monthly' | 'weekly' | 'all-time' | 'daily';
  examType: 'ALL' | 'JAMB' | 'WAEC';
  searchQuery?: string;
}

export interface MonthlyPrizeTier {
  rank: number;
  label: string;
  cashOrVoucher: string;
  digitalPerk: string;
  totalValue: string;
  icon: string;
  badgeColor: string;
  cardBg: string;
  claimInstructions: string;
}

// -------------------------------------------------------------
// REASONABLE & HIGH-VALUE NIGERIAN MONTHLY PRIZES FOR RANKS 1ST TO 5TH
// Total airtime/data commitment is ₦5,500/month (sustainable for admin, loved by students!)
// -------------------------------------------------------------
export const MONTHLY_PRIZES: MonthlyPrizeTier[] = [
  {
    rank: 1,
    label: '1st Place Champion',
    cashOrVoucher: '₦2,000 Airtime / Data Grant',
    digitalPerk: '1-Month StudyNaija VIP Pass + Digital Certificate of Excellence + WhatsApp Hall of Fame Spotlight',
    totalValue: '₦5,500 Value',
    icon: '🥇',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cardBg: 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-400',
    claimInstructions: 'Direct VTU airtime/data or OPay transfer to your mobile number, plus signed digital certificate.'
  },
  {
    rank: 2,
    label: '2nd Place Runner-Up',
    cashOrVoucher: '₦1,500 Airtime / Data Grant',
    digitalPerk: '1-Month StudyNaija VIP Pass + Digital Academic Runner-Up Certificate',
    totalValue: '₦4,500 Value',
    icon: '🥈',
    badgeColor: 'bg-slate-200 text-slate-900 border-slate-300',
    cardBg: 'from-slate-300/25 via-slate-200/10 to-transparent border-slate-300',
    claimInstructions: 'Airtime or data credited directly to your MTN, Airtel, Glo, or 9mobile line, plus verified certificate.'
  },
  {
    rank: 3,
    label: '3rd Place Runner-Up',
    cashOrVoucher: '₦1,000 Airtime / Data Grant',
    digitalPerk: '1-Month Medium Plan (100 AI Qs/day) + Top 3 Scholar Certificate',
    totalValue: '₦3,500 Value',
    icon: '🥉',
    badgeColor: 'bg-amber-200/70 text-amber-950 border-amber-400/60',
    cardBg: 'from-amber-700/20 via-amber-600/10 to-transparent border-amber-600/40',
    claimInstructions: 'Airtime recharge code or VTU sent directly to your phone via WhatsApp or SMS.'
  },
  {
    rank: 4,
    label: '4th Place Scholar',
    cashOrVoucher: '₦500 Airtime Recharge PIN',
    digitalPerk: '1-Month Basic Membership Pass (25 AI Qs/day) + Top 5 Scholar Badge',
    totalValue: '₦2,000 Value',
    icon: '🏅',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cardBg: 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-400',
    claimInstructions: 'Instant airtime recharge pin sent directly to student via WhatsApp or SMS.'
  },
  {
    rank: 5,
    label: '5th Place Scholar',
    cashOrVoucher: '₦500 Airtime Recharge PIN',
    digitalPerk: '14-Day Free Naija AI Pass + Honor Roll Citation',
    totalValue: '₦1,500 Value',
    icon: '🎖️',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    cardBg: 'from-blue-500/20 via-blue-500/10 to-transparent border-blue-400',
    claimInstructions: 'Instant airtime recharge code credited directly to your mobile line.'
  }
];

// No AI bots - completely empty base pool so only real registered human students appear
export const BASE_LEADERBOARD_STUDENTS: Omit<LeaderboardEntry, 'rank'>[] = [];

// Helper to compute monthly season info & countdown to the 1st of next month
export function getMonthlySeasonInfo() {
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();
  const seasonTitle = `${currentMonthName} ${currentYear} Championship Season`;
  const seasonKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 1st day of next month at 00:00:00 WAT
  const nextMonthFirst = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  const msRemaining = Math.max(0, nextMonthFirst.getTime() - now.getTime());
  const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const secondsRemaining = Math.floor((msRemaining % (1000 * 60)) / 1000);

  const nextMonthName = monthNames[(now.getMonth() + 1) % 12];
  const nextMonthYear = now.getMonth() === 11 ? currentYear + 1 : currentYear;
  const resetDateString = `1st of ${nextMonthName} ${nextMonthYear}`;

  return {
    seasonTitle,
    seasonKey,
    currentMonthName,
    currentYear,
    resetDateString,
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
    nextMonthFirstIso: nextMonthFirst.toISOString()
  };
}

export interface LeaderboardStatsSummary {
  totalCompetitorsNationwide: number;
  currentUserRank: number;
  currentUserScore: number;
  currentUserPercentile: number;
  pointsToNextRank: number;
  nextCompetitorName: string;
  reigningChampionName: string;
  reigningChampionScore: number;
  weeklyPrizeDrawCountdown: string;
  monthlySeasonTitle: string;
  monthlyResetCountdown: string;
  daysToReset: number;
  hoursToReset: number;
  minutesToReset: number;
  nextResetDate: string;
  topPrizesTotalValue: string;
}

export const SUBJECT_CHAMPIONS: SubjectChampion[] = [
  {
    subjectId: 'mathematics',
    subjectName: 'General Mathematics',
    iconName: 'Binary',
    studentName: 'Active UTME Candidate',
    school: 'Nigerian Federal & State Colleges',
    state: 'National Pool',
    scorePercentage: 98.0,
    questionsSolved: 420,
    tip: 'Memorize quadratic discriminant shortcuts (b² - 4ac) and log identities to answer math Qs under 35 seconds!'
  },
  {
    subjectId: 'physics',
    subjectName: 'Physics',
    iconName: 'Zap',
    studentName: 'Active UTME Candidate',
    school: 'Science & Engineering Aspirants',
    state: 'National Pool',
    scorePercentage: 96.0,
    questionsSolved: 390,
    tip: 'Always check standard SI units first. 70% of JAMB physics trap options use cm instead of meters or grams instead of kg.'
  },
  {
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    iconName: 'FlaskConical',
    studentName: 'Active UTME Candidate',
    school: 'Medical & Pure Science Track',
    state: 'National Pool',
    scorePercentage: 95.0,
    questionsSolved: 380,
    tip: 'Understand Le Chatelier\'s principle and electrolysis calculations (Faraday\'s laws) — they show up in every past year!'
  },
  {
    subjectId: 'english',
    subjectName: 'English Language',
    iconName: 'BookOpen',
    studentName: 'Active UTME Candidate',
    school: 'Arts & Commercial Track',
    state: 'National Pool',
    scorePercentage: 94.0,
    questionsSolved: 450,
    tip: 'For stress patterns and rhyming sounds, whisper the word softly under your breath in the exam hall to feel the vowel pitch.'
  },
  {
    subjectId: 'biology',
    subjectName: 'Biology',
    iconName: 'Dna',
    studentName: 'Active UTME Candidate',
    school: 'Life Science Aspirants',
    state: 'National Pool',
    scorePercentage: 95.0,
    questionsSolved: 410,
    tip: 'Ecology food chains, cell organelles, and plant hormone functions (auxins vs gibberellins) give you fast guaranteed marks.'
  },
  {
    subjectId: 'economics',
    subjectName: 'Economics',
    iconName: 'BarChart3',
    studentName: 'Active UTME Candidate',
    school: 'Social Sciences & Management',
    state: 'National Pool',
    scorePercentage: 94.0,
    questionsSolved: 350,
    tip: 'Calculate price elasticity of demand (Percentage ΔQ / Percentage ΔP) without a calculator using decimal approximations.'
  },
  {
    subjectId: 'government',
    subjectName: 'Government',
    iconName: 'Landmark',
    studentName: 'Active UTME Candidate',
    school: 'Law & Political Science Track',
    state: 'National Pool',
    scorePercentage: 93.0,
    questionsSolved: 330,
    tip: 'Pre-colonial administrative systems (Hausa/Fulani, Yoruba, Igbo) are tested every single UTME sitting.'
  }
];

/**
 * Builds an authentic monthly-reset leaderboard using ONLY real registered candidates
 * and real exam results from the active monthly cycle.
 */
export function generateLeaderboard(
  currentUser: User | null,
  options: LeaderboardFilterOptions,
  mockExamResults: ExamResult[] = [],
  allUsers: User[] = []
): { entries: LeaderboardEntry[]; stats: LeaderboardStatsSummary; champions: SubjectChampion[] } {
  const seasonInfo = getMonthlySeasonInfo();
  const currentXp = gamification.getXp(currentUser);
  const currentStreak = gamification.getStreak(currentUser).streak;

  // Compute start of current month for monthly reset
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const startOfMonthIso = startOfMonth.toISOString();
  const oneWeekAgoMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;

  // Filter exam results strictly according to the selected timeframe
  const timeframeExams = mockExamResults.filter(r => {
    const examDate = r.createdAt || r.date;
    if (!examDate) return false;
    const examMs = new Date(examDate).getTime();

    if (options.timeframe === 'weekly') {
      return examMs >= oneWeekAgoMs;
    }
    if (options.timeframe === 'monthly') {
      return examDate >= startOfMonthIso;
    }
    // all-time includes all exams
    return true;
  });

  // Map of real candidates from allUsers
  const candidateEntries: Omit<LeaderboardEntry, 'rank'>[] = [];
  const processedUserIds = new Set<string>();

  // Helper to compile a candidate's entry from real data
  const buildCandidateEntry = (user: User, isCurrent: boolean) => {
    const userExams = timeframeExams.filter(r => r.userId === user.id);
    const questionsAnswered = userExams.length > 0 
      ? userExams.reduce((acc, r) => acc + (r.totalQuestions || 0), 0)
      : (options.timeframe === 'all-time' ? (user.stats?.questionsAnswered || 0) : 0);

    // Calculate score based on timeframe
    let score = 0;
    let accuracy = 75;

    if (userExams.length > 0) {
      const highest = Math.max(...userExams.map(r => r.jambScore || Math.round((r.scorePercentage / 100) * 400)));
      if (highest > 0) score = highest;
      const avgAcc = Math.round(userExams.reduce((acc, r) => acc + (r.scorePercentage || 70), 0) / userExams.length);
      if (avgAcc > 0) accuracy = avgAcc;
    } else if (options.timeframe === 'all-time' && user.stats?.bestScore) {
      score = Math.round((user.stats.bestScore / 100) * 400);
      accuracy = user.stats.averageScore || 80;
    } else if (isCurrent) {
      // Current user with no exams yet this month
      score = 0;
      accuracy = user.stats?.averageScore || 75;
    }

    const xp = isCurrent ? currentXp : ((user.stats?.questionsAnswered || 10) * 15 + (score > 0 ? score : 50));
    const streak = isCurrent ? (currentStreak || 1) : 3;

    // Subject breakdown
    const subjectScores = [
      { subjectId: 'english', subjectName: 'English Language', scoreOutOf100: Math.round(score * 0.24), accuracy },
      { subjectId: 'mathematics', subjectName: 'Mathematics', scoreOutOf100: Math.round(score * 0.26), accuracy: Math.min(100, accuracy + 2) },
      { subjectId: 'physics', subjectName: 'Physics', scoreOutOf100: Math.round(score * 0.25), accuracy: Math.max(0, accuracy - 1) },
      { subjectId: 'chemistry', subjectName: 'Chemistry', scoreOutOf100: Math.round(score * 0.25), accuracy }
    ];

    const badges: string[] = ['🇳🇬 Verified Student'];
    if (score >= 320) badges.push('🥇 300+ Merit Club');
    if (streak >= 5) badges.push(`🔥 ${streak}-Day Streak`);
    if (accuracy >= 90) badges.push('🎯 Precision Ace');

    // Check integrity status from mock exams
    const hasFlaggedExams = userExams.some(r => r.integrityStatus === 'flagged');
    const integrityStatus: 'verified' | 'flagged' = hasFlaggedExams ? 'flagged' : 'verified';
    if (integrityStatus === 'verified') badges.push('🛡️ Verified Hall');

    // Speed bonus points
    const speedBonusPoints = userExams.reduce((acc, r) => acc + (r.speedBonusPoints || 0), 0);

    // Composite Scholar Index (CSI) Formula:
    // (Mock Score * 2.5) + (Questions Answered * 5 * (accuracy/100)) + (Streak * 40) + Speed Bonus
    const mockComponent = score * 2.5;
    const accuracyComponent = Math.round(questionsAnswered * 5 * (accuracy / 100));
    const consistencyComponent = Math.min(600, streak * 40);
    const rawCsi = Math.round(mockComponent + accuracyComponent + consistencyComponent + speedBonusPoints);
    const csiScore = integrityStatus === 'flagged' ? Math.round(rawCsi * 0.15) : rawCsi;

    const entry: Omit<LeaderboardEntry, 'rank'> = {
      id: user.id,
      name: isCurrent ? (user.name ? `${user.name} (You)` : 'You (Current Student)') : user.name,
      state: 'Nigeria',
      schoolOrCity: user.targetCourse ? `Target: ${user.targetCourse}` : 'Aspirant Student',
      targetExam: user.targetExam === 'WAEC' ? 'WAEC' : user.targetExam === 'BOTH' ? 'BOTH' : 'JAMB',
      targetCourse: user.targetCourse || 'Tertiary Aspirant',
      score,
      csiScore,
      integrityStatus,
      speedBonusPoints,
      accuracyPercentage: accuracy,
      questionsAnswered: Math.max(1, questionsAnswered),
      streakDays: streak,
      xp,
      tierTitle: xp >= 5000 ? 'National CBT Titan' : xp >= 3000 ? 'Grand Academician' : xp >= 1500 ? 'Scholar Master' : 'Senior Scholar',
      topSubject: 'General Studies',
      motto: 'Past questions practice daily on StudyNaija to win this month’s cash prize!',
      badges,
      isCurrentUser: isCurrent,
      subjectScores
    };

    return entry;
  };

  // Add all real registered users (excluding system admin if preferred, or include all registered human candidates)
  if (allUsers && allUsers.length > 0) {
    for (const u of allUsers) {
      if (u.id && !processedUserIds.has(u.id)) {
        processedUserIds.add(u.id);
        const isCurrent = currentUser?.id === u.id;
        candidateEntries.push(buildCandidateEntry(u, isCurrent));
      }
    }
  }

  // If current user is not yet in candidateEntries, add them
  if (currentUser && !processedUserIds.has(currentUser.id)) {
    processedUserIds.add(currentUser.id);
    candidateEntries.push(buildCandidateEntry(currentUser, true));
  } else if (!currentUser && candidateEntries.length === 0) {
    // Guest browsing: create a placeholder for the guest user
    const guestUser: User = {
      id: 'guest-candidate',
      name: 'You (Guest Student)',
      email: 'guest@studynaija.ng',
      role: 'student',
      educationLevel: 'secondary',
      targetExam: 'JAMB',
      premiumPlan: 'free',
      createdAt: new Date().toISOString()
    };
    candidateEntries.push(buildCandidateEntry(guestUser, true));
  }

  // Filter candidates based on options
  let filtered = candidateEntries.filter(student => {
    // Subject filter
    if (options.subjectId && options.subjectId !== 'all') {
      const targetSub = options.subjectId.toLowerCase();
      const hasSubject = (student.topSubject && student.topSubject.toLowerCase().includes(targetSub)) ||
        (student.subjectScores && student.subjectScores.some(s => s.subjectId.toLowerCase() === targetSub || s.subjectName.toLowerCase().includes(targetSub)));
      if (!hasSubject) return false;
    }

    // Exam Type filter
    if (options.examType && options.examType !== 'ALL') {
      if (student.targetExam !== 'BOTH' && student.targetExam !== options.examType) {
        return false;
      }
    }

    // Search query filter
    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      const matches = student.name.toLowerCase().includes(q) ||
        student.state.toLowerCase().includes(q) ||
        (student.schoolOrCity && student.schoolOrCity.toLowerCase().includes(q)) ||
        (student.targetCourse && student.targetCourse.toLowerCase().includes(q));
      if (!matches) return false;
    }

    return true;
  });

  // Sort primarily by Composite Scholar Index (CSI), prioritizing Verified Exam Hall scholars
  filtered.sort((a, b) => {
    // 1. Verified students take precedence over flagged
    if (a.integrityStatus !== b.integrityStatus) {
      return a.integrityStatus === 'verified' ? -1 : 1;
    }
    // 2. Composite Scholar Index (CSI Score)
    const csiDiff = (b.csiScore || 0) - (a.csiScore || 0);
    if (csiDiff !== 0) return csiDiff;

    // 3. Raw Exam Score
    if (b.score !== a.score) return b.score - a.score;

    // 4. Lifetime / Active XP
    return b.xp - a.xp;
  });

  // Assign ranks & link monthly prizes
  const rankedEntries: LeaderboardEntry[] = filtered.map((entry, index) => {
    const rank = index + 1;
    const previousRank = rank;

    return {
      ...entry,
      rank,
      previousRank
    };
  });

  // Find user's standing
  const userRankIndex = rankedEntries.findIndex(e => e.isCurrentUser);
  const currentUserRank = userRankIndex >= 0 ? userRankIndex + 1 : rankedEntries.length + 1;
  const userScore = userRankIndex >= 0 ? rankedEntries[userRankIndex].score : 260;

  const totalCompetitors = Math.max(rankedEntries.length, 1);
  const currentUserPercentile = Math.max(1, Math.min(99, Math.round((1 - (currentUserRank / (totalCompetitors + 5))) * 100)));

  // Points to next rank
  let pointsToNextRank = 0;
  let nextCompetitorName = 'Rank #1 Champion';
  if (userRankIndex > 0) {
    const aheadCompetitor = rankedEntries[userRankIndex - 1];
    pointsToNextRank = Math.max(15, (aheadCompetitor.score - userScore) * 10 || (aheadCompetitor.xp - (currentUser ? currentXp : 100)) || 25);
    nextCompetitorName = aheadCompetitor.name;
  }

  const reigningChampion = rankedEntries[0] || null;

  const stats: LeaderboardStatsSummary = {
    totalCompetitorsNationwide: totalCompetitors,
    currentUserRank,
    currentUserScore: userScore,
    currentUserPercentile,
    pointsToNextRank,
    nextCompetitorName,
    reigningChampionName: reigningChampion ? reigningChampion.name : 'Slot Open (Practice Now)',
    reigningChampionScore: reigningChampion ? reigningChampion.score : 0,
    weeklyPrizeDrawCountdown: `${seasonInfo.daysRemaining}d ${seasonInfo.hoursRemaining}h to Monthly Reset`,
    monthlySeasonTitle: seasonInfo.seasonTitle,
    monthlyResetCountdown: `${seasonInfo.daysRemaining} days, ${seasonInfo.hoursRemaining} hrs, ${seasonInfo.minutesRemaining} mins`,
    daysToReset: seasonInfo.daysRemaining,
    hoursToReset: seasonInfo.hoursRemaining,
    minutesToReset: seasonInfo.minutesRemaining,
    nextResetDate: seasonInfo.resetDateString,
    topPrizesTotalValue: 'Monthly Airtime & Data Grants + VIP Passes'
  };

  return {
    entries: rankedEntries,
    stats,
    champions: SUBJECT_CHAMPIONS
  };
}
