import React, { useRef } from 'react';
import { X, Volume2, VolumeX, Bell, BellOff, Download, Upload, RotateCcw, Sparkles, Check, Clock } from 'lucide-react';
import { UserSettings, Unit } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetToday: () => void;
  onLoadDemoData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetToday,
  onLoadDemoData,
  onExportData,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUnitToggle = (unit: Unit) => {
    onUpdateSettings({ ...settings, unit });
  };

  const handleSoundToggle = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleReminderChange = (interval: number) => {
    onUpdateSettings({ ...settings, reminderInterval: interval });
  };

  const handleTimeChange = (key: 'wakeUpTime' | 'bedTime', val: string) => {
    onUpdateSettings({ ...settings, [key]: val });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Preferences & Data</h3>
            <p className="text-xs text-slate-400">Personalize your hydration experience</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-750 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Unit Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Measurement Unit
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleUnitToggle('ml')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  settings.unit === 'ml'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Metric (Milliliters · ml)
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle('oz')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                  settings.unit === 'oz'
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Imperial (Fluid Ounces · fl oz)
              </button>
            </div>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Water Sound Effects</span>
                <span className="text-[11px] text-slate-400">Play subtle droplet & goal chimes on logging</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSoundToggle}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Wake up and Bed time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Daily Active Hours (For Pacing Schedule)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Wake Up</span>
                <input
                  type="time"
                  value={settings.wakeUpTime}
                  onChange={(e) => handleTimeChange('wakeUpTime', e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Bedtime</span>
                <input
                  type="time"
                  value={settings.bedTime}
                  onChange={(e) => handleTimeChange('bedTime', e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reminder Interval */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hydration Nudge Interval</span>
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { label: 'Off', val: 0 },
                { label: 'Every 60m', val: 60 },
                { label: 'Every 90m', val: 90 },
                { label: 'Every 2h', val: 120 },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleReminderChange(item.val)}
                  className={`py-2 px-2 rounded-xl border text-center transition-colors ${
                    settings.reminderInterval === item.val
                      ? 'bg-cyan-950/70 border-cyan-500 text-white font-semibold'
                      : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data & Backup Tools */}
          <div className="border-t border-slate-800 pt-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Data Management & Backup
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onExportData}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={onLoadDemoData}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Reload Demo History</span>
              </button>

              <button
                type="button"
                onClick={onResetToday}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/40 text-rose-300 text-xs font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Today</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
