import { Case, EvaluationResult, UserSubmission } from '../types/game';

/**
 * Normalizes an answer string while respecting Java semantics:
 * - Trims external whitespace
 * - If the answer is wrapped in matching double quotes (e.g. "JAVA"), strips them if expected output doesn't require outer quotes
 * - Handles boolean lowercase
 * - Handles exception class short names vs fully qualified names
 */
export function normalizeAnswer(input: string): string {
  if (input === undefined || input === null) return '';
  let str = input.trim();

  // If input is quoted like "hello" but expected might be hello, normalize quotes
  if (str.length >= 2 && str.startsWith('"') && str.endsWith('"')) {
    str = str.substring(1, str.length - 1);
  }

  // Canonicalize standard Java exceptions
  if (str.toLowerCase().includes('stringindexoutofboundsexception')) {
    return 'StringIndexOutOfBoundsException';
  }
  if (str.toLowerCase().includes('nullpointerexception')) {
    return 'NullPointerException';
  }
  if (str.toLowerCase().includes('indexoutofboundsexception')) {
    return 'IndexOutOfBoundsException';
  }

  // Canonicalize boolean
  if (str.toLowerCase() === 'true') return 'true';
  if (str.toLowerCase() === 'false') return 'false';
  if (str.toLowerCase() === 'null') return 'null';

  return str;
}

export function evaluateSubmission(
  caseItem: Case,
  submission: UserSubmission,
  hintsUsedCount: number,
  currentStreak: number
): EvaluationResult {
  let isCorrect = false;

  switch (caseItem.caseType) {
    case 'multiple_choice':
    case 'true_false_reasoning':
    case 'exception_prediction': {
      if (submission.selectedChoiceId) {
        const selected = caseItem.choices?.find((c) => c.id === submission.selectedChoiceId);
        isCorrect = !!selected?.isCorrect;
      } else if (submission.rawAnswer) {
        const norm = normalizeAnswer(submission.rawAnswer);
        const normExpected = normalizeAnswer(caseItem.expectedOutput);
        isCorrect =
          norm === normExpected ||
          caseItem.acceptedAnswers.some((ans) => normalizeAnswer(ans) === norm);
      }
      break;
    }

    case 'find_the_bug': {
      if (submission.selectedLineNumber !== undefined) {
        isCorrect = submission.selectedLineNumber === caseItem.faultyLineNumber;
      } else if (submission.rawAnswer) {
        const num = parseInt(submission.rawAnswer.trim(), 10);
        isCorrect = !isNaN(num) && num === caseItem.faultyLineNumber;
      }
      break;
    }

    case 'choose_fix': {
      if (submission.selectedFixId) {
        const chosen = caseItem.fixOptions?.find((f) => f.id === submission.selectedFixId);
        isCorrect = !!chosen?.isCorrect;
      }
      break;
    }

    case 'output_prediction':
    default: {
      const userNorm = normalizeAnswer(submission.rawAnswer);
      const expectedNorm = normalizeAnswer(caseItem.expectedOutput);

      // Check against canonical expected output
      if (userNorm === expectedNorm) {
        isCorrect = true;
      } else if (caseItem.acceptedAnswers.some((ans) => normalizeAnswer(ans) === userNorm)) {
        isCorrect = true;
      }
      // Also check exact raw match in case quotes were part of canonical output
      else if (submission.rawAnswer.trim() === caseItem.expectedOutput.trim()) {
        isCorrect = true;
      }
      break;
    }
  }

  // Calculate score breakdown
  const difficultyMultiplier = caseItem.difficulty;
  const basePoints = 50 + difficultyMultiplier * 30; // L1: 80 pts, L5: 200 pts

  let hintPenaltyMultiplier = 0;
  if (hintsUsedCount === 1) hintPenaltyMultiplier = 0.15;
  else if (hintsUsedCount === 2) hintPenaltyMultiplier = 0.35;
  else if (hintsUsedCount >= 3) hintPenaltyMultiplier = 0.6;

  const hintPenalty = Math.round(basePoints * hintPenaltyMultiplier);
  const streakBonus = isCorrect ? Math.min(currentStreak * 10, 50) : 0;

  const finalScore = isCorrect ? Math.max(10, basePoints - hintPenalty + streakBonus) : 0;

  const message = isCorrect
    ? 'Correct! Case Solved.'
    : 'Incorrect Answer. Output does not match Java specification.';

  return {
    isCorrect,
    message,
    scoreAwarded: finalScore,
    basePoints,
    hintPenalty,
    streakBonus,
    difficultyMultiplier,
  };
}
