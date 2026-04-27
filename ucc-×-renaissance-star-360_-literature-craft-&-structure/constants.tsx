
import { LiteratureItem, Difficulty, GradeLevel, Problem, LiteratureLens, DistractorLogic } from './types';

const LITERATURE_BANK: LiteratureItem[] = [
  // DIFFICULTY 1 - GRADE 3
  {
    id: "lit3-1", gradeMeta: 3, difficulty: 1, lens: "NARRATOR", emoji: "📖",
    passage: "I walked through the garden and saw a rabbit. I wondered where it was going, so I followed it quietly.",
    question: "Who is telling this story?",
    choices: ["The rabbit", "A person in the garden", "A bird in a tree", "The garden itself"],
    correctIndex: 1, distractorLogicByOption: ["PLOT_TRAP", "STRUCTURE_TRUTH", "LITERAL_TRAP", "EMOTION_TRAP"],
  },
  {
    id: "lit3-2", gradeMeta: 3, difficulty: 1, lens: "TONE", emoji: "☀️",
    passage: "The sun was warm and the flowers were dancing in the breeze. A bright blue butterfly landed on my hand.",
    question: "What is the mood of this scene?",
    choices: ["Scary", "Angry", "Cheerful", "Sad"],
    correctIndex: 2, distractorLogicByOption: ["EMOTION_TRAP", "PLOT_TRAP", "STRUCTURE_TRUTH", "LITERAL_TRAP"],
  },
  {
    id: "lit3-3", gradeMeta: 3, difficulty: 1, lens: "FIGURATIVE", emoji: "🐢",
    passage: "The old man walked as slow as a turtle. He took his time looking at every shop window.",
    question: "What does 'as slow as a turtle' mean in this sentence?",
    // Fixed: Removed 'options' which is not defined in the LiteratureItem interface.
    choices: ["He was wearing a shell", "He was moving very slowly", "He was swimming", "He was very small"],
    correctIndex: 1, distractorLogicByOption: ["LITERAL_TRAP", "STRUCTURE_TRUTH", "PLOT_TRAP", "EMOTION_TRAP"],
  },
  {
    id: "lit3-4", gradeMeta: 3, difficulty: 1, lens: "STRUCTURE", emoji: "🏁",
    passage: "Once upon a time, there was a small cat. It lived in a big house with many windows.",
    question: "Why does the author start with 'Once upon a time'?",
    choices: ["To show the story is ending", "To show the cat is hungry", "To signal a story is beginning", "To describe the house"],
    correctIndex: 2, distractorLogicByOption: ["LITERAL_TRAP", "PLOT_TRAP", "STRUCTURE_TRUTH", "EMOTION_TRAP"],
  },

  // DIFFICULTY 2 - GRADE 4
  {
    id: "lit4-1", gradeMeta: 4, difficulty: 2, lens: "AUTHOR_INTENT", emoji: "🦉",
    passage: "The owl sat perfectly still, its eyes wide and glowing. It waited for even the tiniest sound from the grass below.",
    question: "Why did the author include the detail about the owl being 'perfectly still'?",
    choices: ["To show the owl was sleeping", "To show the owl was hunting carefully", "To show the owl was scared", "To show the owl was made of wood"],
    correctIndex: 1, distractorLogicByOption: ["PLOT_TRAP", "STRUCTURE_TRUTH", "EMOTION_TRAP", "LITERAL_TRAP"],
  },
  {
    id: "lit4-2", gradeMeta: 4, difficulty: 2, lens: "TONE", emoji: "⛈️",
    passage: "Shadows stretched across the empty hallway. The wind howled through the cracks in the door like a lonely ghost.",
    question: "Which word best describes the mood of the passage?",
    choices: ["Silly", "Exciting", "Eerie", "Boring"],
    correctIndex: 2, distractorLogicByOption: ["EMOTION_TRAP", "PLOT_TRAP", "STRUCTURE_TRUTH", "LITERAL_TRAP"],
  },
  {
    id: "lit4-3", gradeMeta: 4, difficulty: 2, lens: "NARRATOR", emoji: "👥",
    passage: "Tom and Sarah both wanted the last cookie. They looked at each other, neither one willing to move first.",
    question: "How is this story being told?",
    choices: ["By Tom himself", "By Sarah herself", "By someone watching both of them", "By the cookie"],
    correctIndex: 2, distractorLogicByOption: ["PLOT_TRAP", "LITERAL_TRAP", "STRUCTURE_TRUTH", "EMOTION_TRAP"],
  },
  {
    id: "lit4-4", gradeMeta: 4, difficulty: 2, lens: "FIGURATIVE", emoji: "🧁",
    passage: "The cupcakes were a mountain of sugar and frosting. Everyone at the party wanted to climb to the top.",
    question: "What is the metaphor 'mountain of sugar' describing?",
    choices: ["A real mountain made of candy", "A very large pile of cupcakes", "A person who likes sweets", "The party was outside"],
    correctIndex: 1, distractorLogicByOption: ["LITERAL_TRAP", "STRUCTURE_TRUTH", "EMOTION_TRAP", "PLOT_TRAP"],
  },

  // DIFFICULTY 3 - GRADE 5
  {
    id: "lit5-1", gradeMeta: 5, difficulty: 3, lens: "NARRATOR", emoji: "🎭",
    passage: "I knew I shouldn't have taken the map, but I told the others I found it on the ground. They trusted me, which made my stomach do flips.",
    question: "How does the narrator's perspective affect the story?",
    choices: ["We see that the narrator is lying to the group", "We see that the map is magical", "We see that the group is in a cave", "We see that the ground is rocky"],
    correctIndex: 0, distractorLogicByOption: ["STRUCTURE_TRUTH", "LITERAL_TRAP", "PLOT_TRAP", "EMOTION_TRAP"],
  },
  {
    id: "lit5-2", gradeMeta: 5, difficulty: 3, lens: "TONE", emoji: "🌫️",
    passage: "The fog swallowed the lighthouse. The beacon flickered, a faint pulse in the thick, grey dampness that tasted of salt and silence.",
    question: "What atmosphere is created by the author's choice of words?",
    choices: ["A sense of safety", "A sense of isolation", "A sense of humor", "A sense of warmth"],
    correctIndex: 1, distractorLogicByOption: ["EMOTION_TRAP", "STRUCTURE_TRUTH", "PLOT_TRAP", "LITERAL_TRAP"],
  },
  {
    id: "lit5-3", gradeMeta: 5, difficulty: 3, lens: "STRUCTURE", emoji: "📜",
    passage: "Just as the hero was about to open the door, the scene shifted back to his childhood home ten years earlier.",
    question: "What is the structural purpose of this shift?",
    choices: ["To show the hero is tired", "To provide background information", "To end the story suddenly", "To describe the weather"],
    correctIndex: 1, distractorLogicByOption: ["PLOT_TRAP", "STRUCTURE_TRUTH", "LITERAL_TRAP", "EMOTION_TRAP"],
  },
  {
    id: "lit5-4", gradeMeta: 5, difficulty: 3, lens: "FIGURATIVE", emoji: "🦁",
    passage: "His courage was a roaring lion that gave him the strength to face the dark forest.",
    question: "What does the figurative language imply about the character?",
    choices: ["He was turning into an animal", "His bravery was very strong and loud", "He was afraid of lions", "He lived in a zoo"],
    correctIndex: 1, distractorLogicByOption: ["LITERAL_TRAP", "STRUCTURE_TRUTH", "EMOTION_TRAP", "PLOT_TRAP"],
  },

  // DIFFICULTY 4 - GRADE 6
  {
    id: "lit6-1", gradeMeta: 6, difficulty: 4, lens: "AUTHOR_INTENT", emoji: "⏳",
    passage: "The ticking clock seemed to get louder with every second. Marcus tapped his fingers on the table, matching the rhythm of the mechanical heart.",
    question: "What is the author's purpose in emphasizing the sound of the clock?",
    choices: ["To explain how clocks work", "To build a sense of suspense or anxiety", "To show Marcus is a musician", "To describe the furniture in the room"],
    correctIndex: 1, distractorLogicByOption: ["PLOT_TRAP", "STRUCTURE_TRUTH", "LITERAL_TRAP", "EMOTION_TRAP"],
  },
  {
    id: "lit6-2", gradeMeta: 6, difficulty: 4, lens: "STRUCTURE", emoji: "🧱",
    passage: "The first paragraph described the peaceful village. The second paragraph introduced the smoke rising from the horizon.",
    question: "How does the organization of these paragraphs create a specific effect?",
    choices: ["By showing that the village is boring", "By creating a contrast between peace and danger", "By listing facts about the smoke", "By introducing the main character"],
    correctIndex: 1, distractorLogicByOption: ["PLOT_TRAP", "STRUCTURE_TRUTH", "LITERAL_TRAP", "EMOTION_TRAP"],
  },
  {
    id: "lit6-3", gradeMeta: 6, difficulty: 4, lens: "NARRATOR", emoji: "🕵️",
    passage: "None of the neighbors liked Mr. Henderson. They whispered about his closed curtains and the strange deliveries that arrived late at night.",
    question: "What is the perspective of the narrator?",
    choices: ["Mr. Henderson's best friend", "Mr. Henderson himself", "An outside observer sharing common rumors", "A delivery driver"],
    correctIndex: 2, distractorLogicByOption: ["EMOTION_TRAP", "PLOT_TRAP", "STRUCTURE_TRUTH", "LITERAL_TRAP"],
  },
  {
    id: "lit6-4", gradeMeta: 6, difficulty: 4, lens: "FIGURATIVE", emoji: "💎",
    passage: "Her words were cold stones that sank to the bottom of the conversation, leaving a heavy silence.",
    question: "What is the meaning of the metaphor 'cold stones'?",
    choices: ["She was talking about a garden", "Her words were hurtful or unfriendly", "She was throwing rocks", "Her voice was very quiet"],
    correctIndex: 1, distractorLogicByOption: ["LITERAL_TRAP", "STRUCTURE_TRUTH", "PLOT_TRAP", "EMOTION_TRAP"],
  },

  // DIFFICULTY 5 - GRADE 7
  {
    id: "lit7-1", gradeMeta: 7, difficulty: 5, lens: "TONE", emoji: "🍂",
    passage: "The golden leaves fell like forgotten promises. The once-bright playground now stood skeletal against a sky that had lost its blue.",
    question: "Which word best characterizes the tone of the passage?",
    choices: ["Nostalgic and somber", "Angry and violent", "Joyful and lighthearted", "Scientific and factual"],
    correctIndex: 0, distractorLogicByOption: ["STRUCTURE_TRUTH", "EMOTION_TRAP", "PLOT_TRAP", "LITERAL_TRAP"],
  },
  {
    id: "lit7-2", gradeMeta: 7, difficulty: 5, lens: "NARRATOR", emoji: "🎭",
    passage: "I smiled at the judge, though my hands were shaking behind my back. Everything was going according to plan, at least that's what I wanted myself to believe.",
    question: "What does the narrator's internal state reveal about their reliability?",
    choices: ["They are completely confident", "They are trying to hide their own doubt or fear", "They are the judge of the contest", "They are a professional actor"],
    correctIndex: 1, distractorLogicByOption: ["LITERAL_TRAP", "STRUCTURE_TRUTH", "PLOT_TRAP", "EMOTION_TRAP"],
  },
  {
    id: "lit7-3", gradeMeta: 7, difficulty: 5, lens: "STRUCTURE", emoji: "⚙️",
    passage: "The author abruptly ended the chapter with a question that had no immediate answer.",
    question: "What is the most likely structural intent of this ending?",
    choices: ["The author ran out of ideas", "To create a cliffhanger and keep the reader curious", "To show the book is a mystery", "To define a vocabulary word"],
    correctIndex: 1, distractorLogicByOption: ["LITERAL_TRAP", "STRUCTURE_TRUTH", "PLOT_TRAP", "EMOTION_TRAP"],
  },
  {
    id: "lit7-4", gradeMeta: 7, difficulty: 5, lens: "AUTHOR_INTENT", emoji: "🏙️",
    passage: "The towering skyscrapers leaned over the street like giants, blocking out the sun and turning the noon hour into a permanent twilight.",
    question: "What is the author's intent in using this personification?",
    choices: ["To explain the height of the buildings", "To create an oppressive or overwhelming feeling", "To describe a city in the future", "To show that giants are real"],
    correctIndex: 1, distractorLogicByOption: ["PLOT_TRAP", "STRUCTURE_TRUTH", "EMOTION_TRAP", "LITERAL_TRAP"],
  }
];

const diffIndices: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

export function generateLiteratureItem(difficulty: Difficulty): Problem {
  const diff = difficulty as Difficulty;
  const pool = LITERATURE_BANK.filter(item => item.difficulty === diff);
  
  if (pool.length === 0) return generateLiteratureItem(1); 

  const idx = diffIndices[diff] % pool.length;
  const rawItem = pool[idx];
  diffIndices[diff]++;

  return {
    ...rawItem,
    tableData: [
      { label: "Lens Type", value: rawItem.lens, displayValue: rawItem.lens },
      { label: "Complexity", value: difficulty * 2, displayValue: "Level " + difficulty }
    ]
  };
}

// Keeping existing generator interface for App.tsx compatibility
export const generateProblem = generateLiteratureItem;
