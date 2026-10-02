import React from 'react';
import { Droplet, Trash2, Clock, Plus, AlertCircle, GlassWater } from 'lucide-react';
import { IntakeLog, Unit } from '../types';
import { BEVERAGES } from '../utils/storage';
import { formatVolume } from '../utils/unitConverter';

interface HistoryTimelineProps {
  logs: IntakeLog[];
  selectedDate: string;
  unit: Unit;
  goalMl: number;
  onDeleteLog: (id: string) => void;
  onOpenAddModal: () => void;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  logs,
  selectedDate,
  unit,
  goalMl,
  onDeleteLog,
  onOpenAddModal,
}) => {
  // Filter logs for this specific date, sorted chronologically (newest first or oldest first)
  const dayLogs = logs
    .filter((l) => l.date === selectedDate)
    .sort((a, b) => b.timestamp - a.timestamp);

  const dayTotal = dayLogs.reduce((acc, curr) => acc + curr.amountMl, 0);
  const percentage = Math.round((dayTotal / goalMl) * 100);

  const formatLogTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white font-['Outfit']">
            Hydration Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {dayLogs.length} {dayLogs.length === 1 ? 'entry' : 'entries'} logged for this date
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total for day</span>
            <span className="text-base font-bold text-cyan-300 font-mono tabular-nums">
              {formatVolume(dayTotal, unit)} ({percentage}%)
            </span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Log list or Empty State */}
      {dayLogs.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
            <Droplet className="w-6 h-6 text-slate-500" />
          </div>
          <h4 className="text-sm font-semibold text-slate-300">No logs for this date yet</h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
            Keep your hydration on track by recording your glasses, bottles, and teas.
          </p>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Your First Drink</span>
          </button>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-800/60">
          {dayLogs.map((log) => {
            const bev = BEVERAGES[log.beverageType] || BEVERAGES.water;
            return (
              <div
                key={log.id}
                className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-850/40 px-2 rounded-xl transition-colors"
              >
                {/* Left: icon & details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-750"
                    style={{ backgroundColor: `${bev.color}15`, borderColor: `${bev.color}35` }}
                  >
                    <GlassWater className="w-5 h-5" style={{ color: bev.color }} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100 truncate">
                        {log.containerName || bev.label}
                      </span>
                      <span className="text-[11px] text-slate-400">·</span>
                      <span className="text-xs text-slate-400 font-medium">
                        {bev.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatLogTime(log.timestamp)}
                      </span>
                      {log.note && (
                        <>
                          <span>·</span>
                          <span className="italic text-slate-400 truncate max-w-[200px]">
                            "{log.note}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete button */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white font-mono tabular-nums">
                      +{formatVolume(log.amountMl, unit)}
                    </span>
                    {bev.hydrationFactor !== 1.0 && (
                      <span className="text-[10px] text-slate-400 block font-mono">
                        ~{formatVolume(Math.round(log.amountMl * bev.hydrationFactor), unit)} net
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteLog(log.id)}
                    title="Delete entry"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
