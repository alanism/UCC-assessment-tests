
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
  domain: string;
  tableData: TableRow[];
  question: string;
  correctAnswer: number;
  expectedOp: MathOperation;
  hints: string[];
  emoji: string;
}

export interface SessionItem {
  appName: string;
  domain: string;
  schemaName: string;
  hiddenGradeLevel: number;
  tableData: TableRow[];
  questionText: string;
  studentAnswer: number | string;
  correctAnswer: number;
  frameSelected: MathOperation;
  wasCorrect: boolean;
  timeToAnswerMs: number;
  hintsUsed: number;
  difficultyBefore: number;
  difficultyAfter: number;
  timestamp: string;
}

export interface CrystalMemory {
  tablesSeen: string[];
  operationsUsed: MathOperation[];
  mistakes: string[];
  mastered: GradeLevel[];
}

export interface BrainPillars {
  studentName: string;
  reportedGrade: string;
  sessionTimerSeconds: number;
  sessionElapsedMs: number;
  sessionTimeoutReached: boolean;
  crystalMemory: CrystalMemory;
  frameCorrectness: number;
  totalAnswers: number;
  hintsUsed: number;
  speedBonuses: number;
  totalTime: number;
  attempts: number;
  levelHistory: { difficulty: Difficulty; time: number; accuracy: number }[];
  sessionLog: SessionItem[];
}
