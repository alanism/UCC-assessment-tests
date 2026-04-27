
import { ReadingItem, Difficulty, GradeLevel, Problem, ErrorType } from './types';

const BANK: ReadingItem[] = [
  // GRADE 3 - LEVEL 1
  {
    id: "kid3-1", grade: 3, skill: "Main Idea", emoji: "🍎",
    passage: "Apples grow on trees in orchards. Farmers pick them when they are red and sweet. People use them to make pies and juice.",
    question: "What is the main idea of this passage?",
    options: ["Farmers work hard", "Apples and how people use them", "Making apple pie is fun", "Orchards are big"],
    correctIndex: 1, distractorType: "Missed Main Idea"
  },
  {
    id: "kid3-2", grade: 3, skill: "Supporting Details", emoji: "❄️",
    passage: "Penguins are birds that cannot fly, but they are great swimmers. They live in cold places like Antarctica. They eat fish and krill from the ocean.",
    question: "Which detail explains where penguins live?",
    options: ["They eat fish", "They are great swimmers", "They live in Antarctica", "They are birds"],
    correctIndex: 2, distractorType: "Wrong Evidence"
  },
  {
    id: "kid3-3", grade: 3, skill: "Fact vs Opinion", emoji: "🚲",
    passage: "Bicycles are a common way to travel. Riding a bike is the most fun way to get to school. Bikes have two wheels and a seat.",
    question: "Which statement is a fact from the passage?",
    options: ["Riding is the most fun", "Bikes have two wheels", "Everyone should have a bike", "Walking is better than riding"],
    correctIndex: 1, distractorType: "Distractor Chosen"
  },
  {
    id: "kid3-4", grade: 3, skill: "Inference", emoji: "🔦",
    passage: "Sam put on his coat and grabbed his flashlight. He heard a rustling sound in the dark backyard. He walked slowly toward the noise.",
    question: "What can you infer Sam is doing?",
    options: ["Going to sleep", "Looking for something outside", "Building a campfire", "Eating dinner"],
    correctIndex: 1, distractorType: "Inference Failure"
  },
  {
    id: "kid3-5", grade: 3, skill: "Main Idea", emoji: "🐝",
    passage: "Bees fly from flower to flower. They collect nectar to make honey. This also helps plants grow seeds.",
    question: "What is this text mostly about?",
    options: ["How honey tastes", "The work that bees do", "Why flowers are pretty", "Where bees sleep"],
    correctIndex: 1, distractorType: "Missed Main Idea"
  },
  {
    id: "kid3-6", grade: 3, skill: "Supporting Details", emoji: "🌧️",
    passage: "Rain is part of the water cycle. It falls from clouds when they get heavy. Rain helps plants grow and fills up lakes.",
    question: "How does rain help the environment?",
    options: ["It falls from clouds", "It is part of a cycle", "It fills up lakes", "It makes the sky grey"],
    correctIndex: 2, distractorType: "Wrong Evidence"
  },
  {
    id: "kid3-7", grade: 3, skill: "Inference", emoji: "🎒",
    passage: "Lily looked at her empty backpack and then at the clock. She quickly ran to the kitchen to find her lunchbox.",
    question: "Why is Lily in a hurry?",
    options: ["She is going to a party", "She is late for school", "She is hungry", "She lost her keys"],
    correctIndex: 1, distractorType: "Inference Failure"
  },
  {
    id: "kid3-8", grade: 3, skill: "Fact vs Opinion", emoji: "🐕",
    passage: "Dogs are animals that many people keep as pets. Golden Retrievers are the best type of dog. Dogs need exercise and food.",
    question: "Which of these is an opinion?",
    options: ["Dogs are pets", "Golden Retrievers are the best", "Dogs need food", "Dogs need exercise"],
    correctIndex: 1, distractorType: "Distractor Chosen"
  },

  // GRADE 4 - LEVEL 2
  {
    id: "kid4-1", grade: 4, skill: "Main Idea", emoji: "⚡",
    passage: "Electricity powers our homes and schools. It can come from coal, wind, or the sun. Scientists are looking for cleaner ways to make power every day.",
    question: "What is the primary focus of the text?",
    options: ["The sun's heat", "How electricity is produced", "Why coal is dirty", "Building new schools"],
    correctIndex: 1, distractorType: "Missed Main Idea"
  },
  {
    id: "kid4-2", grade: 4, skill: "Supporting Details", emoji: "🏜️",
    passage: "Cactus plants survive in the desert by storing water in their thick stems. Their sharp spines protect them from thirsty animals. Some can live for over 100 years.",
    question: "Which sentence explains how a cactus avoids being eaten?",
    options: ["They store water", "They have thick stems", "Their sharp spines protect them", "They live for 100 years"],
    correctIndex: 2, distractorType: "Wrong Evidence"
  },
  {
    id: "kid4-3", grade: 4, skill: "Inference", emoji: "🌋",
    passage: "The ground shook and ash began to fall from the sky. People living near the mountain were told to leave their homes immediately.",
    question: "What is likely happening on the mountain?",
    options: ["A heavy rainstorm", "An earthquake", "A volcanic eruption", "A mountain climb"],
    correctIndex: 2, distractorType: "Inference Failure"
  },
  {
    id: "kid4-4", grade: 4, skill: "Fact vs Opinion", emoji: "📱",
    passage: "Smartphones allow people to communicate instantly. Everyone should spend less time on their screens. Phones use radio waves to send data.",
    question: "Which statement is a fact from the text?",
    options: ["Everyone should spend less time", "Phones are the best invention", "Phones use radio waves", "Texting is better than calling"],
    correctIndex: 2, distractorType: "Distractor Chosen"
  },
  {
    id: "kid4-5", grade: 4, skill: "Main Idea", emoji: "🏛️",
    passage: "Ancient Romans built long-lasting roads across Europe. They also created aqueducts to bring fresh water to their cities. These structures still exist today.",
    question: "What is the main idea?",
    options: ["Rome was in Europe", "Romans liked water", "Roman engineering and its legacy", "Why roads are important"],
    correctIndex: 2, distractorType: "Missed Main Idea"
  },
  {
    id: "kid4-6", grade: 4, skill: "Supporting Details", emoji: "🐋",
    passage: "Blue whales are the largest animals on Earth. They eat tiny creatures called krill. A single whale can eat four tons of krill in one day.",
    question: "Which detail supports the idea that blue whales are massive eaters?",
    options: ["They are the largest animals", "They eat tiny krill", "They eat four tons in a day", "They live in the ocean"],
    correctIndex: 2, distractorType: "Wrong Evidence"
  },
  {
    id: "kid4-7", grade: 4, skill: "Inference", emoji: "🌖",
    passage: "The astronauts stepped out onto the grey, dusty surface. They jumped high with every step because the gravity was so low.",
    question: "Where are the astronauts most likely located?",
    options: ["A desert", "The Moon", "A laboratory", "Inside the ship"],
    correctIndex: 1, distractorType: "Inference Failure"
  },
  {
    id: "kid4-8", grade: 4, skill: "Fact vs Opinion", emoji: "🥗",
    passage: "Vegetables contain essential nutrients. Broccoli tastes terrible compared to carrots. Eating greens is good for your health.",
    question: "Which of these is an opinion?",
    options: ["Vegetables have nutrients", "Broccoli tastes terrible", "Greens are good for health", "Nutrients are essential"],
    correctIndex: 1, distractorType: "Distractor Chosen"
  },

  // GRADE 5 - LEVEL 3
  {
    id: "kid5-1", grade: 5, skill: "Main Idea", emoji: "🛰️",
    passage: "Satellites orbiting Earth help us predict the weather. They also allow for global GPS navigation and television signals. Space technology has changed modern life.",
    question: "What is the central idea of the passage?",
    options: ["How GPS works", "The benefits of space technology", "Watching TV in space", "Weather patterns"],
    correctIndex: 1, distractorType: "Missed Main Idea"
  },
  {
    id: "kid5-2", grade: 5, skill: "Inference", emoji: "📜",
    passage: "The ink was faded on the old scroll, but the seal was still intact. It had been hidden in the stone chest for centuries.",
    question: "What can you infer about the scroll's history?",
    options: ["It was written recently", "It was protected and kept secret", "It was useless and forgotten", "It was meant to be thrown away"],
    correctIndex: 1, distractorType: "Inference Failure"
  },
  {
    id: "kid5-3", grade: 5, skill: "Supporting Details", emoji: "🌲",
    passage: "Deciduous trees lose their leaves in autumn to conserve water. This process helps them survive cold winters when soil water might be frozen.",
    question: "Why do these trees drop their leaves?",
    options: ["To make room for snow", "To conserve water", "Because they are dying", "To feed the soil"],
    correctIndex: 1, distractorType: "Wrong Evidence"
  },
  {
    id: "kid5-4", grade: 5, skill: "Fact vs Opinion", emoji: "🚢",
    passage: "The Titanic was a famous passenger ship. It hit an iceberg in 1912. It was the most tragic event in maritime history.",
    question: "Which sentence contains an opinion?",
    options: ["It hit an iceberg", "It was a passenger ship", "It was the most tragic event", "It sank in 1912"],
    correctIndex: 2, distractorType: "Distractor Chosen"
  },

  // GRADE 6 - LEVEL 4
  {
    id: "kid6-1", grade: 6, skill: "Inference", emoji: "🩺",
    passage: "The patient's heart rate stabilized after the medication was administered. The doctors sighed with relief and stepped out into the hallway.",
    question: "Based on the text, what was the situation before the medication?",
    options: ["The patient was fine", "The patient was in danger", "The doctors were tired", "The hallway was crowded"],
    correctIndex: 1, distractorType: "Inference Failure"
  },
  {
    id: "kid6-2", grade: 6, skill: "Main Idea", emoji: "💻",
    passage: "Early computers occupied entire rooms and had less power than a modern calculator. Today, microchips allow billions of operations per second in the palm of your hand.",
    question: "What is the main theme of this comparison?",
    options: ["Calculators are useful", "The history of microchips", "The evolution of computer size and power", "Why rooms should be larger"],
    correctIndex: 2, distractorType: "Missed Main Idea"
  },
  {
    id: "kid6-3", grade: 6, skill: "Supporting Details", emoji: "🐜",
    passage: "Leafcutter ants do not actually eat the leaves they cut. Instead, they use the leaves to grow a special fungus which serves as their primary food source.",
    question: "Which detail explains the purpose of the leaves?",
    options: ["They are used for building", "They are the ants' main food", "They grow fungus for food", "Ants cut them to clear paths"],
    correctIndex: 2, distractorType: "Wrong Evidence"
  },
  {
    id: "kid6-4", grade: 6, skill: "Fact vs Opinion", emoji: "🔭",
    passage: "The Hubble Space Telescope was launched in 1990. It has provided the most beautiful images of the universe. It orbits 340 miles above Earth.",
    question: "Which statement is a fact?",
    options: ["Images are the most beautiful", "It was launched in 1990", "Everyone should see its photos", "It is the best telescope ever"],
    correctIndex: 1, distractorType: "Distractor Chosen"
  },

  // GRADE 7 - LEVEL 5
  {
    id: "kid7-1", grade: 7, skill: "Inference", emoji: "🧬",
    passage: "The new variant of the virus showed significant resistance to traditional antibiotics. Researchers realized that current treatment protocols would need a complete overhaul.",
    question: "What can be inferred about the effectiveness of existing medicine?",
    options: ["It is still the best option", "It will no longer work for this variant", "It will become more powerful", "It was always flawed"],
    correctIndex: 1, distractorType: "Inference Failure"
  },
  {
    id: "kid7-2", grade: 7, skill: "Main Idea", emoji: "🏙️",
    passage: "Urbanization leads to higher economic output but also creates heat islands that raise city temperatures. Sustainable city planning is required to balance growth and environment.",
    question: "What is the complex central idea of the text?",
    options: ["Cities are too hot", "Urbanization is bad for growth", "The need to balance urban growth with sustainability", "Economics vs Nature"],
    correctIndex: 2, distractorType: "Missed Main Idea"
  },
  {
    id: "kid7-3", grade: 7, skill: "Supporting Details", emoji: "🌋",
    passage: "Magma with high silica content is more viscous, trapping gas bubbles which build up immense pressure. This typically leads to explosive eruptions rather than flowing lava.",
    question: "Why do silica-rich volcanoes explode?",
    options: ["They have low viscosity", "Gas bubbles are trapped by viscosity", "They are too hot", "They lack pressure"],
    correctIndex: 1, distractorType: "Wrong Evidence"
  },
  {
    id: "kid7-4", grade: 7, skill: "Fact vs Opinion", emoji: "🤖",
    passage: "Artificial Intelligence can process data faster than humans. It is frightening to think about machines making decisions. AI is used in many industries today.",
    question: "Which sentence expresses an opinion?",
    options: ["AI processes data faster", "It is frightening to think", "AI is used in industries", "Data is processed by humans"],
    correctIndex: 1, distractorType: "Distractor Chosen"
  }
];

// Round-robin per grade
const gradeIndices: Record<number, number> = { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

export function generateProblem(difficulty: Difficulty): Problem {
  const grade = (difficulty + 2) as GradeLevel;
  const pool = BANK.filter(item => item.grade === grade);
  
  // Safety check
  if (pool.length === 0) return generateProblem(1); 

  const idx = gradeIndices[grade] % pool.length;
  const rawItem = pool[idx];
  gradeIndices[grade]++;

  return {
    ...rawItem,
    difficulty,
    tableData: [
      { label: "Meaning Focus", value: 1, displayValue: rawItem.skill },
      { label: "Complexity", value: difficulty * 2, displayValue: "Level " + difficulty }
    ]
  };
}
