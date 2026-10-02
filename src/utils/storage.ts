import { IntakeLog, UserSettings, PresetContainer, BeverageType, BeverageInfo } from '../types';

const LOGS_STORAGE_KEY = 'aquatrack_logs_v1';
const SETTINGS_STORAGE_KEY = 'aquatrack_settings_v1';

export const BEVERAGES: Record<BeverageType, BeverageInfo> = {
  water: {
    type: 'water',
    label: 'Plain Water',
    hydrationFactor: 1.0,
    color: '#06b6d4', // cyan-500
    iconName: 'Droplets'
  },
  sparkling: {
    type: 'sparkling',
    label: 'Sparkling Water',
    hydrationFactor: 1.0,
    color: '#38bdf8', // sky-400
    iconName: 'Sparkles'
  },
  lemon: {
    type: 'lemon',
    label: 'Infused / Lemon',
    hydrationFactor: 1.0,
    color: '#facc15', // yellow-400
    iconName: 'Citrus'
  },
  tea: {
    type: 'tea',
    label: 'Herbal & Green Tea',
    hydrationFactor: 0.98,
    color: '#34d399', // emerald-400
    iconName: 'Leaf'
  },
  coffee: {
    type: 'coffee',
    label: 'Coffee / Americano',
    hydrationFactor: 0.85,
    color: '#a16207', // amber-700
    iconName: 'Coffee'
  },
  electrolyte: {
    type: 'electrolyte',
    label: 'Electrolyte Drink',
    hydrationFactor: 1.1,
    color: '#818cf8', // indigo-400
    iconName: 'Zap'
  },
  coconut: {
    type: 'coconut',
    label: 'Coconut Water',
    hydrationFactor: 1.05,
    color: '#4ade80', // green-400
    iconName: 'Nut'
  },
  juice: {
    type: 'juice',
    label: 'Natural Juice / Smoothie',
    hydrationFactor: 0.9,
    color: '#fb923c', // orange-400
    iconName: 'CupSoda'
  }
};

export const DEFAULT_PRESETS: PresetContainer[] = [
  { id: 'p1', name: 'Cup', amountMl: 150, icon: 'cup' },
  { id: 'p2', name: 'Glass', amountMl: 250, icon: 'glass' },
  { id: 'p3', name: 'Mug / Can', amountMl: 330, icon: 'can' },
  { id: 'p4', name: 'Bottle', amountMl: 500, icon: 'bottle' },
  { id: 'p5', name: 'Sports Flask', amountMl: 750, icon: 'flask' },
  { id: 'p6', name: 'Big Tumbler', amountMl: 1000, icon: 'jug' }
];

export const DEFAULT_SETTINGS: UserSettings = {
  dailyGoalMl: 2500,
  unit: 'ml',
  soundEnabled: true,
  reminderInterval: 90,
  wakeUpTime: '07:30',
  bedTime: '23:00',
  customPresets: DEFAULT_PRESETS
};

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage error ignored
  }
}

export function getLogs(): IntakeLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      // Seed default initial today intake so the user starts with an engaging, populated state
      const initialLogs = getInitialDemoLogs();
      saveLogs(initialLogs);
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLogs(logs: IntakeLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Storage error ignored
  }
}

export function addLog(log: Omit<IntakeLog, 'id' | 'timestamp'> & { timestamp?: number }): IntakeLog {
  const all = getLogs();
  const newLog: IntakeLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: log.timestamp || Date.now()
  };
  const updated = [newLog, ...all];
  saveLogs(updated);
  return newLog;
}

export function deleteLog(id: string): IntakeLog[] {
  const all = getLogs();
  const updated = all.filter(l => l.id !== id);
  saveLogs(updated);
  return updated;
}

// Initial demo logs to give the user immediate visual momentum today and previous days
function getInitialDemoLogs(): IntakeLog[] {
  const today = new Date();
  const todayStr = getTodayDateString(today);
  const nowMs = today.getTime();

  // Create morning & afternoon drinks for today
  const morningTime = new Date(today);
  morningTime.setHours(8, 15, 0, 0);

  const midMorningTime = new Date(today);
  midMorningTime.setHours(10, 45, 0, 0);

  const lunchTime = new Date(today);
  lunchTime.setHours(13, 10, 0, 0);

  const logs: IntakeLog[] = [
    {
      id: 'demo_1',
      date: todayStr,
      timestamp: morningTime.getTime(),
      amountMl: 350,
      beverageType: 'water',
      containerName: 'Morning Glass',
      note: 'Waking hydration'
    },
    {
      id: 'demo_2',
      date: todayStr,
      timestamp: midMorningTime.getTime(),
      amountMl: 250,
      beverageType: 'lemon',
      containerName: 'Lemon Glass',
      note: 'Work desk recharge'
    },
    {
      id: 'demo_3',
      date: todayStr,
      timestamp: lunchTime.getTime(),
      amountMl: 500,
      beverageType: 'water',
      containerName: 'Bottle'
    }
  ];

  // Also seed past 5 days with realistic data so weekly charts look great right away
  for (let i = 1; i <= 6; i++) {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - i);
    const dateStr = getTodayDateString(pastDate);
    const dayGoal = 2500;
    
    // Vary between 2100ml and 2800ml
    const pastTotal = Math.round(2100 + Math.sin(i * 1.5) * 600);
    const count = 4;
    const split = Math.round(pastTotal / count);

    for (let c = 0; c < count; c++) {
      const logD = new Date(pastDate);
      logD.setHours(8 + c * 3, 20, 0, 0);
      logs.push({
        id: `demo_past_${i}_${c}`,
        date: dateStr,
        timestamp: logD.getTime(),
        amountMl: split,
        beverageType: c === 1 ? 'tea' : 'water',
        containerName: 'Glass'
      });
    }
  }

  return logs;
}

// Calculate streak of consecutive days meeting the daily goal
export function calculateStreak(logs: IntakeLog[], goalMl: number): { currentStreak: number; bestStreak: number } {
  const dailyTotals = new Map<string, number>();

  logs.forEach(log => {
    const prev = dailyTotals.get(log.date) || 0;
    dailyTotals.set(log.date, prev + log.amountMl);
  });

  const todayStr = getTodayDateString();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Check today first
  const todayTotal = dailyTotals.get(todayStr) || 0;
  if (todayTotal >= goalMl) {
    currentStreak++;
  }

  // Iterate backwards from yesterday
  const checkDate = new Date();
  checkDate.setDate(checkDate.getDate() - 1);

  for (let i = 0; i < 365; i++) {
    const dStr = getTodayDateString(checkDate);
    const total = dailyTotals.get(dStr) || 0;

    if (total >= goalMl) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak across entire log dataset
  const sortedDates = Array.from(dailyTotals.keys()).sort();
  for (let i = 0; i < sortedDates.length; i++) {
    const total = dailyTotals.get(sortedDates[i]) || 0;
    if (total >= goalMl) {
      tempStreak++;
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak)
  };
}
