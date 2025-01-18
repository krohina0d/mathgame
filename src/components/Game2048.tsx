import { Box, Typography, Button, Fab } from '@mui/material';
import { useCallback, useEffect, useState, TouchEvent } from 'react';
import { GameState, Direction, Grid } from '../types/game.types';
import { styled } from '@mui/material/styles';
import { 
  initializeGrid, 
  addNewTile, 
  getCellBackground, 
  isGameOver, 
  hasWon 
} from '../utils/gameLogic';
import { useGame } from '../context/GameContext';
import PlayerNameDialog from './PlayerNameDialog';
import Leaderboard from './Leaderboard';
import NlognLogo from './NlognLogo';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

const GameContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  minHeight: '100%',
  width: '100%',
  position: 'relative',
  touchAction: 'pan-y',
}));

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: '#bbada0',
  borderRadius: theme.spacing(1),
  touchAction: 'none',
  maxWidth: '100%',
  boxSizing: 'border-box',
  margin: '0 auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    gap: theme.spacing(0.5),
  }
}));

const Cell = styled(Box)<{ value: number }>(({ value }) => ({
  width: 80,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: getCellBackground(value),
  color: value <= 4 ? '#776e65' : '#f9f6f2',
  fontSize: '24px',
  fontWeight: 'bold',
  borderRadius: '4px',
  transition: 'all 0.1s',
}));

const Game2048 = () => {
  const { playerName, updateHighScores } = useGame();
  const [showNameDialog, setShowNameDialog] = useState(!playerName);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    grid: initializeGrid(),
    score: 0,
    gameOver: false,
    won: false,
  });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd(null);
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (Math.max(Math.abs(distanceX), Math.abs(distanceY)) < minSwipeDistance) {
      return;
    }

    if (isHorizontalSwipe) {
      if (distanceX > 0) {
        moveGrid('left');
      } else {
        moveGrid('right');
      }
    } else {
      if (distanceY > 0) {
        moveGrid('up');
      } else {
        moveGrid('down');
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver) return;

    const keyDirections: { [key: string]: Direction } = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };

    const direction = keyDirections[event.key];
    if (direction) {
      event.preventDefault();
      moveGrid(direction);
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const moveGrid = (direction: Direction) => {
    const newGrid = [...gameState.grid.map(row => [...row])];
    let newScore = gameState.score;
    let moved = false;

    const rotate = (grid: Grid): Grid => {
      const N = grid.length;
      const rotated = Array(N).fill(0).map(() => Array(N).fill(0));
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          rotated[i][j] = grid[N - 1 - j][i];
        }
      }
      return rotated;
    };

    const moveLeft = (grid: Grid): [Grid, number, boolean] => {
      let score = 0;
      let hasMoved = false;
      
      for (let i = 0; i < 4; i++) {
        let row = grid[i].filter(cell => cell !== 0);
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2;
            score += row[j];
            row.splice(j + 1, 1);
            hasMoved = true;
          }
        }
        const newRow = [...row, ...Array(4 - row.length).fill(0)];
        if (JSON.stringify(grid[i]) !== JSON.stringify(newRow)) {
          hasMoved = true;
        }
        grid[i] = newRow;
      }
      return [grid, score, hasMoved];
    };

    // Подготавливаем сету в зависимости от направления
    let tempGrid = [...newGrid];
    if (direction === 'up') {
      tempGrid = rotate(rotate(rotate(tempGrid)));
    } else if (direction === 'right') {
      tempGrid = rotate(rotate(tempGrid));
    } else if (direction === 'down') {
      tempGrid = rotate(tempGrid);
    }

    // Выполняем движение влево
    let [movedGrid, scoreIncrease, hasMoved] = moveLeft(tempGrid);

    // Возвращаем сетку в исходное положение
    if (direction === 'up') {
      movedGrid = rotate(movedGrid);
    } else if (direction === 'right') {
      movedGrid = rotate(rotate(movedGrid));
    } else if (direction === 'down') {
      movedGrid = rotate(rotate(rotate(movedGrid)));
    }

    if (hasMoved) {
      newScore += scoreIncrease;
      moved = true;
      newGrid.splice(0, newGrid.length, ...movedGrid);
    }

    if (moved) {
      addNewTile(newGrid);
      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        score: newScore,
        gameOver: isGameOver(newGrid),
        won: hasWon(newGrid),
      }));
    }
  };

  const resetGame = () => {
    setScoreSubmitted(false);
    setGameState({
      grid: initializeGrid(),
      score: 0,
      gameOver: false,
      won: false,
    });
  };

  useEffect(() => {
    if ((gameState.gameOver || gameState.won) && !scoreSubmitted) {
      console.log('Game ended state:', {
        isGameOver: gameState.gameOver,
        isWon: gameState.won,
        finalScore: gameState.score,
        playerName: playerName
      });
      
      if (gameState.score > 0) {
        console.log('Attempting to update high scores with score:', gameState.score);
        updateHighScores(gameState.score);
        setScoreSubmitted(true);
      }
    }
  }, [gameState.gameOver, gameState.won, gameState.score, updateHighScores, playerName, scoreSubmitted]);

  const scrollToLeaderboard = () => {
    const leaderboardElement = document.getElementById('leaderboard');
    if (leaderboardElement) {
      leaderboardElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <GameContainer>
      <NlognLogo />
      <Typography variant="h4" gutterBottom>
        2048
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {playerName && (
          <>
            <Typography variant="subtitle1">
              Игрок: {playerName}
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => setShowNameDialog(true)}
            >
              Изменить имя
            </Button>
          </>
        )}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Score: {gameState.score}</Typography>
        <Button variant="contained" onClick={resetGame}>
          New Game
        </Button>
      </Box>
      <GridContainer
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {gameState.grid.map((row, i) =>
          row.map((cell, j) => (
            <Cell key={`${i}-${j}`} value={cell}>
              {cell !== 0 ? cell : ''}
            </Cell>
          ))
        )}
      </GridContainer>
      {(gameState.gameOver || gameState.won) && (
        <Typography variant="h5" sx={{ mt: 2 }}>
          {gameState.won ? 'You won!' : 'Game Over!'}
        </Typography>
      )}
      <Fab
        color="primary"
        size="medium"
        onClick={scrollToLeaderboard}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <LeaderboardIcon />
      </Fab>
      <Leaderboard id="leaderboard" />
      <PlayerNameDialog
        open={showNameDialog}
        onClose={() => setShowNameDialog(false)}
      />
    </GameContainer>
  );
};

export default Game2048; 