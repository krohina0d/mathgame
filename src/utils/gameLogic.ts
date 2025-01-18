import { Grid } from '../types/game.types';

export const initializeGrid = (): Grid => {
  const grid: Grid = Array(4).fill(0).map(() => Array(4).fill(0));
  addNewTile(grid);
  addNewTile(grid);
  return grid;
};

export const addNewTile = (grid: Grid): void => {
  const emptyCells = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) {
        emptyCells.push({ i, j });
      }
    }
  }

  if (emptyCells.length > 0) {
    const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[i][j] = Math.random() < 0.9 ? 2 : 4;
  }
};

export const getCellBackground = (value: number): string => {
  const colors: { [key: number]: string } = {
    0: '#cdc1b4',
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
  };
  return colors[value] || '#cdc1b4';
};

export const isGameOver = (grid: Grid): boolean => {
  // Check for empty cells
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 0) return false;
    }
  }

  // Check for possible merges
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (
        (i < 3 && grid[i][j] === grid[i + 1][j]) ||
        (j < 3 && grid[i][j] === grid[i][j + 1])
      ) {
        return false;
      }
    }
  }

  return true;
};

export const hasWon = (grid: Grid): boolean => {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (grid[i][j] === 2048) return true;
    }
  }
  return false;
}; 