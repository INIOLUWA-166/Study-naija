import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  X, 
  Award, 
  Radio, 
  Headphones,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { aiVoice, VoicePersona, getVoicePersona, setVoicePersona } from '../utils/aiVoice';
import { User } from '../types';
import confetti from 'canvas-confetti';

interface AudioComprehensionHubProps {
  isOpen?: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser?: (updated: User) => void;
}

interface PassageItem {
  id: string;
  title: string;
  author: string;
  category: 'JAMB UTME Novel' | 'WAEC African Drama' | 'WAEC African Prose' | 'UTME Comprehension';
  durationMinutes: string;
  coverEmoji: string;
  synopsis: string;
  fullText: string[];
  quiz: {
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correctOption: 'A' | 'B' | 'C' | 'D';
    explanation: string;
  }[];
}

const PASSAGES_DATABASE: PassageItem[] = [
  {
    id: 'the-life-changer',
    title: 'The Life Changer: Salma’s University Matriculation',
    author: 'Khadija Abubakar Jalli (Official JAMB Novel)',
    category: 'JAMB UTME Novel',
    durationMinutes: '3 mins read-aloud',
    coverEmoji: '🎓',
    synopsis: 'Ummi narrates the triumphs and tribulations of university life to her children, focusing on Salma’s initial arrogance during her registration at Ahmadu Bello University.',
    fullText: [
      'Salma was a fair complexioned, tall, and slim girl who was undeniably pretty. Her beauty, however, had made her arrogant, proud, and disdainful of simple advice.',
      'When she entered the university campus for the first time, she considered herself far more sophisticated than the lecturers and clerical staff assisting with student registration.',
      'In the registration queue, she ridiculed the elderly clerk, Mr. Dabo, assuming her modern attire and Lagos upbringing excused her from university decorum and queuing protocols.',
      'Ummi paused in her narrative, looking gently at Omar, Bint, and Jamila. "My children," she said softly, "the university is indeed a life changer, but it only changes for the better those who arrive with humility, purpose, and self-discipline."'
    ],
    quiz: [
      {
        question: 'According to the passage, what negative character trait accompanied Salma’s natural physical beauty?',
        options: {
          A: 'Arrogance and disdain for simple advice',
          B: 'Chronic laziness and examination phobia',
          C: 'Excessive shyness in public gatherings',
          D: 'A refusal to communicate in the English language'
        },
        correctOption: 'A',
        explanation: 'The text explicitly states: "Her beauty, however, had made her arrogant, proud, and disdainful of simple advice."'
      },
      {
        question: 'What core lesson does Ummi impart to her children about tertiary university life?',
        options: {
          A: 'The university only positively transforms those who possess humility and self-discipline',
          B: 'Only students from affluent backgrounds survive university examinations',
          C: 'Campus registration queues should always be bypassed with administrative connections',
          D: 'Academic qualifications are less important than social popularity on campus'
        },
        correctOption: 'A',
        explanation: 'Ummi emphasizes that the university "only changes for the better those who arrive with humility, purpose, and self-discipline."'
      }
    ]
  },
  {
    id: 'the-lion-and-jewel',
    title: 'The Lion and the Jewel: The Morning Duel',
    author: 'Wole Soyinka (WAEC Prescribed Drama)',
    category: 'WAEC African Drama',
    durationMinutes: '3 mins read-aloud',
    coverEmoji: '🦁',
    synopsis: 'In the Yoruba village of Ilujinle, the Westernized schoolteacher Lakunle engages Sidi, the village belle, arguing fiercely against the payment of bride price.',
    fullText: [
      'The morning sun rose warmly over the village of Ilujinle as Lakunle carried a heavy bundle of books under his arm, dressed in an ill-fitting Western tweed jacket.',
      'He spotted Sidi balancing a heavy pail of water gracefully upon her head. Running forward with theatrical despair, Lakunle implored her to let him carry the load.',
      '"A woman’s head was not designed to carry timber and pails like a beast of burden," Lakunle declared in pompous English. "In modern London and Lagos, machines do the heavy lifting!"',
      'Sidi laughed scornfully at his preachings. "Lakunle, empty words will not marry me. Pay my bride price so our people will know I was not taken as an unpaid concubine, or go back to your blackboard!"'
    ],
    quiz: [
      {
        question: 'Why does Sidi stubbornly insist on Lakunle paying her traditional bride price?',
        options: {
          A: 'To preserve her social honor so the village does not view her as an unpaid concubine',
          B: 'Because Baroka commanded her to bankrupt the village schoolteacher',
          C: 'To raise funds to purchase imported European fashion catalogs',
          D: 'Because the Anglican church ordered all weddings to pay ancestral tributes'
        },
        correctOption: 'A',
        explanation: 'Sidi insists that without a bride price, the community will mock her and believe she was married off cheaply without honor or social dignity.'
      }
    ]
  },
  {
    id: 'second-class-citizen',
    title: 'Second Class Citizen: The Voice of the Presence',
    author: 'Buchi Emecheta (WAEC African Prose)',
    category: 'WAEC African Prose',
    durationMinutes: '4 mins read-aloud',
    coverEmoji: '✈️',
    synopsis: 'Adah battles poverty and patriarchal discrimination in colonial Lagos, listening constantly to the inner ambition she calls "The Presence".',
    fullText: [
      'Adah was only eight years old when the Presence first spoke to her subconscious mind in the crowded streets of colonial Lagos.',
      'It was a gentle, unwavering voice telling her that somewhere across the wide Atlantic Ocean lay the United Kingdom, a land where girls could study medicine, law, and literature without being dismissed as mere marital investments.',
      'Her father, Pa, was a railway worker who believed in education, but after his sudden death, her relatives sought to terminate her secondary schooling at Methodist Girls’ High School.',
      'With unyielding resilience, Adah secretly took the entrance examination, won a prestigious scholarship, and resolved that no tradition on earth would extinguish the flame of her literary ambition.'
    ],
    quiz: [
      {
        question: 'In Buchi Emecheta’s novel, what does "The Presence" represent in Adah’s inner life?',
        options: {
          A: 'Her deep-seated ambition and vision to pursue tertiary education in England',
          B: 'An ancestral spirit sent by her grandparents from Ibuza to protect her',
          C: 'The colonial scholarship board inspector visiting Methodist Girls’ School',
          D: 'A recurring medical hallucination caused by childhood fever in Lagos'
        },
        correctOption: 'A',
        explanation: 'The Presence represents Adah’s personal inner destiny, ambition, and relentless drive to transcend societal limitations and study abroad.'
      }
    ]
  }
];

