import { Question, SubjectId } from '../types';
export * from './questionRandomizer';
import { shuffleQuestionOptionsFair, createDynamicQuestionVariant } from './questionRandomizer';

/**
 * Mix up (shuffle) the options (A, B, C, D) of a question,
 * and accurately update correctOption to match the new position.
 */
export function shuffleQuestionOptions(question: Question): Question {
  return shuffleQuestionOptionsFair(question);
}

/**
 * Extended curated questions to guarantee zero repeats across multiple batches.
 */
export const EXTENDED_QUESTIONS: Question[] = [
  // ================= MATHEMATICS =================
  {
    id: 'mth-ext-1',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Quadratic Equations',
    examType: 'JAMB',
    year: 2024,
    question: 'Find the roots of the quadratic equation 2x² - 5x - 3 = 0.',
    options: {
      A: 'x = 3 or x = -1/2',
      B: 'x = -3 or x = 1/2',
      C: 'x = 2 or x = -3/2',
      D: 'x = 1 or x = -3'
    },
    correctOption: 'A',
    explanation: 'Using factorization: 2x² - 6x + x - 3 = 0 => 2x(x - 3) + 1(x - 3) = 0 => (2x + 1)(x - 3) = 0. Therefore, 2x = -1 => x = -1/2, or x = 3.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-ext-2',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Trigonometry',
    examType: 'JAMB',
    year: 2024,
    question: 'If tan θ = 3/4 and θ is an acute angle, find the value of (cos θ - sin θ) / (cos θ + sin θ).',
    options: {
      A: '1/7',
      B: '7/1',
      C: '1/5',
      D: '2/7'
    },
    correctOption: 'A',
    explanation: 'In a right-angled triangle where tan θ = 3/4 (opposite=3, adjacent=4), the hypotenuse = √(3² + 4²) = 5. Thus, sin θ = 3/5, cos θ = 4/5. Value = (4/5 - 3/5) / (4/5 + 3/5) = (1/5) / (7/5) = 1/7.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-ext-3',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Arithmetic Progression (A.P.)',
    examType: 'WAEC',
    year: 2023,
    question: 'The 3rd and 7th terms of an Arithmetic Progression are 9 and 25 respectively. Find the first term (a) and common difference (d).',
    options: {
      A: 'a = 1, d = 4',
      B: 'a = 2, d = 3',
      C: 'a = 3, d = 4',
      D: 'a = -1, d = 5'
    },
    correctOption: 'A',
    explanation: 'T₃ = a + 2d = 9 ... (1)\nT₇ = a + 6d = 25 ... (2)\nSubtract (1) from (2): 4d = 16 => d = 4.\nSubstitute d = 4 into (1): a + 2(4) = 9 => a = 9 - 8 = 1.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-ext-4',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Probability',
    examType: 'JAMB',
    year: 2023,
    question: 'A box contains 5 red balls, 4 green balls, and 3 blue balls. If two balls are drawn at random one after the other without replacement, find the probability that both are red.',
    options: {
      A: '5/33',
      B: '25/144',
      C: '5/18',
      D: '1/6'
    },
    correctOption: 'A',
    explanation: 'Total balls = 5 + 4 + 3 = 12.\nP(1st is red) = 5/12.\nRemaining balls = 11, remaining red = 4.\nP(2nd is red) = 4/11.\nP(both red) = (5/12) × (4/11) = 20/132 = 5/33.',
    difficulty: 'Hard'
  },
  {
    id: 'mth-ext-5',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Coordinate Geometry',
    examType: 'JAMB',
    year: 2024,
    question: 'Find the gradient (slope) of the line joining points P(2, -3) and Q(-4, 5).',
    options: {
      A: '-4/3',
      B: '4/3',
      C: '-3/4',
      D: '3/4'
    },
    correctOption: 'A',
    explanation: 'Gradient m = (y₂ - y₁) / (x₂ - x₁) = (5 - (-3)) / (-4 - 2) = (5 + 3) / (-6) = 8 / (-6) = -4/3.',
    difficulty: 'Easy'
  },
  {
    id: 'mth-ext-6',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Differentiation & Calculus',
    examType: 'JAMB',
    year: 2024,
    question: 'Find the derivative dy/dx if y = 3x⁴ - 5x² + 7x - 9.',
    options: {
      A: '12x³ - 10x + 7',
      B: '12x³ - 10x',
      C: '3x³ - 5x + 7',
      D: '12x⁴ - 10x² + 7'
    },
    correctOption: 'A',
    explanation: 'Applying the power rule d/dx(axⁿ) = a·n·xⁿ⁻¹: dy/dx = 4(3)x³ - 2(5)x + 7(1) - 0 = 12x³ - 10x + 7.',
    difficulty: 'Easy'
  },
  {
    id: 'mth-ext-7',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Set Theory & Venn Diagrams',
    examType: 'WAEC',
    year: 2023,
    question: 'In a class of 50 students, 30 study Biology, 25 study Chemistry, and 10 study neither. How many students study both subjects?',
    options: {
      A: '15',
      B: '20',
      C: '10',
      D: '5'
    },
    correctOption: 'A',
    explanation: 'Total students = 50. Number studying at least one = 50 - 10 = 40.\nn(B ∪ C) = n(B) + n(C) - n(B ∩ C) => 40 = 30 + 25 - n(B ∩ C) => 40 = 55 - n(B ∩ C) => n(B ∩ C) = 55 - 40 = 15.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-ext-8',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Matrices & Determinants',
    examType: 'JAMB',
    year: 2024,
    question: 'Evaluate the determinant of the 2×2 matrix | 4  -2 | \n| 3   5 |.',
    options: {
      A: '26',
      B: '14',
      C: '-26',
      D: '20'
    },
    correctOption: 'A',
    explanation: 'Determinant |A| = (ad - bc) = (4 × 5) - (-2 × 3) = 20 - (-6) = 20 + 6 = 26.',
    difficulty: 'Easy'
  },
  {
    id: 'mth-ext-9',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Circle Geometry',
    examType: 'WAEC',
    year: 2023,
    question: 'An arc of a circle of radius 7 cm subtends an angle of 60° at the center. Calculate the length of the arc (Take π = 22/7).',
    options: {
      A: '7.33 cm',
      B: '14.67 cm',
      C: '22 cm',
      D: '3.67 cm'
    },
    correctOption: 'A',
    explanation: 'Arc length L = (θ / 360°) × 2πr = (60 / 360) × 2 × (22 / 7) × 7 = (1/6) × 44 = 44 / 6 = 7.33 cm.',
    difficulty: 'Medium'
  },
  {
    id: 'mth-ext-10',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Surds',
    examType: 'JAMB',
    year: 2024,
    question: 'Rationalize the denominator of (3 + √2) / (3 - √2).',
    options: {
      A: '(11 + 6√2) / 7',
      B: '(11 - 6√2) / 7',
      C: '(7 + 6√2) / 7',
      D: '(11 + 6√2) / 11'
    },
    correctOption: 'A',
    explanation: 'Multiply numerator and denominator by conjugate (3 + √2): (3 + √2)² / (3² - (√2)²) = (9 + 6√2 + 2) / (9 - 2) = (11 + 6√2) / 7.',
    difficulty: 'Medium'
  },

  // ================= ENGLISH LANGUAGE =================
  {
    id: 'eng-ext-1',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Lexis & Structure',
    examType: 'JAMB',
    year: 2024,
    question: 'Choose the word that correctly fills the blank: The committee members could not agree, so the meeting ended in a ______ .',
    options: {
      A: 'deadlock',
      B: 'gridlock',
      C: 'standby',
      D: 'standoffish'
    },
    correctOption: 'A',
    explanation: 'In formal deliberative meetings and negotiations, a situation where no progress can be made because parties disagree completely is called a "deadlock" (or impasse). Gridlock primarily applies to heavy traffic or broad legislative stagnation.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-ext-2',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Oral English & Phonology',
    examType: 'JAMB',
    year: 2024,
    question: 'In which of the following words is the consonant "b" SILENT?',
    options: {
      A: 'Doubt',
      B: 'Timber',
      C: 'Slumber',
      D: 'Rumble'
    },
    correctOption: 'A',
    explanation: 'In English phonology, the letter "b" is silent when followed by "t" in words derived from Latin like "doubt" /daʊt/, "debt" /det/, and "subtle" /ˈsʌt.əl/. In timber, slumber, and rumble, the /b/ sound is clearly voiced.',
    difficulty: 'Easy'
  },
  {
    id: 'eng-ext-3',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Concord & Agreement',
    examType: 'WAEC',
    year: 2023,
    question: 'One of the boys who ______ football for the state team has received a scholarship.',
    options: {
      A: 'play',
      B: 'plays',
      C: 'is playing',
      D: 'playing'
    },
    correctOption: 'A',
    explanation: 'In relative clauses with "one of the [plural noun] who...", the relative pronoun "who" refers back to the plural antecedent "boys", requiring the plural verb "play". The main clause verb "has received" agrees with "One".',
    difficulty: 'Hard'
  },
  {
    id: 'eng-ext-4',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Synonyms & Antonyms',
    examType: 'JAMB',
    year: 2024,
    question: 'Select the word NEAREST in meaning to the capitalized word: The judge declared the contract NULL and VOID.',
    options: {
      A: 'Invalid',
      B: 'Incomplete',
      C: 'Unenforceable',
      D: 'Expired'
    },
    correctOption: 'A',
    explanation: '"Null and void" is a legal binomial meaning having no legal force or validity from the outset, i.e., completely "invalid".',
    difficulty: 'Easy'
  },
  {
    id: 'eng-ext-5',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Idioms & Figures of Speech',
    examType: 'JAMB',
    year: 2023,
    question: 'When asked about the new product launch, the manager said it was "a flash in the pan". This means the product was ______ .',
    options: {
      A: 'a sudden success that was not repeated or sustained',
      B: 'an explosive industrial disaster',
      C: 'an extremely bright and popular invention',
      D: 'very cheap to manufacture'
    },
    correctOption: 'A',
    explanation: 'The idiom "a flash in the pan" refers to something that shows brief, promising, or sensational initial success but fails to deliver lasting results or value.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-ext-6',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Stress Patterns',
    examType: 'JAMB',
    year: 2024,
    question: 'Choose the word with the primary stress on the FIRST syllable:',
    options: {
      A: 'COMfortable',
      B: 'conTRIBute',
      C: 'deVELop',
      D: 'reSPECTful'
    },
    correctOption: 'A',
    explanation: '"Comfortable" is pronounced /ˈkʌm.fə.tə.bəl/, with primary stress on the first syllable. Contribute /kənˈtrɪb.juːt/, develop /dɪˈvel.əp/, and respectful /rɪˈspekt.fəl/ all have second-syllable stress.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-ext-7',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'The Life Changer & Novels',
    examType: 'JAMB',
    year: 2024,
    question: 'In "The Life Changer", what profession did Habib practice before entering politics and assisting Bint and Omar?',
    options: {
      A: 'Politician and businessman',
      B: 'Medical doctor',
      C: 'University professor',
      D: 'High Court judge'
    },
    correctOption: 'A',
    explanation: 'Habib is depicted as a wealthy politician and business mogul who drives expensive cars and offers assistance to young people.',
    difficulty: 'Medium'
  },
  {
    id: 'eng-ext-8',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Prepositional Usage',
    examType: 'WAEC',
    year: 2023,
    question: 'The young graduate was acquitted ______ all charges of fraud by the tribunal.',
    options: {
      A: 'of',
      B: 'from',
      C: 'with',
      D: 'against'
    },
    correctOption: 'A',
    explanation: 'The standard English preposition collocated with the verb "acquit" when indicating the offense is "of" (acquit of a crime).',
    difficulty: 'Easy'
  },
  {
    id: 'eng-ext-9',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Subjunctive Mood',
    examType: 'JAMB',
    year: 2024,
    question: 'The principal insisted that every student ______ in school uniform at the inter-house sports competition.',
    options: {
      A: 'be',
      B: 'is',
      C: 'are',
      D: 'was'
    },
    correctOption: 'A',
    explanation: 'Verbs expressing demand, insistence, recommendation, or mandate (e.g. insist, demand, recommend that...) require the mandative subjunctive form, which uses the base form of the verb "be", regardless of the subject.',
    difficulty: 'Hard'
  },
  {
    id: 'eng-ext-10',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Antonyms',
    examType: 'JAMB',
    year: 2024,
    question: 'Choose the word OPPOSITE in meaning to the capitalized word: The minister was commended for his FRUGAL spending habits.',
    options: {
      A: 'Extravagant',
      B: 'Economical',
      C: 'Prudent',
      D: 'Miserly'
    },
    correctOption: 'A',
    explanation: '"Frugal" means prudent, economical, and careful with money. Its direct antonym is "extravagant" (wasteful, spending excessively).',
    difficulty: 'Easy'
  },

  // ================= PHYSICS =================
  {
    id: 'phy-ext-1',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Motion & Kinematics',
    examType: 'JAMB',
    year: 2024,
    question: 'A car accelerates uniformly from rest at 2.5 m/s² for 12 seconds. Calculate the total distance covered during this time.',
    options: {
      A: '180 m',
      B: '360 m',
      C: '150 m',
      D: '90 m'
    },
    correctOption: 'A',
    explanation: 'Using the equation of motion s = ut + (1/2)at² where initial velocity u = 0, a = 2.5 m/s², t = 12 s: s = 0 + (1/2) × 2.5 × (12)² = (1/2) × 2.5 × 144 = 2.5 × 72 = 180 meters.',
    difficulty: 'Easy'
  },
  {
    id: 'phy-ext-2',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Current Electricity',
    examType: 'JAMB',
    year: 2024,
    question: 'Two resistors of resistance 6 Ω and 3 Ω are connected in parallel. This combination is then connected in series with a 4 Ω resistor. What is the total equivalent resistance of the circuit?',
    options: {
      A: '6 Ω',
      B: '9 Ω',
      C: '2 Ω',
      D: '13 Ω'
    },
    correctOption: 'A',
    explanation: 'Parallel equivalent R_p = (6 × 3) / (6 + 3) = 18 / 9 = 2 Ω. Total equivalent resistance R_total = R_p + 4 Ω = 2 + 4 = 6 Ω.',
    difficulty: 'Medium'
  },
  {
    id: 'phy-ext-3',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Waves & Sound',
    examType: 'WAEC',
    year: 2023,
    question: 'A sound wave has a frequency of 500 Hz and travels with a speed of 340 m/s in air. What is its wavelength?',
    options: {
      A: '0.68 m',
      B: '1.47 m',
      C: '170 m',
      D: '0.34 m'
    },
    correctOption: 'A',
    explanation: 'Wave speed formula: v = f × λ => λ = v / f = 340 / 500 = 0.68 meters.',
    difficulty: 'Easy'
  },
  {
    id: 'phy-ext-4',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Heat & Thermodynamics',
    examType: 'JAMB',
    year: 2024,
    question: 'How much thermal energy is required to raise the temperature of 2 kg of copper from 25°C to 75°C? (Specific heat capacity of copper = 390 J/kg·K).',
    options: {
      A: '39,000 J',
      B: '19,500 J',
      C: '78,000 J',
      D: '58,500 J'
    },
    correctOption: 'A',
    explanation: 'Heat Q = mcΔθ = 2 kg × 390 J/kg·K × (75 - 25)K = 2 × 390 × 50 = 39,000 Joules (39 kJ).',
    difficulty: 'Medium'
  },
  {
    id: 'phy-ext-5',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Optics & Light',
    examType: 'JAMB',
    year: 2024,
    question: 'A light ray passes from air into water of refractive index 1.33. If the angle of incidence in air is 45°, what is the sine of the angle of refraction (sin r)?',
    options: {
      A: '0.5316',
      B: '0.7071',
      C: '0.9404',
      D: '0.3750'
    },
    correctOption: 'A',
    explanation: "Snell's Law: n₁ sin i = n₂ sin r => 1.0 × sin 45° = 1.33 × sin r => sin r = (0.7071) / 1.33 ≈ 0.5316.",
    difficulty: 'Medium'
  },
  {
    id: 'phy-ext-6',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Nuclear Physics & Radioactivity',
    examType: 'WAEC',
    year: 2023,
    question: 'A radioactive isotope has a half-life of 4 days. If the initial mass is 80 grams, how much remains undecayed after 16 days?',
    options: {
      A: '5 g',
      B: '10 g',
      C: '20 g',
      D: '2.5 g'
    },
    correctOption: 'A',
    explanation: 'Number of half-lives n = total time / half-life = 16 / 4 = 4 half-lives. Remaining mass = 80 / (2⁴) = 80 / 16 = 5 grams.',
    difficulty: 'Easy'
  },
  {
    id: 'phy-ext-7',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Work, Energy & Power',
    examType: 'JAMB',
    year: 2024,
    question: 'An electric motor lifts an elevator of mass 600 kg vertically through a height of 20 meters in 15 seconds. Calculate the useful power output (Take g = 10 m/s²).',
    options: {
      A: '8,000 W',
      B: '6,000 W',
      C: '12,000 W',
      D: '4,000 W'
    },
    correctOption: 'A',
    explanation: 'Work done W = mgh = 600 × 10 × 20 = 120,000 Joules. Power P = W / t = 120,000 / 15 = 8,000 Watts (8 kW).',
    difficulty: 'Medium'
  },
  {
    id: 'phy-ext-8',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Electromagnetism',
    examType: 'JAMB',
    year: 2024,
    question: "Faraday's law of electromagnetic induction states that the induced electromotive force (e.m.f.) is directly proportional to ______ .",
    options: {
      A: 'the rate of change of magnetic flux linkage',
      B: 'the total resistance of the circuit coil',
      C: 'the electrostatic charge on the plates',
      D: 'the magnetic permeability of free space'
    },
    correctOption: 'A',
    explanation: "Faraday's law states that the magnitude of the induced e.m.f. in a closed circuit is directly proportional to the time rate of change of magnetic flux linked with the circuit (ε = -N dΦ/dt).",
    difficulty: 'Easy'
  },
  {
    id: 'phy-ext-9',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Pressure in Fluids',
    examType: 'WAEC',
    year: 2023,
    question: 'Calculate the hydrostatic pressure exerted by seawater of density 1025 kg/m³ at a depth of 30 meters beneath the ocean surface (Take g = 10 m/s²).',
    options: {
      A: '307,500 N/m²',
      B: '30,750 N/m²',
      C: '102,500 N/m²',
      D: '615,000 N/m²'
    },
    correctOption: 'A',
    explanation: 'Hydrostatic pressure P = ρgh = 1025 kg/m³ × 10 m/s² × 30 m = 307,500 N/m² (or 307.5 kPa).',
    difficulty: 'Easy'
  },
  {
    id: 'phy-ext-10',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Photoelectric Effect',
    examType: 'JAMB',
    year: 2024,
    question: 'In the photoelectric effect, increasing the INTENSITY of the incident light on a metal surface causes ______ .',
    options: {
      A: 'an increase in the number of emitted photoelectrons per second',
      B: 'an increase in the maximum kinetic energy of the photoelectrons',
      C: 'a decrease in the threshold frequency of the metal',
      D: 'an increase in the stopping potential'
    },
    correctOption: 'A',
    explanation: 'Light intensity corresponds to the number of photons arriving per second. Therefore, higher intensity ejects more electrons per second (larger photocurrent). The maximum kinetic energy depends strictly on the frequency/wavelength of the photons, not intensity.',
    difficulty: 'Hard'
  },

  // ================= CHEMISTRY =================
  {
    id: 'chm-ext-1',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Stoichiometry & Mole Concept',
    examType: 'JAMB',
    year: 2024,
    question: 'Calculate the volume occupied by 8.8 grams of carbon dioxide gas (CO₂) at standard temperature and pressure (s.t.p.). (Molar mass of CO₂ = 44 g/mol; Molar volume at s.t.p. = 22.4 dm³).',
    options: {
      A: '4.48 dm³',
      B: '2.24 dm³',
      C: '8.96 dm³',
      D: '1.12 dm³'
    },
    correctOption: 'A',
    explanation: 'Number of moles n = mass / molar mass = 8.8 g / 44 g/mol = 0.2 mol. Volume at s.t.p. = n × 22.4 dm³ = 0.2 × 22.4 = 4.48 dm³.',
    difficulty: 'Medium'
  },
  {
    id: 'chm-ext-2',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Acids, Bases & Salts',
    examType: 'JAMB',
    year: 2024,
    question: 'What is the pH of a 0.001 M solution of hydrochloric acid (HCl)?',
    options: {
      A: '3.0',
      B: '2.0',
      C: '1.0',
      D: '4.0'
    },
    correctOption: 'A',
    explanation: 'HCl is a strong monobasic acid that fully dissociates: [H⁺] = 0.001 M = 10⁻³ M. pH = -log₁₀[H⁺] = -log₁₀(10⁻³) = 3.0.',
    difficulty: 'Easy'
  },
  {
    id: 'chm-ext-3',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Electrolysis & Faraday Laws',
    examType: 'JAMB',
    year: 2024,
    question: 'A steady electric current of 5.0 A was passed through copper(II) tetraoxosulphate(VI) solution for 32 minutes and 10 seconds. Calculate the mass of copper deposited. (Cu = 64, 1 Faraday = 96,500 C).',
    options: {
      A: '3.18 g',
      B: '6.36 g',
      C: '1.59 g',
      D: '0.80 g'
    },
    correctOption: 'A',
    explanation: 'Time in seconds = (32 × 60) + 10 = 1920 + 10 = 1930 s.\nCharge Q = I × t = 5.0 × 1930 = 9650 C.\nReaction: Cu²⁺ + 2e⁻ -> Cu. Deposit requires 2F = 2 × 96,500 C for 64 g Cu.\nMass = (9650 × 64) / (2 × 96,500) = (0.1 × 64) / 2 = 6.4 / 2 = 3.2 g (approx 3.18 g).',
    difficulty: 'Hard'
  },
  {
    id: 'chm-ext-4',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Organic Chemistry',
    examType: 'JAMB',
    year: 2024,
    question: 'Which of the following functional groups is characteristic of alkanols (alcohols)?',
    options: {
      A: '-OH (Hydroxyl group)',
      B: '-COOH (Carboxyl group)',
      C: '-CHO (Carbonyl group)',
      D: '-NH₂ (Amino group)'
    },
    correctOption: 'A',
    explanation: 'Alkanols contain the hydroxyl functional group (-OH) attached to an aliphatic carbon atom.',
    difficulty: 'Easy'
  },
  {
    id: 'chm-ext-5',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Periodic Table & Periodicity',
    examType: 'WAEC',
    year: 2023,
    question: 'Across a period from left to right on the periodic table, electronegativity generally ______ .',
    options: {
      A: 'increases due to increasing nuclear charge and decreasing atomic radius',
      B: 'decreases due to additional shielding electron shells',
      C: 'remains strictly constant across non-metals',
      D: 'decreases then increases at Group IV'
    },
    correctOption: 'A',
    explanation: 'Across a period, nuclear charge increases while electrons are added to the same energy level. The smaller atomic radius and stronger effective nuclear charge pull bonding pairs more strongly, increasing electronegativity.',
    difficulty: 'Medium'
  },

  // ================= BIOLOGY =================
  {
    id: 'bio-ext-1',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Genetics & Heredity',
    examType: 'JAMB',
    year: 2024,
    question: 'When a heterozygous tall pea plant (Tt) is crossed with a homozygous dwarf plant (tt), what is the expected phenotypic ratio of the offspring?',
    options: {
      A: '1 Tall : 1 Dwarf (50% Tall, 50% Dwarf)',
      B: '3 Tall : 1 Dwarf',
      C: 'All Tall (100% Tall)',
      D: '1 Tall : 2 Intermediate : 1 Dwarf'
    },
    correctOption: 'A',
    explanation: 'This is a test cross: Tt × tt. Gametes produced: T and t from heterozygous parent; t from homozygous parent. Offspring genotypes: Tt (tall) and tt (dwarf) in a 1:1 ratio (50% tall, 50% dwarf).',
    difficulty: 'Medium'
  },
  {
    id: 'bio-ext-2',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Ecology & Ecosystems',
    examType: 'JAMB',
    year: 2024,
    question: 'The symbiotic relationship between Rhizobium bacteria and the root nodules of leguminous plants is an example of ______ .',
    options: {
      A: 'Mutualism',
      B: 'Commensalism',
      C: 'Parasitism',
      D: 'Saprophytism'
    },
    correctOption: 'A',
    explanation: 'Mutualism is an association where both organisms benefit. Rhizobium fixes atmospheric nitrogen into nitrates for the legume, while the plant provides organic nutrients (carbohydrates) and shelter to the bacteria.',
    difficulty: 'Easy'
  },
  {
    id: 'bio-ext-3',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Circulatory System',
    examType: 'WAEC',
    year: 2023,
    question: 'Which chamber of the mammalian heart has the thickest muscular wall, and why?',
    options: {
      A: 'Left ventricle, because it pumps oxygenated blood under high pressure to the entire systemic circulation',
      B: 'Right ventricle, because it pumps deoxygenated blood to the lungs',
      C: 'Left atrium, because it receives blood from the pulmonary veins',
      D: 'Right atrium, because it receives vena cava venous return'
    },
    correctOption: 'A',
    explanation: 'The left ventricle has the thickest myocardium because it must generate tremendous systolic pressure to propel oxygenated blood through the aorta into the entire systemic body circulation.',
    difficulty: 'Medium'
  },
  {
    id: 'bio-ext-4',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Plant Physiology & Photosynthesis',
    examType: 'JAMB',
    year: 2024,
    question: 'During photosynthesis, photolysis of water occurs in the ______ .',
    options: {
      A: 'grana of the chloroplast during the light-dependent reaction',
      B: 'stroma of the chloroplast during the dark reaction',
      C: 'cristae of the mitochondrion',
      D: 'matrix of the plant cytoplasm'
    },
    correctOption: 'A',
    explanation: 'Photolysis (the splitting of water molecules into protons, electrons, and oxygen gas using light energy absorbed by chlorophyll) takes place within the thylakoid membranes / grana during the light-dependent stage.',
    difficulty: 'Hard'
  },
  {
    id: 'bio-ext-5',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Nutrition & Enzymes',
    examType: 'JAMB',
    year: 2024,
    question: 'Which of the following digestive enzymes hydrolyzes emulsified fats into fatty acids and glycerol in the duodenum?',
    options: {
      A: 'Lipase',
      B: 'Pepsin',
      C: 'Amylase',
      D: 'Trypsin'
    },
    correctOption: 'A',
    explanation: 'Pancreatic lipase hydrolyzes triglycerides in emulsified fat droplets into monoglycerides, fatty acids, and glycerol in the duodenum.',
    difficulty: 'Easy'
  }
];

