import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { Question, User, ArenaMatch, ArenaPlayer } from './types';

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

// Persistent Storage of completed arena matches for public anti-cheat verification
const DATA_DIR = path.join(process.cwd(), 'data');
const ARENA_MATCHES_FILE = path.join(DATA_DIR, 'arena_matches.json');
const verifiedMatches = new Map<string, VerifiedArenaMatch>();

function loadVerifiedMatches() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ARENA_MATCHES_FILE)) {
      const raw = fs.readFileSync(ARENA_MATCHES_FILE, 'utf-8');
      const list: VerifiedArenaMatch[] = JSON.parse(raw);
      list.forEach(m => {
        verifiedMatches.set(m.matchId, m);
        if (m.verificationCode) {
          verifiedMatches.set(m.verificationCode.toUpperCase(), m);
        }
      });
    } else {
      // Seed initial sample verified duel records for immediate verification demos
      const sampleMatch1: VerifiedArenaMatch = {
        matchId: 'match_jamb_demo_winner',
        verificationCode: 'SN-ARENA-CHAMP26',
        verificationHash: 'SIG-7E2A-98C1-A42F',
        playedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        durationSeconds: 58,
        isAiMatch: false,
        tie: false,
        winnerId: 'demo_user_1',
        winnerName: 'Chinedu Okafor',
        winnerScore: 80,
        loserScore: 50,
        player1: {
          userId: 'demo_user_1',
          name: 'Chinedu Okafor',
          score: 80,
          correctCount: 8,
          totalAnswered: 10,
          isWinner: true
        },
        player2: {
          userId: 'demo_user_2',
          name: 'Blessing Adeyemi',
          score: 50,
          correctCount: 5,
          totalAnswered: 9,
          isWinner: false
        },
        prizeClaimStatus: '7-Day 25% VIP Discount Active',
        statusText: 'Officially Certified Genuine Arena Duel'
      };
      verifiedMatches.set(sampleMatch1.matchId, sampleMatch1);
      verifiedMatches.set(sampleMatch1.verificationCode, sampleMatch1);
      fs.writeFileSync(ARENA_MATCHES_FILE, JSON.stringify([sampleMatch1], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to load arena verified matches:', err);
  }
}

function saveVerifiedMatches() {
  try {
    const unique = Array.from(new Set(Array.from(verifiedMatches.values())));
    fs.writeFileSync(ARENA_MATCHES_FILE, JSON.stringify(unique, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save arena verified matches:', err);
  }
}

loadVerifiedMatches();

export function getVerifiedArenaMatch(codeOrId: string): VerifiedArenaMatch | null {
  if (!codeOrId) return null;
  const clean = codeOrId.trim();
  const direct = verifiedMatches.get(clean) || verifiedMatches.get(clean.toUpperCase());
  if (direct) return direct;

  // Case-insensitive match on code or id
  const target = clean.toLowerCase();
  for (const m of verifiedMatches.values()) {
    if (m.matchId.toLowerCase() === target || m.verificationCode.toLowerCase() === target) {
      return m;
    }
  }
  return null;
}

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  userName: string;
  educationLevel?: string;
  matchId?: string;
  roomCode?: string;
  isAlive: boolean;
}

interface MatchState {
  matchId: string;
  roomCode?: string;
  player1: {
    userId: string;
    name: string;
    ws: WebSocket;
    score: number;
    correctCount: number;
    currentQuestionIndex: number;
    answers: { questionId: string; selectedOption: string; isCorrect: boolean }[];
    isFinished: boolean;
    finishedAt?: number;
  };
  player2: {
    userId: string;
    name: string;
    ws: WebSocket;
    score: number;
    correctCount: number;
    currentQuestionIndex: number;
    answers: { questionId: string; selectedOption: string; isCorrect: boolean }[];
    isFinished: boolean;
    finishedAt?: number;
  };
  questions: Question[];
  durationSeconds: number;
  startedAt: number;
  endsAt: number;
  timerHandle?: NodeJS.Timeout;
  isAiMatch?: boolean;
  aiTimerHandle?: NodeJS.Timeout;
  status: 'starting' | 'in_progress' | 'finished' | 'abandoned';
  winnerId?: string | null;
  tie?: boolean;
}

export function setupArenaServer(
  wss: WebSocketServer,
  getUsers: () => (User & { passwordHash: string })[],
  saveUsers: () => void,
  getQuestions: () => Question[]
) {
  const clients = new Map<WebSocket, ConnectedClient>();
  const matchmakingQueue: ConnectedClient[] = [];
  const customRooms = new Map<string, ConnectedClient>();
  const activeMatches = new Map<string, MatchState>();

  function send(ws: WebSocket, payload: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  function broadcastLobbyStats() {
    const onlineCount = clients.size;
    const inQueueCount = matchmakingQueue.length;
    const activeMatchCount = activeMatches.size;

    for (const client of clients.values()) {
      send(client.ws, {
        type: 'lobby_stats',
        onlineCount,
        inQueueCount,
        activeMatchCount
      });
    }
  }

  function pickMatchQuestions(count = 10): Question[] {
    const all = getQuestions();
    // Prefer JAMB and WAEC secondary level questions
    const pool = all.filter(q => q.examType === 'JAMB' || q.examType === 'WAEC' || !q.educationLevel || q.educationLevel === 'secondary');
    const source = pool.length >= count ? pool : all;
    const shuffled = [...source].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function sanitizeQuestionForPlayer(q: Question) {
    const formattedOptions = Array.isArray(q.options)
      ? q.options
      : Object.entries(q.options || {}).map(([key, text]) => ({
          label: key,
          text: String(text)
        }));

    return {
      id: q.id,
      question: q.question,
      options: formattedOptions,
      subjectName: q.subjectName,
      topic: q.topic,
      examType: q.examType,
      year: q.year
    };
  }

  function endMatch(match: MatchState, reason = 'time_up') {
    if (match.status === 'finished' || match.status === 'abandoned') return;
    match.status = 'finished';
    if (match.timerHandle) clearTimeout(match.timerHandle);
    if (match.aiTimerHandle) clearTimeout(match.aiTimerHandle);

    const p1 = match.player1;
    const p2 = match.player2;

    let winnerId: string | null = null;
    let tie = false;

    // Highest score wins
    if (p1.score > p2.score) {
      winnerId = p1.userId;
    } else if (p2.score > p1.score) {
      winnerId = p2.userId;
    } else {
      // Tiebreaker 1: Highest correct count
      if (p1.correctCount > p2.correctCount) {
        winnerId = p1.userId;
      } else if (p2.correctCount > p1.correctCount) {
        winnerId = p2.userId;
      } else {
        // Tiebreaker 2: Fastest completion time
        const p1Time = (p1.finishedAt || Date.now()) - match.startedAt;
        const p2Time = (p2.finishedAt || Date.now()) - match.startedAt;
        if (p1Time < p2Time && p1.isFinished) {
          winnerId = p1.userId;
        } else if (p2Time < p1Time && p2.isFinished) {
          winnerId = p2.userId;
        } else {
          tie = true;
        }
      }
    }

    match.winnerId = winnerId;
    match.tie = tie;

    // Apply 7-day 25% discount to the winner!
    const users = getUsers();
    let winnerDiscountExpiresAt: string | null = null;

    if (winnerId && !tie) {
      const winnerUser = users.find(u => u.id === winnerId);
      if (winnerUser) {
        winnerUser.arenaDiscountPercentage = 25;
        // 7 days from now
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        winnerUser.arenaDiscountExpiresAt = expiry.toISOString();
        winnerDiscountExpiresAt = winnerUser.arenaDiscountExpiresAt;
        winnerUser.arenaWins = (winnerUser.arenaWins || 0) + 1;
        winnerUser.arenaMatches = (winnerUser.arenaMatches || 0) + 1;
        winnerUser.xp = (winnerUser.xp || 0) + 150;
      }

      const loserId = winnerId === p1.userId ? p2.userId : p1.userId;
      const loserUser = users.find(u => u.id === loserId);
      if (loserUser) {
        loserUser.arenaLosses = (loserUser.arenaLosses || 0) + 1;
        loserUser.arenaMatches = (loserUser.arenaMatches || 0) + 1;
        loserUser.xp = (loserUser.xp || 0) + 30;
      }
      saveUsers();
    } else if (tie) {
      // Award tie consolation XP to both
      const u1 = users.find(u => u.id === p1.userId);
      const u2 = users.find(u => u.id === p2.userId);
      if (u1) {
        u1.arenaMatches = (u1.arenaMatches || 0) + 1;
        u1.xp = (u1.xp || 0) + 50;
      }
      if (u2) {
        u2.arenaMatches = (u2.arenaMatches || 0) + 1;
        u2.xp = (u2.xp || 0) + 50;
      }
      saveUsers();
    }

    // Prepare full question review for learning
    const questionsReview = match.questions.map(q => {
      const formattedOptions = Array.isArray(q.options)
        ? q.options
        : Object.entries(q.options || {}).map(([key, text]) => ({
            label: key,
            text: String(text)
          }));

      return {
        id: q.id,
        question: q.question,
        options: formattedOptions,
        correctOption: q.correctOption,
        explanation: q.explanation,
        subjectName: q.subjectName,
        topic: q.topic
      };
    });

    // Generate official anti-fraud verification credentials
    const cleanId = match.matchId.replace(/^match_/, '').toUpperCase();
    const verificationCode = `SN-ARENA-${cleanId.substring(0, 8)}`;
    const verificationHash = `SIG-${Math.abs(Math.floor(match.startedAt / 19)).toString(16).toUpperCase()}-${Math.abs(Math.floor(Date.now() / 29)).toString(16).toUpperCase()}`;

    const verifiedRecord: VerifiedArenaMatch = {
      matchId: match.matchId,
      verificationCode,
      verificationHash,
      playedAt: new Date(match.startedAt).toISOString(),
      durationSeconds: Math.round((Date.now() - match.startedAt) / 1000),
      isAiMatch: match.isAiMatch,
      tie,
      winnerId,
      winnerName: winnerId === p1.userId ? p1.name : winnerId === p2.userId ? p2.name : null,
      winnerScore: winnerId === p1.userId ? p1.score : winnerId === p2.userId ? p2.score : Math.max(p1.score, p2.score),
      loserScore: winnerId === p1.userId ? p2.score : winnerId === p2.userId ? p1.score : Math.min(p1.score, p2.score),
      player1: {
        userId: p1.userId,
        name: p1.name,
        score: p1.score,
        correctCount: p1.correctCount,
        totalAnswered: p1.answers.length,
        isWinner: winnerId === p1.userId
      },
      player2: {
        userId: p2.userId,
        name: p2.name,
        score: p2.score,
        correctCount: p2.correctCount,
        totalAnswered: p2.answers.length,
        isWinner: winnerId === p2.userId
      },
      prizeClaimStatus: winnerId && !tie ? '7-Day 25% VIP Discount Active' : 'Consolation XP Awarded',
      statusText: tie ? 'Official Draw (Equal Points)' : 'Officially Certified Genuine Arena Duel'
    };

    verifiedMatches.set(match.matchId, verifiedRecord);
    verifiedMatches.set(verificationCode, verifiedRecord);
    saveVerifiedMatches();

    const resultPayload = {
      type: 'match_finished',
      matchId: match.matchId,
      verificationCode,
      verificationHash,
      reason,
      winnerId,
      tie,
      winnerName: winnerId === p1.userId ? p1.name : winnerId === p2.userId ? p2.name : null,
      winnerDiscountExpiresAt,
      player1: {
        userId: p1.userId,
        name: p1.name,
        score: p1.score,
        correctCount: p1.correctCount,
        totalAnswered: p1.answers.length,
        answers: p1.answers
      },
      player2: {
        userId: p2.userId,
        name: p2.name,
        score: p2.score,
        correctCount: p2.correctCount,
        totalAnswered: p2.answers.length,
        answers: p2.answers
      },
      questionsReview
    };

    send(p1.ws, resultPayload);
    send(p2.ws, resultPayload);

    // Clean up active match
    activeMatches.delete(match.matchId);
    broadcastLobbyStats();
  }

  function startMatch(p1: ConnectedClient, p2: ConnectedClient, roomCode?: string, isAiMatch = false) {
    const matchId = 'match_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const questions = pickMatchQuestions(10);
    const sanitizedQuestions = questions.map(sanitizeQuestionForPlayer);

    p1.matchId = matchId;
    p2.matchId = matchId;

    const match: MatchState = {
      matchId,
      roomCode,
      isAiMatch,
      player1: {
        userId: p1.userId,
        name: p1.userName,
        ws: p1.ws,
        score: 0,
        correctCount: 0,
        currentQuestionIndex: 0,
        answers: [],
        isFinished: false
      },
      player2: {
        userId: p2.userId,
        name: p2.userName,
        ws: p2.ws,
        score: 0,
        correctCount: 0,
        currentQuestionIndex: 0,
        answers: [],
        isFinished: false
      },
      questions,
      durationSeconds: 60,
      startedAt: Date.now(),
      endsAt: Date.now() + 60000,
      status: 'starting'
    };

    activeMatches.set(matchId, match);

    // Notify both players that a match was found (kickoff phase)
    const matchedPayload = {
      type: 'match_found',
      matchId,
      opponentP1: { id: p2.userId, name: p2.userName },
      opponentP2: { id: p1.userId, name: p1.userName },
      durationSeconds: 60,
      questionsCount: questions.length,
      isAiMatch
    };

    send(p1.ws, {
      ...matchedPayload,
      yourRole: 'player1',
      opponent: { id: p2.userId, name: p2.userName }
    });

    send(p2.ws, {
      ...matchedPayload,
      yourRole: 'player2',
      opponent: { id: p1.userId, name: p1.userName }
    });

    // 3.5-second kickoff animation countdown before questions unlock
    setTimeout(() => {
      if (match.status !== 'starting') return;
      match.status = 'in_progress';
      match.startedAt = Date.now();
      match.endsAt = Date.now() + 60000;

      // Start 60-second timer
      match.timerHandle = setTimeout(() => {
        endMatch(match, 'time_up');
      }, 60000);

      const startPayload = {
        type: 'match_start',
        matchId,
        startedAt: match.startedAt,
        endsAt: match.endsAt,
        durationSeconds: 60,
        questions: sanitizedQuestions,
        isAiMatch
      };

      send(p1.ws, { ...startPayload, myUserId: p1.userId });
      send(p2.ws, { ...startPayload, myUserId: p2.userId });
      broadcastLobbyStats();

      // If AI match, launch simulated AI bot answer loop
      if (isAiMatch) {
        const scheduleNextAiAnswer = () => {
          if (match.status !== 'in_progress' || match.player2.isFinished) return;

          // Realistic human-like answering interval (between 3.5s and 5.5s)
          const delay = Math.floor(3500 + Math.random() * 2000);
          match.aiTimerHandle = setTimeout(() => {
            if (match.status !== 'in_progress' || match.player2.isFinished) return;

            const qIndex = match.player2.currentQuestionIndex;
            const q = match.questions[qIndex];
            if (!q) {
              match.player2.isFinished = true;
              match.player2.finishedAt = Date.now();
              if (match.player1.isFinished) {
                endMatch(match, 'all_answered');
              }
              return;
            }

            // AI Bot simulated performance: 75% accuracy
            const isCorrect = Math.random() < 0.75;
            let chosenOption: 'A' | 'B' | 'C' | 'D' = q.correctOption;
            if (!isCorrect) {
              const optionsList: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
              const wrongOptions = optionsList.filter(opt => opt !== q.correctOption);
              chosenOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
            }

            if (isCorrect) {
              match.player2.score += 10;
              match.player2.correctCount += 1;
            }

            match.player2.answers.push({
              questionId: q.id,
              selectedOption: chosenOption,
              isCorrect
            });

            match.player2.currentQuestionIndex = Math.min(10, match.player2.currentQuestionIndex + 1);
            if (match.player2.currentQuestionIndex >= 10) {
              match.player2.isFinished = true;
              match.player2.finishedAt = Date.now();
            }

            // Live progress broadcast to admin player!
            send(p1.ws, {
              type: 'opponent_progress',
              opponentScore: match.player2.score,
              opponentQuestionIndex: match.player2.currentQuestionIndex,
              opponentIsFinished: match.player2.isFinished,
              opponentJustScored: isCorrect
            });

            if (match.player1.isFinished && match.player2.isFinished) {
              endMatch(match, 'all_answered');
              return;
            }

            if (!match.player2.isFinished) {
              scheduleNextAiAnswer();
            }
          }, delay);
        };

        scheduleNextAiAnswer();
      }
    }, 3500);
  }

  function startAiMatch(adminClient: ConnectedClient) {
    const aiWs: any = {
      readyState: WebSocket.OPEN,
      send: () => {}
    };

    const aiClient: ConnectedClient = {
      ws: aiWs,
      userId: 'ai_bot_scholar',
      userName: 'StudyNaija AI Bot 🤖',
      educationLevel: 'secondary',
      isAlive: true
    };

    startMatch(adminClient, aiClient, undefined, true);
  }

  // Handle client connections
  wss.on('connection', (ws: WebSocket) => {
    const client: ConnectedClient = {
      ws,
      userId: 'guest_' + Math.random().toString(36).substring(2, 8),
      userName: 'Guest Scholar',
      isAlive: true
    };
    clients.set(ws, client);

    ws.on('pong', () => {
      client.isAlive = true;
    });

    // Send initial greeting & stats
    send(ws, {
      type: 'connected',
      message: 'Connected to StudyNaija 1v1 Arena Server ⚡',
      onlineCount: clients.size,
      inQueueCount: matchmakingQueue.length
    });
    broadcastLobbyStats();

    ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data.toString());

        // 1. Authenticate user
        if (msg.type === 'auth') {
          if (msg.userId) client.userId = msg.userId;
          if (msg.userName) client.userName = msg.userName;
          if (msg.educationLevel) client.educationLevel = msg.educationLevel;

          const users = getUsers();
          const user = users.find(u => u.id === client.userId);
          const hasActiveDiscount = !!(
            user?.arenaDiscountExpiresAt &&
            new Date(user.arenaDiscountExpiresAt).getTime() > Date.now()
          );

          send(ws, {
            type: 'auth_success',
            userId: client.userId,
            userName: client.userName,
            isAdmin: user?.role === 'admin',
            hasActiveDiscount,
            discountExpiresAt: user?.arenaDiscountExpiresAt || null,
            discountPercentage: user?.arenaDiscountPercentage || 25,
            arenaWins: user?.arenaWins || 0,
            arenaLosses: user?.arenaLosses || 0
          });
          return;
        }

        // 1b. Admin Test Mode: Play Against AI Bot (Exclusively Admin Only)
        if (msg.type === 'start_ai_match') {
          const users = getUsers();
          const user = users.find(u => u.id === client.userId);
          const isAdmin = user?.role === 'admin';

          if (!isAdmin) {
            send(ws, {
              type: 'queue_error',
              code: 'UNAUTHORIZED',
              message: 'Access Denied: AI Battle Simulation is restricted exclusively to Admin accounts for testing.'
            });
            return;
          }

          // Remove admin from public queue if they were queued
          const qIdx = matchmakingQueue.findIndex(c => c.ws === ws || c.userId === client.userId);
          if (qIdx >= 0) matchmakingQueue.splice(qIdx, 1);

          startAiMatch(client);
          return;
        }

        // 1c. Admin Test Mode: Reset Discount on Admin account to test repeatedly
        if (msg.type === 'admin_reset_discount') {
          const users = getUsers();
          const user = users.find(u => u.id === client.userId);
          if (user?.role === 'admin') {
            delete user.arenaDiscountExpiresAt;
            delete user.arenaDiscountPercentage;
            saveUsers();
            send(ws, {
              type: 'auth_success',
              userId: client.userId,
              userName: client.userName,
              isAdmin: true,
              hasActiveDiscount: false,
              discountExpiresAt: null,
              discountPercentage: 25,
              arenaWins: user.arenaWins || 0,
              arenaLosses: user.arenaLosses || 0
            });
          }
          return;
        }

        // 2. Queue Join (Public Matchmaking)
        if (msg.type === 'queue_join') {
          const users = getUsers();
          const user = users.find(u => u.id === client.userId);

          // STRICT CHECK: Cannot play if currently holding an active 7-day discount!
          if (user?.arenaDiscountExpiresAt && new Date(user.arenaDiscountExpiresAt).getTime() > Date.now()) {
            const msLeft = new Date(user.arenaDiscountExpiresAt).getTime() - Date.now();
            const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
            send(ws, {
              type: 'queue_error',
              code: 'DISCOUNT_ACTIVE',
              message: `Active 25% Discount! You cannot enter the 1v1 Arena while your discount is active (${daysLeft} day(s) remaining). Upgrade to Premium now or return when expired!`,
              expiresAt: user.arenaDiscountExpiresAt
            });
            return;
          }

          if (user?.isPaymentSuspended) {
            send(ws, {
              type: 'queue_error',
              code: 'SUSPENDED',
              message: 'Account suspended from competitive challenges.'
            });
            return;
          }

          // Avoid duplicate queue entries
          const alreadyIdx = matchmakingQueue.findIndex(c => c.ws === ws || c.userId === client.userId);
          if (alreadyIdx >= 0) {
            matchmakingQueue.splice(alreadyIdx, 1);
          }

          // If there is another human waiting in the queue, match them immediately!
          if (matchmakingQueue.length > 0) {
            const opponent = matchmakingQueue.shift()!;
            // Ensure not matching with exact same client
            if (opponent.userId !== client.userId && opponent.ws !== ws) {
              startMatch(opponent, client);
              return;
            }
          }

          // Otherwise, wait in queue
          matchmakingQueue.push(client);
          send(ws, {
            type: 'queue_joined',
            queuePosition: matchmakingQueue.length,
            message: 'Searching for a live Nigerian student challenger...'
          });
          broadcastLobbyStats();
          return;
        }

        // 3. Queue Leave
        if (msg.type === 'queue_leave') {
          const idx = matchmakingQueue.findIndex(c => c.ws === ws);
          if (idx >= 0) matchmakingQueue.splice(idx, 1);
          send(ws, { type: 'queue_left' });
          broadcastLobbyStats();
          return;
        }

        // 4. Create Custom Room (Play with Friend / Classmate)
        if (msg.type === 'create_room') {
          const users = getUsers();
          const user = users.find(u => u.id === client.userId);
          if (user?.arenaDiscountExpiresAt && new Date(user.arenaDiscountExpiresAt).getTime() > Date.now()) {
            send(ws, {
              type: 'queue_error',
              code: 'DISCOUNT_ACTIVE',
              message: 'Active 25% Discount! You cannot play 1v1 matches until your current 7-day coupon expires.'
            });
            return;
          }

          const roomCode = 'JAMB-' + Math.floor(1000 + Math.random() * 9000);
          client.roomCode = roomCode;
          customRooms.set(roomCode, client);

          send(ws, {
            type: 'room_created',
            roomCode,
            message: `Room created! Share code ${roomCode} or the invite link with your classmate to duel.`
          });
          broadcastLobbyStats();
          return;
        }

        // 5. Join Custom Room
        if (msg.type === 'join_room') {
          const roomCode = (msg.roomCode || '').trim().toUpperCase();
          const host = customRooms.get(roomCode);

          if (!host) {
            send(ws, {
              type: 'queue_error',
              code: 'ROOM_NOT_FOUND',
              message: `Room code "${roomCode}" was not found or has expired. Please verify and try again.`
            });
            return;
          }

          if (host.userId === client.userId) {
            send(ws, {
              type: 'queue_error',
              code: 'SAME_USER',
              message: 'You cannot duel yourself in the same room. Open a second device or invite a classmate!'
            });
            return;
          }

          const users = getUsers();
          const user = users.find(u => u.id === client.userId);
          if (user?.arenaDiscountExpiresAt && new Date(user.arenaDiscountExpiresAt).getTime() > Date.now()) {
            send(ws, {
              type: 'queue_error',
              code: 'DISCOUNT_ACTIVE',
              message: 'Active 25% Discount! You cannot play 1v1 matches until your current 7-day coupon expires.'
            });
            return;
          }

          customRooms.delete(roomCode);
          startMatch(host, client, roomCode);
          return;
        }

        // 6. Submit Question Answer (Rapid Fire)
        if (msg.type === 'submit_answer') {
          const { matchId, questionId, selectedOption, questionIndex } = msg;
          const match = activeMatches.get(matchId);
          if (!match || match.status !== 'in_progress') return;

          const isP1 = match.player1.userId === client.userId;
          const player = isP1 ? match.player1 : match.player2;
          const opponent = isP1 ? match.player2 : match.player1;

          // Find question
          const q = match.questions.find(item => item.id === questionId) || match.questions[questionIndex];
          if (!q) return;

          const isCorrect = q.correctOption === selectedOption;
          // +10 points for correct
          if (isCorrect) {
            player.score += 10;
            player.correctCount += 1;
          }

          player.answers.push({
            questionId: q.id,
            selectedOption,
            isCorrect
          });

          player.currentQuestionIndex = Math.min(10, player.currentQuestionIndex + 1);
          if (player.currentQuestionIndex >= 10) {
            player.isFinished = true;
            player.finishedAt = Date.now();
          }

          // Send instant feedback to the player who answered
          send(ws, {
            type: 'answer_result',
            questionId: q.id,
            selectedOption,
            isCorrect,
            correctOption: q.correctOption,
            score: player.score,
            currentQuestionIndex: player.currentQuestionIndex,
            isFinished: player.isFinished
          });

          // Broadcast live tug-of-war progress to opponent!
          send(opponent.ws, {
            type: 'opponent_progress',
            opponentScore: player.score,
            opponentQuestionIndex: player.currentQuestionIndex,
            opponentIsFinished: player.isFinished,
            opponentJustScored: isCorrect
          });

          // If BOTH players finished all 10 questions, end match immediately!
          if (match.player1.isFinished && match.player2.isFinished) {
            endMatch(match, 'all_answered');
          }
          return;
        }

        // 7. Forfeit / Abandon Match
        if (msg.type === 'leave_match') {
          const matchId = client.matchId;
          if (matchId) {
            const match = activeMatches.get(matchId);
            if (match && match.status === 'in_progress') {
              match.status = 'abandoned';
              const isP1 = match.player1.userId === client.userId;
              const winner = isP1 ? match.player2 : match.player1;

              endMatch(match, 'forfeit');
            }
          }
          return;
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      // Remove from matchmaking queue
      const qIdx = matchmakingQueue.findIndex(c => c.ws === ws);
      if (qIdx >= 0) matchmakingQueue.splice(qIdx, 1);

      // Remove from custom rooms
      if (client.roomCode) customRooms.delete(client.roomCode);

      // Handle in-progress match abandonment
      if (client.matchId) {
        const match = activeMatches.get(client.matchId);
        if (match && (match.status === 'in_progress' || match.status === 'starting')) {
          const isP1 = match.player1.userId === client.userId;
          const opponent = isP1 ? match.player2 : match.player1;
          send(opponent.ws, {
            type: 'opponent_disconnected',
            message: 'Your opponent disconnected. Calculating final results...'
          });
          endMatch(match, 'opponent_disconnected');
        }
      }

      clients.delete(ws);
      broadcastLobbyStats();
    });
  });

  // Heartbeat interval to clean up stale connections
  const heartbeatInterval = setInterval(() => {
    for (const [ws, client] of clients.entries()) {
      if (!client.isAlive) {
        ws.terminate();
        clients.delete(ws);
        continue;
      }
      client.isAlive = false;
      ws.ping();
    }
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });
}
