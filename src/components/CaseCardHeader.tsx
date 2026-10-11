import React from 'react';
import { Case, ConceptId } from '../types/game';
import { CONCEPTS } from '../data/concepts';

interface CaseCardHeaderProps {
  currentCase: Case;
  onOpenConceptManual: (conceptId: ConceptId) => void;
}

export const CaseCardHeader: React.FC<CaseCardHeaderProps> = ({
  currentCase,
  onOpenConceptManual,
}) => {
  const primaryMeta = CONCEPTS[currentCase.primaryConcept];

  return (
    <div
      key={currentCase.id}
      className="theme-panel border rounded-xl p-4 shadow-sm space-y-3 animate-fade-slide"
    >
      {/* Top Header: Big Case Number & Level Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b theme-border-subtle pb-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl sm:text-3xl font-black font-display theme-case-number tracking-tight">
            CASE #{currentCase.caseNumber}
          </h2>
          <span className="text-xs font-mono theme-text-secondary">
            Level {currentCase.difficulty} of 5
          </span>
        </div>

        <div className="text-xs font-mono px-2.5 py-1 rounded theme-objective-badge border">
          Target Objective:{' '}
          <span className="font-semibold uppercase theme-objective-highlight">
            {currentCase.caseType.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Description of case - No document icon beside it */}
      <div className="text-sm theme-text-primary font-sans theme-subpanel p-3.5 rounded-lg border">
        <p className="leading-relaxed">{currentCase.mysteryStory}</p>
      </div>

      {/* Concepts Tested */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="theme-text-secondary text-xs font-semibold">Concepts Tested:</span>
          <button
            onClick={() => onOpenConceptManual(currentCase.primaryConcept)}
            className="px-2.5 py-1 rounded theme-concept-primary border transition cursor-pointer"
            title="Inspect concept in manual"
          >
            {primaryMeta?.name || currentCase.primaryConcept}
          </button>

          {currentCase.secondaryConcepts?.map((secId) => {
            const secMeta = CONCEPTS[secId];
            return (
              <button
                key={secId}
                onClick={() => onOpenConceptManual(secId)}
                className="px-2.5 py-1 rounded theme-concept-secondary border transition cursor-pointer"
              >
                {secMeta?.name || secId}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
