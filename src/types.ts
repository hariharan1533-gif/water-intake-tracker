export type Unit = 'ml' | 'oz';

export type BeverageType = 
  | 'water'
  | 'sparkling'
  | 'lemon'
  | 'tea'
  | 'coffee'
  | 'electrolyte'
  | 'coconut'
  | 'juice';

export interface BeverageInfo {
  type: BeverageType;
  label: string;
  hydrationFactor: number; // e.g., 1.0 for water, 0.85 for coffee, 1.1 for electrolyte
  color: string;
  iconName: string;
}

export interface IntakeLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  amountMl: number;
  beverageType: BeverageType;
  containerName?: string;
  note?: string;
}

export interface PresetContainer {
  id: string;
  name: string;
  amountMl: number;
  icon: 'cup' | 'glass' | 'can' | 'bottle' | 'flask' | 'jug';
}

export interface UserSettings {
  dailyGoalMl: number;
  unit: Unit;
  soundEnabled: boolean;
  reminderInterval: number; // in minutes (0 = disabled)
  wakeUpTime: string; // "07:00"
  bedTime: string; // "23:00"
  customPresets: PresetContainer[];
}

export interface DailyStats {
  date: string;
  totalMl: number;
  goalMl: number;
  percentage: number;
  logCount: number;
  reachedGoal: boolean;
}
