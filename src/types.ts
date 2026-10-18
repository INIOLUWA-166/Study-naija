export type ExamType = 'JAMB' | 'WAEC' | 'ALL' | 'COMMON_ENTRANCE' | 'UNIVERSITY_GST';

export type EducationLevel = 'primary' | 'secondary' | 'university';

export type SubjectId =
  | 'english'
  | 'mathematics'
  | 'biology'
  | 'chemistry'
  | 'physics'
  | 'economics'
  | 'government'
  | 'primary-math'
  | 'primary-english'
  | 'primary-science'
  | 'primary-reasoning'
  | 'primary-social'
  | 'uni-gst101'
  | 'uni-gst102'
  | 'uni-gst103'
  | 'uni-math101'
  | 'uni-phy101'
  | 'uni-chm101';

export interface OptionItem {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  subjectId: SubjectId | string;
  subjectName: string;
  educationLevel?: EducationLevel;
  topic: string;
  examType: ExamType;
  year?: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  isDailyFairRandomized?: boolean;
  variantSeed?: string;
  originalQuestionId?: string;
}

export interface Subject {
  id: SubjectId | string;
  name: string;
  code: string;
  icon: string;
  educationLevel?: EducationLevel;
  description: string;
  topics: string[];
  questionCount: number;
  featured?: boolean;
}

export interface ExamAttemptAnswer {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  correctOption: 'A' | 'B' | 'C' | 'D';
}

