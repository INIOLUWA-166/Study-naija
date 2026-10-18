export interface VocabularyWord {
  word: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface StoryChapter {
  title: string;
  content: string; // Multi-paragraph story chapter
}

export interface StoryBook {
  id: string;
  title: string;
  author: string;
  authorBio: string;
  genre: 'Mystery' | 'Sci-Fi' | 'Folklore' | 'Thriller' | 'Historical STEM' | 'Campus Comedy';
  readingTimeMinutes: number;
  wordCount: number;
  difficulty: 'Accessible' | 'Intermediate' | 'Advanced Lexis';
  tagline: string;
  synopsis: string;
  coverGradient: string;
  icon: string;
  badge: string;
  targetAudience: string;
  moralLesson: string;
  chapters: StoryChapter[];
  vocabulary: VocabularyWord[];
  comprehensionQuiz: ComprehensionQuestion[];
}

export const STORY_BOOKS: StoryBook[] = [
  {
    id: 'quantum-calabash-nsukka',
    title: 'The Quantum Calabash of Nsukka',
    author: 'Engr. Adaobi Nwosu',
    authorBio: 'Renewable energy researcher from Enugu State & youth STEM advocate.',
    genre: 'Sci-Fi',
    readingTimeMinutes: 7,
    wordCount: 1350,
    difficulty: 'Intermediate',
    tagline: 'Ancient clay gourd acoustics meet solar power in the hills of Enugu.',
    synopsis: 'Sixteen-year-old Adaora builds a low-frequency emergency radio receiver inside a dried yam barn calabash using crushed quartz crystals and scrap silicon. When an eerie signal from Nigeria’s orbital satellite crackles to life during a heavy thunderstorm, she must race against time to decode a storm flood anomaly that threatens all the farmlands of the South-East.',
    coverGradient: 'from-emerald-900 via-teal-950 to-slate-950',
    icon: '⚡',
    badge: 'Solarpunk STEM',
    targetAudience: 'JAMB STEM & Science Students',
    moralLesson: 'True technological innovation begins with resourcefulness, indigenous wisdom, and the courage to question conventional limits.',
    chapters: [
      {
        title: 'Chapter 1: The Spark in the Yam Barn',
        content: `The afternoon rains in Nsukka did not fall gently; they descended like a million brass rods striking the corrugated zinc roofs of the village. Inside her grandmother’s breezy mud-brick yam barn, Adaora knelt beside a wooden workbench littered with copper windings, discarded transistor coils, and an enormous polished calabash.

"Adaora!" Mama Oby called out, carrying a steaming bowl of roasted corn and pear. "The thunder is dancing on the hills. Stop playing with those dead radio wires before lightning drinks from your fingers!"

Adaora smiled, wiping grease from her cheek with the back of her wrist. "Mama, it is not dead wires. It is a piezoelectric harmonic resonator. The natural curvature of this dried gourd amplifies subterranean and atmospheric frequencies better than any plastic speaker."

Mama Oby shook her head with affectionate bewilderment. "English will not fill the yam barn, my daughter. But if you can make that gourd play the six o'clock news on Radio Nigeria Enugu, I will give you two extra portions of ukwa tonight."

Adaora soldered the final jumper wire onto a salvaged solar diode. She had harvested the quartz crystals from the bed of the dry seasonal stream near the hills of Obukpa. When pressure was applied to quartz, it produced a miniature voltage—a phenomenon her physics teacher, Mr. Okeke, had called piezoelectricity. By aligning three crystals inside the parabolic hollow of the calabash, she had created a self-tuning radio receiver that needed zero disposable dry cells.`
      },
      {
        title: 'Chapter 2: The Whispering Satellite',
        content: `At exactly four minutes past five, as a jagged streak of lightning illuminated the mist over Nsukka town, the calabash hummed. It did not hum with the warm highlife music of Chief Stephen Osita Osadebe. Instead, a rhythmic series of synthesized tonal chirps echoed from the bowl:

*BEEP... BIP-BIP... BEEP-BIP-BIP...*

Adaora froze. Her heart hammered against her ribs. She quickly snatched her spiral-bound notebook and a blue ballpoint pen. The tone was binary—intermittent bursts modulated at exactly 1420 Megahertz. It was the downlink carrier frequency of NigSat-X, the high-altitude remote sensing satellite launched by the National Space Research and Development Agency (NASRDA) in Abuja.

"This is impossible," she whispered. The civilian frequency was encrypted, but the natural resonance of her gourd was acting as a wideband waveguide, picking up the uncompressed telemetry packet.

As she transcribed the hexadecimals onto the ruled paper, the raw numbers formed an alarming pattern:
*ATMOS_PRESSURE: 942 hPa // RUNOFF_VELOCITY: 8.4 m/s // ANOMALY: CREST RISING AT ADANI EARTHEN WEIR.*

Her blood turned cold. The Adani Earthen Dam, thirty-five kilometers downstream, had suffered micro-fractures in last year's rains. If the telemetry was correct, the torrential cloudburst hovering over the Uzo-Uwani agricultural plains had breached the emergency spillway. Over twelve thousand sleeping farmers in the lowlands had less than three hours before a tidal wave of mud and reservoir runoff swept away their harvest.`
      },
      {
        title: 'Chapter 3: The Beacon on the Hill',
        content: `Adaora did not panic. Panic was an inefficient expenditure of kinetic energy. She scrambled to her feet, slung the quantum calabash across her shoulder with a raffia strap, and ran out into the roaring deluge.

Her rubber slippers slapped against the orange red mud as she sprinted towards the campus gate of the University of Nigeria, Nsukka. In the Department of Electronic Engineering, Professor Chinedu was packing his briefcase for the evening when the soaked, mud-splattered teenager burst into the faculty laboratory.

"Professor! Check the telemetry on 1420 Megahertz right now!" she gasped, thrusting her handwritten decipher sheets onto his mahogany desk.

The professor frowned, ready to scold her for tracking mud across the linoleum, but his eyes caught the mathematical transcription. "Where did you get these coefficients? This is live Doppler radar scatterometry from the geosynchronous orbit!"

"From this calabash," Adaora said simply, holding up the humble gourd wrapped in copper filaments.

Professor Chinedu connected the signal feed to the university’s high-gain antenna on the laboratory roof. The oscilloscope flared bright green. The reading was unmistakable: the Adani reservoir level was at 98.7% critical capacity and surging. Within five minutes, Professor Chinedu had placed an urgent emergency red-line call to the State Emergency Management Agency (SEMA) and the Governor's office.

Sirens echoed across the river valleys thirty minutes later. Evacuation trucks and mobile loudspeakers rolled through the sleeping villages of Adani and Omor. When the earthen weir finally gave way under the midnight deluge at two in the morning, the farmlands flooded, but every single human soul—thousands of mothers, elders, and children—had been safely moved to higher ground.

The next morning, as the sun broke golden over the green hills of Nsukka, a convoy of official vehicles pulled up outside Mama Oby’s modest compound. When the Director General of NASRDA asked Adaora how an ordinary schoolgirl had intercepted a classified telemetry alert, Adaora smiled, handed him the calabash, and said:

"In Nigeria, sir, wisdom has always lived inside nature. We only needed the curiosity to tune in."`
      }
    ],
    vocabulary: [
      {
        word: 'Piezoelectric',
        partOfSpeech: 'adjective',
        definition: 'Generating electric charge in response to applied mechanical stress, common in quartz crystals.',
        exampleSentence: 'The quartz crystal in the calabash exhibited piezoelectric properties under acoustic pressure.'
      },
      {
        word: 'Telemetry',
        partOfSpeech: 'noun',
        definition: 'The automatic measurement and wireless transmission of data from remote or inaccessible sources (e.g., satellites).',
        exampleSentence: 'The orbital satellite sent live telemetry of cloud formations to ground stations.'
      },
      {
        word: 'Resonator',
        partOfSpeech: 'noun',
        definition: 'An apparatus or hollow body that exhibits resonance, increasing the intensity of sounds or electromagnetic waves.',
        exampleSentence: 'The dried gourd served as an acoustic resonator, amplifying minute radio frequencies.'
      },
      {
        word: 'Doppler',
        partOfSpeech: 'noun / adjective',
        definition: 'Relating to changes in frequency of waves as the observer and source move toward or away from each other.',
        exampleSentence: 'The radar utilized Doppler scatterometry to track rising flood velocity.'
      }
    ],
    comprehensionQuiz: [
      {
        id: 'qc-q1',
        question: 'Why did Adaora use a dried calabash instead of a conventional plastic radio speaker?',
        options: {
          A: 'Because she had no money to purchase any wire',
          B: 'The natural parabolic curvature of the gourd amplified acoustic and electromagnetic frequencies',
          C: 'Her grandmother forbade her from using modern metal enclosures',
          D: 'Plastic attracts too much lightning during rainstorms'
        },
        correctOption: 'B',
        explanation: 'Adaora explained that the natural parabolic curvature of the dried gourd acted as an acoustic resonator and waveguide for subterranean and atmospheric frequencies.'
      },
      {
        id: 'qc-q2',
        question: 'What impending catastrophe did the decoded satellite telemetry warn about?',
        options: {
          A: 'A severe drought that would dry up the seasonal streams',
          B: 'An earthquake centered under the hills of Obukpa',
          C: 'A breach of the Adani Earthen Dam spillway threatening thousands of farmers',
          D: 'A malfunction in the solar power grid of University of Nigeria'
        },
        correctOption: 'C',
        explanation: 'The telemetry readings revealed rising water runoff and critical pressure at the Adani Earthen Weir, threatening downstream farming communities.'
      },
      {
        id: 'qc-q3',
        question: 'Which scientific principle explained how quartz crystals generated voltage under pressure?',
        options: {
          A: 'Electrolysis',
          B: 'Piezoelectricity',
          C: 'Nuclear fission',
          D: 'Thermodynamic equilibrium'
        },
        correctOption: 'B',
        explanation: 'Piezoelectricity is the generation of electrical potential in certain solid materials (like quartz crystals) when mechanical stress is applied.'
      },
      {
        id: 'qc-q4',
        question: 'What core lesson does Adaora’s discovery teach young Nigerian scholars?',
        options: {
          A: 'Modern science and indigenous African materials can merge to solve life-saving problems',
          B: 'Students should avoid university professors until after examinations',
          C: 'Calabashes are only useful for storing food and liquids',
          D: 'Weather forecasts can never be trusted without foreign approval'
        },
        correctOption: 'A',
        explanation: 'Adaora demonstrated that blending indigenous Nigerian resources (the resonant calabash) with scientific inquiry leads to groundbreaking innovation.'
      }
    ]
  },
  {
    id: 'midnight-mystery-hall-4',
    title: 'The Midnight Organ of Hall 4',
    author: 'Dr. Funmilayo Adeleke',
    authorBio: 'Former Dean of Student Affairs & Literature Professor at University of Ibadan.',
    genre: 'Mystery',
    readingTimeMinutes: 8,
    wordCount: 1520,
    difficulty: 'Intermediate',
    tagline: 'Ghostly music, an exam week panic, and a clever investigation at University of Ibadan.',
    synopsis: 'In the oldest residential hall at the University of Ibadan, eerie nocturnal organ chords and flickering blue phantom lights have panicked students on the eve of their final semester exams. Two roommates—Segun, a skeptical mechanical engineering student, and Femi, a keen history scholar—refuse to believe in ghosts and set a trap that unmasks a high-stakes campus conspiracy.',
    coverGradient: 'from-indigo-950 via-slate-900 to-purple-950',
    icon: '🕵️‍♂️',
    badge: 'Campus Whodunit',
    targetAudience: 'University & Secondary School Scholars',
    moralLesson: 'Superstition flees in the face of logical scrutiny; critical thinking and integrity are a student’s greatest shield.',
    chapters: [
      {
        title: 'Chapter 1: The Haunting in the Belfry',
        content: `Examinations at the University of Ibadan were notoriously demanding, but in June of 1998, a terror far more sinister than Organic Chemistry haunted the occupants of Independence Hall—popularly known as Hall 4.

Every night at precisely seventeen minutes past midnight, when the reading rooms had dimmed and the crickets in the teak trees fell silent, a mournful organ chord drifted down from the abandoned belfry tower. It sounded like Bach’s *Toccata and Fugue in D minor*, but played in reverse. Simultaneously, an eerie, pulsing cyan light danced across the high louvers of Room 304.

"It is the ghost of Professor Vanderpuye," shuddered Biodun, a nervous pre-med student, packing his textbooks into a duffel bag at 1:00 AM. "My uncle told me that in 1964, a Dutch music lecturer died in that tower while searching for a lost manuscript. I am moving to Off-Campus hostels until exams are over!"

More than thirty students had already abandoned the second floor. Hall 4, usually bustling with vibrant debate and the savory aroma of midnight Indomie noodles, had turned into an echo chamber of dread.`
      },
      {
        title: 'Chapter 2: The Logic of the Pendulum',
        content: `Segun, a final-year Mechanical Engineering scholar with thick horn-rimmed spectacles, chewed on the cap of his mechanical pencil. He was sitting opposite his roommate, Femi, who was reading an archival history of colonial Ibadan.

"Ghosts do not understand classical pipe acoustics, Femi," Segun remarked dryly, adjusting his lamp. "Sound waves require a physical medium—either vibrating air columns or mechanical resonance. Furthermore, the belfry organ had its lead bellows removed in 1982 during the university renovations. No phantom lungs can blow through rusted pipes without an air compressor."

"Then who is playing?" Femi asked, leaning forward. "And why only between midnight and 1:30 AM, right when the exam committee is storing tomorrow's question papers in the Faculty vault next door?"

Segun’s eyes narrowed behind his lenses. "Next door. Exactly. The old belfry shares a common load-bearing brick wall with the Department of Chemistry Examination Strongroom."

That night, instead of packing their bags, Segun and Femi carried a flashlight, a spool of nylon fishing line, and an old cassette dictaphone borrowed from the Mass Communication department. They quietly slipped past the padlock on the bell tower door, which Segun noted was remarkably well-oiled for a door supposedly sealed since the military era.`
      },
      {
        title: 'Chapter 3: The Trap Closes',
        content: `Inside the tower, dust motes swirled in the beam of Segun’s flashlight. The floor was strewn with old hymn books, but beside a decaying mahogany bench sat something completely modern: a 12-volt car battery connected to an inverted bass horn speaker, an electronic synthesizer timer, and an ultraviolet insect-killer lamp retrofitted with a blue prism lens.

"Look at this," Segun whispered, pointing to the synthesizer's LCD display. It was pre-programmed to blast reverse organ chords at 12:17 AM automatically.

Suddenly, floorboards creaked behind them.

A tall figure wearing a dark laboratory coat and gloves stepped out from behind the water tank. He was holding a thermal heat drill and a counterfeit master key to the Examination Strongroom safe.

"You boys should have fled like the other superstitious fools," a familiar voice hissed.

The flashlight beam flicked upward, revealing the sweaty face of Dr. Anthony Nwosu, the adjunct lecturer of Physical Chemistry.

Dr. Nwosu had been under investigation for selling leaked exam questions to wealthy syndicate candidates. To raid the vault without campus security or students noticing the whirring noise of his diamond-tipped drill, he had invented the 'Hall 4 Phantom.' The chilling music and flashing lights kept the entire dormitory deserted, while the loud low-frequency organ notes masked the vibration of his drilling into the vault wall!

"Step away from that desk, boys," Dr. Nwosu snarled, lunging forward.

He did not see the nylon tripwire Segun had strung between the banisters. With an undignified yell, the fraudulent lecturer tumbled forward into a mountain of discarded wicker hymn baskets. Before he could recover, Femi pushed the heavy oak fire door shut and turned the brass deadbolt.

Within fifteen minutes, the University Chief Security Officer and the Dean of Science arrived with campus patrol guards. In Dr. Nwosu’s backpack, they discovered duplicate seal stamps, leaked examination matrices, and two hundred thousand naira in marked cash.

The following morning, the Vice-Chancellor personally addressed the student assembly. Segun and Femi were awarded university commendations for meritorious integrity, and the 'Ghost of Hall 4' was officially retired.

As Segun walked into his Mechanical Engineering finals that afternoon, Biodun rushed over and hugged him. "Segun! You saved our semester! But how did you know for sure it was human?"

Segun tapped his forehead with a confident grin. "Superstition looks for monsters in the shadows, my friend. Science turns on the light."`
      }
    ],
    vocabulary: [
      {
        word: 'Belfry',
        partOfSpeech: 'noun',
        definition: 'A bell tower or steeple housing bells, especially on a church or institutional building.',
        exampleSentence: 'The mournful music resonated from the highest chamber of the belfry.'
      },
      {
        word: 'Acoustics',
        partOfSpeech: 'noun',
        definition: 'The properties or qualities of a room or building that determine how sound is transmitted in it.',
        exampleSentence: 'The high stone ceilings created eerie acoustics that carried every whisper.'
      },
      {
        word: 'Superstition',
        partOfSpeech: 'noun',
        definition: 'Excessively credulous belief in and reverence for supernatural beings or omens.',
        exampleSentence: 'Dr. Nwosu relied on student superstition to keep his illicit scheme concealed.'
      },
      {
        word: 'Syndicate',
        partOfSpeech: 'noun',
        definition: 'A group of individuals or organizations combined to promote some common interest, often clandestine or illegal.',
        exampleSentence: 'The lecturer had conspired with an external examination leak syndicate.'
      }
    ],
    comprehensionQuiz: [
      {
        id: 'mm-q1',
        question: 'What was the true purpose behind the ghost rumors and midnight organ music in Hall 4?',
        options: {
          A: 'A theater group was rehearsing for the university convocation ceremony',
          B: 'To scare students away so a corrupt lecturer could drill into the exam vault undetected',
          C: 'The university was conducting an experiment on collective psychology',
          D: 'A genuine spirit was looking for his lost sheet music'
        },
        correctOption: 'B',
        explanation: 'Dr. Nwosu rigged the speakers and lights to frighten students into abandoning the dormitory, allowing him to use a loud drill to breach the examination vault without detection.'
      },
      {
        id: 'mm-q2',
        question: 'What physical evidence first caused Segun to doubt that a supernatural ghost was playing the organ?',
        options: {
          A: 'The lead bellows of the belfry organ had been removed years ago, making pipe music impossible',
          B: 'He smelled fresh fried plantains coming from the tower',
          C: 'The organ music was in key F instead of key C',
          D: 'He received a WhatsApp message from the principal'
        },
        correctOption: 'A',
        explanation: 'Segun noted that the belfry organ’s lead air bellows had been removed in 1982 during renovations, proving that air could not pass through the pipes without an artificial electric compressor.'
      },
      {
        id: 'mm-q3',
        question: 'Which device did Segun use to immobilize the intruder before security arrived?',
        options: {
          A: 'A chemical fire extinguisher',
          B: 'A nylon tripwire strung between the banisters and a heavy oak door deadbolt',
          C: 'An electric stun baton',
          D: 'A heavy physics textbook dropped from the roof'
        },
        correctOption: 'B',
        explanation: 'Segun strung a nylon fishing tripwire between the banisters, causing the lecturer to trip into baskets before locking the brass deadbolt.'
      },
      {
        id: 'mm-q4',
        question: 'What overarching theme does this story convey to students preparing for examinations?',
        options: {
          A: 'Fear and rumors should always be met with rational inquiry, scientific observation, and moral courage',
          B: 'Old dormitories should never be visited after sunset',
          C: 'Lecturers are always right and should never be questioned',
          D: 'Music students make the best engineering scholars'
        },
        correctOption: 'A',
        explanation: 'The story emphasizes that superstition flees in the light of scientific reasoning, evidence, and intellectual integrity.'
      }
    ]
  },
  {
    id: 'ijapa-river-of-wisdom',
    title: 'Ijapa and the River of Wisdom',
    author: 'Chief Babatunde Alabi',
    authorBio: 'Renowned Yoruba folklorist, cultural dramatist, and oral history custodian.',
    genre: 'Folklore',
    readingTimeMinutes: 6,
    wordCount: 1180,
    difficulty: 'Accessible',
    tagline: 'The cunning tortoise learns that wisdom belongs to everyone, not to one greedy shell.',
    synopsis: 'During a severe drought across the animal kingdom of Ilu-Eranko, Ijapa the tortoise concocts a scheme to hoard all the wisdom proverbs of the world in an earthen pot so that kings and animals will pay him heaps of cowries for counsel. But when he tries to climb the great Iroko tree, a small child and a tiny bird teach him a lesson he will carry on his cracked shell forever.',
    coverGradient: 'from-amber-950 via-yellow-950 to-emerald-950',
    icon: '🐢',
    badge: 'Classic Nigerian Fable',
    targetAudience: 'All Primary, Secondary & Literature Students',
    moralLesson: 'No single human or tortoise possesses all knowledge; wisdom is communal, and pride always precedes a stumble.',
    chapters: [
      {
        title: 'Chapter 1: The Greedy Plan of Ijapa',
        content: `In the ancient days before the sun wore a veil of smoke, famine visited Ilu-Eranko, the city of animals. The streams refused to sing, the cassava roots shrank like dry stones, and King Lion convened the animal assembly under the shade of the ancient Baobab tree.

"Our elders have always said that when problem meets problem, wisdom is the machete that clears the path," the Lion roared. "Whoever discovers how our ancestors summoned the great subterranean springs shall receive a calabash filled with coral beads and fifty baskets of yams."

Sitting at the edge of the clearing was Ijapa, the tortoise. His shell was dry, his neck was wrinkled, but behind his sleepy eyes burned a relentless fire of cunning.

"Why should I share wisdom with everyone?" Ijapa whispered to his wife, Yannibo, when he returned home. "If I collect all the proverbs, all the riddles, all the herbal remedies, and all the mathematical calculations of the world into one large earthen pot, no one will be able to solve a single problem without paying me homage!"

Yannibo sighed and stirred her pot of bitterleaf soup. "Ijapa, your head is too small to carry the crown of the universe. Wisdom is like the wind; if you trap it in a clay jar, it will suffocate."

Ijapa laughed—a raspy, rattling laugh that sounded like dry melon seeds shaking in a hollow gourd. "Watch me, woman. Tomorrow, the world will prostrate before my shell!"`
      },
      {
        title: 'Chapter 2: The Pot Around the Neck',
        content: `For seven market days, Ijapa roamed from the banks of the River Niger to the rocky hills of Idanre. Wherever he met an elder reciting a proverb, he scooped up their words into his earthenware pot. Wherever he found a hunter tracking constellations, he trapped the knowledge under a beeswax cork. Wherever he heard a blacksmith whispering metallurgical secrets, into the pot it went!

By the evening of the seventh day, the pot was so full of wisdom that it glowed with a faint, shimmering golden aura.

"Now," Ijapa chuckled, panting under the immense weight of the pot. "I must hide this at the very top of the tallest Iroko tree in the sacred forest. Once it is hidden among the clouds, whenever King Lion or Elephant needs advice, they will have to crawl to the foot of my tree and beg me on their knees."

He reached the giant Iroko tree. Its trunk was as wide as ten men holding hands, its bark covered in moss.

Ijapa tied a strong hemp rope around the neck of the pot and slung it across his chest. He pressed his belly against the tree trunk and tried to climb.

*Scritch... scratch... slip!*

The pot hanging on his chest bumped painfully against the tree bark. It blocked his short front legs. Every time he lifted his claws to grasp a higher crevice, the bulky jar pushed him backward. He tried once, twice, five times, sliding down with a mouthful of dirt.

"Cursed bark!" Ijapa cursed, wiping sweat from his leathery brow. "Is this tree bewitched by forest spirits?"`
      },
      {
        title: 'Chapter 3: The Laughter of the Bush Fowl',
        content: `High on a nearby branch, a small juvenile bush fowl sat watching the tortoise struggle. The little bird cocked its head, blinked its bright amber eyes, and let out a melodious chirp of laughter.

"Ijapa Tiroko, legendary father of tricks!" the bush fowl sang. "If you claim to carry all the wisdom of heaven and earth inside that clay jar, why do you not possess the simple sense to tie the pot to your *back* instead of your chest? If it is on your back, your arms and legs will be free to climb without obstruction!"

Ijapa stopped dead in his tracks. He stared at the little bird.

A wave of bitter shame washed over him. Here he was, claiming to possess every drop of wisdom in existence, yet a fledgling bird not yet old enough to lay an egg had pointed out an obvious truth that had completely escaped him!

"So," Ijapa growled in fury, his temper exploding like a dry pod in a bushfire, "I do not even have all the wisdom after all! This pot is a fraud!"

In his childish rage, Ijapa unhitched the hemp rope and hurled the earthenware pot against the giant roots of the Iroko tree with all his might.

*CRASH!*

The clay shattered into ten thousand glittering shards! The trapped wisdom, released in a blinding flash of golden light, burst into the upper atmosphere. The evening breeze caught the words, the proverbs, the insights, and the secrets, scattering them in every direction across the four winds of the earth.

A particle of wisdom landed on the schoolteachers in Lagos. A fragment landed on the farmers in Benue. A spark landed on the engineers in Aba, and a generous portion landed in the minds of young students reading beneath lanterns in every corner of Nigeria.

As for Ijapa, he was so startled by the explosion that he tumbled backward off the tree root, landing flat on his back on a bed of jagged river rocks.

*CRACK!*

His smooth, polished shell fractured into dozens of interlocking plates. Yannibo had to spend three days gluing his shell back together with boiled tree resin and palm oil, which is why to this very day, every tortoise walks with a patched, cracked shell and stays close to the ground, reminding the world that no single being can ever monopolize the wisdom of humanity.`
      }
    ],
    vocabulary: [
      {
        word: 'Monopolize',
        partOfSpeech: 'verb',
        definition: 'To get or keep exclusive control over something, preventing others from sharing.',
        exampleSentence: 'Ijapa attempted to monopolize all the wisdom of the earth in a single pot.'
      },
      {
        word: 'Constellation',
        partOfSpeech: 'noun',
        definition: 'A group of stars forming a recognizable pattern that is traditionally named after its apparent form.',
        exampleSentence: 'The ancient hunters mapped celestial constellations to navigate through the dark forest.'
      },
      {
        word: 'Fledgling',
        partOfSpeech: 'noun / adjective',
        definition: 'A young bird that has just fledged; an inexperienced young person.',
        exampleSentence: 'A fledgling bush fowl easily outsmarted the veteran tortoise.'
      },
      {
        word: 'Obstruction',
        partOfSpeech: 'noun',
        definition: 'A thing that blocks or hinders passage, progress, or movement.',
        exampleSentence: 'The heavy clay pot created an obstruction against the rough tree bark.'
      }
    ],
    comprehensionQuiz: [
      {
        id: 'ij-q1',
        question: 'Why did Ijapa fail in his initial attempts to climb the Iroko tree?',
        options: {
          A: 'His shell was too heavy to lift',
          B: 'He tied the bulky pot to his chest, preventing his claws from gripping the bark',
          C: 'King Lion had posted guards around the tree trunk',
          D: 'A sudden downpour washed away his footing'
        },
        correctOption: 'B',
        explanation: 'Because Ijapa tied the pot to his chest, the bulky clay collided with the trunk and blocked his front legs from climbing.'
      },
      {
        id: 'ij-q2',
        question: 'Who pointed out the simple solution that Ijapa should tie the pot to his back?',
        options: {
          A: 'His wise wife Yannibo',
          B: 'King Lion of Ilu-Eranko',
          C: 'A young fledgling bush fowl watching from a nearby branch',
          D: 'An elderly baboon herbalist'
        },
        correctOption: 'C',
        explanation: 'A young bush fowl laughed and asked why the tortoise did not have the common sense to sling the pot over his back.'
      },
      {
        id: 'ij-q3',
        question: 'What happened when Ijapa furiously smashed the pot of wisdom in frustration?',
        options: {
          A: 'The wisdom evaporated into thin air and was lost forever',
          B: 'The wisdom scattered across the four winds of the earth, blessing all people everywhere',
          C: 'King Lion arrested him for destroying royal property',
          D: 'The forest caught fire from the golden sparks'
        },
        correctOption: 'B',
        explanation: 'The trapped wisdom burst into the evening breeze and scattered across the earth, ensuring everyone has access to understanding.'
      },
      {
        id: 'ij-q4',
        question: 'According to this folklore legend, why does the tortoise shell have cracks and seams today?',
        options: {
          A: 'He was stepped on by an elephant in the savannah',
          B: 'He fell onto jagged rocks when the pot exploded, and his wife glued the pieces back together',
          C: 'It was painted that way by ancient shrine artists',
          D: 'He was born that way to blend into dry tree bark'
        },
        correctOption: 'B',
        explanation: 'Ijapa fell backward onto jagged river rocks after throwing the pot, cracking his shell, which Yannibo repaired with boiled resin.'
      }
    ]
  },
  {
    id: 'last-danfo-oshodi',
    title: 'The Last Danfo to Oshodi',
    author: 'Tobi Babalola',
    authorBio: 'Lagos-based investigative journalist and urban narrative author.',
    genre: 'Thriller',
    readingTimeMinutes: 9,
    wordCount: 1650,
    difficulty: 'Intermediate',
    tagline: 'A rain-slicked expressway, a lost folder, and four strangers racing midnight in Lagos.',
    synopsis: 'Seventeen-year-old Damilola has just ninety minutes to deliver his original JAMB registration slip and national merit portfolio to the university registrar’s office on Lagos Island. Stranded in a torrential deluge at Ikorodu bus stop, he boards the last rickety yellow Danfo bus alongside an eccentric retired train driver, a frantic medical intern, and a sharp conductor named Agbero King.',
    coverGradient: 'from-amber-900 via-stone-900 to-yellow-950',
    icon: '🚌',
    badge: 'Lagos Urban Suspense',
    targetAudience: 'JAMB UTME Candidates & Urban Youth',
    moralLesson: 'Calm composure in adversity, mutual empathy, and honesty turn life’s chaotic traffic jams into triumph.',
    chapters: [
      {
        title: 'Chapter 1: The Deluge at Ikorodu',
        content: `The sky over Lagos looked like bruised indigo velvet. At 6:45 PM on a Tuesday evening, torrential rain turned the Ikorodu Expressway into an unbroken sea of flashing brake lights, honking horns, and cascading brown water.

Under the leaking awning of a roadside kiosk, Damilola clutched a waterproof plastic folder to his chest. Inside lay the culmination of two years of sleepless study: his JAMB score slip showing 342, his WAEC distinction certificate with six A1s, and the stamped letter inviting him to the National Petroleum Merit Scholarship interview at 8:00 PM sharp at the Federal Palace Secretariat on Marina Island.

"If you miss this interview, young man, your slot goes to the candidate on the reserve list," the administrative secretary had warned him over the phone that morning. "The interview panel disperses at 8:15 PM."

It was already 7:02 PM. The ride hailing apps on his low-battery phone showed endless spinning circles: *No drivers available in your sector.*

Suddenly, an engine roared through the spray like a wounded rhinoceros. A yellow Volkswagen LT35 Danfo bus, with hand-painted black stripes and a crooked bumper, screeched to a halt in the floodwater.

"Oshodi! Oshodi-Oke straight! No change o! Enter with your exact fifty naira!" the conductor screamed, hanging out of the open door by a single rubber grip.

Damilola did not hesitate. He vaulted over a muddy puddle and squeezed into the narrow bench behind the driver.`
      },
      {
        title: 'Chapter 2: The Passengers of the Storm',
        content: `The interior of the Danfo smelled of damp denim, fried plantain chips, and wet engine oil. Beside Damilola sat three passengers who looked just as battered by the Lagos evening as he was.

Directly to his right was Dr. Aminat, a house officer at the General Hospital, wearing a rain-soaked green scrub top. In her lap, she carefully guarded a portable insulated cold box containing rare anti-snake venom vials destined for an emergency patient in Ikeja.

In the front passenger seat was Pa Johnson, a retired Nigerian Railway Corporation locomotive engineer with a silver goatee and an ancient brass pocket watch.

Behind the wheel sat Baba Moruf, a veteran driver whose hands gripped the steering wheel as if wrestling a python. His dashboard was adorned with miniature green-and-white Nigerian flags and a faded sticker reading: *NO HURRY IN LIFE, BUT NO SLEEP FOR LAGOS.*

"Conductor, why are we crawling?" Dr. Aminat pleaded, checking her watch. "The patient at General Hospital is slipping into anaphylactic shock. If we do not hit Third Mainland Bridge in twenty minutes, I will be too late!"

Baba Moruf glanced in his cracked rear-view mirror. "Madam doctor, look ahead. Two articulated container trailers have broken down across the Ojota flyover. The whole expressway is blocked like a clogged drainpipe."

Damilola felt a knot tighten in his stomach. The digital clock on his dying phone read 7:22 PM. Forty minutes left. It was impossible.`
      },
      {
        title: 'Chapter 3: The Old Railway Line',
        content: `Pa Johnson suddenly tapped the glass of his brass pocket watch. "Baba Moruf! You have been driving this route for twenty years. Do you still remember the old maintenance spur behind the railway yard at Maryland?"

Baba Moruf’s eyes widened. "The unpaved ballast track? Ah, Baba, that road has not been used since the civil service strike of 1993! There are potholes deep enough to drown a goat!"

"My bus has German suspension and prayers from my mother in Abeokuta!" Baba Moruf roared, throwing the gear lever into reverse with an ear-splitting grind of gears.

With audacious precision, the yellow Danfo swung off the flooded asphalt and plunged into a dark, narrow bypass running alongside the historic railway tracks. Mud sprayed high against the windows. The bus bucked and rattled like an amusement park ride, but the abandoned gravel road was completely empty of traffic.

Within twelve breathtaking minutes, the headlights picked up the towering steel gantries of Third Mainland Bridge.

The rain suddenly parted over the Lagos lagoon. The vast bridge stretched out like an illuminated runway over the ink-black water, and the Danfo flew at eighty kilometers an hour, tires humming against the asphalt.

At exactly 7:51 PM, Baba Moruf pulled up with a victorious hiss of air brakes outside the gates of the Federal Palace Secretariat.

Damilola scrambled out, his heart pounding with overwhelming gratitude. He reached into his pocket and pulled out his remaining five hundred naira note to hand to the conductor.

"Keep your money, student," the gruff conductor said with a wink, waving him off. "Go inside that building and represent Naija with your brain. But make sure when you become Minister of Transport, you fix our railway!"

Dr. Aminat squeezed Damilola’s hand. "Good luck, scholar. You helped us keep our courage."

Damilola straightened his collar, dried his shoes on the entrance mat, and marched through the double mahogany doors of the boardroom at precisely 7:57 PM. When the head of the scholarship committee looked up from his glasses and asked how he had managed to beat the worst flood in Lagos history, Damilola smiled proudly and replied:

"By the grace of God, sir, and the indestructible spirit of the Lagos Danfo."`
      }
    ],
    vocabulary: [
      {
        word: 'Deluge',
        partOfSpeech: 'noun',
        definition: 'A severe flood; a heavy downpour of rain.',
        exampleSentence: 'The evening deluge transformed the four-lane expressway into a raging torrent.'
      },
      {
        word: 'Anaphylactic',
        partOfSpeech: 'adjective',
        definition: 'Relating to a severe, potentially life-threatening allergic reaction requiring immediate medical intervention.',
        exampleSentence: 'The emergency doctor carried medication to treat severe anaphylactic shock.'
      },
      {
        word: 'Ballast',
        partOfSpeech: 'noun',
        definition: 'Heavy gravel or coarse stones laid to form a stable bed for a railway track.',
        exampleSentence: 'The old maintenance track was paved with crushed stone ballast.'
      },
      {
        word: 'Audacious',
        partOfSpeech: 'adjective',
        definition: 'Showing a willingness to take surprisingly bold risks.',
        exampleSentence: 'Baba Moruf made an audacious maneuver through the abandoned bypass.'
      }
    ],
    comprehensionQuiz: [
      {
        id: 'ld-q1',
        question: 'Why was Damilola desperately trying to reach Marina Island before 8:00 PM?',
        options: {
          A: 'To catch an international flight to London',
          B: 'To submit his certificates for a prestigious National Petroleum Merit Scholarship interview',
          C: 'To write an evening WAEC Physics practical exam',
          D: 'To deliver medicine to a hospital patient'
        },
        correctOption: 'B',
        explanation: 'Damilola had to present his 342 JAMB score and distinctions to the National Petroleum Merit Scholarship committee before the 8:15 PM deadline.'
      },
      {
        id: 'ld-q2',
        question: 'How did the driver bypass the massive traffic gridlock caused by the broken trailers?',
        options: {
          A: 'He drove through a pedestrian footbridge',
          B: 'He hired a motorboat across the lagoon',
          C: 'He followed an old gravel railway maintenance spur suggested by a retired train conductor',
          D: 'A police escort cleared the expressway for them'
        },
        correctOption: 'C',
        explanation: 'Pa Johnson, a retired railway engineer, reminded the driver of an abandoned gravel maintenance spur along the Maryland rail corridor.'
      },
      {
        id: 'ld-q3',
        question: 'What memorable advice did the Danfo conductor give Damilola when refusing his transport fare?',
        options: {
          A: 'Never return to Lagos during rainy season',
          B: 'Always carry an umbrella and boots',
          C: 'Make sure when you become Minister of Transport, you fix our railway',
          D: 'Buy your own car as soon as possible'
        },
        correctOption: 'C',
        explanation: 'The conductor told him to keep his money, excel in the interview, and fix the nation’s railway system when he becomes a leader.'
      },
      {
        id: 'ld-q4',
        question: 'What character virtue enabled the passengers to overcome the night’s crisis?',
        options: {
          A: 'Mutual solidarity, presence of mind, and collective problem-solving under stress',
          B: 'Complaining loudly until the police arrived',
          C: 'Abandoning the bus and walking on foot in the rain',
          D: 'Bribing other motorists to clear the road'
        },
        correctOption: 'A',
        explanation: 'The strangers supported each other, shared situational knowledge, and remained resilient despite the overwhelming weather and traffic.'
      }
    ]
  },
  {
    id: 'girl-who-weighed-the-sun',
    title: 'The Girl Who Weighed the Sun',
    author: 'Hajia Maryam Sanusi',
    authorBio: 'Astrophysics lecturer at Bayero University Kano & girls’ education pioneer.',
    genre: 'Historical STEM',
    readingTimeMinutes: 7,
    wordCount: 1300,
    difficulty: 'Intermediate',
    tagline: 'Shadows, sundials, and a teenage girl who outsmarted the 1968 colonial observatory.',
    synopsis: 'In Kano City during the solar eclipse of September 1968, fifteen-year-old Amina uses a handmade pinhole water mirror and trigonometry to calculate the solar corona diameter. When her findings contradict the visiting European survey team, she must defend her calculations before the Emir’s palace council.',
    coverGradient: 'from-amber-950 via-rose-950 to-slate-950',
    icon: '☀️',
    badge: 'Historical STEM Heroine',
    targetAudience: 'WAEC Mathematics & Physics Scholars',
    moralLesson: 'Scientific truth respects no borders, titles, or gender; empirical evidence speaks louder than authority.',
    chapters: [
      {
        title: 'Chapter 1: The Geometry of Shadows',
        content: `Long before calculators were imported into northern classrooms, fifteen-year-old Amina sat in the courtyard of her family’s mud-walled compound in the ancient city of Kano.

Around her lay dried calabashes filled with dyed indigo water, bamboo rulers marked in millimeters, and a copy of the *Algebra of Al-Khwarizmi* translated into Hausa.

While other girls her age were discouraged from pursuing mathematics, Amina’s grandfather, Mallam Sanusi—a venerable astronomer who calculated the lunar months for Ramadan—had noticed her unusual gift. At age nine, she could compute the volume of a granary cone in her head faster than the tax collectors could write it down with ink.

"Amina," her grandfather called gently from the veranda. "Tomorrow at midday, the sun will put on a black turban. The European scientists from Cambridge have arrived with brass telescopes at the Gidan Rumfa palace. They say our people should stay indoors because looking at the sky will bring blindness."

Amina dipped her bamboo stylus into black soot ink. "Grandfather, the sky is not a monster. It is geometry. When the moon crosses between the earth and the sun, the umbra shadow travels at over two thousand kilometers per hour. If I use a water mirror, I can observe the solar corona without burning my eyes."`
      },
      {
        title: 'Chapter 2: The Discrepancy at the Palace',
        content: `On the morning of the eclipse, the sun rose blazing hot over the red walls of Kano.

In the courtyard of the Emir’s palace, Dr. Arthur Kensington, a senior astronomer from London, adjusted the brass lenses of a six-inch equatorially mounted refractor telescope. Around him gathered palace officials, British district officers, and courtiers in colorful turbans.

"Gentlemen," Dr. Kensington announced, checking his chronometer. "Totality will commence at 12:14 PM and last exactly three minutes and forty-two seconds. The calculated solar disc diameter according to the Royal Nautical Almanac is 1.004 degrees."

Standing respectfully at the perimeter of the courtyard, Amina knelt beside her indigo water bowl. Beside her, a smooth wooden board held a vertical plumb line that cast a needle-thin shadow.

At 12:14 PM, a chilling darkness fell across Kano. The temperature dropped abruptly. Birds in the neem trees fluttered back to their nests, thinking night had fallen. The stars emerged in the middle of the afternoon.

Dr. Kensington was frantically sketching the corona through his eyepiece. But Amina was measuring something else: the oscillation of the diffraction rings reflected on the calm indigo water surface.

Using the shadow’s angle of incidence and the known height of the ancient minaret tower, she calculated the angular diameter using basic trigonometric tangents:
*Tan(θ) = Opposite / Adjacent.*

Amina gasped. Her calculations showed an angular diameter of 1.018 degrees—nearly 1.4% larger than Dr. Kensington’s published forecast. Such a discrepancy meant the moon’s orbital perigee was closer to West Africa than the European tables had accounted for.`
      },
      {
        title: 'Chapter 3: The Emir’s Judgment',
        content: `When the sun reappeared like a diamond ring in the sky, Dr. Kensington began dismantling his equipment.

"Excuse me, sir," a clear, youthful voice spoke up in fluent English and Hausa.

The British astronomer turned around, irritated. "Yes, young lady? Children should be at home."

Amina stood tall, holding her inscribed wooden slate. "Dr. Kensington, your calculation for totality duration was off by sixteen seconds. The moon passed two hundred miles closer in its orbital path, which enlarged the umbra shadow cone."

Laughter erupted among some of the junior colonial officers. "A schoolgirl correcting the Cambridge Astronomical Society!" one chuckled.

The Emir of Kano raised his hand, and immediate silence fell over the palace courtyard. "Let the daughter of Mallam Sanusi speak. Show the council your workings."

Amina walked forward with poise. With white chalk on the palace flagstones, she drew the celestial triangle. She showed how she had calibrated the water mirror against the minaret’s height, eliminating the optical distortion caused by hot atmospheric heat shimmers.

Dr. Kensington leaned over her chalk lines, his skeptical smirk slowly dissolving into astonishment. He checked his pocket notebook, looked at his own stopwatch, and checked his telescope chronograph:
*Elapsed totality: 3 minutes, 58 seconds.*

It was exactly sixteen seconds longer than his prediction.

The astronomer stood frozen. He looked at the modest teenage girl holding a bamboo stick, then down at his ten-thousand-pound brass apparatus.

"By Jove," Dr. Kensington whispered, taking off his sun helmet. "She is correct. The atmospheric refraction correction in the tropical band... we neglected the surface heat thermals."

The Emir smiled warmly from beneath his golden umbrella. "In Kano, knowledge has flourished since the fourteenth century. It seems our daughters continue to carry that flame."

Before the colonial expedition departed the following week, Dr. Kensington presented Amina with his personal brass micrometer and a leather-bound copy of Isaac Newton’s *Principia Mathematica*. Amina would go on to become one of the first female professors of astrophysics in West Africa, inspiring thousands of girls to reach for the stars.`
      }
    ],
    vocabulary: [
      {
        word: 'Umbra',
        partOfSpeech: 'noun',
        definition: 'The fully shaded inner region of a shadow cast by an opaque object, especially during an eclipse.',
        exampleSentence: 'The dark umbra of the moon covered the entire city of Kano.'
      },
      {
        word: 'Perigee',
        partOfSpeech: 'noun',
        definition: 'The point in the orbit of the moon or a satellite at which it is nearest to the earth.',
        exampleSentence: 'The moon was near its orbital perigee, causing a larger shadow.'
      },
      {
        word: 'Refraction',
        partOfSpeech: 'noun',
        definition: 'The bending of a wave or light beam as it passes between media of different densities.',
        exampleSentence: 'The intense desert heat caused atmospheric refraction of the celestial light.'
      },
      {
        word: 'Equatorially',
        partOfSpeech: 'adverb',
        definition: 'Mounted on an axis parallel to the earth’s axis of rotation, allowing celestial tracking.',
        exampleSentence: 'The telescope was equatorially mounted to track the sun across the sky.'
      }
    ],
    comprehensionQuiz: [
      {
        id: 'gw-q1',
        question: 'How did Amina safely observe the solar eclipse without burning her eyes?',
        options: {
          A: 'She watched through tinted sunglasses',
          B: 'She used a bowl of dark indigo-dyed water as an indirect pinhole reflective mirror',
          C: 'She closed one eye and peered through a needle hole',
          D: 'She stood behind the Emir’s golden umbrella'
        },
        correctOption: 'B',
        explanation: 'Amina placed dark indigo-dyed water in a calabash to reflect the solar corona safely without direct retinal exposure.'
      },
      {
        id: 'gw-q2',
        question: 'What error did Amina discover in the European astronomer’s calculations?',
        options: {
          A: 'The sun was cooling down',
          B: 'Totality lasted sixteen seconds longer than predicted because tropical heat thermals had been overlooked',
          C: 'The eclipse was taking place in America instead of Africa',
          D: 'The moon had stopped rotating'
        },
        correctOption: 'B',
        explanation: 'Amina proved that the eclipse totality lasted 16 seconds longer due to lunar perigee and tropical atmospheric heat shimmers.'
      },
      {
        id: 'gw-q3',
        question: 'What mathematical principle did Amina apply to calculate the angular diameter using the minaret shadow?',
        options: {
          A: 'Trigonometric tangents (Tan θ = Opposite / Adjacent)',
          B: 'Quadratic matrix determinants',
          C: 'Boyle’s Law of Ideal Gases',
          D: 'The Binomial Theorem'
        },
        correctOption: 'A',
        explanation: 'Amina measured the minaret shadow angle using basic trigonometry (tangent of the angle of incidence).'
      },
      {
        id: 'gw-q4',
        question: 'What does Amina’s story demonstrate about intelligence and gender in academic fields?',
        options: {
          A: 'Science is only for people who possess expensive brass telescopes',
          B: 'Diligence, mathematical rigor, and passion know no gender or geographic boundary',
          C: 'Students should avoid learning European languages',
          D: 'Astronomy should only be practiced at night'
        },
        correctOption: 'B',
        explanation: 'Amina proved that intellect, scientific rigor, and dedication belong equally to all people, regardless of gender or background.'
      }
    ]
  },
  {
    id: 'great-chemistry-heist',
    title: 'The Great Inter-House Chemistry Heist',
    author: 'Kayode Fashola',
    authorBio: 'Playwright, educator, and author of humorous boarding school chronicles.',
    genre: 'Campus Comedy',
    readingTimeMinutes: 6,
    wordCount: 1250,
    difficulty: 'Accessible',
    tagline: 'A bubbling green mascot, banana-scented smoke, and the most chaotic quiz night in school history.',
    synopsis: 'At the annual Inter-House Science & Athletics gala of Federal Government College Odogbolu, Blue House and Red House are deadlocked. When a harmless chemistry prank with dry ice and food coloring goes wonderfully haywire right as the Senior Prefect takes the microphone, the two rival captains must work together to neutralize an effervescent foam volcano before the Principal cancels inter-house sports forever.',
    coverGradient: 'from-teal-950 via-emerald-950 to-blue-950',
    icon: '🧪',
    badge: 'School Satire & Fun',
    targetAudience: 'Secondary School & CBT Science Students',
    moralLesson: 'Rivalry is healthy when tempered with sportsmanship; when chaos erupts, cooperation accomplishes more than blame.',
    chapters: [
      {
        title: 'Chapter 1: The Rivalry of the Houses',
        content: `In the sixty-year history of Federal Government College Odogbolu, no rivalry burned hotter than the competition between Blue House (named after the legendary King Jaja of Opobo) and Red House (named after Queen Amina of Zaria).

By Saturday afternoon of the Inter-House Gala, both houses were tied at 420 points each. The tie-breaker was scheduled for the grand evening science demonstration in the Assembly Hall, where the house captains would demonstrate a practical application of chemistry before the Board of Governors.

Chidi, the captain of Blue House, was a brilliant but overly theatrical young man. His plan was simple: create a harmless, luminescent green smoke display using dry ice, baking soda, and food coloring to unveil their house banner.

"Chidi," warned his lab partner, Sandra, measuring drops of washing-up liquid into a glass carboy. "The recipe calls for three grams of potassium iodide catalyst. Don't add more just to show off."

Chidi waved his hand dismissively. "Sandra, my dear, this is not ordinary lab practical. This is inter-house warfare! Three grams makes a baby puff. Ten grams will give us an Olympic-grade volcanic cloud!"`
      },
      {
        title: 'Chapter 2: The Eruption in the Assembly Hall',
        content: `At 7:00 PM, the assembly hall was packed with seven hundred students, parents, and visiting dignitaries. The air was thick with the scent of fried meat pies and the rhythmic thumping of student brass drums.

Principal Adeyemi, a stern disciplinarian with eyebrows like two angry caterpillars, tapped the microphone.

"Quiet, students of Odogbolu! We shall now witness the chemistry demonstration from Blue House. Remember: safety, discipline, and decorum."

Chidi walked to the center stage in an immaculate white lab coat, bowing like a magician. On the table sat a giant glass flask wrapped in blue silk.

Behind the curtain, what Chidi did not know was that Emeka, the mischievous captain of Red House, had decided to play his own prank. Five minutes earlier, Emeka had secretly poured two bottles of artificial banana essence and extra concentrated liquid soap into the mixture to make Blue House’s smoke smell like rotten plantains.

Chidi raised his flask of hydrogen peroxide. "Ladies and gentlemen! Witness the triumph of King Jaja House!"

He dumped the catalyst into the carboy.

For one second, nothing happened.

Then, a deep, ominous rumbling sound vibrated through the wooden stage floor:
*GLUG... GLUG... FZZZZZZZZT!*

A colossal geyser of neon-green, banana-scented foam shot twelve feet into the air, hitting the assembly hall ceiling fan!

The rotating blades caught the foam and whipped it in every direction like a mad confectioner’s blender. Fluffy green foam rained down on the choir, the brass band, and directly onto Principal Adeyemi’s velvet suit!`
      },
      {
        title: 'Chapter 3: The Neutralizing Alliance',
        content: `The hall erupted in sheer pandemonium!

Students cheered, teachers shrieked, and the visiting Board Chairman was laughing so hard his spectacles slipped into his cup of zobo drink.

"Stop this reaction immediately!" Principal Adeyemi bellowed, wiping banana-scented green lather from his mustache. "Or the entire school is on grass-cutting punishment for two terms!"

Chidi stood paralyzed on stage, watching the runaway foam column spread across the parquet floor. "It’s an exothermic peroxide decomposition! The soap is trapping oxygen bubbles faster than I can dilute it!"

Suddenly, Emeka from Red House leaped onto the stage, carrying two large plastic jugs of dilute acetic acid (ordinary vinegar) and table salt.

"Chidi, stop staring like a statue!" Emeka yelled over the hissing foam. "The vinegar will alter the pH and break the surfactant surface tension! Pour it around the flask base while I disperse the salt!"

In that moment of impending catastrophe, all inter-house animosity vanished. The two rivals worked like seasoned firefighters. Chidi dumped the vinegar into the bubbling vortex, while Emeka showered the foam with salt crystals.

Within forty-five seconds, the violent foam geyser collapsed into a placid, harmless puddle of lime-green liquid. The banana scent hung sweetly in the cool evening air.

The assembly hall fell dead silent.

Principal Adeyemi wiped his cheeks with a handkerchief, inspected the puddle, and then looked up at the two trembling captains standing side by side in soggy socks.

The Principal took the microphone. The students held their breath.

"In thirty years of running this institution," Principal Adeyemi said slowly, "I have never seen an inter-house demonstration with such... explosive enthusiasm. However, because you two young men demonstrated immediate scientific problem-solving, rapid neutralization, and exceptional teamwork under extreme pressure..."

He paused, a tiny twinkle in his eye.

"...I hereby award forty points each to Blue House and Red House! The competition is declared an honorable joint victory!"

A thunderous cheer shook the assembly hall rafters. As Chidi and Emeka shook hands under the green ceiling fan, Chidi chuckled, "Next year, Emeka, no banana essence."

Emeka grinned. "Agreed, Chidi. Next year, we try physics!"`
      }
    ],
    vocabulary: [
      {
        word: 'Exothermic',
        partOfSpeech: 'adjective',
        definition: 'Accompanied by or requiring the release of heat.',
        exampleSentence: 'The decomposition of hydrogen peroxide was a vigorously exothermic reaction.'
      },
      {
        word: 'Surfactant',
        partOfSpeech: 'noun',
        definition: 'A substance that tends to reduce the surface tension of a liquid in which it is dissolved (e.g., detergent).',
        exampleSentence: 'The soap acted as a surfactant, trapping gas inside millions of bubbles.'
      },
      {
        word: 'Catalyst',
        partOfSpeech: 'noun',
        definition: 'A substance that increases the rate of a chemical reaction without itself undergoing any permanent chemical change.',
        exampleSentence: 'Potassium iodide was added as a catalyst to accelerate the reaction.'
      },
      {
        word: 'Pandemonium',
        partOfSpeech: 'noun',
        definition: 'Wild and noisy disorder or confusion; an uproar.',
        exampleSentence: 'Pandemonium erupted in the hall when the ceiling fan dispersed the foam.'
      }
    ],
    comprehensionQuiz: [
      {
        id: 'hc-q1',
        question: 'What caused the harmless science demonstration to turn into a massive foam volcano?',
        options: {
          A: 'Chidi used ten grams of catalyst instead of three, while Emeka secretly added soap and banana extract',
          B: 'Someone knocked over an open bottle of concentrated sulfuric acid',
          C: 'The chemical bottles had expired five years ago',
          D: 'A spark from the brass band ignited the gas'
        },
        correctOption: 'A',
        explanation: 'Chidi tripled the catalyst dosage, while Emeka secretly added dish soap and banana essence, resulting in a giant "elephant toothpaste" foam explosion.'
      },
      {
        id: 'hc-q2',
        question: 'How did the two rival captains successfully neutralize the runaway foam?',
        options: {
          A: 'They turned on the school fire hose and soaked the crowd',
          B: 'They used dilute acetic acid (vinegar) and salt to break the surface tension of the soap',
          C: 'They threw a heavy wool blanket over the flask',
          D: 'They fled the stage and let it burn out'
        },
        correctOption: 'B',
        explanation: 'Emeka brought vinegar to alter the pH and salt to collapse the soap surfactant bubbles, neutralizing the reaction quickly.'
      },
      {
        id: 'hc-q3',
        question: 'What scientific term describes a chemical reaction that releases heat to its surroundings?',
        options: {
          A: 'Endothermic',
          B: 'Exothermic',
          C: 'Electrolytic',
          D: 'Isothermal'
        },
        correctOption: 'B',
        explanation: 'An exothermic reaction releases thermal energy (heat) to its surroundings as chemical bonds form.'
      },
      {
        id: 'hc-q4',
        question: 'Why did Principal Adeyemi decide not to punish the students?',
        options: {
          A: 'He wanted to eat the banana-flavored foam',
          B: 'The Board of Governors had already gone home',
          C: 'The captains demonstrated quick scientific teamwork, safety neutralization, and cooperation under pressure',
          D: 'He was afraid of King Jaja House'
        },
        correctOption: 'C',
        explanation: 'The Principal was impressed by their quick scientific problem-solving, composure, and mutual cooperation to neutralize the hazard safely.'
      }
    ]
  },
  {
    id: 'calabash-of-stars',
    title: 'The Whispering Baobab of Kano',
    author: 'Ustaz Balarabe Dan-Ige',
    authorBio: 'Traditional Hausa folklorist & historian of ancient northern trade routes.',
    genre: 'Folklore',
    readingTimeMinutes: 8,
    wordCount: 1450,
    difficulty: 'Accessible',
    tagline: 'Three enchanted silver threads, an unjust tax, and the weaver who chose honesty over gold.',
    synopsis: 'Near the Kurmi market in sixteenth-century Kano, young weaver Balarabe rescues a sacred owl from a dust storm and is blessed by the spirit of the ancient Baobab tree with three enchanted threads that can weave cloth showing a person’s true intentions. When a dishonest royal tax collector tries to seize the village harvests, Balarabe must decide whether to save his own skin or weave the truth.',
    coverGradient: 'from-amber-950 via-red-950 to-slate-950',
    icon: '🌳',
    badge: 'Moral Legend',
    targetAudience: 'Secondary & Literature Scholars',
    moralLesson: 'Truth woven with integrity will outlast any garment of deceit; courage in defense of the vulnerable is the highest nobility.',
    chapters: [
      {
        title: 'Chapter 1: The Weaver by the Kurmi Gate',
        content: `Five hundred years ago, when the city of Kano was encircled by colossal brown mud ramparts with fourteen iron gates, the Kurmi market hummed with merchants from Timbuktu, Cairo, and Tripoli. Camels laden with salt, indigo dyed robes, and leather saddles filled the dusty lanes.

In a small open stall near the Dala hill, eighteen-year-old Balarabe worked his wooden foot loom. His shuttle flew back and forth like a swift bird—*clack-clack, shhh-clack*—weaving fine white cotton into garments of exquisite durability.

Balarabe was poor in purse, but wealthy in kindness. While other traders watered their milk or weighted their grain scales with lead pebbles, Balarabe never shortchanged a customer by even a single thread.

One scorching afternoon, when the dry Harmattan wind blew blinding red dust across the city, Balarabe heard a distressed fluttering behind the ancient Baobab tree that stood at the edge of his workshop. Tucked into the hollow roots was a barn owl with silver feathers, its wing pinned beneath a fallen thorny acacia branch.

"Patience, little traveler," Balarabe murmured softly. He gently lifted the branch, cleaned the dust from the bird’s beak with water from his goatskin pouch, and dressed its wounded wing with wild neem balm.`
      },
      {
        title: 'Chapter 2: The Three Silver Threads',
        content: `That night, as the full moon rose above the Dala hill, the ancient Baobab tree began to shimmer.

From its massive, twisted trunk stepped a figure woven entirely of silver moonlight and green leaves—the Spirit of the Baobab, guardian of honest artisans.

"Balarabe," a voice whispered, sounding like night wind rustling through sorghum leaves. "You showed compassion to the sky when the earth was cruel. In return, I grant you three enchanted threads of pure celestial cotton."

The spirit placed into his calloused hands three glowing silver bobbins:
"The first thread weaves cloth that reveals a man’s true character. The second thread weaves cloth that repels false accusations. But the third thread can only be used once, for it weaves a mirror of inescapable truth."

Before Balarabe could bow his head in gratitude, the spirit dissolved back into the bark, leaving behind the three bobbins that glowed like stars on his workbench.`
      },
      {
        title: 'Chapter 3: The Trial of the Golden Kaftan',
        content: `Three days later, dark clouds of trouble descended on the weavers’ quarter.

Alhaji Galadima, the greedy royal tax collector, arrived with ten armed horsemen. Galadima had devised a fraudulent new decree: every weaver in Kurmi market was required to pay fifty cowrie sacks and surrender half their woven cloth to his private warehouse, claiming the King had ordered an emergency war levy.

"You lie, Galadima!" an elderly dyer cried out. "The King has declared peace with the southern provinces!"

"Insolent dog!" Galadima shouted, drawing his whip. "Pay by sunrise tomorrow, or your workshops will be burned and your children sold to caravans!"

The weavers wept in despair. They had barely enough grain to feed their infants.

That night, Balarabe did not sleep. He sat at his loom under the lantern, his eyes burning with resolve. Into his finest white cotton warp, he threaded the three silver bobbins from the Baobab spirit. He wove without stopping until the dawn call to prayer echoed from the central minaret.

When Galadima arrived at sunrise with torches, Balarabe walked out to meet him in the center of the market square, carrying an immaculate, shimmering silver-white kaftan.

"Alhaji Galadima," Balarabe declared before the assembled crowd. "Before you seize our workshops, allow us to present you with this robe of honor. It is woven from celestial cotton that only a truly honest and loyal servant of the Crown can wear. If your tax decree is just, this robe will shine like gold upon your shoulders."

Galadima, vain and intoxicated by pride, laughed arrogantly. "A gift worthy of my greatness! Hand it here!"

He pulled the shimmering garment over his head.

The instant the silver cloth touched Galadima’s shoulders, the enchanted third thread flared into blinding white radiance!

The cloth did not turn to gold. Instead, it became completely transparent, projecting upon the high mud walls of the market an unmistakable magical projection: it showed Galadima sitting in his private cellar the night before, forging the King’s royal seal with melted wax, laughing as he counted stolen gold that had never been authorized by the palace!

"Treason! Fraud!" the crowd roared.

At that exact moment, the royal trumpets blared. The King himself, arriving on his black stallion to inspect the market, had witnessed the entire projection with his own eyes.

"Seize the traitor!" the King commanded his guards.

Galadima was stripped of his stolen robes, thrown into iron chains, and banished to the salt mines of the far north. His illicit warehouses were opened, and every basket of grain and sack of cowries was returned to the grateful weavers of Kurmi.

The King summoned Balarabe to the palace veranda. "Young weaver, your cloth speaks with the tongue of angels. Name your reward: gold, camels, or a chieftaincy title in my court?"

Balarabe bowed with humble grace. "Your Majesty, I ask for only one thing: that an imperial decree be carved into the iron gate of Kurmi market, protecting every honest artisan and schoolchild from extortion forever."

The decree was carved that very day. And for generations to come, whenever a student in Kano picks up a pen or a weaver lifts a shuttle, they remember that truth is a fabric that never tears.`
      }
    ],
    vocabulary: [
      {
        word: 'Ramparts',
        partOfSpeech: 'noun',
        definition: 'A defensive wall or embankment of stone or earth, especially around an ancient city.',
        exampleSentence: 'The mud ramparts of ancient Kano stood fifty feet high against invaders.'
      },
      {
        word: 'Insolent',
        partOfSpeech: 'adjective',
        definition: 'Showing a rude and arrogant lack of respect.',
        exampleSentence: 'The tax collector accused the elderly artisan of being insolent.'
      },
      {
        word: 'Extortion',
        partOfSpeech: 'noun',
        definition: 'The practice of obtaining something, especially money, through force or threats.',
        exampleSentence: 'The King issued an imperial decree to protect the artisans against extortion.'
      },
      {
        word: 'Celestial',
        partOfSpeech: 'adjective',
        definition: 'Positioned in or relating to the sky, or belonging to heaven; supremely good.',
        exampleSentence: 'The silver threads held a celestial glow that illuminated the dark workshop.'
      }
    ],
    comprehensionQuiz: [
      {
        id: 'wb-q1',
        question: 'Why did the Spirit of the Baobab grant Balarabe the three enchanted silver threads?',
        options: {
          A: 'He paid fifty cowrie shells at the tree altar',
          B: 'He showed selfless compassion by rescuing and nursing an injured barn owl during a Harmattan storm',
          C: 'He was the fastest runner in Kano city',
          D: 'His family owned the land around Dala hill'
        },
        correctOption: 'B',
        explanation: 'Balarabe freed a trapped barn owl from thorny branches, cleaned its beak, and dressed its wounded wing with neem oil.'
      },
      {
        id: 'wb-q2',
        question: 'What happened when the corrupt tax collector put on the enchanted silver kaftan?',
        options: {
          A: 'It burst into flames and burned him',
          B: 'It became transparent and projected his secret forgery of the King’s royal seal for all to see',
          C: 'It turned him into a wild baboon',
          D: 'It turned to pure gold and made him invisible'
        },
        correctOption: 'B',
        explanation: 'The enchanted third thread revealed truth, becoming transparent and projecting images of Galadima forging the royal seal in his cellar.'
      },
      {
        id: 'wb-q3',
        question: 'Instead of accepting personal riches or gold from the King, what did Balarabe request?',
        options: {
          A: 'A herd of fifty camels',
          B: 'An imperial decree protecting honest artisans and students from extortion forever',
          C: 'To be appointed the new tax collector',
          D: 'A palace made of marble'
        },
        correctOption: 'B',
        explanation: 'Balarabe selflessly asked for an imperial decree engraved on the city gate protecting artisans and youth from extortion.'
      },
      {
        id: 'wb-q4',
        question: 'What moral virtue does this classic northern folktale celebrate?',
        options: {
          A: 'Honesty and compassion are more powerful and enduring than ill-gotten wealth and deceit',
          B: 'One should always fear city tax collectors',
          C: 'Cotton is more expensive than silk',
          D: 'Weaving should only be done at night'
        },
        correctOption: 'A',
        explanation: 'The story emphasizes that integrity, compassion, and courage outshine deceit and bring lasting honor.'
      }
    ]
  }
];
