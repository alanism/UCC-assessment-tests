
import { ReadingProblem, Difficulty, GradeLevel, Problem, ReadingLens } from './types';

// SCHEMAS GRADE 3 (Difficulty 1)
const schema3_mainIdea = (): ReadingProblem => ({
  id: `g3-mi-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 3, difficulty: 1, lens: "MAIN_IDEA", emoji: "🏠",
  passage: "Beavers build dams across streams to create ponds. These ponds protect them from predators and provide a place to store food for winter.",
  question: "What is the main idea of this passage?",
  choices: ["Beavers like to swim in winter", "How beavers use dams to stay safe and fed", "Predators are dangerous to small animals", "Streams are cold in the winter"],
  correctIndex: 1
});

const schema3_detail = (): ReadingProblem => ({
  id: `g3-kd-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 3, difficulty: 1, lens: "KEY_DETAIL", emoji: "🏗️",
  passage: "Beavers use branches, stones, and mud to build their dams. They work mostly at night to stay hidden from other animals.",
  question: "What materials do beavers use to build their dams?",
  choices: ["Only mud and water", "Branches, stones, and mud", "Night vision and speed", "Fish and small plants"],
  correctIndex: 1
});

const schema3_infer = (): ReadingProblem => ({
  id: `g3-inf-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 3, difficulty: 1, lens: "INFERENCE", emoji: "🦉",
  passage: "The beaver slapped its flat tail on the water's surface as a coyote approached the stream.",
  question: "What can you infer from the beaver's action?",
  choices: ["The beaver is playing a game", "The beaver is trying to cool off", "The beaver is warning others of danger", "The beaver is catching a fish"],
  correctIndex: 2
});

// SCHEMAS GRADE 4 (Difficulty 2)
const schema4_mainIdea = (): ReadingProblem => ({
  id: `g4-mi-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 4, difficulty: 2, lens: "MAIN_IDEA", emoji: "🌋",
  passage: "Volcanoes are formed when magma from beneath the Earth's crust erupts through the surface. Over time, the cooled lava builds up to create a mountain-like structure.",
  question: "Which sentence best describes the main idea?",
  choices: ["Mountains are always made of lava", "How volcanoes are formed and grow", "Magma is very hot liquid rock", "Eruptions are very loud and scary"],
  correctIndex: 1
});

const schema4_detail = (): ReadingProblem => ({
  id: `g4-kd-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 4, difficulty: 2, lens: "KEY_DETAIL", emoji: "🔥",
  passage: "There are different types of volcanoes. Shield volcanoes have gentle slopes, while cinder cones are much steeper and smaller.",
  question: "Which type of volcano is described as being steep and small?",
  choices: ["Shield volcano", "Mountain volcano", "Cinder cone", "Crust volcano"],
  correctIndex: 2
});

const schema4_infer = (): ReadingProblem => ({
  id: `g4-inf-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 4, difficulty: 2, lens: "INFERENCE", emoji: "🌑",
  passage: "Scientists noticed that the ground near the volcano began to swell and small earthquakes were happening daily.",
  question: "What can scientists most likely infer from these signs?",
  choices: ["The volcano is becoming extinct", "The volcano may erupt soon", "The ground is getting stronger", "A new forest is about to grow"],
  correctIndex: 1
});

// SCHEMAS GRADE 5 (Difficulty 3)
const schema5_mainIdea = (): ReadingProblem => ({
  id: `g5-mi-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 5, difficulty: 3, lens: "MAIN_IDEA", emoji: "🛰️",
  passage: "Artificial satellites orbiting Earth provide vital data for weather forecasting, global communication, and scientific research. Without these instruments, our modern interconnected world would struggle to function efficiently.",
  question: "What is the central idea of the text?",
  choices: ["Satellites are expensive to build", "The importance of satellites in modern life", "How to forecast the weather", "Scientific research is difficult in space"],
  correctIndex: 1
});

const schema5_detail = (): ReadingProblem => ({
  id: `g5-kd-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 5, difficulty: 3, lens: "KEY_DETAIL", emoji: "📡",
  passage: "Communication satellites act as relay stations, receiving signals from one part of the world and transmitting them back down to another location thousands of miles away.",
  question: "According to the passage, how do communication satellites function?",
  choices: ["They store data for years", "They create new signals in space", "They relay signals between different locations", "They only work for television"],
  correctIndex: 2
});

const schema5_infer = (): ReadingProblem => ({
  id: `g5-inf-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 5, difficulty: 3, lens: "INFERENCE", emoji: "🌌",
  passage: "As technology advances, satellites are becoming smaller and more efficient, allowing private companies to launch large 'constellations' of small devices into low Earth orbit.",
  question: "What can be inferred about the future of space exploration?",
  choices: ["Space will become less crowded", "Satellites will eventually disappear", "Access to space technology is expanding", "Large satellites are better than small ones"],
  correctIndex: 2
});

// SCHEMAS GRADE 6 (Difficulty 4)
const schema6_mainIdea = (): ReadingProblem => ({
  id: `g6-mi-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 6, difficulty: 4, lens: "MAIN_IDEA", emoji: "🏛️",
  passage: "The Great Wall of China was not built all at once but was constructed over several centuries by different dynasties. Its primary purpose evolved from a military defense system into a symbol of national unity and historical perseverance.",
  question: "What is the main idea of the passage?",
  choices: ["The wall was built for tourism", "The long and changing history of the Great Wall", "Why dynasties were often at war", "The specific materials used in the wall"],
  correctIndex: 1
});

