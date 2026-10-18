import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Defined Google Workspace Scopes
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/forms.body'
];

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with workspace scopes
const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => {
  provider.addScope(scope);
});

// Flag to track sign-in state
let isSigningIn = false;
// Cached access token in memory only (never saved to localStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token not available in memory, prompt sign in when needed
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ============================================================================
// GOOGLE WORKSPACE API OPERATIONS (SHEETS, DOCS, CLASSROOM, FORMS)
// ============================================================================

export interface SheetExportRow {
  studentName: string;
  examType: string;
  subject: string;
  score: number;
  percentage: number;
  grade: string;
  date: string;
}

// 1. Google Sheets: Export Exam Results & Analytics to Spreadsheets
export const exportToGoogleSheets = async (
  spreadsheetTitle: string,
  rows: SheetExportRow[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google to export to Google Sheets.');

  // Construct sheet values
  const headerRow = ['Candidate Name', 'Exam Type', 'Subject', 'Score', 'Percentage (%)', 'Grade', 'Date Attempted'];
  const dataRows = rows.map(r => [
    r.studentName,
    r.examType,
    r.subject,
    r.score,
    `${r.percentage}%`,
    r.grade,
    r.date
  ]);

  const body = {
    properties: {
      title: spreadsheetTitle
    },
    sheets: [
      {
        properties: {
          title: 'Exam Performance Summary',
          gridProperties: {
            frozenRowCount: 1
          }
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: headerRow.map(h => ({
                  userEnteredValue: { stringValue: h },
                  userEnteredFormat: {
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                    backgroundColor: { red: 0.02, green: 0.58, blue: 0.41 } // StudyNaija Emerald
                  }
                }))
              },
              ...dataRows.map(row => ({
                values: row.map(val => ({
                  userEnteredValue: typeof val === 'number' 
                    ? { numberValue: val } 
                    : { stringValue: String(val) }
                }))
              }))
            ]
          }
        ]
      }
    ]
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to create Google Sheet.');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl
  };
};

// 2. Google Docs: Export Study Notes, Formula Sheets & Revision Summaries
export const exportToGoogleDocs = async (
  documentTitle: string,
  contentMarkdown: string
): Promise<{ documentId: string; documentUrl: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google to create a Google Doc.');

  // 1. Create empty document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: documentTitle })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Doc.');
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  // 2. Insert formatted content text
  const cleanText = contentMarkdown
    .replace(/###/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim();

  const insertText = `🇳🇬 StudyNaija Academic Revision Guide\n${documentTitle}\nGenerated: ${new Date().toLocaleDateString()}\n\n${cleanText}\n\nStudy hard and excel in your exams!\nhttps://studynaija.ng`;

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: insertText
          }
        }
      ]
    })
  });

  return {
    documentId,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`
  };
};

// 3. Google Classroom: Sync Courses & Active Coursework
export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  alternateLink?: string;
  courseState?: string;
}

export interface ClassroomCourseWork {
  id: string;
  title: string;
  description?: string;
  alternateLink?: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
  maxPoints?: number;
}

export const fetchClassroomCourses = async (): Promise<ClassroomCourse[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google to access Google Classroom.');

  const res = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch Google Classroom courses.');
  }

  const data = await res.json();
  return data.courses || [];
};

export const fetchCourseWork = async (courseId: string): Promise<ClassroomCourseWork[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google to access Coursework.');

  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch Classroom assignments.');
  }

  const data = await res.json();
  return data.courseWork || [];
};

// 4. Google Forms: Generate CBT Practice Quiz Form
export interface QuizQuestionItem {
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export const createGoogleQuizForm = async (
  quizTitle: string,
  questionsList: QuizQuestionItem[]
): Promise<{ formId: string; responderUri: string; editUri: string }> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google to generate Google Forms.');

  // 1. Create form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title: quizTitle,
        documentTitle: quizTitle
      }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Form.');
  }

  const formData = await createRes.json();
  const formId = formData.formId;

  // 2. Add question items via batchUpdate
  const requests = questionsList.slice(0, 10).map((q, idx) => ({
    createItem: {
      item: {
        title: `${idx + 1}. ${q.question}`,
        questionItem: {
          question: {
            required: true,
            choiceQuestion: {
              type: 'RADIO',
              options: q.options.map(opt => ({ value: opt })),
              shuffle: false
            }
          }
        }
      },
      location: {
        index: idx
      }
    }
  }));

  if (requests.length > 0) {
    await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
  }

  return {
    formId,
    responderUri: formData.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`,
    editUri: `https://docs.google.com/forms/d/${formId}/edit`
  };
};
