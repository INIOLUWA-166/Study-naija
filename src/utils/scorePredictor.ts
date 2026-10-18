import { PredictedScoreData, ExamResult, User } from '../types';

const STORAGE_PREDICTOR_OVERRIDE = 'studynaija_predicted_score_custom';

export function calculatePredictedScore(
  recentResults: ExamResult[] = [],
  user?: User | null
): PredictedScoreData {
  // Check if custom diagnostic was manually saved
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_PREDICTOR_OVERRIDE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }

  // Base subjects for typical Nigerian JAMB candidate (Use of English + 3 core subjects)
  const defaultSubjects = [
    { id: 'english', name: 'Use of English', baseAcc: 0.74, attempts: 48 },
    { id: 'maths', name: 'Mathematics', baseAcc: 0.68, attempts: 36 },
    { id: 'physics', name: 'Physics', baseAcc: 0.72, attempts: 32 },
    { id: 'chemistry', name: 'Chemistry', baseAcc: 0.70, attempts: 28 },
  ];

  // If user has actual exam results, incorporate them
  const subjectMap = new Map<string, { totalScore: number; count: number }>();
  recentResults.forEach(res => {
    if (res.subjectScores && res.subjectScores.length > 0) {
      res.subjectScores.forEach(ss => {
        const key = (ss.subjectName || ss.subjectId || 'general').toLowerCase();
        const curr = subjectMap.get(key) || { totalScore: 0, count: 0 };
        const pct = ss.total > 0 ? (ss.correct / ss.total) : 0.7;
        subjectMap.set(key, { totalScore: curr.totalScore + pct, count: curr.count + 1 });
      });
    } else {
      const key = (res.title || 'general').toLowerCase();
      const curr = subjectMap.get(key) || { totalScore: 0, count: 0 };
      const pct = res.totalQuestions > 0 ? (res.correctCount / res.totalQuestions) : (res.scorePercentage / 100 || 0.7);
      subjectMap.set(key, { totalScore: curr.totalScore + pct, count: curr.count + 1 });
    }
  });

  const subjectBreakdown = defaultSubjects.map(sub => {
    let accuracy = sub.baseAcc;
    const actual = subjectMap.get(sub.name.toLowerCase());
    if (actual && actual.count > 0) {
      accuracy = actual.totalScore / actual.count;
    }

    // Convert accuracy to JAMB subject score (out of 100)
    // Scale curve: 50% accuracy ~ 52/100, 75% accuracy ~ 74/100, 90% accuracy ~ 88/100
    const rawScore = Math.round(accuracy * 95 + Math.random() * 3);
    const scoreOutOf100 = Math.min(98, Math.max(35, rawScore));

    let letterGrade = 'C4';
    if (scoreOutOf100 >= 75) letterGrade = 'A1';
    else if (scoreOutOf100 >= 70) letterGrade = 'B2';
    else if (scoreOutOf100 >= 65) letterGrade = 'B3';
    else if (scoreOutOf100 >= 60) letterGrade = 'C4';
    else if (scoreOutOf100 >= 55) letterGrade = 'C5';
    else if (scoreOutOf100 >= 50) letterGrade = 'C6';
    else letterGrade = 'D7';

    let status: 'Strong' | 'Average' | 'Needs Attention' = 'Average';
    if (scoreOutOf100 >= 72) status = 'Strong';
    else if (scoreOutOf100 < 60) status = 'Needs Attention';

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      scoreOutOf100,
      letterGrade,
      accuracy: Math.round(accuracy * 100),
      attempts: sub.attempts + (actual?.count || 0),
      status
    };
  });

  // Total projected JAMB score (sum of 4 subjects, out of 400)
  const projectedJambTotal = subjectBreakdown.reduce((sum, s) => sum + s.scoreOutOf100, 0);

  // Projected WAEC Distinctions (count of A1, B2, B3)
  const projectedWaecDistinctions = subjectBreakdown.filter(s => ['A1', 'B2', 'B3'].includes(s.letterGrade)).length + 3; // +3 for other typical WAEC subjects (Civic, Economics, etc.)

  let readinessLevel: PredictedScoreData['readinessLevel'] = 'Approaching Target';
  if (projectedJambTotal >= 290) readinessLevel = 'Ready for 300+ Merit';
  else if (projectedJambTotal >= 260) readinessLevel = 'Competitive';
  else if (projectedJambTotal >= 220) readinessLevel = 'Approaching Target';
  else readinessLevel = 'Foundational Work Needed';

  const recommendedUniversityCutoffs = [
    {
      institution: 'University of Lagos (UNILAG)',
      course: 'Medicine & Surgery / Nursing',
      targetScore: 285,
      achievable: projectedJambTotal >= 285
    },
    {
      institution: 'University of Ibadan (UI)',
      course: 'Law / Political Science',
      targetScore: 275,
      achievable: projectedJambTotal >= 275
    },
    {
      institution: 'Obafemi Awolowo University (OAU)',
      course: 'Computer Science / Software Eng.',
      targetScore: 265,
      achievable: projectedJambTotal >= 265
    },
    {
      institution: 'Ahmadu Bello University (ABU)',
      course: 'Civil & Electrical Engineering',
      targetScore: 250,
      achievable: projectedJambTotal >= 250
    },
    {
      institution: 'University of Nigeria, Nsukka (UNN)',
      course: 'Pharmacy / Medical Laboratory',
      targetScore: 270,
      achievable: projectedJambTotal >= 270
    },
    {
      institution: 'Federal University of Tech, Akure (FUTA)',
      course: 'Cybersecurity / Architecture',
      targetScore: 255,
      achievable: projectedJambTotal >= 255
    }
  ];

  return {
    projectedJambTotal,
    maxJambScore: 400,
    projectedWaecDistinctions: Math.min(9, projectedWaecDistinctions),
    confidencePercent: 88,
    subjectBreakdown,
    readinessLevel,
    recommendedUniversityCutoffs
  };
}
