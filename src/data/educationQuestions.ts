import { Subject, Question } from '../types';

export const PRIMARY_SUBJECTS: Subject[] = [
  {
    id: 'primary-math',
    name: 'Primary Mathematics',
    code: 'PMTH',
    icon: 'Binary',
    educationLevel: 'primary',
    description: 'Fractions, Decimals, Word Problems, Simple Interest, Measurement, Shapes and Basic Algebra.',
    topics: ['Fractions & Decimals', 'Word Problems & Operations', 'Perimeter, Area & Volume', 'Money, Profit & Simple Interest', 'Geometry & Shapes', 'Factors, Multiples & Percentages'],
    questionCount: 40,
    featured: true
  },
  {
    id: 'primary-english',
    name: 'Primary English & Phonics',
    code: 'PENG',
    icon: 'BookOpen',
    educationLevel: 'primary',
    description: 'Parts of speech, Spelling, Reading comprehension, Tenses, Punctuation and Antonyms/Synonyms.',
    topics: ['Nouns, Pronouns & Verbs', 'Tenses & Concord', 'Spelling & Phonics', 'Synonyms & Antonyms', 'Reading Comprehension', 'Punctuation & Capitalization'],
    questionCount: 40,
    featured: true
  },
  {
    id: 'primary-science',
    name: 'Basic Science & Technology',
    code: 'PBST',
    icon: 'FlaskConical',
    educationLevel: 'primary',
    description: 'Living and non-living things, Plants & Animals, Solar System, Energy, Human body, and Simple machines.',
    topics: ['Living & Non-Living Things', 'Human Body & Hygiene', 'Solar System & Planets', 'Simple Machines & Tools', 'Energy, Force & Motion', 'Pollution & Conservation'],
    questionCount: 35,
    featured: true
  },
  {
    id: 'primary-reasoning',
    name: 'Quantitative & Verbal Reasoning',
    code: 'PQVR',
    icon: 'Sparkles',
    educationLevel: 'primary',
    description: 'Pattern matching, Number series, Letter codes, Analogies, and Critical thinking puzzles.',
    topics: ['Number Series & Math Puzzles', 'Letter Sequences & Coding', 'Word Analogies & Classifications', 'Spatial & Shape Puzzles', 'Common Entrance Drills'],
    questionCount: 35,
    featured: true
  },
  {
    id: 'primary-social',
    name: 'Social Studies & Civic Education',
    code: 'PSOC',
    icon: 'Landmark',
    educationLevel: 'primary',
    description: 'Nigerian national symbols, Family life, Rights and duties, Government leaders, and Cultural values.',
    topics: ['National Symbols & Anthem', 'Family & Community Living', 'Rights, Duties & Civic Responsibilities', 'Nigerian Heroes & History', 'Road Safety & First Aid'],
    questionCount: 30,
    featured: true
  }
];

