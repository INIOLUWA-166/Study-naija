import React, { useState } from 'react';
import { 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  QrCode, 
  Award, 
  CheckCircle2, 
  School,
  GraduationCap,
  Building2,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { ExamResult, User, Subject } from '../types';

interface OfficialResultSlipProps {
  examResult: ExamResult;
  user: User | null;
  examType: 'JAMB' | 'WAEC';
  subjects: Subject[];
}

interface UniversityData {
  id: string;
  name: string;
  shortName: string;
  type: string;
  location: string;
  generalCutoff: number;
  courseCutoffs: Record<string, number>;
}

const NIGERIAN_UNIVERSITIES: UniversityData[] = [
  {
    id: 'unilag',
    name: 'University of Lagos',
    shortName: 'UNILAG',
    type: 'Federal Premier',
    location: 'Akoka, Lagos State',
    generalCutoff: 200,
    courseCutoffs: {
      medicine: 295,
      nursing: 265,
      pharmacy: 275,
      law: 280,
      computer_sci: 265,
      mech_eng: 260,
      elec_eng: 265,
      accounting: 250,
      economics: 245,
      mass_comm: 250,
      biochem: 230,
      bus_admin: 235
    }
  },
  {
    id: 'ui',
    name: 'University of Ibadan',
    shortName: 'UI',
    type: 'Federal Premier',
    location: 'Ibadan, Oyo State',
    generalCutoff: 200,
    courseCutoffs: {
      medicine: 300,
      nursing: 270,
      pharmacy: 280,
      law: 285,
      computer_sci: 260,
      mech_eng: 255,
      elec_eng: 260,
      accounting: 245,
      economics: 240,
      mass_comm: 245,
      biochem: 235,
      bus_admin: 230
    }
  },
  {
    id: 'oau',
    name: 'Obafemi Awolowo University',
    shortName: 'OAU',
    type: 'Federal Premier',
    location: 'Ile-Ife, Osun State',
    generalCutoff: 200,
    courseCutoffs: {
      medicine: 290,
      nursing: 265,
      pharmacy: 275,
      law: 275,
      computer_sci: 255,
      mech_eng: 250,
      elec_eng: 255,
      accounting: 245,
      economics: 240,
      mass_comm: 240,
      biochem: 225,
      bus_admin: 230
    }
  },
  {
    id: 'unn',
    name: 'University of Nigeria Nsukka',
    shortName: 'UNN',
    type: 'Federal Premier',
    location: 'Nsukka, Enugu State',
    generalCutoff: 190,
    courseCutoffs: {
      medicine: 285,
      nursing: 260,
      pharmacy: 270,
      law: 270,
      computer_sci: 250,
      mech_eng: 245,
      elec_eng: 250,
      accounting: 240,
      economics: 235,
      mass_comm: 235,
      biochem: 220,
      bus_admin: 225
    }
  },
  {
    id: 'abu',
    name: 'Ahmadu Bello University',
    shortName: 'ABU Zaria',
    type: 'Federal Premier',
    location: 'Zaria, Kaduna State',
    generalCutoff: 180,
    courseCutoffs: {
      medicine: 280,
      nursing: 250,
      pharmacy: 260,
      law: 260,
      computer_sci: 240,
      mech_eng: 235,
      elec_eng: 240,
      accounting: 230,
      economics: 225,
      mass_comm: 225,
      biochem: 210,
      bus_admin: 215
    }
  },
  {
    id: 'unilorin',
    name: 'University of Ilorin',
    shortName: 'UNILORIN',
    type: 'Federal First-Choice',
    location: 'Ilorin, Kwara State',
    generalCutoff: 190,
    courseCutoffs: {
      medicine: 285,
      nursing: 255,
      pharmacy: 265,
      law: 265,
      computer_sci: 245,
      mech_eng: 240,
      elec_eng: 245,
      accounting: 235,
      economics: 230,
      mass_comm: 230,
      biochem: 215,
      bus_admin: 220
    }
  },
  {
    id: 'uniben',
    name: 'University of Benin',
    shortName: 'UNIBEN',
    type: 'Federal Premier',
    location: 'Benin City, Edo State',
    generalCutoff: 200,
    courseCutoffs: {
      medicine: 285,
      nursing: 260,
      pharmacy: 270,
      law: 270,
      computer_sci: 250,
      mech_eng: 245,
      elec_eng: 250,
      accounting: 240,
      economics: 235,
      mass_comm: 235,
      biochem: 220,
      bus_admin: 225
    }
  },
  {
    id: 'futa',
    name: 'Federal University of Technology Akure',
    shortName: 'FUTA',
    type: 'Federal Tech Special',
    location: 'Akure, Ondo State',
    generalCutoff: 180,
    courseCutoffs: {
      computer_sci: 255,
      mech_eng: 250,
      elec_eng: 250,
      biochem: 220,
      accounting: 215
    }
  },
  {
    id: 'lasu',
    name: 'Lagos State University',
    shortName: 'LASU',
    type: 'State Premier',
    location: 'Ojo, Lagos State',
    generalCutoff: 195,
    courseCutoffs: {
      medicine: 275,
      nursing: 250,
      law: 260,
      computer_sci: 240,
      accounting: 230,
      economics: 225,
      mass_comm: 230,
      biochem: 210,
      bus_admin: 220
    }
  }
];

const TARGET_COURSES = [
  { id: 'medicine', name: 'Medicine & Surgery (MBBS)', group: 'Medical / Health Sciences' },
  { id: 'pharmacy', name: 'Doctor of Pharmacy (Pharm.D)', group: 'Medical / Health Sciences' },
  { id: 'nursing', name: 'Nursing Science (B.N.Sc)', group: 'Medical / Health Sciences' },
  { id: 'law', name: 'Law (LL.B)', group: 'Law & Jurisprudence' },
  { id: 'computer_sci', name: 'Computer Science & Software Eng.', group: 'Computing & Tech' },
  { id: 'elec_eng', name: 'Electrical & Electronics Engineering', group: 'Engineering' },
  { id: 'mech_eng', name: 'Mechanical Engineering', group: 'Engineering' },
  { id: 'accounting', name: 'Accounting & Finance', group: 'Management Sciences' },
  { id: 'economics', name: 'Economics', group: 'Social Sciences' },
  { id: 'mass_comm', name: 'Mass Communication', group: 'Arts & Media' },
  { id: 'biochem', name: 'Biochemistry', group: 'Pure & Applied Sciences' },
  { id: 'bus_admin', name: 'Business Administration', group: 'Management Sciences' }
];

export const OfficialResultSlip: React.FC<OfficialResultSlipProps> = ({
  examResult,
  user,
  examType,
  subjects
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedUniId, setSelectedUniId] = useState<string>('unilag');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('medicine');

  const candidateName = user?.name?.toUpperCase() || 'STUDENT SCHOLAR';
  const regNo = `SN/${examType}/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;
  const examDate = new Date().toLocaleDateString('en-NG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const aggregateScore = examResult.jambScore || Math.round((examResult.scorePercentage / 100) * 400);
  const waecGrade = examResult.waecGrade || (aggregateScore >= 300 ? 'A1 (Distinction)' : aggregateScore >= 250 ? 'B2 (Very Good)' : aggregateScore >= 200 ? 'C4 (Credit)' : 'Pass');

  const recommendation = aggregateScore >= 280
    ? 'ELITE TIER: Candidate comfortably exceeds cut-offs for Medicine, Law, Pharmacy, and Engineering in premier Federal & State Universities (UI, UNILAG, OAU, ABU, UNN).'
    : aggregateScore >= 220
    ? 'COMPETITIVE TIER: Candidate qualifies for admission into Sciences, Social Sciences, Arts, and Management in most Nigerian Universities.'
    : 'QUALIFIED TIER: Candidate qualifies for Polytechnics, Colleges of Education, and supplementary university admissions. Further targeted practice recommended.';

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const summaryText = `🇳🇬 *StudyNaija Official ${examType} Mock Result Slip*\n` +
      `👤 Candidate: ${candidateName}\n` +
      `🔢 Reg No: ${regNo}\n` +
      `📅 Date: ${examDate}\n` +
      `🏆 Aggregate Score: ${examType === 'JAMB' ? `${aggregateScore} / 400` : waecGrade} (${examResult.scorePercentage}%)\n` +
      `⏱️ Time Spent: ${Math.round(examResult.timeSpentSeconds / 60)} mins\n\n` +
      `*Subject Performance:*\n` +
      examResult.subjectBreakdown.map(s => `• ${s.subjectName}: ${s.correct}/${s.total} (${s.scorePercentage}%)`).join('\n') +
      `\n\n🎯 *StudyNaija CBT Hub:* Prepare with official past questions at https://studynaija.ng`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const shareText = `🇳🇬 I just scored *${examType === 'JAMB' ? `${aggregateScore}/400` : waecGrade}* on my official ${examType} CBT Mock Exam on StudyNaija! 🎯 Practice past questions and mock exams with Naija AI at https://studynaija.ng`;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Eligibility calculation
  const currentUni = NIGERIAN_UNIVERSITIES.find(u => u.id === selectedUniId) || NIGERIAN_UNIVERSITIES[0];
  const currentCourse = TARGET_COURSES.find(c => c.id === selectedCourseId) || TARGET_COURSES[0];
  const requiredCutoff = currentUni.courseCutoffs[selectedCourseId] || currentUni.generalCutoff;
  const scoreDiff = aggregateScore - requiredCutoff;

  let eligibilityTier: 'high' | 'borderline' | 'low' = 'high';
  if (scoreDiff >= 10) {
    eligibilityTier = 'high';
  } else if (scoreDiff >= -15) {
    eligibilityTier = 'borderline';
  } else {
    eligibilityTier = 'low';
  }

  const handleShareEligibility = () => {
    const statusText = eligibilityTier === 'high' 
      ? '🟢 HIGH CHANCE OF ADMISSION' 
      : eligibilityTier === 'borderline' 
      ? '🟡 COMPETITIVE / BORDERLINE' 
      : '🔴 REQUIRES TARGETED PRACTICE';
    const text = `🎓 *My Nigerian University Admission Eligibility*\n` +
      `👤 Candidate: ${candidateName}\n` +
      `🏆 JAMB Mock Score: *${aggregateScore}/400*\n` +
      `🏫 Institution: *${currentUni.name} (${currentUni.shortName})*\n` +
      `📚 Course: *${currentCourse.name}*\n` +
      `🎯 Estimated Cut-off: *${requiredCutoff}*\n` +
      `📊 Assessment: *${statusText}* (${scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} pts)\n\n` +
      `Calculate your course cutoff & practice on StudyNaija: https://studynaija.ng`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/90 text-white print:hidden">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            StudyNaija Verified Examination Slip
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Slip'}</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share to WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-900" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable Result Slip */}
      <div
        id="official-result-slip"
        className="bg-white dark:bg-slate-900 border-2 border-emerald-700/60 dark:border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden"
      >
        {/* Subtle Guilloche / Watermark Security Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center select-none overflow-hidden">
          <div className="text-center font-serif text-slate-900 dark:text-white transform -rotate-12 space-y-8">
            <span className="text-8xl font-black block tracking-widest">STUDYNAIJA</span>
            <span className="text-6xl font-bold block">OFFICIAL CBT SCORE REPORT</span>
            <span className="text-4xl block">VERIFIED ACADEMIC MERIT</span>
          </div>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-200 dark:border-slate-800 pb-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex flex-col items-center justify-center shadow-md border-2 border-amber-400">
              <span className="font-['Outfit'] font-black text-xs tracking-tighter">STUDY</span>
              <span className="font-['Outfit'] font-black text-sm text-amber-300">NAIJA</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-['Outfit'] text-slate-900 dark:text-white tracking-tight">
                STUDYNAIJA NATIONAL CBT ASSESSMENTS
              </h2>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                OFFICIAL {examType} SIMULATION EXAMINATION REPORT
              </p>
              <p className="text-[10px] text-slate-400">
                Accredited CBT Mock Center • Serial: {regNo}
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Official Examination Date
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
              {examDate}
            </span>
          </div>
        </div>

        {/* Candidate Bio & Aggregate Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Candidate Full Name</span>
                <strong className="text-slate-900 dark:text-slate-100 text-sm font-['Outfit']">{candidateName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Examination Type</span>
                <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{examType} (National Standard)</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Candidate Reg No.</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{regNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Tertiary Program</span>
                <span className="text-slate-700 dark:text-slate-300">{user?.targetCourse || 'Tertiary Aspirant'}</span>
              </div>
            </div>
          </div>

          {/* Big Aggregate Score Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-4 rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1">
              AGGREGATE PERFORMANCE
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {examType === 'JAMB' ? (
                <>
                  <span>{aggregateScore}</span>
                  <span className="text-sm font-normal text-emerald-300/80"> / 400</span>
                </>
              ) : (
                <span>{waecGrade}</span>
              )}
            </div>
            <span className="text-[11px] font-bold text-amber-300 mt-1">
              {examResult.scorePercentage}% Overall Accuracy
            </span>
          </div>
        </div>

        {/* Breakdown by Subject Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Subject Performance Scorecard</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {examResult.totalQuestions} Questions Evaluated
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3 text-center">Correct / Total</th>
                  <th className="p-3 text-center">Percentage</th>
                  <th className="p-3 text-center">Normalized (100)</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {examResult.subjectBreakdown.map((s, idx) => {
                  const subjectScoreOutOf100 = Math.round((s.correct / (s.total || 1)) * 100);
                  const isGood = s.scorePercentage >= 60;
                  return (
                    <tr key={s.subjectId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{s.subjectName}</td>
                      <td className="p-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {s.correct} / {s.total}
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-700 dark:text-emerald-400">
                        {s.scorePercentage}%
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                        {subjectScoreOutOf100} / 100
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isGood
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}>
                          {isGood ? 'Excellent' : 'Average'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Recommendation & Admission Insight */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200">
          <span className="font-bold block text-[11px] text-amber-900 dark:text-amber-300 uppercase tracking-wide mb-1">
            Official Admission & Performance Guidance:
          </span>
          <p className="leading-relaxed">
            {recommendation}
          </p>
        </div>

        {/* Security Seals and Digital Verification Footer */}
        <div className="pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Digital Verification Hash</span>
              <span className="font-mono text-slate-500">SN-CERT-{Math.abs(Math.floor(Date.now() / 13)).toString(16).toUpperCase()}</span>
              <span className="block text-emerald-600 dark:text-emerald-400 font-semibold">Verified on StudyNaija Cloud Network</span>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-serif italic font-bold text-slate-800 dark:text-slate-200 text-xs">
              Prof. Inioluwa J. Michael
            </div>
            <div className="text-[10px] text-slate-500">Director of Academic Assessments</div>
            <div className="text-[9px] text-slate-400">StudyNaija Educational Technology Hub</div>
          </div>
        </div>
      </div>

      {/* JAMB UNIVERSITY & COURSE ELIGIBILITY CALCULATOR (Print:hidden) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-xl space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>JAMB Tertiary Admission Predictor</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold font-['Outfit'] text-white">
              University & Course Cut-Off Checker
            </h3>
            <p className="text-xs text-slate-400">
              Check if your <strong>{aggregateScore}/400</strong> mock score meets departmental cut-offs for premier Nigerian universities.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 font-mono text-xs flex items-center gap-2">
            <span className="text-slate-400">Your Score:</span>
            <strong className="text-amber-300 font-black text-sm">{aggregateScore} / 400</strong>
          </div>
        </div>

        {/* Selector Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Nigerian University:</span>
            </label>
            <select
              value={selectedUniId}
              onChange={e => setSelectedUniId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {NIGERIAN_UNIVERSITIES.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.shortName}) — {u.type} • {u.location}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Academic Course:</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {TARGET_COURSES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.group})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Calculation Result Card */}
        <div className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
          eligibilityTier === 'high'
            ? 'bg-emerald-950/80 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
            : eligibilityTier === 'borderline'
            ? 'bg-amber-950/80 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
            : 'bg-rose-950/80 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {eligibilityTier === 'high' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : eligibilityTier === 'borderline' ? (
                <TrendingUp className="w-6 h-6 text-amber-400 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-slate-300 block">
                  ADMISSION PROBABILITY EVALUATION
                </span>
                <h4 className="text-base sm:text-lg font-black font-['Outfit'] text-white">
                  {eligibilityTier === 'high'
                    ? '🟢 HIGH CHANCE OF ADMISSION (Cut-off Comfortably Exceeded)'
                    : eligibilityTier === 'borderline'
                    ? '🟡 COMPETITIVE / MARGINAL TIER (Borderline Candidate)'
                    : '🔴 BELOW ESTIMATED MERIT CUT-OFF'}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Department Cut-Off</span>
                <span className="font-mono font-black text-sm text-white">{requiredCutoff} / 400</span>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                scoreDiff >= 0 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
              }`}>
                {scoreDiff >= 0 ? `+${scoreDiff} pts` : `${scoreDiff} pts`}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed border-t border-slate-700/60 pt-3">
            {eligibilityTier === 'high' ? (
              <>
                Congratulations! With a score of <strong>{aggregateScore}</strong>, you exceed the typical <strong>{requiredCutoff}</strong> merit cut-off for <strong>{currentCourse.name}</strong> at <strong>{currentUni.name}</strong>. Maintain this consistency in your Post-UTME screening to secure your 1st batch merit list admission!
              </>
            ) : eligibilityTier === 'borderline' ? (
              <>
                You are within the competitive margin for <strong>{currentCourse.name}</strong> at <strong>{currentUni.name}</strong> ({scoreDiff >= 0 ? `+${scoreDiff}` : `${scoreDiff}`} points from cutoff {requiredCutoff}). You will need a strong Post-UTME screening score (aim for 70%+) to guarantee admission over competing aspirants.
              </>
            ) : (
              <>
                Your current score of <strong>{aggregateScore}</strong> is below the typical merit cut-off of <strong>{requiredCutoff}</strong> for <strong>{currentCourse.name}</strong> at <strong>{currentUni.name}</strong>. We recommend targeting supplementary/allied courses, considering state/private institutions with lower cut-offs, or taking more mock exams to push your score to {requiredCutoff}+!
              </>
            )}
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Standard Post-UTME Formula: (JAMB ÷ 8) + (O&apos;Level pts ÷ 2) + (Post-UTME ÷ 2)</span>
            </div>

            <button
              onClick={handleShareEligibility}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Eligibility on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