export interface ExamResult {
  id: string;
  userId?: string;
  candidateRegNo?: string;
  examType: 'JAMB' | 'WAEC' | 'COMMON_ENTRANCE' | 'UNIVERSITY_GST';
  title: string;
  date: string;
  createdAt?: string;
  durationMinutes: number;
  timeSpentSeconds: number;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  jambScore?: number; // out of 400
  waecGrade?: string; // e.g., 'A1', 'B2', 'C4'
  tabSwitchCount?: number;
  integrityStatus?: 'verified' | 'flagged';
  speedBonusPoints?: number;
  csiScore?: number;
  subjectScores: {
    subjectId: string;
    subjectName: string;
    total: number;
    correct: number;
    scorePercentage: number;
  }[];
  answers: ExamAttemptAnswer[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  state?: string;
  role: 'student' | 'admin';
  educationLevel: EducationLevel; // 'primary' | 'secondary' | 'university'
  targetExam: 'JAMB' | 'WAEC' | 'BOTH' | 'COMMON_ENTRANCE' | 'UNIVERSITY_GST';
  targetCourse?: string;
  premiumPlan: 'free' | 'basic' | 'medium' | 'premium';
  premiumExpiresAt?: string | null;
  createdAt: string;
  bookmarkedQuestionIds?: string[];
  aiTutorQueriesUsed?: number;
  aiTutorLastUsedDate?: string;
  xp?: number;
  streakDays?: number;
  lastActiveDate?: string;
  flashChallengeBestScore?: number;
  arenaDiscountPercentage?: number;
  arenaDiscountExpiresAt?: string | null;
  arenaWins?: number;
  arenaLosses?: number;
  arenaMatches?: number;
  isPaymentSuspended?: boolean;
  paymentSuspendedReason?: string;
  paymentSuspendedAt?: string;
  longestStreak?: number;
  dailyGoalTarget?: number;
  dailyGoalCompleted?: number;
  dailyGoalLastDate?: string;
  stats?: {
    questionsAnswered: number;
    averageScore: number;
    bestScore: number;
    weakestSubject: string;
  };
  unlockedBadges?: string[];
  featuredBadges?: string[];
  tournamentBadge?: '1st' | '2nd' | '3rd' | null;
  themeVariant?: 'default' | 'gold' | 'diamond' | 'platinum' | 'goat';
  themeMode?: 'cyber' | 'light';
  isGoat?: boolean;
  goatPrivilegesActive?: boolean;
  adminAiPrivilegesRevokedAt?: string | null;
  adminAiRevocationMessage?: string | null;
  tournamentQualified?: boolean;
  // Admin Sentinel AI Anti-Cheat & Malpractice Flags
  integrityScore?: number; // 0 - 100% Academic Integrity Score
  verifiedSession?: boolean; // True if current session and exam history is verified
  totalTabSwitches?: number;
  flaggedExamsCount?: number;
  verifiedExamsCount?: number;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
  isSuspended?: boolean;
  suspensionExpiresAt?: string | null;
  suspensionReason?: string;
  suspensionOffenseLevel?: 'minor' | 'major' | 'critical';
  securityStrikes?: number;
  securityFlagHistory?: { offense: string; date: string; action: string; severity: string }[];
}

export type OffenseType =
  | 'exam_malpractice_solicitation'
  | 'cbt_speed_hack'
  | 'score_tampering'
  | 'payload_injection'
  | 'payment_fraud'
  | 'proctoring_violation';

export interface SecurityIncident {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  offenseType: OffenseType;
  severity: 'minor' | 'major' | 'critical';
  details: string;
  evidence: string;
  actionTaken: 'warned' | 'suspended_24h' | 'suspended_7d' | 'banned_permanently';
  detectedBy: string;
  timestamp: string;
  ipAddress?: string;
  status: 'active' | 'resolved' | 'appealed';
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'performance' | 'activity' | 'mastery';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rewardXp: number;
  unlocked: boolean;
  unlockedAt?: string;
  currentProgress?: number;
  maxProgress?: number;
  progressLabel?: string;
}

export interface DailyStudyGoal {
  target: number;
  completed: number;
  percentage: number;
  isCompleted: boolean;
  lastDate: string;
}

export interface WeeklyStudyGoal {
  id: string;
  title: string;
  category: 'all' | 'subject' | 'mock-exam' | 'accuracy';
  subjectId?: string;
  subjectName?: string;
  targetQuestions: number;
  completedQuestions: number;
  percentage: number;
  isCompleted: boolean;
  colorTheme: 'cyan' | 'emerald' | 'amber' | 'purple' | 'blue' | 'rose';
  icon: string;
  rewardXp: number;
  rewardClaimed?: boolean;
}

export interface WeeklyStudyGoalsState {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  daysRemaining: number;
  goals: WeeklyStudyGoal[];
  totalTarget: number;
  totalCompleted: number;
  overallPercentage: number;
  allGoalsCrushed: boolean;
}

export interface CalendarStreakDay {
  date: string;
  dayName: string;
  dayShort: string;
  dayNumber: number;
  completed: boolean;
  isToday: boolean;
  isFuture: boolean;
  testsCompletedCount?: number;
  completedSubject?: string;
}

export interface PracticeTestRecord {
  id: string;
  subjectName: string;
  questionsCount: number;
  scorePercent: number;
  completedAt: string;
  testType: string; // 'Practice Drill' | 'Mock Exam' | 'Speed Quiz'
}

export interface StreakInfo {
  streak: number;
  longestStreak: number;
  preservedToday: boolean;
  lastActiveDate: string;
  totalSessionsCompleted: number;
  todayTestsCount: number;
  history: CalendarStreakDay[];
  recentTestLogs?: PracticeTestRecord[];
}

export interface TopicItem {
  id: string;
  name: string;
  subjectId: SubjectId | string;
  subjectName: string;
  educationLevel: EducationLevel;
  examType: ExamType;
  description: string;
  keyConcepts: string[];
  formulasOrRules: string[];
  frequentJambConcepts?: string[];
  questionCount: number;
}

export interface SmartWebInsights {
  googleSources?: { title: string; url: string; snippet?: string }[];
  youtubeVideos?: {
    id: string;
    title: string;
    channel: string;
    duration?: string;
    url: string;
    description?: string;
  }[];
  tiktokStudyHacks?: {
    creator: string;
    tip: string;
    mnemonic?: string;
    tag: string;
  }[];
  smartWebsites?: {
    name: string;
    url: string;
    badge: string;
    description: string;
  }[];
  aiModelSources?: string[];
}

export interface SubjectTopicProgress {
  subjectId: string;
  subjectName: string;
  totalTopics: number;
  coveredTopics: number;
  progressPercentage: number;
  questionsSolved: number;
  correctAnswers: number;
  topicStatuses: Record<string, {
    topicName: string;
    covered: boolean;
    questionsAnswered: number;
    correctCount: number;
    masteryPercentage: number;
    lastPracticed?: string;
    status: 'mastered' | 'in_progress' | 'not_started';
  }>;
}

export interface AITutorMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  topic?: string;
  relatedQuestionId?: string;
  groundingSources?: { title: string; url: string; snippet?: string }[];
  smartWebInsights?: SmartWebInsights;
}