const schema6_detail = (): ReadingProblem => ({
  id: `g6-kd-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 6, difficulty: 4, lens: "KEY_DETAIL", emoji: "🧱",
  passage: "In addition to defense, the Wall served as a border control, allowing for the imposition of duties on goods transported along the Silk Road.",
  question: "What was one non-military function of the Great Wall mentioned in the text?",
  choices: ["Agricultural irrigation", "A path for religious pilgrimages", "Managing trade and taxes on goods", "Providing housing for farmers"],
  correctIndex: 2
});

const schema6_infer = (): ReadingProblem => ({
  id: `g6-inf-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 6, difficulty: 4, lens: "INFERENCE", emoji: "🐉",
  passage: "Despite its massive size, history shows that the Wall was sometimes breached or bypassed by invaders who bribed local officials or attacked during periods of internal Chinese unrest.",
  question: "What does this suggest about the effectiveness of the Great Wall?",
  choices: ["It was a perfect defense system", "Physical barriers are useless", "Human factors influenced its success or failure", "Invaders preferred the Silk Road"],
  correctIndex: 2
});

// SCHEMAS GRADE 7 (Difficulty 5)
const schema7_mainIdea = (): ReadingProblem => ({
  id: `g7-mi-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 7, difficulty: 5, lens: "MAIN_IDEA", emoji: "🧬",
  passage: "Bio-remediation is a process that uses microorganisms, such as bacteria or fungi, to break down and remove pollutants from the environment. While it is often more cost-effective than traditional methods, its success depends heavily on the specific environmental conditions and the type of contaminant involved.",
  question: "Which statement captures the main idea of the passage?",
  choices: ["Microorganisms are always helpful", "Traditional cleaning methods are obsolete", "The potential and limitations of bio-remediation", "Pollutants are destroyed by sunlight"],
  correctIndex: 2
});

const schema7_detail = (): ReadingProblem => ({
  id: `g7-kd-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 7, difficulty: 5, lens: "KEY_DETAIL", emoji: "🧪",
  passage: "Specific nutrients, such as nitrogen and phosphorus, are often added to contaminated soil to stimulate the growth of indigenous bacteria that can digest oil spills.",
  question: "Why are nutrients sometimes added to contaminated soil?",
  choices: ["To kill harmful viruses", "To encourage the growth of pollutant-eating bacteria", "To make the soil better for farming", "To stop oil from spreading further"],
  correctIndex: 1
});

const schema7_infer = (): ReadingProblem => ({
  id: `g7-inf-${Math.random().toString(36).substr(2, 5)}`,
  gradeMeta: 7, difficulty: 5, lens: "INFERENCE", emoji: "🌱",
  passage: "If a contaminant is toxic to the microorganisms themselves, or if the soil lacks sufficient oxygen, bio-remediation efforts often stall before the site is fully cleaned.",
  question: "What can you infer is necessary for successful bio-remediation?",
  choices: ["Completely sterile conditions", "A habitat that supports microbial life", "The use of strong chemical cleaners", "Very high temperatures"],
  correctIndex: 1
});

export function generateReadingProblem(difficulty: Difficulty): Problem {
  const lenses: ReadingLens[] = ["MAIN_IDEA", "KEY_DETAIL", "INFERENCE"];
  const lens = lenses[Math.floor(Math.random() * lenses.length)];

  const schemas: Record<number, Record<ReadingLens, (() => ReadingProblem)[]>> = {
    1: { MAIN_IDEA: [schema3_mainIdea], KEY_DETAIL: [schema3_detail], INFERENCE: [schema3_infer] },
    2: { MAIN_IDEA: [schema4_mainIdea], KEY_DETAIL: [schema4_detail], INFERENCE: [schema4_infer] },
    3: { MAIN_IDEA: [schema5_mainIdea], KEY_DETAIL: [schema5_detail], INFERENCE: [schema5_infer] },
    4: { MAIN_IDEA: [schema6_mainIdea], KEY_DETAIL: [schema6_detail], INFERENCE: [schema6_infer] },
    5: { MAIN_IDEA: [schema7_mainIdea], KEY_DETAIL: [schema7_detail], INFERENCE: [schema7_infer] }
  };

  const pool = schemas[difficulty][lens];
  const pick = pool[Math.floor(Math.random() * pool.length)];

  const problem = pick();
  problem.lens = lens;
  problem.difficulty = difficulty;

  return {
    ...problem,
    tableData: [
      { label: "Lens Type", value: lens, displayValue: lens.replace('_', ' ') },
      { label: "Complexity", value: difficulty * 2, displayValue: "Level " + difficulty }
    ]
  };
}

export const generateProblem = generateReadingProblem;
