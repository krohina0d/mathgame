export interface Cell {
  value: number;
  row: number;
  col: number;
  isSelected: boolean;
}

export interface Pair {
  cell1: Cell;
  cell2: Cell;
  type: 'sum' | 'difference';
  found: boolean;
}

export interface GameState {
  targetNumber: number;
  selectedCells: Cell[];
  score: number;
  lastAttemptSuccess: boolean | null;
  level: number;
  foundPairs: Pair[];
  isTimeMode: boolean;
  timeLeft: number; // в секундах
  totalFoundPairs: number;
  user: User | null;
}

export interface LevelConfig {
  size: number;
  maxNumber: number;
  maxTarget: number;
}

export const GAME_TIME = 180; // 3 минуты в секундах
export const CORRECT_POINTS = 10;
export const MISTAKE_PENALTY = -15;

export const LEVELS: Record<number, LevelConfig> = {
  1: { size: 3, maxNumber: 10, maxTarget: 10 },
  2: { size: 4, maxNumber: 10, maxTarget: 10 },
  3: { size: 5, maxNumber: 10, maxTarget: 10 },
  4: { size: 5, maxNumber: 20, maxTarget: 20 },
  5: { size: 6, maxNumber: 20, maxTarget: 20 }
};

export interface Achievement {
  id: string;
  title: string;
  description: string;
  requiredStreak: number;
  level: number;
  icon: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: number;
  level: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  achievements?: UserAchievement[];
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'streak_10',
    title: 'Начинающий математик',
    description: '10 правильных ответов подряд',
    requiredStreak: 10,
    level: 1,
    icon: '🎯'
  },
  {
    id: 'streak_20',
    title: 'Опытный счетовод',
    description: '20 правильных ответов подряд',
    requiredStreak: 20,
    level: 1,
    icon: '🎯🎯'
  },
  {
    id: 'streak_50',
    title: 'Мастер чисел',
    description: '50 правильных ответов подряд',
    requiredStreak: 50,
    level: 1,
    icon: '🏆'
  },
  {
    id: 'streak_100',
    title: 'Легенда математики',
    description: '100 правильных ответов подряд',
    requiredStreak: 100,
    level: 1,
    icon: '👑'
  }
];

export interface LeaderboardEntry {
  id?: string;
  userId: string;
  displayName: string;
  score: number;
  level: number;
  foundPairs: number;
  timestamp: number;
} 