import React from 'react';
import { Droplet, Plus, Settings, Target } from 'lucide-react';
import { Unit } from '../types';
import { formatVolume } from '../utils/unitConverter';

interface HeaderProps {
  currentTab: 'tracker' | 'timeline' | 'analytics';
  onSelectTab: (tab: 'tracker' | 'timeline' | 'analytics') => void;
  onOpenAddModal: () => void;
  onOpenGoalModal: () => void;
  onOpenSettingsModal: () => void;
  todayTotalMl: number;
  dailyGoalMl: number;
  unit: Unit;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenGoalModal,
  onOpenSettingsModal,
  todayTotalMl,
  dailyGoalMl,
  unit,
}) => {
  const percent = Math.min(Math.round((todayTotalMl / dailyGoalMl) * 100), 999);

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element Brand Zone with subtle accent glyph */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Droplet className="w-5 h-5 fill-white/90 text-white" />
          </div>
          <span className="font-['Outfit'] text-xl font-bold tracking-tight text-white">
            AquaTrack
          </span>
        </div>

        {/* Zone 2: Navigation Links (Text-based, single-line tabs) */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onSelectTab('tracker')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
              currentTab === 'tracker'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tracker
          </button>
          <button
            onClick={() => onSelectTab('timeline')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
              currentTab === 'timeline'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today's Log
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
              currentTab === 'analytics'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly Trends
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Goal quick-pill & Log button & Settings) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenGoalModal}
            title="Edit Daily Goal"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 hover:text-white rounded-lg border border-slate-700/80 transition-colors whitespace-nowrap"
          >
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Goal: {formatVolume(dailyGoalMl, unit)}</span>
            <span className="text-slate-500">({percent}%)</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            title="Settings & Preferences"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-500/25 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Log Drink</span>
            <span className="sm:hidden">Log</span>
          </button>
        </div>
      </div>
    </header>
  );
};