export const UNIVERSITY_SUBJECTS: Subject[] = [
  {
    id: 'uni-gst101',
    name: 'GST 101: Use of English & Communication',
    code: 'GST 101',
    icon: 'BookOpen',
    educationLevel: 'university',
    description: 'Academic writing, Register, Sentence structures, Discourse analysis, Oral presentation and Phonetics.',
    topics: ['Study Skills & Library Methods', 'Sentence Structure & Concord', 'Lexical Relations & Idiomatic Expressions', 'Paragraph Development & Cohesion', 'Phonology & Intonation', 'Mechanics of Academic Writing'],
    questionCount: 45,
    featured: true
  },
  {
    id: 'uni-gst102',
    name: 'GST 102: Philosophy & Logic',
    code: 'GST 102',
    icon: 'Lightbulb',
    educationLevel: 'university',
    description: 'Propositional logic, Syllogisms, Informal fallacies, Epistemology, and Methods of scientific inquiry.',
    topics: ['Nature & Branches of Philosophy', 'Propositional Logic & Truth Tables', 'Categorical Syllogisms', 'Informal Logical Fallacies', 'Theory of Knowledge (Epistemology)', 'Scientific Reasoning & Method'],
    questionCount: 40,
    featured: true
  },
  {
    id: 'uni-gst103',
    name: 'GST 103: Nigerian Peoples & Culture',
    code: 'GST 103',
    icon: 'Landmark',
    educationLevel: 'university',
    description: 'Evolution of Nigerian state, Pre-colonial social systems, Colonial impact, and National integration.',
    topics: ['Pre-colonial Political Systems', 'Colonialism & Lugardian Amalgamation (1914)', 'Evolution of Nigerian Constitutions', 'Ethnic Groups, Religions & Traditions', 'Post-Independence Crises & Federalism', 'Socio-Economic Development in Nigeria'],
    questionCount: 40,
    featured: true
  },
  {
    id: 'uni-math101',
    name: 'MTH 101: Elementary Mathematics I',
    code: 'MTH 101',
    icon: 'Binary',
    educationLevel: 'university',
    description: 'Set theory, Real numbers, Mathematical induction, Sequences & Series, Complex numbers, and Matrices.',
    topics: ['Set Theory & Venn Diagrams', 'Real Number System & Inequalities', 'Mathematical Induction', 'Sequences, Series & Progression', 'Binomial Theorem', 'Complex Numbers & De Moivre Theorem'],
    questionCount: 40,
    featured: true
  },
  {
    id: 'uni-phy101',
    name: 'PHY 101: General Physics I (Mechanics)',
    code: 'PHY 101',
    icon: 'Atom',
    educationLevel: 'university',
    description: 'Dimensional analysis, Vectors, Newton laws, Conservation laws, Rotational dynamics, and Hydrostatics.',
    topics: ['Dimensional Analysis & Units', 'Vector Calculus in 2D/3D', 'Linear Kinematics & Projectiles', 'Newtonian Mechanics & Friction', 'Conservation of Momentum & Energy', 'Rotational Dynamics & Inertia'],
    questionCount: 35,
    featured: true
  },
  {
    id: 'uni-chm101',
    name: 'CHM 101: General Chemistry I',
    code: 'CHM 101',
    icon: 'FlaskConical',
    educationLevel: 'university',
    description: 'Quantum atomic models, Chemical periodicity, Thermodynamics, Chemical bonding, and Reaction kinetics.',
    topics: ['Quantum Theory & Wave Equations', 'Periodic Trends & Electronegativity', 'Chemical Bonding & Hybridization', 'First & Second Laws of Thermodynamics', 'Chemical Kinetics & Equilibrium', 'Electrochemistry & Redox Potentials'],
    questionCount: 35,
    featured: true
  }
];

