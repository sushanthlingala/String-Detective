import { useState, useEffect, useCallback } from 'react';
import {
  Case,
  ConceptId,
  EvaluationResult,
  SessionStats,
  UserSubmission,
  CaseHistoryItem,
} from '../types/game';
import { generateCase } from '../engine/generator';
import { evaluateSubmission } from '../engine/evaluator';

const STORAGE_KEY_STATS = 'string_detective_stats_v1';
const STORAGE_KEY_PREFS = 'string_detective_prefs_v1';

const INITIAL_STATS: SessionStats = {
  casesAttempted: 0,
  casesSolved: 0,
  totalScore: 0,
  currentStreak: 0,
  maxStreak: 0,
  hintsUsedTotal: 0,
  conceptPerformance: {
    immutability: { attempted: 0, solved: 0, mistakes: 0 },
    equality: { attempted: 0, solved: 0, mistakes: 0 },
    string_pool: { attempted: 0, solved: 0, mistakes: 0 },
    indexing: { attempted: 0, solved: 0, mistakes: 0 },
    methods: { attempted: 0, solved: 0, mistakes: 0 },
    concatenation: { attempted: 0, solved: 0, mistakes: 0 },
    string_builder: { attempted: 0, solved: 0, mistakes: 0 },
    escapes_nulls: { attempted: 0, solved: 0, mistakes: 0 },
    compare_to: { attempted: 0, solved: 0, mistakes: 0 },
    precedence: { attempted: 0, solved: 0, mistakes: 0 },
    loops_traversal: { attempted: 0, solved: 0, mistakes: 0 },
    edge_cases: { attempted: 0, solved: 0, mistakes: 0 },
  },
};

