
import { ReadingProblem, ComplexityLevel, GradeLevel, Problem, ReadingLens, ComplexityVector } from './types';

export const COMPLEXITY_LADDER: ComplexityVector[] = [
  { lex: 1, syntax: 1, concept: 1, domain: 1, discourse: 1 },
  { lex: 2, syntax: 1, concept: 1, domain: 1, discourse: 1 },
  { lex: 2, syntax: 2, concept: 1, domain: 1, discourse: 1 },
  { lex: 3, syntax: 2, concept: 2, domain: 2, discourse: 1 },
  { lex: 3, syntax: 3, concept: 2, domain: 2, discourse: 2 },
  { lex: 4, syntax: 3, concept: 3, domain: 3, discourse: 2 },
  { lex: 4, syntax: 4, concept: 3, domain: 3, discourse: 3 },
  { lex: 5, syntax: 4, concept: 4, domain: 4, discourse: 3 },
  { lex: 5, syntax: 5, concept: 5, domain: 4, discourse: 4 }
];

/**
 * sessionState tracks session-level entropy to prevent repeated stimuli.
 * This ensures psychometric validity across adaptive difficulty shifts.
 */
const sessionState = {
  usedPassageIds: new Set<string>(),
  usedSchemas: new Set<string>(),
  latticeHistory: [] as string[]
};

// Helper to define complexity for a schema
const createComplexity = (l: number, s: number, c: number, d: number, dis: number): ComplexityVector => ({
  lex: l, syntax: s, concept: c, domain: d, discourse: dis
});

// SCHEMAS 
const BANK: ReadingProblem[] = [
  {
    id: "p1", gradeMeta: 3, complexity: createComplexity(1, 1, 1, 1, 1), lens: "MAIN_IDEA", emoji: "🏠",
    passage: "Beavers build dams across streams to create ponds. These ponds protect them from predators and provide a place to store food for winter.",
    question: "What is the main idea of this passage?",
    choices: ["Beavers like to swim in winter", "How beavers use dams to stay safe and fed", "Predators are dangerous to small animals", "Streams are cold in the winter"],
    correctIndex: 1
  },
  {
    id: "p2", gradeMeta: 3, complexity: createComplexity(2, 1, 1, 1, 1), lens: "KEY_DETAIL", emoji: "🏗️",
    passage: "Beavers use branches, stones, and mud to build their dams. They work mostly at night to stay hidden from other animals.",
    question: "What materials do beavers use to build their dams?",
    choices: ["Only mud and water", "Branches, stones, and mud", "Night vision and speed", "Fish and small plants"],
    correctIndex: 1
  },
  {
    id: "p3", gradeMeta: 3, complexity: createComplexity(2, 2, 1, 1, 1), lens: "INFERENCE", emoji: "🦉",
    passage: "The beaver slapped its flat tail on the water's surface as a coyote approached the stream.",
    question: "What can you infer from the beaver's action?",
    choices: ["The beaver is playing a game", "The beaver is trying to cool off", "The beaver is warning others of danger", "The beaver is catching a fish"],
    correctIndex: 2
  },
  {
    id: "p4", gradeMeta: 4, complexity: createComplexity(3, 2, 2, 2, 1), lens: "MAIN_IDEA", emoji: "🌋",
    passage: "Volcanoes are formed when magma from beneath the Earth's crust erupts through the surface. Over time, the cooled lava builds up to create a mountain-like structure.",
    question: "Which sentence best describes the main idea?",
    choices: ["Mountains are always made of lava", "How volcanoes are formed and grow", "Magma is very hot liquid rock", "Eruptions are very loud and scary"],
    correctIndex: 1
  },
  {
    id: "p5", gradeMeta: 4, complexity: createComplexity(3, 3, 2, 2, 2), lens: "KEY_DETAIL", emoji: "🔥",
    passage: "There are different types of volcanoes. Shield volcanoes have gentle slopes, while cinder cones are much steeper and smaller.",
    question: "Which type of volcano is described as being steep and small?",
    choices: ["Shield volcano", "Mountain volcano", "Cinder cone", "Crust volcano"],
    correctIndex: 2
  },
  {
    id: "p6", gradeMeta: 5, complexity: createComplexity(4, 3, 3, 3, 2), lens: "INFERENCE", emoji: "🌑",
    passage: "Scientists noticed that the ground near the volcano began to swell and small earthquakes were happening daily.",
    question: "What can scientists most likely infer from these signs?",
    choices: ["The volcano is becoming extinct", "The volcano may erupt soon", "The ground is getting stronger", "A new forest is about to grow"],
    correctIndex: 1
  },
  {
    id: "p7", gradeMeta: 6, complexity: createComplexity(4, 4, 3, 3, 3), lens: "MAIN_IDEA", emoji: "🛰️",
    passage: "Artificial satellites orbiting Earth provide vital data for weather forecasting, global communication, and scientific research. Without these instruments, our modern interconnected world would struggle to function efficiently.",
    question: "What is the central idea of the text?",
    choices: ["Satellites are expensive to build", "The importance of satellites in modern life", "How to forecast the weather", "Scientific research is difficult in space"],
    correctIndex: 1
  },
  {
    id: "p8", gradeMeta: 7, complexity: createComplexity(5, 4, 4, 4, 3), lens: "KEY_DETAIL", emoji: "📡",
    passage: "Communication satellites act as relay stations, receiving signals from one part of the world and transmitting them back down to another location thousands of miles away.",
    question: "According to the passage, how do communication satellites function?",
    choices: ["They store data for years", "They create new signals in space", "They relay signals between different locations", "They only work for television"],
    correctIndex: 2
  },
  {
    id: "p9", gradeMeta: 7, complexity: createComplexity(5, 5, 5, 4, 4), lens: "INFERENCE", emoji: "🌌",
    passage: "As technology advances, satellites are becoming smaller and more efficient, allowing private companies to launch large 'constellations' of small devices into low Earth orbit.",
    question: "What can be inferred about the future of space exploration?",
    choices: ["Space will become less crowded", "Satellites will eventually disappear", "Access to space technology is expanding", "Large satellites are better than small ones"],
    correctIndex: 2
  }
];