export const AudioComprehensionHub: React.FC<AudioComprehensionHubProps> = ({
  isOpen = true,
  onClose,
  user,
  onUpdateUser
}) => {
  const [selectedPassageId, setSelectedPassageId] = useState<string>('the-life-changer');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(-1);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [persona, setPersona] = useState<VoicePersona>(() => getVoicePersona());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const activePassage = PASSAGES_DATABASE.find(p => p.id === selectedPassageId) || PASSAGES_DATABASE[0];

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      aiVoice.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      aiVoice.stop();
      setIsPlaying(false);
      setActiveParagraphIndex(-1);
    } else {
      setIsPlaying(true);
      playParagraph(0);
    }
  };

  const playParagraph = (index: number) => {
    if (index >= activePassage.fullText.length) {
      setIsPlaying(false);
      setActiveParagraphIndex(-1);
      return;
    }

    setActiveParagraphIndex(index);
    aiVoice.setSpeechRate(speechRate);
    aiVoice.speak(activePassage.fullText[index], () => {
      setTimeout(() => {
        playParagraph(index + 1);
      }, 400);
    });
  };

  const handleSpeedChange = (newRate: number) => {
    setSpeechRate(newRate);
    aiVoice.setSpeechRate(newRate);
  };

  const handlePersonaToggle = () => {
    const nextPersona: VoicePersona = persona === 'female' ? 'male' : 'female';
    setPersona(nextPersona);
    setVoicePersona(nextPersona);
    if (isPlaying) {
      aiVoice.stop();
      setIsPlaying(false);
      setActiveParagraphIndex(-1);
    }
  };

  const handleSelectQuizOption = (qIdx: number, option: 'A' | 'B' | 'C' | 'D') => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleCheckQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    activePassage.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctOption) correctCount++;
    });

    if (correctCount === activePassage.quiz.length) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      if (user && onUpdateUser) {
        onUpdateUser({
          ...user,
          xp: (user.xp || 0) + 30
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col text-white shadow-[0_0_60px_rgba(6,182,212,0.25)] relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 relative z-10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/60 border border-cyan-400/40 shrink-0">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  AI VOICE READ-ALOUD
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  JAMB UTME & WAEC COMPREHENSION THEATRE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
                Audio Comprehension & Literature Studio
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              aiVoice.stop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Passage Selector Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 relative z-10 bg-slate-950/60">
          {PASSAGES_DATABASE.map(p => (
            <button
              key={p.id}
              onClick={() => {
                aiVoice.stop();
                setIsPlaying(false);
                setActiveParagraphIndex(-1);
                setSelectedPassageId(p.id);
                setQuizAnswers({});
                setQuizSubmitted(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 ${
                selectedPassageId === p.id
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{p.coverEmoji}</span>
              <span className="line-clamp-1">{p.title.split(':')[0]}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 relative z-10 text-xs sm:text-sm">
          
          {/* Active Passage Audio Card */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-black text-cyan-400 block mb-0.5">
                  {activePassage.category} • {activePassage.durationMinutes}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                  {activePassage.title}
                </h3>
                <p className="text-xs text-slate-400">
                  By {activePassage.author}
                </p>
              </div>

              {/* Audio Controls Panel */}
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                {/* Voice Persona Toggle */}
                <button
                  onClick={handlePersonaToggle}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:text-white cursor-pointer"
                  title="Switch between Amina (Female) and Chidi (Male)"
                >
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Voice: {persona === 'female' ? 'Amina (F)' : 'Chidi (M)'}</span>
                </button>

                {/* Speed Controls */}
                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-700 p-0.5">
                  {[0.8, 1.0, 1.25].map(rate => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        speechRate === rate
                          ? 'bg-cyan-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Master Play / Pause Button */}
                <button
                  onClick={handleTogglePlay}
                  className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer font-['Outfit'] ${
                    isPlaying
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-cyan-500/20 hover:scale-102'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-slate-950" />
                      <span>PAUSE AUDIO</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>LISTEN READ-ALOUD</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sound Wave Animation Visualizer */}
            {isPlaying && (
              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3 text-cyan-300">
                <div className="flex items-center gap-1.5 h-5">
                  <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-4" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-5" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-3" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-5" />
                  <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-4" />
                </div>
                <span className="text-xs font-mono font-semibold">
                  SabiVoice Reading: Paragraph {activeParagraphIndex + 1} of {activePassage.fullText.length}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  {persona === 'female' ? 'Narrator: Amina' : 'Narrator: Chidi'}
                </span>
              </div>
            )}

            {/* Paragraph Text with Live Highlighting */}
            <div className="space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              {activePassage.fullText.map((p, idx) => {
                const isCurrent = activeParagraphIndex === idx;
                return (
                  <p
                    key={idx}
                    className={`p-3 rounded-2xl transition-all duration-300 ${
                      isCurrent
                        ? 'bg-cyan-950/70 border border-cyan-400/80 text-white shadow-md ring-2 ring-cyan-500/20'
                        : 'bg-transparent text-slate-300'
                    }`}
                  >
                    {p}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Quick Comprehension Check Quiz */}
          <div className="p-5 rounded-3xl bg-slate-950/80 border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="font-bold text-white text-xs sm:text-sm font-['Outfit']">
                  Quick Comprehension Check ({activePassage.quiz.length} Questions)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                +30 XP Available
              </span>
            </div>

            <div className="space-y-4">
              {activePassage.quiz.map((q, qIdx) => (
                <div key={qIdx} className="space-y-2.5 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <p className="font-semibold text-xs text-white">
                    {qIdx + 1}. {q.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => {
                      const isPicked = quizAnswers[qIdx] === opt;
                      const isCorrect = opt === q.correctOption;

                      let btnStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold';
                        } else if (isPicked) {
                          btnStyle = 'bg-rose-950/80 border-rose-400 text-rose-200';
                        } else {
                          btnStyle = 'opacity-40 border-transparent';
                        }
                      } else if (isPicked) {
                        btnStyle = 'bg-cyan-950 border-cyan-400 text-white font-bold';
                      }

                      return (
                        <button
                          key={opt}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectQuizOption(qIdx, opt)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2 ${btnStyle}`}
                        >
                          <span className="font-mono font-bold text-[11px] text-cyan-400">{opt}.</span>
                          <span>{q.options[opt]}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                      <span className="text-emerald-400 font-bold block mb-0.5">Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!quizSubmitted ? (
              <button
                disabled={Object.keys(quizAnswers).length < activePassage.quiz.length}
                onClick={handleCheckQuiz}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-40 text-slate-950 font-black text-xs transition cursor-pointer font-['Outfit']"
              >
                SUBMIT COMPREHENSION ANSWERS (+30 XP)
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                <span>Comprehension review complete!</span>
                <span className="font-bold">+30 XP Earned</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0 relative z-10 text-xs">
          <span className="text-slate-400 hidden sm:inline">
            🎧 Voice engine powered by StudyNaija SabiVoice Synthetic Speech
          </span>
          <button
            onClick={() => {
              aiVoice.stop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer ml-auto"
          >
            Close Audio Hub
          </button>
        </div>

      </div>
    </div>
  );
};