export const PRIMARY_QUESTIONS: Question[] = [
  // Primary Mathematics
  {
    id: 'pmth-1',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Fractions & Decimals',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'What is the value of 3/4 + 2/5 expressed as a single fraction in its lowest term?',
    options: {
      A: '5/9',
      B: '23/20',
      C: '6/20',
      D: '11/20'
    },
    correctOption: 'B',
    explanation: 'Find the LCM of denominators 4 and 5, which is 20. (3×5 + 2×4)/20 = (15 + 8)/20 = 23/20 (or 1 3/20).',
    difficulty: 'Easy'
  },
  {
    id: 'pmth-2',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Word Problems & Operations',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'A trader bought 4 crates of eggs. Each crate contains 30 eggs. If 12 eggs got broken, how many whole eggs are left?',
    options: {
      A: '108',
      B: '120',
      C: '132',
      D: '96'
    },
    correctOption: 'A',
    explanation: 'Total eggs bought = 4 × 30 = 120 eggs. Minus broken eggs = 120 - 12 = 108 intact eggs.',
    difficulty: 'Easy'
  },
  {
    id: 'pmth-3',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Perimeter, Area & Volume',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Find the perimeter of a rectangular school football field measuring 90 metres long and 60 metres wide.',
    options: {
      A: '150 m',
      B: '300 m',
      C: '5,400 m',
      D: '240 m'
    },
    correctOption: 'B',
    explanation: 'Perimeter of rectangle = 2 × (Length + Width) = 2 × (90 + 60) = 2 × 150 = 300 metres.',
    difficulty: 'Easy'
  },
  {
    id: 'pmth-4',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Money, Profit & Simple Interest',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Calculate the Simple Interest on ₦5,000 borrowed for 2 years at an interest rate of 5% per annum.',
    options: {
      A: '₦250',
      B: '₦500',
      C: '₦1,000',
      D: '₦550'
    },
    correctOption: 'B',
    explanation: 'Simple Interest = (Principal × Rate × Time) / 100 = (5000 × 5 × 2) / 100 = 50,000 / 100 = ₦500.',
    difficulty: 'Easy'
  },
  {
    id: 'pmth-5',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Factors, Multiples & Percentages',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'What is 25% of ₦4,800?',
    options: {
      A: '₦1,200',
      B: '₦960',
      C: '₦1,400',
      D: '₦800'
    },
    correctOption: 'A',
    explanation: '25% is equivalent to 1/4. (1/4) × ₦4,800 = ₦1,200.',
    difficulty: 'Easy'
  },
  {
    id: 'pmth-6',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Fractions & Decimals',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Convert 0.35 to a fraction in its simplest form.',
    options: {
      A: '7/20',
      B: '35/10',
      C: '3/5',
      D: '7/50'
    },
    correctOption: 'A',
    explanation: '0.35 = 35/100. Divide numerator and denominator by 5: 35÷5 = 7, 100÷5 = 20. Result is 7/20.',
    difficulty: 'Easy'
  },
  {
    id: 'pmth-7',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Geometry & Shapes',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'How many sides and angles does a regular hexagon have?',
    options: {
      A: '5',
      B: '6',
      C: '8',
      D: '10'
    },
    correctOption: 'B',
    explanation: 'A hexagon is a polygon with 6 straight sides and 6 interior angles.',
    difficulty: 'Easy'
  },
  {
    id: 'pmth-8',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Factors, Multiples & Percentages',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Find the Highest Common Factor (HCF) of 18, 24 and 36.',
    options: {
      A: '2',
      B: '3',
      C: '6',
      D: '12'
    },
    correctOption: 'C',
    explanation: 'Factors of 18: 1, 2, 3, 6, 9, 18. Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Factors of 36: 1, 2, 3, 4, 6, 9, 12, 18, 36. The highest common factor is 6.',
    difficulty: 'Easy'
  },
  {
    id: 'pmth-9',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Perimeter, Area & Volume',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Calculate the area of a right-angled triangle with base 12 cm and height 8 cm.',
    options: {
      A: '96 cm²',
      B: '48 cm²',
      C: '20 cm²',
      D: '40 cm²'
    },
    correctOption: 'B',
    explanation: 'Area of triangle = 1/2 × base × height = 1/2 × 12 × 8 = 6 × 8 = 48 cm².',
    difficulty: 'Easy'
  },
  {
    id: 'pmth-10',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    topic: 'Word Problems & Operations',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'If 8 exercise books cost ₦2,400, what is the cost of 5 of the same exercise books?',
    options: {
      A: '₦1,200',
      B: '₦1,500',
      C: '₦1,600',
      D: '₦1,800'
    },
    correctOption: 'B',
    explanation: 'Cost of 1 book = 2,400 ÷ 8 = ₦300. Cost of 5 books = 5 × 300 = ₦1,500.',
    difficulty: 'Easy'
  },

  // Primary English
  {
    id: 'peng-1',
    subjectId: 'primary-english',
    subjectName: 'Primary English & Phonics',
    educationLevel: 'primary',
    topic: 'Nouns, Pronouns & Verbs',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Choose the word that correctly identifies the part of speech of the underlined word: "The bright star shone in the dark sky."',
    options: {
      A: 'Noun',
      B: 'Adjective',
      C: 'Adverb',
      D: 'Preposition'
    },
    correctOption: 'B',
    explanation: '"Bright" describes the noun "star", therefore it is an adjective.',
    difficulty: 'Easy'
  },
  {
    id: 'peng-2',
    subjectId: 'primary-english',
    subjectName: 'Primary English & Phonics',
    educationLevel: 'primary',
    topic: 'Tenses & Concord',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Complete the sentence: "Neither Emeka nor his brothers ______ at the school assembly yesterday."',
    options: {
      A: 'was',
      B: 'were',
      C: 'is',
      D: 'are'
    },
    correctOption: 'B',
    explanation: 'In "neither... nor" structures, the verb agrees with the closer subject. "Brothers" is plural and yesterday indicates past tense, so "were" is correct.',
    difficulty: 'Medium'
  },
  {
    id: 'peng-3',
    subjectId: 'primary-english',
    subjectName: 'Primary English & Phonics',
    educationLevel: 'primary',
    topic: 'Synonyms & Antonyms',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Choose the word that is OPPOSITE in meaning to ANCIENT:',
    options: {
      A: 'Old',
      B: 'Modern',
      C: 'Historic',
      D: 'Antique'
    },
    correctOption: 'B',
    explanation: '"Ancient" means belonging to the very distant past. Its direct antonym is "modern".',
    difficulty: 'Easy'
  },
  {
    id: 'peng-4',
    subjectId: 'primary-english',
    subjectName: 'Primary English & Phonics',
    educationLevel: 'primary',
    topic: 'Spelling & Phonics',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Identify the correctly spelt word:',
    options: {
      A: 'Accomodation',
      B: 'Accommodation',
      C: 'Acomodation',
      D: 'Accomodasion'
    },
    correctOption: 'B',
    explanation: 'The word "Accommodation" is spelt with double "c" and double "m".',
    difficulty: 'Medium'
  },
  {
    id: 'peng-5',
    subjectId: 'primary-english',
    subjectName: 'Primary English & Phonics',
    educationLevel: 'primary',
    topic: 'Reading Comprehension',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'What is the plural form of the noun "ox"?',
    options: {
      A: 'Oxes',
      B: 'Oxen',
      C: 'Oxies',
      D: 'Oxs'
    },
    correctOption: 'B',
    explanation: 'The irregular plural form of "ox" is "oxen".',
    difficulty: 'Easy'
  },

  // Basic Science
  {
    id: 'pbst-1',
    subjectId: 'primary-science',
    subjectName: 'Basic Science & Technology',
    educationLevel: 'primary',
    topic: 'Living & Non-Living Things',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Which of the following characteristics is NOT common to all living organisms?',
    options: {
      A: 'Respiration',
      B: 'Reproduction',
      C: 'Photosynthesis',
      D: 'Excretion'
    },
    correctOption: 'C',
    explanation: 'Photosynthesis is unique to green plants and certain microorganisms. Animals do not photosynthesize.',
    difficulty: 'Easy'
  },
  {
    id: 'pbst-2',
    subjectId: 'primary-science',
    subjectName: 'Basic Science & Technology',
    educationLevel: 'primary',
    topic: 'Solar System & Planets',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Which planet is the closest to the Sun in our solar system?',
    options: {
      A: 'Venus',
      B: 'Earth',
      C: 'Mars',
      D: 'Mercury'
    },
    correctOption: 'D',
    explanation: 'Mercury is the first and closest planet orbiting the Sun.',
    difficulty: 'Easy'
  },
  {
    id: 'pbst-3',
    subjectId: 'primary-science',
    subjectName: 'Basic Science & Technology',
    educationLevel: 'primary',
    topic: 'Simple Machines & Tools',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'A wheelbarrow is an example of which class of lever?',
    options: {
      A: 'First class lever',
      B: 'Second class lever',
      C: 'Third class lever',
      D: 'Fourth class lever'
    },
    correctOption: 'B',
    explanation: 'In a wheelbarrow, the load is situated between the fulcrum (wheel) and the effort (handles), making it a second class lever.',
    difficulty: 'Medium'
  },

  // Quantitative & Verbal Reasoning
  {
    id: 'pqvr-1',
    subjectId: 'primary-reasoning',
    subjectName: 'Quantitative & Verbal Reasoning',
    educationLevel: 'primary',
    topic: 'Number Series & Math Puzzles',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Find the next number in the pattern: 2, 5, 10, 17, 26, ___?',
    options: {
      A: '35',
      B: '37',
      C: '36',
      D: '38'
    },
    correctOption: 'B',
    explanation: 'Differences between consecutive numbers are consecutive odd numbers: +3, +5, +7, +9, so the next difference is +11. 26 + 11 = 37.',
    difficulty: 'Medium'
  },
  {
    id: 'pqvr-2',
    subjectId: 'primary-reasoning',
    subjectName: 'Quantitative & Verbal Reasoning',
    educationLevel: 'primary',
    topic: 'Word Analogies & Classifications',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'PUPIL is to EYE as TEETH is to ______:',
    options: {
      A: 'Tongue',
      B: 'Mouth',
      C: 'Gums',
      D: 'Cheek'
    },
    correctOption: 'B',
    explanation: 'A pupil is an anatomical part located in the eye; teeth are parts located in the mouth.',
    difficulty: 'Easy'
  },

  // Social Studies & Civic Education
  {
    id: 'psoc-1',
    subjectId: 'primary-social',
    subjectName: 'Social Studies & Civic Education',
    educationLevel: 'primary',
    topic: 'National Symbols & Anthem',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'What do the two white horses on the Nigerian Coat of Arms represent?',
    options: {
      A: 'Agriculture and fertile soil',
      B: 'Dignity and strength',
      C: 'Peace and unity',
      D: 'Wealth and minerals'
    },
    correctOption: 'B',
    explanation: 'On the Nigerian Coat of Arms, the two white horses represent dignity and strength.',
    difficulty: 'Easy'
  },
  {
    id: 'psoc-2',
    subjectId: 'primary-social',
    subjectName: 'Social Studies & Civic Education',
    educationLevel: 'primary',
    topic: 'National Symbols & Anthem',
    examType: 'COMMON_ENTRANCE',
    year: 2026,
    question: 'Who designed the Nigerian national flag in 1959?',
    options: {
      A: 'Pa Taiwo Akinkunmi',
      B: 'Chief Obafemi Awolowo',
      C: 'Herbert Macaulay',
      D: 'Nnamdi Azikiwe'
    },
    correctOption: 'A',
    explanation: 'The Nigerian flag was designed by Pa Michael Taiwo Akinkunmi in 1959.',
    difficulty: 'Easy'
  }
];

