import React, { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { Header } from './components/Header';
import { DifficultySlider } from './components/DifficultySlider';
import { ConceptFilterBar } from './components/ConceptFilterBar';
import { CaseCardHeader } from './components/CaseCardHeader';
import { CodeViewer } from './components/CodeViewer';
import { AnswerPanel } from './components/AnswerPanel';
import { VerdictPanel } from './components/VerdictPanel';
import { ReferenceModal } from './components/ReferenceModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SessionReportModal } from './components/SessionReportModal';
import { RecapModal } from './components/RecapModal';
import { AssignmentModal } from './components/AssignmentModal';
import { ConceptId } from './types/game';

export default function App() {
  const {
    difficulty,
    conceptFilter,
    caseNumber,
    currentCase,
    userSubmission,
    evaluation,
    hintsRevealed,
    hasRevealedAnswer,
    showCorrectedSnippet,
    sessionStats,
    caseHistory,
    weakConcepts,
    nextCase,
    changeDifficulty,
    changeConceptFilter,
    submitAnswer,
    revealHint,
    revealAnswer,
    retryCase,
    restartSession,
    setShowCorrectedSnippet,
  } = useGameState();

  // Dark and Light Mode Theme State (Ink Wash light theme vs Dark theme)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('string_detective_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches
      ) {
        return 'light';
      }
    }
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('string_detective_theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  // Modals state
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [referenceConcept, setReferenceConcept] = useState<ConceptId | undefined>(undefined);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Line selection state for find_the_bug
  const [selectedLineNumber, setSelectedLineNumber] = useState<number | undefined>(undefined);

  // Reset selectedLineNumber when currentCase changes
  useEffect(() => {
    setSelectedLineNumber(undefined);
  }, [currentCase.id]);

  const handleOpenConceptDossier = (conceptId: ConceptId) => {
    setReferenceConcept(conceptId);
    setIsReferenceOpen(true);
  };

  return (
    <div className="min-h-screen theme-canvas flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <Header
        stats={sessionStats}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onOpenReference={() => {
          setReferenceConcept(currentCase.primaryConcept);
          setIsReferenceOpen(true);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onRestartSession={restartSession}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Controls Section: Difficulty Slider & Concept Filter */}
        <div className="space-y-3">
          <DifficultySlider
            difficulty={difficulty}
            onDifficultyChange={changeDifficulty}
          />

          <ConceptFilterBar
            currentFilter={conceptFilter}
            onFilterChange={changeConceptFilter}
            weakConceptsCount={weakConcepts.length}
            onNewCase={() => nextCase()}
          />
        </div>

        {/* Case Investigation Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left/Main Column: Case Brief & Code Viewer (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <CaseCardHeader
              currentCase={currentCase}
              onOpenConceptManual={handleOpenConceptDossier}
            />

            <CodeViewer
              code={currentCase.codeSnippet}
              isFindBugCase={currentCase.caseType === 'find_the_bug' && !evaluation}
              selectedLineNumber={selectedLineNumber}
              onSelectLineNumber={setSelectedLineNumber}
              faultyLineNumber={evaluation ? currentCase.faultyLineNumber : undefined}
            />
          </div>

          {/* Right Column: Evidence Submission or Forensic Verdict (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-4">
            {!evaluation ? (
              <AnswerPanel
                currentCase={currentCase}
                onSubmit={submitAnswer}
                hintsRevealed={hintsRevealed}
                onRevealHint={revealHint}
                selectedLineNumber={selectedLineNumber}
                onSelectLineNumber={setSelectedLineNumber}
              />
            ) : (
              <VerdictPanel
                currentCase={currentCase}
                userSubmission={userSubmission!}
                evaluation={evaluation}
                hintsRevealed={hintsRevealed}
                hasRevealedAnswer={hasRevealedAnswer}
                showCorrectedSnippet={showCorrectedSnippet}
                onToggleCorrectedSnippet={() =>
                  setShowCorrectedSnippet((prev) => !prev)
                }
                onNextCase={() => nextCase()}
                onRetry={retryCase}
                onRevealAnswer={revealAnswer}
              />
            )}

            {/* Recap Card - Clickable to open full fundamentals recap modal */}
            <div
              onClick={() => setIsRecapOpen(true)}
              className="theme-subpanel border rounded-xl p-3 text-xs font-mono transition cursor-pointer hover:border-[#6D8196] group shadow-xs"
              title="Click to view comprehensive Java Strings fundamentals recap"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[11px] theme-recap-badge tracking-wider uppercase">
                  RECAP
                </span>
                <span className="text-[10px] theme-text-secondary group-hover:underline">
                  View Fundamentals →
                </span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] theme-text-secondary">
                <li>Strings are immutable: methods return new strings; variables must be reassigned.</li>
                <li><code className="theme-code-inline font-bold">==</code> compares heap memory addresses; <code className="theme-code-inline font-bold">.equals()</code> checks contents.</li>
                <li>String literals are cached in String Pool; <code className="theme-code-inline font-bold">new String()</code> forces separate heap allocation.</li>
                <li><code className="theme-code-inline font-bold">substring(begin, end)</code> is exclusive of end index.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Clickable text opening Assignment modal */}
      <footer className="border-t theme-footer py-4 px-4 text-center text-xs font-mono transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span
            onClick={() => setIsAssignmentModalOpen(true)}
            className="cursor-pointer theme-text-secondary hover:theme-text-primary hover:underline transition select-none tracking-wider font-semibold"
            title="Click to view OOP Illustration Assignment details"
          >
            SE24UCSE168 - SUSHANTH LINGALA - STRING DETECTIVE
          </span>
        </div>
      </footer>

      {/* Reference Concept Manual Modal */}
      <ReferenceModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
        initialConcept={referenceConcept}
      />

      {/* Case History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={caseHistory}
        onReviewCase={() => {
          setIsHistoryOpen(false);
        }}
      />

      {/* Session Stats Report Modal */}
      <SessionReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        stats={sessionStats}
        onPracticeConcept={(cId) => {
          changeConceptFilter(cId);
        }}
        onPracticeWeakAreas={() => {
          changeConceptFilter('weak_areas');
        }}
      />

      {/* Java Strings Fundamentals Recap Modal */}
      <RecapModal
        isOpen={isRecapOpen}
        onClose={() => setIsRecapOpen(false)}
      />

      {/* Assignment Illustration Details Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
      />
    </div>
  );
}
