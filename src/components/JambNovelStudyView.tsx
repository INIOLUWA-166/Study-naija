import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Users, 
  Flame, 
  ArrowRight, 
  Award, 
  Check, 
  RotateCcw, 
  BookMarked,
  Share2,
  Bookmark
} from 'lucide-react';
import { Question, User } from '../types';
import { gamification } from '../utils/gamification';

interface JambNovelStudyViewProps {
  user: User | null;
  onStartPractice?: (customQuestions: Question[]) => void;
  onNavigate: (view: string, extra?: any) => void;
}

export const JAMB_NOVEL_QUESTIONS: Question[] = [
  {
    id: 'novel-tlc-01',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Chapter 1',
    examType: 'JAMB',
    year: 2026,
    question: 'In Chapter 1 of "The Life Changer", what course was Omar admitted to study at Ahmadu Bello University (ABU), Zaria?',
    options: {
      A: 'Medicine and Surgery',
      B: 'Law',
      C: 'Accounting',
      D: 'Computer Science'
    },
    correctOption: 'B',
    explanation: 'Omar was overjoyed when he checked the JAMB portal and saw that he had been offered admission to study Law at ABU Zaria with an aggregate UTME score of 230.',
    difficulty: 'Easy'
  },
  {
    id: 'novel-tlc-02',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Chapter 1',
    examType: 'JAMB',
    year: 2026,
    question: 'How did Bint, the youngest child, outsmart her French classroom teacher according to the opening story?',
    options: {
      A: 'By speaking fluent Spanish instead of French',
      B: 'By asking the teacher how to say "that\'s very good" in French after answering a greeting question',
      C: 'By reciting the French alphabet backwards without making any errors',
      D: 'By writing a complete French essay before any other pupil'
    },
    correctOption: 'B',
    explanation: 'Bint correctly answered the basic French greeting "Au revoir" and promptly asked the teacher how to say "that is very good" in French ("C\'est tres bien"), which surprised the teacher and impressed her classmates.',
    difficulty: 'Medium'
  },
  {
    id: 'novel-tlc-03',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Chapter 2 & 3',
    examType: 'JAMB',
    year: 2026,
    question: 'Why did Salma initially consider the lecturer, Dr. Dabo, arrogant and unfriendly during registration?',
    options: {
      A: 'He refused to sign her course registration form on time',
      B: 'He asked her out for dinner in exchange for course approval',
      C: 'He rebuffed her attempt to flirt and advised her strictly on modest university dress code',
      D: 'He tore her matriculation certificate in front of other students'
    },
    correctOption: 'C',
    explanation: 'Salma attempted to use her charm and alluring makeup on Dr. Dabo during department clearance. Dr. Dabo, a deeply principled lecturer, firmly cautioned her to dress decently and maintain modesty, which wounded her pride.',
    difficulty: 'Medium'
  },
  {
    id: 'novel-tlc-04',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Chapter 4',
    examType: 'JAMB',
    year: 2026,
    question: 'In the female hostel at ABU Zaria, who were Salma\'s three diverse roommates representing national unity?',
    options: {
      A: 'Tomiwa (Yoruba), Ngozi (Igbo), and Ada (Benue/Tiv)',
      B: 'Fatima (Hausa), Aisha (Fulani), and Zainab (Kanuri)',
      C: 'Blessing (Efik), Chioma (Igbo), and Funke (Yoruba)',
      D: 'Halima (Nupe), Mary (Urhobo), and Ruth (Idoma)'
    },
    correctOption: 'A',
    explanation: 'Salma shared the room with Tomiwa (from Oyo State), Ngozi (from Imo State), and Ada (from Benue State). Despite cultural differences, they lived harmoniously and shared meals together.',
    difficulty: 'Easy'
  },
  {
    id: 'novel-tlc-05',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Chapter 5',
    examType: 'JAMB',
    year: 2026,
    question: 'What led to Tomiwa entering Habib\'s luxurious Mercedes Benz car instead of Salma?',
    options: {
      A: 'Tomiwa disguised herself with Salma\'s veil and perfume',
      B: 'Habib mistook Tomiwa for Salma in the evening darkness because Salma refused to step outside',
      C: 'Habib had seen Tomiwa earlier and specifically asked for her phone number',
      D: 'Salma instructed Tomiwa to spy on Habib\'s intentions before accepting a ride'
    },
    correctOption: 'B',
    explanation: 'Salma arrogantly refused to walk out to meet the visitors in the car, so Tomiwa stepped out to relay her message. In the dim evening light, Habib and Labaran assumed she was the elegant girl from the campus and gave her gifts.',
    difficulty: 'Medium'
  },
  {
    id: 'novel-tlc-06',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Chapter 6',
    examType: 'JAMB',
    year: 2026,
    question: 'What precipitated Salma\'s appearance before the Examination Malpractice Committee (EMC)?',
    options: {
      A: 'She paid a male student to write her General Studies paper',
      B: 'She carried pre-written crib notes (micro-chips) into the Moral Philosophy examination',
      C: 'She forged her lecturer\'s signature on the final grading sheet',
      D: 'She was caught using an unauthorized mobile phone during testing'
    },
    correctOption: 'B',
    explanation: 'Unprepared for Moral Philosophy, Salma carried prohibited notes into the exam hall. When the female invigilator approached, Salma attempted to dispose of the paper, but was caught and made to sign a malpractice form.',
    difficulty: 'Medium'
  },
  {
    id: 'novel-tlc-07',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Chapter 7',
    examType: 'JAMB',
    year: 2026,
    question: 'How did Kabir, the University laboratory assistant, defraud Salma?',
    options: {
      A: 'He promised to hack into the university database and alter her semester GPA',
      B: 'He claimed to know the EMC Chairman and collected ₦100,000 to "settle" the expulsion verdict',
      C: 'He rented out a non-existent off-campus apartment to her at Samaru',
      D: 'He claimed he was the Dean of Students and demanded sexual favors'
    },
    correctOption: 'B',
    explanation: 'Habib connected Salma to Kabir, who falsely claimed he could bribe the Examination Malpractice Committee chairman. Kabir collected ₦100,000 from Salma and vanished without rendering any help.',
    difficulty: 'Hard'
  },
  {
    id: 'novel-tlc-08',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Chapter 8',
    examType: 'JAMB',
    year: 2026,
    question: 'Where did Kabir lose the stolen money he extorted from Salma?',
    options: {
      A: 'In an underground gambling casino den in Funtua, intercepted by thugs',
      B: 'He forgot the bag in a long-distance commercial bus to Kano',
      C: 'His campus room was burglarized by rival students',
      D: 'He was robbed at gunpoint at an automated teller machine (ATM)'
    },
    correctOption: 'A',
    explanation: 'Kabir went to a notorious gambling house in Funtua, won big, but was trailed and robbed of all his money, including the ₦100,000 extorted from Salma, by local thugs hired by Zaki.',
    difficulty: 'Hard'
  },
  {
    id: 'novel-tlc-09',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Chapter 9',
    examType: 'JAMB',
    year: 2026,
    question: 'What profound lesson did Salma learn at the conclusion of her university ordeal?',
    options: {
      A: 'That university life requires having wealthy political boyfriends for survival',
      B: 'That humility, honesty, and true friendship surpass superficial pride, deception, and shortcuts',
      C: 'That examination malpractice is acceptable as long as you do not get caught',
      D: 'That hostel roommates should never share personal secrets with each other'
    },
    correctOption: 'B',
    explanation: 'After her expulsion, Salma realized that her pride, deceptive lifestyle, and cheating ruined her education. She deeply appreciated the unconditional support of Tomiwa, Ngozi, and Ada, becoming a reformed, humble person.',
    difficulty: 'Easy'
  },
  {
    id: 'novel-tlc-10',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'The Life Changer - Author & Setting',
    examType: 'JAMB',
    year: 2026,
    question: 'Who is the author of the compulsory JAMB UTME novel "The Life Changer"?',
    options: {
      A: 'Chimamanda Ngozi Adichie',
      B: 'Wole Soyinka',
      C: 'Khadija Abubakar Jalli',
      D: 'Buchi Emecheta'
    },
    correctOption: 'C',
    explanation: '"The Life Changer" was written by Khadija Abubakar Jalli as an inspirational and moral guide for prospective undergraduate students transitioning into tertiary institutions.',
    difficulty: 'Easy'
  }
];