export const UNIVERSITY_QUESTIONS: Question[] = [
  // GST 101
  {
    id: 'gst101-1',
    subjectId: 'uni-gst101',
    subjectName: 'GST 101: Use of English & Communication',
    educationLevel: 'university',
    topic: 'Sentence Structure & Concord',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'Choose the grammatically faultless sentence in academic register:',
    options: {
      A: 'The committee has submitted their respective findings to the senate.',
      B: 'The data indicates that the hypothesis is invalid.',
      C: 'Neither the vice chancellor nor the deans were present at the colloquium.',
      D: 'Each of the participants were given a research certificate.'
    },
    correctOption: 'C',
    explanation: 'In correlative conjunctions ("neither... nor"), verb agreement follows the proximate subject ("deans" is plural, thus "were" is correct). Option A uses singular "has" with plural pronoun "their". Option D incorrectly uses plural "were" with distributive pronoun "each".',
    difficulty: 'Hard'
  },
  {
    id: 'gst101-2',
    subjectId: 'uni-gst101',
    subjectName: 'GST 101: Use of English & Communication',
    educationLevel: 'university',
    topic: 'Paragraph Development & Cohesion',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'In academic discourse, what type of transitional marker is "conversely"?',
    options: {
      A: 'Additive discourse marker',
      B: 'Adversative / Contrastive marker',
      C: 'Causal / Resultative marker',
      D: 'Sequential marker'
    },
    correctOption: 'B',
    explanation: '"Conversely" introduces an antithesis or opposing view, functioning as an adversative or contrastive discourse transitional marker.',
    difficulty: 'Medium'
  },
  {
    id: 'gst101-3',
    subjectId: 'uni-gst101',
    subjectName: 'GST 101: Use of English & Communication',
    educationLevel: 'university',
    topic: 'Phonology & Intonation',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'Which of the following words has the primary stress on the third syllable?',
    options: {
      A: 'Photographer',
      B: 'Democracy',
      C: 'Electricity',
      D: 'Geographic'
    },
    correctOption: 'C',
    explanation: 'E-lec-TRI-ci-ty has its primary stress placed on the third syllable "tri". "Photographer" has it on the second (pho-TOG-ra-pher).',
    difficulty: 'Hard'
  },

  // GST 102
  {
    id: 'gst102-1',
    subjectId: 'uni-gst102',
    subjectName: 'GST 102: Philosophy & Logic',
    educationLevel: 'university',
    topic: 'Informal Logical Fallacies',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'Identify the fallacy: "You cannot accept Professor Adeleke\'s economic theory because he was recently convicted of tax evasion."',
    options: {
      A: 'Argumentum ad Verecundiam',
      B: 'Argumentum ad Hominem (Abusive)',
      C: 'Post Hoc Ergo Propter Hoc',
      D: 'Petitio Principii (Begging the question)'
    },
    correctOption: 'B',
    explanation: 'Argumentum ad hominem occurs when an argument is rejected based on attacks on the person\'s character rather than evaluating the validity of their thesis.',
    difficulty: 'Medium'
  },
  {
    id: 'gst102-2',
    subjectId: 'uni-gst102',
    subjectName: 'GST 102: Philosophy & Logic',
    educationLevel: 'university',
    topic: 'Propositional Logic & Truth Tables',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'Under classical propositional logic, a conditional statement (p → q) is false IF AND ONLY IF:',
    options: {
      A: 'p is false and q is false',
      B: 'p is false and q is true',
      C: 'p is true and q is false',
      D: 'both p and q are true'
    },
    correctOption: 'C',
    explanation: 'The conditional proposition p → q is materially false only when the antecedent (p) is true and the consequent (q) is false.',
    difficulty: 'Hard'
  },
  {
    id: 'gst102-3',
    subjectId: 'uni-gst102',
    subjectName: 'GST 102: Philosophy & Logic',
    educationLevel: 'university',
    topic: 'Categorical Syllogisms',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'In standard syllogistic logic, which term must be distributed in at least one premise to avoid a formal fallacy?',
    options: {
      A: 'Major term',
      B: 'Minor term',
      C: 'Middle term',
      D: 'Copula'
    },
    correctOption: 'C',
    explanation: 'Failure to distribute the middle term in at least one premise commits the Fallacy of the Undistributed Middle.',
    difficulty: 'Hard'
  },

  // GST 103
  {
    id: 'gst103-1',
    subjectId: 'uni-gst103',
    subjectName: 'GST 103: Nigerian Peoples & Culture',
    educationLevel: 'university',
    topic: 'Colonialism & Lugardian Amalgamation (1914)',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'The primary administrative mechanism through which Lord Frederick Lugard governed the Northern Protectorate was known as:',
    options: {
      A: 'Policy of Assimilation',
      B: 'Indirect Rule System',
      C: 'Direct Crown Colony Governance',
      D: 'Policy of Association'
    },
    correctOption: 'B',
    explanation: 'Lord Lugard deployed the Indirect Rule system, utilizing existing traditional ruling hierarchies (Emirs and traditional councils) to administer local governance.',
    difficulty: 'Medium'
  },
  {
    id: 'gst103-2',
    subjectId: 'uni-gst103',
    subjectName: 'GST 103: Nigerian Peoples & Culture',
    educationLevel: 'university',
    topic: 'Pre-colonial Political Systems',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'In the pre-colonial Oyo Empire, which organ served as the supreme aristocratic constitutional check on the powers of the Alaafin?',
    options: {
      A: 'The Ogboni Cult',
      B: 'The Oyomesi (Council of Nobles)',
      C: 'The Eso Ikoyi (War Chiefs)',
      D: 'The Are Ona Kakanfo'
    },
    correctOption: 'B',
    explanation: 'The Oyomesi, headed by the Bashorun, served as the supreme council of kingmakers and held the constitutional authority to reject an autocratic Alaafin.',
    difficulty: 'Medium'
  },

  // MTH 101
  {
    id: 'mth101-1',
    subjectId: 'uni-math101',
    subjectName: 'MTH 101: Elementary Mathematics I',
    educationLevel: 'university',
    topic: 'Set Theory & Venn Diagrams',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'If Set A has 5 elements, how many subsets does the Power Set P(A) contain?',
    options: {
      A: '10',
      B: '25',
      C: '32',
      D: '64'
    },
    correctOption: 'C',
    explanation: 'The cardinality of the power set of any finite set with n elements is given by 2^n. For n = 5, |P(A)| = 2^5 = 32.',
    difficulty: 'Medium'
  },
  {
    id: 'mth101-2',
    subjectId: 'uni-math101',
    subjectName: 'MTH 101: Elementary Mathematics I',
    educationLevel: 'university',
    topic: 'Sequences, Series & Progression',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'Determine the sum to infinity of the geometric series: 16 + 8 + 4 + 2 + ...',
    options: {
      A: '24',
      B: '30',
      C: '32',
      D: '64'
    },
    correctOption: 'C',
    explanation: 'First term a = 16, common ratio r = 8/16 = 1/2. Sum to infinity S∞ = a / (1 - r) = 16 / (1 - 0.5) = 16 / 0.5 = 32.',
    difficulty: 'Medium'
  },

  // PHY 101
  {
    id: 'phy101-1',
    subjectId: 'uni-phy101',
    subjectName: 'PHY 101: General Physics I (Mechanics)',
    educationLevel: 'university',
    topic: 'Dimensional Analysis & Units',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'What is the dimensional formula for Universal Gravitational Constant (G)?',
    options: {
      A: '[M⁻¹ L³ T⁻²]',
      B: '[M¹ L² T⁻²]',
      C: '[M⁻² L³ T⁻¹]',
      D: '[M¹ L¹ T⁻²]'
    },
    correctOption: 'A',
    explanation: 'From Newton\'s Law: F = G(m₁m₂)/r² → G = F r² / m². Dimensions: [M L T⁻²][L²] / [M²] = [M⁻¹ L³ T⁻²].',
    difficulty: 'Hard'
  },

  // CHM 101
  {
    id: 'chm101-1',
    subjectId: 'uni-chm101',
    subjectName: 'CHM 101: General Chemistry I',
    educationLevel: 'university',
    topic: 'Chemical Bonding & Hybridization',
    examType: 'UNIVERSITY_GST',
    year: 2026,
    question: 'What is the hybridization state and molecular geometry of the central phosphorus atom in PCl₅?',
    options: {
      A: 'sp³d, Trigonal Bipyramidal',
      B: 'sp³d², Octahedral',
      C: 'sp³, Tetrahedral',
      D: 'dsp², Square Planar'
    },
    correctOption: 'A',
    explanation: 'Phosphorus in PCl₅ forms 5 bonding pairs with zero lone pairs on the central atom, giving sp³d hybridization and trigonal bipyramidal geometry.',
    difficulty: 'Hard'
  }
];
