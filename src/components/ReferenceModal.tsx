import React, { useState } from 'react';
import { X, Search, BookOpen, AlertTriangle, ShieldCheck, Code } from 'lucide-react';
import { CONCEPTS } from '../data/concepts';
import { ConceptId } from '../types/game';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConcept?: ConceptId;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({
  isOpen,
  onClose,
  initialConcept,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConceptId, setSelectedConceptId] = useState<ConceptId>(
    initialConcept || 'immutability'
  );

  if (!isOpen) return null;

  // Sort topics by difficulty (from easiest to hardest levelRange)
  const conceptList = Object.values(CONCEPTS).sort((a, b) => {
    if (a.levelRange[0] !== b.levelRange[0]) {
      return a.levelRange[0] - b.levelRange[0];
    }
    return a.levelRange[1] - b.levelRange[1];
  });

  const filteredConcepts = conceptList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.traps.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedConcept = CONCEPTS[selectedConceptId] || conceptList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="theme-modal border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="theme-modal-header px-5 py-3.5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold font-mono theme-text-primary">
              JAVA STRINGS REFERENCE MANUAL
            </h2>
          </div>
          <button
            onClick={onClose}
            className="theme-nav-btn p-1.5 rounded-lg border transition cursor-pointer"
            aria-label="Close reference manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Sidebar: Search & Concept List sorted by difficulty */}
          <div className="w-full md:w-80 theme-modal-sidebar border-r flex flex-col p-3 gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search concepts, methods, traps..."
                className="w-full pl-8 pr-3 py-1.5 theme-input border rounded-lg text-xs font-mono focus:outline-none"
              />
            </div>

            <span className="text-[10px] theme-text-secondary font-mono uppercase tracking-wider px-1">
              Topics Sorted by Difficulty (1 to 5)
            </span>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scroll">
              {filteredConcepts.map((c) => {
                const isSelected = c.id === selectedConceptId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConceptId(c.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition cursor-pointer border ${
                      isSelected
                        ? 'theme-topic-selected'
                        : 'theme-topic-inactive'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="truncate font-semibold theme-text-primary">{c.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded theme-subpanel theme-text-secondary border flex-shrink-0">
                        L{c.levelRange[0]}-{c.levelRange[1]}
                      </span>
                    </div>
                    <div className="text-[10px] theme-text-secondary truncate">{c.tagline}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scroll theme-text-primary font-sans">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded theme-subpanel border theme-text-secondary">
                  Levels {selectedConcept.levelRange[0]}-{selectedConcept.levelRange[1]} of 5
                </span>
                <h3 className="text-lg font-bold font-mono theme-text-primary">
                  {selectedConcept.name}
                </h3>
              </div>
              <p className="text-xs theme-recap-badge font-mono">{selectedConcept.tagline}</p>
            </div>

            {/* Overview */}
            <div className="theme-subpanel border rounded-lg p-3 text-xs leading-relaxed theme-text-primary">
              <span className="font-semibold block mb-1 font-mono text-[11px] theme-text-secondary uppercase">
                CONCEPT OVERVIEW:
              </span>
              {selectedConcept.mysteryDossier}
            </div>

            {/* Golden Rule */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-500 font-mono text-xs block mb-0.5">
                  CORE RULE:
                </span>
                <span className="theme-text-primary">{selectedConcept.goldenRule}</span>
              </div>
            </div>

            {/* Common Traps */}
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-500 font-mono text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>COMMON PITFALLS:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 theme-text-secondary pl-1">
                {selectedConcept.traps.map((trap, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {trap}
                  </li>
                ))}
              </ul>
            </div>

            {/* Example Code */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono theme-text-secondary">
                <Code className="w-3.5 h-3.5 text-cyan-500" />
                <span>JAVA EXAMPLE:</span>
              </div>
              <div className="theme-code-patch rounded-lg p-3 font-mono text-xs overflow-x-auto whitespace-pre border">
                <code>{selectedConcept.exampleCode}</code>
              </div>
            </div>

            {/* In-depth Explanation */}
            <div className="text-xs theme-text-secondary leading-relaxed border-t theme-border-subtle pt-3">
              <span className="font-semibold theme-text-primary font-mono text-[11px] block mb-1">
                SPECIFICATION DETAILS:
              </span>
              {selectedConcept.explanation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
