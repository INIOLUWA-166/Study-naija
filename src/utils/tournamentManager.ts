import { 
  TournamentParticipant, 
  TournamentStanding, 
  TournamentMatch, 
  TournamentTieKnockout, 
  TournamentVotingOption, 
  TournamentBankClaim, 
  TournamentState,
  Question,
  User 
} from '../types';
import { BASE_LEADERBOARD_STUDENTS } from './leaderboardData';
import { EXTENDED_QUESTIONS } from './questionBank';
import { INITIAL_QUESTIONS } from '../mockData';
import { createDynamicQuestionVariant, shuffleQuestionOptionsFair } from './questionRandomizer';
import { tournamentAudio } from './tournamentAudio';
import { triggerChampionsLeagueVictoryConfetti } from './confettiCelebration';

const TOURNAMENT_STORAGE_KEY = 'studynaija_monthly_champions_league';

/**
 * Authentic Nigerian Student Names for Qualified Top 32 Candidates
 */
export const TOURNAMENT_SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'economics', 'government'];

export const QUALIFIED_TOP_32_SCHOLARS: Array<{ name: string; state: string; score: number; xp: number }> = [
  { name: 'Chukwuebuka Obi', state: 'Anambra', score: 368, xp: 4850 },
  { name: 'Amina Bello', state: 'Kaduna', score: 362, xp: 4620 },
  { name: 'Oluwaseun Adeyemi', state: 'Oyo', score: 358, xp: 4410 },
  { name: 'Fatima Danjuma', state: 'Kano', score: 354, xp: 4280 },
  { name: 'Ibrahim Yakubu', state: 'Abuja FCT', score: 349, xp: 4100 },
  { name: 'Blessing Eze', state: 'Enugu', score: 345, xp: 3950 },
  { name: 'Emeka Nwankwo', state: 'Imo', score: 341, xp: 3820 },
  { name: 'Zainab Aliyu', state: 'Sokoto', score: 338, xp: 3710 },
  { name: 'Tunde Bakare', state: 'Lagos', score: 335, xp: 3600 },
  { name: 'Chioma Okonkwo', state: 'Delta', score: 332, xp: 3520 },
  { name: 'Yusuf Garba', state: 'Katsina', score: 329, xp: 3440 },
  { name: 'Grace Adebayo', state: 'Ogun', score: 326, xp: 3370 },
  { name: 'Samuel Umeh', state: 'Rivers', score: 324, xp: 3300 },
  { name: 'Halima Mohammed', state: 'Borno', score: 321, xp: 3240 },
  { name: 'Kelechi Madu', state: 'Abia', score: 318, xp: 3180 },
  { name: 'Ayomide Balogun', state: 'Osun', score: 315, xp: 3120 },
  { name: 'Maryam Shehu', state: 'Niger', score: 312, xp: 3060 },
  { name: 'Somtochukwu Iloka', state: 'Anambra', score: 310, xp: 3000 },
  { name: 'Ngozi Chukwu', state: 'Ebonyi', score: 308, xp: 2950 },
  { name: 'Bashir Umar', state: 'Kebbi', score: 305, xp: 2900 },
  { name: 'Damilola Fashola', state: 'Lagos', score: 303, xp: 2850 },
  { name: 'Rita Nwachukwu', state: 'Imo', score: 301, xp: 2800 },
  { name: 'Usman Jibril', state: 'Bauchi', score: 298, xp: 2750 },
  { name: 'Chidiebere Igwe', state: 'Enugu', score: 296, xp: 2700 },
  { name: 'Titilayo Adeleke', state: 'Ondo', score: 294, xp: 2650 },
  { name: 'Farouk Lawal', state: 'Kwara', score: 292, xp: 2600 },
  { name: 'Ebele Nnamdi', state: 'Delta', score: 290, xp: 2550 },
  { name: 'Hauwa Abubakar', state: 'Gombe', score: 288, xp: 2500 },
  { name: 'Victor Okoye', state: 'Anambra', score: 286, xp: 2450 },
  { name: 'Simisola Ogundipe', state: 'Ekiti', score: 284, xp: 2400 },
  { name: 'Mustapha Kabir', state: 'Adamawa', score: 282, xp: 2350 },
  { name: 'Joy Chinedu', state: 'Rivers', score: 280, xp: 2300 }
];

/**
 * Initializes or compiles the 32 qualified candidate slots from registered students / leaderboard
 */
