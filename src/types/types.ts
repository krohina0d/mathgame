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
}

export interface LevelConfig {
  size: number;
  maxNumber: number;
  maxTarget: number;
}

export const LEVELS: Record<number, LevelConfig> = {
  1: { size: 3, maxNumber: 10, maxTarget: 10 },
  2: { size: 4, maxNumber: 10, maxTarget: 10 },
  3: { size: 5, maxNumber: 10, maxTarget: 10 },
  4: { size: 5, maxNumber: 20, maxTarget: 20 },
  5: { size: 6, maxNumber: 20, maxTarget: 20 }
}; 