export type CaseType =
  | 'output_prediction'
  | 'multiple_choice'
  | 'find_the_bug'
  | 'choose_fix'
  | 'exception_prediction'
  | 'true_false_reasoning';

export type ConceptId =
  | 'immutability'
  | 'equality'
  | 'string_pool'
  | 'indexing'
  | 'methods'
  | 'concatenation'
  | 'string_builder'
  | 'escapes_nulls'
  | 'compare_to'
  | 'precedence'
  | 'loops_traversal'
  | 'edge_cases';

export interface ConceptMeta {
  id: ConceptId;
  name: string;
  tagline: string;
  levelRange: [number, number]; // e.g. [1, 5]
  mysteryDossier: string;
  goldenRule: string;
  traps: string[];
  exampleCode: string;
  explanation: string;
}

export interface FixOption {
  id: string;
  label: string;
  codeSnippet: string;
  isCorrect: boolean;
  why: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface Case {
  id: string;
  caseNumber: number;
  fingerprint: string;
  title: string;
  difficulty: number; // 1 to 5
  primaryConcept: ConceptId;
  secondaryConcepts?: ConceptId[];
  caseType: CaseType;
  mysteryStory: string;
  codeSnippet: string;
  faultyLineNumber?: number; // 1-indexed line number for find_the_bug
  expectedOutput: string; // canonical string (e.g. "JAVA", "true", "StringIndexOutOfBoundsException")
  acceptedAnswers: string[]; // normalized variations accepted
  choices?: ChoiceOption[]; // for multiple_choice, true_false, exception_prediction
  fixOptions?: FixOption[]; // for choose_fix
  hints: [string, string, string]; // 3 progressive hints
  autopsy: {
    verdictSummary: string;
    lineByLineNotes: { line: number; note: string }[];
    deepDive: string;
    correctedCodeSnippet?: string;
  };
}

export interface UserSubmission {
  rawAnswer: string;
  selectedChoiceId?: string;
  selectedLineNumber?: number;
  selectedFixId?: string;
  timestamp: number;
}

export interface EvaluationResult {
  isCorrect: boolean;
  message: string;
  scoreAwarded: number;
  basePoints: number;
  hintPenalty: number;
  streakBonus: number;
  difficultyMultiplier: number;
}

export interface SessionStats {
  casesAttempted: number;
  casesSolved: number;
  totalScore: number;
  currentStreak: number;
  maxStreak: number;
  hintsUsedTotal: number;
  conceptPerformance: Record<ConceptId, { attempted: number; solved: number; mistakes: number }>;
}

export interface CaseHistoryItem {
  caseItem: Case;
  submission: UserSubmission;
  isCorrect: boolean;
  scoreAwarded: number;
  hintsUsed: number;
  solvedAt: number;
}
