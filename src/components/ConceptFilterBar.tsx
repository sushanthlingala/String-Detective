import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ConceptId } from '../types/game';
import { CONCEPTS } from '../data/concepts';

interface ConceptFilterBarProps {
  currentFilter: ConceptId | 'all' | 'weak_areas';
  onFilterChange: (filter: ConceptId | 'all' | 'weak_areas') => void;
  weakConceptsCount: number;
  onNewCase: () => void;
}

export const ConceptFilterBar: React.FC<ConceptFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  weakConceptsCount,
  onNewCase,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleNewCaseClick = () => {
    setIsSpinning(true);
    onNewCase();
    setTimeout(() => setIsSpinning(false), 600);
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 theme-panel p-3 rounded-xl border">
      {/* Concept Selector Dropdown & Filter Label */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider theme-text-secondary">
          CONCEPT COVERED:
        </span>

        <select
          value={currentFilter}
          onChange={(e) =>
            onFilterChange(e.target.value as ConceptId | 'all' | 'weak_areas')
          }
          className="theme-input text-xs rounded-lg px-3 py-1.5 font-mono cursor-pointer min-w-[200px] border focus:outline-none"
        >
          <option value="all">All Concepts</option>
          {weakConceptsCount > 0 && (
            <option value="weak_areas">
              Practice Weak Areas ({weakConceptsCount} flagged)
            </option>
          )}
          <optgroup label="Specific String Topics">
            {Object.values(CONCEPTS).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Quick shortcut pill for Weak Areas if available */}
        {weakConceptsCount > 0 && currentFilter !== 'weak_areas' && (
          <button
            onClick={() => onFilterChange('weak_areas')}
            className="px-2.5 py-1 text-[11px] font-mono rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition cursor-pointer"
            title="Drill concepts where you made previous mistakes"
          >
            Practice Weak Areas ({weakConceptsCount})
          </button>
        )}
      </div>

      {/* New Case Button with rotate animation */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleNewCaseClick}
          className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 theme-btn-primary text-xs font-mono font-bold uppercase tracking-wider rounded-lg shadow-sm active:scale-95 transition cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 transition-transform duration-500 ease-in-out ${
              isSpinning ? 'rotate-180 animate-spin-once' : ''
            }`}
          />
          <span>New Case File</span>
        </button>
      </div>
    </div>
  );
};
