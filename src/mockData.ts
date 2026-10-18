import { Subject, Question, Article, PricingPlan, EducationLevel } from './types';
import { PRIMARY_SUBJECTS, UNIVERSITY_SUBJECTS, PRIMARY_QUESTIONS, UNIVERSITY_QUESTIONS } from './data/educationQuestions';
import { EXTENDED_QUESTIONS } from './utils/questionBank';

export const SECONDARY_SUBJECTS: Subject[] = [
  {
    id: 'english',
    name: 'English Language',
    code: 'ENG',
    icon: 'BookOpen',
    educationLevel: 'secondary',
    description: 'Lexis & Structure, Comprehension, Antonyms, Synonyms, Oral English, and Prescribed Literary Texts.',
    topics: ['Lexis & Structure', 'Comprehension Passages', 'Synonyms & Antonyms', 'Oral English & Phonology', 'The Life Changer & Novels', 'Idioms & Collocations'],
    questionCount: 120,
    featured: true,
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    code: 'MTH',
    icon: 'Binary',
    description: 'Algebra, Quadratic Equations, Indices & Logarithms, Trigonometry, Calculus, and Statistics.',
    topics: ['Algebra & Linear Equations', 'Indices & Logarithms', 'Trigonometry', 'Calculus (Differentiation & Integration)', 'Statistics & Probability', 'Geometry & Mensuration'],
    questionCount: 110,
    featured: true,
  },
  {
    id: 'biology',
    name: 'Biology',
    code: 'BIO',
    icon: 'Dna',
    description: 'Cell structure, Genetics & Heredity, Ecology, Nutrition, Hormones, Transport & Nervous systems.',
    topics: ['Cell Biology & Organization', 'Genetics & Heredity', 'Ecology & Ecosystems', 'Nutrition & Digestion', 'Excretory & Circulatory Systems', 'Reproduction in Plants & Animals'],
    questionCount: 95,
    featured: true,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    code: 'CHM',
    icon: 'FlaskConical',
    description: 'Atomic structure, Stoichiometry, Acids/Bases & Salts, Organic Chemistry, Chemical Energetics.',
    topics: ['Atomic Structure & Periodic Table', 'Chemical Bonding & Stoichiometry', 'Acids, Bases & Salts', 'Organic Chemistry (Hydrocarbons)', 'Chemical Kinetics & Equilibrium', 'Electrochemistry'],
    questionCount: 90,
    featured: true,
  },
  {
    id: 'physics',
    name: 'Physics',
    code: 'PHY',
    icon: 'Atom',
    description: 'Mechanics, Newton laws, Heat & Thermodynamics, Waves & Sound, Current Electricity, Magnetism.',
    topics: ['Mechanics & Newton Laws', 'Work, Energy & Power', 'Waves, Sound & Optics', 'Heat Energy & Gas Laws', 'Current Electricity & Circuits', 'Modern Physics & Radioactivity'],
    questionCount: 88,
    featured: true,
  },
  {
    id: 'economics',
    name: 'Economics',
    code: 'ECO',
    icon: 'TrendingUp',
    description: 'Basic economic concepts, Elasticity, Theory of Production, National Income, Money & Banking in Nigeria.',
    topics: ['Basic Economic Concepts & Scarcity', 'Price Theory: Demand & Supply', 'Theory of Consumer Behavior', 'National Income Accounting', 'Money, Banking & Monetary Policy', 'International Trade & ECOWAS'],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'government',
    name: 'Government',
    code: 'GOV',
    icon: 'Landmark',
    description: 'Political systems, Nigerian Constitutions, Pre-colonial systems (Hausa/Fulani, Yoruba, Igbo), Foreign Policy.',
    topics: ['Concepts of State & Sovereignty', 'Arms & Forms of Government', 'Pre-colonial Systems in Nigeria', 'Constitutional Development (1922-1999)', 'Federalism in Nigeria', 'Nigerian Foreign Policy & ECOWAS'],
    questionCount: 80,
    featured: true,
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  ...SECONDARY_SUBJECTS.map(s => ({ ...s, educationLevel: 'secondary' as const })),
  ...PRIMARY_SUBJECTS,
  ...UNIVERSITY_SUBJECTS
];

export const SECONDARY_QUESTIONS: Question[] = [
  // ==========================================
  // ENGLISH LANGUAGE (12 Unique High-Yield Questions)
  // ==========================================
  {
    id: 'eng-1',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Lexis & Structure',
    examType: 'JAMB',
    year: 2026,
    question: 'The disciplinary committee took the student to task because his actions were considered ______ to the school rules.',
    options: {
      A: 'contrary',
      B: 'adverse',
      C: 'repugnant',
      D: 'discrepant'
    },
    correctOption: 'A',
    explanation: 'In English collocation and prepositional usage, "contrary to" is the correct standard construction when an action violates rules or expectations. "Adverse" takes "to" in conditions (e.g. adverse weather), but "contrary to rules" is standard.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-2',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Synonyms & Antonyms',
    examType: 'JAMB',
    year: 2026,
    question: 'Choose the word nearest in meaning to the capitalized word: The diplomat made an IMPLICIT pledge to assist the refugee community.',
    options: {
      A: 'Outspoken',
      B: 'Implied',
      C: 'Hesitant',
      D: 'Formal'
    },
    correctOption: 'B',
    explanation: '"Implicit" means suggested, understood, or hinted at though not expressed directly or formally in words. Therefore, "implied" is the closest synonym.',
    difficulty: 'Easy'
  },
  {
    id: 'eng-3',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Oral English & Phonology',
    examType: 'WAEC',
    year: 2025,
    question: 'Identify the word with the same vowel sound as the underlined sound in "cl<u>er</u>k":',
    options: {
      A: 'Dark',
      B: 'Bird',
      C: 'Work',
      D: 'Claw'
    },
    correctOption: 'A',
    explanation: 'In standard British Received Pronunciation (tested in WAEC/JAMB), "clerk" is pronounced /klɑːk/, sharing the long back open vowel /ɑː/ with "dark" /dɑːk/. In American English it is /ɜːr/, but West African examinations strictly follow British RP.',
    difficulty: 'Hard'
  },
  {
    id: 'eng-4',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'The Life Changer & Novels',
    examType: 'JAMB',
    year: 2026,
    question: 'In Khadija Abubakar Jalli’s "The Life Changer", what key life lesson does Ummi impart to her children before university entry?',
    options: {
      A: 'Academic success is the sole determinant of destiny',
      B: 'Freedom in tertiary institutions requires discipline and moral integrity',
      C: 'Students should avoid socializing with fellow departmental peers',
      D: 'University campus cultism is unavoidable'
    },
    correctOption: 'B',
    explanation: 'Ummi shares experiences with her children (Omar, Teemah, Jamila, Bint) emphasizing that university campus life grants tremendous freedom, which easily ruins a student without personal discipline, vigilance, and moral grounding.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-5',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Idioms & Collocations',
    examType: 'JAMB',
    year: 2025,
    question: 'Choose the option that best explains the idiom: When the principal asked about the missing funds, the bursar began to "beat about the bush".',
    options: {
      A: 'Search for money in the garden',
      B: 'Avoid giving a direct answer to the question',
      C: 'Confess all his previous financial crimes',
      D: 'Accuse the classroom teachers angrily'
    },
    correctOption: 'B',
    explanation: 'The idiom "beat about the bush" means to discuss a matter without addressing its core point, deliberately avoiding giving a direct answer or confronting difficult facts.',
    difficulty: 'Easy'
  },
  {
    id: 'eng-6',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Lexis & Structure',
    examType: 'WAEC',
    year: 2026,
    question: 'Neither the class prefect nor his classmates ______ present at the assembly yesterday.',
    options: {
      A: 'was',
      B: 'were',
      C: 'is',
      D: 'are'
    },
    correctOption: 'B',
    explanation: 'According to the rule of proximity in subject-verb concord, when subjects are joined by "neither... nor", the verb must agree with the subject closest to it. Here, "classmates" is plural and the event occurred in the past ("yesterday"), so "were" is the correct verb.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-7',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Synonyms & Antonyms',
    examType: 'JAMB',
    year: 2026,
    question: 'Choose the word opposite in meaning to the capitalized word: The commissioner’s speech was full of OBSCURE references.',
    options: {
      A: 'Vague',
      B: 'Lucid',
      C: 'Lengthy',
      D: 'Complicated'
    },
    correctOption: 'B',
    explanation: '"Obscure" means unclear, difficult to understand, or hidden. The exact opposite is "lucid", which means clear, easy to understand, and transparent.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-8',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Oral English & Phonology',
    examType: 'JAMB',
    year: 2025,
    question: 'Select the word that has the primary stress on the SECOND syllable:',
    options: {
      A: 'Education',
      B: 'Democratic',
      C: 'Photographer',
      D: 'Photograph'
    },
    correctOption: 'C',
    explanation: '"Photographer" is pronounced /fəˈtɒɡ.rə.fər/, placing the primary stress on the second syllable "-tog-". In contrast, "photograph" has stress on the first syllable /ˈfəʊ.tə.ɡrɑːf/, and "education" on the third /ˌed.jʊˈkeɪ.ʃən/.',
    difficulty: 'Hard'
  },
  {
    id: 'eng-9',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Comprehension Passages',
    examType: 'JAMB',
    year: 2026,
    question: 'Complete the sentence with the most appropriate option: The police were unable to arrest the suspect because he gave them the ______ .',
    options: {
      A: 'run',
      B: 'slip',
      C: 'go',
      D: 'escape'
    },
    correctOption: 'B',
    explanation: 'The idiomatic expression is "to give someone the slip", which means to escape from someone who is following or pursuing you.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-10',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Lexis & Structure',
    examType: 'WAEC',
    year: 2026,
    question: 'Hardly had the candidates entered the examination hall ______ the invigilator blew the whistle.',
    options: {
      A: 'when',
      B: 'than',
      C: 'then',
      D: 'as'
    },
    correctOption: 'A',
    explanation: 'Correlative conjunction rule: "Hardly... when" and "Scarcely... when" are always paired together. "No sooner" takes "than". Using "than" with "hardly" is a frequent trap in JAMB and WAEC.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-11',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Oral English & Phonology',
    examType: 'WAEC',
    year: 2025,
    question: 'Which of the following words contains a silent letter?',
    options: {
      A: 'Subtle',
      B: 'Settle',
      C: 'Cattle',
      D: 'Little'
    },
    correctOption: 'A',
    explanation: 'In "subtle" /ˈsʌt.əl/, the letter "b" is completely silent. The word is pronounced exactly as if it were spelled "suttle".',
    difficulty: 'Easy'
  },
  {
    id: 'eng-12',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Lexis & Structure',
    examType: 'JAMB',
    year: 2026,
    question: 'I would rather you ______ the assignment today instead of postponing it.',
    options: {
      A: 'complete',
      B: 'completed',
      C: 'will complete',
      D: 'have completed'
    },
    correctOption: 'B',
    explanation: 'When "would rather" is followed by a subject (in this case, "you"), it introduces a subjunctive or hypothetical past tense verb to express a present or future wish: "I would rather you completed...".',
    difficulty: 'Hard'
  },

  // ==========================================
  // MATHEMATICS (12 Unique High-Yield Questions)
  // ==========================================
  {
    id: 'mth-1',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Indices & Logarithms',
    examType: 'JAMB',
    year: 2026,
    question: 'If log₁₀ 2 = 0.3010 and log₁₀ 3 = 0.4771, calculate the value of log₁₀ 18 without using log tables.',
    options: {
      A: '1.2552',
      B: '0.7781',
      C: '1.4313',
      D: '0.9542'
    },
    correctOption: 'A',
    explanation: 'Step 1: Factorize 18 = 2 × 3² = 2 × 9.\nStep 2: Apply log laws: log₁₀(18) = log₁₀(2 × 3²) = log₁₀ 2 + 2(log₁₀ 3).\nStep 3: Substitute values: 0.3010 + 2(0.4771) = 0.3010 + 0.9542 = 1.2552.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-2',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Algebra & Linear Equations',
    examType: 'JAMB',
    year: 2026,
    question: 'Find the roots of the quadratic equation 2x² - 5x - 3 = 0.',
    options: {
      A: 'x = 3, x = -1/2',
      B: 'x = -3, x = 1/2',
      C: 'x = 2, x = -3/2',
      D: 'x = 1, x = -3'
    },
    correctOption: 'A',
    explanation: 'Factorize 2x² - 5x - 3 = 0: Product = 2 × (-3) = -6, Sum = -5.\nThe two numbers are -6 and +1.\nRewrite: 2x² - 6x + x - 3 = 0 => 2x(x - 3) + 1(x - 3) = 0 => (2x + 1)(x - 3) = 0.\nTherefore, x = 3 or x = -1/2.',
    difficulty: 'Easy'
  },
  {
    id: 'mth-3',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Calculus (Differentiation & Integration)',
    examType: 'JAMB',
    year: 2025,
    question: 'Differentiate y = 3x⁴ - 5x² + 7x - 9 with respect to x.',
    options: {
      A: '12x³ - 10x + 7',
      B: '12x³ - 5x + 7',
      C: '7x³ - 10x',
      D: '12x⁴ - 10x² + 7'
    },
    correctOption: 'A',
    explanation: 'Apply the power rule d/dx(axⁿ) = a·n·xⁿ⁻¹ term by term:\n• d/dx(3x⁴) = 3 × 4x³ = 12x³\n• d/dx(-5x²) = -5 × 2x = -10x\n• d/dx(7x) = 7\n• d/dx(-9) = 0\nResult: dy/dx = 12x³ - 10x + 7.',
    difficulty: 'Easy'
  },
  {
    id: 'mth-4',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Trigonometry',
    examType: 'WAEC',
    year: 2026,
    question: 'If sin θ = 3/5 and θ is an acute angle, find the exact value of tan θ + cos θ.',
    options: {
      A: '31/20',
      B: '7/5',
      C: '19/15',
      D: '23/20'
    },
    correctOption: 'A',
    explanation: 'In a right-angled triangle with Opposite = 3 and Hypotenuse = 5:\nAdjacent = √(5² - 3²) = √(25 - 9) = √16 = 4.\n• cos θ = Adjacent / Hypotenuse = 4/5\n• tan θ = Opposite / Adjacent = 3/4\nTherefore, tan θ + cos θ = 3/4 + 4/5 = (15 + 16)/20 = 31/20.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-5',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Statistics & Probability',
    examType: 'JAMB',
    year: 2026,
    question: 'A fair die is rolled twice. What is the probability of obtaining a total score of 7?',
    options: {
      A: '1/6',
      B: '1/12',
      C: '5/36',
      D: '7/36'
    },
    correctOption: 'A',
    explanation: 'Total possible outcomes when rolling two dice = 6 × 6 = 36.\nOutcomes yielding a sum of 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 favorable outcomes.\nProbability = 6 / 36 = 1/6.',
    difficulty: 'Easy'
  },
  {
    id: 'mth-6',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Calculus (Differentiation & Integration)',
    examType: 'WAEC',
    year: 2025,
    question: 'Evaluate the definite integral ∫ (from 0 to 2) (3x² + 2x) dx.',
    options: {
      A: '12',
      B: '10',
      C: '14',
      D: '16'
    },
    correctOption: 'A',
    explanation: 'Integration rule: ∫ 3x² dx = x³, ∫ 2x dx = x².\nAntiderivative F(x) = [x³ + x²] from 0 to 2.\nF(2) = 2³ + 2² = 8 + 4 = 12.\nF(0) = 0³ + 0² = 0.\nResult = 12 - 0 = 12.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-7',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Algebra & Linear Equations',
    examType: 'JAMB',
    year: 2026,
    question: 'The 3rd and 7th terms of an Arithmetic Progression (A.P.) are 11 and 27 respectively. Find the first term (a) and common difference (d).',
    options: {
      A: 'a = 3, d = 4',
      B: 'a = 4, d = 3',
      C: 'a = 2, d = 5',
      D: 'a = 5, d = 4'
    },
    correctOption: 'A',
    explanation: 'Formula for nth term: Tₙ = a + (n - 1)d.\n• T₃ = a + 2d = 11  (Equation 1)\n• T₇ = a + 6d = 27  (Equation 2)\nSubtract Eq 1 from Eq 2: 4d = 16 => d = 4.\nSubstitute d = 4 into Eq 1: a + 2(4) = 11 => a + 8 = 11 => a = 3.\nTherefore, a = 3 and d = 4.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-8',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Geometry & Mensuration',
    examType: 'WAEC',
    year: 2026,
    question: 'Find the total surface area of a solid cylinder of radius 7cm and height 10cm. (Take π = 22/7)',
    options: {
      A: '748 cm²',
      B: '440 cm²',
      C: '616 cm²',
      D: '880 cm²'
    },
    correctOption: 'A',
    explanation: 'Total surface area of a closed solid cylinder = 2πr(r + h).\nSubstitute: 2 × (22/7) × 7 × (7 + 10) = 2 × 22 × 17 = 44 × 17 = 748 cm².',
    difficulty: 'Medium'
  },
  {
    id: 'mth-9',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Indices & Logarithms',
    examType: 'JAMB',
    year: 2025,
    question: 'Solve for x in the exponential equation: 3^(2x + 1) = 243.',
    options: {
      A: '2',
      B: '3',
      C: '4',
      D: '5/2'
    },
    correctOption: 'A',
    explanation: 'Express 243 as a power of 3: 3⁵ = 243.\nEquation becomes: 3^(2x + 1) = 3⁵.\nEquate exponents: 2x + 1 = 5 => 2x = 4 => x = 2.',
    difficulty: 'Easy'
  },
  {
    id: 'mth-10',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Statistics & Probability',
    examType: 'JAMB',
    year: 2026,
    question: 'The mean of the numbers 4, 7, x, 12, 15 is 10. Find the value of x and the median of the set.',
    options: {
      A: 'x = 12, Median = 12',
      B: 'x = 12, Median = 10',
      C: 'x = 14, Median = 12',
      D: 'x = 10, Median = 10'
    },
    correctOption: 'A',
    explanation: 'Sum of 5 numbers = Mean × 5 = 10 × 5 = 50.\n4 + 7 + x + 12 + 15 = 50 => 38 + x = 50 => x = 12.\nArrange in ascending order: 4, 7, 12, 12, 15.\nThe middle term (3rd number) is 12. So both x = 12 and Median = 12.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-11',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Algebra & Linear Equations',
    examType: 'WAEC',
    year: 2025,
    question: 'In a class of 40 students, 25 offer Physics and 20 offer Chemistry. If each student offers at least one of the subjects, how many offer both?',
    options: {
      A: '5',
      B: '10',
      C: '15',
      D: '8'
    },
    correctOption: 'A',
    explanation: 'Using set notation: n(P ∪ C) = n(P) + n(C) - n(P ∩ C).\n40 = 25 + 20 - n(P ∩ C) => 40 = 45 - n(P ∩ C).\nn(P ∩ C) = 45 - 40 = 5 students offer both subjects.',
    difficulty: 'Easy'
  },
  {
    id: 'mth-12',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Geometry & Mensuration',
    examType: 'JAMB',
    year: 2026,
    question: 'Calculate the length of the diagonal of a square whose perimeter is 32 cm.',
    options: {
      A: '8√2 cm',
      B: '16 cm',
      C: '4√2 cm',
      D: '8 cm'
    },
    correctOption: 'A',
    explanation: 'Perimeter of square = 4s = 32 cm => side s = 8 cm.\nBy Pythagoras theorem, diagonal d = √(s² + s²) = √(8² + 8²) = √(64 + 64) = √128 = 8√2 cm.',
    difficulty: 'Medium'
  },

  // ==========================================
  // BIOLOGY (12 Unique High-Yield Questions)
  // ==========================================
  {
    id: 'bio-1',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Cell Biology & Organization',
    examType: 'JAMB',
    year: 2026,
    question: 'Which of the following cellular organelles is primarily responsible for synthesizing adenosine triphosphate (ATP) during aerobic respiration?',
    options: {
      A: 'Mitochondrion',
      B: 'Golgi apparatus',
      C: 'Ribosome',
      D: 'Endoplasmic reticulum'
    },
    correctOption: 'A',
    explanation: 'The mitochondrion is the "powerhouse of the cell" where the Krebs cycle and oxidative phosphorylation take place, generating the vast majority of cellular ATP.',
    difficulty: 'Easy'
  },
  {
    id: 'bio-2',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Genetics & Heredity',
    examType: 'JAMB',
    year: 2026,
    question: 'In human ABO blood grouping, if a heterozygous blood group A father (I^A I^O) marries a blood group O mother (I^O I^O), what is the probability of their offspring having blood group O?',
    options: {
      A: '50%',
      B: '25%',
      C: '75%',
      D: '0%'
    },
    correctOption: 'A',
    explanation: 'Parental gametes: Father produces I^A and I^O. Mother produces only I^O.\nCross offspring: 50% I^A I^O (Type A) and 50% I^O I^O (Type O). Thus, probability is 50% (or 1/2).',
    difficulty: 'Medium'
  },
  {
    id: 'bio-3',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Ecology & Ecosystems',
    examType: 'WAEC',
    year: 2025,
    question: 'Which of the following ecological associations illustrates mutualism?',
    options: {
      A: 'Root nodules of leguminous plants and Rhizobium bacteria',
      B: 'Tapeworm residing in the human intestine',
      C: 'Epiphytic orchid growing upon the bark of a high tree',
      D: 'Tick attached to a cow’s skin'
    },
    correctOption: 'A',
    explanation: 'Mutualism is an obligate association where both species benefit. Rhizobium fixes atmospheric nitrogen into nitrates for the plant, while the plant provides carbohydrates and protective shelter to the bacteria.',
    difficulty: 'Easy'
  },
  {
    id: 'bio-4',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Nutrition & Digestion',
    examType: 'JAMB',
    year: 2026,
    question: 'Which digestive enzyme functions optimally in an acidic pH of 1.5 to 2.0 inside the mammalian stomach?',
    options: {
      A: 'Pepsin',
      B: 'Ptyalin (Salivary Amylase)',
      C: 'Trypsin',
      D: 'Pancreatic Lipase'
    },
    correctOption: 'A',
    explanation: 'Pepsin is secreted as inactive pepsinogen by chief cells in the gastric lining and activated by hydrochloric acid (HCl). It functions optimally in strongly acidic medium (pH 1.5 - 2.0) to hydrolyze proteins into peptones.',
    difficulty: 'Easy'
  },
  {
    id: 'bio-5',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Excretory & Circulatory Systems',
    examType: 'JAMB',
    year: 2026,
    question: 'In the mammalian nephron, ultrafiltration of blood plasma takes place across which structural boundary?',
    options: {
      A: 'Glomerulus into Bowman’s capsule',
      B: 'Loop of Henle into Collecting duct',
      C: 'Distal convoluted tubule into Pelvis',
      D: 'Proximal tubule into Peritubular capillaries'
    },
    correctOption: 'A',
    explanation: 'High hydrostatic pressure in the afferent arteriole forces plasma through the endothelial fenestrations and podocytes of the glomerulus into the lumen of Bowman’s capsule to form glomerular filtrate.',
    difficulty: 'Medium'
  },
  {
    id: 'bio-6',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Reproduction in Plants & Animals',
    examType: 'WAEC',
    year: 2026,
    question: 'Double fertilization in angiosperms produces which two distinct structures?',
    options: {
      A: 'Diploid zygote (2n) and triploid endosperm (3n)',
      B: 'Haploid spore and diploid embryo',
      C: 'Triploid cotyledon and haploid ovule',
      D: 'Diploid fruit and haploid seed'
    },
    correctOption: 'A',
    explanation: 'One male sperm nucleus (n) fuses with the female egg cell (n) to form the diploid zygote (2n), while the second male gamete (n) fuses with the diploid secondary central nucleus (2n) to form the triploid endosperm (3n).',
    difficulty: 'Hard'
  },
  {
    id: 'bio-7',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Excretory & Circulatory Systems',
    examType: 'JAMB',
    year: 2025,
    question: 'Which chamber of the human heart pumps oxygenated blood under maximum pressure into the systemic aorta?',
    options: {
      A: 'Left ventricle',
      B: 'Right ventricle',
      C: 'Left atrium',
      D: 'Right atrium'
    },
    correctOption: 'A',
    explanation: 'The left ventricle has the thickest muscular myocardium because it must generate sufficient contractile pressure to propel oxygenated blood through the aorta to all organ systems throughout the body.',
    difficulty: 'Easy'
  },
  {
    id: 'bio-8',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Genetics & Heredity',
    examType: 'WAEC',
    year: 2026,
    question: 'If two heterozygous tall pea plants (Tt) are crossed, what is the expected phenotypic ratio of tall to dwarf offspring?',
    options: {
      A: '3 tall : 1 dwarf',
      B: '1 tall : 2 intermediate : 1 dwarf',
      C: '1 tall : 1 dwarf',
      D: 'All tall'
    },
    correctOption: 'A',
    explanation: 'Mendelian monohybrid cross of Tt × Tt yields genotypic ratio: 1 TT : 2 Tt : 1 tt. Because T is completely dominant over t, TT and Tt are tall (3/4 = 75%) and tt is dwarf (1/4 = 25%), giving the classic 3:1 phenotypic ratio.',
    difficulty: 'Easy'
  },
  {
    id: 'bio-9',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Cell Biology & Organization',
    examType: 'JAMB',
    year: 2026,
    question: 'During which stage of mitosis do sister chromatids separate and migrate toward opposite poles of the spindle fiber?',
    options: {
      A: 'Anaphase',
      B: 'Metaphase',
      C: 'Prophase',
      D: 'Telophase'
    },
    correctOption: 'A',
    explanation: 'In Anaphase, the centromeres split and spindle fibers pull sister chromatids apart toward opposite centrosome poles. In Metaphase, chromosomes align on the equator.',
    difficulty: 'Medium'
  },
  {
    id: 'bio-10',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Ecology & Ecosystems',
    examType: 'WAEC',
    year: 2025,
    question: 'A primary consumer in a typical African savanna food chain is best represented by which organism?',
    options: {
      A: 'Zebra feeding on grass',
      B: 'Lion preying on zebra',
      C: 'Vulture scavenging lion carcass',
      D: 'Acacia tree capturing sunlight'
    },
    correctOption: 'A',
    explanation: 'The acacia tree is the primary producer. Herbivores that feed directly on producers (such as zebras eating grass) occupy the second trophic level and are termed primary consumers.',
    difficulty: 'Easy'
  },
  {
    id: 'bio-11',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Nutrition & Digestion',
    examType: 'JAMB',
    year: 2026,
    question: 'Bile is synthesized in the liver and stored in the gall bladder. What is its principal digestive function?',
    options: {
      A: 'Emulsification of fats into small droplets to increase surface area',
      B: 'Chemical breakdown of starch into maltose',
      C: 'Denaturation of proteins into amino acids',
      D: 'Absorption of water in the large intestine'
    },
    correctOption: 'A',
    explanation: 'Bile contains bile salts (sodium glycocholate and taurocholate) that emulsify large fat globules into minute droplets, vastly increasing the surface area for pancreatic lipase enzymes to act upon.',
    difficulty: 'Medium'
  },
  {
    id: 'bio-12',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Cell Biology & Organization',
    examType: 'JAMB',
    year: 2026,
    question: 'Plant cells placed in a concentrated hypertonic sucrose solution undergo which physiological phenomenon?',
    options: {
      A: 'Plasmolysis (cytoplasm shrinks away from cell wall)',
      B: 'Hemolysis (cell membrane bursts)',
      C: 'Turgidity (vacuole expands to maximum firmness)',
      D: 'Deplasmolysis'
    },
    correctOption: 'A',
    explanation: 'In a hypertonic solution, water exits the plant cell vacuole via exosmosis down the water potential gradient. The protoplast contracts and pulls away from the rigid cellulose cell wall—a condition known as plasmolysis.',
    difficulty: 'Medium'
  },

  // ==========================================
  // CHEMISTRY (12 Unique High-Yield Questions)
  // ==========================================
  {
    id: 'chm-1',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Atomic Structure & Periodic Table',
    examType: 'JAMB',
    year: 2026,
    question: 'What is the electronic configuration of the Fe³⁺ ion (Iron has atomic number Z = 26)?',
    options: {
      A: '[Ar] 3d⁵',
      B: '[Ar] 4s² 3d³',
      C: '[Ar] 4s¹ 3d⁵',
      D: '[Ar] 3d⁶'
    },
    correctOption: 'A',
    explanation: 'Neutral Iron (Z = 26) ground state is [Ar] 4s² 3d⁶. When ionizing, electrons are removed first from the outermost 4s orbital (losing 2 electrons), then one electron from the 3d orbital. Thus, Fe³⁺ has configuration [Ar] 3d⁵ (a stable half-filled d-subshell).',
    difficulty: 'Hard'
  },
  {
    id: 'chm-2',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Chemical Bonding & Stoichiometry',
    examType: 'JAMB',
    year: 2026,
    question: 'Calculate the volume of carbon(IV) oxide (CO₂) evolved at standard temperature and pressure (s.t.p) when 10.0g of pure CaCO₃ is completely decomposed by heat. (Ca = 40, C = 12, O = 16, Molar volume at s.t.p = 22.4 dm³)',
    options: {
      A: '2.24 dm³',
      B: '4.48 dm³',
      C: '1.12 dm³',
      D: '22.4 dm³'
    },
    correctOption: 'A',
    explanation: 'Reaction: CaCO₃(s) -> CaO(s) + CO₂(g).\nMolar mass of CaCO₃ = 40 + 12 + (3 × 16) = 100 g/mol.\nMoles of CaCO₃ = 10.0g / 100g/mol = 0.10 mol.\nFrom stoichiometry, 1 mole CaCO₃ yields 1 mole CO₂. Thus 0.10 mol CaCO₃ yields 0.10 mol CO₂.\nVolume at s.t.p = 0.10 mol × 22.4 dm³/mol = 2.24 dm³.',
    difficulty: 'Medium'
  },
  {
    id: 'chm-3',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Electrochemistry',
    examType: 'WAEC',
    year: 2025,
    question: 'According to Faraday’s First Law of Electrolysis, the mass (m) of a substance liberated at an electrode is directly proportional to what?',
    options: {
      A: 'Quantity of electricity (Q = I × t) passed through the electrolyte',
      B: 'Resistance of the electrolytic cell',
      C: 'Concentration of the anion',
      D: 'Temperature of the solution'
    },
    correctOption: 'A',
    explanation: 'Faraday’s First Law states: m = Z · Q = Z · I · t, where m is mass liberated, Z is electrochemical equivalent, I is current in amperes, and t is time in seconds. Mass is directly proportional to electrical charge Q.',
    difficulty: 'Easy'
  },
  {
    id: 'chm-4',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Acids, Bases & Salts',
    examType: 'JAMB',
    year: 2026,
    question: 'What is the pH of a 0.001 mol/dm³ aqueous solution of hydrochloric acid (HCl)?',
    options: {
      A: '3.0',
      B: '1.0',
      C: '11.0',
      D: '7.0'
    },
    correctOption: 'A',
    explanation: 'HCl is a strong monoprotic acid that dissociates completely: [H⁺] = 0.001 mol/dm³ = 10⁻³ mol/dm³.\npH = -log₁₀[H⁺] = -log₁₀(10⁻³) = 3.0.',
    difficulty: 'Easy'
  },
  {
    id: 'chm-5',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Organic Chemistry (Hydrocarbons)',
    examType: 'JAMB',
    year: 2026,
    question: 'What is the correct IUPAC systematic name for the compound CH₃-CH(CH₃)-CH₂-CH=CH₂?',
    options: {
      A: '4-methylpent-1-ene',
      B: '2-methylpent-4-ene',
      C: '2-methylpent-1-ene',
      D: '4-methylpent-2-ene'
    },
    correctOption: 'A',
    explanation: 'Rules of IUPAC nomenclature: The principal functional group is the alkene double bond, which must receive the lowest possible locant number. Numbering from right to left gives the double bond at carbon 1. The methyl branch is then at carbon 4. Hence: 4-methylpent-1-ene.',
    difficulty: 'Medium'
  },
  {
    id: 'chm-6',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Chemical Kinetics & Equilibrium',
    examType: 'WAEC',
    year: 2025,
    question: 'For the exothermic equilibrium reaction: N₂(g) + 3H₂(g) ⇌ 2NH₃(g), ΔH = -92 kJ/mol. According to Le Chatelier’s principle, which condition increases the yield of ammonia (NH₃)?',
    options: {
      A: 'Increasing pressure and decreasing temperature',
      B: 'Decreasing pressure and increasing temperature',
      C: 'Adding a catalyst and decreasing pressure',
      D: 'Increasing temperature at constant pressure'
    },
    correctOption: 'A',
    explanation: '1. Pressure: Reactant side has 4 moles of gas, product side has 2 moles. Increasing pressure shifts equilibrium toward fewer gas molecules (forward to NH₃).\n2. Temperature: The forward reaction is exothermic (releases heat). Decreasing temperature favors the exothermic direction to produce more NH₃.',
    difficulty: 'Hard'
  },
  {
    id: 'chm-7',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Organic Chemistry (Hydrocarbons)',
    examType: 'JAMB',
    year: 2026,
    question: 'Ethanol is dehydrated by heating with excess concentrated tetraoxosulphate(VI) acid (H₂SO₄) at 170°C. What is the major organic product?',
    options: {
      A: 'Ethene (C₂H₄)',
      B: 'Ethoxyethane (Diethyl ether)',
      C: 'Ethanoic acid',
      D: 'Ethane'
    },
    correctOption: 'A',
    explanation: 'At 170°C with excess conc. H₂SO₄, intermolecular elimination yields ethene: C₂H₅OH -> C₂H₄ + H₂O. (Note: at the lower temperature of 140°C with excess ethanol, diethyl ether is produced instead).',
    difficulty: 'Medium'
  },
  {
    id: 'chm-8',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Atomic Structure & Periodic Table',
    examType: 'WAEC',
    year: 2026,
    question: 'Across a period from left to right in the modern Periodic Table, what happens to atomic radius and electronegativity?',
    options: {
      A: 'Atomic radius decreases while electronegativity increases',
      B: 'Both atomic radius and electronegativity increase',
      C: 'Atomic radius increases while electronegativity decreases',
      D: 'Both atomic radius and electronegativity decrease'
    },
    correctOption: 'A',
    explanation: 'Across a period, nuclear charge (number of protons) increases while electrons are added to the same main energy shell. The increased effective nuclear pull draws outer electrons closer, decreasing atomic radius and increasing electronegativity.',
    difficulty: 'Easy'
  },
  {
    id: 'chm-9',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Electrochemistry',
    examType: 'JAMB',
    year: 2026,
    question: 'During the industrial electrolysis of concentrated aqueous sodium chloride (brine) using inert carbon electrodes, which gases are liberated at the anode and cathode respectively?',
    options: {
      A: 'Chlorine (anode) and Hydrogen (cathode)',
      B: 'Oxygen (anode) and Sodium (cathode)',
      C: 'Hydrogen (anode) and Chlorine (cathode)',
      D: 'Oxygen (anode) and Hydrogen (cathode)'
    },
    correctOption: 'A',
    explanation: 'Due to concentration effect, Cl⁻ ions are preferentially discharged over OH⁻ at the anode yielding Chlorine gas (Cl₂). At the cathode, H⁺ ions are discharged more readily than Na⁺ due to lower discharge potential, liberating Hydrogen gas (H₂).',
    difficulty: 'Hard'
  },
  {
    id: 'chm-10',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Chemical Bonding & Stoichiometry',
    examType: 'WAEC',
    year: 2025,
    question: 'What type of chemical bond is formed when an unshared lone pair of electrons from ammonia (NH₃) is donated to a hydrogen ion (H⁺) to form an ammonium ion (NH₄⁺)?',
    options: {
      A: 'Coordinate covalent (Dative) bond',
      B: 'Ionic bond',
      C: 'Hydrogen bond',
      D: 'Metallic bond'
    },
    correctOption: 'A',
    explanation: 'A coordinate covalent (dative) bond occurs when both bonding electrons shared between two atoms originate entirely from one of the participating atoms (here, the lone pair on Nitrogen in NH₃).',
    difficulty: 'Easy'
  },
  {
    id: 'chm-11',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Acids, Bases & Salts',
    examType: 'JAMB',
    year: 2026,
    question: 'Which of the following salts dissolves in water to produce an alkaline (basic) solution with pH > 7?',
    options: {
      A: 'Sodium trioxocarbonate(IV) (Na₂CO₃)',
      B: 'Ammonium chloride (NH₄Cl)',
      C: 'Sodium chloride (NaCl)',
      D: 'Aluminium sulphate (Al₂(SO₄)₃)'
    },
    correctOption: 'A',
    explanation: 'Na₂CO₃ is formed from a strong base (NaOH) and a weak acid (H₂CO₃). The carbonate anion hydrolyzes in water: CO₃²⁻ + H₂O ⇌ HCO₃⁻ + OH⁻, producing excess OH⁻ ions which turns the solution alkaline.',
    difficulty: 'Medium'
  },
  {
    id: 'chm-12',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Chemical Kinetics & Equilibrium',
    examType: 'JAMB',
    year: 2026,
    question: 'A catalyst increases the rate of a chemical reaction primarily by doing what?',
    options: {
      A: 'Lowering the activation energy of the reaction pathway',
      B: 'Increasing the enthalpy change (ΔH) of the reaction',
      C: 'Shifting the equilibrium position toward products',
      D: 'Increasing the kinetic energy of reactant particles'
    },
    correctOption: 'A',
    explanation: 'A catalyst provides an alternative reaction pathway with a lower activation energy (Ea), allowing a greater fraction of colliding molecules to possess sufficient threshold energy for successful reaction. It does not alter ΔH or equilibrium constant K.',
    difficulty: 'Easy'
  },

  // ==========================================
  // PHYSICS (12 Unique High-Yield Questions)
  // ==========================================
  {
    id: 'phy-1',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Mechanics & Newton Laws',
    examType: 'JAMB',
    year: 2026,
    question: 'A body of mass 5kg moving with a velocity of 10m/s collides with a stationary body of mass 15kg. If they stick together after collision, what is their common velocity?',
    options: {
      A: '2.5 m/s',
      B: '5.0 m/s',
      C: '3.3 m/s',
      D: '1.25 m/s'
    },
    correctOption: 'A',
    explanation: 'Conservation of linear momentum: m₁u₁ + m₂u₂ = (m₁ + m₂)v.\n(5 × 10) + (15 × 0) = (5 + 15)v => 50 = 20v => v = 50 / 20 = 2.5 m/s.',
    difficulty: 'Medium'
  },
  {
    id: 'phy-2',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Current Electricity & Circuits',
    examType: 'JAMB',
    year: 2026,
    question: 'Three resistors of resistances 2Ω, 3Ω, and 6Ω are connected in parallel. Calculate their combined equivalent resistance.',
    options: {
      A: '1.0 Ω',
      B: '11.0 Ω',
      C: '0.5 Ω',
      D: '2.0 Ω'
    },
    correctOption: 'A',
    explanation: 'Formula for resistors in parallel: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃.\n1/R_total = 1/2 + 1/3 + 1/6 = (3 + 2 + 1) / 6 = 6/6 = 1 Ω⁻¹.\nTherefore, R_total = 1.0 Ω.',
    difficulty: 'Easy'
  },
  {
    id: 'phy-3',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Waves, Sound & Optics',
    examType: 'WAEC',
    year: 2025,
    question: 'A ray of light traveling in air strikes a glass block of refractive index 1.50 at an angle of incidence of 30°. What is the sine of the angle of refraction (sin r)?',
    options: {
      A: '0.333',
      B: '0.750',
      C: '0.500',
      D: '0.866'
    },
    correctOption: 'A',
    explanation: 'Snell’s Law: n = sin i / sin r => sin r = sin i / n.\nsin 30° = 0.50. Refractive index n = 1.50.\nsin r = 0.50 / 1.50 = 1/3 ≈ 0.333.',
    difficulty: 'Medium'
  },
  {
    id: 'phy-4',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Work, Energy & Power',
    examType: 'JAMB',
    year: 2026,
    question: 'A crane lifts a 400kg load vertically through a height of 15m in 30 seconds. Calculate the useful power output of the crane. (Take g = 10 m/s²)',
    options: {
      A: '2,000 W',
      B: '60,000 W',
      C: '1,200 W',
      D: '3,000 W'
    },
    correctOption: 'A',
    explanation: 'Work done = m · g · h = 400 kg × 10 m/s² × 15 m = 60,000 Joules.\nPower = Work done / time = 60,000 J / 30 s = 2,000 Watts (or 2 kW).',
    difficulty: 'Easy'
  },
  {
    id: 'phy-5',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Heat Energy & Gas Laws',
    examType: 'JAMB',
    year: 2026,
    question: 'A fixed mass of ideal gas occupies a volume of 300 cm³ at 27°C. What volume will it occupy at 127°C if the pressure remains constant?',
    options: {
      A: '400 cm³',
      B: '1,411 cm³',
      C: '225 cm³',
      D: '350 cm³'
    },
    correctOption: 'A',
    explanation: 'Charles’s Law: V₁ / T₁ = V₂ / T₂, where temperatures must be in Kelvin.\n• T₁ = 27 + 273 = 300 K\n• T₂ = 127 + 273 = 400 K\n300 / 300 = V₂ / 400 => 1 = V₂ / 400 => V₂ = 400 cm³.',
    difficulty: 'Medium'
  },
  {
    id: 'phy-6',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Waves, Sound & Optics',
    examType: 'WAEC',
    year: 2026,
    question: 'The frequency of a sound wave is 500 Hz and its wavelength is 0.68m. How far does the wave travel in 2.5 seconds?',
    options: {
      A: '850 m',
      B: '340 m',
      C: '1,360 m',
      D: '680 m'
    },
    correctOption: 'A',
    explanation: 'Wave speed v = f × λ = 500 Hz × 0.68 m = 340 m/s.\nDistance traveled = speed × time = 340 m/s × 2.5 s = 850 meters.',
    difficulty: 'Medium'
  },
  {
    id: 'phy-7',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Mechanics & Newton Laws',
    examType: 'JAMB',
    year: 2025,
    question: 'A projectile is launched from ground level with an initial velocity of 50 m/s at an angle of 30° to the horizontal. Calculate its maximum vertical height. (Take g = 10 m/s²)',
    options: {
      A: '31.25 m',
      B: '62.50 m',
      C: '125.0 m',
      D: '15.60 m'
    },
    correctOption: 'A',
    explanation: 'Maximum height H = (u² · sin² θ) / (2g).\nu = 50 m/s, θ = 30° => sin 30° = 0.5.\nu · sin θ = 50 × 0.5 = 25 m/s.\nH = (25)² / (2 × 10) = 625 / 20 = 31.25 meters.',
    difficulty: 'Medium'
  },
  {
    id: 'phy-8',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Modern Physics & Radioactivity',
    examType: 'JAMB',
    year: 2026,
    question: 'A radioactive isotope has a half-life of 4 days. If the initial sample mass is 80g, what mass of the isotope remains undecayed after 16 days?',
    options: {
      A: '5 g',
      B: '10 g',
      C: '2.5 g',
      D: '20 g'
    },
    correctOption: 'A',
    explanation: 'Number of half-lives elapsed n = Total time / Half-life = 16 days / 4 days = 4 half-lives.\nRemaining mass = Initial mass / 2ⁿ = 80g / 2⁴ = 80g / 16 = 5 grams.',
    difficulty: 'Easy'
  },
  {
    id: 'phy-9',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Current Electricity & Circuits',
    examType: 'WAEC',
    year: 2026,
    question: 'A 240V electric heater draws a steady current of 5A for 2 hours. How much electrical energy is consumed in kilowatt-hours (kWh)?',
    options: {
      A: '2.4 kWh',
      B: '1.2 kWh',
      C: '4.8 kWh',
      D: '0.6 kWh'
    },
    correctOption: 'A',
    explanation: 'Power = Voltage × Current = 240V × 5A = 1,200 Watts = 1.2 kW.\nEnergy consumed in kWh = Power (kW) × Time (hours) = 1.2 kW × 2 h = 2.4 kWh.',
    difficulty: 'Easy'
  },
  {
    id: 'phy-10',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Mechanics & Newton Laws',
    examType: 'JAMB',
    year: 2026,
    question: 'A simple pendulum has a period of 2.0 seconds. If its length is multiplied by 4, what will be its new period of oscillation?',
    options: {
      A: '4.0 seconds',
      B: '8.0 seconds',
      C: '1.0 second',
      D: '2.0 seconds'
    },
    correctOption: 'A',
    explanation: 'Period of a simple pendulum: T = 2π√(L / g).\nT is directly proportional to √L.\nIf L becomes 4L, new period T’ = 2π√(4L / g) = 2 × (2π√(L/g)) = 2 × 2.0s = 4.0 seconds.',
    difficulty: 'Easy'
  },
  {
    id: 'phy-11',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Heat Energy & Gas Laws',
    examType: 'WAEC',
    year: 2025,
    question: 'How much thermal energy is required to heat 2.0 kg of water from 20°C to 70°C? (Specific heat capacity of water c = 4,200 J/(kg·K))',
    options: {
      A: '420,000 J',
      B: '210,000 J',
      C: '840,000 J',
      D: '588,000 J'
    },
    correctOption: 'A',
    explanation: 'Formula: Q = m · c · Δθ.\nm = 2.0 kg, c = 4,200 J/(kg·K), Δθ = 70°C - 20°C = 50 K.\nQ = 2.0 × 4,200 × 50 = 420,000 Joules (or 420 kJ).',
    difficulty: 'Easy'
  },
  {
    id: 'phy-12',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Waves, Sound & Optics',
    examType: 'JAMB',
    year: 2026,
    question: 'Which electromagnetic radiation possesses the highest photon energy and highest frequency in the electromagnetic spectrum?',
    options: {
      A: 'Gamma rays',
      B: 'X-rays',
      C: 'Ultraviolet rays',
      D: 'Radio waves'
    },
    correctOption: 'A',
    explanation: 'According to Planck’s relation E = h·f, photon energy is proportional to frequency. Gamma rays have the highest frequency (>10¹⁹ Hz) and shortest wavelength (<10⁻¹² m) of all electromagnetic waves.',
    difficulty: 'Easy'
  },

  // ==========================================
  // ECONOMICS (12 Unique High-Yield Questions)
  // ==========================================
  {
    id: 'eco-1',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Price Theory: Demand & Supply',
    examType: 'JAMB',
    year: 2026,
    question: 'When the price of a commodity increases from ₦100 to ₦120, the quantity demanded falls from 500 units to 400 units. Calculate the price elasticity of demand (PED).',
    options: {
      A: '1.0 (Unitary Elastic)',
      B: '0.5 (Inelastic)',
      C: '2.0 (Elastic)',
      D: '1.5 (Elastic)'
    },
    correctOption: 'A',
    explanation: '% Change in Quantity = [(400 - 500) / 500] × 100 = -20%.\n% Change in Price = [(120 - 100) / 100] × 100 = +20%.\nPrice Elasticity of Demand (absolute value) = |-20% / 20%| = 1.0 (Unitary elasticity).',
    difficulty: 'Medium'
  },
  {
    id: 'eco-2',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Money, Banking & Monetary Policy',
    examType: 'JAMB',
    year: 2026,
    question: 'Which monetary policy instrument is deployed by the Central Bank of Nigeria (CBN) to control inflation by reducing excess commercial bank liquidity?',
    options: {
      A: 'Selling government treasury securities through Open Market Operations (OMO)',
      B: 'Lowering the Cash Reserve Ratio (CRR)',
      C: 'Reducing the Monetary Policy Rate (MPR)',
      D: 'Printing fresh currency notes'
    },
    correctOption: 'A',
    explanation: 'To combat demand-pull inflation, the CBN implements contractionary monetary policy. By selling Treasury bills (OMO), commercial banks exchange cash reserves for securities, curtailing their ability to create credit and reducing money supply.',
    difficulty: 'Hard'
  },
  {
    id: 'eco-3',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Basic Economic Concepts & Scarcity',
    examType: 'WAEC',
    year: 2025,
    question: 'The fundamental economic problem that faces every society is the problem of:',
    options: {
      A: 'Scarcity of resources relative to unlimited human wants',
      B: 'Excessive national population growth',
      C: 'Shortage of foreign exchange reserves',
      D: 'Inadequate commercial banks'
    },
    correctOption: 'A',
    explanation: 'Scarcity is the bedrock of economics: human wants are unlimited, but the economic resources (land, labor, capital, entrepreneurship) required to satisfy them are finite and scarce, necessitating scale of preference and choice.',
    difficulty: 'Easy'
  },
  {
    id: 'eco-4',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'National Income Accounting',
    examType: 'JAMB',
    year: 2026,
    question: 'Gross National Product (GNP) is derived from Gross Domestic Product (GDP) by adding what component?',
    options: {
      A: 'Net Factor Income from Abroad (NFIA)',
      B: 'Capital consumption allowance (Depreciation)',
      C: 'Indirect business taxes',
      D: 'Subsidies'
    },
    correctOption: 'A',
    explanation: 'GNP measures output produced by citizens of a nation regardless of geographic location. Thus: GNP = GDP + Net Property/Factor Income from Abroad (earnings of citizens abroad minus earnings of foreigners domestically).',
    difficulty: 'Medium'
  },
  {
    id: 'eco-5',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Theory of Consumer Behavior',
    examType: 'WAEC',
    year: 2026,
    question: 'A consumer maximizes total utility when allocating income between two goods X and Y when:',
    options: {
      A: 'MUx / Px = MUy / Py',
      B: 'MUx × Px = MUy × Py',
      C: 'TUx = TUy',
      D: 'Px = Py'
    },
    correctOption: 'A',
    explanation: 'The equi-marginal utility principle states that a consumer achieves equilibrium when the marginal utility per naira spent on good X equals the marginal utility per naira spent on good Y (MUx / Px = MUy / Py).',
    difficulty: 'Medium'
  },
  {
    id: 'eco-6',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Price Theory: Demand & Supply',
    examType: 'JAMB',
    year: 2025,
    question: 'Which of the following is a classic example of joint (complementary) demand?',
    options: {
      A: 'Automobiles and petrol (fuel)',
      B: 'Butter and margarine',
      C: 'Beef and hide',
      D: 'Tea and coffee'
    },
    correctOption: 'A',
    explanation: 'Joint (complementary) demand occurs when two or more goods are demanded together to satisfy a single want. Cars and fuel are complements; without fuel, a car cannot fulfill its transportation purpose.',
    difficulty: 'Easy'
  },
  {
    id: 'eco-7',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'International Trade & ECOWAS',
    examType: 'JAMB',
    year: 2026,
    question: 'David Ricardo’s Theory of Comparative Advantage asserts that international trade is mutually beneficial if countries specialize in commodities where they have:',
    options: {
      A: 'The lowest opportunity cost of production',
      B: 'The highest absolute output per worker',
      C: 'The largest natural resource endowments',
      D: 'The strongest military protection'
    },
    correctOption: 'A',
    explanation: 'Comparative advantage is determined strictly by lower opportunity cost, not absolute cost. Even if one country is more efficient in producing everything, mutually profitable trade occurs if each specializes in the good with lower relative sacrifice.',
    difficulty: 'Hard'
  },
  {
    id: 'eco-8',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Basic Economic Concepts & Scarcity',
    examType: 'WAEC',
    year: 2026,
    question: 'A student has ₦2,000 and decides to purchase a textbook instead of a cinema ticket. The cinema ticket represents the student’s:',
    options: {
      A: 'Opportunity cost',
      B: 'Explicit cost',
      C: 'Variable cost',
      D: 'Marginal revenue'
    },
    correctOption: 'A',
    explanation: 'Opportunity cost is the real cost of an economic decision, defined as the value of the next best alternative forgone or sacrificed (here, the forgone cinema entertainment).',
    difficulty: 'Easy'
  },
  {
    id: 'eco-9',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Money, Banking & Monetary Policy',
    examType: 'JAMB',
    year: 2026,
    question: 'If the statutory Cash Reserve Ratio (CRR) is 20%, what is the maximum credit multiplier for commercial banks?',
    options: {
      A: '5',
      B: '10',
      C: '2',
      D: '0.2'
    },
    correctOption: 'A',
    explanation: 'Credit Multiplier = 1 / Cash Reserve Ratio (CRR) = 1 / 0.20 = 5. A deposit of ₦1,000 can theoretically support up to ₦5,000 in total bank credit creation.',
    difficulty: 'Medium'
  },
  {
    id: 'eco-10',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Price Theory: Demand & Supply',
    examType: 'WAEC',
    year: 2025,
    question: 'What happens to the equilibrium price and equilibrium quantity of yam tubers when severe floods destroy farmland in Nigeria?',
    options: {
      A: 'Equilibrium price rises while equilibrium quantity falls',
      B: 'Both equilibrium price and quantity increase',
      C: 'Equilibrium price falls while equilibrium quantity rises',
      D: 'Both equilibrium price and quantity decrease'
    },
    correctOption: 'A',
    explanation: 'Flood destruction causes a leftward shift of the supply curve (decrease in supply). With demand unchanged, a shortage develops at the original price, bidding the equilibrium price upward while equilibrium quantity purchased falls.',
    difficulty: 'Medium'
  },
  {
    id: 'eco-11',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'National Income Accounting',
    examType: 'JAMB',
    year: 2026,
    question: 'Cost-push inflation in an economy is caused primarily by:',
    options: {
      A: 'Persistent increases in wages, raw material prices, and production costs',
      B: 'Excessive consumer demand outpacing production',
      C: 'Over-printing of bank notes by the monetary authority',
      D: 'Budget surpluses in government finances'
    },
    correctOption: 'A',
    explanation: 'Cost-push inflation occurs when aggregate supply decreases due to escalating production costs (e.g. higher electricity tariffs, fuel price hikes, wage increases). Producers pass these heightened costs to consumers through higher retail prices.',
    difficulty: 'Medium'
  },
  {
    id: 'eco-12',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'International Trade & ECOWAS',
    examType: 'WAEC',
    year: 2026,
    question: 'A tax levied as a percentage of the declared commercial value of imported goods is known as an:',
    options: {
      A: 'Ad valorem tariff',
      B: 'Specific tariff',
      C: 'Excise duty',
      D: 'Income tax'
    },
    correctOption: 'A',
    explanation: 'An "ad valorem" tariff is calculated as a fixed percentage of the invoice value of the imported good (e.g., 20% on imported electronics), whereas a specific tariff is a fixed fee per physical unit (e.g., ₦50 per kilogram).',
    difficulty: 'Easy'
  },

  // ==========================================
  // GOVERNMENT (12 Unique High-Yield Questions)
  // ==========================================
  {
    id: 'gov-1',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Pre-colonial Systems in Nigeria',
    examType: 'JAMB',
    year: 2026,
    question: 'In the pre-colonial traditional Oyo Empire, the check against the autocratic power of the Alaafin was principally exercised by which council?',
    options: {
      A: 'Oyo Mesi (led by the Bashorun)',
      B: 'Ogboni Society',
      C: 'Are Ona Kakanfo',
      D: 'Ilari emissaries'
    },
    correctOption: 'A',
    explanation: 'The Oyo Mesi was the council of seven hereditary kingmakers led by the Bashorun. If an Alaafin ruled tyrannically, the Oyo Mesi would present him with an empty calabash or parrot eggs, compelling him to commit honorable suicide.',
    difficulty: 'Medium'
  },
  {
    id: 'gov-2',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Constitutional Development (1922-1999)',
    examType: 'JAMB',
    year: 2026,
    question: 'Which Nigerian colonial constitution introduced the elective principle for the first time in 1922, establishing four elected seats in the Legislative Council?',
    options: {
      A: 'Clifford Constitution',
      B: 'Richards Constitution',
      C: 'Macpherson Constitution',
      D: 'Lyttelton Constitution'
    },
    correctOption: 'A',
    explanation: 'Sir Hugh Clifford’s 1922 Constitution was historical for introducing the elective principle, creating 4 elected seats (3 for Lagos and 1 for Calabar), which triggered the formation of Nigeria’s first political party (Herbert Macaulay’s NNDP).',
    difficulty: 'Easy'
  },
  {
    id: 'gov-3',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Federalism in Nigeria',
    examType: 'WAEC',
    year: 2025,
    question: 'In the 1999 Constitution of the Federal Republic of Nigeria, exclusive legislative powers (such as defense, foreign affairs, and currency) are reserved strictly for the:',
    options: {
      A: 'Federal National Assembly',
      B: 'State Houses of Assembly',
      C: 'Local Government Councils',
      D: 'National Council of State'
    },
    correctOption: 'A',
    explanation: 'Items on the Exclusive Legislative List (Part 1, Second Schedule) can only be legislated on by the Federal National Assembly (Senate and House of Representatives). States can legislate on the Concurrent List, while Local Governments handle the Fourth Schedule.',
    difficulty: 'Medium'
  },
  {
    id: 'gov-4',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Constitutional Development (1922-1999)',
    examType: 'JAMB',
    year: 2026,
    question: 'Which colonial constitution first formally created a federal structure for Nigeria in 1954 by establishing regional autonomy and premiers?',
    options: {
      A: 'Lyttelton Constitution',
      B: 'Macpherson Constitution',
      C: 'Richards Constitution',
      D: 'Independence Constitution of 1960'
    },
    correctOption: 'A',
    explanation: 'Oliver Lyttelton’s 1954 Constitution created a true federal system in Nigeria, establishing autonomous Northern, Eastern, and Western regional governments with their own premiers and public services, while carving out Lagos as a federal capital territory.',
    difficulty: 'Medium'
  },
  {
    id: 'gov-5',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Pre-colonial Systems in Nigeria',
    examType: 'WAEC',
    year: 2026,
    question: 'The traditional pre-colonial political system of the Igbo society is best described as:',
    options: {
      A: 'Acephalous and segmentary republicanism',
      B: 'Highly centralized absolute monarchy',
      C: 'Theocratic feudalism',
      D: 'Oligarchic military dictatorship'
    },
    correctOption: 'A',
    explanation: 'Pre-colonial Igbo society was acephalous ("headless"—lacking a centralized king or paramount ruler). Political power was diffused through village democracies, councils of elders (Ama-ala), age grades, title holders (Ozo), and general village assemblies.',
    difficulty: 'Easy'
  },
  {
    id: 'gov-6',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Concepts of State & Sovereignty',
    examType: 'JAMB',
    year: 2025,
    question: 'The doctrine of Separation of Powers was prominently formulated by which political philosopher in his work "The Spirit of the Laws"?',
    options: {
      A: 'Baron de Montesquieu',
      B: 'John Locke',
      C: 'Thomas Hobbes',
      D: 'Jean-Jacques Rousseau'
    },
    correctOption: 'A',
    explanation: 'Baron de Montesquieu in 1748 articulated that political liberty is preserved only when the three arms of government—Legislature, Executive, and Judiciary—are separated and distinct, each exercising checks and balances over the others.',
    difficulty: 'Easy'
  },
  {
    id: 'gov-7',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Arms & Forms of Government',
    examType: 'JAMB',
    year: 2026,
    question: 'In a parliamentary system of government (such as Nigeria’s First Republic 1960-1966), the Head of Government is the:',
    options: {
      A: 'Prime Minister',
      B: 'Ceremonial President',
      C: 'Chief Justice',
      D: 'Senate President'
    },
    correctOption: 'A',
    explanation: 'In the Westminster parliamentary model, executive authority is dual: the Head of State (Governor-General or Ceremonial President) is nominal, while the real executive powers are vested in the Prime Minister (Sir Abubakar Tafawa Balewa in Nigeria’s 1st Republic).',
    difficulty: 'Medium'
  },
  {
    id: 'gov-8',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Nigerian Foreign Policy & ECOWAS',
    examType: 'WAEC',
    year: 2026,
    question: 'Nigeria’s foreign policy is constitutionally declared to be "Afrocentric". This implies that:',
    options: {
      A: 'The liberation, unity, and economic progress of Africa is the centerpiece of Nigeria’s diplomatic engagement',
      B: 'Nigeria only trades with African nations',
      C: 'Nigeria refuses diplomatic relations with Europe and America',
      D: 'Only African languages may be spoken in Nigerian embassies'
    },
    correctOption: 'A',
    explanation: 'Since independence, Nigerian foreign policy has held Africa as its centerpiece: championing anti-apartheid struggles in South Africa, spearheading ECOMOG peacekeeping in Liberia and Sierra Leone, and founding ECOWAS.',
    difficulty: 'Easy'
  },
  {
    id: 'gov-9',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Pre-colonial Systems in Nigeria',
    examType: 'JAMB',
    year: 2026,
    question: 'In the pre-colonial Hausa-Fulani emirate system following the 1804 Usman dan Fodio Jihad, who was the chief Islamic judge responsible for administering Sharia law?',
    options: {
      A: 'Alkali',
      B: 'Waziri',
      C: 'Madawaki',
      D: 'Galadima'
    },
    correctOption: 'A',
    explanation: 'In the Sokoto Caliphate system, the Alkali was the professional Sharia magistrate presiding over judicial courts, with the Emir’s court serving as the ultimate court of appeal.',
    difficulty: 'Easy'
  },
  {
    id: 'gov-10',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Constitutional Development (1922-1999)',
    examType: 'WAEC',
    year: 2025,
    question: 'The 1963 Republican Constitution of Nigeria was historically significant primarily because it:',
    options: {
      A: 'Severed ties with the British Crown, replacing Queen Elizabeth II with an indigenous Nigerian President as Head of State',
      B: 'Created 12 new states from the regions',
      C: 'Handed over power to the military council',
      D: 'Abolished regional legislatures'
    },
    correctOption: 'A',
    explanation: 'Under the 1963 Republican Constitution, Nigeria became an independent Federal Republic. Queen Elizabeth II ceased to be Queen of Nigeria, the Privy Council in London ceased to be the highest court of appeal (replaced by the Supreme Court of Nigeria), and Dr. Nnamdi Azikiwe became the first President.',
    difficulty: 'Medium'
  },
  {
    id: 'gov-11',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Arms & Forms of Government',
    examType: 'JAMB',
    year: 2026,
    question: 'Which of the following bodies is charged with the constitutional mandate of conducting national and state elections in Nigeria?',
    options: {
      A: 'Independent National Electoral Commission (INEC)',
      B: 'National Judicial Council (NJC)',
      C: 'Federal Character Commission (FCC)',
      D: 'Code of Conduct Bureau (CCB)'
    },
    correctOption: 'A',
    explanation: 'Under the 1999 Constitution, the Independent National Electoral Commission (INEC) is empowered to organize, undertake, and supervise all presidential, gubernatorial, national, and state assembly elections across Nigeria.',
    difficulty: 'Easy'
  },
  {
    id: 'gov-12',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Concepts of State & Sovereignty',
    examType: 'WAEC',
    year: 2026,
    question: 'Which legal prerogative allows a high court judge to compel a public official to carry out a mandatory statutory duty?',
    options: {
      A: 'Writ of Mandamus',
      B: 'Writ of Habeas Corpus',
      C: 'Writ of Certiorari',
      D: 'Writ of Quo Warranto'
    },
    correctOption: 'A',
    explanation: 'A Writ of Mandamus is an order issued by a superior court commanding an inferior court, public agency, or government officer to perform a specific public or statutory duty which they are legally obligated to execute.',
    difficulty: 'Hard'
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  ...SECONDARY_QUESTIONS.map(q => ({ ...q, educationLevel: (q.educationLevel || 'secondary') as EducationLevel })),
  ...EXTENDED_QUESTIONS.map(q => ({ ...q, educationLevel: (q.educationLevel || 'secondary') as EducationLevel })),
  ...PRIMARY_QUESTIONS,
  ...UNIVERSITY_QUESTIONS
];

export const STUDY_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'The Master Blueprint for Scoring 320+ & CBT Shortcuts in JAMB 2027',
    slug: 'jamb-study-techniques-300-plus',
    category: 'JAMB',
    excerpt: 'Discover the exact 8-key keyboard strategies, time-partitioning techniques, and question triage routines that produce high scores.',
    readTime: '6 min read',
    author: 'Dr. Chidi Okafor (Ex-JAMB Chief Examiner)',
    date: 'February 2026',
    tags: ['JAMB', 'CBT Shortcuts', 'Study Hacks', '8-Key System'],
    content: `
### 1. Mastering the Official JAMB 8-Key Keyboard System
During your actual examination, the computer mouse can be slow, erratic, or unresponsive. The fastest candidates never touch the mouse. Use the official 8-key layout:
- **A, B, C, D**: Choose your selected option immediately.
- **N**: Move directly to the **N**ext question.
- **P**: Return to the **P**revious question.
- **R**: **R**eview or toggle flagged questions.
- **S**: **S**ubmit (use only when completely finished).

### 2. The 120-Minute Triage Formula
You are tested across 4 subjects in 120 minutes (2 hours). Allocate your time strategically:
1. **Use of English (60 questions)**: Allocate exactly **40 minutes**. Answer comprehension and lexis questions swiftly.
2. **First Subject (e.g. Biology / Economics)**: Allocate **25 minutes**.
3. **Second Subject (e.g. Chemistry / Government)**: Allocate **25 minutes**.
4. **Third Subject (e.g. Physics / Mathematics)**: Allocate **25 minutes**.
5. **Final Reserve Buffer**: **5 minutes** to review flagged questions before the timer runs out.

### 3. The 3-Pass Method
- **Pass 1 (0 to 60 min)**: Answer all direct, memorization, and straightforward questions. If any question takes more than 45 seconds, flag it and move on!
- **Pass 2 (60 to 105 min)**: Solve the moderate calculation and paragraph questions.
- **Pass 3 (105 to 120 min)**: Tackle the difficult questions. Remember: JAMB does not penalize incorrect guesses with negative marking—never leave any question unanswered!
    `
  },
  {
    id: 'art-2',
    title: 'WAEC Marking Scheme Demystified: How to Secure A1 & B2 in Theory Papers',
    slug: 'waec-preparation-marking-scheme',
    category: 'WAEC',
    excerpt: 'An insider look into how WAEC examiners allocate marks for method, accuracy, and working steps in essay and theory papers.',
    readTime: '8 min read',
    author: 'Mrs. Folake Adeyemi (Senior WAEC Marker)',
    date: 'January 2026',
    tags: ['WAEC', 'SSCE', 'Theory Papers', 'Marking Scheme'],
    content: `
### Understanding the Examiner's Mark Allocation Codes
In WAEC Science and Arts papers, marks are not awarded randomly. They follow strict criteria:
- **M (Method Mark)**: Awarded for applying the correct formula or logical starting step, even if your final arithmetic fails.
- **A (Accuracy Mark)**: Awarded for obtaining the correct numerical answer following a correct method.
- **B (Independent Mark)**: Awarded for correct definition, unit, or diagram label regardless of other working.

### Top Pitfalls to Avoid:
1. **Omission of SI Units**: Failing to state units (e.g., m/s², Joules, cm³) loses the accuracy mark completely.
2. **Illegible Diagrams**: Diagrams in Biology and Physics must be clear, drawn in sharp pencil, with horizontal label lines that do not cross.
3. **Concord Errors in English Essays**: WAEC penalizes mechanical accuracy heavily. Deductions are made for spelling slips, dangling participles, and run-on sentences.
    `
  },
  {
    id: 'art-3',
    title: 'High-Yield Mnemonics & Memory Tricks for Nigerian Examinations',
    slug: 'science-mnemonics-high-yield',
    category: 'General',
    excerpt: 'Ten proven mnemonic memory aids to remember oxidation states, taxonomy, reactivity series, and economic concepts.',
    readTime: '5 min read',
    author: 'StudyNaija Academic Advisory Panel',
    date: 'January 2026',
    tags: ['Mnemonics', 'Chemistry', 'Biology', 'Memory'],
    content: `
### 1. Chemistry: Reactivity Series of Metals
**P**otassium, **S**odium, **C**alcium, **M**agnesium, **A**luminium, **Z**inc, **I**ron, **L**ead, **H**ydrogen, **C**opper, **S**ilver, **G**old:
*"**P**lease **S**top **C**alling **M**e **A** **Z**ebra, **I**nstead **L**earn **H**ow **C**opper **S**aves **G**old"*

### 2. Chemistry: Redox Reactions
- **OIL RIG**: **O**xidation **I**s **L**oss of electrons, **R**eduction **I**s **G**ain of electrons.
- **AN OX & RED CAT**: **An**ode is **Ox**idation, **Red**uction occurs at **Cat**hode.

### 3. Physics: Electromagnetic Spectrum in Decreasing Wavelength
**R**adio waves, **M**icrowaves, **I**nfrared, **V**isible light, **U**ltraviolet, **X**-rays, **G**amma rays:
*"**R**abbits **M**eet **I**n **V**ery **U**nusual **X**pensive **G**ardens"*

### 4. Economics: Determinants of Supply
**P**rice of the commodity, **C**ost of production, **T**echnology, **G**overnment taxes/subsidies, **W**eather/Climate.
    `
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '₦5,000',
    priceAmount: 5000,
    billingPeriod: 'per month',
    popular: false,
    recommendedFor: 'Students starting early revision who want reliable access to standard past questions and guided drills.',
    features: [
      'Full access to 10-Question Smart Practice Drills with step-by-step teacher working',
      '10+ Years of verified JAMB UTME & WAEC SSCE past questions across all 7 subjects',
      '10 Full-Length Timed CBT Mock Exams per month with official score reporting',
      '🔓 Unrestricted AI Mode with 30 daily questions on any topic without boundaries',
      '100% Completely Ad-Free revision experience with zero distractions',
      'Personal score tracking, missed questions review & weak topic identification',
      'Instant access to Subject Formula Sheets & High-Yield Mnemonics'
    ]
  },
  {
    id: 'medium',
    name: 'Medium Plan',
    price: '₦10,000',
    priceAmount: 10000,
    billingPeriod: 'per month',
    popular: true,
    recommendedFor: 'Most students aiming for 280-320+ JAMB aggregate and straight A1/B2 in WAEC.',
    features: [
      'Everything in Basic Plan included',
      '🔓 Unrestricted AI Mode with 75 daily questions & deep multi-turn reasoning',
      'UNLIMITED Full-Length Timed JAMB (4-Subject) & WAEC CBT Mock Exams',
      '2027 High-Probability Exam Predictions & High-Yield Question Packs',
      'Official JAMB Literature Novel ("The Life Changer" & 2027 texts) Chapter Summaries, Themes & 250+ Solved Questions',
      'WAEC Theory & Essay Marking Scheme Guide with step-by-step examiner point allocations',
      'Downloadable & Printable PDF Revision Notes, Formula Cheat Sheets & Key Definitions',
      'Speed & Pacing Diagnostics: Detects questions slowing you down to build speed for 320+',
      'Weekly Saturday Live Mock Challenge with Nigerian national scholarship leaderboard'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: '₦20,000',
    priceAmount: 20000,
    billingPeriod: 'per month',
    popular: false,
    recommendedFor: 'Serious candidates seeking competitive university courses (Medicine, Law, Eng) wanting 1-on-1 guidance.',
    features: [
      'Everything in Medium Plan included',
      '👑 UNLIMITED 24/7 Unrestricted AI Mode (zero quotas, asks on ANY topic, code generation & memory)',
      '24/7 AI-Powered StudyNaija Tutor for unlimited instant question breakdowns & math step-by-step solving',
      'VIP WhatsApp & Telegram Daily Study Circle: Daily predicted question drops & teacher voice notes',
      'Post-UTME Past Questions & Admission Cutoff Advisory for UNILAG, UI, OAU, ABU, UNN, FUTO, UNILORIN',
      'Priority 1-on-1 Academic Mentorship & Personal Admission Helpline',
      'All 7 Subjects Downloadable Mega-PDF Exam Revision Bundles with Answer Keys',
      '100% Score Guarantee: Score 280+ in JAMB or straight A/B in WAEC, or get a 100% full money-back refund!'
    ]
  }
];

export const SPONSORED_ADS = [
  {
    id: 'ad-1',
    title: 'University Admissions & Post-UTME Screening 2026/2027',
    subtitle: 'Check cutoff marks for UNILAG, UI, OAU, ABU & UNN',
    sponsor: 'EduVerify Nigeria',
    ctaText: 'Check Eligibility',
    badge: 'Sponsored Education'
  },
  {
    id: 'ad-2',
    title: 'Approved JAMB & WAEC Calculator & Stationeries',
    subtitle: 'Official non-programmable calculators approved for hall entrance',
    sponsor: 'StationeryHub Lagos',
    ctaText: 'View Approved Models',
    badge: 'Educational Gear'
  },
  {
    id: 'ad-3',
    title: 'Tertiary Education Trust Fund (TETFund) Scholarship Guide',
    subtitle: 'Free registration guide for federal and state university undergraduates',
    sponsor: 'Scholarship NG',
    ctaText: 'Read Guidelines',
    badge: 'Scholarship Alert'
  }
];
