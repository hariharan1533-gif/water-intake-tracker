import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getTodayDateString } from '../utils/storage';

interface DaySelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  dailyTotals: Map<string, number>;
  dailyGoalMl: number;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDate,
  onSelectDate,
  dailyTotals,
  dailyGoalMl,
}) => {
  const todayStr = getTodayDateString();

  // Generate 7 days centered on selected date / today
  const days: { dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
  const baseDate = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dateStr = getTodayDateString(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    days.push({
      dateStr,
      dayName,
      dayNum,
      isToday: dateStr === todayStr,
    });
  }

  const handlePrevDay = () => {
    const curr = new Date(selectedDate + 'T12:00:00');
    curr.setDate(curr.getDate() - 1);
    onSelectDate(getTodayDateString(curr));
  };

  const handleNextDay = () => {
    const curr = new Date(selectedDate + 'T12:00:00');
    curr.setDate(curr.getDate() + 1);
    const nextStr = getTodayDateString(curr);
    // Don't navigate into far future beyond today
    if (nextStr <= todayStr) {
      onSelectDate(nextStr);
    }
  };

  // Format the label for the active day
  const isSelectedToday = selectedDate === todayStr;
  const selectedObj = new Date(selectedDate + 'T12:00:00');
  const fullDateLabel = selectedObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4">
      {/* Top row: Navigation Title & Quick Controls */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            {isSelectedToday ? 'Today, ' + fullDateLabel : fullDateLabel}
          </h2>
          {isSelectedToday && (
            <span className="text-[11px] font-medium text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!isSelectedToday && (
            <button
              onClick={() => onSelectDate(todayStr)}
              className="text-xs text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-slate-800/70 hover:bg-slate-800 transition-colors"
            >
              Jump to Today
            </button>
          )}
          <button
            onClick={handlePrevDay}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextDay}
            disabled={selectedDate >= todayStr}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              selectedDate >= todayStr
                ? 'opacity-40 cursor-not-allowed text-slate-600 bg-slate-900'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white'
            }`}
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day interactive date row */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d) => {
          const isSelected = d.dateStr === selectedDate;
          const total = dailyTotals.get(d.dateStr) || 0;
          const percent = Math.min(Math.round((total / dailyGoalMl) * 100), 100);
          const reached = total >= dailyGoalMl;

          return (
            <button
              key={d.dateStr}
              onClick={() => onSelectDate(d.dateStr)}
              className={`group flex flex-col items-center justify-between py-2 sm:py-2.5 px-1 rounded-xl transition-all duration-150 min-h-[58px] ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-900/40 to-blue-900/30 border border-cyan-500/50 shadow-sm shadow-cyan-900/20'
                  : 'bg-slate-950/40 hover:bg-slate-800/50 border border-slate-800/50'
              }`}
            >
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {d.dayName}
              </span>
              <span
                className={`text-sm sm:text-base font-semibold tabular-nums mt-0.5 ${
                  isSelected ? 'text-white' : 'text-slate-200'
                }`}
              >
                {d.dayNum}
              </span>

              {/* Progress dot or mini bar indicator */}
              <div className="w-full px-2 mt-1.5 flex items-center justify-center">
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      reached
                        ? 'bg-emerald-400'
                        : percent > 0
                        ? 'bg-cyan-400'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
