import React, { useState } from 'react';
import { X, Check, Droplets, Sparkles, Citrus, Leaf, Coffee, Zap, Nut, CupSoda, Clock } from 'lucide-react';
import { BeverageType, Unit } from '../types';
import { BEVERAGES } from '../utils/storage';
import { formatVolume, mlToOz, ozToMl } from '../utils/unitConverter';

interface AddDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: {
    amountMl: number;
    beverageType: BeverageType;
    containerName: string;
    note?: string;
    customTime?: string;
  }) => void;
  unit: Unit;
}

export const AddDrinkModal: React.FC<AddDrinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  unit,
}) => {
  const [selectedBeverage, setSelectedBeverage] = useState<BeverageType>('water');
  const [amountInput, setAmountInput] = useState<number>(unit === 'oz' ? 12 : 350);
  const [containerName, setContainerName] = useState<string>('Glass');
  const [note, setNote] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  if (!isOpen) return null;

  const currentMl = unit === 'oz' ? ozToMl(amountInput) : amountInput;

  const handleQuickAdd = (delta: number) => {
    if (unit === 'oz') {
      const deltaOz = Math.round(delta / 30);
      setAmountInput((prev) => Math.max(1, prev + deltaOz));
    } else {
      setAmountInput((prev) => Math.max(50, prev + delta));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMl <= 0) return;

    onSave({
      amountMl: currentMl,
      beverageType: selectedBeverage,
      containerName: containerName || 'Custom Drink',
      note: note.trim() || undefined,
      customTime,
    });
    onClose();
  };

  const getBeverageIcon = (type: BeverageType) => {
    switch (type) {
      case 'water':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'sparkling':
        return <Sparkles className="w-5 h-5 text-sky-400" />;
      case 'lemon':
        return <Citrus className="w-5 h-5 text-yellow-400" />;
      case 'tea':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'coffee':
        return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'electrolyte':
        return <Zap className="w-5 h-5 text-indigo-400" />;
      case 'coconut':
        return <Nut className="w-5 h-5 text-green-400" />;
      case 'juice':
        return <CupSoda className="w-5 h-5 text-orange-400" />;
      default:
        return <Droplets className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Record Water Intake</h3>
            <p className="text-xs text-slate-400 mt-0.5">Customize beverage type, exact volume, and time</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-750 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Beverage Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Beverage Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(BEVERAGES) as BeverageType[]).map((type) => {
                const b = BEVERAGES[type];
                const isSelected = selectedBeverage === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      setSelectedBeverage(type);
                      if (type === 'coffee') setContainerName('Coffee Mug');
                      else if (type === 'tea') setContainerName('Teacup');
                      else if (containerName === 'Coffee Mug' || containerName === 'Teacup') setContainerName('Glass');
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm shadow-cyan-950'
                        : 'bg-slate-850/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-slate-800/80">
                      {getBeverageIcon(type)}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold truncate">{b.label}</span>
                      <span className="block text-[10px] text-slate-400">
                        {Math.round(b.hydrationFactor * 100)}% hydration
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Input & Slider */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Amount ({unit === 'oz' ? 'fl oz' : 'ml'})
              </label>
              <span className="text-sm font-bold text-cyan-300 font-mono tabular-nums">
                {formatVolume(currentMl, unit)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={unit === 'oz' ? 1 : 20}
                max={unit === 'oz' ? 150 : 4000}
                step={unit === 'oz' ? 0.5 : 25}
                value={amountInput}
                onChange={(e) => setAmountInput(Math.max(0, Number(e.target.value)))}
                className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-base font-bold text-white text-center font-mono focus:border-cyan-500 focus:outline-none"
              />
              <input
                type="range"
                min={unit === 'oz' ? 2 : 100}
                max={unit === 'oz' ? 68 : 2000}
                step={unit === 'oz' ? 1 : 50}
                value={amountInput}
                onChange={(e) => setAmountInput(Number(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Quick adjust chips */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-850">
              <span className="text-[11px] text-slate-500 mr-1">Quick:</span>
              <button
                type="button"
                onClick={() => handleQuickAdd(-100)}
                className="px-2 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
              >
                -100ml
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(100)}
                className="px-2 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
              >
                +100ml
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(250)}
                className="px-2 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
              >
                +250ml
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(500)}
                className="px-2 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300"
              >
                +500ml
              </button>
            </div>
          </div>

          {/* Time & Container Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Vessel Label
              </label>
              <input
                type="text"
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                placeholder="Glass, Desk Tumbler..."
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Time of Intake</span>
              </label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Optional Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Post 5k run, with lunch, electrolyte packet..."
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
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
              <span>Log Drink</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
