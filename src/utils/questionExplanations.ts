import { Question } from '../types';

export interface StructuredExplanation {
  directAnswer: string;
  stepByStep: string;
  distractorAnalysis: string;
  examinerTip: string;
  conciseSpokenSummary: string;
}

/**
 * Generates subject-specific default explanation components if a question
 * does not already have a richly articulated breakdown.
 */
function getSubjectDomainWorkings(question: Question): { stepByStep: string; distractors: string; tip: string } {
  const sub = (question.subjectId || '').toLowerCase();
  const topic = question.topic || 'Core Curriculum Concept';
  const optKey = question.correctOption || 'A';
  const correctText = question.options[optKey] || '';

  if (sub === 'mathematics' || sub === 'primary-math' || sub === 'uni-math101') {
    return {
      stepByStep: `1. Identify the given parameters and required unknown from the problem statement on ${topic}.
2. Apply the canonical formula or theorem governing this topic.
3. Carry out algebraic substitution and simplify systematically step-by-step.
4. Verify by reverse-substitution: the calculated value directly satisfies the equation, giving Option (${optKey}): "${correctText}".`,
      distractors: `Alternative options are common calculation pitfalls resulting from sign errors (confusing + and -), inverted fraction steps, or forgetting to simplify exponents.`,
      tip: `CBT Shortcut: In multiple-choice algebra or quadratic equations, you can test-substitute the options directly into the equation to verify the root in under 20 seconds!`
    };
  }

  if (sub === 'physics' || sub === 'uni-phy101') {
    return {
      stepByStep: `1. State the fundamental law of Physics applicable to ${topic} (e.g., Equations of Motion, Newton's Laws, Ohm's Law, or Conservation of Energy).
2. List known physical variables with standard S.I. units.
3. Formulate the relationship and solve for the unknown parameter.
4. The resulting magnitude matches Option (${optKey}): "${correctText}".`,
      distractors: `Other options stem from unit conversion oversights (e.g., grams to kilograms, cm to meters) or applying the wrong power law.`,
      tip: `Always verify dimensions and S.I. units before computing. In JAMB Physics, distractors often have the right number but wrong unit or missing square root.`
    };
  }

  if (sub === 'chemistry' || sub === 'uni-chm101') {
    return {
      stepByStep: `1. Write down the balanced chemical equation or identify the relevant chemical equilibrium/periodic principle for ${topic}.
2. Note the stoichiometric ratios, molar masses, or oxidation numbers involved.
3. Deduce the reaction pathway or molecular property: Option (${optKey}) correctly describes "${correctText}".`,
      distractors: `Other options confuse oxidation with reduction, state improper catalyst conditions, or use incorrect valencies.`,
      tip: `Remember standard conditions: 1 mole of any gas at STP occupies 22.4 dm³. Memorize oxidation states of common radicals to save time.`
    };
  }

  if (sub === 'biology' || sub === 'primary-science') {
    return {
      stepByStep: `1. Recall the physiological mechanism or anatomical classification of ${topic}.
2. Option (${optKey}) accurately explains the biological function: "${correctText}".
3. This process ensures metabolic homeostasis, nutrient transport, or cellular respiration in living organisms.`,
      distractors: `The alternative choices describe unrelated biological processes, incorrect enzymes, or mismatched trophic levels.`,
      tip: `In WAEC & JAMB Biology, look out for biological keywords like "hydrolysis", "osmoregulation", "photolysis", and "peristalsis"—examiners build questions around exact syllabus terms.`
    };
  }

  if (sub === 'english' || sub === 'primary-english' || sub === 'uni-gst101') {
    return {
      stepByStep: `1. Analyze the grammatical structure, collocation, or phonetic context in this ${topic} question.
2. Option (${optKey}) "${correctText}" is the only grammatically acceptable choice conforming to standard British English usage tested by WAEC and JAMB.
3. It satisfies concord rules, correct prepositional pairing, or appropriate stress/vowel sound patterns.`,
      distractors: `Distractor options represent typical Nigerian English colloquialisms (mother-tongue interference) or incorrect prepositional idioms.`,
      tip: `Concord Rule: When subjects are joined by "neither... nor" or "either... or", the verb agrees with the subject nearest to it.`
    };
  }

  if (sub === 'economics') {
    return {
      stepByStep: `1. Identify the fundamental economic principle governing ${topic} (e.g., Price Elasticity, Law of Demand and Supply, Opportunity Cost, or Market Equilibrium).
2. Analyze the market behavior or fiscal/monetary impact described in the stem.
3. Option (${optKey}) "${correctText}" correctly articulates this principle according to economic theory.`,
      distractors: `Other choices confuse shifts in demand curves with movements along the curve, or invert price and quantity axes.`,
      tip: `Remember: A change in price causes movement along the curve (expansion/contraction). Non-price factors cause a complete shift of the curve.`
    };
  }

  if (sub === 'government' || sub === 'primary-social' || sub === 'uni-gst103') {
    return {
      stepByStep: `1. Contextualize the constitutional, political, or historical structure in ${topic}.
2. Under the relevant Nigerian Constitution (e.g. 1963 Republican, 1979, or 1999 Constitution) or political science doctrine, Option (${optKey}) "${correctText}" is the established legal and constitutional mandate.
3. This ensures the balance of power, separation of powers, or rule of law.`,
      distractors: `The alternative options represent functions assigned to different tiers of government or commissions (e.g., confounding INEC with the Civil Service Commission).`,
      tip: `Trace Nigerian constitutional history chronologically: Clifford (1922) -> Richards (1946) -> Macpherson (1951) -> Lyttelton (1954) -> Independence (1960) -> Republican (1963).`
    };
  }

  if (sub === 'literature') {
    return {
      stepByStep: `1. Examine the literary text, dramatic context, or stylistic device in ${topic}.
2. Option (${optKey}) "${correctText}" accurately reflects the author's thematic intention, character motivation, or poetic technique.`,
      distractors: `Alternative options attribute motives or actions to the wrong characters or confuse literary devices (such as metaphor vs. personification).`,
      tip: `Pay close attention to dramatic irony and hubris (tragic flaw) in prescribed African and non-African drama texts.`
    };
  }

  // General fallback for all other subjects
  return {
    stepByStep: `1. Examine the core concept tested under ${topic}.
2. In accordance with the accredited curriculum guidelines, Option (${optKey}) "${correctText}" is the correct, verifiable answer.
3. This principle is verified by standard syllabus reference textbooks and past examiner marking schemes.`,
    distractors: `Other options represent incomplete explanations or common student misconceptions.`,
    tip: `Carefully read the question stem for qualifying words like "EXCEPT", "NOT", "ALWAYS", or "NEAREST IN MEANING".`
  };
}

