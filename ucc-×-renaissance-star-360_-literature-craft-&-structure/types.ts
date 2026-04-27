
export type GradeLevel = 3 | 4 | 5 | 6 | 7;
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export enum AriaState {
  Thinking = 'thinking',
  Success = 'success',
  Error = 'error'
}

export type LiteratureLens = 'NARRATOR' | 'TONE' | 'FIGURATIVE' | 'STRUCTURE' | 'AUTHOR_INTENT';

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

export interface LiteratureItem {
  id: string;
  gradeMeta: GradeLevel;
  difficulty: Difficulty;
  lens: LiteratureLens;
  passage: string;
  question: string;
  choices: string[];
  correctIndex: number;
  distractorLogicByOption: DistractorLogic[];
  emoji: string;
}

export interface Problem extends LiteratureItem {
  tableData: TableRow[]; 
}

export interface ItemTelemetry {
  id: string;
  gradeMeta: GradeLevel;
  difficulty: Difficulty;
  lens: LiteratureLens;
  isCorrect: boolean;
  timeMs: number;
  chosenIndex: number;
  correctIndex: number;
  distractorLogic: DistractorLogic;
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
