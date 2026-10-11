import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Eye,
  Award,
} from 'lucide-react';
import { Case, EvaluationResult, UserSubmission } from '../types/game';

interface VerdictPanelProps {
  currentCase: Case;
  userSubmission: UserSubmission;
  evaluation: EvaluationResult;
  hintsRevealed: number;
  hasRevealedAnswer: boolean;
  showCorrectedSnippet: boolean;
  onToggleCorrectedSnippet: () => void;
  onNextCase: () => void;
  onRetry: () => void;
  onRevealAnswer: () => void;
}

export const VerdictPanel: React.FC<VerdictPanelProps> = ({
  currentCase,
  userSubmission,
  evaluation,
  hintsRevealed,
  hasRevealedAnswer,
  showCorrectedSnippet,
  onToggleCorrectedSnippet,
  onNextCase,
  onRetry,
  onRevealAnswer,
}) => {
  const isCorrect = evaluation.isCorrect;

  return (
    <div
      className={`border rounded-xl p-5 shadow-sm space-y-4 transition ${
        isCorrect ? 'theme-verdict-correct' : 'theme-verdict-incorrect'
      }`}
    >
      {/* Verdict Header Stamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b theme-border-subtle">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center border ${
              isCorrect
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-500 border-rose-500/30'
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded tracking-wider border ${
                  isCorrect
                    ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25'
                    : 'bg-rose-500/15 text-rose-500 border-rose-500/25'
                }`}
              >
                {isCorrect ? 'CORRECT' : 'INCORRECT'}
              </span>
              <span className="text-xs theme-text-secondary font-mono">
                Case #{currentCase.caseNumber}
              </span>
            </div>
            <h3 className="text-base font-bold theme-text-primary font-mono mt-0.5">
              {evaluation.message}
            </h3>
          </div>
        </div>

        {/* Score Breakdown Badge */}
        {isCorrect ? (
          <div className="flex items-center gap-2 theme-subpanel border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono">
            <Award className="w-4 h-4 text-emerald-500" />
            <span className="theme-text-secondary">Awarded:</span>
            <span className="text-emerald-500 font-bold text-sm">
              +{evaluation.scoreAwarded} PTS
            </span>
            <span className="theme-text-muted text-[10px]">
              (Base {evaluation.basePoints}
              {evaluation.hintPenalty > 0 ? ` - Hints ${evaluation.hintPenalty}` : ''}
              {evaluation.streakBonus > 0 ? ` + Streak ${evaluation.streakBonus}` : ''})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 theme-subpanel border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-mono theme-text-secondary">
            <span>Score: +0 PTS</span>
            <span className="text-rose-500 text-[11px]">(Streak Reset)</span>
          </div>
        )}
      </div>

      {/* Answer Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="theme-subpanel p-3 rounded-lg border">
          <span className="theme-text-secondary block mb-1">Your Submitted Answer:</span>
          <span
            className={`font-semibold ${
              isCorrect ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {userSubmission.rawAnswer ||
              (userSubmission.selectedLineNumber !== undefined
                ? `Line ${userSubmission.selectedLineNumber}`
                : userSubmission.selectedChoiceId || userSubmission.selectedFixId || 'None')}
          </span>
        </div>

        <div className="theme-subpanel p-3 rounded-lg border">
          <span className="theme-text-secondary block mb-1">Expected Output:</span>
          <span className="font-semibold text-amber-500">{currentCase.expectedOutput}</span>
        </div>
      </div>

      {/* Explanation Section */}
      <div className="theme-subpanel border rounded-lg p-4 space-y-3 text-xs font-mono">
        <div className="flex items-center gap-2 font-bold border-b theme-border-subtle pb-2 theme-text-primary">
          <span>EXPLANATION & LINE-BY-LINE BREAKDOWN:</span>
        </div>

        <p className="theme-text-primary leading-relaxed text-[13px]">
          {currentCase.autopsy.verdictSummary}
        </p>

        {/* Line by line notes */}
        {currentCase.autopsy.lineByLineNotes?.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="theme-text-secondary text-[11px] block font-semibold uppercase tracking-wider">
              Line-by-Line Execution Trace:
            </span>
            <div className="space-y-1">
              {currentCase.autopsy.lineByLineNotes.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 theme-trace-item p-2 rounded">
                  <span className="font-bold select-none text-amber-500">L{item.line}:</span>
                  <span className="theme-text-primary text-xs">{item.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 theme-text-secondary text-xs border-t theme-border-subtle">
          <span className="font-semibold theme-text-primary">Concept Note: </span>
          <span>{currentCase.autopsy.deepDive}</span>
        </div>

        {/* Optional Corrected Code Snippet */}
        {currentCase.autopsy.correctedCodeSnippet && (
          <div className="pt-2">
            <button
              onClick={onToggleCorrectedSnippet}
              className="text-xs text-sky-500 hover:underline font-mono cursor-pointer"
            >
              {showCorrectedSnippet ? 'Hide Corrected Snippet' : 'View Corrected Java Snippet'}
            </button>

            {showCorrectedSnippet && (
              <div className="mt-2 p-3 theme-code-patch border rounded-lg">
                <span className="text-[11px] font-semibold block mb-1 theme-text-primary">
                  Corrected Code:
                </span>
                <pre className="text-emerald-500 text-xs font-mono overflow-x-auto whitespace-pre">
                  <code>{currentCase.autopsy.correctedCodeSnippet}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {!isCorrect && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg theme-btn-secondary text-xs font-mono font-medium border transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}

          {!isCorrect && !hasRevealedAnswer && (
            <button
              onClick={onRevealAnswer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg theme-btn-secondary text-xs font-mono transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Show Solution</span>
            </button>
          )}
        </div>

        <button
          onClick={onNextCase}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg theme-btn-primary text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm active:scale-95 cursor-pointer ml-auto"
        >
          <span>Next Case</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