export function selectPassageByComplexity(level: number): ReadingProblem[] {
  const target = COMPLEXITY_LADDER[level];
  return BANK.filter(p =>
    p.complexity.lex <= target.lex &&
    p.complexity.syntax <= target.syntax &&
    p.complexity.concept <= target.concept &&
    p.complexity.domain <= target.domain &&
    p.complexity.discourse <= target.discourse
  );
}

/**
 * generateReadingProblem now enforces non-repetition.
 * If the pool at current cognitive load is exhausted, it escalates difficulty
 * until a novel stimulus is identified.
 */
export function generateReadingProblem(level: number): Problem {
  let activeLevel = level;
  let pool = selectPassageByComplexity(activeLevel);
  let unused = pool.filter(p => !sessionState.usedPassageIds.has(p.id));

  // ESCALATION LOGIC:
  // If no unused passages at this lattice position, move up the ladder.
  while (unused.length === 0 && activeLevel < COMPLEXITY_LADDER.length - 1) {
    activeLevel++;
    pool = selectPassageByComplexity(activeLevel);
    unused = pool.filter(p => !sessionState.usedPassageIds.has(p.id));
  }

  // PSYCHOMETRIC FAILSAFE:
  // If entire bank is exhausted, reset session entropy tracking.
  if (unused.length === 0) {
    sessionState.usedPassageIds.clear();
    unused = BANK;
  }

  const pick = unused[Math.floor(Math.random() * unused.length)];
  
  // Record Entropy State
  sessionState.usedPassageIds.add(pick.id);
  sessionState.latticeHistory.push(`Level_${activeLevel}_${pick.id}`);

  return {
    ...pick,
    tableData: [
      { label: "Lens Type", value: pick.lens, displayValue: pick.lens.replace('_', ' ') },
      { label: "Lexical", value: pick.complexity.lex, displayValue: "L" + pick.complexity.lex },
      { label: "Syntactic", value: pick.complexity.syntax, displayValue: "S" + pick.complexity.syntax },
      { label: "Cognitive Load", value: activeLevel, displayValue: "Stage " + (activeLevel + 1) }
    ]
  };
}

export const generateProblem = generateReadingProblem;
