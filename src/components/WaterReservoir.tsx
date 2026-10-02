import React from 'react';
import { Target, CheckCircle2, Flame, Droplet, Plus, Minus, Sparkles } from 'lucide-react';
import { Unit } from '../types';
import { formatVolume } from '../utils/unitConverter';

interface WaterReservoirProps {
  currentMl: number;
  goalMl: number;
  unit: Unit;
  onOpenGoalModal: () => void;
  onQuickNudge: (deltaMl: number) => void;
  streakCount: number;
}

export const WaterReservoir: React.FC<WaterReservoirProps> = ({
  currentMl,
  goalMl,
  unit,
  onOpenGoalModal,
  onQuickNudge,
  streakCount,
}) => {
  const percentage = Math.round((currentMl / goalMl) * 100);
  const isGoalReached = currentMl >= goalMl;
  const remainingMl = Math.max(0, goalMl - currentMl);
  const clampedFillPercent = Math.min(Math.max(percentage, 0), 100);

  // Motivational caption
  let encouragement = 'Hydrate first thing to awaken your body';
  if (percentage >= 100) {
    encouragement = 'Daily goal achieved! Excellent hydration work 🌊';
  } else if (percentage >= 75) {
    encouragement = 'Almost there! A couple more sips will seal the goal';
  } else if (percentage >= 50) {
    encouragement = 'Halfway mark passed! You are on a steady roll';
  } else if (percentage >= 25) {
    encouragement = 'Good steady momentum, keep your bottle near';
  }

  return (
    <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-xl shadow-cyan-950/20">
      {/* Subtle ambient background glow */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25"
        style={{
          background: isGoalReached
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(6, 182, 212, 0.2) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(59, 130, 246, 0.2) 60%, transparent 80%)',
        }}
      />

      {/* Top micro badges */}
      <div className="w-full flex items-center justify-between mb-6 z-10 text-xs">
        <button
          onClick={onOpenGoalModal}
          className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-colors"
        >
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span>Goal: <strong className="text-white">{formatVolume(goalMl, unit)}</strong></span>
          <span className="text-[11px] text-slate-400 underline decoration-slate-600 underline-offset-2 ml-1">Edit</span>
        </button>

        <div className="flex items-center gap-2 text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80">
          <Flame className={`w-3.5 h-3.5 ${streakCount > 0 ? 'text-amber-400 fill-amber-400/20' : 'text-slate-500'}`} />
          <span>Streak: <strong className="text-white tabular-nums">{streakCount} {streakCount === 1 ? 'day' : 'days'}</strong></span>
        </div>
      </div>

      {/* The Reservoir Container */}
      <div className="relative w-64 sm:w-72 h-80 sm:h-88 mx-auto my-2 rounded-t-[3.5rem] rounded-b-[2.5rem] border-4 border-slate-700/60 bg-slate-950/70 overflow-hidden shadow-2xl flex flex-col justify-end backdrop-blur-sm">
        {/* Glass reflection gradient highlight */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-r from-white/10 via-transparent to-white/5 rounded-t-[3.2rem] rounded-b-[2.2rem]" />
        
        {/* Measurement tick marks on right glass edge */}
        <div className="absolute right-2 top-8 bottom-8 z-10 flex flex-col justify-between items-end opacity-40 pointer-events-none text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1"><span>100%</span><div className="w-3 h-0.5 bg-slate-400" /></div>
          <div className="flex items-center gap-1"><span>75%</span><div className="w-2 h-0.5 bg-slate-400" /></div>
          <div className="flex items-center gap-1"><span>50%</span><div className="w-3 h-0.5 bg-slate-400" /></div>
          <div className="flex items-center gap-1"><span>25%</span><div className="w-2 h-0.5 bg-slate-400" /></div>
          <div className="flex items-center gap-1"><span>0%</span><div className="w-3 h-0.5 bg-slate-400" /></div>
        </div>

        {/* Animated Liquid Reservoir Body */}
        <div
          className="relative w-full transition-all duration-700 ease-out z-0"
          style={{ height: `${clampedFillPercent}%` }}
        >
          {/* Wave SVG crest at liquid surface */}
          {clampedFillPercent > 0 && clampedFillPercent < 100 && (
            <div className="absolute -top-3 left-0 right-0 h-4 overflow-hidden pointer-events-none">
              <svg
                viewBox="0 0 500 150"
                preserveAspectRatio="none"
                className="w-[200%] h-full text-cyan-400/40 animate-pulse fill-current"
                style={{ transform: 'translateX(-25%)' }}
              >
                <path d="M0.00,49.98 C150.00,140.00 349.81,-40.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" />
              </svg>
            </div>
          )}

          {/* Deep liquid gradient with glow */}
          <div
            className={`w-full h-full transition-colors duration-700 ${
              isGoalReached
                ? 'bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400'
                : 'bg-gradient-to-t from-blue-700 via-cyan-600 to-sky-400'
            }`}
          >
            {/* Bubble simulation elements */}
            <div className="absolute bottom-2 left-1/4 w-2 h-2 rounded-full bg-white/40 animate-bounce duration-1000" />
            <div className="absolute bottom-8 right-1/3 w-3 h-3 rounded-full bg-white/30 animate-pulse" />
            <div className="absolute bottom-16 left-1/3 w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>

        {/* Centered Readout Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <div className="flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="font-['Outfit'] text-4xl sm:text-5xl font-extrabold tracking-tight text-white tabular-nums drop-shadow-md">
                  {percentage}%
                </span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-cyan-300 tabular-nums">
                {formatVolume(currentMl, unit)}
              </span>
            </div>
          </div>

          {/* Goal Achieved or Remaining Indicator */}
          <div className="mt-3 px-3 py-1 rounded-full text-xs font-medium tracking-tight bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-slate-300 shadow">
            {isGoalReached ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 fill-emerald-400/20" />
                Goal Hit (+{formatVolume(currentMl - goalMl, unit)} extra)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-300">
                <Droplet className="w-3 h-3 text-cyan-400" />
                {formatVolume(remainingMl, unit)} left to drink
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Motivational message banner */}
      <p className="mt-4 text-xs sm:text-sm text-slate-400 text-center font-medium max-w-sm">
        {encouragement}
      </p>

      {/* Quick +/- Nudge Controls */}
      <div className="mt-5 w-full flex items-center justify-center gap-2 sm:gap-3 z-10">
        <button
          onClick={() => onQuickNudge(-250)}
          disabled={currentMl <= 0}
          title="Remove 250ml (Undo)"
          className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/60 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
          <span>250 ml</span>
        </button>

        <button
          onClick={() => onQuickNudge(100)}
          title="Add quick sip (100ml)"
          className="flex items-center gap-1 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/60 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>100 ml</span>
        </button>

        <button
          onClick={() => onQuickNudge(250)}
          title="Add quick glass (250ml)"
          className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>250 ml</span>
        </button>

        <button
          onClick={() => onQuickNudge(500)}
          title="Add full bottle (500ml)"
          className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>500 ml</span>
        </button>
      </div>
    </div>
  );
};
