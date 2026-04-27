
export type GradeLevel = 3 | 4 | 5 | 6 | 7;
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export enum AriaState {
  Thinking = 'thinking',
  Success = 'success',
  Error = 'error'
}

export enum MathOperation {
  Add = 'Add',
  Subtract = 'Subtract',
  Multiply = 'Multiply',
  Fraction = 'Fraction'
}

export interface TableRow {
  label: string;
  value: number;
  displayValue: string;
}

export interface Problem {
  difficulty: Difficulty;
  grade: GradeLevel;
  title: string;
  tableData: TableRow[];
  question: string;
  correctAnswer: number | string;
  expectedOp: MathOperation;
  hints: string[];
  emoji: string;
}

export interface ItemTelemetry {
  id: number;
  schema: string;
  grade: GradeLevel;
  tableData: TableRow[];
  question: string;
  userInput: string;
  correctAnswer: number | string;
  operation: MathOperation;
  isCorrect: boolean;
  timeTakenMs: number;
  hintsUsed: number;
  difficultyBefore: Difficulty;
  difficultyAfter: Difficulty;
  timestamp: string;
}

export interface CrystalMemory {
  tablesSeen: string[];
  operationsUsed: MathOperation[];
  mistakes: string[];
  mastered: GradeLevel[];
}

export interface SessionMetadata {
  studentName: string;
  reportedGrade: string;
  sessionTimerSeconds: number;
  sessionElapsedMs: number;
  sessionTimeoutReached: boolean;
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
  metadata?: SessionMetadata;
}