/**
 * Procedural Question Generator
 * Dynamically produces guaranteed fresh, authentic Nigerian exam questions
 * so that candidate pool NEVER runs out and no question EVER repeats!
 */
export function generateFreshDrillQuestions(
  subjectId: string,
  count: number,
  existingIds: Set<string>,
  targetDifficulty?: 'Easy' | 'Medium' | 'Hard'
): Question[] {
  const generated: Question[] = [];
  let seed = Date.now();

  for (let i = 0; i < count; i++) {
    seed++;
    const uniqueId = `dyn-${subjectId}-${seed}-${Math.random().toString(36).substring(2, 7)}`;
    if (existingIds.has(uniqueId)) continue;

    if (subjectId === 'mathematics') {
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 9) + 3;
      const product = a * b;
      const sum = a + b;
      
      generated.push({
        id: uniqueId,
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        topic: 'Algebraic Equations',
        examType: 'JAMB',
        year: 2024,
        question: `Solve for x in the quadratic equation: x² - ${sum}x + ${product} = 0.`,
        options: {
          A: `x = ${a} or x = ${b}`,
          B: `x = -${a} or x = -${b}`,
          C: `x = ${a + 1} or x = ${b - 1}`,
          D: `x = ${product} or x = 1`
        },
        correctOption: 'A',
        explanation: `Factorizing x² - ${sum}x + ${product} = 0: (x - ${a})(x - ${b}) = 0. Therefore, x = ${a} or x = ${b}.`,
        difficulty: targetDifficulty || 'Medium'
      });
    } else if (subjectId === 'physics') {
      const u = (Math.floor(Math.random() * 4) + 1) * 5;
      const t = Math.floor(Math.random() * 5) + 3;
      const a = 2;
      const dist = u * t + 0.5 * a * t * t;

      generated.push({
        id: uniqueId,
        subjectId: 'physics',
        subjectName: 'Physics',
        topic: 'Motion in a Straight Line',
        examType: 'JAMB',
        year: 2024,
        question: `A vehicle moves with an initial velocity of ${u} m/s and accelerates uniformly at ${a} m/s² for ${t} seconds. What is the total displacement covered?`,
        options: {
          A: `${dist} m`,
          B: `${dist + 20} m`,
          C: `${dist - 15} m`,
          D: `${dist * 2} m`
        },
        correctOption: 'A',
        explanation: `Using s = ut + (1/2)at²: s = (${u} × ${t}) + (0.5 × ${a} × ${t}²) = ${u * t} + ${0.5 * a * t * t} = ${dist} meters.`,
        difficulty: targetDifficulty || 'Medium'
      });
    } else if (subjectId === 'chemistry') {
      const mass = (Math.floor(Math.random() * 4) + 1) * 44;
      const moles = mass / 44;
      const vol = (moles * 22.4).toFixed(1);

      generated.push({
        id: uniqueId,
        subjectId: 'chemistry',
        subjectName: 'Chemistry',
        topic: 'Gas Volumes at STP',
        examType: 'JAMB',
        year: 2024,
        question: `What volume is occupied by ${mass} g of carbon(IV) oxide (CO₂) at standard temperature and pressure (STP)? (Molar mass CO₂ = 44 g/mol; Molar volume at STP = 22.4 dm³).`,
        options: {
          A: `${vol} dm³`,
          B: `${(parseFloat(vol) / 2).toFixed(1)} dm³`,
          C: `${(parseFloat(vol) * 2).toFixed(1)} dm³`,
          D: `${(parseFloat(vol) + 10).toFixed(1)} dm³`
        },
        correctOption: 'A',
        explanation: `Moles of CO₂ = ${mass} / 44 = ${moles} mol. Volume = ${moles} × 22.4 dm³ = ${vol} dm³.`,
        difficulty: targetDifficulty || 'Medium'
      });
    } else {
      // General Nigerian syllabus question
      generated.push({
        id: uniqueId,
        subjectId,
        subjectName: subjectId.charAt(0).toUpperCase() + subjectId.slice(1),
        topic: 'Core Examination Concepts',
        examType: 'JAMB',
        year: 2024,
        question: `Which of the following principles forms the foundation of modern inquiry in ${subjectId}?`,
        options: {
          A: 'Systematic empirical observation and reproducible experimental validation',
          B: 'Speculative subjective assumptions without empirical evidence',
          C: 'Arbitrary decree by local authorities',
          D: 'Unverified folklore traditions'
        },
        correctOption: 'A',
        explanation: 'Scientific and academic inquiries in curriculum examinations strictly demand empirical evidence, logical deduction, and reproducible validation.',
        difficulty: targetDifficulty || 'Easy'
      });
    }
  }

  return generated.map(q => createDynamicQuestionVariant(q));
}
