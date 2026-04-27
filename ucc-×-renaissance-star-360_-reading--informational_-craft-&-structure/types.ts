
export type GradeLevel = 3 | 4 | 5 | 6 | 7;
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export enum AriaState {
  Thinking = 'thinking',
  Success = 'success',
  Error = 'error'
}

export type ReadingSkill =
  | "text-structure"
  | "paragraph-role"
  | "author-purpose"
  | "signal-words"
  | "heading-function";

export type StructureType =
  | "cause-effect"
  | "problem-solution"
  | "sequence"
  | "compare-contrast"
  | "argument";

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
  structure: StructureType;
  skill: ReadingSkill;
  authorPurpose: string;
  emoji: string;
}

export interface Problem extends ReadingItem {
  difficulty: Difficulty;
  tableData: TableRow[]; // Kept for EmojiViz compatibility
}

export interface ItemTelemetry {
  id: string;
  grade: GradeLevel;
  structure: StructureType;
  skill: ReadingSkill;
  authorPurpose: string;
  correctIndex: number;
  selectedIndex: number;
  isCorrect: boolean;
  timeMs: number;
  difficultyBefore: Difficulty;
  difficultyAfter: Difficulty;
  timestamp: string;
}

export interface CrystalMemory {
  tablesSeen: string[];
  operationsUsed: string[]; // Store skills here
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
