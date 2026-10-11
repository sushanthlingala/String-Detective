import React, { useState } from 'react';
import {
  Flame,
  Award,
  RotateCcw,
  Sun,
  Moon,
} from 'lucide-react';
import { SessionStats } from '../types/game';

interface HeaderProps {
  stats: SessionStats;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenReference: () => void;
  onOpenHistory: () => void;
  onOpenReport: () => void;
  onRestartSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  theme,
  onToggleTheme,
  onOpenReference,
  onOpenHistory,
  onOpenReport,
  onRestartSession,
}) => {
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const accuracy =
    stats.casesAttempted > 0
      ? Math.round((stats.casesSolved / stats.casesAttempted) * 100)
      : 0;

  return (
    <header className="theme-header border-b sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        {/* Title & Branding - Clickable pointing to website root */}
        <div className="flex items-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xl font-black tracking-tight font-display theme-text-primary hover:opacity-80 transition cursor-pointer select-none"
            title="STRING DETECTIVE — Home"
          >
            STRING DETECTIVE
          </a>
        </div>

        {/* Live Score Ticker */}
        <div className="flex items-center gap-2 sm:gap-4 theme-ticker px-3 py-1.5 rounded-lg text-xs font-mono border">
          <div className="flex items-center gap-1.5" title="Total Score">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="theme-text-secondary hidden md:inline">Score:</span>
            <span className="font-bold text-amber-500 text-sm">{stats.totalScore}</span>
          </div>

          <div className="h-4 w-px theme-divider" />

          <div className="flex items-center gap-1.5" title="Current Streak">
            <Flame
              className={`w-4 h-4 ${
                stats.currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-zinc-500'
              }`}
            />
            <span className="theme-text-secondary hidden md:inline">Streak:</span>
            <span
              className={`font-bold ${
                stats.currentStreak > 0 ? 'text-orange-500' : 'theme-text-secondary'
              }`}
            >
              {stats.currentStreak}
            </span>
          </div>

          <div className="h-4 w-px theme-divider" />

          <div className="flex items-center gap-1.5" title="Solved / Attempted">
            <span className="theme-text-secondary hidden md:inline">Solved:</span>
            <span className="font-bold text-emerald-500">
              {stats.casesSolved}
              <span className="theme-text-secondary font-normal">/{stats.casesAttempted}</span>
            </span>
            <span className="theme-text-secondary text-[11px]">({accuracy}%)</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReference}
            className="px-3 py-1.5 text-xs font-medium rounded-lg theme-nav-btn border transition cursor-pointer"
            title="Open Java Strings Concept Manual"
          >
            Manual
          </button>

          <button
            onClick={onOpenHistory}
            className="px-3 py-1.5 text-xs font-medium rounded-lg theme-nav-btn border transition cursor-pointer"
            title="View Solved & Past Cases"
          >
            History
          </button>

          <button
            onClick={onOpenReport}
            className="px-3 py-1.5 text-xs font-medium rounded-lg theme-nav-btn border transition cursor-pointer"
            title="View Session Statistics"
          >
            Stats
          </button>

          {/* Dark / Light Mode Slider Toggle (on top right beside reset session) */}
          <div
            className="flex items-center"
            title={`Switch to ${theme === 'dark' ? 'Ink Wash Light' : 'Dark'} mode`}
          >
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'light'}
              aria-label="Toggle dark and light theme"
              onClick={onToggleTheme}
              className="relative inline-flex h-8 w-15 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer border theme-theme-toggle p-0.5 select-none"
            >
              {/* Background slot icons perfectly centered in each half */}
              <div className="absolute inset-0 grid grid-cols-2 pointer-events-none items-center justify-items-center">
                <span className="flex items-center justify-center text-zinc-400">
                  <Moon className="w-3.5 h-3.5" />
                </span>
                <span className="flex items-center justify-center text-amber-500">
                  <Sun className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Centered sliding thumb that covers active icon with centered interior icon */}
              <span
                className={`relative w-7 h-7 rounded-full shadow-md transition-transform duration-300 ease-in-out flex items-center justify-center z-10 ${
                  theme === 'light'
                    ? 'translate-x-7 bg-[#6D8196] text-[#FFFFE3]'
                    : 'translate-x-0 bg-zinc-800 text-amber-400 border border-zinc-700/60'
                }`}
              >
                {theme === 'light' ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}
              </span>
            </button>
          </div>

          {/* Restart Session */}
          <div className="relative">
            <button
              onClick={() => setShowRestartConfirm(true)}
              className="p-1.5 text-xs font-medium rounded-lg theme-nav-btn border transition cursor-pointer hover:text-red-500"
              title="Restart Session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {showRestartConfirm && (
              <div className="absolute right-0 mt-2 w-64 theme-popover border rounded-lg p-3 shadow-xl z-50 text-xs">
                <p className="font-semibold theme-text-primary mb-1">Restart Session?</p>
                <p className="theme-text-secondary mb-3 text-[11px]">
                  Resets current score, streak, and case archive for this session.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowRestartConfirm(false)}
                    className="px-2.5 py-1 rounded theme-btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowRestartConfirm(false);
                      onRestartSession();
                    }}
                    className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-medium cursor-pointer"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