export const JambNovelStudyView: React.FC<JambNovelStudyViewProps> = ({
  user,
  onStartPractice,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'characters' | 'quiz' | 'themes'>('summary');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [savedQuestionIds, setSavedQuestionIds] = useState<string[]>(() => gamification.getBookmarkedIds());

  const handleSelectQuizOption = (questionId: string, optionKey: string) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

  const handleScoreQuiz = () => {
    setQuizSubmitted(true);
    let correct = 0;
    JAMB_NOVEL_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id]?.toUpperCase() === q.correctOption.toUpperCase()) {
        correct++;
      }
    });
    // Award 50 XP if they scored above 70%
    if (correct >= 7) {
      gamification.addXp(50, user);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleSaveQuestion = (q: Question) => {
    const res = gamification.toggleBookmark(q.id, q);
    setSavedQuestionIds(res.allIds);
  };

  const scoreCount = JAMB_NOVEL_QUESTIONS.filter(
    q => quizAnswers[q.id]?.toUpperCase() === q.correctOption.toUpperCase()
  ).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 sm:p-10 rounded-3xl text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold uppercase tracking-wider">
            <span>📖 Compulsory JAMB UTME Text</span>
            <span>•</span>
            <span>10 Guaranteed Exam Marks</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight">
            "The Life Changer" by Khadija Abubakar Jalli
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every JAMB candidate is mandated to answer 10 questions on this prescribed English novel. Master the chapter plot summaries, character relationships, themes, and take our high-yield novel drill!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('quiz')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>Take 10-Question Novel Drill</span>
            </button>
            {onStartPractice && (
              <button
                onClick={() => onStartPractice(JAMB_NOVEL_QUESTIONS)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Practice in Full CBT Engine →</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'summary', label: 'Chapter-by-Chapter Summaries (1–9)', icon: BookOpen },
          { id: 'characters', label: 'Character Guide & Profiles', icon: Users },
          { id: 'themes', label: 'Core Themes & Moral Lessons', icon: Award },
          { id: 'quiz', label: 'Interactive Novel Quiz Drill (10 Qs)', icon: Flame }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CHAPTER-BY-CHAPTER SUMMARIES */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          {[
            {
              ch: 1,
              title: 'Chapter 1: Family Morning & Omar’s Admission',
              content: 'The story opens with Bint, the youngest daughter, sharing her classroom encounter with a French teacher whom she wittily outsmarted. Omar, the eldest brother, bursts into the house with thrilling news: he scored 230 in his JAMB UTME and gained admission to study Law at Ahmadu Bello University (ABU), Zaria. Ummi, their mother, uses this opportunity to impart life lessons and university guidance.'
            },
            {
              ch: 2,
              title: 'Chapter 2: The University Culture Shock & Lafayette Legend',
              content: 'Ummi narrates the tragic story of a young, promising village girl from Lafayette who went to university and was swayed by superficial modernity, leading to pregnancy and heartbreak. This serves as a cautionary tale for Omar regarding peer pressure, self-control, and moral rectitude in tertiary institutions.'
            },
            {
              ch: 3,
              title: 'Chapter 3: Salma’s Registration & The Strict Dr. Dabo',
              content: 'We meet Salma, a glamorous, prideful fresher arriving at ABU Zaria. Finding registration queues long, she attempts to bypass the queue by using her beauty on Dr. Dabo, a lecturer known for strict discipline. Dr. Dabo sternly rejects her advances and advises her to dress modestly according to the university code of conduct, deeply bruising Salma’s inflated ego.'
            },
            {
              ch: 4,
              title: 'Chapter 4: The Four Diverse Roommates & National Unity',
              content: 'Salma moves into Queen Amina Hall and shares a room with three diverse girls: Tomiwa from Oyo State, Ngozi from Imo State, and Ada from Benue State. Despite cultural and religious differences, they cultivate mutual respect, share indigenous meals, and live in sisterly solidarity.'
            },
            {
              ch: 5,
              title: 'Chapter 5: The Mercedes Benz Encounter & Labaran',
              content: 'Two wealthy men, Habib (a politician) and Labaran, arrive outside the hostel in a luxury Mercedes Benz looking for Salma. Feeling too proud to walk down, Salma asks Tomiwa to relay her message. In the dim lighting, Habib mistaking Tomiwa for Salma showers her with gifts and cash, causing tension when Tomiwa returns upstairs with the spoils.'
            },
            {
              ch: 6,
              title: 'Chapter 6: Examination Malpractice in Law Faculty',
              content: 'Salma fails to study for her Moral Philosophy exam. Desperate, she brings illicit notes (micro-chips) into the examination hall. A female invigilator catches her attempting to swallow or dispose of the incriminating paper. Salma is forced to sign the Examination Malpractice Form and faces the dreaded disciplinary committee.'
            },
            {
              ch: 7,
              title: 'Chapter 7: Kabir the Deceiver & The ₦100,000 Extortion',
              content: 'Desperate to avoid expulsion, Salma begs Habib for political intervention. Habib links her with Kabir, who falsely claims to have personal access to the Examination Malpractice Committee chairman. Kabir extorts ₦100,000 from Salma under the pretext of bribery and disappears without submitting any plea on her behalf.'
            },
            {
              ch: 8,
              title: 'Chapter 8: The Gambling Den in Funtua & Zaki’s Thugs',
              content: 'Kabir takes Salma’s ₦100,000 to an underground gambling house in Funtua. After winning a huge sum of money, he refuses to share with local underworld figures. Zaki and his henchmen ambush Kabir, beating him and seizing all the extorted money. Kabir ends up penniless and bloodied.'
            },
            {
              ch: 9,
              title: 'Chapter 9: Salma’s Reformation & Omar’s Readiness',
              content: 'Expelled from ABU, Salma experiences profound remorse, sheds her arrogance, and returns home transformed. Her former roommates offer comfort without judgment. Armed with his mother’s wisdom, Omar understands that university education is indeed a "Life Changer"—capable of making or breaking one’s destiny.'
            }
          ].map(item => {
            const isOpen = expandedChapter === item.ch;
            return (
              <div
                key={item.ch}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setExpandedChapter(isOpen ? null : item.ch)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                      Ch {item.ch}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 font-['Outfit']">
                      {item.title}
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold">
                    {isOpen ? 'Close' : 'Read Summary →'}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    <p>{item.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CHARACTER GUIDE */}
      {activeTab === 'characters' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Salma',
              role: 'Protagonist / Complex Character',
              badge: 'The Prideful Scholar',
              traits: 'Arrogant, fashionable, and easily swayed by luxury, but undergoes genuine remorse and redemption after expulsion.'
            },
            {
              name: 'Ummi',
              role: 'The Wise Mother & Narrator',
              badge: 'Moral Compass',
              traits: 'Loving, religious, and seasoned with life wisdom. Guides her children (Omar, Bint, Teemah, Jamila) with cautionary tales.'
            },
            {
              name: 'Omar',
              role: 'Aspiring Law Undergraduate',
              badge: 'The Jambite',
              traits: 'Hardworking and ambitious. Scores 230 in UTME to gain admission into ABU Zaria Law Faculty.'
            },
            {
              name: 'Dr. Dabo',
              role: 'Disciplined University Lecturer',
              badge: 'Uncompromising Integrity',
              traits: 'Strict, moral, and upright. Rebuffs Salma’s flirtatious tactics and emphasizes institutional dressing standards.'
            },
            {
              name: 'Tomiwa, Ngozi & Ada',
              role: 'Salma’s Roommates',
              badge: 'Unity in Diversity',
              traits: 'Represent Nigeria’s ethnic harmony (Yoruba, Igbo, and Tiv). Kind-hearted, studious, and loyal friends.'
            },
            {
              name: 'Kabir & Habib',
              role: 'The Exploiters',
              badge: 'Deceit & Corruption',
              traits: 'Habib is a wealthy politician offering material gifts; Kabir is a crooked lab assistant who extorts Salma’s ₦100,000.'
            }
          ].map((char, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {char.badge}
              </span>
              <h3 className="text-base font-black text-slate-900 font-['Outfit']">{char.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{char.role}</p>
              <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">{char.traits}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: THEMES & MORALS */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: '1. The Dangers of Examination Malpractice',
              desc: 'Academic shortcuts destroy futures. Salma’s single decision to carry illicit notes into the Moral Philosophy hall resulted in immediate expulsion, public humiliation, and financial loss.'
            },
            {
              title: '2. Ethnic Tolerance & National Integration',
              desc: 'The four roommates (Salma, Tomiwa, Ngozi, and Ada) showcase how Nigerians of Northern, Western, and Eastern heritage can coexist peacefully, share food, and support one another.'
            },
            {
              title: '3. Superficial Pride & False Affluence',
              desc: 'Salma’s desire to maintain an image of extreme wealth and superiority alienated genuine friends and made her an easy target for extortion by Kabir.'
            },
            {
              title: '4. Parental Guidance & Moral Resilience',
              desc: 'Ummi’s bedtime stories and dialogue with Omar underscore the critical role parental wisdom plays in preparing youths for freedom in tertiary education.'
            }
          ].map((theme, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-2">
              <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">{theme.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{theme.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: INTERACTIVE NOVEL QUIZ */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-emerald-950 font-['Outfit']">
                Official 10-Question "Life Changer" Practice Drill
              </h3>
              <p className="text-xs text-emerald-800">
                Answer each question below. Score 7/10 or higher to earn <strong>+50 Bonus XP</strong>!
              </p>
            </div>
            {quizSubmitted && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-black px-3 py-1 bg-emerald-600 text-white rounded-xl shadow-xs">
                  Score: {scoreCount} / {JAMB_NOVEL_QUESTIONS.length} ({Math.round((scoreCount / JAMB_NOVEL_QUESTIONS.length) * 100)}%)
                </span>
                <button
                  onClick={handleResetQuiz}
                  className="px-3 py-1 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Drill</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {JAMB_NOVEL_QUESTIONS.map((q, idx) => {
              const selected = quizAnswers[q.id];
              const isSaved = savedQuestionIds.includes(q.id);

              return (
                <div key={q.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {q.topic}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSaveQuestion(q)}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition cursor-pointer ${
                        isSaved ? 'bg-amber-50 text-amber-700 border-amber-300' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Save this question for revision in Dashboard"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-600' : ''}`} />
                      <span className="text-[10px] font-bold">{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                      const optVal = q.options[optKey];
                      const isChosen = selected === optKey;
                      const isCorrect = q.correctOption.toUpperCase() === optKey;

                      let style = 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          style = 'bg-emerald-50 text-emerald-950 border-emerald-400 font-bold';
                        } else if (isChosen && !isCorrect) {
                          style = 'bg-red-50 text-red-950 border-red-300 font-bold';
                        }
                      } else if (isChosen) {
                        style = 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs';
                      }

                      return (
                        <button
                          key={optKey}
                          onClick={() => handleSelectQuizOption(q.id, optKey)}
                          disabled={quizSubmitted}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition cursor-pointer ${style}`}
                        >
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isChosen && !quizSubmitted
                              ? 'bg-white text-slate-950'
                              : isCorrect && quizSubmitted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {optKey}
                          </span>
                          <span>{optVal}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Teacher's Verified Explanation:</span>
                      </div>
                      <p className="text-emerald-950 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!quizSubmitted && (
            <div className="text-center pt-2">
              <button
                onClick={handleScoreQuiz}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Submit Novel Quiz & Check Verified Solutions →
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
