
import { VocabItem, Difficulty, GradeLevel, Problem, VocabChannel, DistractorType } from './types';

const BANK: VocabItem[] = [
  // DIFFICULTY 1 - GRADE 3
  {
    id: "v3-1", grade: 3, difficulty: 1, channel: "definition", emoji: "🐘",
    stem: "What is the meaning of the word 'enormous'?",
    choices: ["Very small", "Extremely large", "Fast moving", "Brightly colored"],
    correctIndex: 1, rationale: "Enormous means very large or huge.",
    skillTag: "word_meaning", distractorType: "antonym_trap"
  },
  {
    id: "v3-2", grade: 3, difficulty: 1, channel: "context", emoji: "🏃",
    stem: "Choose the sentence that uses the word 'scamper' correctly.",
    choices: ["The clouds scamper across the tall tree.", "The mouse will scamper quickly to its hole.", "I like to scamper my homework after school.", "The car had to scamper at the red light."],
    correctIndex: 1, rationale: "Scamper means to run with quick light steps, usually in fear or excitement.",
    skillTag: "context_clues", distractorType: "category_error"
  },
  {
    id: "v3-3", grade: 3, difficulty: 1, channel: "contrast", emoji: "🏰",
    stem: "Which word is the OPPOSITE of 'ancient'?",
    choices: ["Old", "Aged", "Modern", "Heavy"],
    correctIndex: 2, rationale: "Ancient means very old; modern means belonging to the present.",
    skillTag: "antonyms", distractorType: "near_synonym"
  },
  {
    id: "v3-4", grade: 3, difficulty: 1, channel: "morphology", emoji: "🔄",
    stem: "The prefix 're-' in 'rewrite' means:",
    choices: ["Before", "Not", "Again", "Small"],
    correctIndex: 2, rationale: "The prefix 're-' means again (e.g., redo, replay).",
    skillTag: "prefixes", distractorType: "root_confusion"
  },

  // DIFFICULTY 2 - GRADE 4
  {
    id: "v4-1", grade: 4, difficulty: 2, channel: "definition", emoji: "😠",
    stem: "What does the word 'furious' mean?",
    choices: ["Very hungry", "Full of energy", "Extremely angry", "Feeling calm"],
    correctIndex: 2, rationale: "Furious means intense anger.",
    skillTag: "word_meaning", distractorType: "near_synonym"
  },
  {
    id: "v4-2", grade: 4, difficulty: 2, channel: "context", emoji: "🔭",
    stem: "Which sentence uses 'observe' correctly?",
    choices: ["We must observe the stars through a telescope.", "The dog will observe its dinner into the bowl.", "Please observe your shoes before entering.", "I observe my bike to the park yesterday."],
    correctIndex: 0, rationale: "Observe means to watch carefully.",
    skillTag: "context_clues", distractorType: "category_error"
  },
  {
    id: "v4-3", grade: 4, difficulty: 2, channel: "contrast", emoji: "🐢",
    stem: "Which word is the OPPOSITE of 'gradual'?",
    choices: ["Slow", "Steady", "Sudden", "Plain"],
    correctIndex: 2, rationale: "Gradual means happening slowly; sudden means happening at once.",
    skillTag: "antonyms", distractorType: "near_synonym"
  },
  {
    id: "v4-4", grade: 4, difficulty: 2, channel: "morphology", emoji: "🚫",
    stem: "The suffix '-less' in 'fearless' means:",
    choices: ["Full of", "Without", "More of", "Like"],
    correctIndex: 1, rationale: "The suffix '-less' means without (e.g., hopeless, cloudless).",
    skillTag: "suffixes", distractorType: "root_confusion"
  },

  // DIFFICULTY 3 - GRADE 5
  {
    id: "v5-1", grade: 5, difficulty: 3, channel: "definition", emoji: "🌟",
    stem: "What is the meaning of the word 'essential'?",
    choices: ["Completely unnecessary", "Extremely important", "Hard to find", "Very expensive"],
    correctIndex: 1, rationale: "Essential means absolutely necessary or extremely important.",
    skillTag: "word_meaning", distractorType: "antonym_trap"
  },
  {
    id: "v5-2", grade: 5, difficulty: 3, channel: "context", emoji: "⛰️",
    stem: "Which sentence uses 'advantage' correctly?",
    choices: ["The tall player had an advantage in basketball.", "I took an advantage of juice from the fridge.", "She felt advantage when she lost her keys.", "The mountain had a steep advantage."],
    correctIndex: 0, rationale: "Advantage means a condition that puts one in a favorable position.",
    skillTag: "context_clues", distractorType: "category_error"
  },
  {
    id: "v5-3", grade: 5, difficulty: 3, channel: "contrast", emoji: "🤝",
    stem: "Which word is the OPPOSITE of 'conflict'?",
    choices: ["Argument", "Struggle", "Agreement", "Meeting"],
    correctIndex: 2, rationale: "Conflict means a serious disagreement; agreement means harmony.",
    skillTag: "antonyms", distractorType: "near_synonym"
  },
  {
    id: "v5-4", grade: 5, difficulty: 3, channel: "morphology", emoji: "👣",
    stem: "The Greek root 'tele' (as in telephone or telescope) means:",
    choices: ["Sound", "Far off", "Light", "To see"],
    correctIndex: 1, rationale: "The root 'tele' means far or distant.",
    skillTag: "greek_roots", distractorType: "root_confusion"
  },

  // DIFFICULTY 4 - GRADE 6
  {
    id: "v6-1", grade: 6, difficulty: 4, channel: "definition", emoji: "🔍",
    stem: "What does it mean to 'analyze' something?",
    choices: ["To ignore the facts", "To break it down into parts to understand it", "To build a new version of it", "To hide it from others"],
    correctIndex: 1, rationale: "Analyze means to examine methodically and in detail.",
    skillTag: "academic_vocab", distractorType: "category_error"
  },
  {
    id: "v6-2", grade: 6, difficulty: 4, channel: "context", emoji: "💡",
    stem: "Which sentence uses 'innovative' correctly?",
    choices: ["The phone was so innovative that it worked like old ones.", "Her innovative idea solved a problem no one could fix.", "He felt innovative after eating a big lunch.", "The innovative weather was very rainy today."],
    correctIndex: 1, rationale: "Innovative means featuring new methods; advanced and original.",
    skillTag: "context_clues", distractorType: "category_error"
  },
  {
    id: "v6-3", grade: 6, difficulty: 4, channel: "contrast", emoji: "🌈",
    stem: "Which word is the OPPOSITE of 'distinct'?",
    choices: ["Clear", "Sharp", "Vague", "Unique"],
    correctIndex: 2, rationale: "Distinct means clear and separate; vague means uncertain or unclear.",
    skillTag: "antonyms", distractorType: "near_synonym"
  },
  {
    id: "v6-4", grade: 6, difficulty: 4, channel: "morphology", emoji: "✍️",
    stem: "The Latin root 'scrib/script' means:",
    choices: ["To speak", "To write", "To hear", "To move"],
    correctIndex: 1, rationale: "Scrib/script means to write (e.g., scribble, description).",
    skillTag: "latin_roots", distractorType: "root_confusion"
  },

  // DIFFICULTY 5 - GRADE 7
  {
    id: "v7-1", grade: 7, difficulty: 5, channel: "definition", emoji: "🌫️",
    stem: "What is the meaning of 'ambiguous'?",
    choices: ["Very clear and easy to see", "Having more than one possible meaning", "Extremely fast or rapid", "Difficult to break or bend"],
    correctIndex: 1, rationale: "Ambiguous means open to more than one interpretation; unclear.",
    skillTag: "academic_vocab", distractorType: "antonym_trap"
  },
  {
    id: "v7-2", grade: 7, difficulty: 5, channel: "context", emoji: "📉",
    stem: "Which sentence uses 'fluctuate' correctly?",
    choices: ["The price of gas will fluctuate based on the market.", "I fluctuate my coffee with sugar and cream.", "The building began to fluctuate during the wind.", "She tried to fluctuate the door to open it."],
    correctIndex: 0, rationale: "Fluctuate means to rise and fall irregularly in number or amount.",
    skillTag: "context_clues", distractorType: "sound_alike"
  },
  {
    id: "v7-3", grade: 7, difficulty: 5, channel: "contrast", emoji: "🧹",
    stem: "Which word is the OPPOSITE of 'meticulous'?",
    choices: ["Careful", "Thorough", "Careless", "Precise"],
    correctIndex: 2, rationale: "Meticulous means showing great attention to detail; careless is the opposite.",
    skillTag: "antonyms", distractorType: "near_synonym"
  },
  {
    id: "v7-4", grade: 7, difficulty: 5, channel: "morphology", emoji: "🧬",
    stem: "The root 'bene' (as in benefit or benefactor) means:",
    choices: ["Bad", "Small", "Good", "Life"],
    correctIndex: 2, rationale: "The root 'bene' means good or well.",
    skillTag: "latin_roots", distractorType: "root_confusion"
  }
];

// Round-robin tracking per difficulty
const diffIndices: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

export function generateProblem(difficulty: Difficulty): Problem {
  const diff = difficulty as Difficulty;
  const pool = BANK.filter(item => item.difficulty === diff);
  
  if (pool.length === 0) return generateProblem(1); 

  const idx = diffIndices[diff] % pool.length;
  const rawItem = pool[idx];
  diffIndices[diff]++;

  return {
    ...rawItem,
    tableData: [
      { label: "Channel", value: rawItem.channel, displayValue: rawItem.channel.toUpperCase() },
      { label: "Complexity", value: difficulty * 2, displayValue: "Level " + difficulty }
    ]
  };
}