export function buildQualifiedParticipants(currentUser: User | null): TournamentParticipant[] {
  const participants: TournamentParticipant[] = QUALIFIED_TOP_32_SCHOLARS.map((s, idx) => ({
    id: `scholar-${idx + 1}`,
    name: s.name,
    email: `scholar${idx + 1}@studynaija.ng`,
    previousLeaderboardRank: idx + 1,
    score: s.score,
    xp: s.xp,
    state: s.state,
    isCurrentUser: false
  }));

  if (currentUser) {
    const isAdmin = currentUser.role === 'admin' || currentUser.email === 'admin@studynaija.ng';
    if (isAdmin) {
      participants[0] = {
        id: currentUser.id,
        name: `${currentUser.name} (Admin)`,
        email: currentUser.email,
        previousLeaderboardRank: 1,
        score: currentUser.stats?.bestScore ? Math.round((currentUser.stats.bestScore / 100) * 400) : 380,
        xp: currentUser.xp || 5000,
        state: currentUser.state || 'Nigeria',
        isCurrentUser: true
      };
    } else {
      // For regular users: Only qualify if user's XP / rank earned places them in the Top 32!
      // Minimum qualifying XP benchmark for 32nd place is 2300 XP
      const userXp = currentUser.xp || 0;
      if (userXp >= 2300) {
        let insertIdx = participants.findIndex(p => userXp >= p.xp);
        if (insertIdx === -1) insertIdx = 31;
        participants[insertIdx] = {
          id: currentUser.id,
          name: `${currentUser.name} (You)`,
          email: currentUser.email,
          previousLeaderboardRank: insertIdx + 1,
          score: currentUser.stats?.bestScore ? Math.round((currentUser.stats.bestScore / 100) * 400) : Math.round((userXp / 5000) * 400),
          xp: userXp,
          state: currentUser.state || 'Nigeria',
          isCurrentUser: true
        };
      }
      // If userXp < 2300, user is NOT qualified and none of the participants has isCurrentUser: true
    }
  }

  return participants;
}

/**
 * Universal qualification validator for Champions League
 * Returns true if the user is an admin, a qualified Top 32 candidate, has >= 2300 XP,
 * or holds a championship title (1st/2nd/3rd or GOAT).
 */
export function isUserQualifiedForChampions(user: User | null, tournamentState?: TournamentState | null): boolean {
  if (!user) return false;
  const isAdmin = Boolean(
    user.role === 'admin' ||
    user.email?.toLowerCase() === 'luvkidjaja@gmail.com' ||
    user.email?.toLowerCase() === 'admin@studynaija.ng'
  );
  if (isAdmin) return true;

  if (user.isGoat || user.tournamentBadge === '1st' || user.tournamentBadge === '2nd' || user.tournamentBadge === '3rd') {
    return true;
  }

  const userXp = user.xp || 0;
  if (userXp >= 2300) return true;

  if (tournamentState && Array.isArray(tournamentState.participants)) {
    const isParticipant = tournamentState.participants.some(p => 
      p.isCurrentUser || 
      p.id === user.id || 
      (user.email && p.email?.toLowerCase() === user.email.toLowerCase())
    );
    if (isParticipant) return true;
  }

  return false;
}

/**
 * Procedural Tournament Questions Generator for 10-Question Matches
 */
export function getTournamentQuestions(subjectId: string, count = 10): Question[] {
  const full = [...INITIAL_QUESTIONS, ...EXTENDED_QUESTIONS];
  let pool = full.filter(q => q.subjectId === subjectId);
  if (pool.length < count) {
    pool = full;
  }
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(q => shuffleQuestionOptionsFair(createDynamicQuestionVariant(q)));
}

/**
 * 4-Subject Final Questions Generator: 10 Qs each from ENG, MTH, PHY, CHM = 40 Qs
 */
export function getGrandeFinaleQuestions(): Question[] {
  const subjects = ['english', 'mathematics', 'physics', 'chemistry'];
  const finaleQuestions: Question[] = [];
  subjects.forEach(sub => {
    const subQs = getTournamentQuestions(sub, 10);
    finaleQuestions.push(...subQs);
  });
  return finaleQuestions;
}

/**
 * Live Countdown calculator to the 12th at 8:00 PM WAT kickoff
 * Locks access until the 12th of the month, and after the final locks it back until the 12th of next month
 */
export function getNextTournamentCountdown(tournamentCompleted = false) {
  const now = new Date();
  const currentDay = now.getDate();
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth();

  // If tournament for this month has completed, or if day > 17 (after tournament window),
  // countdown must point to the 12th of the NEXT month!
  if (tournamentCompleted || currentDay > 17) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  // 12th of targetMonth at 8:00 PM WAT (19:00:00 UTC)
  const kickoffDate = new Date(Date.UTC(targetYear, targetMonth, 12, 19, 0, 0));
  const diffMs = Math.max(0, kickoffDate.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    targetDate: kickoffDate.toISOString(),
    formattedTarget: `12th ${monthNames[targetMonth]} ${targetYear} at 8:00 PM WAT`,
    targetMonthName: monthNames[targetMonth],
    isUpcoming: totalSeconds > 0
  };
}

/**
 * Constructs an authentic initial Tournament State for the active month
 */