export interface AITutorResponse {
  message: string;
  usedToday: number;
  dailyLimit: number;
  remainingToday: number;
  isUnlimited: boolean;
  plan: 'free' | 'basic' | 'medium' | 'premium';
  groundingSources?: { title: string; url: string; snippet?: string }[];
  smartWebInsights?: SmartWebInsights;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: 'JAMB' | 'WAEC' | 'General' | 'Time Management';
  excerpt: string;
  content: string;
  readTime: string;
  author: string;
  date: string;
  tags: string[];
}

export interface PricingPlan {
  id: 'basic' | 'medium' | 'premium';
  name: string;
  price: string;
  priceAmount: number;
  billingPeriod: string;
  popular?: boolean;
  features: string[];
  recommendedFor: string;
}

export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalExamsTaken: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  recentUsers: { id: string; name: string; email: string; plan: string; joined: string }[];
}

export interface PaymentRecord {
  id: string;
  reference: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  planId: 'basic' | 'medium' | 'premium' | string;
  planName: string;
  amount: number;
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  senderAccountName?: string;
  senderBank?: string;
  bankSessionId?: string;
  receiptScreenshotUrl?: string;
  isTrollFlagged?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  aiAuditNotes?: string;
  aiVerifiedBy?: string;
  createdAt: number;
  submittedAt?: number;
  approvedAt?: number;
  approvedBy?: string;
}

export interface ArenaPlayer {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  currentQuestionIndex: number;
  answers: { questionId: string; selectedOption: string; isCorrect: boolean }[];
  isFinished: boolean;
  timeTakenSeconds?: number;
}

export interface ArenaMatch {
  matchId: string;
  roomCode?: string;
  status: 'waiting' | 'starting' | 'in_progress' | 'finished' | 'abandoned';
  players: Record<string, ArenaPlayer>;
  playerIds: string[];
  questions: Question[];
  durationSeconds: number;
  startedAt?: number;
  endsAt?: number;
  winnerId?: string | null;
  tie?: boolean;
  abandonedBy?: string;
}

export interface VerifiedArenaMatch {
  matchId: string;
  verificationCode: string;
  verificationHash: string;
  playedAt: string;
  durationSeconds: number;
  isAiMatch?: boolean;
  tie: boolean;
  winnerId: string | null;
  winnerName: string | null;
  winnerScore: number;
  loserScore: number;
  player1: {
    userId: string;
    name: string;
    score: number;
    correctCount: number;
    totalAnswered: number;
    isWinner: boolean;
  };
  player2: {
    userId: string;
    name: string;
    score: number;
    correctCount: number;
    totalAnswered: number;
    isWinner: boolean;
  };
  prizeClaimStatus: string;
  statusText: string;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  front: string;
  back: string;
  formula?: string;
  mnemonic?: string;
  examType: 'JAMB' | 'WAEC' | 'ALL';
  category: 'formula' | 'definition' | 'law' | 'shortcut';
}

export interface OfflinePack {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  questionCount: number;
  sizeKb: number;
  isDownloaded: boolean;
  downloadedAt?: string;
  examType: 'JAMB' | 'WAEC' | 'ALL';
}

export type CommunityChannel = 'general' | 'jamb' | 'waec' | 'admissions' | 'study-qna';

export interface CommunityMessage {
  id: string;
  channelId: CommunityChannel;
  userId: string;
  userName: string;
  userEmail?: string;
  targetExam?: string;
  targetCourse?: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  isAiPinned?: boolean;
  isAiAssistant?: boolean;
  replyToId?: string;
  replyToSnippet?: string;
  tags?: string[];
  moderationStatus: 'approved' | 'flagged';
  aiModerationTag?: string;
  userTournamentBadge?: '1st' | '2nd' | '3rd' | null;
  userThemeVariant?: 'default' | 'gold' | 'diamond' | 'platinum';
}

