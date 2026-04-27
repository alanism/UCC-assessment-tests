
export type GradeLevel = 3 | 4 | 5 | 6 | 7;
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export enum AriaState {
  Thinking = 'thinking',
  Success = 'success',
  Error = 'error'
}

export type VocabChannel = 'definition' | 'context' | 'contrast' | 'morphology';

export type DistractorType = 
  | 'near_synonym' 
  | 'category_error' 
  | 'antonym_trap' 
  | 'sound_alike' 
  | 'root_confusion' 
  | 'none';

export interface TableRow {
  label: string;
  value: number | string;
  displayValue: string;
}

export interface VocabItem {
  id: string;
  grade: GradeLevel;
  difficulty: Difficulty;
  channel: VocabChannel;
  stem: string;
  choices: string[];
  correctIndex: number;
  rationale: string;
  skillTag: string;
  distractorType: DistractorType;
  emoji: string;
}

export interface Problem extends VocabItem {
  tableData: TableRow[]; 
}

export interface ItemTelemetry {
  id: string;
  grade: GradeLevel;
  difficulty: Difficulty;
  channel: VocabChannel;
  skillTag: string;
  distractorType: DistractorType;
  isCorrect: boolean;
  timeMs: number;
  chosenIndex: number;
  correctIndex: number;
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
