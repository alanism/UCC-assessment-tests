
export type GradeLevel = 3 | 4 | 5 | 6 | 7;
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export enum AriaState {
  Thinking = 'thinking',
  Success = 'success',
  Error = 'error'
}

export type ReadingSkill =
  | "Main Idea"
  | "Supporting Details"
  | "Inference"
  | "Fact vs Opinion";

export type ErrorType =
  | "Missed Main Idea"
  | "Wrong Evidence"
  | "Inference Failure"
  | "Distractor Chosen"
  | "None";

export interface TableRow {
  label: string;
  value: number;
  displayValue: string;
}

export interface ReadingItem {
  id: string;
  grade: GradeLevel;
  passage: string;
  question: string;
  options: string[];
  correctIndex: number;
  skill: ReadingSkill;
  distractorType: ErrorType;
  emoji: string;
}

export interface Problem extends ReadingItem {
  difficulty: Difficulty;
  tableData: TableRow[]; 
}

export interface ItemTelemetry {
  id: string;
  grade: GradeLevel;
  passage: string;
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  skill: ReadingSkill;
  errorType: ErrorType;
  timeMs: number;
  difficultyBefore: Difficulty;
  difficultyAfter: Difficulty;
  timestamp: string;
}

export interface CrystalMemory {
  tablesSeen: string[];
  operationsUsed: string[]; 
  mistakes: string[];
  mastered: GradeLevel[];
}

export interface BrainPillars {
  crystalMemory: CrystalMemory;
  frameCorrectness: number;
  totalAnswers: number;
  hintsUsed: number;
  speedBonuses: number;
  totalTime: number;
  attempts: number;
  levelHistory: { difficulty: Difficulty; time: number; accuracy: number }[];
  itemLog: ItemTelemetry[];
}
