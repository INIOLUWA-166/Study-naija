import { StoryChapter } from './storyBooks';

export interface ChapterGenerationConfig {
  storyId: string;
  title: string;
  protagonist: string;
  companion?: string;
  mentor?: string;
  antagonist?: string;
  setting: string;
  landmark: string;
  genre: 'Mystery' | 'Sci-Fi' | 'Folklore' | 'Thriller' | 'Historical STEM' | 'Campus Comedy';
  centralArtifactOrHook: string;
  moralLesson: string;
  chapterCount: 10 | 20 | 24 | 27 | 50;
}

// Rich narrative episodic arc templates for different chapter counts
export function buildEngagingChapters(config: ChapterGenerationConfig): StoryChapter[] {
  const {
    title,
    protagonist,
    companion = 'Emeka',
    mentor = 'Professor Okonjo',
    antagonist = 'Chief Balogun',
    setting,
    landmark,
    genre,
    centralArtifactOrHook,
    moralLesson,
    chapterCount
  } = config;

  const chapters: StoryChapter[] = [];

  // Genre specific motifs and dialogue flavors
  const genreFlavor = {
    'Sci-Fi': {
      techTerm: 'quantum electromagnetic field',
      tool: 'piezoelectric frequency tuner',
      danger: 'power surge and atmospheric telemetry breach',
      discovery: 'harnessing indigenous materials with modern semiconductor physics'
    },
    'Mystery': {
      techTerm: 'cryptographic cipher matrix',
      tool: 'brass archival key and magnifying lens',
      danger: 'covert syndicate seeking to destroy historical records',
      discovery: 'uncovering the coded truth hidden in the century-old university archives'
    },
    'Folklore': {
      techTerm: 'ancient ancestral proverb',
      tool: 'carved mahogany staff and sacred calabash',
      danger: 'wrath of the forest guardian and the deception of the greedy trickster',
      discovery: 'discovering that true honor springs from selfless communal sacrifice'
    },
    'Thriller': {
      techTerm: 'emergency distress broadcast',
      tool: 'handheld shortwave transceiver',
      danger: 'approaching storm surge and sabotaged railway junctions',
      discovery: 'racing against the midnight clock to evacuate innocent families'
    },
    'Historical STEM': {
      techTerm: 'lost-wax metallurgy calculation',
      tool: 'clay bellows and precision bronze calipers',
      danger: 'loss of sacred mathematical proportions to royal rivals',
      discovery: 'proving ancient African kingdoms mastered advanced geometric metallurgy'
    },
    'Campus Comedy': {
      techTerm: 'exothermic color-changing reaction',
      tool: 'borosilicate conical flask and pH litmus paper',
      danger: 'unpredictable foam eruption threatening the principal’s sports day podium',
      discovery: 'discovering that rigorous lab safety and humor go hand in hand'
    }
  }[genre] || {
    techTerm: 'innovative scientific principle',
    tool: 'analytical calculation ledger',
    danger: 'mounting academic and environmental pressure',
    discovery: 'unraveling the foundational truth through perseverance'
  };

  for (let i = 1; i <= chapterCount; i++) {
    const progressPct = Math.round((i / chapterCount) * 100);
    let chapterTitle = '';
    let paragraphs: string[] = [];

    // Milestone phase based on chapter progress
    if (i === 1) {
      chapterTitle = `Chapter 1: The Gathering at ${setting}`;
      paragraphs = [
        `The morning mist hung heavy over ${landmark}, shimmering under the first rays of the tropical sun. In the bustling heart of ${setting}, seventeen-year-old ${protagonist} stood with a worn satchel slung across their shoulder, staring intently at the horizon. Around them, the rhythm of morning life was beginning—the aroma of freshly fried akara drifting from street corners, students in neatly pressed uniforms exchanging lively banter, and the steady hum of commerce filling the avenues.`,
        `Yet ${protagonist}’s mind was far removed from mundane routines. In their pocket rested a notebook filled with meticulous diagrams and notes concerning ${centralArtifactOrHook}. For months, skeptical classmates and teachers had dismissed the idea as mere youthful fancy. "Stick to the syllabus, my friend," they had warned. "West Africa does not need dreamers; it needs routine pass marks."`,
        `Beside ${protagonist}, their steadfast friend ${companion} adjusted a heavy crate of tools. "Are you truly certain about this test today? If ${antagonist} catches us experimenting near the restricted hall, our names will be struck from the national honor roll before lunchtime." ${protagonist} smiled quietly, tightened the straps of their equipment, and replied: "Every discovery begins in the shadow of doubt. Let us begin."`
      ];
    } else if (i === Math.floor(chapterCount * 0.15)) {
      chapterTitle = `Chapter ${i}: The Whispering Clues in ${landmark}`;
      paragraphs = [
        `By twilight, the initial tests had yielded results that defied standard classroom textbooks. Inside the quiet corridors near ${landmark}, a soft hum resonated from the apparatus. The ${genreFlavor.tool} vibrated with steady rhythmic pulses, aligning precisely with the mathematical predictions ${protagonist} had penciled under the kerosene lamp.`,
        `"${companion}, look at these dial readings," ${protagonist} whispered, beckoning their companion closer. "The signal isn't random noise. It matches the ${genreFlavor.techTerm} we discussed yesterday. Someone—or something—has calibrated this frequency before, perhaps decades ago."`,
        `${companion} swallowed hard, eyes wide in the amber lantern light. "Then the old rumors were true. The archives weren't destroyed in the 1970s; they were deliberately concealed. And if ${antagonist} realizes we have decoded the introductory sequence, they will do everything in their power to seize the research."`
      ];
    } else if (i === Math.floor(chapterCount * 0.3)) {
      chapterTitle = `Chapter ${i}: The Encounter with ${mentor}`;
      paragraphs = [
        `Seeking seasoned counsel before moving forward, ${protagonist} navigated the maze of ancient bookshelves in the university faculty library to find ${mentor}. The venerable scholar was hunched over a brass microscope, the faint aroma of roasted kola nuts and old leather parchment lingering in the air.`,
        `"Come in, young scholar," ${mentor} murmured without looking up from the lens. "I felt the atmospheric oscillation all the way from the campus gate. It takes a bold mind to tinker with ${centralArtifactOrHook}. Many before you have attempted to harness it, but they lacked the moral fortitude to respect its power."`,
        `For two hours, ${mentor} guided ${protagonist} through forgotten archives and theoretical principles. "Remember this always," the mentor said, pointing a weathered finger at a handwritten theorem: "Knowledge without ethics is a torch that burns its bearer. If you seek to master this, you must swear to use its fruits for the elevation of our community, never for selfish pride."`
      ];
    } else if (i === Math.floor(chapterCount * 0.45)) {
      chapterTitle = `Chapter ${i}: The Blackout and the Midnight Test`;
      paragraphs = [
        `Without warning, a torrential thunderstorm descended across ${setting}, accompanied by a sudden blackout that plunged the entire district into pitch blackness. While other dormitories groaned as the national grid collapsed, ${protagonist} and ${companion} seized the opportunity. The absolute absence of background electrical interference was the exact condition required for the high-voltage resonance test.`,
        `Rain pounded the corrugated iron roof like a barrage of small stones. In the center of the dark workroom, the prototype began to glow with a soft, bioluminescent cyan halo. The ${genreFlavor.techTerm} stabilized at 99.4% efficiency. "It's working!" ${companion} cheered, clutching a handheld multimeter. "The output is completely self-sustaining!"`,
        `Suddenly, the heavy wooden lock of the outer courtyard rattled. Footsteps splashed through the mud outside. A beam of powerful halogen light sliced through the window slats. ${antagonist}’s scouts had tracked the electromagnetic spike directly to their doorstep.`
      ];
    } else if (i === Math.floor(chapterCount * 0.6)) {
      chapterTitle = `Chapter ${i}: The Trap at the Market Square`;
      paragraphs = [
        `To replace a cracked quartz diode and secure critical copper coils, ${protagonist} slipped into the sprawling aisles of the local market at daybreak. The bustling marketplace was a labyrinth of colorful umbrella canopies, shouting traders hawking yams and textiles, and wheelbarrow pushers calling for right-of-way.`,
        `Yet something was amiss. The usual friendly greetings of the electrical component vendors were muted. In the shadow of a wholesale radio repair shed, two men in dark trench coats watched ${protagonist}’s every move. It was an ambush orchestrated by ${antagonist} to confiscate the prototype before the upcoming state exhibition.`,
        `Relying on quick wits and an intimate knowledge of the narrow alleyways behind the motor park, ${protagonist} executed a daring diversion using a pocket flash-powder capsule. The blinding white flash and crackle of harmless sparks created just enough pandemonium for them to slip past the cordon and vanish into the crowd with the vital components intact.`
      ];
    } else if (i === Math.floor(chapterCount * 0.75)) {
      chapterTitle = `Chapter ${i}: The High-Stakes Tribunal`;
      paragraphs = [
        `The controversy could no longer be kept secret. Before an amphitheater packed with university deans, government inspectors, and hundreds of curious students in ${setting}, ${protagonist} was summoned to defend their research against accusations of unauthorized experimentation and malpractice leveled by ${antagonist}.`,
        `"This student has broken safety regulations and fabricated claims!" ${antagonist} declared from the podium, waving a sheaf of forged penalty petitions. "No secondary candidate possesses the authority to manipulate ${centralArtifactOrHook} without formal ministerial sanction!"`,
        `Standing tall and unyielding beneath the bright stage spotlights, ${protagonist} did not offer emotional protests. Instead, they placed their working prototype on the mahogany demonstration table, connected the live diagnostic oscilloscope, and invited the skeptical chief examiner to verify the math live on the auditorium projection screen.`
      ];
    } else if (i === Math.floor(chapterCount * 0.9)) {
      chapterTitle = `Chapter ${i}: The Climax and the Proof`;
      paragraphs = [
        `The auditorium fell so completely silent that the faint whir of the ceiling fans sounded like thunder. With steady hands, ${protagonist} flipped the master ceramic breaker. A breathtaking cascade of harmonic energy rippled across the stage, illuminating the diagnostic sensors in vibrant emerald green.`,
        `The readings were undeniable. The prototype solved the very energy and communication bottleneck that had plagued the entire river basin for decades. The chief examiner slowly adjusted his gold-rimmed spectacles, stood up from his leather chair, and began to applaud. Within seconds, the entire hall erupted into a roaring standing ovation that shook the rafters.`,
        `${antagonist} slumped back into the shadows, their deceit thoroughly dismantled by the irrefutable clarity of scientific truth and verifiable results. ${mentor} walked up to the stage, placed an arm over ${protagonist}’s shoulder, and smiled with tears of pride.`
      ];
    } else if (i === chapterCount) {
      chapterTitle = `Chapter ${chapterCount}: The Dawn of a New Epoch`;
      paragraphs = [
        `Six months later, as the golden harmattan breeze swept gently across ${landmark}, the transformation was visible to all. The new community research center stood proudly at the crest of the hill, powered by the very principles ${protagonist} had pioneered in their grandmother's modest compound.`,
        `Young boys and girls in school uniforms crowded around the open workbenches, soldering wires, examining star charts, and eagerly discussing physics equations with radiant enthusiasm. They were no longer constrained by the fear that great inventions belonged only to foreign continents.`,
        `Looking out over the sunlit valley of ${setting}, ${protagonist} shared a quiet laugh with ${companion}. "You see?" ${protagonist} reflected softly. "${moralLesson}" And across the wide Nigerian skies, the promise of a brilliant new generation of scholars shone brighter than ever before.`
      ];
    } else {
      // Dynamic episodic intermediate chapters with suspense, character moments, and twists
      const episodicThemes = [
        {
          title: `The Mystery of the Old Ledger`,
          topic: `a set of encoded diary entries dating back to the foundation of the town`
        },
        {
          title: `The Midnight Discussion at the Mango Tree`,
          topic: `weighing the ethical implications of technological acceleration`
        },
        {
          title: `The Calibration of the Primary Circuit`,
          topic: `precision measurements that revealed a 3% discrepancy in the resistance values`
        },
        {
          title: `Footsteps in the Physics Annex`,
          topic: `an unexpected shadow spotted near the departmental storeroom`
        },
        {
          title: `The Secret of the Second Formula`,
          topic: `a quadratic relationship that unlocked the missing variable in the equation`
        },
        {
          title: `The Rival Delegation from the Capital`,
          topic: `a visiting academic panel questioning the feasibility of low-cost indigenous materials`
        },
        {
          title: `The Trial in the Rains`,
          topic: `testing moisture resistance while torrential raindrops beat against the outer casing`
        },
        {
          title: `The Council of Youth Champions`,
          topic: `fellow debate and science olympiad teammates pooling their pocket money for materials`
        },
        {
          title: `The Warning from the Village Elder`,
          topic: `an ancient oral proverb warning of the pride that precedes a bitter fall`
        },
        {
          title: `The Breakthrough in the Botanical Garden`,
          topic: `natural resin from the acacia tree that served as an ideal organic insulator`
        },
        {
          title: `The Telegram from the Ministry`,
          topic: `an official notification confirming that the project had reached national review`
        },
        {
          title: `The Midnight Oil and the Final Equations`,
          topic: `exhausting hours of algebra solved while the rest of the campus slumbered`
        },
        {
          title: `The Confrontation in the Corridor`,
          topic: `a tense verbal showdown where integrity triumphed over intimidation`
        },
        {
          title: `The Assembly Before the Great Fair`,
          topic: `rehearsing the speech before the entire cheering secondary school student body`
        },
        {
          title: `The Pulse in the Darkness`,
          topic: `a heartbeat-like frequency that confirmed the harmonic balance was permanent`
        }
      ];

      const theme = episodicThemes[(i * 3 + chapterCount) % episodicThemes.length];
      chapterTitle = `Chapter ${i}: ${theme.title}`;

      paragraphs = [
        `The investigation took a dramatic turn during the events of Chapter ${i}. In the heart of ${setting}, ${protagonist} and ${companion} were faced with a dilemma involving ${theme.topic}. The stakes were escalating rapidly, and every calculated decision carried immense weight for their academic standing and future.`,
        `"We cannot afford a single mistake now," ${companion} emphasized, carefully inspecting the solder joints and checking the telemetry readout. "The examiners are monitoring every school in the district, and ${antagonist} has placed observers near ${landmark}." ${protagonist} nodded calmly, cross-referencing the values against the principles taught by ${mentor}.`,
        `Through patience, sharp deduction, and mutual loyalty, the young scholars overcame the hurdle. Each obstacle navigated brought them one step closer to proving that determination and indigenous genius could transform national challenges into historic triumphs.`
      ];
    }

    chapters.push({
      title: chapterTitle,
      content: paragraphs.join('\n\n')
    });
  }

  return chapters;
}

/**
 * Expands existing core chapters up to target count (10, 20, 24, 27, or 50)
 * while preserving the original foundational chapters.
 */
export function expandCoreStory(
  existingChapters: StoryChapter[],
  targetCount: 10 | 20 | 24 | 27 | 50,
  config: Omit<ChapterGenerationConfig, 'chapterCount'>
): StoryChapter[] {
  if (existingChapters.length >= targetCount) {
    return existingChapters.slice(0, targetCount);
  }

  const generated = buildEngagingChapters({ ...config, chapterCount: targetCount });
  // Keep original opening chapters, then append the matching subsequent chapters
  const merged: StoryChapter[] = [...existingChapters];
  for (let i = existingChapters.length; i < targetCount; i++) {
    merged.push(generated[i]);
  }
  return merged;
}

