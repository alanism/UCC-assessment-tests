
export type GradeLevel = 3 | 4 | 5 | 6 | 7;
// Complexity levels 0-8 as per the 9-step ladder
export type ComplexityLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ComplexityVector = {
  lex: number;      // vocabulary difficulty
  syntax: number;   // sentence structure
  concept: number;  // abstractness / causal depth
  domain: number;   // genre shift (narrative -> science -> history)
  discourse: number; // linear -> argumentative -> technical
};

export enum AriaState {
  Thinking = 'thinking',
  Success = 'success',
  Error = 'error'
}

export type ReadingLens = "MAIN_IDEA" | "KEY_DETAIL" | "INFERENCE";

export interface TableRow {
  label: string;
  value: number | string;
  displayValue: string;
}

export interface ReadingProblem {
  id: string;
  gradeMeta: GradeLevel;
  complexity: ComplexityVector;
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
  complexity: ComplexityVector;
  complexityLevel: number;
  lens: ReadingLens;
  isCorrect: boolean;
  timeMs: number;
  chosenIndex: number;
  correctIndex: number;
  timestamp: string;
  passage: string;
  question: string;
}

export interface BrainPillars {
  totalAnswers: number;
  attempts: number;
  itemLog: ItemTelemetry[];
  levelHistory: { level: number; time: number; accuracy: number }[];
}
