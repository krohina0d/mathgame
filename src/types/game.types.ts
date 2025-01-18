export type Grid = number[][];

export interface GameState {
  grid: Grid;
  score: number;
  gameOver: boolean;
  won: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface PlayerScore {
  id: string;
  name: string;
  score: number;
  timestamp: number;
}

export interface GameContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  highScores: PlayerScore[];
  updateHighScores: (score: number) => void;
  isAdmin: boolean;
  deleteScore: (scoreId: string) => Promise<void>;
  clearAllScores: () => Promise<void>;
} 