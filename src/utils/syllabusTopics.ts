import { TopicItem } from '../types';

export const SYLLABUS_TOPICS: TopicItem[] = [
  // ================= MATHEMATICS =================
  {
    id: 'topic-math-quad',
    name: 'Quadratic Equations & Polynomials',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Solving quadratic equations via factorization, completing the square, quadratic formula, nature of roots (discriminant Δ = b² - 4ac), and formation of equations with given roots.',
    keyConcepts: [
      'Standard form ax² + bx + c = 0 where a ≠ 0',
      'Quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)',
      'Discriminant analysis: Δ > 0 (two distinct real roots), Δ = 0 (equal real roots), Δ < 0 (complex/no real roots)',
      'Sum of roots (α + β = -b/a) and Product of roots (αβ = c/a)',
      'Forming equations: x² - (sum of roots)x + (product of roots) = 0'
    ],
    formulasOrRules: [
      'x = (-b ± √(b² - 4ac)) / (2a)',
      'α + β = -b/a, αβ = c/a',
      'α² + β² = (α + β)² - 2αβ',
      '1/α + 1/β = (α + β) / (αβ)'
    ],
    frequentJambConcepts: [
      'Finding the value of a constant k when roots are equal',
      'Calculating α² + β² or 1/α + 1/β without solving the equation',
      'Word problems leading to quadratic equations'
    ],
    questionCount: 42
  },
  {
    id: 'topic-math-trig',
    name: 'Trigonometry & Bearing',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Trigonometric ratios (SOH CAH TOA), unit circle special angles (30°, 45°, 60°), Sine & Cosine rules for non-right triangles, 3-figure bearings, and angles of elevation/depression.',
    keyConcepts: [
      'SOH CAH TOA: sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj',
      'Pythagorean identity: sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ',
      'Sine Rule: a / sin A = b / sin B = c / sin C = 2R',
      'Cosine Rule: a² = b² + c² - 2bc cos A',
      'Bearings are always measured clockwise from the North direction using 3 digits (e.g., 045°, 210°)'
    ],
    formulasOrRules: [
      'sin²θ + cos²θ = 1',
      'Area of triangle = 1/2 ab sin C',
      'Cosine rule: cos A = (b² + c² - a²) / (2bc)',
      'tan θ = sin θ / cos θ'
    ],
    frequentJambConcepts: [
      'Trigonometric equations in range 0° ≤ θ ≤ 360°',
      'Bearing calculations between 2 ships or points',
      'Shadow problems with angle of elevation'
    ],
    questionCount: 38
  },
  {
    id: 'topic-math-calc',
    name: 'Calculus: Differentiation & Integration',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Derivatives of algebraic and trigonometric functions, product, quotient and chain rules, turning points (maxima and minima), indefinite and definite integration, and area under curves.',
    keyConcepts: [
      'Power rule: d/dx(xⁿ) = n xⁿ⁻¹',
      'Product rule: d/dx(uv) = u(dv/dx) + v(du/dx)',
      'Quotient rule: d/dx(u/v) = (v du/dx - u dv/dx) / v²',
      'Stationary points occur where dy/dx = 0; d²y/dx² < 0 gives a maximum, d²y/dx² > 0 gives a minimum',
      'Integration as anti-derivative: ∫ xⁿ dx = (xⁿ⁺¹) / (n + 1) + C (for n ≠ -1)'
    ],
    formulasOrRules: [
      'd/dx(axⁿ) = anxⁿ⁻¹',
      '∫ axⁿ dx = (axⁿ⁺¹) / (n+1) + c',
      'Area = ∫[a to b] y dx',
      'Chain rule: dy/dx = (dy/du) × (du/dx)'
    ],
    frequentJambConcepts: [
      'Velocity v = ds/dt and acceleration a = dv/dt in kinematics',
      'Finding coordinates of maximum or minimum points',
      'Definite integrals evaluating limits'
    ],
    questionCount: 36
  },
  {
    id: 'topic-math-seq',
    name: 'Sequences & Series (A.P. & G.P.)',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    educationLevel: 'secondary',
    examType: 'WAEC',
    description: 'Arithmetic Progression (A.P.) with common difference d, Geometric Progression (G.P.) with common ratio r, nth term formulas, sum of first n terms, and sum to infinity (S∞).',
    keyConcepts: [
      'A.P. nth term: Tₙ = a + (n - 1)d',
      'A.P. sum: Sₙ = n/2 [2a + (n - 1)d] = n/2 [a + l]',
      'G.P. nth term: Tₙ = arⁿ⁻¹',
      'G.P. sum: Sₙ = a(1 - rⁿ) / (1 - r) for |r| < 1 or a(rⁿ - 1) / (r - 1) for |r| > 1',
      'Sum to infinity: S∞ = a / (1 - r) valid ONLY when |r| < 1'
    ],
    formulasOrRules: [
      'Tₙ(AP) = a + (n - 1)d',
      'Tₙ(GP) = a·rⁿ⁻¹',
      'S∞ = a / (1 - r)',
      'Arithmetic mean of x and y = (x + y)/2; Geometric mean = √(xy)'
    ],
    frequentJambConcepts: [
      'Finding 1st term and common difference given two arbitrary terms',
      'Recurring decimals converted using sum to infinity',
      'Compound interest as geometric series'
    ],
    questionCount: 30
  },
  {
    id: 'topic-math-stat',
    name: 'Statistics & Probability',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Measures of central tendency (mean, median, mode), measures of dispersion (variance, standard deviation, mean deviation), permutations & combinations, and independent/mutually exclusive probabilities.',
    keyConcepts: [
      'Mean: x̄ = Σfx / Σf',
      'Standard deviation: σ = √[ Σf(x - x̄)² / Σf ]',
      'Probability: P(E) = n(E) / n(S) where 0 ≤ P(E) ≤ 1',
      'Mutually exclusive events: P(A or B) = P(A) + P(B)',
      'Independent events: P(A and B) = P(A) × P(B)',
      'Permutations (order matters) ⁿPᵣ = n! / (n - r)!, Combinations ⁿCᵣ = n! / (r!(n - r)!)'
    ],
    formulasOrRules: [
      'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
      'Variance = [Σfx² / Σf] - (x̄)²',
      'ⁿCᵣ = n! / [r!(n - r)!]',
      'ⁿPᵣ = n! / (n - r)!'
    ],
    frequentJambConcepts: [
      'Drawing without replacement from bags of colored balls',
      'Arranging letters of words with repeated letters',
      'Finding median from frequency distribution table'
    ],
    questionCount: 35
  },

  // ================= ENGLISH LANGUAGE =================
  {
    id: 'topic-eng-concord',
    name: 'Concord & Subject-Verb Agreement',
    subjectId: 'english',
    subjectName: 'English Language',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Mastery of English agreement rules: subject-verb concord, indefinite pronouns, collective nouns, correlative conjunctions (neither...nor, either...or), proximity rule, and parenthetical phrases.',
    keyConcepts: [
      'Basic Rule: A singular subject requires a singular verb; a plural subject takes a plural verb',
      'Rule of Proximity: With "either...or" and "neither...nor", the verb agrees with the closer subject',
      '"As well as", "together with", "along with", "in addition to" do NOT make a singular subject plural',
      'Indefinite pronouns like "everybody", "everyone", "neither of", "either of", "each" always take singular verbs',
      'Collective nouns (committee, jury, family) take singular verbs when acting as a unit, plural when acting individually',
      '"A number of" takes a plural verb, whereas "The number of" takes a singular verb'
    ],
    formulasOrRules: [
      'Neither X nor Y + [verb agrees with Y]',
      'Subject + (with/along with/accompanied by) + [verb agrees with first Subject]',
      'A number of + plural noun + PLURAL verb',
      'The number of + plural noun + SINGULAR verb'
    ],
    frequentJambConcepts: [
      '"Neither the teacher nor the students were present"',
      '"The governor, accompanied by his aides, has arrived"',
      '"One of the boys who have won the prize..." (relative clause concord)'
    ],
    questionCount: 45
  },
  {
    id: 'topic-eng-lexis',
    name: 'Lexis & Structure (Collocations & Prepositions)',
    subjectId: 'english',
    subjectName: 'English Language',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Correct prepositional usage, fixed collocations, phrasal verbs, idioms, sentence structures, and grammatical accuracy for the JAMB UTME Use of English examination.',
    keyConcepts: [
      'Collocations: Certain words naturally pair together (e.g. "take to task", "contrary to", "conducive to", "comply with")',
      'Prepositional pairs: "prefer X to Y" (not prefer than), "congratulate ON" (not congratulate for), "divested OF"',
      'Phrasal verbs: "give in" (yield), "give up" (surrender), "put off" (postpone), "call off" (cancel)',
      'Subjunctive mood: "I suggest that he be present" (not is present)',
      'Inversion after negative adverbs: "Rarely do we see", "Hardly had he arrived when..."'
    ],
    formulasOrRules: [
      'Hardly... WHEN (not than)',
      'No sooner... THAN (not when)',
      'Prefer [Noun/Gerund] TO [Noun/Gerund]',
      'Despite (NO "of") vs In spite of'
    ],
    frequentJambConcepts: [
      'Spotting incorrect prepositions (e.g. "reprimanded for", "invested with")',
      'No sooner had the bell rung than the pupils departed',
      'Selecting the most appropriate word to complete sentences'
    ],
    questionCount: 50
  },
  {
    id: 'topic-eng-oral',
    name: 'Oral English: Vowels, Consonants & Stress Patterns',
    subjectId: 'english',
    subjectName: 'English Language',
    educationLevel: 'secondary',
    examType: 'WAEC',
    description: 'Pure vowel sounds (monophthongs), diphthongs, consonant clusters, silent letters, rhyme schemes, and syllable stress patterns for two-syllable, three-syllable, and polysyllabic words.',
    keyConcepts: [
      'Noun vs Verb Stress: Two-syllable words accented on 1st syllable for nouns (CONduct, REcord, EXport) and 2nd syllable for verbs (conDUCT, reCORD, exPORT)',
      'Suffix rules: Suffixes like -tion, -sion, -ic place stress on the penultimate (second to last) syllable (e.g., e-lec-TRI-ci-ty, de-MO-cra-cy)',
      'Silent letters: "debt" (b silent), "doubt" (b silent), "plumber" (b silent), "subtle" (b silent), "rendezvous" (z & s silent)',
      'Vowel contrast: Short /ɪ/ (sit) vs Long /iː/ (seat); /æ/ (cat) vs /ɑː/ (cart)',
      'Rhyme identification: Words that terminate with identical vowel + consonant sound'
    ],
    formulasOrRules: [
      'Noun: FIRST syllable stressed (OB-ject)',
      'Verb: SECOND syllable stressed (ob-JECT)',
      '-tion/-sion/-ic: Stress PENULTIMATE syllable (pho-to-GRA-phic)',
      '-ate/-ity/-fy: Stress ANTEPENULTIMATE syllable (ce-LE-brate)'
    ],
    frequentJambConcepts: [
      'Identifying the word with the same vowel sound as in "blood" (/ʌ/)',
      'Identifying which syllable carries the primary stress in capital letters',
      'Rhyming pairs in WAEC Section 2 oral tests'
    ],
    questionCount: 40
  },

  // ================= PHYSICS =================
  {
    id: 'topic-phy-mech',
    name: "Newton's Laws of Motion & Momentum",
    subjectId: 'physics',
    subjectName: 'Physics',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: "Inertia, momentum (p = mv), impulse (J = FΔt), conservation of linear momentum in elastic and inelastic collisions, Newton's three fundamental laws, and friction coefficients.",
    keyConcepts: [
      "1st Law (Inertia): A body remains at rest or in uniform motion unless acted upon by a net external force",
      "2nd Law: Net Force = Rate of change of momentum = ma",
      "3rd Law: To every action force, there is an equal and opposite reaction force",
      "Linear Momentum: p = mv (vector quantity); conserved in closed isolated systems",
      "Impulse = Force × time = Change in momentum (FΔt = m(v - u))",
      "Elastic collision (KE and momentum conserved) vs Inelastic collision (only momentum conserved, KE lost as heat/deformation)"
    ],
    formulasOrRules: [
      'F = ma',
      'Impulse J = FΔt = mv - mu',
      'Conservation of momentum: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂',
      'Inelastic coalescing: m₁u₁ + m₂u₂ = (m₁ + m₂)v',
      'Limiting friction F = μR = μmg'
    ],
    frequentJambConcepts: [
      'Rifle recoil velocity calculation',
      'Two cars colliding and moving off together with common velocity',
      'Man in an elevator: apparent weight when accelerating upward (R = m(g + a)) vs downward (R = m(g - a))'
    ],
    questionCount: 38
  },
  {
    id: 'topic-phy-optics',
    name: 'Optics: Reflection, Refraction & Lenses',
    subjectId: 'physics',
    subjectName: 'Physics',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: "Laws of reflection, curved mirrors (concave/convex), Snell's law of refraction (n = sin i / sin r), real and apparent depth, critical angle & total internal reflection, lens formula and magnification.",
    keyConcepts: [
      'Snell’s Law: ₁n₂ = sin i / sin r = v₁ / v₂ = λ₁ / λ₂ = Real depth / Apparent depth',
      'Critical Angle: The angle of incidence in denser medium for which angle of refraction is 90°; sin c = 1/n',
      'Total Internal Reflection conditions: Light must travel from denser to less dense medium, and angle of incidence must exceed critical angle',
      'Lens & Mirror Formula: 1/f = 1/u + 1/v (Real-is-positive convention: convex lens f > 0, concave mirror f > 0)',
      'Magnification: m = v/u = image height / object height',
      'Power of a lens: P = 1/f (in meters), measured in Dioptres (D)'
    ],
    formulasOrRules: [
      '1/f = 1/u + 1/v',
      'n = sin i / sin r = Real depth / Apparent depth',
      'sin c = 1/n',
      'm = v/u = hᵢ / hₒ',
      'P = 1/f (m)'
    ],
    frequentJambConcepts: [
      'Apparent displacement of coin at the bottom of a water beaker',
      'Defects of vision: Myopia (corrected with concave lens) vs Hypermetropia (convex lens)',
      'Optical fibers and mirages as applications of total internal reflection'
    ],
    questionCount: 34
  },
  {
    id: 'topic-phy-elec',
    name: "Current Electricity, Ohm's Law & Capacitors",
    subjectId: 'physics',
    subjectName: 'Physics',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: "Electric current, potential difference, Ohm's Law (V = IR), resistivity (R = ρL/A), series and parallel resistor circuits, internal resistance of cells (E = I(R + r)), electrical power and energy, and capacitors in circuits.",
    keyConcepts: [
      "Ohm's Law: Current is directly proportional to potential difference across a conductor provided temperature remains constant",
      'Resistors in series: R_total = R₁ + R₂ + R₃; Resistors in parallel: 1/R_total = 1/R₁ + 1/R₂',
      'Capacitors in series: 1/C_total = 1/C₁ + 1/C₂; Capacitors in parallel: C_total = C₁ + C₂',
      'EMF and Internal Resistance: E = V + Ir = I(R + r)',
      'Electrical Energy W = VIt = I²Rt = (V²/R)t; Electrical Power P = VI = I²R = V²/R',
      'Commercial electricity cost: Energy in kWh = (Power in Watts × hours) / 1000'
    ],
    formulasOrRules: [
      'V = IR',
      'R = ρL / A',
      'E = I(R + r)',
      'Q = CV',
      'Energy stored in capacitor: W = 1/2 CV² = 1/2 QV'
    ],
    frequentJambConcepts: [
      'Calculating lost volts (Ir) given battery EMF and terminal p.d.',
      'Shunt and Multiplier resistor calculations for galvanometers',
      'Calculating cost of running appliances in Naira using kWh rates'
    ],
    questionCount: 40
  },

  // ================= CHEMISTRY =================
  {
    id: 'topic-chm-periodic',
    name: 'Periodic Table, Atomic Structure & Bonding',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Subatomic particles (protons, neutrons, electrons), electronic configuration (s, p, d, f notation), periodic trends (atomic radius, ionization energy, electronegativity, electron affinity), and ionic vs covalent vs coordinate bonding.',
    keyConcepts: [
      'Aufbau principle, Pauli exclusion principle, and Hund’s rule of maximum multiplicity',
      'Ionization energy increases across a period (left to right) and decreases down a group',
      'Atomic radius decreases across a period due to increasing nuclear charge, and increases down a group',
      'Electronegativity is greatest for Fluorine (4.0) and decreases towards Francium',
      'Ionic bonding: transfer of electrons from metal to non-metal; Covalent bonding: sharing of electron pairs',
      'Coordinate (dative) bond: both shared electrons contributed by one atom (e.g. NH₄⁺, H₃O⁺)'
    ],
    formulasOrRules: [
      'Mass Number A = Protons + Neutrons',
      'Electronic configuration: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰',
      'Isoelectronic species have the same number of electrons',
      'Transition metals: Cr (4s¹ 3d⁵) and Cu (4s¹ 3d¹⁰) anomalous configurations'
    ],
    frequentJambConcepts: [
      'Electronic configuration of Cr, Cu, Fe²⁺ and Fe³⁺',
      'Shapes of molecules using VSEPR (linear, trigonal planar, tetrahedral, bent)',
      'Intermolecular forces: Hydrogen bonding in H₂O, HF, NH₃ causing abnormally high boiling points'
    ],
    questionCount: 38
  },
  {
    id: 'topic-chm-acid',
    name: 'Acids, Bases, Salts & pH Scale',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Arrhenius, Bronsted-Lowry and Lewis acid-base theories, strong vs weak electrolytes, pH and pOH calculations, buffer solutions, volumetric analysis (titration), indicators, and types of salts (normal, acid, basic, double, complex).',
    keyConcepts: [
      'Bronsted-Lowry: Acid is a proton (H⁺) donor; Base is a proton acceptor; conjugate acid-base pairs',
      'pH scale: pH = -log₁₀[H⁺], pOH = -log₁₀[OH⁻], pH + pOH = 14 at 25°C',
      'Titration formula: (CₐVₐ) / (C_bV_b) = nₐ / n_b',
      'Indicators: Methyl orange (pH 3.1-4.4, red in acid, yellow in base), Phenolphthalein (pH 8.3-10, colorless in acid, pink in base)',
      'Types of salts: Acid salt (NaHCO₃, NaHSO₄), Normal salt (NaCl, K₂SO₄), Double salt (Alum), Complex salt ([Cu(NH₃)₄]SO₄)'
    ],
    formulasOrRules: [
      'pH = -log₁₀[H⁺]',
      '[H⁺][OH⁻] = 1.0 × 10⁻¹⁴',
      '(Cₐ × Vₐ) / (C_b × V_b) = nₐ / n_b',
      'Concentration (g/dm³) = Molarity (mol/dm³) × Molar mass (g/mol)'
    ],
    frequentJambConcepts: [
      'Determining suitable indicator for weak acid vs strong base titration (phenolphthalein)',
      'Calculating pH of 0.001 M HCl or 0.05 M H₂SO₄ (dibasic acid: [H⁺] = 2 × 0.05 = 0.1 M, pH = 1)',
      'Action of heat on nitrates (NaNO₃ gives NaNO₂ + O₂, Cu(NO₃)₂ gives CuO + NO₂ + O₂, AgNO₃ gives Ag + NO₂ + O₂)'
    ],
    questionCount: 42
  },
  {
    id: 'topic-chm-org',
    name: 'Organic Chemistry: Hydrocarbons & Functional Groups',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Homologous series, IUPAC nomenclature, isomerism (structural and geometric), alkanes (substitution), alkenes (addition), alkynes, benzene and aromatic compounds, alkanols, alkanoic acids, esters, and saponification.',
    keyConcepts: [
      'Alkanes: CₙH₂ₙ₊₂ (saturated, undergo substitution with halogens in UV light)',
      'Alkenes: CₙH₂ₙ (unsaturated with C=C double bond, decolorizes bromine water and acidified KMnO₄)',
      'Alkynes: CₙH₂ₙ₋₂ (terminal alkynes like ethyne react with ammoniacal AgNO₃ giving white precipitate)',
      'Isomerism: Compounds having same molecular formula but different structural formula (chain, positional, functional)',
      'Markovnikov’s Rule: In addition of HX to asymmetrical alkene, H adds to carbon with more hydrogens',
      'Esterification: Alkanol + Alkanoic acid ⇌ Ester + Water (in presence of conc. H₂SO₄ catalyst)'
    ],
    formulasOrRules: [
      'Alkanes: CₙH₂ₙ₊₂',
      'Alkenes: CₙH₂ₙ',
      'Alkynes: CₙH₂ₙ₋₂',
      'Alkanols: CₙH₂ₙ₊₁OH',
      'Alkanoic acids: CₙH₂ₙ₊₁COOH'
    ],
    frequentJambConcepts: [
      'Test to distinguish ethane, ethene and ethyne',
      'Saponification equation: Fat/Oil + NaOH -> Soap + Glycerol',
      'Fermentation of glucose to ethanol using zymase enzyme'
    ],
    questionCount: 45
  },

  // ================= BIOLOGY =================
  {
    id: 'topic-bio-cell',
    name: 'Cell Biology, Organelles & Transport',
    subjectId: 'biology',
    subjectName: 'Biology',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Cell structure and functions, differences between plant and animal cells, functions of organelles (nucleus, mitochondria, chloroplast, ribosomes, Golgi body), diffusion, osmosis, active transport, and plasmolysis.',
    keyConcepts: [
      'Mitochondria: powerhouse of cell, site of aerobic cellular respiration producing ATP',
      'Chloroplast: contains chlorophyll for photosynthesis in plant cells',
      'Ribosomes: sites of protein synthesis; Endoplasmic Reticulum: transport network (rough has ribosomes, smooth synthesizes lipids)',
      'Plant cell has cell wall (cellulose), large central vacuole, and chloroplasts; animal cell has centrioles and lysosomes',
      'Osmosis: Movement of water molecules from region of lower solute concentration (hypotonic) to higher solute concentration across semi-permeable membrane',
      'Plasmolysis: Shrinking of plant cell cytoplasm away from cell wall when placed in hypertonic solution; Turgidity: firmness in hypotonic solution'
    ],
    formulasOrRules: [
      'Diffusion: down concentration gradient without energy',
      'Active transport: against concentration gradient requiring ATP',
      'Endocytosis (phagocytosis/pinocytosis) vs Exocytosis'
    ],
    frequentJambConcepts: [
      'Effect of placing red blood cells in distilled water (hemolysis / bursting) vs salt solution (crenation / shrinking)',
      'Identifying organelles in diagrammatic representations',
      'Potato strip osmosis experiments in sucrose solutions'
    ],
    questionCount: 35
  },
  {
    id: 'topic-bio-genetics',
    name: 'Genetics, Heredity & Mendelian Laws',
    subjectId: 'biology',
    subjectName: 'Biology',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: "Mendel's laws of segregation and independent assortment, monohybrid and dihybrid crosses, codominance, sex-linked traits (hemophilia, color blindness), ABO blood groups, Rhesus factor, and sickle cell pedigree analysis.",
    keyConcepts: [
      "Mendel's 1st Law (Segregation): Alleles segregate during gamete formation so each gamete carries one allele",
      'Mendel’s 2nd Law: Genes for different traits assort independently during gametogenesis',
      'Phenotypic ratio in monohybrid cross with complete dominance is 3:1; Genotypic ratio is 1:2:1',
      'ABO blood grouping has multiple alleles (Iᴬ, Iᴮ, i): Iᴬ and Iᴮ are codominant, both dominant over recessive i',
      'Sex-linked traits: Carried on the X-chromosome (hemophilia, red-green color blindness); more prevalent in males (XY) because males lack a second X-chromosome to mask recessive gene',
      'Sickle cell trait (HbA HbS) provides selective resistance to malaria; disease is HbS HbS'
    ],
    formulasOrRules: [
      'Monohybrid F2 ratio: 3 dominant : 1 recessive',
      'Dihybrid F2 ratio: 9 : 3 : 3 : 1',
      'Blood group genotypes: A (IᴬIᴬ or Iᴬi), B (IᴮIᴮ or Iᴮi), AB (IᴬIᴮ), O (ii)',
      'Carrier mother (XᴴXʰ) × Normal father (XᴴY) -> 50% daughters carriers, 50% sons hemophiliac'
    ],
    frequentJambConcepts: [
      'Pedigree charts predicting sickle cell genotype in children (HbAA vs HbAS)',
      'Determining parentage using ABO blood group and Rhesus factor compatibility (Erythroblastosis fetalis)',
      'Calculating percentage of offspring with specific phenotypes from Punnett squares'
    ],
    questionCount: 40
  },

  // ================= ECONOMICS =================
  {
    id: 'topic-econ-demand',
    name: 'Theory of Demand, Supply & Price Determination',
    subjectId: 'economics',
    subjectName: 'Economics',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Laws of demand and supply, demand and supply schedules and curves, equilibrium price and quantity, shifts in curves vs movements along curves, price elasticity of demand (PED) and supply (PES), and government price controls.',
    keyConcepts: [
      'Law of Demand: Quantity demanded varies inversely with price, ceteris paribus (downward sloping demand curve)',
      'Law of Supply: Quantity supplied varies directly with price, ceteris paribus (upward sloping supply curve)',
      'Change in quantity demanded (movement along curve caused by price change of the good itself) vs Change in demand (shift of curve caused by income, taste, population)',
      'Equilibrium occurs where Quantity Demanded = Quantity Supplied (Qd = Qs)',
      'Price Elasticity of Demand (PED) = (% change in quantity demanded) / (% change in price)',
      'Maximum price control (price ceiling below equilibrium creates shortages/black market); Minimum price control (price floor above equilibrium creates surpluses)'
    ],
    formulasOrRules: [
      'Qd = a - bP',
      'Qs = c + dP',
      'Equilibrium: Qd = Qs',
      'PED = (ΔQ / ΔP) × (P₁ / Q₁)',
      'Total Revenue TR = Price × Quantity'
    ],
    frequentJambConcepts: [
      'Given Qd = 40 - 2P and Qs = 10 + 3P, calculate equilibrium price and quantity',
      'Effect of tax on supply curve and tax incidence on consumer vs producer',
      'Cross elasticity of demand for substitute goods (+ve) vs complementary goods (-ve)'
    ],
    questionCount: 36
  },
  {
    id: 'topic-econ-money',
    name: 'Money, Commercial Banking & Central Bank Policy',
    subjectId: 'economics',
    subjectName: 'Economics',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Evolution and functions of money, barter system defects, credit creation by commercial banks, functions of Central Bank of Nigeria (CBN), monetary policy instruments (CRR, MPR, open market operations), and inflation control.',
    keyConcepts: [
      'Functions of Money: Medium of exchange, unit of account, store of value, standard for deferred payment',
      'Defects of Barter: Lack of double coincidence of wants, indivisibility of goods, lack of common measure of value',
      'Credit Creation: Commercial banks expand deposits via credit multiplier = 1 / Cash Reserve Ratio (CRR)',
      'CBN Functions: Sole issuer of legal tender, banker to banks and government, lender of last resort, foreign reserve management',
      'Monetary Policy Tools to curb inflation: Increase MPR (interest rate), Increase Cash Reserve Ratio, Sell Treasury Bills (OMO)'
    ],
    formulasOrRules: [
      'Bank Deposit Multiplier = 1 / Cash Reserve Ratio',
      'Total Credit Created = Initial Deposit × Multiplier',
      'Fisher’s Equation of Exchange: MV = PT (Money supply × Velocity = Price level × Transactions)'
    ],
    frequentJambConcepts: [
      'Calculating total money created given initial cash deposit of ₦100,000 and 10% reserve ratio',
      'Distinction between expansionary and contractionary monetary policies',
      'Causes of demand-pull vs cost-push inflation in Nigeria'
    ],
    questionCount: 32
  },

  // ================= GOVERNMENT =================
  {
    id: 'topic-gov-const',
    name: 'Nigerian Constitutional Developments (1922 to 1999)',
    subjectId: 'government',
    subjectName: 'Government',
    educationLevel: 'secondary',
    examType: 'JAMB',
    description: 'Analysis of colonial constitutions (Clifford 1922, Richards 1946, Macpherson 1951, Lyttelton 1954, Independence 1960, Republican 1963, 1979 Second Republic, and 1999 Constitution).',
    keyConcepts: [
      'Clifford Constitution 1922: Introduced elective principle in Nigeria for the first time (4 elected seats: 3 Lagos, 1 Calabar) and established Nigerian National Democratic Party (NNDP)',
      'Richards Constitution 1946: Introduced regionalism dividing Nigeria into North, West, and East; sought to promote unity among diverse groups',
      'Macpherson Constitution 1951: Created Council of Ministers and semi-responsible government with wide public consultations',
      'Lyttelton Constitution 1954: Established true federalism in Nigeria, creating autonomous regions with separate premier and civil service',
      '1963 Republican Constitution: Replaced Queen of England with ceremonial Nigerian President (Dr. Nnamdi Azikiwe) and Supreme Court became highest court of appeal instead of British Privy Council',
      '1979 & 1999 Constitutions: Adopted American-style Executive Presidential system with separation of powers'
    ],
    formulasOrRules: [
      '1922: Elective Principle (Clifford)',
      '1946: Regionalism (Richards)',
      '1954: Federalism (Lyttelton)',
      '1963: Republic & Privy Council abolished',
      '1979: Executive Presidency'
    ],
    frequentJambConcepts: [
      'Which constitution first introduced federalism in Nigeria? (Lyttelton 1954)',
      'The Supreme Court replaced the British Privy Council as court of last appeal under which constitution? (1963 Republican Constitution)',
      'Number of seats allocated under the Clifford 1922 elective principle'
    ],
    questionCount: 35
  },

  // ================= PRIMARY EDUCATION LEVEL =================
  {
    id: 'topic-pri-math-frac',
    name: 'Fractions, Decimals & Percentages',
    subjectId: 'primary-math',
    subjectName: 'Primary Mathematics',
    educationLevel: 'primary',
    examType: 'COMMON_ENTRANCE',
    description: 'Proper, improper and mixed fractions, addition, subtraction, multiplication, and division of fractions using BODMAS, converting decimals to percentages, and practical word problems for National Common Entrance.',
    keyConcepts: [
      'BODMAS rule: Brackets, Order/Of, Division, Multiplication, Addition, Subtraction',
      'Converting mixed fraction to improper fraction: a b/c = (ac + b) / c',
      'Division of fractions: Invert divisor and multiply (a/b ÷ c/d = a/b × d/c)',
      'Percentage is out of 100: 25% = 25/100 = 1/4 = 0.25',
      'Ratio and sharing: Divide total by sum of ratio parts, multiply by each share'
    ],
    formulasOrRules: [
      'a/b ÷ c/d = (a/b) × (d/c)',
      'Percentage = (Part / Whole) × 100%',
      'Simple Interest I = (P × R × T) / 100',
      'Profit % = (Profit / Cost Price) × 100%'
    ],
    frequentJambConcepts: [
      'National Common Entrance word problems on sharing money in ratio 3:5',
      'Calculating cost price when selling price and profit percentage are given'
    ],
    questionCount: 28
  },

  // ================= UNIVERSITY GST =================
  {
    id: 'topic-uni-gst-logic',
    name: 'Philosophy & Logic (GST 102)',
    subjectId: 'uni-gst102',
    subjectName: 'Philosophy & Logic',
    educationLevel: 'university',
    examType: 'UNIVERSITY_GST',
    description: 'Nature and branches of philosophy (metaphysics, epistemology, ethics, logic), arguments and propositions, deductive vs inductive reasoning, formal and informal logical fallacies.',
    keyConcepts: [
      'Branches of Philosophy: Metaphysics (nature of reality), Epistemology (theory of knowledge), Ethics (morality), Logic (principles of correct reasoning)',
      'Deductive argument: If premises are true, conclusion MUST be true (validity vs soundness)',
      'Inductive argument: Premises provide probabilistic support for conclusion (strength vs cogency)',
      'Fallacy of Ad Hominem: Attacking the person rather than addressing their argument',
      'Fallacy of Appeal to Authority (Ad Verecundiam), Straw Man, Post Hoc Ergo Propter Hoc (false cause)',
      'Laws of Thought: Law of Identity (A is A), Law of Non-Contradiction (A cannot be both B and not-B), Law of Excluded Middle'
    ],
    formulasOrRules: [
      'Modus Ponens: If P then Q; P; Therefore Q',
      'Modus Tollens: If P then Q; Not Q; Therefore Not P',
      'Fallacy of Affirming the Consequent: If P then Q; Q; Therefore P (INVALID)'
    ],
    frequentJambConcepts: [
      'Identifying formal fallacies in university 100L GST exam scenarios',
      'Distinguishing between a sound argument and a valid argument'
    ],
    questionCount: 30
  }
];
