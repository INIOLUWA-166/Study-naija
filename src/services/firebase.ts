import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

export { onAuthStateChanged, type FirebaseUser };
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User as AppUser, ExamResult, ForumThread, ForumReply } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider configured for secure identification
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

// Operation Types for error diagnosis
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection as required by skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or awaiting initial connection.');
    }
  }
}
testFirestoreConnection();

/**
 * Perform Google Sign-In with popup
 */
export async function signInWithGoogle(): Promise<{ firebaseUser: FirebaseUser; user: AppUser }> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = result.user;

    // Check if user document already exists in Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    let appUser: AppUser;

    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        appUser = {
          id: fbUser.uid,
          name: data.name || fbUser.displayName || 'Scholar',
          email: fbUser.email || data.email || '',
          role: data.role || (fbUser.email === 'luvkidjaja@gmail.com' ? 'admin' : 'student'),
          educationLevel: data.educationLevel || 'secondary',
          targetExam: data.targetExam || 'JAMB',
          targetCourse: data.targetCourse || 'General Studies',
          premiumPlan: data.premiumPlan || 'free',
          createdAt: data.createdAt || new Date().toISOString(),
          xp: data.xp || 50,
          streakDays: data.streakDays || 1,
          lastActiveDate: new Date().toISOString(),
          stats: data.stats || {
            questionsAnswered: 0,
            averageScore: 0,
            bestScore: 0,
            weakestSubject: 'None'
          }
        };
        // Update lastActiveDate
        await updateDoc(userDocRef, {
          lastActiveDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create brand new user in Firestore
        const isDefaultAdmin = fbUser.email === 'luvkidjaja@gmail.com';
        appUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Nigerian Scholar',
          email: fbUser.email || '',
          role: isDefaultAdmin ? 'admin' : 'student',
          educationLevel: 'secondary',
          targetExam: 'JAMB',
          targetCourse: 'General Studies',
          premiumPlan: isDefaultAdmin ? 'premium' : 'free',
          createdAt: new Date().toISOString(),
          xp: 100,
          streakDays: 1,
          lastActiveDate: new Date().toISOString(),
          stats: {
            questionsAnswered: 0,
            averageScore: 0,
            bestScore: 0,
            weakestSubject: 'None'
          }
        };

        await setDoc(userDocRef, {
          id: appUser.id,
          name: appUser.name,
          email: appUser.email,
          role: appUser.role,
          educationLevel: appUser.educationLevel,
          targetExam: appUser.targetExam,
          targetCourse: appUser.targetCourse,
          premiumPlan: appUser.premiumPlan,
          createdAt: appUser.createdAt,
          xp: appUser.xp,
          streakDays: appUser.streakDays,
          lastActiveDate: appUser.lastActiveDate,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (fsErr) {
      handleFirestoreError(fsErr, OperationType.WRITE, `users/${fbUser.uid}`);
      throw fsErr;
    }

    return { firebaseUser: fbUser, user: appUser };
  } catch (error: any) {
    console.error('Google Sign-In failed:', error);
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      throw new Error(`Google Sign-In is not authorized for domain (${window.location.hostname}). Please sign in or register below using your Email and Password.`);
    }
    throw error;
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function logOutFromFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Save / Update User Profile in Firestore
 */
export async function syncUserProfileToFirestore(user: AppUser): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== user.id) {
    return;
  }

  const path = `users/${user.id}`;
  try {
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      educationLevel: user.educationLevel,
      targetExam: user.targetExam,
      targetCourse: user.targetCourse || '',
      premiumPlan: user.premiumPlan,
      xp: user.xp || 0,
      streakDays: user.streakDays || 1,
      lastActiveDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Save Exam Result to Firestore
 */
export async function saveExamResultToFirestore(result: ExamResult): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return;

  const resultId = result.id || `exam-${Date.now()}`;
  const path = `exam_results/${resultId}`;

  try {
    const resultDocRef = doc(db, 'exam_results', resultId);
    await setDoc(resultDocRef, {
      id: resultId,
      userId: currentUid,
      examType: result.examType,
      title: result.title,
      durationMinutes: result.durationMinutes || 0,
      timeSpentSeconds: result.timeSpentSeconds || 0,
      totalQuestions: result.totalQuestions,
      correctCount: result.correctCount,
      scorePercentage: result.scorePercentage,
      jambScore: result.jambScore || 0,
      date: result.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Fetch User Exam Results from Firestore
 */
export async function fetchUserExamResultsFromFirestore(userId: string): Promise<ExamResult[]> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== userId) return [];

  const path = 'exam_results';
  try {
    const q = query(collection(db, path), where('userId', '==', currentUid));
    const snap = await getDocs(q);
    const results: ExamResult[] = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      results.push({
        id: docSnap.id,
        userId: d.userId,
        examType: d.examType,
        title: d.title,
        date: d.date,
        durationMinutes: d.durationMinutes || 0,
        timeSpentSeconds: d.timeSpentSeconds || 0,
        totalQuestions: d.totalQuestions,
        correctCount: d.correctCount,
        scorePercentage: d.scorePercentage,
        jambScore: d.jambScore,
        subjectScores: [],
        answers: []
      });
    });
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Bookmark question in Firestore
 */
export async function saveBookmarkToFirestore(userId: string, questionId: string, subjectId: string, questionText: string): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== userId) return;

  const path = `users/${userId}/bookmarks/${questionId}`;
  try {
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', questionId);
    await setDoc(bookmarkRef, {
      id: questionId,
      userId,
      subjectId,
      questionText: questionText.slice(0, 500),
      savedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Remove bookmark from Firestore
 */
export async function removeBookmarkFromFirestore(userId: string, questionId: string): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== userId) return;

  const path = `users/${userId}/bookmarks/${questionId}`;
  try {
    const bookmarkRef = doc(db, 'users', userId, 'bookmarks', questionId);
    await deleteDoc(bookmarkRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

/**
 * Forum: Create Thread in Firestore
 */
export async function createForumThreadInFirestore(thread: ForumThread): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return;

  const path = `forum_threads/${thread.id}`;
  try {
    const threadRef = doc(db, 'forum_threads', thread.id);
    await setDoc(threadRef, {
      id: thread.id,
      title: thread.title,
      content: thread.content,
      authorId: currentUid,
      authorName: thread.authorName,
      authorEmail: thread.authorEmail || '',
      authorRole: thread.authorRole || 'student',
      examType: thread.examType,
      subjectId: thread.subjectId || '',
      subjectName: thread.subjectName || '',
      views: thread.views || 0,
      likes: thread.likes || 0,
      replyCount: thread.replyCount || 0,
      isPinned: thread.isPinned || false,
      isLocked: thread.isLocked || false,
      isSolved: thread.isSolved || false,
      moderationStatus: thread.moderationStatus || 'approved',
      createdAt: thread.createdAt || new Date().toISOString(),
      updatedAt: thread.updatedAt || new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Forum: Fetch Threads from Firestore
 */
export async function fetchForumThreadsFromFirestore(): Promise<ForumThread[]> {
  const path = 'forum_threads';
  try {
    const snap = await getDocs(collection(db, path));
    const list: ForumThread[] = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      list.push({
        id: docSnap.id,
        title: d.title || '',
        content: d.content || '',
        authorId: d.authorId || '',
        authorName: d.authorName || 'Scholar',
        authorEmail: d.authorEmail,
        authorRole: d.authorRole || 'student',
        examType: d.examType || 'ALL',
        subjectId: d.subjectId,
        subjectName: d.subjectName,
        tags: d.tags || [],
        views: d.views || 0,
        likes: d.likes || 0,
        likedBy: d.likedBy || [],
        replyCount: d.replyCount || 0,
        isPinned: !!d.isPinned,
        isLocked: !!d.isLocked,
        isSolved: !!d.isSolved,
        solvedReplyId: d.solvedReplyId,
        moderationStatus: d.moderationStatus || 'approved',
        moderationReason: d.moderationReason,
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
        lastReplyAt: d.lastReplyAt
      });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Forum: Add Reply in Firestore
 */
export async function addForumReplyInFirestore(threadId: string, reply: ForumReply): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return;

  const path = `forum_threads/${threadId}/replies/${reply.id}`;
  try {
    const replyRef = doc(db, 'forum_threads', threadId, 'replies', reply.id);
    await setDoc(replyRef, {
      id: reply.id,
      threadId,
      authorId: currentUid,
      authorName: reply.authorName,
      authorEmail: reply.authorEmail || '',
      authorRole: reply.authorRole || 'student',
      content: reply.content,
      likes: reply.likes || 0,
      isAcceptedAnswer: !!reply.isAcceptedAnswer,
      isAdminResponse: !!reply.isAdminResponse,
      createdAt: reply.createdAt || new Date().toISOString()
    });

    // Increment reply count on thread
    const threadRef = doc(db, 'forum_threads', threadId);
    await updateDoc(threadRef, {
      replyCount: (reply as any).newReplyCount || 1,
      lastReplyAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).catch(() => {});
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Forum: Fetch Replies from Firestore
 */
export async function fetchForumRepliesFromFirestore(threadId: string): Promise<ForumReply[]> {
  const path = `forum_threads/${threadId}/replies`;
  try {
    const snap = await getDocs(collection(db, 'forum_threads', threadId, 'replies'));
    const list: ForumReply[] = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      list.push({
        id: docSnap.id,
        threadId: d.threadId || threadId,
        authorId: d.authorId || '',
        authorName: d.authorName || 'Scholar',
        authorEmail: d.authorEmail,
        authorRole: d.authorRole || 'student',
        content: d.content || '',
        likes: d.likes || 0,
        likedBy: d.likedBy || [],
        isAcceptedAnswer: !!d.isAcceptedAnswer,
        isAdminResponse: !!d.isAdminResponse,
        createdAt: d.createdAt || new Date().toISOString()
      });
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Forum: Admin Pin / Unpin in Firestore
 */
export async function setForumThreadPinnedInFirestore(threadId: string, isPinned: boolean): Promise<void> {
  const path = `forum_threads/${threadId}`;
  try {
    const threadRef = doc(db, 'forum_threads', threadId);
    await updateDoc(threadRef, {
      isPinned,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Forum: Admin Lock / Unlock in Firestore
 */
export async function setForumThreadLockedInFirestore(threadId: string, isLocked: boolean): Promise<void> {
  const path = `forum_threads/${threadId}`;
  try {
    const threadRef = doc(db, 'forum_threads', threadId);
    await updateDoc(threadRef, {
      isLocked,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Forum: Delete Thread in Firestore
 */
export async function deleteForumThreadFromFirestore(threadId: string): Promise<void> {
  const path = `forum_threads/${threadId}`;
  try {
    const threadRef = doc(db, 'forum_threads', threadId);
    await deleteDoc(threadRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
