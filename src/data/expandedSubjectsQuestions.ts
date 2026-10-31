import { Subject, Question } from '../types';

export const ADDITIONAL_SECONDARY_SUBJECTS: Subject[] = [
  // ==========================================
  // ART & HUMANITIES SUBJECTS (IRL)
  // ==========================================
  {
    id: 'literature',
    name: 'Literature in English',
    code: 'LIT',
    icon: 'BookMarked',
    educationLevel: 'secondary',
    department: 'art',
    description: 'African & Non-African Prose, Drama, Poetry, and Literary Appreciation (Wole Soyinka, Buchi Emecheta, Shakespeare).',
    topics: [
      'African Drama (The Lion & the Jewel)',
      'African Prose (Second Class Citizen)',
      'Non-African Drama (Fences by August Wilson)',
      'Non-African Prose (Lord of the Flies)',
      'African & Non-African Poetry',
      'Literary Devices & Figures of Speech'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'crs',
    name: 'Christian Religious Studies',
    code: 'CRS',
    icon: 'Sparkles',
    educationLevel: 'secondary',
    department: 'art',
    description: 'Sovereignty of God, Kingship in Israel, The Life and Teachings of Jesus Christ, The Apostolic Age, and Pauline Epistles.',
    topics: [
      'Sovereignty of God & Creation Covenant',
      'Leadership & Moral Collapse in Israel',
      'The Early Life & Ministry of Jesus',
      'The Passion, Death & Resurrection of Christ',
      'The Apostolic Church & Pentecost in Acts',
      'Pauline Epistles on Faith, Grace & Civic Duty'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'irs',
    name: 'Islamic Religious Studies',
    code: 'IRS',
    icon: 'Moon',
    educationLevel: 'secondary',
    department: 'art',
    description: 'Tawhid, Selected Quranic Surahs, Hadith of An-Nawawi, Fiqh (Taharah, Salah, Zakat, Hajj), and Islamic Civilization.',
    topics: [
      'Tawhid (Monotheism) & Pillars of Islam',
      'Selected Surahs (Al-Fatihah, Al-Baqarah, Yasin)',
      'Hadith Studies: The 40 Hadith of An-Nawawi',
      'Fiqh: Taharah, Salah, Zakat & Inheritance',
      'Sirah: Life & Hijrah of Prophet Muhammad (SAW)',
      'Islamic Social Ethics & Economic Justice'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'civic',
    name: 'Civic Education',
    code: 'CIV',
    icon: 'Award',
    educationLevel: 'secondary',
    department: 'art',
    description: 'National Values, Constitutional Rights, Rule of Law, Democratic Institutions, Combating Cultism, and Traffic Safety in Nigeria.',
    topics: [
      'National Values, Integrity & Self-Reliance',
      'Citizenship & Constitutional Fundamental Rights',
      'Rule of Law & Independence of the Judiciary',
      'Combating Cultism, Gangsterism & Drug Abuse',
      'Electoral Process & Democratic Governance',
      'Public Service Responsibilities & Traffic Safety'
    ],
    questionCount: 75,
    featured: true,
  },
  {
    id: 'history',
    name: 'History',
    code: 'HIS',
    icon: 'Landmark',
    educationLevel: 'secondary',
    department: 'art',
    description: 'Ancient Nigerian Kingdoms (Nok, Benin, Oyo, Kanem-Borno), Sokoto Caliphate, Colonial Conquest, and 1960 Independence.',
    topics: [
      'Ancient Civilizations (Nok, Ife, Igbo-Ukwu)',
      'The Great Empires (Benin, Oyo, Kanem-Borno)',
      'The Sokoto Caliphate & 19th Century Jihads',
      'British Colonial Penetration & 1914 Amalgamation',
      'The Nationalist Struggle & 1960 Independence',
      'Post-Colonial Governance & The Nigerian Civil War'
    ],
    questionCount: 75,
    featured: false,
  },

  // ==========================================
  // COMMERCIAL & BUSINESS SUBJECTS (IRL)
  // ==========================================
  {
    id: 'commerce',
    name: 'Commerce',
    code: 'COM',
    icon: 'TrendingUp',
    educationLevel: 'secondary',
    department: 'commercial',
    description: 'Home & Foreign Trade, Aids to Trade (Banking, Insurance, Advertising, Warehousing), Stock Exchange, and Business Organizations.',
    topics: [
      'Home Trade: Wholesale & Retail Distribution',
      'Foreign Trade: Balance of Trade & Payments',
      'Aids to Trade: Banking, Transport & Insurance',
      'Warehousing, Modern Advertising & Public Relations',
      'The Nigerian Stock Exchange & Capital Markets',
      'Business Legal Units: Sole Trader to Public Limited Co'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'accounting',
    name: 'Financial Accounting',
    code: 'ACC',
    icon: 'Calculator',
    educationLevel: 'secondary',
    department: 'commercial',
    description: 'The Double Entry Principle, Cash Books, Bank Reconciliation, Final Accounts of Sole Traders, Partnerships, and Depreciation.',
    topics: [
      'Double Entry System & The Accounting Equation',
      'Three-Column Cash Book & Petty Cash Imprest',
      'Bank Reconciliation Statements',
      'Final Accounts: Trading, Profit & Loss, Balance Sheet',
      'Partnership Accounts: Profit Sharing & Goodwill',
      'Depreciation Methods & Control Accounts'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    code: 'MKT',
    icon: 'Target',
    educationLevel: 'secondary',
    department: 'commercial',
    description: 'The Marketing Mix (4Ps), Consumer Buying Behavior, Market Segmentation, Pricing Strategies, and Distribution Channels in Nigeria.',
    topics: [
      'The Marketing Concept & Business Environment',
      'Consumer Buying Decision Process',
      'Product Development, Life Cycle & Branding',
      'Pricing Strategies & Determination in Nigeria',
      'Promotion Mix: Sales Promotion & Digital Marketing',
      'Distribution Channels & Warehousing Logistics'
    ],
    questionCount: 70,
    featured: false,
  },

  // ==========================================
  // SCIENCE & TECHNICAL SUBJECTS (IRL)
  // ==========================================
  {
    id: 'agricultural-science',
    name: 'Agricultural Science',
    code: 'AGR',
    icon: 'BookOpen',
    educationLevel: 'secondary',
    department: 'science',
    description: 'Soil Science, Agronomy, Crop Diseases, Animal Nutrition & Anatomy, Farm Mechanization, and Agricultural Economics.',
    topics: [
      'Soil Formation, Composition & Fertility',
      'Crop Husbandry, Pest Control & Diseases',
      'Animal Husbandry, Anatomy & Digestion',
      'Farm Machinery, Implements & Farm Power',
      'Agricultural Economics, Records & Cooperatives',
      'Fisheries, Aquaculture & Forest Conservation'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'further-maths',
    name: 'Further Mathematics',
    code: 'FMT',
    icon: 'Binary',
    educationLevel: 'secondary',
    department: 'science',
    description: 'Vectors in 2D & 3D, Matrices & Determinants, Advanced Calculus, Statics & Dynamics, Probability Distributions, and Series.',
    topics: [
      'Vectors & 3D Coordinate Geometry',
      'Matrices & Linear Transformations',
      'Advanced Differentiation & Integration',
      'Mechanics: Statics, Dynamics & Projectiles',
      'Binomial Expansions, Sequences & Series',
      'Probability Distributions (Binomial & Normal)'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'computer-studies',
    name: 'Computer Studies',
    code: 'CMP',
    icon: 'Laptop',
    educationLevel: 'secondary',
    department: 'science',
    description: 'Computer Hardware, Logic Gates, Algorithms & Flowcharts, Computer Networks, Cyber Security, and Database Management.',
    topics: [
      'Computer Systems Hardware & Architecture',
      'Logic Gates, Truth Tables & Boolean Algebra',
      'Algorithms, Flowcharts & Programming Logic',
      'Networking: Topologies, Protocols & Internet',
      'Cyber Safety, Computer Ethics & Data Privacy',
      'Database Management Systems & Relational Tables'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'geography',
    name: 'Geography',
    code: 'GEO',
    icon: 'Compass',
    educationLevel: 'secondary',
    department: 'science',
    description: 'The Earth & Solar System, Landforms & Rocks, Weather & Climate, Topographic Map Reading, and Economic Geography of Nigeria.',
    topics: [
      'The Solar System, Earth Rotation & Revolution',
      'Lithosphere: Rocks, Folding, Faulting & Earthquakes',
      'Atmospheric Circulation, Weather & Climatic Types',
      'Topographic Map Reading, Contours & Gradients',
      'Mineral Resources & Industrialization in Nigeria',
      'Agricultural & Environmental Systems in West Africa'
    ],
    questionCount: 80,
    featured: true,
  },

  // ==========================================
  // MORE REAL-LIFE (IRL) ART & HUMANITIES SUBJECTS
  // ==========================================
  {
    id: 'yoruba',
    name: 'Yoruba Language (Èdè Yorùbá)',
    code: 'YOR',
    icon: 'BookOpen',
    educationLevel: 'secondary',
    department: 'art',
    description: 'Àkọtọ́ Èdè Yorùbá, Ìró Ohùn, Àmì Ohùn (Do, Re, Mi), Lítíréṣọ̀ (Ewì, Ìwé Ìtàn, Eré Oníṣe), àti Àṣà Ìbílẹ̀.',
    topics: [
      'Àkọtọ́ Òde-òní & Fonọ́lọ́jì',
      'Àmì Ohùn & Pípè Ọ̀rọ̀',
      'Lítíréṣọ̀: Ewì Àbáláyé & Ewì Òde-òní',
      'Eré Oníṣe & Ìwé Ìtàn Yorùbá',
      'Àṣà Ìgbéyàwó, Ìsọmọlórúkọ & Ìsìnkú',
      'Òwe, Àpèjúwe & Àkànlò Èdè'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'igbo',
    name: 'Igbo Language (Asụsụ Igbo)',
    code: 'IGB',
    icon: 'BookOpen',
    educationLevel: 'secondary',
    department: 'art',
    description: 'Usoro Nsupe Igbo Ọhụrụ, Ụdaume na Mgbochiume, Akara Ụda (Elu, Ala, Nsụda), Agụmagụ (Abụ, Ejije), na Omenala Ndị Igbo.',
    topics: [
      'Usoro Nsupe Ọhụrụ na Ụda Asụsụ',
      'Akara Ụda: Ụda Elu, Ala na Nsụda',
      'Agụmagụ: Abụ Ọdịnala na Abụ Ugbu a',
      'Ejije na Akwụkwọ Ọgụgụ Igbo',
      'Omenala: Ichi Ọzọ na Iri Ji Ọhụrụ',
      'Ilu, Akpụrụokwu & Nsụpe Okwu'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'hausa',
    name: 'Hausa Language (Harshen Hausa)',
    code: 'HAU',
    icon: 'BookOpen',
    educationLevel: 'secondary',
    department: 'art',
    description: 'Tsarin Rubutun Hausa, Rarraba Sautuka, Ka’idojin Rubutu, Adabin Gargajiya da na Zamani, da Al’adun Hausawa.',
    topics: [
      'Tsarin Sautuka da Haruffan Hausa',
      'Rarraba Kalmomi da Nahawun Hausa',
      'Adabin Gargajiya: Tatsuniyoyi da Karin Magana',
      'Rubutaccen Adabi: Wakoki da Wasannin Kwaikwayo',
      'Al’adu: Bikin Aure da Nada Sarauta',
      'Sana’o’in Gargajiya da Tarihin Hausawa'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'french',
    name: 'French Language (Le Français)',
    code: 'FRE',
    icon: 'Languages',
    educationLevel: 'secondary',
    department: 'art',
    description: 'Grammaire, conjugaison (présent, passé composé, futur, subjonctif), compréhension écrite, et civilisation ouest-africaine.',
    topics: [
      'Grammaire: Articles, Adjectifs & Pronoms',
      'Conjugaison: Passé Composé, Imparfait & Conditionnel',
      'Compréhension Écrite & Expression Quotidienne',
      'Vocabulaire: Société, Santé & Environnement',
      'Civilisation Francophone Ouest-Africaine',
      'Faux Amis & Prépositions en Français'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'visual-art',
    name: 'Visual Arts / Fine Art',
    code: 'ART',
    icon: 'Palette',
    educationLevel: 'secondary',
    department: 'art',
    description: 'Elements and Principles of Design, Nigerian Traditional Art (Nok, Ife, Benin, Igbo-Ukwu), Painting, Sculpture, Graphics and Adire.',
    topics: [
      'Elements & Principles of Design',
      'Nigerian Traditional Art (Nok, Ife, Benin, Igbo-Ukwu)',
      'Drawing, Painting & Color Theory',
      'Sculpture & Pottery Technology',
      'Graphic Design & Printmaking',
      'Textile Design & Adire Techniques'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'music',
    name: 'Music',
    code: 'MUS',
    icon: 'Music',
    educationLevel: 'secondary',
    department: 'art',
    description: 'Rudiments & Theory of Music, Western Classical Periods, Traditional African Instruments (Talking Drum, Kakaki, Ogene), and Highlife/Afrobeat.',
    topics: [
      'Staff Notation, Clefs & Time Signatures',
      'Scales, Intervals, Triads & Cadences',
      'Traditional African Musical Instruments',
      'Social Functions of Music in Nigeria',
      'Western Music History (Baroque to Romantic)',
      'Nigerian Contemporary Music (Highlife, Jùjú, Afrobeat)'
    ],
    questionCount: 75,
    featured: true,
  },

  // ==========================================
  // MORE REAL-LIFE (IRL) COMMERCIAL & BUSINESS SUBJECTS
  // ==========================================
  {
    id: 'insurance',
    name: 'Insurance',
    code: 'INS',
    icon: 'ShieldCheck',
    educationLevel: 'secondary',
    department: 'commercial',
    description: 'Fundamental Principles of Insurance (Uberrima Fides, Insurable Interest, Indemnity, Subrogation), Policies, NAICOM, and Underwriting.',
    topics: [
      'Nature of Risk & Principles of Insurance',
      'Insurable Interest, Subrogation & Contribution',
      'Life Assurance: Term, Whole Life & Endowment',
      'General Insurance: Motor, Fire & Marine',
      'Nigerian Insurance Market & NAICOM Regulations',
      'Reinsurance & Claims Procedures'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'office-practice',
    name: 'Office Practice',
    code: 'OFP',
    icon: 'FileText',
    educationLevel: 'secondary',
    department: 'commercial',
    description: 'The Modern Office, Secretarial Functions, Filing Systems & Record Management, Business Correspondence, and Meeting Procedures.',
    topics: [
      'The Modern Office: Departments & Layout',
      'Roles of Receptionist & Secretarial Duties',
      'Filing Systems & Electronic Records',
      'Business Communication: Memos & Minutes',
      'Office Automation & Machines',
      'Human Relations & Workplace Ethics'
    ],
    questionCount: 75,
    featured: true,
  },
  {
    id: 'store-management',
    name: 'Store Management',
    code: 'STM',
    icon: 'Layers',
    educationLevel: 'secondary',
    department: 'commercial',
    description: 'Principles of Warehousing, Inventory Control (EOQ, Minimum & Re-order Levels), Material Handling, Stocktaking, and Procurement.',
    topics: [
      'Store Location, Layout & Safety Regulations',
      'Inventory Control: EOQ, Safety Stock & Lead Time',
      'Purchasing Procedures & Purchase Orders',
      'Store Documentation: Bin Cards & Goods Received Notes',
      'Stock Valuation Methods (FIFO, LIFO, Weighted Avg)',
      'Physical Stocktaking & Store Audit'
    ],
    questionCount: 75,
    featured: true,
  },
  {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    code: 'BKP',
    icon: 'Calculator',
    educationLevel: 'secondary',
    department: 'commercial',
    description: 'Books of Prime Entry, Cash Books, Sales & Purchases Day Books, Ledger Posting, Extraction of Trial Balance, and Single Entry.',
    topics: [
      'Fundamentals of Bookkeeping & Accounting Equation',
      'Books of Prime Entry (Day Books & Journals)',
      'The Ledger & Classification of Accounts',
      'Extraction & Balancing of Trial Balance',
      'Petty Cash Book & The Imprest System',
      'Correction of Errors & Suspense Account'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'data-processing',
    name: 'Data Processing',
    code: 'DPR',
    icon: 'Database',
    educationLevel: 'secondary',
    department: 'commercial',
    description: 'Data Processing Cycle, Operating Systems, Spreadsheets (Excel Formulas), Database Management (Access/SQL), and Cyber Laws in Nigeria.',
    topics: [
      'Data Processing Cycle & Computer Generations',
      'Operating Systems & File Organization',
      'Spreadsheet Applications (Excel Formulas & Charts)',
      'Relational Databases (Tables, Keys & Queries)',
      'Word Processing & Desktop Publishing',
      'Computer Security & Nigerian Cyber Laws'
    ],
    questionCount: 85,
    featured: true,
  },

  // ==========================================
  // MORE REAL-LIFE (IRL) SCIENCE & TECHNICAL SUBJECTS
  // ==========================================
  {
    id: 'technical-drawing',
    name: 'Technical Drawing',
    code: 'TD',
    icon: 'Compass',
    educationLevel: 'secondary',
    department: 'science',
    description: 'Drawing Equipment & Standards, Geometrical Constructions, Orthographic Projections (1st & 3rd Angle), Isometric Views, and Sectioning.',
    topics: [
      'Drawing Instruments, Board Practice & Lines',
      'Geometrical Constructions (Tangents & Conics)',
      'Orthographic Projection (1st & 3rd Angle)',
      'Pictorial Drawings: Isometric & Oblique',
      'Sectional Views & Assembly Drawings',
      'Loci, Linkages & Mechanisms'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'food-and-nutrition',
    name: 'Food and Nutrition',
    code: 'FDN',
    icon: 'Utensils',
    educationLevel: 'secondary',
    department: 'science',
    description: 'Nutritional Biochemistry, Meal Planning for Life Cycles, Food Preservation (Canning, Freezing), Culinary Science, and Deficiency Disorders.',
    topics: [
      'Nutrient Classification & Biochemistry',
      'Food Tests (Biuret, Benedict’s, Iodine, Emulsion)',
      'Meal Planning for Vulnerable & Special Groups',
      'Food Spoilage & Preservation Methods',
      'Culinary Science & Heat Transfer Methods',
      'West African Food Commodities & Food Hygiene'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'animal-husbandry',
    name: 'Animal Husbandry',
    code: 'ANH',
    icon: 'PawPrint',
    educationLevel: 'secondary',
    department: 'science',
    description: 'Farm Animal Anatomy & Physiology, Ruminant Digestion (Rumen, Reticulum, Omasum, Abomasum), Poultry Management, and Veterinary Pathology.',
    topics: [
      'Anatomy & Physiology of Farm Animals',
      'Ruminant vs Non-Ruminant Digestion',
      'Animal Nutrition: Feed Formulation & Rations',
      'Poultry Production: Brooders & Layers',
      'Livestock Diseases (Newcastle, Anthrax, Coccidiosis)',
      'Breeding, Artificial Insemination & Genetics'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'basic-electricity',
    name: 'Basic Electricity & Electronics',
    code: 'ELE',
    icon: 'Zap',
    educationLevel: 'secondary',
    department: 'science',
    description: 'Electric Current, Coulomb’s & Ohm’s Laws, Resistor Networks, Electromagnetic Induction, AC Circuits, and Semiconductor Diodes.',
    topics: [
      'Electrostatics & Coulomb’s Law',
      'Direct Current (DC) Circuits & Ohm’s Law',
      'Resistor, Capacitor & Inductor Networks',
      'Electromagnetic Induction (Faraday & Lenz)',
      'Alternating Current (AC) Circuits & Resonance',
      'Semiconductor Diodes, Rectification & Transistors'
    ],
    questionCount: 85,
    featured: true,
  },
  {
    id: 'fisheries',
    name: 'Fisheries & Aquaculture',
    code: 'FSH',
    icon: 'Fish',
    educationLevel: 'secondary',
    department: 'science',
    description: 'Aquaculture Systems, Freshwater & Marine Species (Catfish, Tilapia), Pond Construction & Liming, Fish Nutrition, and Post-Harvest Processing.',
    topics: [
      'Freshwater & Marine Fisheries in Nigeria',
      'Fish Pond Construction: Site Selection & Dykes',
      'Pond Management: Liming & Water Quality (DO, pH)',
      'Fish Nutrition: Formulated Floating Feeds & FCR',
      'Breeding: Induced Spawning & Hatchery Techniques',
      'Fish Processing (Smoking, Drying) & Marketing'
    ],
    questionCount: 80,
    featured: true,
  },
  {
    id: 'health-education',
    name: 'Health Education',
    code: 'HED',
    icon: 'HeartPulse',
    educationLevel: 'secondary',
    department: 'science',
    description: 'Human Body Systems, Communicable & Lifestyle Diseases, Environmental Sanitation, Adolescent Health, and First Aid Protocols (CPR).',
    topics: [
      'Human Body Systems & Anatomy',
      'Communicable Diseases: Vectors & Prevention (Malaria, Cholera)',
      'Non-Communicable Lifestyle Diseases (Hypertension, Diabetes)',
      'Personal Hygiene & Environmental Health',
      'Substance Abuse Prevention & Rehabilitation',
      'First Aid Protocols: CPR & Emergency Care'
    ],
    questionCount: 85,
    featured: true,
  }
];

export const ADDITIONAL_SUBJECT_QUESTIONS: Question[] = [
  // ==========================================
  // LITERATURE IN ENGLISH QUESTIONS
  // ==========================================
  {
    id: 'lit-1',
    subjectId: 'literature',
    subjectName: 'Literature in English',
    topic: 'African Drama (The Lion & the Jewel)',
    examType: 'JAMB',
    year: 2024,
    question: 'In Wole Soyinka’s "The Lion and the Jewel", Lakunle refuses to pay Sidi’s bride price primarily because he considers it:',
    options: {
      A: 'A barbaric, outdated feudal custom that demeans modern civilization',
      B: 'Too financially exorbitant for a primary school teacher to afford',
      C: 'A violation of the Anglican church doctrines in Ilujinle',
      D: 'An excuse by Baroka to extract revenue from the youth'
    },
    correctOption: 'A',
    explanation: 'Lakunle, the village school teacher, views himself as a champion of Western modernity and enlightenment. He denounces the bride price as an uncivilized, savage practice that equates women to chattels or property.',
    difficulty: 'Medium'
  },
  {
    id: 'lit-2',
    subjectId: 'literature',
    subjectName: 'Literature in English',
    topic: 'African Prose (Second Class Citizen)',
    examType: 'WAEC',
    year: 2023,
    question: 'In Buchi Emecheta’s "Second Class Citizen", what is Adah’s primary motivation for pursuing her education and moving to the United Kingdom?',
    options: {
      A: 'To fulfill her childhood dream of becoming a writer and liberating her family from poverty',
      B: 'To escape the wrath of her in-laws in Lagos after refusing to remarry',
      C: 'To secure a diplomatic passport under the British colonial administration',
      D: 'To follow Francis who commanded her to finance his accountancy studies'
    },
    correctOption: 'A',
    explanation: 'From early childhood in Ibuza and Lagos, Adah nurtures the "Presence"—a vivid dream of travelling to the UK to become an accomplished writer and liberate her children from gender subjugation and poverty.',
    difficulty: 'Medium'
  },
  {
    id: 'lit-3',
    subjectId: 'literature',
    subjectName: 'Literature in English',
    topic: 'Literary Devices & Figures of Speech',
    examType: 'JAMB',
    year: 2024,
    question: 'Identify the predominant figure of speech in the sentence: "The ruthless harmattan wind howled through the zinc roofs of the village throughout the cold night."',
    options: {
      A: 'Personification',
      B: 'Oxymoron',
      C: 'Synecdoche',
      D: 'Litotes'
    },
    correctOption: 'A',
    explanation: 'Personification assigns animate or human qualities to inanimate objects or nature. Here, the non-human harmattan wind is described as "ruthless" and capable of "howling".',
    difficulty: 'Easy'
  },
  {
    id: 'lit-4',
    subjectId: 'literature',
    subjectName: 'Literature in English',
    topic: 'Non-African Drama (Fences by August Wilson)',
    examType: 'WAEC',
    year: 2024,
    question: 'In August Wilson’s "Fences", what does the physical fence Troy and Cory build around the Maxson house metaphorically symbolize?',
    options: {
      A: 'Both protection to keep death and hardship out, and a barrier that emotionally confines and divides the family',
      B: 'The legal border dispute between Troy and his brother Gabriel over government disability checks',
      C: 'Troy’s attempt to hide his sanitation truck from the Pittsburgh police',
      D: 'The racial integration line between black and white neighborhoods in 1950s Chicago'
    },
    correctOption: 'A',
    explanation: 'Rose desires the fence to keep loved ones together and protected inside, whereas Troy builds psychological fences that push Cory and Rose away while attempting to keep Death at bay.',
    difficulty: 'Hard'
  },

  // ==========================================
  // CHRISTIAN RELIGIOUS STUDIES (CRS)
  // ==========================================
  {
    id: 'crs-1',
    subjectId: 'crs',
    subjectName: 'Christian Religious Studies',
    topic: 'Leadership & Moral Collapse in Israel',
    examType: 'JAMB',
    year: 2024,
    question: 'King David was severely rebuked by the prophet Nathan following his sinful affair with Bathsheba through the use of:',
    options: {
      A: 'The parable of the rich man who took the poor man’s only ewe lamb',
      B: 'A direct curse causing an immediate three-year drought across Judah',
      C: 'A prophetic sign involving the breaking of an earthenware flask at the Hinnom valley',
      D: 'A dream displaying the writing on the wall of the palace'
    },
    correctOption: 'A',
    explanation: 'In 2 Samuel 12:1-7, Nathan told David a parable about a rich traveler who spared his own vast flocks and instead slaughtered a poor neighbor’s beloved single ewe lamb, causing David to condemn himself before Nathan said, "Thou art the man!"',
    difficulty: 'Medium'
  },
  {
    id: 'crs-2',
    subjectId: 'crs',
    subjectName: 'Christian Religious Studies',
    topic: 'The Apostolic Church & Pentecost in Acts',
    examType: 'WAEC',
    year: 2023,
    question: 'According to Acts of the Apostles chapter 6, what urgent administrative problem led to the election of the first seven deacons in Jerusalem?',
    options: {
      A: 'The complaint by Hellenistic Grecian Jews that their widows were neglected in the daily distribution of food',
      B: 'The arrest and imprisonment of Peter and John by the Jewish Sanhedrin',
      C: 'The dispute between Paul and Barnabas concerning John Mark’s participation in Antioch',
      D: 'The collection of the famine relief fund for the churches in Judea'
    },
    correctOption: 'A',
    explanation: 'Acts 6:1 explains that when the number of disciples increased, the Grecian (Hellenistic) Jews complained against the Hebraic Jews because their widows were being overlooked in the daily ministration of rations.',
    difficulty: 'Medium'
  },
  {
    id: 'crs-3',
    subjectId: 'crs',
    subjectName: 'Christian Religious Studies',
    topic: 'Pauline Epistles on Faith, Grace & Civic Duty',
    examType: 'JAMB',
    year: 2024,
    question: 'In Romans chapter 13, the Apostle Paul instructs Christians on civic responsibility by asserting that civil governing authorities are:',
    options: {
      A: 'Ordained of God as ministers of justice to execute wrath upon evildoers',
      B: 'Corrupt worldly institutions that true believers must avoid and reject',
      C: 'Only deserving of taxes if they openly uphold Christian doctrines',
      D: 'Temporary Roman tyrants destined for immediate divine destruction'
    },
    correctOption: 'A',
    explanation: 'Romans 13:1-4 states: "Let every soul be subject unto the higher powers. For there is no power but of God... for he is the minister of God to thee for good... a revenger to execute wrath upon him that doeth evil."',
    difficulty: 'Hard'
  },

  // ==========================================
  // ISLAMIC RELIGIOUS STUDIES (IRS)
  // ==========================================
  {
    id: 'irs-1',
    subjectId: 'irs',
    subjectName: 'Islamic Religious Studies',
    topic: 'Tawhid (Monotheism) & Pillars of Islam',
    examType: 'JAMB',
    year: 2024,
    question: 'The Islamic concept of "Shirk" is considered the only unforgivable sin if unrepented before death because it represents:',
    options: {
      A: 'Associating partners or rivals with Allah in His lordship, worship, or attributes',
      B: 'Failing to perform the Friday congregational Jumu’ah prayers consecutively',
      C: 'Refusing to pay the exact percentage of Zakat-ul-Fitr at Eid',
      D: 'Breaking the fast during the blessed month of Ramadan without a medical excuse'
    },
    correctOption: 'A',
    explanation: 'Shirk (polytheism or associationism) is the antithesis of Tawhid. Surah An-Nisa (4:48) states: "Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills."',
    difficulty: 'Easy'
  },
  {
    id: 'irs-2',
    subjectId: 'irs',
    subjectName: 'Islamic Religious Studies',
    topic: 'Hadith Studies: The 40 Hadith of An-Nawawi',
    examType: 'WAEC',
    year: 2023,
    question: 'According to the famous Hadith 1 of Imam An-Nawawi’s compilation narrated by Umar ibn Al-Khattab (RA), all actions in Islam are judged by:',
    options: {
      A: 'Their underlying intentions (Innamal a’maalu bin-niyyaat)',
      B: 'Their external ceremonial perfection',
      C: 'The monetary value given to charity',
      D: 'The length of time spent in continuous prostration'
    },
    correctOption: 'A',
    explanation: 'Hadith 1 sets the foundational principle of all Islamic jurisprudence and morality: "Actions are but by intention and every man shall have only that which he intended."',
    difficulty: 'Easy'
  },

  // ==========================================
  // CIVIC EDUCATION
  // ==========================================
  {
    id: 'civ-1',
    subjectId: 'civic',
    subjectName: 'Civic Education',
    topic: 'Rule of Law & Independence of the Judiciary',
    examType: 'WAEC',
    year: 2024,
    question: 'Which of the following principles is the most essential guarantee that no individual, leader, or government is above the supreme law of Nigeria?',
    options: {
      A: 'The Rule of Law (Dicey’s principle of equality before the law)',
      B: 'The decree of executive immunity for local government councilors',
      C: 'The doctrine of military suspension of constitutional chapters',
      D: 'The political party supremacy over statutory courts'
    },
    correctOption: 'A',
    explanation: 'A.V. Dicey’s concept of the Rule of Law guarantees supremacy of the constitution, absolute equality of all citizens before ordinary law courts, and the absence of arbitrary executive power.',
    difficulty: 'Medium'
  },
  {
    id: 'civ-2',
    subjectId: 'civic',
    subjectName: 'Civic Education',
    topic: 'Combating Cultism, Gangsterism & Drug Abuse',
    examType: 'JAMB',
    year: 2024,
    question: 'Which agency is specifically constitutionally mandated to combat the illicit production, trafficking, and consumption of narcotics in Nigeria?',
    options: {
      A: 'National Drug Law Enforcement Agency (NDLEA)',
      B: 'Economic and Financial Crimes Commission (EFCC)',
      C: 'Federal Road Safety Corps (FRSC)',
      D: 'Nigeria Security and Civil Defence Corps (NSCDC)'
    },
    correctOption: 'A',
    explanation: 'The NDLEA was established by Decree No. 48 of 1989 to eradicate the illicit trafficking and abuse of hard drugs and psychotropic substances in Nigeria.',
    difficulty: 'Easy'
  },

  // ==========================================
  // HISTORY
  // ==========================================
  {
    id: 'his-1',
    subjectId: 'history',
    subjectName: 'History',
    topic: 'Ancient Civilizations (Nok, Ife, Igbo-Ukwu)',
    examType: 'JAMB',
    year: 2024,
    question: 'The world-renowned archaeological terracotta artifacts excavated near the Jos Plateau that proved advanced iron-smelting existed in sub-Saharan Africa by 500 BC belong to the:',
    options: {
      A: 'Nok Culture',
      B: 'Igbo-Ukwu Bronze tradition',
      C: 'Ile-Ife Terra Cotta guild',
      D: 'Kanem-Borno Sayfawa Dynasty'
    },
    correctOption: 'A',
    explanation: 'Discovered in 1928 around the village of Nok in Kaduna State near Jos, Nok culture produced remarkable stylized terracotta sculptures and demonstrated mastery of bloomery iron-smelting between 500 BC and 200 AD.',
    difficulty: 'Medium'
  },
  {
    id: 'his-2',
    subjectId: 'history',
    subjectName: 'History',
    topic: 'British Colonial Penetration & 1914 Amalgamation',
    examType: 'WAEC',
    year: 2023,
    question: 'Who was the British colonial administrator who officially proclaimed the amalgamation of the Northern and Southern Protectorates of Nigeria on January 1, 1914?',
    options: {
      A: 'Lord Frederick Lugard',
      B: 'Sir Donald Cameron',
      C: 'Sir Arthur Richards',
      D: 'Hugh Clifford'
    },
    correctOption: 'A',
    explanation: 'Lord Lugard unified the Northern and Southern protectorates with the Colony of Lagos on January 1, 1914, serving as the first Governor-General of the unified territory of Nigeria.',
    difficulty: 'Easy'
  },

  // ==========================================
  // COMMERCE
  // ==========================================
  {
    id: 'com-1',
    subjectId: 'commerce',
    subjectName: 'Commerce',
    topic: 'Aids to Trade: Banking, Transport & Insurance',
    examType: 'JAMB',
    year: 2024,
    question: 'In marine and commercial insurance, the principle of "Indemnity" states that the insured person:',
    options: {
      A: 'Should be restored to the exact financial position they occupied immediately prior to the loss, without making a profit',
      B: 'Is entitled to receive double compensation from both insurer and reinsurer',
      C: 'Can insure any property even if they possess no financial or insurable interest in it',
      D: 'Must forfeit all claim rights if the incident took place outside Nigerian waters'
    },
    correctOption: 'A',
    explanation: 'Indemnity is a fundamental insurance doctrine preventing moral hazard; it guarantees that the insured is compensated for the actual financial loss incurred, ensuring insurance is never used as a vehicle for speculative profit.',
    difficulty: 'Medium'
  },
  {
    id: 'com-2',
    subjectId: 'commerce',
    subjectName: 'Commerce',
    topic: 'Business Legal Units: Sole Trader to Public Limited Co',
    examType: 'WAEC',
    year: 2023,
    question: 'What is the most significant legal distinction between a Private Limited Liability Company (Ltd) and a Public Limited Liability Company (Plc) in Nigeria?',
    options: {
      A: 'A Plc can invite the general public to subscribe to its shares on the Nigerian Exchange (NGX), whereas a Ltd cannot',
      B: 'A Ltd has unlimited liability while a Plc possesses zero liability',
      C: 'A Plc is owned entirely by the Federal Government while a Ltd is private',
      D: 'A Ltd does not require registration with the Corporate Affairs Commission (CAC)'
    },
    correctOption: 'A',
    explanation: 'Under CAMA 2020, a Public Limited Company (Plc) is permitted to issue prospectuses and trade shares freely on public securities exchanges like the NGX, while a Private Limited Company (Ltd) cannot solicit public equity.',
    difficulty: 'Medium'
  },

  // ==========================================
  // FINANCIAL ACCOUNTING
  // ==========================================
  {
    id: 'acc-1',
    subjectId: 'accounting',
    subjectName: 'Financial Accounting',
    topic: 'Bank Reconciliation Statements',
    examType: 'JAMB',
    year: 2024,
    question: 'When preparing a Bank Reconciliation Statement, what is the accounting treatment for an "Unpresented Cheque"?',
    options: {
      A: 'Add to balance as per Cash Book, or deduct from balance as per Bank Statement',
      B: 'Deduct from Cash Book balance and immediately debit the Suspense Account',
      C: 'Disregard until the end of the financial tax year',
      D: 'Debit to the Bad Debt Reserve account in the general ledger'
    },
    correctOption: 'A',
    explanation: 'An unpresented cheque has already been credited (deducted) in the firm’s Cash Book, but the payee has not yet presented it to the commercial bank. Therefore, to reconcile the bank statement to the cash book, it must be deducted from the bank statement balance.',
    difficulty: 'Hard'
  },
  {
    id: 'acc-2',
    subjectId: 'accounting',
    subjectName: 'Financial Accounting',
    topic: 'Depreciation Methods & Control Accounts',
    examType: 'WAEC',
    year: 2023,
    question: 'A delivery van purchased for ₦6,000,000 has an estimated useful life of 5 years and a scrap value of ₦1,000,000. Using the Straight-Line Method, calculate the annual depreciation charge.',
    options: {
      A: '₦1,000,000 per annum',
      B: '₦1,200,000 per annum',
      C: '₦800,000 per annum',
      D: '₦1,500,000 per annum'
    },
    correctOption: 'A',
    explanation: 'Straight-Line Depreciation = (Cost - Residual Value) / Useful Life = (₦6,000,000 - ₦1,000,000) / 5 years = ₦5,000,000 / 5 = ₦1,000,000 per annum.',
    difficulty: 'Medium'
  },

  // ==========================================
  // MARKETING
  // ==========================================
  {
    id: 'mkt-1',
    subjectId: 'marketing',
    subjectName: 'Marketing',
    topic: 'The Marketing Concept & Business Environment',
    examType: 'JAMB',
    year: 2024,
    question: 'Which of the four classic elements of the Marketing Mix (4Ps) is the ONLY one that generates revenue for a business firm?',
    options: {
      A: 'Price',
      B: 'Product',
      C: 'Place (Distribution)',
      D: 'Promotion'
    },
    correctOption: 'A',
    explanation: 'Product, Place, and Promotion all generate production and overhead costs for an enterprise. Price is the sole marketing element that captures value and produces cash inflows/revenue.',
    difficulty: 'Easy'
  },

  // ==========================================
  // AGRICULTURAL SCIENCE
  // ==========================================
  {
    id: 'agr-1',
    subjectId: 'agricultural-science',
    subjectName: 'Agricultural Science',
    topic: 'Soil Formation, Composition & Fertility',
    examType: 'JAMB',
    year: 2024,
    question: 'The symbiotic nitrogen-fixing bacterium found in the root nodules of leguminous plants like groundnuts and cowpeas is:',
    options: {
      A: 'Rhizobium',
      B: 'Nitrosomonas',
      C: 'Nitrobacter',
      D: 'Clostridium botulinum'
    },
    correctOption: 'A',
    explanation: 'Rhizobium bacteria establish a mutualistic relationship in the root nodules of legumes, directly fixing atmospheric dinitrogen gas into plant-available nitrates.',
    difficulty: 'Easy'
  },
  {
    id: 'agr-2',
    subjectId: 'agricultural-science',
    subjectName: 'Agricultural Science',
    topic: 'Animal Husbandry, Anatomy & Digestion',
    examType: 'WAEC',
    year: 2023,
    question: 'Which of the four compartments of the ruminant stomach is considered the "true stomach" where enzymatic gastric digestion occurs?',
    options: {
      A: 'Abomasum',
      B: 'Rumen (Paunch)',
      C: 'Reticulum (Honeycomb)',
      D: 'Omasum (Manyplies)'
    },
    correctOption: 'A',
    explanation: 'The abomasum is the fourth stomach compartment of ruminants (cattle, sheep, goats) and is anatomical equivalent to the monogastric stomach, secreting hydrochloric acid and pepsin for gastric breakdown.',
    difficulty: 'Medium'
  },

  // ==========================================
  // FURTHER MATHEMATICS
  // ==========================================
  {
    id: 'fmt-1',
    subjectId: 'further-maths',
    subjectName: 'Further Mathematics',
    topic: 'Vectors & 3D Coordinate Geometry',
    examType: 'JAMB',
    year: 2024,
    question: 'If vector a = 3i + 4j and vector b = -4i + 3j, calculate their scalar (dot) product a • b and deduce the geometric angle between them.',
    options: {
      A: 'a • b = 0, therefore the vectors are perpendicular (90°)',
      B: 'a • b = 25, therefore the vectors are parallel (0°)',
      C: 'a • b = -7, therefore the angle is obtuse (135°)',
      D: 'a • b = 12, therefore the angle is acute (45°)'
    },
    correctOption: 'A',
    explanation: 'Scalar product: a • b = (3 * -4) + (4 * 3) = -12 + 12 = 0. When the dot product of two non-zero vectors is 0, cos θ = 0, which proves θ = 90° (the vectors are orthogonal/perpendicular).',
    difficulty: 'Medium'
  },
  {
    id: 'fmt-2',
    subjectId: 'further-maths',
    subjectName: 'Further Mathematics',
    topic: 'Matrices & Linear Transformations',
    examType: 'WAEC',
    year: 2024,
    question: 'Find the determinant of the 2x2 matrix M = [[5, 2], [7, 3]].',
    options: {
      A: '1',
      B: '29',
      C: '-1',
      D: '11'
    },
    correctOption: 'A',
    explanation: 'For matrix [[a, b], [c, d]], det(M) = (a * d) - (b * c) = (5 * 3) - (2 * 7) = 15 - 14 = 1.',
    difficulty: 'Easy'
  },

  // ==========================================
  // COMPUTER STUDIES
  // ==========================================
  {
    id: 'cmp-1',
    subjectId: 'computer-studies',
    subjectName: 'Computer Studies',
    topic: 'Logic Gates, Truth Tables & Boolean Algebra',
    examType: 'JAMB',
    year: 2024,
    question: 'Which fundamental digital logic gate produces an output of HIGH (1) if and ONLY if both of its inputs A and B are HIGH (1)?',
    options: {
      A: 'AND Gate',
      B: 'OR Gate',
      C: 'NAND Gate',
      D: 'XOR Gate'
    },
    correctOption: 'A',
    explanation: 'The AND gate implements logical conjunction: output Y = A • B. The output is true (1) only when all inputs are true (1).',
    difficulty: 'Easy'
  },
  {
    id: 'cmp-2',
    subjectId: 'computer-studies',
    subjectName: 'Computer Studies',
    topic: 'Networking: Topologies, Protocols & Internet',
    examType: 'WAEC',
    year: 2023,
    question: 'In a local area network (LAN), which network topology connects all client nodes directly to a central hub, switch, or router?',
    options: {
      A: 'Star Topology',
      B: 'Bus Topology',
      C: 'Ring Topology',
      D: 'Mesh Topology'
    },
    correctOption: 'A',
    explanation: 'In a Star topology, all computers connect individually via point-to-point cables to a central switch/hub. If one peripheral cable fails, other stations remain fully operational.',
    difficulty: 'Easy'
  },

  // ==========================================
  // GEOGRAPHY
  // ==========================================
  {
    id: 'geo-1',
    subjectId: 'geography',
    subjectName: 'Geography',
    topic: 'The Solar System, Earth Rotation & Revolution',
    examType: 'JAMB',
    year: 2024,
    question: 'If the local solar time at Greenwich (Longitude 0°) is 12:00 noon, what is the standard time in Lagos, Nigeria (Longitude 15° East of the Prime Meridian)?',
    options: {
      A: '1:00 PM (13:00 hours)',
      B: '11:00 AM (11:00 hours)',
      C: '2:00 PM (14:00 hours)',
      D: '12:30 PM (12:30 hours)'
    },
    correctOption: 'A',
    explanation: 'The Earth rotates 360° in 24 hours = 15° per hour. Moving East means time is ahead of GMT. 15° East = 15 / 15 = 1 hour ahead. 12:00 noon + 1 hour = 1:00 PM.',
    difficulty: 'Medium'
  },
  {
    id: 'geo-2',
    subjectId: 'geography',
    subjectName: 'Geography',
    topic: 'Lithosphere: Rocks, Folding, Faulting & Earthquakes',
    examType: 'WAEC',
    year: 2023,
    question: 'Rocks formed from the cooling, solidification, and crystallization of molten magma either beneath the Earth’s crust or as lava upon the surface are classified as:',
    options: {
      A: 'Igneous Rocks',
      B: 'Sedimentary Rocks',
      C: 'Metamorphic Rocks',
      D: 'Organically formed rocks'
    },
    correctOption: 'A',
    explanation: 'Igneous rocks (such as granite, basalt, and obsidian) originate from the crystallization and cooling of molten magma (intrusive) or lava (extrusive).',
    difficulty: 'Easy'
  },

  // ==========================================
  // YORUBA LANGUAGE (ÈDÈ YORÙBÁ)
  // ==========================================
  {
    id: 'yor-1',
    subjectId: 'yoruba',
    subjectName: 'Yoruba Language (Èdè Yorùbá)',
    topic: 'Àmì Ohùn & Pípè Ọ̀rọ̀',
    examType: 'JAMB',
    year: 2024,
    question: 'Àwọn àmì ohùn melo lo wa ninu Èdè Yorùbá, kí sì ni orúkọ wọn?',
    options: {
      A: 'Mẹ́ta: Ohùn Òkè (Re), Ohùn Àárín (Do), Ohùn Ìsàlẹ̀ (Mi)',
      B: 'Mẹ́ta: Ohùn Òkè (Ó / Mi), Ohùn Àárín (O / Re), Ohùn Ìsàlẹ̀ (Ò / Do)',
      C: 'Mẹ́rin: Ohùn Gíga, Ohùn Kékèké, Ohùn Àárín, Ohùn Ìsàlẹ̀',
      D: 'Méjì: Ohùn Gbàràgàdà àti Ohùn Kúlúkúlú'
    },
    correctOption: 'B',
    explanation: 'Ní èdè Yorùbá, àmì ohùn mẹ́ta gbòógì ló wà: Ohùn Òkè (/) tí à ń pè ní "Mi", Ohùn Àárín (-) tí a kò ní àmì fún tí a ń pè ní "Re", àti Ohùn Ìsàlẹ̀ (\\) tí à ń pè ní "Do".',
    difficulty: 'Easy'
  },
  {
    id: 'yor-2',
    subjectId: 'yoruba',
    subjectName: 'Yoruba Language (Èdè Yorùbá)',
    topic: 'Òwe, Àpèjúwe & Àkànlò Èdè',
    examType: 'WAEC',
    year: 2023,
    question: 'Kí ni ìtumọ̀ òwe Yorùbá yìí: "Àgbájọ ọwọ́ la fi ń sọ̀yà, àjèjì ọwọ́ kan kò gbẹ́rù dórí"?',
    options: {
      A: 'Ìfọwọ́sowọ́pọ̀ àti ìṣọ̀kan ló ń mú àṣeyọrí wá nínú àwùjọ',
      B: 'Ọwọ́ gbígbé sókè nìkan ló lè mú kí ènìyàn dọlọ́rọ̀',
      C: 'Kí ènìyàn má ṣe gbẹ́kẹ̀ lé ẹlòmíràn nínú iṣẹ́ oòjọ́',
      D: 'Ọlọ́lá nìkan ló lẹ́tọ̀ọ́ láti gbé ẹrù tó wúwo'
    },
    correctOption: 'A',
    explanation: 'Òwe yìí ń kọ́ wa nípa ànfààní ìṣọ̀kan, àjùmọ̀ṣe àti ìfọwọ́sowọ́pọ̀ (unity and cooperation). Agbára ẹnìkan kò tó láti gbé ẹrù àwùjọ dórí láìsí àtìlẹ́yìn àwọn ẹlòmíràn.',
    difficulty: 'Medium'
  },

  // ==========================================
  // IGBO LANGUAGE (ASỤSỤ IGBO)
  // ==========================================
  {
    id: 'igb-1',
    subjectId: 'igbo',
    subjectName: 'Igbo Language (Asụsụ Igbo)',
    topic: 'Usoro Nsupe Ọhụrụ na Ụda Asụsụ',
    examType: 'JAMB',
    year: 2024,
    question: 'N’usoro mkpụrụedemede Igbo (Abịịdịị Igbo), ụdaume ole dị n’asụsụ Igbo?',
    options: {
      A: 'Ụdaume asatọ (8): a, e, i, ị, o, ọ, u, ụ',
      B: 'Ụdaume ise (5): a, e, i, o, u',
      C: 'Ụdaume iri abụọ na anọ (24)',
      D: 'Ụdaume iri na abụọ (12)'
    },
    correctOption: 'A',
    explanation: 'Asụsụ Igbo nwere ụdaume asatọ (8) e kewara n’ụzọ abụọ: Ụdaume Ọn̄ụ (a, ọ, ụ, ị) na Ụdaume Akpụkpọ/Ndị dị mfe (e, o, u, i) dịka usoro nsupe ọhụrụ siri kwuo.',
    difficulty: 'Easy'
  },
  {
    id: 'igb-2',
    subjectId: 'igbo',
    subjectName: 'Igbo Language (Asụsụ Igbo)',
    topic: 'Omenala: Ichi Ọzọ na Iri Ji Ọhụrụ',
    examType: 'WAEC',
    year: 2023,
    question: 'Gịnị kpatara emume "Iri Ji Ọhụrụ" (New Yam Festival) ji dị ezigbo mkpa n’omenala ndị Igbo?',
    options: {
      A: 'Ọ bụ oge e ji ekele Chi na ndị nna nna maka ezi owuwe ihe ubi tupu a malite iri ji ọhụrụ',
      B: 'Ọ bụ ụbọchị a na-achụpụ ndị obodo niile na-enweghị ugbo n’ala eze',
      C: 'Ọ bụ mmemme a na-eme naanị mgbe eze ọhụrụ na-achị n’obodo',
      D: 'Ọ bụ emume e ji ere ahịa ji n’ahịa mba ụwa'
    },
    correctOption: 'A',
    explanation: 'Emume Iri Ji Ọhụrụ bụ emume nkenke na ekele e ji asọpụrụ Chukwu Okike na Ahịanjọkụ (chi ji) maka udo na owuwe ihe ubi tupu onye ọbụla erie n’ihe ubi ọhụrụ ahụ.',
    difficulty: 'Medium'
  },

  // ==========================================
  // HAUSA LANGUAGE (HARSHEN HAUSA)
  // ==========================================
  {
    id: 'hau-1',
    subjectId: 'hausa',
    subjectName: 'Hausa Language (Harshen Hausa)',
    topic: 'Adabin Gargajiya: Tatsuniyoyi da Karin Magana',
    examType: 'JAMB',
    year: 2024,
    question: 'Wane ma’ana wannan karin maganar Hausa ke bayarwa: "Kome nisan jifa, kasa zai fado"?',
    options: {
      A: 'Duk abin da mutum ya aikata a rayuwa ko girman mukaminsa, zai dawo kan gaskiya ko karshensa na nan',
      B: 'Duk dutsen da aka jefa sama ba zai taba dawowa kasa ba',
      C: 'Ya kamata mutane su rika jefa kaya da karfi domin su yi nisa',
      D: 'Kasa tana da nauyi fiye da sama'
    },
    correctOption: 'A',
    explanation: 'Karin maganar "Kome nisan jifa, kasa zai fado" tana nuna cewa komai girman mulki, arziki ko nisan da mutum ya yi wajen zalunci, zai dawo ga gaskiya ko sakamako a karshe.',
    difficulty: 'Easy'
  },
  {
    id: 'hau-2',
    subjectId: 'hausa',
    subjectName: 'Hausa Language (Harshen Hausa)',
    topic: 'Rarraba Kalmomi da Nahawun Hausa',
    examType: 'WAEC',
    year: 2023,
    question: 'A cikin haruffan Hausa na boko, wadanne haruffa ne ake kira "haruffa masu lankwasa/tsinke" (Glottalized/Hooked consonants)?',
    options: {
      A: 'ɓ, ɗ, ƙ, da kuma ƴ',
      B: 'a, e, i, o, u',
      C: 'b, d, k, da kuma y',
      D: 'm, n, l, da kuma r'
    },
    correctOption: 'A',
    explanation: 'A nahawun Hausa, haruffan "ɓ", "ɗ", "ƙ", da "ƴ" haruffa ne na musamman da ake furta su da toshewar makogwaro (glottalic sounds) kuma su ne ke bambanta sautukan Hausa.',
    difficulty: 'Medium'
  },

  // ==========================================
  // FRENCH LANGUAGE (LE FRANÇAIS)
  // ==========================================
  {
    id: 'fre-1',
    subjectId: 'french',
    subjectName: 'French Language (Le Français)',
    topic: 'Conjugaison: Passé Composé, Imparfait & Conditionnel',
    examType: 'JAMB',
    year: 2024,
    question: 'Choisissez la forme verbale correcte pour compléter la phrase : "Hier soir, Amina et sa sœur ______ au cinéma."',
    options: {
      A: 'sont allées',
      B: 'sont allés',
      C: 'ont allé',
      D: 'sont aller'
    },
    correctOption: 'A',
    explanation: 'Le verbe "aller" se conjugue au passé composé avec l\'auxiliaire "être". Le participe passé s\'accorde en genre et en nombre avec le sujet féminin pluriel (Amina et sa sœur = elles), d\'où la terminaison "-ées" : "sont allées".',
    difficulty: 'Medium'
  },
  {
    id: 'fre-2',
    subjectId: 'french',
    subjectName: 'French Language (Le Français)',
    topic: 'Compréhension Écrite & Expression Quotidienne',
    examType: 'WAEC',
    year: 2023,
    question: 'Quelle est la signification correcte de l\'expression : "Il fait un froid de canard" ?',
    options: {
      A: 'Il fait extrêmement froid',
      B: 'Il y a beaucoup de canards dans la cour',
      C: 'Le temps est très chaud et ensoleillé',
      D: 'La pluie commence à tomber'
    },
    correctOption: 'A',
    explanation: 'En français idiomatique, "un froid de canard" est une locution très fréquente signifiant un froid très vif, glacial ou mordant.',
    difficulty: 'Easy'
  },

  // ==========================================
  // VISUAL ARTS / FINE ART
  // ==========================================
  {
    id: 'art-1',
    subjectId: 'visual-art',
    subjectName: 'Visual Arts / Fine Art',
    topic: 'Nigerian Traditional Art (Nok, Ife, Benin, Igbo-Ukwu)',
    examType: 'JAMB',
    year: 2024,
    question: 'The famous ancient Nok terracotta sculptures discovered in Kaduna State, Nigeria (dating back to 500 BC – 200 AD) are uniquely recognized by their:',
    options: {
      A: 'Perforated/pierced pupils, triangular shaped eyes, and elaborate hairstyles',
      B: 'Smooth, polished marble surfaces with naturalistic Greco-Roman proportions',
      C: 'Abstract geometric glass beadwork and wooden masks',
      D: 'Massive megalithic granite stones carved with bird silhouettes'
    },
    correctOption: 'A',
    explanation: 'Nok terracotta art is globally celebrated for hollow terracotta manufacturing, pierced pupils, triangular/oval eyes, flared nostrils, and complex, highly detailed hairstyles and beaded necklaces.',
    difficulty: 'Medium'
  },
  {
    id: 'art-2',
    subjectId: 'visual-art',
    subjectName: 'Visual Arts / Fine Art',
    topic: 'Drawing, Painting & Color Theory',
    examType: 'WAEC',
    year: 2023,
    question: 'On a standard 12-hue color wheel, two colors that sit directly opposite each other (such as Red and Green, or Blue and Orange) are termed:',
    options: {
      A: 'Complementary Colors',
      B: 'Analogous Colors',
      C: 'Monochromatic Tints',
      D: 'Tertiary Pigments'
    },
    correctOption: 'A',
    explanation: 'Complementary colors are pairs directly opposite each other on the color wheel. When placed side-by-side, they produce maximum visual contrast and vibrancy.',
    difficulty: 'Easy'
  },

  // ==========================================
  // MUSIC
  // ==========================================
  {
    id: 'mus-1',
    subjectId: 'music',
    subjectName: 'Music',
    topic: 'Traditional African Musical Instruments',
    examType: 'JAMB',
    year: 2024,
    question: 'Under the Hornbostel-Sachs classification of musical instruments, the Yoruba "Dùndún" (talking drum) and the "Kakaki" trumpet are categorized respectively as:',
    options: {
      A: 'Membranophone and Aerophone',
      B: 'Idiophone and Chordophone',
      C: 'Aerophone and Membranophone',
      D: 'Electrophone and Idiophone'
    },
    correctOption: 'A',
    explanation: 'A drum with a vibrating leather skin/membrane (Dùndún) is a Membranophone; wind/brass instruments where sound is produced by vibrating air columns (Kakaki) are Aerophones.',
    difficulty: 'Medium'
  },
  {
    id: 'mus-2',
    subjectId: 'music',
    subjectName: 'Music',
    topic: 'Scales, Intervals, Triads & Cadences',
    examType: 'WAEC',
    year: 2023,
    question: 'In Western music harmony, a musical phrase ending with a progression moving from the Dominant chord (V) to the Tonic chord (I) produces a:',
    options: {
      A: 'Perfect Authentic Cadence (Full Close)',
      B: 'Plagal Cadence (Amen Cadence IV - I)',
      C: 'Imperfect Cadence (Half Close ending on V)',
      D: 'Interrupted/Deceptive Cadence (V - VI)'
    },
    correctOption: 'A',
    explanation: 'The chord progression V -> I creates a sense of definitive resolution and finality, known as the Perfect Cadence or Full Close in harmonic analysis.',
    difficulty: 'Hard'
  },

  // ==========================================
  // INSURANCE
  // ==========================================
  {
    id: 'ins-1',
    subjectId: 'insurance',
    subjectName: 'Insurance',
    topic: 'Nature of Risk & Principles of Insurance',
    examType: 'JAMB',
    year: 2024,
    question: 'The fundamental insurance doctrine of "Uberrima Fides" (Utmost Good Faith) requires that:',
    options: {
      A: 'Both the proposer and the insurer disclose all material facts fully and accurately without concealment',
      B: 'The insurer must pay double the claim amount if fire destroys commercial property',
      C: 'The insured must insure the same asset with at least three registered underwriters',
      D: 'The government pays all outstanding insurance premiums during an economic recession'
    },
    correctOption: 'A',
    explanation: 'Uberrima Fides mandates total honesty: both parties must disclose all material facts affecting the risk so the insurer can calculate an appropriate premium and terms.',
    difficulty: 'Medium'
  },
  {
    id: 'ins-2',
    subjectId: 'insurance',
    subjectName: 'Insurance',
    topic: 'Insurable Interest, Subrogation & Contribution',
    examType: 'WAEC',
    year: 2023,
    question: 'Mr. Obi’s insured delivery van is totaled by a reckless truck driver. After the insurance company indemnifies Mr. Obi in full, which principle permits the insurer to step into Mr. Obi’s shoes to sue the negligent truck driver for compensation?',
    options: {
      A: 'Subrogation',
      B: 'Proximate Cause',
      C: 'Insurable Interest',
      D: 'Contribution'
    },
    correctOption: 'A',
    explanation: 'Subrogation is the legal corollary of indemnity: once the insurer settles the claim in full, it inherits all legal rights and remedies of the insured against liable third parties, preventing double enrichment.',
    difficulty: 'Medium'
  },

  // ==========================================
  // OFFICE PRACTICE
  // ==========================================
  {
    id: 'ofp-1',
    subjectId: 'office-practice',
    subjectName: 'Office Practice',
    topic: 'Filing Systems & Electronic Records',
    examType: 'JAMB',
    year: 2024,
    question: 'Which method of classifying office records arranges files in folders based on geographic regions, countries, Nigerian states, or city territories?',
    options: {
      A: 'Geographical Filing Classification',
      B: 'Alphabetical Order Classification',
      C: 'Chronological Filing by Date',
      D: 'Numerical Filing with Decimal System'
    },
    correctOption: 'A',
    explanation: 'Geographical classification arranges folders according to geographical locations (e.g. Lagos Zone, Kano Zone, Port Harcourt Zone), ideal for logistics and sales firms.',
    difficulty: 'Easy'
  },
  {
    id: 'ofp-2',
    subjectId: 'office-practice',
    subjectName: 'Office Practice',
    topic: 'Business Communication: Memos & Minutes',
    examType: 'WAEC',
    year: 2023,
    question: 'The minimum number of bonafide members that must be legally present at an Annual General Meeting (AGM) or Board meeting before business can be validly transacted is termed the:',
    options: {
      A: 'Quorum',
      B: 'Proxy',
      C: 'Agenda',
      D: 'Resolution'
    },
    correctOption: 'A',
    explanation: 'A Quorum is the stipulated minimum number of eligible members required by company bylaws or standing orders to be present to validate proceedings and legal voting.',
    difficulty: 'Easy'
  },

  // ==========================================
  // STORE MANAGEMENT
  // ==========================================
  {
    id: 'stm-1',
    subjectId: 'store-management',
    subjectName: 'Store Management',
    topic: 'Inventory Control: EOQ, Safety Stock & Lead Time',
    examType: 'JAMB',
    year: 2024,
    question: 'In scientific store management, the Economic Order Quantity (EOQ) is specifically calculated to determine the order size that:',
    options: {
      A: 'Minimizes the sum total of annual inventory holding costs and ordering costs',
      B: 'Maximizes the physical floor storage area of the central warehouse',
      C: 'Ensures that warehouse shelves are filled to 100% capacity at all times',
      D: 'Avoids paying Value Added Tax (VAT) to the Federal Inland Revenue Service'
    },
    correctOption: 'A',
    explanation: 'EOQ formula √(2DS/H) balances annual ordering/setup costs against inventory carrying/holding costs to discover the lowest overall operational inventory cost.',
    difficulty: 'Medium'
  },
  {
    id: 'stm-2',
    subjectId: 'store-management',
    subjectName: 'Store Management',
    topic: 'Store Documentation: Bin Cards & Goods Received Notes',
    examType: 'WAEC',
    year: 2023,
    question: 'A document physically attached to or placed beside storage racks and bins in a warehouse to record quantities received, issued, and current running balance of each specific stock item is called a:',
    options: {
      A: 'Bin Card',
      B: 'Store Requisition Form',
      C: 'Debit Note',
      D: 'Proforma Invoice'
    },
    correctOption: 'A',
    explanation: 'A Bin Card is kept in the physical store room alongside the storage compartment to record stock movements (in, out, balance) quantitatively for quick visual audits.',
    difficulty: 'Easy'
  },

  // ==========================================
  // BOOKKEEPING
  // ==========================================
  {
    id: 'bkp-1',
    subjectId: 'bookkeeping',
    subjectName: 'Bookkeeping',
    topic: 'Petty Cash Book & The Imprest System',
    examType: 'JAMB',
    year: 2024,
    question: 'Under the Imprest System of petty cash, if the chief cashier sets a float of ₦50,000 at the beginning of the month and the petty cashier incurs approved expenses totaling ₦38,400 during the month, how much reimbursement must be paid to restore the float?',
    options: {
      A: '₦38,400',
      B: '₦11,600',
      C: '₦50,000',
      D: '₦88,400'
    },
    correctOption: 'A',
    explanation: 'Under the imprest system, the petty cashier is reimbursed with the EXACT amount spent (₦38,400) so that the cash in hand plus reimbursement restores the original imprest float (₦11,600 + ₦38,400 = ₦50,000).',
    difficulty: 'Medium'
  },
  {
    id: 'bkp-2',
    subjectId: 'bookkeeping',
    subjectName: 'Bookkeeping',
    topic: 'Extraction & Balancing of Trial Balance',
    examType: 'WAEC',
    year: 2023,
    question: 'Which of the following bookkeeping errors will cause the totals of the Debit and Credit columns of a Trial Balance to disagree (fail to balance)?',
    options: {
      A: 'Casting (addition) error in the Sales Day Book transferred to the Sales Account',
      B: 'Error of Original Entry where an invoice of ₦2,000 is recorded as ₦200 in both books',
      C: 'Complete omission of a cash purchase transaction from all ledger accounts',
      D: 'Compensating errors where two independent errors of equal amount cancel out'
    },
    correctOption: 'A',
    explanation: 'Single-sided errors or mathematical calculation/casting errors in day books or ledger extracts affect one side only, creating an imbalance that fails to equalise the Trial Balance.',
    difficulty: 'Hard'
  },

  // ==========================================
  // DATA PROCESSING
  // ==========================================
  {
    id: 'dpr-1',
    subjectId: 'data-processing',
    subjectName: 'Data Processing',
    topic: 'Spreadsheet Applications (Excel Formulas & Charts)',
    examType: 'JAMB',
    year: 2024,
    question: 'In a Microsoft Excel spreadsheet, which formula syntax correctly computes the arithmetic average of exam scores entered across contiguous cells from B2 to B10?',
    options: {
      A: '=AVERAGE(B2:B10)',
      B: '=MEAN(B2..B10)',
      C: '=SUM(B2:B10) / COUNTALL',
      D: '=AVG[B2:B10]'
    },
    correctOption: 'A',
    explanation: 'In Excel, the `=AVERAGE(range)` formula computes the statistical mean across specified cells. The colon `:` designates a contiguous rectangular cell range.',
    difficulty: 'Easy'
  },
  {
    id: 'dpr-2',
    subjectId: 'data-processing',
    subjectName: 'Data Processing',
    topic: 'Relational Databases (Tables, Keys & Queries)',
    examType: 'WAEC',
    year: 2023,
    question: 'In a relational database management system (RDBMS) like MySQL or Access, a field or combination of fields that uniquely identifies each individual record/row in a table without duplicates is the:',
    options: {
      A: 'Primary Key',
      B: 'Foreign Key',
      C: 'Secondary Attribute',
      D: 'Data Schema'
    },
    correctOption: 'A',
    explanation: 'A Primary Key enforces entity integrity by uniquely identifying every record in a table, ensuring no two rows contain identical primary key values (e.g. Student ID or JAMB Reg Number).',
    difficulty: 'Easy'
  },

  // ==========================================
  // TECHNICAL DRAWING
  // ==========================================
  {
    id: 'td-1',
    subjectId: 'technical-drawing',
    subjectName: 'Technical Drawing',
    topic: 'Orthographic Projection (1st & 3rd Angle)',
    examType: 'JAMB',
    year: 2024,
    question: 'In First Angle orthographic projection standard used across British and West African engineering drawing practice, where is the Plan (top view) positioned relative to the Front Elevation?',
    options: {
      A: 'Directly BELOW the Front Elevation',
      B: 'Directly ABOVE the Front Elevation',
      C: 'To the far left of the End Elevation',
      D: 'Diagonally at 45 degrees to the title block'
    },
    correctOption: 'A',
    explanation: 'In First Angle projection, the object is placed between the observer and the plane of projection. Therefore, viewing from the top projects the Plan BELOW the front view. (In 3rd angle, Plan is Above).',
    difficulty: 'Hard'
  },
  {
    id: 'td-2',
    subjectId: 'technical-drawing',
    subjectName: 'Technical Drawing',
    topic: 'Drawing Instruments, Board Practice & Lines',
    examType: 'WAEC',
    year: 2023,
    question: 'In engineering drawing convention, thin continuous lines drawn at an angle of 45° to reveal solid internal surfaces cut by an imaginary cutting plane are termed:',
    options: {
      A: 'Hatching or Section Lines',
      B: 'Hidden Detail Dashed Lines',
      C: 'Center Pitch Circle Lines',
      D: 'Dimension Break Lines'
    },
    correctOption: 'A',
    explanation: 'Section lines (hatching) are thin continuous lines drawn usually at 45° spacing to indicate parts of an object that make direct contact with the cutting plane in sectional drawings.',
    difficulty: 'Medium'
  },

  // ==========================================
  // FOOD AND NUTRITION
  // ==========================================
  {
    id: 'fdn-1',
    subjectId: 'food-and-nutrition',
    subjectName: 'Food and Nutrition',
    topic: 'Food Tests (Biuret, Benedict’s, Iodine, Emulsion)',
    examType: 'JAMB',
    year: 2024,
    question: 'A student adds dilute sodium hydroxide followed by 1% copper (II) sulphate solution (Biuret test) to an unknown liquefied food sample. The solution turns from blue to a distinct violet/purple. This chemical test confirms the presence of:',
    options: {
      A: 'Proteins (Peptide Bonds)',
      B: 'Reducing sugars (Glucose)',
      C: 'Starch (Polysaccharide)',
      D: 'Lipids and Triglycerides'
    },
    correctOption: 'A',
    explanation: 'The Biuret reaction detects peptide bonds in proteins. Copper(II) ions chelate with peptide nitrogen atoms in alkaline conditions, generating a violet/purple coordination complex.',
    difficulty: 'Medium'
  },
  {
    id: 'fdn-2',
    subjectId: 'food-and-nutrition',
    subjectName: 'Food and Nutrition',
    topic: 'Nutrient Classification & Biochemistry',
    examType: 'WAEC',
    year: 2023,
    question: 'A severe protein-deficiency disorder in young children characterized by bilateral edema (swollen belly and feet), depigmented thinning hair, and moon face is diagnosed as:',
    options: {
      A: 'Kwashiorkor',
      B: 'Marasmus',
      C: 'Rickets',
      D: 'Pellagra'
    },
    correctOption: 'A',
    explanation: 'Kwashiorkor is caused by inadequate protein intake despite adequate calorie consumption, resulting in hypoalbuminemia and fluid retention (edema). Marasmus, by contrast, is total starvation (wasting without edema).',
    difficulty: 'Easy'
  },

  // ==========================================
  // ANIMAL HUSBANDRY
  // ==========================================
  {
    id: 'anh-1',
    subjectId: 'animal-husbandry',
    subjectName: 'Animal Husbandry',
    topic: 'Ruminant vs Non-Ruminant Digestion',
    examType: 'JAMB',
    year: 2024,
    question: 'The complex stomach of ruminants (cattle, sheep, goats) consists of four chambers. Which chamber is the "true stomach" where gastric juice and hydrochloric acid (HCl) are secreted for enzymatic digestion?',
    options: {
      A: 'Abomasum',
      B: 'Rumen (Paunch)',
      C: 'Reticulum (Honeycomb)',
      D: 'Omasum (Manyplies)'
    },
    correctOption: 'A',
    explanation: 'The Abomasum is the fourth and only glandular compartment functioning as the true monogastric stomach, producing pepsin and HCl to digest microbes and bypass proteins.',
    difficulty: 'Medium'
  },
  {
    id: 'anh-2',
    subjectId: 'animal-husbandry',
    subjectName: 'Animal Husbandry',
    topic: 'Livestock Diseases (Newcastle, Anthrax, Coccidiosis)',
    examType: 'WAEC',
    year: 2023,
    question: 'Newcastle Disease in commercial poultry farming is caused by an airborne virus belonging to the Paramyxovirus group. A pathognomonic clinical sign of the neurotropic form is:',
    options: {
      A: 'Torticollis (Twisting of the neck and head) and paralysis',
      B: 'Formation of bloody skin nodules on the wattles',
      C: 'Sudden loss of feathers exclusively on the wings',
      D: 'Excessive formation of soft-shelled eggs without mortality'
    },
    correctOption: 'A',
    explanation: 'Velogenic Newcastle Disease causes severe respiratory distress, greenish diarrhea, and characteristic torticollis (twisted neck, star-gazing, leg paralysis) with up to 90-100% flock mortality.',
    difficulty: 'Medium'
  },

  // ==========================================
  // BASIC ELECTRICITY & ELECTRONICS
  // ==========================================
  {
    id: 'ele-1',
    subjectId: 'basic-electricity',
    subjectName: 'Basic Electricity & Electronics',
    topic: 'Resistor, Capacitor & Inductor Networks',
    examType: 'JAMB',
    year: 2024,
    question: 'Two resistors of 6 Ω and 3 Ω are connected in parallel across a 12 V direct current power supply. What is the total equivalent resistance of the parallel combination and the total current supplied by the source?',
    options: {
      A: 'Equivalent Resistance = 2 Ω; Total Current = 6 A',
      B: 'Equivalent Resistance = 9 Ω; Total Current = 1.33 A',
      C: 'Equivalent Resistance = 4.5 Ω; Total Current = 2.67 A',
      D: 'Equivalent Resistance = 18 Ω; Total Current = 0.67 A'
    },
    correctOption: 'A',
    explanation: 'For two resistors in parallel: 1/Req = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2 -> Req = 2 Ω. According to Ohm\'s Law: I = V / Req = 12 V / 2 Ω = 6 A.',
    difficulty: 'Medium'
  },
  {
    id: 'ele-2',
    subjectId: 'basic-electricity',
    subjectName: 'Basic Electricity & Electronics',
    topic: 'Semiconductor Diodes, Rectification & Transistors',
    examType: 'WAEC',
    year: 2023,
    question: 'A semiconductor P-N junction diode under forward bias conditions conducts electrical current because:',
    options: {
      A: 'The external voltage overcomes the potential barrier, narrowing the depletion layer',
      B: 'The depletion layer widens and blocks all majority charge carriers',
      C: 'Silicon atoms turn into superconducting metallic copper particles',
      D: 'Electrons and holes are repelled backwards into the battery terminals'
    },
    correctOption: 'A',
    explanation: 'In forward bias (anode positive, cathode negative), the external electric field opposes the built-in barrier potential, collapsing the depletion layer and allowing majority carriers to cross.',
    difficulty: 'Medium'
  },

  // ==========================================
  // FISHERIES & AQUACULTURE
  // ==========================================
  {
    id: 'fsh-1',
    subjectId: 'fisheries',
    subjectName: 'Fisheries & Aquaculture',
    topic: 'Freshwater & Marine Fisheries in Nigeria',
    examType: 'JAMB',
    year: 2024,
    question: 'The African Sharptooth Catfish (Clarias gariepinus) is the most widely farmed commercial fish species in Nigerian aquaculture primarily because it:',
    options: {
      A: 'Possesses an arborescent accessory breathing organ allowing it to tolerate low dissolved oxygen environments',
      B: 'Can only survive in high salinity oceanic marine deep-water trenches',
      C: 'Reproduces naturally and profusely in stagnant earthen ponds without induced hormone injections',
      D: 'Feeds strictly on plankton and refuses formulated commercial floating pellet feeds'
    },
    correctOption: 'A',
    explanation: 'Clarias gariepinus possesses an arborescent suprabranchial organ that enables it to absorb atmospheric oxygen directly from air, making it extremely hardy in high-density commercial earthen/tarpaulin ponds.',
    difficulty: 'Easy'
  },
  {
    id: 'fsh-2',
    subjectId: 'fisheries',
    subjectName: 'Fisheries & Aquaculture',
    topic: 'Pond Management: Liming & Water Quality (DO, pH)',
    examType: 'WAEC',
    year: 2023,
    question: 'During fish pond preparation prior to impoundment with water and stocking of fingerlings, agricultural limestone (calcium carbonate - CaCO₃) is broadcast over the pond bottom to:',
    options: {
      A: 'Neutralize soil acidity, raise water pH, and destroy pathogenic parasites',
      B: 'Provide artificial lighting for nocturnal underwater fingerling feeding',
      C: 'Permanently dye the pond water black to prevent bird predation',
      D: 'Cool the water temperature to sub-zero freezing levels'
    },
    correctOption: 'A',
    explanation: 'Liming neutralizes acidic pond mud, raises total alkalinity and pH to optimal levels (6.5 – 8.5), precipitates suspended organic particles to improve light penetration, and acts as a mild disinfectant.',
    difficulty: 'Medium'
  },

  // ==========================================
  // HEALTH EDUCATION
  // ==========================================
  {
    id: 'hed-1',
    subjectId: 'health-education',
    subjectName: 'Health Education',
    topic: 'First Aid Protocols: CPR & Emergency Care',
    examType: 'JAMB',
    year: 2024,
    question: 'When performing Cardiopulmonary Resuscitation (CPR) on an unresponsive adult who is not breathing normally, what is the internationally recommended ratio of chest compressions to rescue breaths for a single rescuer?',
    options: {
      A: '30 chest compressions followed by 2 rescue breaths (30:2)',
      B: '15 chest compressions followed by 5 rescue breaths (15:5)',
      C: '50 chest compressions followed by 10 rescue breaths (50:10)',
      D: '10 chest compressions followed by 1 rescue breath (10:1)'
    },
    correctOption: 'A',
    explanation: 'The standard CPR protocol for adult basic life support (BLS) is 30 continuous high-quality chest compressions (at 100-120 bpm, 5-6 cm depth) followed by 2 gentle rescue breaths (30:2 ratio).',
    difficulty: 'Easy'
  },
  {
    id: 'hed-2',
    subjectId: 'health-education',
    subjectName: 'Health Education',
    topic: 'Communicable Diseases: Vectors & Prevention (Malaria, Cholera)',
    examType: 'WAEC',
    year: 2023,
    question: 'In public health epidemiology in Nigeria, what is the precise distinction between the vector and the causal agent (pathogen) in the transmission of malaria?',
    options: {
      A: 'The vector is the female Anopheles mosquito; the causal pathogen is the protozoan Plasmodium parasite',
      B: 'The vector is the Plasmodium protozoan; the causal pathogen is stagnant dirty water',
      C: 'The vector is the housefly (Musca domestica); the causal pathogen is Vibrio cholerae',
      D: 'The vector is a respiratory virus; the causal pathogen is contaminated food'
    },
    correctOption: 'A',
    explanation: 'The biological vector that transmits the infection from human to human is the female Anopheles mosquito, whereas the actual causative microscopic pathogen is the protozoan parasite of the genus Plasmodium (chiefly P. falciparum).',
    difficulty: 'Easy'
  }
];
