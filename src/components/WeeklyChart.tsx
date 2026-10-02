import React from 'react';
import { BarChart3, Award, Flame, CheckCircle, TrendingUp, CalendarDays } from 'lucide-react';
import { IntakeLog, Unit } from '../types';
import { getTodayDateString, BEVERAGES } from '../utils/storage';
import { formatVolume } from '../utils/unitConverter';

interface WeeklyChartProps {
  logs: IntakeLog[];
  dailyGoalMl: number;
  unit: Unit;
  streak: { currentStreak: number; bestStreak: number };
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  logs,
  dailyGoalMl,
  unit,
  streak,
}) => {
  // Aggregate data for the past 7 days (including today)
  const today = new Date();
  const past7Days: { dateStr: string; label: string; fullDate: string; totalMl: number; reached: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getTodayDateString(d);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayTotal = logs
      .filter((l) => l.date === dateStr)
      .reduce((acc, curr) => acc + curr.amountMl, 0);

    past7Days.push({
      dateStr,
      label,
      fullDate,
      totalMl: dayTotal,
      reached: dayTotal >= dailyGoalMl,
    });
  }

  // Summary statistics
  const totalVolume7Days = past7Days.reduce((acc, curr) => acc + curr.totalMl, 0);
  const avgDailyMl = Math.round(totalVolume7Days / 7);
  const daysReachedGoal = past7Days.filter((d) => d.reached).length;
  const goalSuccessRate = Math.round((daysReachedGoal / 7) * 100);

  // Maximum scale for chart height
  const maxIntakeInWeek = Math.max(...past7Days.map((d) => d.totalMl), dailyGoalMl * 1.15);

  // Beverage distribution breakdown for the week
  const past7DaysLogs = logs.filter((l) => past7Days.some((d) => d.dateStr === l.date));
  const beverageTotals: Record<string, number> = {};
  past7DaysLogs.forEach((l) => {
    beverageTotals[l.beverageType] = (beverageTotals[l.beverageType] || 0) + l.amountMl;
  });

  return (
    <div className="w-full space-y-6">
      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: 7-Day Average */}
        <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">7-Day Average</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-['Outfit'] text-2xl font-bold text-white tabular-nums">
            {formatVolume(avgDailyMl, unit)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {Math.round((avgDailyMl / dailyGoalMl) * 100)}% of daily target
          </span>
        </div>

        {/* Card 2: Goal Completion Rate */}
        <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Goal Hit Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-['Outfit'] text-2xl font-bold text-white tabular-nums">
            {daysReachedGoal} <span className="text-sm font-normal text-slate-400">/ 7 days</span>
          </div>
          <span className="text-xs text-emerald-400 font-medium mt-1 block">
            {goalSuccessRate}% success this week
          </span>
        </div>

        {/* Card 3: Active Streak */}
        <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-['Outfit'] text-2xl font-bold text-white tabular-nums">
            {streak.currentStreak} <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Best record: {streak.bestStreak} days
          </span>
        </div>

        {/* Card 4: Total Volume */}
        <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Drank</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-['Outfit'] text-2xl font-bold text-white tabular-nums">
            {formatVolume(totalVolume7Days, unit)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Past 7 days aggregate
          </span>
        </div>
      </div>

      {/* Main Weekly Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>7-Day Hydration History</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dashed line represents your target ({formatVolume(dailyGoalMl, unit)})
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-300">Goal Met</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-cyan-500" />
              <span className="text-slate-300">In Progress</span>
            </div>
          </div>
        </div>

        {/* Bar chart canvas */}
        <div className="relative h-64 pt-6 pb-2 px-2 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-800">
          {/* Daily Goal Reference Line */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-cyan-400/50 pointer-events-none z-10 flex items-center justify-end pr-2"
            style={{
              bottom: `${(dailyGoalMl / maxIntakeInWeek) * 100}%`,
            }}
          >
            <span className="text-[10px] font-mono text-cyan-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-cyan-800/40 -translate-y-1/2">
              Goal: {formatVolume(dailyGoalMl, unit)}
            </span>
          </div>

          {past7Days.map((d) => {
            const heightPercent = Math.min(Math.round((d.totalMl / maxIntakeInWeek) * 100), 100);
            return (
              <div
                key={d.dateStr}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-800 text-white text-[11px] font-mono py-1 px-2 rounded-lg border border-slate-700 whitespace-nowrap z-20 shadow-lg">
                  {d.fullDate}: {formatVolume(d.totalMl, unit)} ({Math.round((d.totalMl / dailyGoalMl) * 100)}%)
                </div>

                {/* Amount on top of bar */}
                <span className="text-[10px] font-mono text-slate-400 tabular-nums mb-1.5 hidden sm:block">
                  {formatVolume(d.totalMl, unit, false)}
                </span>

                {/* The vertical bar */}
                <div className="w-full max-w-[48px] bg-slate-800/60 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      d.reached
                        ? 'bg-gradient-to-t from-teal-600 to-emerald-400 group-hover:brightness-110'
                        : 'bg-gradient-to-t from-blue-600 to-cyan-400 group-hover:brightness-110'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* X-axis labels */}
                <div className="mt-3 text-center">
                  <span className="block text-xs font-semibold text-slate-200">
                    {d.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono">
                    {d.fullDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Beverage Distribution */}
      {totalVolume7Days > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Beverage Breakdown This Week
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(beverageTotals).map(([bevKey, amount]) => {
              const bev = BEVERAGES[bevKey as keyof typeof BEVERAGES] || BEVERAGES.water;
              const pct = Math.round((amount / totalVolume7Days) * 100);
              return (
                <div key={bevKey} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{bev.label}</span>
                    <span className="text-slate-400 font-mono">{pct}%</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono tabular-nums">
                    {formatVolume(amount, unit)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
