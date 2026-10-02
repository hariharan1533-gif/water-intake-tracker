/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  IntakeLog,
  UserSettings,
  PresetContainer,
  BeverageType,
} from './types';
import {
  getLogs,
  saveLogs,
  addLog,
  deleteLog,
  getSettings,
  saveSettings,
  getTodayDateString,
  calculateStreak,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { sounds } from './utils/audio';
import { Header } from './components/Header';
import { DaySelector } from './components/DaySelector';
import { WaterReservoir } from './components/WaterReservoir';
import { QuickLogBar } from './components/QuickLogBar';
import { HydrationPacer } from './components/HydrationPacer';
import { HistoryTimeline } from './components/HistoryTimeline';
import { WeeklyChart } from './components/WeeklyChart';
import { AddDrinkModal } from './components/AddDrinkModal';
import { GoalModal } from './components/GoalModal';
import { SettingsModal } from './components/SettingsModal';
import { formatVolume } from './utils/unitConverter';
import { CheckCircle2, RotateCcw, Droplet } from 'lucide-react';

export default function App() {
  const [logs, setLogs] = useState<IntakeLog[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [currentTab, setCurrentTab] = useState<'tracker' | 'timeline' | 'analytics'>('tracker');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toast / feedback notification
  const [toastMessage, setToastMessage] = useState<{ text: string; undoAction?: () => void } | null>(null);

  // Track if celebration was already triggered today
  const [hasCelebratedToday, setHasCelebratedToday] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedSettings = getSettings();
    const loadedLogs = getLogs();
    setSettings(loadedSettings);
    setLogs(loadedLogs);
  }, []);

  const todayStr = useMemo(() => getTodayDateString(), []);

  // Map of daily totals (dateStr -> totalMl)
  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach((log) => {
      const prev = map.get(log.date) || 0;
      map.set(log.date, prev + log.amountMl);
    });
    return map;
  }, [logs]);

  // Today's total intake
  const todayTotalMl = dailyTotals.get(todayStr) || 0;

  // Selected date total intake
  const selectedDateTotalMl = dailyTotals.get(selectedDate) || 0;

  // Streaks
  const streak = useMemo(() => {
    return calculateStreak(logs, settings.dailyGoalMl);
  }, [logs, settings.dailyGoalMl]);

  // Toast helper
  const showToast = useCallback((text: string, undoAction?: () => void) => {
    setToastMessage({ text, undoAction });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }, []);

  // Check goal celebration
  const triggerCelebration = useCallback(() => {
    sounds.playGoalCelebration(settings.soundEnabled);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#38bdf8', '#10b981', '#3b82f6', '#facc15'],
      });
    } catch {
      // Confetti fallback
    }
  }, [settings.soundEnabled]);

  // Check if today just crossed the daily goal
  useEffect(() => {
    if (todayTotalMl >= settings.dailyGoalMl && !hasCelebratedToday && todayTotalMl > 0) {
      setHasCelebratedToday(true);
      triggerCelebration();
    }
  }, [todayTotalMl, settings.dailyGoalMl, hasCelebratedToday, triggerCelebration]);

  // Periodic hydration reminder check
  useEffect(() => {
    if (!settings.reminderInterval || settings.reminderInterval <= 0) return;

    const intervalMs = settings.reminderInterval * 60 * 1000;
    const timer = setInterval(() => {
      // Subtle nudge notification
      if (todayTotalMl < settings.dailyGoalMl) {
        sounds.playWaterDrop(settings.soundEnabled);
        showToast("💧 Time for a hydration break! Stay refreshed.");
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.reminderInterval, settings.soundEnabled, todayTotalMl, settings.dailyGoalMl, showToast]);

  // Log a container preset
  const handleLogPreset = (preset: PresetContainer) => {
    sounds.playWaterDrop(settings.soundEnabled);

    const newLog = addLog({
      date: selectedDate,
      amountMl: preset.amountMl,
      beverageType: 'water',
      containerName: preset.name,
    });

    setLogs((prev) => [newLog, ...prev]);

    showToast(
      `Logged ${preset.name} (+${formatVolume(preset.amountMl, settings.unit)})`,
      () => {
        handleDeleteLog(newLog.id, false);
      }
    );
  };

  // Quick nudge (+100, +250, +500, -250)
  const handleQuickNudge = (deltaMl: number) => {
    if (deltaMl > 0) {
      sounds.playWaterDrop(settings.soundEnabled);
      const newLog = addLog({
        date: selectedDate,
        amountMl: deltaMl,
        beverageType: 'water',
        containerName: `${deltaMl}ml Quick Sip`,
      });
      setLogs((prev) => [newLog, ...prev]);
      showToast(`Added +${formatVolume(deltaMl, settings.unit)}`);
    } else {
      // Remove latest log for selected date if possible
      const dayLogs = logs.filter((l) => l.date === selectedDate);
      if (dayLogs.length > 0) {
        const toRemove = dayLogs[0];
        handleDeleteLog(toRemove.id);
      }
    }
  };

  // Custom drink log from modal
  const handleSaveCustomDrink = (entry: {
    amountMl: number;
    beverageType: BeverageType;
    containerName: string;
    note?: string;
    customTime?: string;
  }) => {
    sounds.playWaterDrop(settings.soundEnabled);

    // Compute timestamp if custom time is set
    let timestamp = Date.now();
    if (entry.customTime) {
      const [h, m] = entry.customTime.split(':').map(Number);
      const d = new Date(selectedDate + 'T12:00:00');
      d.setHours(h, m, 0, 0);
      timestamp = d.getTime();
    }

    const newLog = addLog({
      date: selectedDate,
      amountMl: entry.amountMl,
      beverageType: entry.beverageType,
      containerName: entry.containerName,
      note: entry.note,
      timestamp,
    });

    setLogs((prev) => [newLog, ...prev]);
    showToast(
      `Logged ${entry.containerName} (+${formatVolume(entry.amountMl, settings.unit)})`
    );
  };

  // Delete a log
  const handleDeleteLog = (id: string, notify = true) => {
    const deletedItem = logs.find((l) => l.id === id);
    const updated = deleteLog(id);
    setLogs(updated);

    if (notify && deletedItem) {
      showToast(`Removed ${formatVolume(deletedItem.amountMl, settings.unit)} entry`, () => {
        // Undo delete
        const restored = addLog({
          date: deletedItem.date,
          amountMl: deletedItem.amountMl,
          beverageType: deletedItem.beverageType,
          containerName: deletedItem.containerName,
          note: deletedItem.note,
          timestamp: deletedItem.timestamp,
        });
        setLogs((prev) => [restored, ...prev]);
      });
    }
  };

  // Update goal
  const handleSaveGoal = (goalMl: number) => {
    const updated: UserSettings = {
      ...settings,
      dailyGoalMl: goalMl,
    };
    setSettings(updated);
    saveSettings(updated);
    showToast(`Daily hydration goal updated to ${formatVolume(goalMl, settings.unit)}!`);
  };

  // Update settings
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Reset today
  const handleResetToday = () => {
    const filtered = logs.filter((l) => l.date !== todayStr);
    saveLogs(filtered);
    setLogs(filtered);
    setHasCelebratedToday(false);
    showToast("Today's water logs have been cleared.");
  };

  // Reload demo history
  const handleLoadDemoData = () => {
    localStorage.removeItem('aquatrack_logs_v1');
    const freshLogs = getLogs();
    setLogs(freshLogs);
    showToast('Loaded demo hydration history.');
  };

  // Export data as JSON
  const handleExportData = () => {
    const exportObj = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      logs,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aquatrack_backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Hydration data exported successfully!');
  };

  // Import data from JSON
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.logs && Array.isArray(parsed.logs)) {
          saveLogs(parsed.logs);
          setLogs(parsed.logs);
        }
        if (parsed.settings) {
          saveSettings(parsed.settings);
          setSettings(parsed.settings);
        }
        showToast('Hydration data restored successfully!');
      } catch {
        showToast('Error importing file. Please verify JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenGoalModal={() => setIsGoalModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        todayTotalMl={todayTotalMl}
        dailyGoalMl={settings.dailyGoalMl}
        unit={settings.unit}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Horizontal 7-Day Navigation Strip */}
        <DaySelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          dailyTotals={dailyTotals}
          dailyGoalMl={settings.dailyGoalMl}
        />

        {/* Tab 1: Tracker View (Centerpiece) */}
        {currentTab === 'tracker' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Reservoir and progress visual */}
            <WaterReservoir
              currentMl={selectedDateTotalMl}
              goalMl={settings.dailyGoalMl}
              unit={settings.unit}
              onOpenGoalModal={() => setIsGoalModalOpen(true)}
              onQuickNudge={handleQuickNudge}
              streakCount={streak.currentStreak}
            />

            {/* Daily Pacing Guide (only if viewing today) */}
            {selectedDate === todayStr && (
              <HydrationPacer
                currentMl={todayTotalMl}
                goalMl={settings.dailyGoalMl}
                wakeUpTime={settings.wakeUpTime}
                bedTime={settings.bedTime}
                unit={settings.unit}
              />
            )}

            {/* Quick Log Presets */}
            <QuickLogBar
              presets={settings.customPresets}
              unit={settings.unit}
              onLogPreset={handleLogPreset}
              onOpenCustomModal={() => setIsAddModalOpen(true)}
            />

            {/* Preview of today's recent logs with view all link */}
            <div className="pt-2">
              <HistoryTimeline
                logs={logs}
                selectedDate={selectedDate}
                unit={settings.unit}
                goalMl={settings.dailyGoalMl}
                onDeleteLog={handleDeleteLog}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Timeline View */}
        {currentTab === 'timeline' && (
          <div className="animate-fadeIn">
            <HistoryTimeline
              logs={logs}
              selectedDate={selectedDate}
              unit={settings.unit}
              goalMl={settings.dailyGoalMl}
              onDeleteLog={handleDeleteLog}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: Weekly Trends & Analytics */}
        {currentTab === 'analytics' && (
          <div className="animate-fadeIn">
            <WeeklyChart
              logs={logs}
              dailyGoalMl={settings.dailyGoalMl}
              unit={settings.unit}
              streak={streak}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>AquaTrack · Smart Daily Water Intake & Hydration Tracker</p>
      </footer>

      {/* Modals */}
      <AddDrinkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCustomDrink}
        unit={settings.unit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoalMl={settings.dailyGoalMl}
        onSaveGoal={handleSaveGoal}
        unit={settings.unit}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetToday={handleResetToday}
        onLoadDemoData={handleLoadDemoData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Toast Notification with Undo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700/80 text-white rounded-2xl shadow-2xl shadow-black/50 text-xs sm:text-sm animate-bounce duration-300">
          <Droplet className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage.text}</span>
          {toastMessage.undoAction && (
            <button
              onClick={() => {
                toastMessage.undoAction?.();
                setToastMessage(null);
              }}
              className="ml-2 flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
