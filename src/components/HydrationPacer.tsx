import React from 'react';
import { Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Unit } from '../types';
import { formatVolume } from '../utils/unitConverter';

interface HydrationPacerProps {
  currentMl: number;
  goalMl: number;
  wakeUpTime: string; // "07:30"
  bedTime: string; // "23:00"
  unit: Unit;
}

export const HydrationPacer: React.FC<HydrationPacerProps> = ({
  currentMl,
  goalMl,
  wakeUpTime,
  bedTime,
  unit,
}) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [wakeH, wakeM] = wakeUpTime.split(':').map(Number);
  const [bedH, bedM] = bedTime.split(':').map(Number);

  const wakeMinutes = wakeH * 60 + wakeM;
  const bedMinutes = bedH * 60 + bedM;
  const totalAwakeMinutes = Math.max(60, bedMinutes - wakeMinutes);

  let awakeElapsed = currentMinutes - wakeMinutes;
  if (awakeElapsed < 0) awakeElapsed = 0;
  if (awakeElapsed > totalAwakeMinutes) awakeElapsed = totalAwakeMinutes;

  const dayProgressFraction = awakeElapsed / totalAwakeMinutes;
  const expectedPaceMl = Math.round(goalMl * dayProgressFraction);
  const deltaMl = currentMl - expectedPaceMl;

  // Status computation
  let status: 'ahead' | 'on_track' | 'behind' = 'on_track';
  if (deltaMl > 250) status = 'ahead';
  else if (deltaMl < -250) status = 'behind';

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            status === 'ahead'
              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400'
              : status === 'behind'
              ? 'bg-amber-950/60 border-amber-700/60 text-amber-400'
              : 'bg-cyan-950/60 border-cyan-700/60 text-cyan-400'
          }`}
        >
          {status === 'ahead' ? (
            <TrendingUp className="w-4 h-4" />
          ) : status === 'behind' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">
              Daily Hydration Pace
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                status === 'ahead'
                  ? 'bg-emerald-950/70 border-emerald-600/40 text-emerald-300'
                  : status === 'behind'
                  ? 'bg-amber-950/70 border-amber-600/40 text-amber-300'
                  : 'bg-cyan-950/70 border-cyan-600/40 text-cyan-300'
              }`}
            >
              {status === 'ahead' ? 'Ahead of Schedule' : status === 'behind' ? 'Slightly Behind' : 'Optimal Pace'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {status === 'ahead' && `You are +${formatVolume(deltaMl, unit)} ahead of your typical curve. Keep steady!`}
            {status === 'behind' && `Target by this hour is ~${formatVolume(expectedPaceMl, unit)}. Grab a glass of water soon.`}
            {status === 'on_track' && `Right on schedule for your target of ${formatVolume(goalMl, unit)} by bedtime.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-slate-400 self-end sm:self-center shrink-0">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Pace Target</span>
          <span className="text-slate-200 font-bold tabular-nums">{formatVolume(expectedPaceMl, unit)}</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Logged</span>
          <span className="text-cyan-300 font-bold tabular-nums">{formatVolume(currentMl, unit)}</span>
        </div>
      </div>
    </div>
  );
};
