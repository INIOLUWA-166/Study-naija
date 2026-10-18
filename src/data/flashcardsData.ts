import { Flashcard } from '../types';

export const FLASHCARD_DECKS: Flashcard[] = [
  // Physics Formulas & Laws
  {
    id: 'phy-1',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Motion & Mechanics',
    category: 'formula',
    examType: 'JAMB',
    front: 'What are the 3 Equations of Linear Motion under constant acceleration?',
    back: '1. v = u + at\n2. s = ut + ½at²\n3. v² = u² + 2as\n(where u = initial velocity, v = final velocity, a = acceleration, s = displacement, t = time)',
    formula: 'v = u + at | s = ut + ½at² | v² = u² + 2as',
    mnemonic: 'Vicky Uses All Trains'
  },
  {
    id: 'phy-2',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Optics & Refraction',
    category: 'law',
    examType: 'ALL',
    front: "State Snell's Law of Refraction and the Critical Angle formula",
    back: 'n₁ sin(θ₁) = n₂ sin(θ₂)\nRefractive Index n = sin(i) / sin(r) = Real Depth / Apparent Depth\nCritical Angle formula: sin(C) = 1 / n',
    formula: 'sin(C) = 1 / n',
    mnemonic: 'Light Bends Toward Normal when entering denser medium'
  },
  {
    id: 'phy-3',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Current Electricity',
    category: 'formula',
    examType: 'JAMB',
    front: "State Ohm's Law and Electrical Power dissipated in a resistor",
    back: 'V = IR\nPower formulas: P = IV = I²R = V² / R\nElectrical energy: E = P × t = IVt',
    formula: 'V = I·R | P = I²R = V²/R',
    mnemonic: 'VIP - Voltage Equals Current times Resistance'
  },
  {
    id: 'phy-4',
    subjectId: 'physics',
    subjectName: 'Physics',
    topic: 'Waves & Sound',
    category: 'formula',
    examType: 'ALL',
    front: 'What is the Wave Equation relating Speed, Frequency, and Wavelength?',
    back: 'v = f · λ\n(where v = wave speed in m/s, f = frequency in Hz, λ = wavelength in metres)\nPeriod: T = 1 / f',
    formula: 'v = f · λ',
    mnemonic: 'Velocity = Frequency × Lambda'
  },

  // Chemistry Formulas & Principles
  {
    id: 'chm-1',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Gas Laws',
    category: 'formula',
    examType: 'JAMB',
    front: 'State the Ideal Gas Equation and Combined Gas Law',
    back: 'PV = nRT\n(P = pressure, V = volume, n = moles, R = 8.314 J/mol·K or 0.0821 atm·L/mol·K, T = kelvin temp)\nCombined: (P₁V₁) / T₁ = (P₂V₂) / T₂',
    formula: 'PV = nRT',
    mnemonic: 'Pure Virtue Never Rests Today'
  },
  {
    id: 'chm-2',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Stoichiometry & Moles',
    category: 'formula',
    examType: 'ALL',
    front: 'Formulas for calculating number of moles (n) in chemistry',
    back: '1. n = Mass (m) / Molar Mass (M)\n2. n = Volume of gas at stp / 22.4 dm³\n3. n = Concentration (C) × Volume (V in dm³)\n4. n = Number of particles / 6.02 × 10²³ (Avogadro)',
    formula: 'n = m / M = CV = V(stp) / 22.4',
    mnemonic: 'Mass over Molar, Conc times Volume'
  },
  {
    id: 'chm-3',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Electrochemistry',
    category: 'law',
    examType: 'JAMB',
    front: "State Faraday's 1st and 2nd Laws of Electrolysis",
    back: "1st Law: Mass deposited m ∝ Q => m = ZIt\n2nd Law: Masses deposited by same charge are proportional to chemical equivalents\nFaraday's constant F = 96,500 C/mol",
    formula: 'm = (M · I · t) / (n · F)',
    mnemonic: 'm = ZIt (Zap It Together)'
  },
  {
    id: 'chm-4',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Organic Chemistry',
    category: 'shortcut',
    examType: 'ALL',
    front: 'General formulas of Alkanes, Alkenes, Alkynes, and Alkanols',
    back: 'Alkanes: CₙH₂ₙ₊₂ (saturated single bonds)\nAlkenes: CₙH₂ₙ (contains double bond C=C)\nAlkynes: CₙH₂ₙ₋₂ (contains triple bond C≡C)\nAlkanols: CₙH₂ₙ₊₁OH (hydroxyl group -OH)',
    formula: 'CₙH₂ₙ₊₂ | CₙH₂ₙ | CₙH₂ₙ₋₂',
    mnemonic: 'Add 2, Keep 2, Minus 2'
  },

  // Mathematics Essentials
  {
    id: 'mth-1',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    topic: 'Algebra & Quadratics',
    category: 'formula',
    examType: 'ALL',
    front: 'State the Quadratic Formula and the Discriminant conditions',
    back: 'x = (-b ± √(b² - 4ac)) / (2a)\nDiscriminant Δ = b² - 4ac:\n• Δ > 0: Two real distinct roots\n• Δ = 0: One real repeated root (equal roots)\n• Δ < 0: Complex / no real roots',
    formula: 'x = (-b ± √(b² - 4ac)) / (2a)',
    mnemonic: 'Negative boy couldn\'t decide whether to go to radical party'
  },
  {
    id: 'mth-2',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    topic: 'Sequences & Series (A.P. & G.P.)',
    category: 'formula',
    examType: 'JAMB',
    front: 'Formulas for n-th term and sum of Arithmetic & Geometric Progressions',
    back: 'A.P.: Tₙ = a + (n - 1)d | Sₙ = n/2 [2a + (n - 1)d]\nG.P.: Tₙ = a·rⁿ⁻¹ | Sₙ = a(1 - rⁿ) / (1 - r) for r < 1\nSum to infinity of G.P. S∞ = a / (1 - r) where |r| < 1',
    formula: 'Tₙ = a + (n - 1)d | S∞ = a / (1 - r)',
    mnemonic: 'AP adds common difference, GP multiplies common ratio'
  },
  {
    id: 'mth-3',
    subjectId: 'maths',
    subjectName: 'Mathematics',
    topic: 'Trigonometry & Calculus',
    category: 'shortcut',
    examType: 'ALL',
    front: 'Key Trigonometric Pythagorean Identities and Derivatives',
    back: 'Identities:\n• sin²θ + cos²θ = 1\n• 1 + tan²θ = sec²θ\n• 1 + cot²θ = cosec²θ\nDerivatives:\n• d/dx(xⁿ) = n·xⁿ⁻¹\n• d/dx(sin x) = cos x\n• d/dx(cos x) = -sin x',
    formula: 'sin²θ + cos²θ = 1 | d/dx(xⁿ) = n·xⁿ⁻¹',
    mnemonic: 'SOH CAH TOA & Power Rule'
  },

  // Use of English Grammar & Lexis
  {
    id: 'eng-1',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'Grammatical Concord',
    category: 'rule' as any,
    examType: 'ALL',
    front: 'The Principle of Proximity vs Accompaniment in Concord',
    back: '1. Neither...nor / Either...or: The verb agrees with the NEAREST subject.\nExample: "Neither the teacher nor the students were present."\n2. As well as / Together with / Accompanied by: The verb agrees with the FIRST subject.\nExample: "The captain, as well as his crew, was rescued."',
    mnemonic: 'Proximity = Nearest subject | Accompaniment = First subject'
  },
  {
    id: 'eng-2',
    subjectId: 'english',
    subjectName: 'Use of English',
    topic: 'Oral English & Stress',
    category: 'shortcut',
    examType: 'JAMB',
    front: 'Rules for Stress Placement in 2-Syllable Words',
    back: '• 2-syllable NOUNS & ADJECTIVES: usually stressed on FIRST syllable (PRE-sent, EX-port, CON-duct).\n• 2-syllable VERBS: usually stressed on SECOND syllable (pre-SENT, ex-PORT, con-DUCT).\n• Words ending in -tion, -sion, -ic: stressed on the PENULTIMATE (second to last) syllable (e-DUC-a-tion, dra-MA-tic).',
    mnemonic: 'Noun = First | Verb = Second'
  },

  // Government & Economics
  {
    id: 'gov-1',
    subjectId: 'government',
    subjectName: 'Government',
    topic: 'Nigerian Constitutions',
    category: 'law',
    examType: 'ALL',
    front: 'Milestones of Nigerian Colonial & Post-Independence Constitutions',
    back: '• 1922 Clifford: Introduced elective principle (4 seats: 3 Lagos, 1 Calabar).\n• 1946 Richards: Introduced Regionalism (North, West, East).\n• 1951 Macpherson: Created Council of Ministers, quasi-federal.\n• 1954 Lyttelton: First genuinely Federal constitution.\n• 1960 Independence: Governor-General represented Queen.\n• 1963 Republican: Nnamdi Azikiwe first President, eliminated Privy Council appeals.\n• 1979 Second Republic: Introduced American Executive Presidential system.',
    mnemonic: 'Clifford Elects, Richards Regions, Macpherson Ministers, Lyttelton Federation'
  }
];
