
export type GradeLevel = 3 | 4 | 5 | 6 | 7;
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export enum AriaState {
  Thinking = 'thinking',
  Success = 'success',
  Error = 'error'
}

export type ReadingLens = "MAIN_IDEA" | "KEY_DETAIL" | "INFERENCE";

export type DistractorLogic = 
  | 'LITERAL_TRAP' 
  | 'EMOTION_TRAP' 
  | 'PLOT_TRAP' 
  | 'STRUCTURE_TRUTH';

export interface TableRow {
  label: string;
  value: number | string;
  displayValue: string;
}

export interface ReadingProblem {
  id: string;
  gradeMeta: GradeLevel;
  difficulty: Difficulty;
  lens: ReadingLens;
  passage: string;
  question: string;
  choices: string[];
  correctIndex: number;
  emoji: string;
}

export interface Problem extends ReadingProblem {
  tableData: TableRow[]; 
}

export interface ItemTelemetry {
  id: string;
  gradeMeta: GradeLevel;
  difficulty: Difficulty;
  lens: ReadingLens;
  isCorrect: boolean;
  timeMs: number;
  chosenIndex: number;
  correctIndex: number;
  difficultyBefore: Difficulty;
  difficultyAfter: Difficulty;
  timestamp: string;
  passage: string;
  question: string;
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
