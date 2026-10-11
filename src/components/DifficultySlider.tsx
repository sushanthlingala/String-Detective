import React from 'react';

interface DifficultySliderProps {
  difficulty: number;
  onDifficultyChange: (level: number) => void;
}

interface DifficultyMeta {
  level: number;
  rank: string;
  badgeClass: string;
  shortDesc: string;
}

const DIFFICULTY_METAS: DifficultyMeta[] = [
  {
    level: 1,
    rank: 'Level 1: Beginner',
    badgeClass: 'theme-badge-green',
    shortDesc: 'Single straightforward operations: immutability basics, charAt(0), length(), and equals().',
  },
  {
    level: 2,
    rank: 'Level 2: Elementary',
    badgeClass: 'theme-badge-cyan',
    shortDesc: 'Method returns & indexing: substring bounds, concat() reassignment, indexOf, and escape codes.',
  },
  {
    level: 3,
    rank: 'Level 3: Intermediate',
    badgeClass: 'theme-badge-blue',
    shortDesc: 'Reference equality (== vs equals), StringBuilder mutation, String Pool literals, and compareTo().',
  },
  {
    level: 4,
    rank: 'Level 4: Advanced',
    badgeClass: 'theme-badge-amber',
    shortDesc: 'Regex traps in replaceAll/split, concatenation operator precedence, and loop traversal bounds.',
  },
  {
    level: 5,
    rank: 'Level 5: Master',
    badgeClass: 'theme-badge-purple',
    shortDesc: 'Subtle JVM edge cases: pool interning, method overload resolution, and chained buffer mutations.',
  },
];

export const DifficultySlider: React.FC<DifficultySliderProps> = ({
  difficulty,
  onDifficultyChange,
}) => {
  const currentMeta = DIFFICULTY_METAS[difficulty - 1] || DIFFICULTY_METAS[0];

  return (
    <div className="theme-panel border rounded-xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold tracking-wider uppercase theme-text-primary">
            Difficulty
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold border ${currentMeta.badgeClass}`}
          >
            {currentMeta.rank}
          </span>
        </div>

        <span className="text-[11px] theme-text-secondary">
          Changing difficulty generates a fresh case
        </span>
      </div>

      {/* Slider & Level Markers */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={difficulty}
            onChange={(e) => onDifficultyChange(parseInt(e.target.value, 10))}
            className="w-full h-2 theme-slider-track rounded-lg appearance-none cursor-pointer focus:outline-none"
          />
        </div>

        {/* 5 Level Step Buttons */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {DIFFICULTY_METAS.map((m) => {
            const isSelected = m.level === difficulty;
            return (
              <button
                key={m.level}
                onClick={() => onDifficultyChange(m.level)}
                className={`py-1.5 rounded text-center text-xs font-mono font-bold transition cursor-pointer ${
                  isSelected
                    ? 'theme-step-active shadow-sm'
                    : 'theme-step-inactive'
                }`}
                title={m.rank}
              >
                Level {m.level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Level Description without icon */}
      <div className="mt-3 flex items-start gap-2 theme-subpanel border rounded-lg px-3 py-2 text-xs">
        <div>
          <span className="font-semibold theme-text-primary">Level Coverage: </span>
          <span className="theme-text-secondary">{currentMeta.shortDesc}</span>
        </div>
      </div>
    </div>
  );
};
