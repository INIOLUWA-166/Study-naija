import { Question } from '../types';

/**
 * Authentic JAMB UTME Past Examination Questions
 * Curated from official JAMB UTME past papers (2015 - 2025)
 * with verified marking schemes and step-by-step teacher explanations.
 */
export const AUTHENTIC_JAMB_PAST_QUESTIONS: Question[] = [
  // ==========================================
  // USE OF ENGLISH (JAMB 2018 - 2025)
  // ==========================================
  {
    id: 'jamb-eng-2025-1',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Lexis & Structure (Concord)',
    examType: 'JAMB',
    year: 2025,
    question: 'The chairman, together with his committee members, _______ arrived at the venue of the summit.',
    options: {
      A: 'have',
      B: 'has',
      C: 'are',
      D: 'were'
    },
    correctOption: 'B',
    explanation: 'In English grammar, parenthetical expressions like "together with", "as well as", "alongside", and "in addition to" do not alter the number of the true subject. The true singular subject is "The chairman", so the singular verb "has" is required.',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-eng-2024-1',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Synonyms & Antonyms',
    examType: 'JAMB',
    year: 2024,
    question: 'Choose the word that is OPPOSITE in meaning to the capitalized word: The suspect gave an INGENUOUS confession to the investigating police officer.',
    options: {
      A: 'Candid',
      B: 'Deceitful',
      C: 'Sincere',
      D: 'Naive'
    },
    correctOption: 'B',
    explanation: '"Ingenuous" means innocent, honest, frank, or unsuspecting. The antonym (opposite in meaning) is "Deceitful" (crafty, dishonest, or misleading). Note: Do not confuse "ingenuous" with "ingenious" (clever).',
    difficulty: 'Hard'
  },
  {
    id: 'jamb-eng-2024-2',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Oral English & Phonology (Vowel Sounds)',
    examType: 'JAMB',
    year: 2024,
    question: 'Choose the word that has the SAME vowel sound as the one represented by the underlined letters in the given word: "KEY" (/i:/)',
    options: {
      A: 'quay',
      B: 'gauge',
      C: 'height',
      D: 'grey'
    },
    correctOption: 'A',
    explanation: 'The word "quay" is pronounced /ki:/, which contains the exact long vowel sound /i:/ found in "key" (/ki:/). "Gauge" has /eɪ/, "height" has /aɪ/, and "grey" has /eɪ/.',
    difficulty: 'Hard'
  },
  {
    id: 'jamb-eng-2023-1',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'The Life Changer (Novel)',
    examType: 'JAMB',
    year: 2023,
    question: 'In Khadija Abubakar Jalli\'s "The Life Changer", what was the primary reason Salma failed her final university examination in the novel?',
    options: {
      A: 'She missed the exam due to chronic illness',
      B: 'She was caught engaging in examination malpractice and expelled',
      C: 'She refused to attend lectures because of campus politics',
      D: 'Her hostel room caught fire during the revision week'
    },
    correctOption: 'B',
    explanation: 'In "The Life Changer", Salma involved herself in exam malpractice by relying on a male friend to help sign and pass unauthorized answers, leading to her apprehension by the Examination Malpractice Committee and subsequent expulsion from the university.',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-eng-2022-1',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Idioms & Idiomatic Expressions',
    examType: 'JAMB',
    year: 2022,
    question: 'Select the option that best explains the idiom: When the treasury audit began, the accountant "threw in the towel".',
    options: {
      A: 'Cleaned the office floor thoroughly',
      B: 'Admitted defeat and surrendered',
      C: 'Challenged the auditors to a physical duel',
      D: 'Hid the remaining cash vouchers in a bag'
    },
    correctOption: 'B',
    explanation: 'The idiom "to throw in the towel" originated in boxing, where a fighter\'s corner throws a towel into the ring to concede defeat. It means to admit failure or abandon an impossible struggle.',
    difficulty: 'Easy'
  },

  // ==========================================
  // MATHEMATICS (JAMB 2018 - 2025)
  // ==========================================
  {
    id: 'jamb-mth-2025-1',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Calculus (Differentiation & Integration)',
    examType: 'JAMB',
    year: 2025,
    question: 'Evaluate the definite integral ∫ from 1 to 3 of (3x² - 4x + 1) dx.',
    options: {
      A: '12',
      B: '14',
      C: '16',
      D: '18'
    },
    correctOption: 'A',
    explanation: 'Integrating term by term: ∫(3x² - 4x + 1) dx = [x³ - 2x² + x] from 1 to 3.\nAt upper limit x = 3: (3³ - 2(3²) + 3) = 27 - 18 + 3 = 12.\nAt lower limit x = 1: (1³ - 2(1²) + 1) = 1 - 2 + 1 = 0.\nResult = 12 - 0 = 12.',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-mth-2024-1',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Indices & Logarithms',
    examType: 'JAMB',
    year: 2024,
    question: 'Solve for x if log₁₀(x² + 36) - 2log₁₀(x) = 1.',
    options: {
      A: 'x = 2',
      B: 'x = 3',
      C: 'x = 4',
      D: 'x = 6'
    },
    correctOption: 'A',
    explanation: 'Using log laws: log₁₀(x² + 36) - log₁₀(x²) = 1 => log₁₀((x² + 36)/x²) = 1.\nConvert to index form: (x² + 36)/x² = 10¹ = 10.\nx² + 36 = 10x² => 9x² = 36 => x² = 4 => x = 2 (since log arguments must be positive, x > 0).',
    difficulty: 'Hard'
  },
  {
    id: 'jamb-mth-2023-1',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Matrices & Determinants',
    examType: 'JAMB',
    year: 2023,
    question: 'If the matrix A = [[2, k], [3, 6]] is a singular matrix, determine the value of the constant k.',
    options: {
      A: '1',
      B: '2',
      C: '3',
      D: '4'
    },
    correctOption: 'D',
    explanation: 'A matrix is singular if and only if its determinant equals zero.\n|A| = (2 × 6) - (3 × k) = 0 => 12 - 3k = 0 => 3k = 12 => k = 4.',
    difficulty: 'Easy'
  },
  {
    id: 'jamb-mth-2022-1',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Trigonometry & Bearings',
    examType: 'JAMB',
    year: 2022,
    question: 'From the top of a cliff 60m high, the angle of depression of a canoe on the sea is 30°. How far is the canoe from the base of the cliff?',
    options: {
      A: '60√3 m',
      B: '30√3 m',
      C: '120 m',
      D: '20√3 m'
    },
    correctOption: 'A',
    explanation: 'By alternate angles, angle of elevation from the canoe to the cliff top is 30°. In right triangle: tan(30°) = opposite / adjacent = 60 / d.\nSince tan(30°) = 1/√3, we have 1/√3 = 60 / d => d = 60√3 meters (approx 103.92m).',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-mth-2021-1',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Coordinate Geometry',
    examType: 'JAMB',
    year: 2021,
    question: 'Find the equation of the line perpendicular to 2x - 3y + 5 = 0 and passing through the point (1, -2).',
    options: {
      A: '3x + 2y + 1 = 0',
      B: '3x - 2y - 7 = 0',
      C: '2x + 3y + 4 = 0',
      D: '3x + 2y - 1 = 0'
    },
    correctOption: 'A',
    explanation: 'Rewrite line in slope-intercept form: 3y = 2x + 5 => y = (2/3)x + 5/3. Slope m₁ = 2/3.\nPerpendicular slope m₂ = -1/m₁ = -3/2.\nUsing point-slope formula with (1, -2): y - (-2) = -3/2(x - 1) => 2(y + 2) = -3(x - 1) => 2y + 4 = -3x + 3 => 3x + 2y + 1 = 0.',
    difficulty: 'Hard'
  },

  // ==========================================
  // PHYSICS (JAMB 2018 - 2025)
  // ==========================================
  {
    id: 'jamb-phy-2025-1',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Current Electricity & Resistance',
    examType: 'JAMB',
    year: 2025,
    question: 'A battery of e.m.f. 12V and internal resistance 1Ω is connected across a resistor of resistance 5Ω. Calculate the terminal potential difference across the battery.',
    options: {
      A: '8V',
      B: '10V',
      C: '12V',
      D: '2V'
    },
    correctOption: 'B',
    explanation: 'Total circuit resistance R_total = R + r = 5Ω + 1Ω = 6Ω.\nCircuit current I = E / R_total = 12V / 6Ω = 2A.\nTerminal potential difference V = I × R = 2A × 5Ω = 10V (or V = E - Ir = 12 - 2(1) = 10V).',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-phy-2024-1',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Modern Physics & Photoelectric Effect',
    examType: 'JAMB',
    year: 2024,
    question: 'In the photoelectric effect experiment, which of the following characteristics of incident light determines the maximum kinetic energy of emitted photoelectrons?',
    options: {
      A: 'Intensity of incident light',
      B: 'Frequency of incident light',
      C: 'Duration of illumination',
      D: 'Angle of incidence'
    },
    correctOption: 'B',
    explanation: 'According to Einstein\'s photoelectric equation (E_k = hf - W₀), the maximum kinetic energy of emitted electrons depends solely on the frequency (or wavelength) of the incident radiation, whereas intensity determines the number (rate) of electrons emitted.',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-phy-2023-1',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Waves & Optics',
    examType: 'JAMB',
    year: 2023,
    question: 'A sound wave of frequency 660 Hz travels through air with a velocity of 330 m/s. Calculate the wavelength of the sound wave.',
    options: {
      A: '0.25 m',
      B: '0.50 m',
      C: '1.00 m',
      D: '2.00 m'
    },
    correctOption: 'B',
    explanation: 'Wave velocity formula: v = f × λ.\nTherefore, wavelength λ = v / f = (330 m/s) / (660 s⁻¹) = 0.50 meters.',
    difficulty: 'Easy'
  },
  {
    id: 'jamb-phy-2022-1',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Heat Energy & Gas Laws',
    examType: 'JAMB',
    year: 2022,
    question: 'An ideal gas occupies a volume of 400 cm³ at 27°C and pressure of 750 mmHg. What volume will it occupy at standard temperature and pressure (s.t.p.: 0°C, 760 mmHg)?',
    options: {
      A: '359.2 cm³',
      B: '394.7 cm³',
      C: '444.4 cm³',
      D: '412.5 cm³'
    },
    correctOption: 'A',
    explanation: 'General gas law: (P₁V₁)/T₁ = (P₂V₂)/T₂.\nGiven: P₁ = 750, V₁ = 400, T₁ = 27 + 273 = 300K; P₂ = 760, T₂ = 0 + 273 = 273K.\nV₂ = (P₁ × V₁ × T₂) / (P₂ × T₁) = (750 × 400 × 273) / (760 × 300) = 81,900,000 / 228,000 ≈ 359.2 cm³.',
    difficulty: 'Hard'
  },

  // ==========================================
  // CHEMISTRY (JAMB 2018 - 2025)
  // ==========================================
  {
    id: 'jamb-chm-2025-1',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Organic Chemistry (Hydrocarbons)',
    examType: 'JAMB',
    year: 2025,
    question: 'Which of the following organic compounds will decolorize acidified potassium tetraoxomanganate(VII) solution and give a yellow precipitate with ammoniacal silver nitrate?',
    options: {
      A: 'Ethane',
      B: 'Ethene',
      C: 'Ethyne',
      D: 'Ethanol'
    },
    correctOption: 'C',
    explanation: 'Terminal alkynes containing the -C≡C-H group (such as ethyne, acetylene) react with ammoniacal silver nitrate to form a characteristic light-yellow/white precipitate of silver dicarbide (AgC≡CAg). Alkenes decolorize KMnO₄ but do NOT precipitate with ammoniacal silver nitrate.',
    difficulty: 'Hard'
  },
  {
    id: 'jamb-chm-2024-1',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Acids, Bases & Salts (pH Calculations)',
    examType: 'JAMB',
    year: 2024,
    question: 'What is the pH of a 0.005 mol/dm³ solution of tetraoxosulphate(VI) acid (H₂SO₄)?',
    options: {
      A: '1.0',
      B: '2.0',
      C: '2.3',
      D: '3.0'
    },
    correctOption: 'B',
    explanation: 'H₂SO₄ is a strong dibasic acid that dissociates completely: H₂SO₄ → 2H⁺ + SO₄²⁻.\n[H⁺] = 2 × 0.005 mol/dm³ = 0.01 mol/dm³ = 10⁻² mol/dm³.\npH = -log₁₀[H⁺] = -log₁₀(10⁻²) = 2.0.',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-chm-2023-1',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Electrochemistry & Faraday Laws',
    examType: 'JAMB',
    year: 2023,
    question: 'Calculate the quantity of electricity in Coulombs required to deposit 0.5 mole of copper from an aqueous solution of copper(II) tetraoxosulphate(VI). (1 Faraday = 96,500 C).',
    options: {
      A: '48,250 C',
      B: '96,500 C',
      C: '193,000 C',
      D: '24,125 C'
    },
    correctOption: 'B',
    explanation: 'Electrode reaction: Cu²⁺ + 2e⁻ → Cu.\nTo deposit 1 mole of Cu requires 2 Faradays of electricity.\nTo deposit 0.5 mole of Cu requires 0.5 × 2 = 1 Faraday = 96,500 Coulombs.',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-chm-2022-1',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Atomic Structure & Periodic Table',
    examType: 'JAMB',
    year: 2022,
    question: 'The electronic configuration of an element X is 1s² 2s² 2p⁶ 3s² 3p⁴. In the periodic table, element X belongs to:',
    options: {
      A: 'Period 3, Group 4',
      B: 'Period 4, Group 6',
      C: 'Period 3, Group 6',
      D: 'Period 2, Group 4'
    },
    correctOption: 'C',
    explanation: 'The highest principal quantum number n = 3, so element X belongs to Period 3. The total number of valence electrons in the outermost shell (n=3) is 2 (from 3s) + 4 (from 3p) = 6 valence electrons, placing it in Group 6 (or Group 16, Oxygen family, Sulfur).',
    difficulty: 'Easy'
  },

  // ==========================================
  // BIOLOGY (JAMB 2018 - 2025)
  // ==========================================
  {
    id: 'jamb-bio-2025-1',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Genetics & Heredity',
    examType: 'JAMB',
    year: 2025,
    question: 'A man with blood group A (heterozygous) marries a woman with blood group B (heterozygous). What is the probability of them giving birth to a child with blood group O?',
    options: {
      A: '0%',
      B: '25%',
      C: '50%',
      D: '75%'
    },
    correctOption: 'B',
    explanation: 'Genotypes of parents: Father is I^A i; Mother is I^B i.\nPunnett Square cross:\n- I^A × I^B = I^A I^B (Group AB, 25%)\n- I^A × i = I^A i (Group A, 25%)\n- i × I^B = I^B i (Group B, 25%)\n- i × i = ii (Group O, 25%).\nThe probability of blood group O is 1 out of 4, or 25%.',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-bio-2024-1',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Cell Biology & Organelles',
    examType: 'JAMB',
    year: 2024,
    question: 'Which cellular organelle contains hydrolytic digestive enzymes responsible for intracellular digestion and autolysis of worn-out cell parts?',
    options: {
      A: 'Ribosome',
      B: 'Mitochondrion',
      C: 'Lysosome',
      D: 'Endoplasmic Reticulum'
    },
    correctOption: 'C',
    explanation: 'Lysosomes are membrane-bound cellular sacs containing powerful hydrolytic enzymes that break down engulfed bacteria, foreign bodies, and defective cellular organelles. They are often called the "suicide bags" of the cell.',
    difficulty: 'Easy'
  },
  {
    id: 'jamb-bio-2023-1',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Ecology & Nutrient Cycles',
    examType: 'JAMB',
    year: 2023,
    question: 'In the nitrogen cycle, which group of bacteria converts nitrites (NO₂⁻) into nitrates (NO₃⁻) in well-aerated fertile soils?',
    options: {
      A: 'Nitrosomonas',
      B: 'Nitrobacter',
      C: 'Azotobacter',
      D: 'Rhizobium'
    },
    correctOption: 'B',
    explanation: 'Nitrification occurs in two stages: First, Nitrosomonas bacteria oxidize ammonia/ammonium into nitrites (NO₂⁻). Second, Nitrobacter bacteria oxidize nitrites into nitrates (NO₃⁻), which are readily absorbed by plant roots.',
    difficulty: 'Medium'
  },

  // ==========================================
  // ECONOMICS (JAMB 2018 - 2025)
  // ==========================================
  {
    id: 'jamb-eco-2025-1',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Price Elasticity of Demand',
    examType: 'JAMB',
    year: 2025,
    question: 'When the price of petrol increases from ₦600 to ₦750 per liter, the quantity demanded falls from 200 liters to 180 liters. Calculate the price elasticity of demand.',
    options: {
      A: '0.40',
      B: '0.50',
      C: '2.50',
      D: '1.20'
    },
    correctOption: 'A',
    explanation: 'Percentage change in quantity demanded = ((180 - 200) / 200) × 100% = -10%.\nPercentage change in price = ((750 - 600) / 600) × 100% = +25%.\nPrice Elasticity of Demand (Ped) = |%ΔQ / %ΔP| = 10% / 25% = 0.40 (Inelastic demand).',
    difficulty: 'Medium'
  },
  {
    id: 'jamb-eco-2024-1',
    subjectId: 'economics',
    subjectName: 'Economics',
    topic: 'Money & Banking (Central Bank Policy)',
    examType: 'JAMB',
    year: 2024,
    question: 'To curb severe hyperinflation in Nigeria, which monetary policy measure should the Central Bank of Nigeria (CBN) employ?',
    options: {
      A: 'Lower the Monetary Policy Rate (MPR)',
      B: 'Buy government treasury bills on the open market',
      C: 'Raise the Cash Reserve Ratio (CRR) and increase interest rates',
      D: 'Print more bank currency notes'
    },
    correctOption: 'C',
    explanation: 'To fight inflation, the central bank implements a contractionary monetary policy: increasing the Cash Reserve Ratio (CRR) locks up commercial bank funds, and raising interest rates reduces borrowing and money supply in the economy.',
    difficulty: 'Medium'
  },

  // ==========================================
  // GOVERNMENT (JAMB 2018 - 2025)
  // ==========================================
  {
    id: 'jamb-gov-2025-1',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Constitutional Development in Nigeria',
    examType: 'JAMB',
    year: 2025,
    question: 'Which Nigerian colonial constitution officially introduced the elective principle for the first time in 1922?',
    options: {
      A: 'Clifford Constitution',
      B: 'Richards Constitution',
      C: 'Macpherson Constitution',
      D: 'Lyttelton Constitution'
    },
    correctOption: 'A',
    explanation: 'The Hugh Clifford Constitution of 1922 introduced the elective principle for the first time in Nigeria, creating four elected legislative council seats (3 for Lagos and 1 for Calabar), which stimulated the formation of Nigeria\'s first political party (NNDP) by Herbert Macaulay.',
    difficulty: 'Easy'
  },
  {
    id: 'jamb-gov-2024-1',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Federalism & Exclusive Legislative List',
    examType: 'JAMB',
    year: 2024,
    question: 'Under the 1999 Constitution of the Federal Republic of Nigeria, which of the following subjects is on the Exclusive Legislative List reserved solely for the National Assembly?',
    options: {
      A: 'Collection of market stall fees',
      B: 'Defense and National Security',
      C: 'Secondary school curriculum management',
      D: 'Local government chieftaincy titles'
    },
    correctOption: 'B',
    explanation: 'The Exclusive Legislative List in the Second Schedule of the 1999 Constitution contains matters on which only the Federal Government (National Assembly) can legislate, including Defense, Foreign Affairs, Currency, Citizenship, and Customs.',
    difficulty: 'Easy'
  },

  // ==========================================
  // LITERATURE IN ENGLISH (JAMB 2022 - 2025)
  // ==========================================
  {
    id: 'jamb-lit-2025-1',
    subjectId: 'literature',
    subjectName: 'Literature in English',
    topic: 'Literary Appreciation & Devices',
    examType: 'JAMB',
    year: 2025,
    question: '"The wind wailed mournfully across the deserted village." What literary figure of speech is employed in this sentence?',
    options: {
      A: 'Hyperbole',
      B: 'Personification',
      C: 'Metonymy',
      D: 'Synecdoche'
    },
    correctOption: 'B',
    explanation: 'Personification is the attribution of human characteristics, emotions, or behaviors to non-human objects or phenomena. Here, the non-human "wind" is described as "wailing mournfully", which is a human action.',
    difficulty: 'Easy'
  },
  {
    id: 'jamb-lit-2024-1',
    subjectId: 'literature',
    subjectName: 'Literature in English',
    topic: 'African Prose (Second Class Citizen by Buchi Emecheta)',
    examType: 'JAMB',
    year: 2024,
    question: 'In Buchi Emecheta\'s novel "Second Class Citizen", what is the primary societal struggle Adah faces in London?',
    options: {
      A: 'Religious discrimination by Catholic missionaries',
      B: 'Racial prejudice and domestic oppression while striving for self-realization',
      C: 'Deportation proceedings initiated by immigration authorities',
      D: 'Loss of her legal credentials during sea transit'
    },
    correctOption: 'B',
    explanation: 'In "Second Class Citizen", Adah journeys to the UK only to discover that black immigrants are treated as "second class citizens", navigating intense racial bias, poverty, and severe marital abuse from her husband Francis while pursuing her career as a librarian and writer.',
    difficulty: 'Medium'
  },

  // ==========================================
  // CHRISTIAN RELIGIOUS STUDIES (JAMB 2022 - 2025)
  // ==========================================
  {
    id: 'jamb-crs-2025-1',
    subjectId: 'crs',
    subjectName: 'Christian Religious Studies',
    topic: 'The Early Life & Ministry of Jesus',
    examType: 'JAMB',
    year: 2025,
    question: 'According to the Gospel of Matthew, which of the following Old Testament scriptures did Jesus quote to defeat the devil\'s first temptation in the wilderness?',
    options: {
      A: 'You shall not put the Lord your God to the test',
      B: 'Man shall not live by bread alone, but by every word that comes from the mouth of God',
      C: 'You shall worship the Lord your God and him only shall you serve',
      D: 'The Lord is my shepherd, I shall not want'
    },
    correctOption: 'B',
    explanation: 'In Matthew 4:4, when the tempter told Jesus to turn stones into bread, Jesus responded by quoting Deuteronomy 8:3: "Man shall not live by bread alone, but by every word that comes from the mouth of God."',
    difficulty: 'Medium'
  }
];
