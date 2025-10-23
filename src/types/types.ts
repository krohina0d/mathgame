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
export const CORRECT_POINTS = 2; // +2 балла за правильную пару
export const MISTAKE_PENALTY = -5; // -5 баллов за ошибку

// Фиксированная конфигурация для поля 3x3
export const GAME_CONFIG: LevelConfig = {
  size: 3,
  maxNumber: 10,
  maxTarget: 10
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
}

export interface LeaderboardEntry {
  id?: string;
  userId: string;
  displayName: string;
  score: number;
  foundPairs: number;
  timestamp: number;
} 