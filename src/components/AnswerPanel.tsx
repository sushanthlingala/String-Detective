import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Case } from '../types/game';

interface AnswerPanelProps {
  currentCase: Case;
  onSubmit: (sub: {
    rawAnswer?: string;
    selectedChoiceId?: string;
    selectedLineNumber?: number;
    selectedFixId?: string;
  }) => void;
  hintsRevealed: number;
  onRevealHint: () => void;
  selectedLineNumber?: number;
  onSelectLineNumber?: (line: number) => void;
  isEvaluating?: boolean;
}

export const AnswerPanel: React.FC<AnswerPanelProps> = ({
  currentCase,
  onSubmit,
  hintsRevealed,
  onRevealHint,
  selectedLineNumber,
  onSelectLineNumber,
  isEvaluating = false,
}) => {
  const [textInput, setTextInput] = useState('');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>('');
  const [selectedFixId, setSelectedFixId] = useState<string>('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (currentCase.caseType === 'output_prediction') {
      if (!textInput.trim()) return;
      onSubmit({ rawAnswer: textInput });
    } else if (
      currentCase.caseType === 'multiple_choice' ||
      currentCase.caseType === 'true_false_reasoning' ||
      currentCase.caseType === 'exception_prediction'
    ) {
      if (!selectedChoiceId) return;
      onSubmit({ selectedChoiceId });
    } else if (currentCase.caseType === 'find_the_bug') {
      if (!selectedLineNumber) return;
      onSubmit({ selectedLineNumber });
    } else if (currentCase.caseType === 'choose_fix') {
      if (!selectedFixId) return;
      onSubmit({ selectedFixId });
    }
  };

  const handleChipClick = (value: string) => {
    setTextInput(value);
  };

  const linesCount = currentCase.codeSnippet.split('\n').length;

  return (
    <div className="theme-panel border rounded-xl p-4 shadow-sm flex flex-col gap-4">
      {/* Header with Case Type prompt - No decorative icon beside it */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b theme-border-subtle pb-3">
        <span className="text-xs font-mono font-bold tracking-wider uppercase theme-text-primary">
          {currentCase.caseType === 'output_prediction' && 'Enter Your Answer Below'}
          {currentCase.caseType === 'find_the_bug' && 'Select Faulty Line'}
          {currentCase.caseType === 'choose_fix' && 'Select Correct Code Fix'}
          {currentCase.caseType === 'multiple_choice' && 'Choose the Correct Option'}
          {currentCase.caseType === 'true_false_reasoning' && 'True / False Evaluation'}
          {currentCase.caseType === 'exception_prediction' && 'Predict Runtime Exception'}
        </span>

        {/* Progressive Hint Button - Hint icon preserved */}
        <div className="flex items-center gap-2">
          {hintsRevealed < 3 ? (
            <button
              type="button"
              onClick={onRevealHint}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg theme-hint-btn border transition cursor-pointer"
              title="Reveal progressive hint"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Hint ({hintsRevealed}/3)</span>
            </button>
          ) : (
            <span className="text-xs font-mono theme-text-secondary px-2.5 py-1 rounded theme-subpanel">
              All 3 hints unlocked
            </span>
          )}
        </div>
      </div>

      {/* Hints Display Area */}
      {hintsRevealed > 0 && (
        <div className="theme-hint-box border rounded-lg p-3 space-y-2 text-xs">
          <div className="font-mono font-semibold text-[11px] theme-hint-title">
            HINTS:
          </div>
          {currentCase.hints.slice(0, hintsRevealed).map((hint, idx) => (
            <div key={idx} className="flex items-start gap-2 font-mono text-xs theme-text-primary">
              <span className="font-bold opacity-80">#{idx + 1}:</span>
              <span>{hint}</span>
            </div>
          ))}
        </div>
      )}

      {/* CASE TYPE 1: Output Prediction (Console Input) */}
      {currentCase.caseType === 'output_prediction' && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs theme-text-secondary font-mono">
              Predict exact console output:
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono theme-text-secondary font-bold select-none text-sm">
                &gt;
              </span>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. true, JAVA, 4, [A-B-C]"
                className="w-full pl-8 pr-4 py-2.5 theme-input border rounded-lg font-mono text-sm focus:outline-none"
                autoFocus
              />
            </div>
            <p className="text-[11px] theme-text-muted">
              Surrounding quotes are optional. Case-sensitivity and internal whitespace are preserved.
            </p>
          </div>

          {/* Common Values */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] theme-text-secondary font-mono mr-1">Common Values:</span>
            {['true', 'false', 'null', '""', '0', '1', '-1', 'StringIndexOutOfBoundsException'].map(
              (token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => handleChipClick(token === '""' ? '' : token)}
                  className="px-2 py-0.5 text-[11px] font-mono theme-chip rounded border transition cursor-pointer"
                >
                  {token}
                </button>
              )
            )}
          </div>

          {/* Submit Button - No send symbol beside text */}
          <button
            type="submit"
            disabled={!textInput.trim() || isEvaluating}
            className="w-full py-2.5 px-4 theme-btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-sm cursor-pointer"
          >
            Submit Answer
          </button>
        </form>
      )}

      {/* CASE TYPE 2: Multiple Choice / True False / Exception Prediction */}
      {(currentCase.caseType === 'multiple_choice' ||
        currentCase.caseType === 'true_false_reasoning' ||
        currentCase.caseType === 'exception_prediction') && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentCase.choices?.map((choice, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedChoiceId === choice.id;

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => setSelectedChoiceId(choice.id)}
                  className={`p-3 rounded-lg border text-left flex items-start gap-3 transition cursor-pointer ${
                    isSelected ? 'theme-choice-selected' : 'theme-choice-inactive'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 ${
                      isSelected ? 'theme-choice-letter-active' : 'theme-choice-letter-inactive'
                    }`}
                  >
                    {letter}
                  </span>
                  <div className="text-xs font-mono leading-relaxed pt-0.5 theme-text-primary">
                    {choice.text}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedChoiceId || isEvaluating}
            className="w-full py-2.5 px-4 theme-btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-sm cursor-pointer"
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* CASE TYPE 3: Find the Bug (Line selection) */}
      {currentCase.caseType === 'find_the_bug' && (
        <div className="space-y-3">
          <div className="theme-subpanel p-3 rounded-lg border space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="theme-text-primary font-medium">Select Faulty Line Number:</span>
              <span className="theme-text-secondary font-bold">
                {selectedLineNumber ? `Line ${selectedLineNumber} Selected` : 'None Selected'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: linesCount }, (_, i) => i + 1).map((lineNum) => {
                const isSelected = selectedLineNumber === lineNum;
                return (
                  <button
                    key={lineNum}
                    type="button"
                    onClick={() => onSelectLineNumber && onSelectLineNumber(lineNum)}
                    className={`px-3 py-1 text-xs font-mono rounded transition cursor-pointer border ${
                      isSelected ? 'theme-line-btn-selected' : 'theme-line-btn-inactive'
                    }`}
                  >
                    L{lineNum}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] theme-text-muted pt-1">
              Tip: You can also click directly on code lines in the editor above.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedLineNumber || isEvaluating}
            className="w-full py-2.5 px-4 theme-btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-sm cursor-pointer"
          >
            Select Line
          </button>
        </div>
      )}

      {/* CASE TYPE 4: Choose Fix (Code Patch Options) */}
      {currentCase.caseType === 'choose_fix' && (
        <div className="space-y-3">
          <div className="space-y-2">
            {currentCase.fixOptions?.map((fix, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedFixId === fix.id;

              return (
                <div
                  key={fix.id}
                  onClick={() => setSelectedFixId(fix.id)}
                  className={`p-3 rounded-lg border text-left transition cursor-pointer space-y-1.5 ${
                    isSelected ? 'theme-fix-selected' : 'theme-fix-inactive'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-bold ${
                        isSelected ? 'theme-choice-letter-active' : 'theme-choice-letter-inactive'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs font-semibold theme-text-primary">{fix.label}</span>
                  </div>
                  <pre className="theme-code-patch px-2 py-1 rounded text-xs font-mono border overflow-x-auto">
                    <code>{fix.codeSnippet}</code>
                  </pre>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFixId || isEvaluating}
            className="w-full py-2.5 px-4 theme-btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-sm cursor-pointer"
          >
            Apply Selected Fix
          </button>
        </div>
      )}
    </div>
  );
};