export function useGameState() {
  const [difficulty, setDifficulty] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.difficulty === 'number' && parsed.difficulty >= 1 && parsed.difficulty <= 5) {
          return parsed.difficulty;
        }
      }
    } catch {}
    return 2;
  });

  const [conceptFilter, setConceptFilter] = useState<ConceptId | 'all' | 'weak_areas'>('all');
  const [caseNumber, setCaseNumber] = useState<number>(1);
  const [recentFingerprints, setRecentFingerprints] = useState<string[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.totalScore === 'number') {
          return { ...INITIAL_STATS, ...parsed };
        }
      }
    } catch {}
    return INITIAL_STATS;
  });

  const [caseHistory, setCaseHistory] = useState<CaseHistoryItem[]>([]);

  // Current case state
  const [currentCase, setCurrentCase] = useState<Case>(() => {
    return generateCase({
      difficulty: 2,
      conceptFilter: 'all',
      caseNumber: 1,
      recentFingerprints: [],
    });
  });

  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [userSubmission, setUserSubmission] = useState<UserSubmission | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [hasRevealedAnswer, setHasRevealedAnswer] = useState<boolean>(false);
  const [showCorrectedSnippet, setShowCorrectedSnippet] = useState<boolean>(false);
  const [caseAlreadyScored, setCaseAlreadyScored] = useState<boolean>(false);

  // Derive weak concepts
  const getWeakConcepts = useCallback((): ConceptId[] => {
    const perf = sessionStats.conceptPerformance;
    const candidates: { id: ConceptId; errorRate: number }[] = [];

    for (const [key, val] of Object.entries(perf) as [ConceptId, { attempted: number; solved: number; mistakes: number }][]) {
      if (val.attempted > 0) {
        const errorRate = val.mistakes / val.attempted;
        if (errorRate > 0.3) {
          candidates.push({ id: key, errorRate });
        }
      }
    }

    candidates.sort((a, b) => b.errorRate - a.errorRate);
    return candidates.map((c) => c.id);
  }, [sessionStats]);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify({ difficulty }));
    } catch {}
  }, [difficulty]);

  // Persist session stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(sessionStats));
    } catch {}
  }, [sessionStats]);

  // New Case helper
  const nextCase = useCallback(
    (customDiff?: number, customConcept?: ConceptId | 'all' | 'weak_areas') => {
      const targetDiff = customDiff !== undefined ? customDiff : difficulty;
      const targetConcept = customConcept !== undefined ? customConcept : conceptFilter;
      const nextNum = caseNumber + 1;
      setCaseNumber(nextNum);

      const weakConcepts = getWeakConcepts();
      const newCase = generateCase({
        difficulty: targetDiff,
        conceptFilter: targetConcept,
        caseNumber: nextNum,
        recentFingerprints,
        weakConcepts,
      });

      setCurrentCase(newCase);
      setHintsRevealed(0);
      setUserSubmission(null);
      setEvaluation(null);
      setHasRevealedAnswer(false);
      setShowCorrectedSnippet(false);
      setCaseAlreadyScored(false);

      setRecentFingerprints((prev) => [...prev.slice(-15), newCase.fingerprint]);
    },
    [difficulty, conceptFilter, caseNumber, recentFingerprints, getWeakConcepts]
  );

  // Difficulty change
  const changeDifficulty = useCallback(
    (level: number) => {
      const clamped = Math.max(1, Math.min(5, level));
      setDifficulty(clamped);
      nextCase(clamped, conceptFilter);
    },
    [conceptFilter, nextCase]
  );

  // Concept filter change
  const changeConceptFilter = useCallback(
    (newFilter: ConceptId | 'all' | 'weak_areas') => {
      setConceptFilter(newFilter);
      nextCase(difficulty, newFilter);
    },
    [difficulty, nextCase]
  );

  // Submit Answer
  const submitAnswer = useCallback(
    (sub: {
      rawAnswer?: string;
      selectedChoiceId?: string;
      selectedLineNumber?: number;
      selectedFixId?: string;
    }) => {
      const submission: UserSubmission = {
        rawAnswer: sub.rawAnswer || '',
        selectedChoiceId: sub.selectedChoiceId,
        selectedLineNumber: sub.selectedLineNumber,
        selectedFixId: sub.selectedFixId,
        timestamp: Date.now(),
      };

      setUserSubmission(submission);

      const result = evaluateSubmission(
        currentCase,
        submission,
        hintsRevealed,
        sessionStats.currentStreak
      );

      setEvaluation(result);

      // Only update scores and stats if this case hasn't been scored yet (prevents inflation on retries)
      if (!caseAlreadyScored) {
        setCaseAlreadyScored(true);

        setSessionStats((prev) => {
          const isCorrect = result.isCorrect;
          const newAttempted = prev.casesAttempted + 1;
          const newSolved = prev.casesSolved + (isCorrect ? 1 : 0);
          const newScore = prev.totalScore + result.scoreAwarded;
          const newStreak = isCorrect ? prev.currentStreak + 1 : 0;
          const newMaxStreak = Math.max(prev.maxStreak, newStreak);
          const newHintsTotal = prev.hintsUsedTotal + hintsRevealed;

          const conceptId = currentCase.primaryConcept;
          const currentConceptPerf = prev.conceptPerformance[conceptId] || {
            attempted: 0,
            solved: 0,
            mistakes: 0,
          };

          const updatedConceptPerf = {
            ...prev.conceptPerformance,
            [conceptId]: {
              attempted: currentConceptPerf.attempted + 1,
              solved: currentConceptPerf.solved + (isCorrect ? 1 : 0),
              mistakes: currentConceptPerf.mistakes + (isCorrect ? 0 : 1),
            },
          };

          return {
            casesAttempted: newAttempted,
            casesSolved: newSolved,
            totalScore: newScore,
            currentStreak: newStreak,
            maxStreak: newMaxStreak,
            hintsUsedTotal: newHintsTotal,
            conceptPerformance: updatedConceptPerf,
          };
        });

        // Add to history
        setCaseHistory((prev) => [
          {
            caseItem: currentCase,
            submission,
            isCorrect: result.isCorrect,
            scoreAwarded: result.scoreAwarded,
            hintsUsed: hintsRevealed,
            solvedAt: Date.now(),
          },
          ...prev,
        ]);
      }
    },
    [currentCase, hintsRevealed, sessionStats.currentStreak, caseAlreadyScored]
  );

  // Reveal next progressive hint
  const revealHint = useCallback(() => {
    if (hintsRevealed < 3) {
      setHintsRevealed((prev) => prev + 1);
    }
  }, [hintsRevealed]);

  // Reveal answer manually
  const revealAnswer = useCallback(() => {
    setHasRevealedAnswer(true);
  }, []);

  // Retry case after incorrect submission
  const retryCase = useCallback(() => {
    setUserSubmission(null);
    setEvaluation(null);
  }, []);

  // Restart entire session
  const restartSession = useCallback(() => {
    setSessionStats(INITIAL_STATS);
    setCaseHistory([]);
    setRecentFingerprints([]);
    setCaseNumber(1);
    try {
      localStorage.removeItem(STORAGE_KEY_STATS);
    } catch {}

    const freshCase = generateCase({
      difficulty,
      conceptFilter,
      caseNumber: 1,
      recentFingerprints: [],
    });
    setCurrentCase(freshCase);
    setHintsRevealed(0);
    setUserSubmission(null);
    setEvaluation(null);
    setHasRevealedAnswer(false);
    setShowCorrectedSnippet(false);
    setCaseAlreadyScored(false);
  }, [difficulty, conceptFilter]);

  return {
    difficulty,
    conceptFilter,
    caseNumber,
    currentCase,
    userSubmission,
    evaluation,
    hintsRevealed,
    hasRevealedAnswer,
    showCorrectedSnippet,
    caseAlreadyScored,
    sessionStats,
    caseHistory,
    weakConcepts: getWeakConcepts(),
    // Actions
    nextCase,
    changeDifficulty,
    changeConceptFilter,
    submitAnswer,
    revealHint,
    revealAnswer,
    retryCase,
    restartSession,
    setShowCorrectedSnippet,
  };
}
