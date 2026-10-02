import React, { useState } from 'react';
import { X, Target, Calculator, Check, Sparkles, Scale, Activity, Sun } from 'lucide-react';
import { Unit } from '../types';
import { formatVolume, mlToOz, ozToMl } from '../utils/unitConverter';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoalMl: number;
  onSaveGoal: (goalMl: number) => void;
  unit: Unit;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  currentGoalMl,
  onSaveGoal,
  unit,
}) => {
  const [goalMl, setGoalMl] = useState<number>(currentGoalMl);
  const [showCalculator, setShowCalculator] = useState(false);

  // Calculator inputs
  const [weight, setWeight] = useState<number>(70); // kg
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'intense'>('moderate');
  const [climate, setClimate] = useState<'temperate' | 'hot' | 'very_hot'>('temperate');

  if (!isOpen) return null;

  // Calculate recommended hydration based on health guidelines:
  // Base: ~35 ml per kg body weight
  // Activity: +400ml for moderate, +800ml for intense
  // Climate: +350ml for hot, +650ml for very hot
  const calcWeightKg = weightUnit === 'lbs' ? weight * 0.453592 : weight;
  const baseFromWeight = calcWeightKg * 35;
  const activityBonus = activityLevel === 'sedentary' ? 0 : activityLevel === 'moderate' ? 450 : 900;
  const climateBonus = climate === 'temperate' ? 0 : climate === 'hot' ? 350 : 650;
  const recommendedGoalMl = Math.round((baseFromWeight + activityBonus + climateBonus) / 50) * 50;

  const handleApplyCalculated = () => {
    setGoalMl(recommendedGoalMl);
    setShowCalculator(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalMl >= 500 && goalMl <= 10000) {
      onSaveGoal(goalMl);
      onClose();
    }
  };

  const presets = [
    { label: 'Light', ml: 2000, desc: 'Desk / Light routine' },
    { label: 'Standard', ml: 2500, desc: 'Recommended baseline' },
    { label: 'Active', ml: 3000, desc: 'Exercise & fitness' },
    { label: 'Athlete', ml: 3500, desc: 'Intense endurance / heat' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">Hydration Goal</h3>
              <p className="text-xs text-slate-400">Set your daily target intake</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-750 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Main Goal Display */}
          <div className="text-center p-5 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Daily Target
            </span>
            <div className="mt-1 flex items-baseline justify-center gap-2">
              <span className="font-['Outfit'] text-4xl font-extrabold text-white tracking-tight tabular-nums">
                {formatVolume(goalMl, unit, false)}
              </span>
              <span className="text-lg font-semibold text-cyan-400">
                {unit === 'oz' ? 'fl oz' : 'ml'}
              </span>
            </div>
            {unit === 'oz' ? (
              <span className="text-xs text-slate-400 mt-1 block">
                (~{goalMl.toLocaleString()} ml)
              </span>
            ) : (
              <span className="text-xs text-slate-400 mt-1 block">
                (~{mlToOz(goalMl)} fl oz)
              </span>
            )}

            {/* Slider */}
            <div className="mt-4 px-2">
              <input
                type="range"
                min="1000"
                max="5000"
                step="50"
                value={goalMl}
                onChange={(e) => setGoalMl(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>{formatVolume(1000, unit)}</span>
                <span>{formatVolume(3000, unit)}</span>
                <span>{formatVolume(5000, unit)}</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Quick Target Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => {
                const isSelected = goalMl === p.ml;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setGoalMl(p.ml)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm shadow-cyan-950'
                        : 'bg-slate-850/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{p.label}</span>
                      <span className="text-xs font-mono text-cyan-400 tabular-nums">
                        {formatVolume(p.ml, unit)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smart Calculator Toggle */}
          <div className="border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setShowCalculator(!showCalculator)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-750 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold">Smart Goal Calculator</span>
              </div>
              <span className="text-xs text-cyan-400">
                {showCalculator ? 'Hide' : 'Calculate from Body Weight'}
              </span>
            </button>

            {showCalculator && (
              <div className="mt-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3.5 animate-fadeIn">
                {/* Body weight */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Scale className="w-3.5 h-3.5 text-cyan-400" /> Body Weight
                    </span>
                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setWeightUnit('kg')}
                        className={`px-2 py-0.5 rounded ${weightUnit === 'kg' ? 'bg-cyan-500 text-white font-medium' : 'text-slate-400'}`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnit('lbs')}
                        className={`px-2 py-0.5 rounded ${weightUnit === 'lbs' ? 'bg-cyan-500 text-white font-medium' : 'text-slate-400'}`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Activity level */}
                <div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> Activity Level
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['sedentary', 'moderate', 'intense'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setActivityLevel(lvl)}
                        className={`py-1.5 px-2 rounded-lg capitalize border transition-colors ${
                          activityLevel === lvl
                            ? 'bg-cyan-950/70 border-cyan-500 text-white font-medium'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Climate */}
                <div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> Climate / Weather
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(['temperate', 'hot', 'very_hot'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setClimate(c)}
                        className={`py-1.5 px-2 rounded-lg capitalize border transition-colors ${
                          climate === c
                            ? 'bg-cyan-950/70 border-cyan-500 text-white font-medium'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {c.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation recommendation preview */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-850">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Recommended</span>
                    <strong className="text-sm text-cyan-300 font-mono">
                      {formatVolume(recommendedGoalMl, unit)}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCalculated}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply This Target</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/25 active:scale-95 transition-all text-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save Goal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