export interface ModerationResult {
  isAllowed: boolean;
  violationType?: 'profanity' | 'exam_malpractice' | 'harassment' | 'spam' | 'explicit' | null;
  reason?: string;
  cleanAdvice?: string;
  educationalFeedback?: string;
}

export interface PredictedScoreData {
  projectedJambTotal: number;
  maxJambScore: number;
  projectedWaecDistinctions: number;
  confidencePercent: number;
  subjectBreakdown: {
    subjectId: string;
    subjectName: string;
    scoreOutOf100: number;
    letterGrade: string;
    accuracy: number;
    attempts: number;
    status: 'Strong' | 'Average' | 'Needs Attention';
  }[];
  readinessLevel: 'Ready for 300+ Merit' | 'Competitive' | 'Approaching Target' | 'Foundational Work Needed';
  recommendedUniversityCutoffs: {
    institution: string;
    course: string;
    targetScore: number;
    achievable: boolean;
  }[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank?: number;
  name: string;
  state: string;
  schoolOrCity?: string;
  targetExam: 'JAMB' | 'WAEC' | 'BOTH';
  targetCourse?: string;
  targetUniversity?: string;
  score: number; // Overall CBT Score e.g. 352/400 or subject accuracy %
  csiScore?: number; // Composite Scholar Index (Weighted Academic Readiness)
  integrityStatus?: 'verified' | 'flagged';
  speedBonusPoints?: number;
  accuracyPercentage: number;
  questionsAnswered: number;
  streakDays: number;
  xp: number;
  tierTitle: string;
  topSubject: string;
  subjectScores?: {
    subjectId: string;
    subjectName: string;
    scoreOutOf100: number;
    accuracy: number;
  }[];
  motto?: string;
  badges?: string[];
  isCurrentUser?: boolean;
}

export interface SubjectChampion {
  subjectId: string;
  subjectName: string;
  iconName: string;
  studentName: string;
  school: string;
  state: string;
  scorePercentage: number;
  questionsSolved: number;
  tip: string;
}

export interface MonthlyWinnerRecord {
  id: string;
  seasonKey: string; // e.g. '2026-09'
  seasonTitle: string; // e.g. 'September 2026 Championship'
  month: string;
  year: number;
  rank: number;
  userId: string;
  studentName: string;
  studentEmail: string;
  score: number;
  prizeLabel: string;
  prizeAmount: string;
  verificationCode?: string; // Unique anti-fraud code e.g. 'WIN-202609-R1-8K3P'
  phoneNumber?: string;
  network?: 'MTN' | 'Airtel' | 'Glo' | '9mobile' | 'OPay' | string;
  status: 'pending_phone' | 'ready_to_send' | 'fulfilled';
  createdAt: string;
  claimedAt?: string;
  fulfilledAt?: string;
  notes?: string;
}

export interface AdminNotification {
  id: string;
  type: 'prize_claim' | 'monthly_winners' | 'payment_pending' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  emailSentTo: string;
  metadata?: Record<string, any>;
}

export interface JambCountdownData {
  examName: string;
  officialExamDate: string;
  registrationStartDate: string;
  registrationCloseDate: string;
  mockExamDate: string;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  totalSecondsRemaining: number;
  officialAnnouncement: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  syllabusPhase: string;
  studyTips?: string[];
}

// =============================================================
// MONTHLY CHAMPIONS LEAGUE TOURNAMENT & ADMIN AI ASSISTANT TYPES
// =============================================================

export interface TournamentParticipant {
  id: string;
  name: string;
  email?: string;
  previousLeaderboardRank: number; // 1 to 32 from previous month
  score?: number;
  xp?: number;
  state?: string;
  avatar?: string;
  isCurrentUser?: boolean;
  isGoat?: boolean;
}

export interface TournamentStanding {
  participantId: string;
  participantName: string;
  played: number;
  won: number;
  lost: number;
  points: number; // 3 for win, 1 for loss, NO draws
  correctAnswers: number;
  rank: number;
  advanced: boolean;
}

export interface TournamentMatch {
  id: string;
  round: 'group' | 'r16' | 'quarters' | 'semis' | 'third_place' | 'final';
  leg?: 1 | 2;
  groupId?: string;
  matchNumber?: number;
  player1: TournamentParticipant;
  player2: TournamentParticipant;
  player1Score: number; // correct answers out of 10
  player2Score: number;
  winnerId?: string;
  isCompleted: boolean;
  tieBreakerActive?: boolean;
  tieBreakerPlayer1Score?: number;
  tieBreakerPlayer2Score?: number;
  durationSeconds: number; // 120s default (2 mins), 300s for Mathematics (5 mins)
  subjectId: string;
  startTime: string;
  questions?: Question[];
}

export interface TournamentTieKnockout {
  id: string;
  round: 'r16' | 'quarters' | 'semis' | 'third_place' | 'final';
  tieIndex: number;
  player1: TournamentParticipant;
  player2: TournamentParticipant;
  leg1Match: TournamentMatch;
  leg2Match?: TournamentMatch;
  aggregatePlayer1Score: number;
  aggregatePlayer2Score: number;
  winnerId?: string;
  isCompleted: boolean;
  restPeriodActive?: boolean;
  restSecondsLeft?: number;
  tieBreakerActive?: boolean;
}

export interface TournamentGroup {
  id: string; // 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'
  name: string;
  participants: TournamentParticipant[];
  standings: TournamentStanding[];
  matches: TournamentMatch[];
}

export interface TournamentVotingOption {
  time: string; // e.g. '14:00' (2:00 PM), '16:00' (4:00 PM), '18:00' (6:00 PM), '20:00' (8:00 PM)
  label: string;
  votes: number;
  voterIds: string[];
}

export interface TournamentBankClaim {
  id: string;
  seasonKey: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rank: 1 | 2 | 3;
  accountNumber: string;
  accountName: string;
  bankName: string;
  prizeAmount: string; // '₦5,000', '₦3,000', '₦1,500'
  membershipGranted: string; // '1-Month Free Premium', etc.
  status: 'pending' | 'disbursed';
  submittedAt: string;
  disbursedAt?: string;
}

export interface TournamentState {
  seasonKey: string; // e.g. '2026-09'
  seasonTitle: string; // e.g. 'September 2026 Champions League'
  currentStage: 'voting' | 'group_stage' | 'round_of_16' | 'quarter_finals' | 'semi_finals' | 'final_break' | 'grand_finale' | 'completed';
  groupStageStartDate: string; // 12th of month
  votingDeadline: string; // 11th of month 23:59:59 WAT
  votingOptions: TournamentVotingOption[];
  winningGroupStartTime: string; // e.g. "8:00 PM WAT"
  hasUserVoted?: boolean;
  userVoteTime?: string;
  participants: TournamentParticipant[]; // 32 qualified candidates
  groups: TournamentGroup[];
  r16Ties: TournamentTieKnockout[];
  quarterTies: TournamentTieKnockout[];
  semiTies: TournamentTieKnockout[];
  thirdPlaceTie: TournamentTieKnockout | null;
  finalTie: TournamentTieKnockout | null;
  champion: TournamentParticipant | null;
  runnerUp: TournamentParticipant | null;
  thirdPlace: TournamentParticipant | null;
  globalAnnouncement?: {
    championName: string;
    announcedAt: string;
    title: string;
    message: string;
  } | null;
  bankClaims: TournamentBankClaim[];
  archivedChampions?: {
    seasonKey: string;
    seasonTitle: string;
    championName: string;
    championId: string;
    reignEndedAt: string;
    revokedByAdminAi: boolean;
  }[];
  adminAiRevocationNotice?: {
    active: boolean;
    revokedChampionName: string;
    newSeasonTitle: string;
    timestamp: string;
    reason: string;
  } | null;
  aiOrchestratorLogs: {
    id: string;
    timestamp: string;
    stage: string;
    event: string;
    details: string;
    automaticAction: boolean;
  }[];
}

export interface AdminAiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionSuggestion?: string;
  suggestedActionPayload?: any;
}


