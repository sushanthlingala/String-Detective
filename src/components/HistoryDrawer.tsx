import React, { useState } from 'react';
import {
  X,
  Search,
  History as HistoryIcon,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { CaseHistoryItem, Case } from '../types/game';
import { CONCEPTS } from '../data/concepts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CaseHistoryItem[];
  onReviewCase: (caseItem: Case) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'solved' | 'missed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<CaseHistoryItem | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filterMode === 'solved' && !item.isCorrect) return false;
    if (filterMode === 'missed' && item.isCorrect) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchConcept = item.caseItem.primaryConcept.toLowerCase().includes(term);
      const matchNum = `${item.caseItem.caseNumber}`.includes(term);
      const meta = CONCEPTS[item.caseItem.primaryConcept];
      const matchName = meta?.name.toLowerCase().includes(term);
      return matchConcept || matchNum || matchName;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="theme-modal border-l w-full max-w-2xl h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 theme-modal-header border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-[#6D8196]" />
            <h2 className="text-base font-bold theme-text-primary font-mono">
              CASE HISTORY
            </h2>
            <span className="text-xs theme-text-secondary font-mono">({history.length} Cases)</span>
          </div>
          <button
            onClick={onClose}
            className="theme-nav-btn p-1.5 rounded-lg border transition cursor-pointer"
            aria-label="Close case history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 theme-subpanel border-b space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by concept or case #..."
              className="w-full pl-9 pr-3 py-1.5 theme-input border rounded-lg text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs theme-text-secondary font-mono">Filter:</span>
            {(['all', 'solved', 'missed'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg uppercase tracking-wider transition cursor-pointer ${
                  filterMode === mode
                    ? 'theme-btn-primary font-bold shadow-xs'
                    : 'theme-nav-btn border'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* History List or Detailed Review */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
          {selectedItem ? (
            /* Detailed Case Inspection View */
            <div className="space-y-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="text-xs font-mono theme-objective-highlight hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                ← Back to Case List
              </button>

              <div className="theme-panel border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-mono font-bold theme-text-primary">
                    CASE #{selectedItem.caseItem.caseNumber}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                      selectedItem.isCorrect
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-rose-500/20 text-rose-500'
                    }`}
                  >
                    {selectedItem.isCorrect ? 'SOLVED' : 'MISSED'}
                  </span>
                </div>

                <div className="text-xs theme-text-secondary font-mono">
                  Concept:{' '}
                  <span className="theme-text-primary font-semibold">
                    {CONCEPTS[selectedItem.caseItem.primaryConcept]?.name ||
                      selectedItem.caseItem.primaryConcept}
                  </span>{' '}
                  | Difficulty: Level {selectedItem.caseItem.difficulty} of 5
                </div>

                {/* Code */}
                <div className="theme-code-patch p-3 rounded-lg border font-mono text-xs whitespace-pre overflow-x-auto">
                  <code>{selectedItem.caseItem.codeSnippet}</code>
                </div>

                {/* Answers */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="theme-subpanel p-2.5 rounded border">
                    <span className="theme-text-muted block text-[11px]">Submitted Answer:</span>
                    <span className={selectedItem.isCorrect ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                      {selectedItem.submission.rawAnswer ||
                        selectedItem.submission.selectedChoiceId ||
                        `Line ${selectedItem.submission.selectedLineNumber}`}
                    </span>
                  </div>
                  <div className="theme-subpanel p-2.5 rounded border">
                    <span className="theme-text-muted block text-[11px]">Expected Output:</span>
                    <span className="theme-recap-badge font-bold">{selectedItem.caseItem.expectedOutput}</span>
                  </div>
                </div>

                {/* Autopsy / Explanation */}
                <div className="theme-subpanel p-3 rounded-lg border text-xs theme-text-primary space-y-1.5 font-mono">
                  <span className="font-bold theme-objective-highlight block text-[11px]">EXPLANATION:</span>
                  <p className="leading-relaxed">{selectedItem.caseItem.autopsy.verdictSummary}</p>
                </div>
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12 theme-text-muted font-mono text-xs">
              No cases recorded yet in this session.
            </div>
          ) : (
            filteredHistory.map((item, idx) => {
              const meta = CONCEPTS[item.caseItem.primaryConcept];
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className="theme-panel border hover:border-[#6D8196]/60 p-3.5 rounded-xl flex items-center justify-between gap-3 transition cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.isCorrect
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold theme-text-primary">
                          CASE #{item.caseItem.caseNumber}
                        </span>
                        <span className="text-xs theme-text-secondary font-mono">
                          {meta?.name || item.caseItem.primaryConcept}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] theme-text-muted font-mono mt-0.5">
                        <span>Level {item.caseItem.difficulty} of 5</span>
                        {item.hintsUsed > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-500">{item.hintsUsed} hint(s)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-500">
                      {item.scoreAwarded > 0 ? `+${item.scoreAwarded}` : '0'} pts
                    </span>
                    <ArrowRight className="w-4 h-4 theme-text-muted group-hover:theme-text-primary transition" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
