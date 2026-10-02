import React from 'react';
import { Coffee, Wine, Beer, ShieldAlert, Plus, GlassWater } from 'lucide-react';
import { PresetContainer, Unit } from '../types';
import { formatVolume } from '../utils/unitConverter';

interface QuickLogBarProps {
  presets: PresetContainer[];
  unit: Unit;
  onLogPreset: (preset: PresetContainer) => void;
  onOpenCustomModal: () => void;
}

export const QuickLogBar: React.FC<QuickLogBarProps> = ({
  presets,
  unit,
  onLogPreset,
  onOpenCustomModal,
}) => {
  // Map icons based on container
  const getContainerIcon = (icon: PresetContainer['icon']) => {
    switch (icon) {
      case 'cup':
        return <Coffee className="w-5 h-5 text-amber-300" />;
      case 'glass':
        return <GlassWater className="w-5 h-5 text-cyan-400" />;
      case 'can':
        return <Beer className="w-5 h-5 text-sky-300" />;
      case 'bottle':
        return <Wine className="w-5 h-5 text-blue-400" />;
      case 'flask':
        return <GlassWater className="w-5 h-5 text-teal-300" />;
      case 'jug':
        return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
      default:
        return <GlassWater className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Quick Log Vessels
        </h3>
        <span className="text-xs text-slate-500">Tap to log instantly</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {presets.map((preset) => {
          return (
            <button
              key={preset.id}
              onClick={() => onLogPreset(preset)}
              className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 transition-all duration-150 active:scale-95 shadow-sm hover:shadow-cyan-950/30 text-center min-h-[92px]"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 group-hover:bg-cyan-950/40 border border-slate-700/50 group-hover:border-cyan-500/40 flex items-center justify-center mb-2 transition-colors">
                {getContainerIcon(preset.icon)}
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate w-full">
                {preset.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums mt-0.5">
                +{formatVolume(preset.amountMl, unit)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex justify-center">
        <button
          onClick={onOpenCustomModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-cyan-400 bg-slate-900/80 hover:bg-slate-800 border border-cyan-900/50 hover:border-cyan-500/40 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Custom Beverage or Volume</span>
        </button>
      </div>
    </div>
  );
};
