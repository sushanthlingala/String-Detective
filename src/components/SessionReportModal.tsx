import React from 'react';
import {
  X,
  Target,
  BarChart3,
} from 'lucide-react';
import { SessionStats, ConceptId } from '../types/game';
import { CONCEPTS } from '../data/concepts';

interface SessionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SessionStats;
  onPracticeConcept: (conceptId: ConceptId) => void;
  onPracticeWeakAreas: () => void;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  isOpen,
  onClose,
  stats,
  onPracticeConcept,
  onPracticeWeakAreas,
}) => {
  if (!isOpen) return null;

  const accuracy =
    stats.casesAttempted > 0
      ? Math.round((stats.casesSolved / stats.casesAttempted) * 100)
      : 0;

  // Rating rank
  let detectiveRating = 'Beginner Trainee';
  let badgeColor = 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';

  if (stats.casesSolved >= 20 && accuracy >= 80) {
    detectiveRating = 'Chief Master Inspector';
    badgeColor = 'text-purple-500 border-purple-500/30 bg-purple-500/10';
  } else if (stats.casesSolved >= 10 && accuracy >= 70) {
    detectiveRating = 'Senior Investigator';
    badgeColor = 'text-amber-500 border-amber-500/30 bg-amber-500/10';
  } else if (stats.casesSolved >= 5) {
    detectiveRating = 'Junior Detective';
    badgeColor = 'text-[#6D8196] border-[#6D8196]/30 bg-[#6D8196]/10';
  }

  // Calculate weak concepts (concepts with mistakes)
  const conceptEntries = Object.entries(stats.conceptPerformance) as [
    ConceptId,
    { attempted: number; solved: number; mistakes: number },
  ][];

  const weakConcepts = conceptEntries
    .filter(([_, perf]) => perf.attempted > 0 && perf.mistakes > 0)
    .sort((a, b) => b[1].mistakes / b[1].attempted - a[1].mistakes / a[1].attempted);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="theme-modal border rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="theme-modal-header px-5 py-3.5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-bold theme-text-primary font-mono">
              SESSION PERFORMANCE REPORT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="theme-nav-btn p-1.5 rounded-lg border transition cursor-pointer"
            aria-label="Close session report"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scroll theme-text-primary">
          {/* Top Rank Banner */}
          <div className="theme-panel border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono theme-text-secondary block mb-1">
                PERFORMANCE RATING:
              </span>
              <div
                className={`text-lg font-mono font-bold px-3 py-1 rounded-lg border inline-block ${badgeColor}`}
              >
                {detectiveRating}
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs font-mono theme-text-secondary block">FINAL SCORE</span>
              <span className="text-2xl font-mono font-black text-amber-500">
                {stats.totalScore} PTS
              </span>
            </div>
          </div>

          {/* Metric Grids */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="theme-subpanel border p-3 rounded-lg text-center">
              <span className="theme-text-secondary block mb-1">Accuracy</span>
              <span className="text-xl font-bold text-emerald-500">{accuracy}%</span>
              <span className="text-[10px] theme-text-muted block mt-0.5">
                {stats.casesSolved} / {stats.casesAttempted} cases
              </span>
            </div>

            <div className="theme-subpanel border p-3 rounded-lg text-center">
              <span className="theme-text-secondary block mb-1">Max Streak</span>
              <span className="text-xl font-bold text-orange-500">{stats.maxStreak}</span>
              <span className="text-[10px] theme-text-muted block mt-0.5">consecutive</span>
            </div>

            <div className="theme-subpanel border p-3 rounded-lg text-center">
              <span className="theme-text-secondary block mb-1">Current Streak</span>
              <span className="text-xl font-bold text-amber-500">{stats.currentStreak}</span>
              <span className="text-[10px] theme-text-muted block mt-0.5">active</span>
            </div>

            <div className="theme-subpanel border p-3 rounded-lg text-center">
              <span className="theme-text-secondary block mb-1">Hints Used</span>
              <span className="text-xl font-bold text-[#6D8196]">{stats.hintsUsedTotal}</span>
              <span className="text-[10px] theme-text-muted block mt-0.5">total hints</span>
            </div>
          </div>

          {/* Weak Areas Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-mono font-bold theme-text-primary uppercase">
                  Concepts to Practice
                </h3>
              </div>

              {weakConcepts.length > 0 && (
                <button
                  onClick={() => {
                    onClose();
                    onPracticeWeakAreas();
                  }}
                  className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-lg text-xs font-mono font-semibold transition cursor-pointer"
                >
                  Practice These Areas →
                </button>
              )}
            </div>

            {weakConcepts.length === 0 ? (
              <div className="theme-subpanel border rounded-lg p-4 text-center theme-text-secondary text-xs font-mono">
                No mistakes recorded yet! Your Java String answers are solid.
              </div>
            ) : (
              <div className="space-y-2">
                {weakConcepts.map(([conceptId, perf]) => {
                  const meta = CONCEPTS[conceptId];
                  const errorPct = Math.round((perf.mistakes / perf.attempted) * 100);

                  return (
                    <div
                      key={conceptId}
                      className="theme-subpanel border p-3 rounded-lg flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div>
                        <div className="font-semibold theme-text-primary">{meta.name}</div>
                        <div className="text-[11px] theme-text-secondary">
                          {perf.mistakes} mistake(s) across {perf.attempted} attempt(s) ({errorPct}% error rate)
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onPracticeConcept(conceptId);
                        }}
                        className="px-2.5 py-1 rounded theme-btn-primary text-xs transition cursor-pointer"
                      >
                        Practice This
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