export function initializeTournamentState(currentUser: User | null): TournamentState {
  const now = new Date();
  const year = now.getFullYear();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[now.getMonth()];
  const seasonKey = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const seasonTitle = `${monthName} ${year} Champions League`;

  const participants = buildQualifiedParticipants(currentUser);

  // Voting options for Group stage start time on the 12th
  const votingOptions: TournamentVotingOption[] = [
    { time: '14:00', label: '2:00 PM WAT (Afternoon Kickoff)', votes: 0, voterIds: [] },
    { time: '16:00', label: '4:00 PM WAT (Late Afternoon)', votes: 0, voterIds: [] },
    { time: '18:00', label: '6:00 PM WAT (Sunset Match)', votes: 0, voterIds: [] },
    { time: '20:00', label: '8:00 PM WAT (Prime Evening - Recommended)', votes: 0, voterIds: [] }
  ];

  // Distribute into 8 groups (Group A to H)
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());

  const groups = groupLetters.map((letter, gIdx) => {
    const groupMembers = shuffledParticipants.slice(gIdx * 4, gIdx * 4 + 4);
    
    // Fresh unplayed standings (0 played, 0 points)
    const standings: TournamentStanding[] = groupMembers.map((m, idx) => ({
      participantId: m.id,
      participantName: m.name,
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
      correctAnswers: 0,
      rank: idx + 1,
      advanced: false
    }));

    // Generate upcoming round robin matches (4 members = 6 matches)
    const matches: TournamentMatch[] = [];
    let matchCounter = 1;
    for (let i = 0; i < groupMembers.length; i++) {
      for (let j = i + 1; j < groupMembers.length; j++) {
        const p1 = groupMembers[i];
        const p2 = groupMembers[j];
        const sub = TOURNAMENT_SUBJECTS[(gIdx + matchCounter) % TOURNAMENT_SUBJECTS.length];

        matches.push({
          id: `match-grp-${letter}-${matchCounter}`,
          round: 'group',
          groupId: letter,
          matchNumber: matchCounter,
          player1: p1,
          player2: p2,
          player1Score: 0,
          player2Score: 0,
          winnerId: undefined,
          isCompleted: false,
          durationSeconds: sub === 'mathematics' ? 300 : 120,
          subjectId: sub,
          startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-12T20:00:00.000Z`
        });
        matchCounter++;
      }
    }

    return {
      id: letter,
      name: `Group ${letter}`,
      participants: groupMembers,
      standings,
      matches
    };
  });

  // Top 16 advancing from Groups (1st and 2nd in each of 8 groups)
  const r16Participants: TournamentParticipant[] = [];
  groups.forEach(g => {
    const top2 = g.standings.filter(s => s.advanced).sort((a, b) => a.rank - b.rank);
    top2.forEach(s => {
      const p = g.participants.find(part => part.id === s.participantId);
      if (p) r16Participants.push(p);
    });
  });

  // Round of 16 Knockout Ties (8 ties, 2 legs each) - Upcoming/Unplayed
  const r16Ties: TournamentTieKnockout[] = [];
  for (let i = 0; i < 8; i++) {
    const p1 = participants[i * 2];
    const p2 = participants[i * 2 + 1];

    r16Ties.push({
      id: `tie-r16-${i + 1}`,
      round: 'r16',
      tieIndex: i + 1,
      player1: p1,
      player2: p2,
      leg1Match: {
        id: `match-r16-${i + 1}-leg1`,
        round: 'r16',
        leg: 1,
        player1: p1,
        player2: p2,
        player1Score: 0,
        player2Score: 0,
        winnerId: undefined,
        isCompleted: false,
        durationSeconds: 120,
        subjectId: 'english',
        startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-13T20:00:00.000Z`
      },
      leg2Match: {
        id: `match-r16-${i + 1}-leg2`,
        round: 'r16',
        leg: 2,
        player1: p1,
        player2: p2,
        player1Score: 0,
        player2Score: 0,
        winnerId: undefined,
        isCompleted: false,
        durationSeconds: 120,
        subjectId: 'mathematics',
        startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-13T20:15:00.000Z`
      },
      aggregatePlayer1Score: 0,
      aggregatePlayer2Score: 0,
      winnerId: undefined,
      isCompleted: false
    });
  }

  // Quarter Finals (4 ties, 2 legs) - Upcoming/Unplayed
  const quarterTies: TournamentTieKnockout[] = [];
  for (let i = 0; i < 4; i++) {
    const p1 = participants[i * 4];
    const p2 = participants[i * 4 + 1];

    quarterTies.push({
      id: `tie-qf-${i + 1}`,
      round: 'quarters',
      tieIndex: i + 1,
      player1: p1,
      player2: p2,
      leg1Match: {
        id: `match-qf-${i + 1}-leg1`,
        round: 'quarters',
        leg: 1,
        player1: p1,
        player2: p2,
        player1Score: 0,
        player2Score: 0,
        winnerId: undefined,
        isCompleted: false,
        durationSeconds: 120,
        subjectId: 'physics',
        startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-14T20:00:00.000Z`
      },
      leg2Match: {
        id: `match-qf-${i + 1}-leg2`,
        round: 'quarters',
        leg: 2,
        player1: p1,
        player2: p2,
        player1Score: 0,
        player2Score: 0,
        winnerId: undefined,
        isCompleted: false,
        durationSeconds: 120,
        subjectId: 'chemistry',
        startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-14T20:15:00.000Z`
      },
      aggregatePlayer1Score: 0,
      aggregatePlayer2Score: 0,
      winnerId: undefined,
      isCompleted: false
    });
  }

  // Semi Finals (2 ties, 2 legs) - Upcoming/Unplayed
  const semiTies: TournamentTieKnockout[] = [];
  for (let i = 0; i < 2; i++) {
    const p1 = participants[i * 8];
    const p2 = participants[i * 8 + 1];

    semiTies.push({
      id: `tie-sf-${i + 1}`,
      round: 'semis',
      tieIndex: i + 1,
      player1: p1,
      player2: p2,
      leg1Match: {
        id: `match-sf-${i + 1}-leg1`,
        round: 'semis',
        leg: 1,
        player1: p1,
        player2: p2,
        player1Score: 0,
        player2Score: 0,
        winnerId: undefined,
        isCompleted: false,
        durationSeconds: 120,
        subjectId: 'biology',
        startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-15T20:00:00.000Z`
      },
      leg2Match: {
        id: `match-sf-${i + 1}-leg2`,
        round: 'semis',
        leg: 2,
        player1: p1,
        player2: p2,
        player1Score: 0,
        player2Score: 0,
        winnerId: undefined,
        isCompleted: false,
        durationSeconds: 120,
        subjectId: 'economics',
        startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-15T20:15:00.000Z`
      },
      aggregatePlayer1Score: 0,
      aggregatePlayer2Score: 0,
      winnerId: undefined,
      isCompleted: false
    });
  }

  // 3rd Place Play-Off Tie - Upcoming/Unplayed
  const thirdPlaceTie: TournamentTieKnockout = {
    id: 'tie-third-place',
    round: 'third_place',
    tieIndex: 1,
    player1: participants[2],
    player2: participants[3],
    leg1Match: {
      id: 'match-3rd-leg1',
      round: 'third_place',
      leg: 1,
      player1: participants[2],
      player2: participants[3],
      player1Score: 0,
      player2Score: 0,
      winnerId: undefined,
      isCompleted: false,
      durationSeconds: 120,
      subjectId: 'government',
      startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-17T19:00:00.000Z`
    },
    leg2Match: {
      id: 'match-3rd-leg2',
      round: 'third_place',
      leg: 2,
      player1: participants[2],
      player2: participants[3],
      player1Score: 0,
      player2Score: 0,
      winnerId: undefined,
      isCompleted: false,
      durationSeconds: 120,
      subjectId: 'english',
      startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-17T19:15:00.000Z`
    },
    aggregatePlayer1Score: 0,
    aggregatePlayer2Score: 0,
    winnerId: undefined,
    isCompleted: false
  };

  // Grande Finale Tie - Upcoming/Unplayed
  const finalTie: TournamentTieKnockout = {
    id: 'tie-grand-finale',
    round: 'final',
    tieIndex: 1,
    player1: participants[0],
    player2: participants[1],
    leg1Match: {
      id: 'match-grand-finale',
      round: 'final',
      leg: 1,
      player1: participants[0],
      player2: participants[1],
      player1Score: 0,
      player2Score: 0,
      winnerId: undefined,
      isCompleted: false,
      durationSeconds: 480,
      subjectId: 'all_four_subjects',
      startTime: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-17T20:00:00.000Z`
    },
    aggregatePlayer1Score: 0,
    aggregatePlayer2Score: 0,
    winnerId: undefined,
    isCompleted: false
  };

  // Unplayed Tournament State: NOBODY HAS WON YET
  const champion = null;
  const runnerUp = null;
  const thirdPlace = null;
  const bankClaims: TournamentBankClaim[] = [];

  const countdown = getNextTournamentCountdown();

  return {
    seasonKey,
    seasonTitle,
    currentStage: 'voting',
    groupStageStartDate: countdown.targetDate,
    votingDeadline: `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-11T23:59:59.000Z`,
    votingOptions,
    winningGroupStartTime: '8:00 PM WAT',
    participants,
    groups,
    r16Ties,
    quarterTies,
    semiTies,
    thirdPlaceTie,
    finalTie,
    champion,
    runnerUp,
    thirdPlace,
    globalAnnouncement: null,
    bankClaims,
    aiOrchestratorLogs: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        stage: 'voting',
        event: 'Upcoming Champions League Initialized',
        details: `Autonomous Admin AI initialized the ${seasonTitle}. Top 32 merit candidates from previous month leaderboard qualified. Countdown active to kickoff on ${countdown.formattedTarget}.`,
        automaticAction: true
      },
      {
        id: 'log-2',
        timestamp: new Date().toISOString(),
        stage: 'voting',
        event: 'Kickoff Time Voting Open',
        details: 'Gold Voting Bar open for 32 candidates. Leading time: 8:00 PM WAT. Nobody has won yet.',
        automaticAction: true
      }
    ]
  };
}

/**
 * Storage and Client Sync Manager for Tournament State
 */
class TournamentManager {
  private state: TournamentState | null = null;

  constructor() {
    this.loadState();
  }

  public getState(currentUser: User | null = null): TournamentState {
    if (!this.state) {
      this.state = initializeTournamentState(currentUser);
      this.saveState();
    }
    // Update current user references
    if (currentUser) {
      const isPart = this.state.participants.some(p => p.id === currentUser.id || p.email === currentUser.email);
      if (isPart) {
        this.state.participants = this.state.participants.map(p => {
          if (p.id === currentUser.id || p.email === currentUser.email) {
            return { ...p, isCurrentUser: true, name: `${currentUser.name} (You)` };
          }
          return p;
        });
      }
    }
    return this.state;
  }

  public saveState(): void {
    if (typeof window === 'undefined' || !this.state) return;
    try {
      localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  public loadState(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure reset so nobody has won it by default (active upcoming tournament)
        if (parsed && !parsed.champion) {
          this.state = parsed;
        } else {
          this.state = initializeTournamentState(null);
          this.state.champion = null;
          this.state.runnerUp = null;
          this.state.thirdPlace = null;
          this.state.bankClaims = [];
          this.state.globalAnnouncement = null;
          this.saveState();
        }
      }
    } catch {}
  }

  /**
   * Cast a vote for group stage kickoff time
   */
  public castVote(time: string, userId: string): { success: boolean; message: string; state: TournamentState } {
    const state = this.getState();
    const opt = state.votingOptions.find(o => o.time === time);
    if (!opt) {
      return { success: false, message: 'Invalid voting option', state };
    }

    // Check if user already voted in any option
    const alreadyVoted = state.votingOptions.some(o => o.voterIds.includes(userId));
    if (alreadyVoted) {
      return { success: false, message: 'You have already voted! Each candidate can vote only once.', state };
    }

    opt.votes += 1;
    opt.voterIds.push(userId);
    state.hasUserVoted = true;
    state.userVoteTime = time;

    // Recalculate winning time
    const highest = [...state.votingOptions].sort((a, b) => b.votes - a.votes)[0];
    if (highest) {
      state.winningGroupStartTime = `${highest.label.split(' ')[0]} WAT`;
    }

    this.saveState();
    return { success: true, message: `Vote recorded for ${opt.label}!`, state };
  }

  /**
   * AI Assistant Random Group Distribution
   */
  public randomizeGroups(): TournamentState {
    const state = this.getState();
    const shuffled = [...state.participants].sort(() => 0.5 - Math.random());
    const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    state.groups = groupLetters.map((letter, gIdx) => {
      const groupMembers = shuffled.slice(gIdx * 4, gIdx * 4 + 4);
      const standings: TournamentStanding[] = groupMembers.map((m, idx) => ({
        participantId: m.id,
        participantName: m.name,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
        correctAnswers: 0,
        rank: idx + 1,
        advanced: false
      }));

      return {
        id: letter,
        name: `Group ${letter}`,
        participants: groupMembers,
        standings,
        matches: []
      };
    });

    state.aiOrchestratorLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'group_stage',
      event: 'Groups Randomly Distributed by Admin AI Assistant',
      details: 'All 32 candidates shuffled into Groups A through H for fair Champions League format.',
      automaticAction: true
    });

    this.saveState();
    return state;
  }

  /**
   * Submit bank details for prize payout
   */
  public submitBankClaim(claimData: { userId: string; accountNumber: string; accountName: string; bankName: string }): { success: boolean; message: string; claim: TournamentBankClaim } {
    const state = this.getState();
    let claim = state.bankClaims.find(c => c.userId === claimData.userId);
    if (!claim) {
      // Determine rank
      const is1st = state.champion?.id === claimData.userId;
      const is2nd = state.runnerUp?.id === claimData.userId;
      const rank = is1st ? 1 : is2nd ? 2 : 3;

      claim = {
        id: `claim-${rank}-${Date.now()}`,
        seasonKey: state.seasonKey,
        userId: claimData.userId,
        userName: claimData.accountName,
        rank: rank as 1 | 2 | 3,
        accountNumber: claimData.accountNumber,
        accountName: claimData.accountName,
        bankName: claimData.bankName,
        prizeAmount: rank === 1 ? '₦5,000' : rank === 2 ? '₦3,000' : '₦1,500',
        membershipGranted: rank === 1 ? '1-Month Free Premium' : rank === 2 ? '1-Month Free Medium' : '1-Month Free Basic',
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      state.bankClaims.push(claim);
    } else {
      claim.accountNumber = claimData.accountNumber;
      claim.accountName = claimData.accountName;
      claim.bankName = claimData.bankName;
      claim.status = 'pending';
      claim.submittedAt = new Date().toISOString();
    }

    state.aiOrchestratorLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'prizes',
      event: 'Bank Details Submitted',
      details: `Winner ${claim.userName} (Rank #${claim.rank}) submitted ${claim.bankName} - ${claim.accountNumber} for ${claim.prizeAmount}. Sent to Admin Portal.`,
      automaticAction: true
    });

    this.saveState();
    return { success: true, message: 'Bank details received! Admin will transfer your cash prize.', claim };
  }

  /**
   * Reset tournament to upcoming state (Nobody has won yet)
   */
  public resetTournament(currentUser: User | null = null): TournamentState {
    this.state = initializeTournamentState(currentUser);
    this.state.champion = null;
    this.state.runnerUp = null;
    this.state.thirdPlace = null;
    this.state.bankClaims = [];
    this.state.globalAnnouncement = null;
    this.state.currentStage = 'voting';
    this.saveState();
    return this.state;
  }

  /**
   * Admin exclusive AI battle victory handler
   * Records Admin as the undisputed 1st place National Champions League G.O.A.T!
   */
  public recordAdminAiVictory(adminUser: User): TournamentState {
    const state = this.getState();
    const champParticipant: TournamentParticipant = {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      previousLeaderboardRank: 1,
      score: 395,
      xp: (adminUser.xp || 5000) + 2500,
      state: adminUser.state || 'Lagos',
      isCurrentUser: true,
      isGoat: true
    };

    state.champion = champParticipant;
    state.currentStage = 'completed';
    state.globalAnnouncement = {
      championName: adminUser.name,
      announcedAt: new Date().toISOString(),
      title: `🐐 ${adminUser.name} Crowned Undisputed G.O.A.T of the Champions League! 🏆`,
      message: `ALL HAIL THE G.O.A.T! Hearty congratulations to ${adminUser.name} for conquering the Grande Finale with 100% exam supremacy. The website has transformed into G.O.A.T Mode with 24K Gold Lightning Aura, VIP Unrestricted Scholar Access, and ₦5,000 Cash Prize. Title remains active until the next Champions League kicks off!`
    };

    // Add 1st place prize claim for admin
    state.bankClaims = state.bankClaims.filter(c => c.rank !== 1);
    state.bankClaims.unshift({
      id: `claim-1st-${state.seasonKey}`,
      seasonKey: state.seasonKey,
      userId: adminUser.id,
      userName: adminUser.name,
      userEmail: adminUser.email,
      rank: 1,
      accountNumber: '9166059676',
      accountName: adminUser.name,
      bankName: 'OPay Digital Services',
      prizeAmount: '₦5,000',
      membershipGranted: '1-Month Free Premium + G.O.A.T Status',
      status: 'pending',
      submittedAt: new Date().toISOString()
    });

    state.aiOrchestratorLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'grand_finale',
      event: '🐐 G.O.A.T CORONATION: Champions League Grande Finale Conquered',
      details: `${adminUser.name} emerged victorious in the Champions League. Website G.O.A.T Mode Activated. All VIP Scholar privileges active until next tournament season begins.`,
      automaticAction: true
    });

    this.saveState();

    // Trigger audio fanfare and multi-volley confetti celebration
    try {
      tournamentAudio.playChampionsFanfare();
      triggerChampionsLeagueVictoryConfetti();
    } catch {}

    // Dispatch global custom event for immediate UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studynaija_goat_crowned', {
        detail: { champion: champParticipant, user: adminUser }
      }));
    }

    return state;
  }

  /**
   * Candidate Grande Finale Victory Handler
   * Crowns candidate as the official Champions League G.O.A.T
   */
  public recordCandidateGrandeFinaleWin(winnerUser: User, runnerUp: TournamentParticipant): TournamentState {
    const state = this.getState();
    const champParticipant: TournamentParticipant = {
      id: winnerUser.id,
      name: winnerUser.name,
      email: winnerUser.email,
      previousLeaderboardRank: 1,
      score: 388,
      xp: (winnerUser.xp || 5000) + 2000,
      state: winnerUser.state || 'Nigeria',
      isCurrentUser: true,
      isGoat: true
    };

    state.champion = champParticipant;
    state.runnerUp = runnerUp;
    state.currentStage = 'completed';
    state.globalAnnouncement = {
      championName: winnerUser.name,
      announcedAt: new Date().toISOString(),
      title: `🐐 ${winnerUser.name} Crowned National Champions League G.O.A.T! 🏆`,
      message: `Sensational triumph! Candidate ${winnerUser.name} defeated ${runnerUp.name} in the 4-Subject Grande Finale. Website G.O.A.T Mode Activated with 24K Gold Lightning Aura and ₦5,000 Cash Prize.`
    };

    state.bankClaims = state.bankClaims.filter(c => c.rank !== 1);
    state.bankClaims.unshift({
      id: `claim-1st-${state.seasonKey}`,
      seasonKey: state.seasonKey,
      userId: winnerUser.id,
      userName: winnerUser.name,
      userEmail: winnerUser.email,
      rank: 1,
      accountNumber: '',
      accountName: winnerUser.name,
      bankName: 'Pending Winner Submission',
      prizeAmount: '₦5,000',
      membershipGranted: '1-Month Free Premium + G.O.A.T Status',
      status: 'pending',
      submittedAt: new Date().toISOString()
    });

    state.aiOrchestratorLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'grand_finale',
      event: '🐐 G.O.A.T CORONATION: Candidate Grande Finale Victory',
      details: `${winnerUser.name} defeated ${runnerUp.name}. Website transformed into G.O.A.T mode until next season starts.`,
      automaticAction: true
    });

    this.saveState();

    try {
      tournamentAudio.playChampionsFanfare();
      triggerChampionsLeagueVictoryConfetti();
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studynaija_goat_crowned', {
        detail: { champion: champParticipant, user: winnerUser }
      }));
    }

    return state;
  }

  /**
   * CRITICAL USER REQUIREMENT:
   * "And make it that whenever the next champions league starts all the privilege is taken away by the admin Ai"
   * 
   * When the next Champions League tournament begins:
   * 1. The Admin AI Sentinel revokes the G.O.A.T status, champion badge, and all temporary privileges!
   * 2. Archives previous champion into historical Hall of Fame.
   * 3. Re-inaugurates fresh tournament brackets for the new season.
   * 4. Dispatches live directive alert to user and plays alert audio.
   */
  public adminAiStartNewSeasonAndRevokePrivileges(currentUser?: User | null): {
    updatedTournament: TournamentState;
    revokedNotice: {
      revokedChampionName: string;
      newSeasonTitle: string;
      timestamp: string;
      reason: string;
    };
  } {
    const prevState = this.getState();
    const prevChampion = prevState.champion;
    const prevChampionName = prevChampion?.name || 'Reigning Champion';
    const prevChampionId = prevChampion?.id || '';

    // Archive previous champion
    const archivedChampions = prevState.archivedChampions || [];
    if (prevChampion) {
      archivedChampions.unshift({
        seasonKey: prevState.seasonKey,
        seasonTitle: prevState.seasonTitle,
        championName: prevChampion.name,
        championId: prevChampion.id,
        reignEndedAt: new Date().toISOString(),
        revokedByAdminAi: true
      });
    }

    // Advance season
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const newMonthName = monthNames[(now.getMonth() + 1) % 12];
    const newYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    const newSeasonKey = `${newYear}-${String(((now.getMonth() + 1) % 12) + 1).padStart(2, '0')}`;
    const newSeasonTitle = `${newMonthName} ${newYear} Champions League`;

    // Initialize fresh tournament state for the new season
    const freshState = initializeTournamentState(currentUser || null);
    freshState.seasonKey = newSeasonKey;
    freshState.seasonTitle = newSeasonTitle;
    freshState.champion = null;
    freshState.runnerUp = null;
    freshState.thirdPlace = null;
    freshState.archivedChampions = archivedChampions;
    freshState.currentStage = 'group_stage'; // Immediately active for battle!

    const revokedNotice = {
      revokedChampionName: prevChampionName,
      newSeasonTitle,
      timestamp: new Date().toISOString(),
      reason: `The Admin AI Sentinel has officially launched the ${newSeasonTitle}! In accordance with academic tournament regulations, all previous championship privileges, G.O.A.T title belts, and 24K Gold aura have been revoked. Candidates must fight through the new brackets to reclaim the crown.`
    };

    freshState.adminAiRevocationNotice = {
      active: true,
      ...revokedNotice
    };

    freshState.aiOrchestratorLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'group_stage',
      event: '⚡ ADMIN AI SENTINEL REVOCATION: Champions League Throne Relinquished',
      details: `New tournament season started. ${prevChampionName}'s G.O.A.T privileges and titles were revoked by Admin AI Sentinel. Defense of the throne initiated.`,
      automaticAction: true
    });

    this.state = freshState;
    this.saveState();

    // Play ominous Admin AI revocation sound
    try {
      tournamentAudio.playAdminAiRevocationSound();
    } catch {}

    // Dispatch global event so UI immediately clears GOAT mode & shows Admin AI modal
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studynaija_admin_ai_revocation', {
        detail: {
          revokedNotice,
          prevChampionId,
          prevChampionName,
          newSeasonTitle
        }
      }));
    }

    return {
      updatedTournament: freshState,
      revokedNotice
    };
  }

  /**
   * Realistic Match Simulation:
   * Simulates a two-student clash realistically based on speed, subject difficulty, and pressure
   */
  public simulateMatchRealistic(matchId: string): { 
    match: TournamentMatch; 
    commentary: string[]; 
    isCompleted: boolean;
  } {
    const state = this.getState();
    let foundMatch: TournamentMatch | null = null;
    const commentary: string[] = [];

    // Search in groups
    for (const g of state.groups) {
      const m = g.matches.find(item => item.id === matchId);
      if (m) {
        foundMatch = m;
        break;
      }
    }

    // Search in knockouts
    if (!foundMatch) {
      const allTies = [...state.r16Ties, ...state.quarterTies, ...state.semiTies];
      if (state.thirdPlaceTie) allTies.push(state.thirdPlaceTie);
      if (state.finalTie) allTies.push(state.finalTie);

      for (const tie of allTies) {
        if (tie.leg1Match.id === matchId) {
          foundMatch = tie.leg1Match;
          break;
        }
        if (tie.leg2Match && tie.leg2Match.id === matchId) {
          foundMatch = tie.leg2Match;
          break;
        }
      }
    }

    if (!foundMatch) {
      return { match: {} as any, commentary: ['Match not found'], isCompleted: false };
    }

    // Simulate authentic scores (out of 10)
    // High-caliber Nigerian scholars typically score between 6 and 10
    const p1Accuracy = 0.70 + Math.random() * 0.25;
    const p2Accuracy = 0.70 + Math.random() * 0.25;

    let p1Score = Math.floor(p1Accuracy * 10);
    let p2Score = Math.floor(p2Accuracy * 10);

    // If tied, enforce tie-breaker rule (No draws allowed in Champions League)
    if (p1Score === p2Score) {
      if (Math.random() > 0.5) {
        p1Score = Math.min(10, p1Score + 1);
      } else {
        p2Score = Math.min(10, p2Score + 1);
      }
      commentary.push(`⏱️ Sudden-death tie-breaker shootout was required to break the stalemate!`);
    }

    foundMatch.player1Score = p1Score;
    foundMatch.player2Score = p2Score;
    foundMatch.isCompleted = true;
    foundMatch.winnerId = p1Score > p2Score ? foundMatch.player1.id : foundMatch.player2.id;

    const winnerName = p1Score > p2Score ? foundMatch.player1.name : foundMatch.player2.name;
    const loserName = p1Score > p2Score ? foundMatch.player2.name : foundMatch.player1.name;

    commentary.push(`⚡ Kickoff whistle sounded in the National Arena!`);
    commentary.push(`📊 ${foundMatch.player1.name} scored ${p1Score}/10 vs ${foundMatch.player2.name} ${p2Score}/10.`);
    commentary.push(`🏆 ${winnerName} prevails with clinical precision over ${loserName}!`);

    // Update group standings if group match
    if (foundMatch.groupId) {
      const grp = state.groups.find(g => g.id === foundMatch!.groupId);
      if (grp) {
        const s1 = grp.standings.find(s => s.participantId === foundMatch!.player1.id);
        const s2 = grp.standings.find(s => s.participantId === foundMatch!.player2.id);

        if (s1 && s2) {
          s1.played += 1;
          s2.played += 1;
          s1.correctAnswers += p1Score;
          s2.correctAnswers += p2Score;

          if (p1Score > p2Score) {
            s1.won += 1;
            s1.points += 3;
            s2.lost += 1;
            s2.points += 1; // 1 point consolation for tie-break/match loss
          } else {
            s2.won += 1;
            s2.points += 3;
            s1.lost += 1;
            s1.points += 1;
          }

          // Recalculate rank
          grp.standings.sort((a, b) => b.points - a.points || b.correctAnswers - a.correctAnswers);
          grp.standings.forEach((st, idx) => {
            st.rank = idx + 1;
            st.advanced = idx < 2; // Top 2 advance
          });
        }
      }
    }

    this.saveState();
    return { match: foundMatch, commentary, isCompleted: true };
  }

  /**
   * Simulate all matches in a group to see authentic live table movements
   */
  public simulateEntireGroup(groupId: string): TournamentState {
    const state = this.getState();
    const grp = state.groups.find(g => g.id === groupId);
    if (!grp) return state;

    grp.matches.forEach(m => {
      if (!m.isCompleted) {
        this.simulateMatchRealistic(m.id);
      }
    });

    return this.getState();
  }
}

export const tournamentManager = new TournamentManager();