/**
 * Returns a complete, high-yield structured explanation for ANY question,
 * regardless of whether the question is Math, Science, Arts, Commercial, Primary, or University GST.
 */
export function getComprehensiveExplanation(question: Question): StructuredExplanation {
  if (!question) {
    return {
      directAnswer: 'Answer verified.',
      stepByStep: 'Follow syllabus guidelines to evaluate the core concept.',
      distractorAnalysis: 'Alternative options do not meet the curriculum criteria.',
      examinerTip: 'Always review past questions on this topic.',
      conciseSpokenSummary: 'Option A is the correct answer based on syllabus guidelines.'
    };
  }

  const optKey = (question.correctOption || 'A').toUpperCase();
  const optionText = question.options ? (question.options[optKey as 'A' | 'B' | 'C' | 'D'] || '') : '';
  const domainDefaults = getSubjectDomainWorkings(question);

  // If question already has an explanation, check if it contains detailed workings
  const rawExplanation = (question.explanation || '').trim();

  let stepByStep = rawExplanation;
  if (!stepByStep || stepByStep.length < 30) {
    stepByStep = domainDefaults.stepByStep;
  } else if (!stepByStep.includes('1.') && !stepByStep.includes('\n')) {
    // Enrich single-sentence explanations with domain structure
    stepByStep = `${rawExplanation}\n\nKey Breakdown:\n${domainDefaults.stepByStep}`;
  }

  const directAnswer = `Option (${optKey}) is the correct answer: "${optionText}"`;
  const distractorAnalysis = domainDefaults.distractors;
  const examinerTip = domainDefaults.tip;

  // Build a concise 1-2 sentence spoken summary for AI voice (under 15-20 words)
  // so the AI does NOT take too much time to talk!
  let conciseSpoken = '';
  if (rawExplanation && rawExplanation.length < 120) {
    conciseSpoken = `The answer is Option ${optKey}: ${optionText}. ${rawExplanation}`;
  } else {
    conciseSpoken = `Option ${optKey} is correct: ${optionText}. ${question.topic ? 'In ' + question.topic + ', this' : 'This'} aligns directly with the official examination syllabus.`;
  }

  return {
    directAnswer,
    stepByStep,
    distractorAnalysis,
    examinerTip,
    conciseSpokenSummary: conciseSpoken
  };
}
