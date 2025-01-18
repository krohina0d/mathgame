import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, ButtonGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Cell, GameState, LEVELS } from '../types/types';
import GameCharacter from './GameCharacter';

const StyledCell = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
  '&.selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const NumberGame = () => {
  const [attempt, setAttempt] = useState(0);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<GameState>({
    targetNumber: 0,
    selectedCells: [],
    score: 0,
    lastAttemptSuccess: null,
    level: 1
  });

  const currentLevelConfig = LEVELS[gameState.level];

  const findRandomAdjacentPair = (board: Cell[][]): { 
    pair: [Cell, Cell], 
    sum: number, 
    difference: number 
  } => {
    const size = board.length;
    const pairs: [Cell, Cell][] = [];
    
    // Собираем все соседние пары
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Проверяем правого соседа
        if (j < size - 1) {
          pairs.push([board[i][j], board[i][j + 1]]);
        }
        // Проверяем нижнего соседа
        if (i < size - 1) {
          pairs.push([board[i][j], board[i + 1][j]]);
        }
      }
    }

    // Выбираем случайную пару
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    const sum = randomPair[0].value + randomPair[1].value;
    const difference = Math.abs(randomPair[0].value - randomPair[1].value);

    return {
      pair: randomPair,
      sum,
      difference
    };
  };

  const generateTargetNumber = useCallback((board: Cell[][]): number => {
    const { sum, difference } = findRandomAdjacentPair(board);
    return Math.random() < 0.5 ? sum : difference;
  }, []);

  const generateBoard = useCallback((): Cell[][] => {
    const { size, maxNumber } = LEVELS[gameState.level];
    const board: Cell[][] = [];
    
    for (let i = 0; i < size; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < size; j++) {
        row.push({
          value: Math.floor(Math.random() * maxNumber) + 1,
          row: i,
          col: j,
          isSelected: false,
        });
      }
      board.push(row);
    }
    return board;
  }, [gameState.level]);

  useEffect(() => {
    const newBoard = generateBoard();
    setBoard(newBoard);
    const newTargetNumber = generateTargetNumber(newBoard);
    setGameState(prev => ({
      ...prev,
      targetNumber: newTargetNumber,
      selectedCells: [],
      lastAttemptSuccess: null
    }));
  }, [gameState.level, generateBoard, generateTargetNumber]);

  useEffect(() => {
    const newBoard = generateBoard();
    setBoard(newBoard);
    const newTargetNumber = generateTargetNumber(newBoard);
    setGameState(prev => ({
      ...prev,
      targetNumber: newTargetNumber
    }));
  }, []);

  const handleLevelChange = (newLevel: number) => {
    setGameState(prev => ({
      ...prev,
      level: newLevel,
      score: 0
    }));
    setAttempt(0);
  };

  const isAdjacent = (cell1: Cell, cell2: Cell): boolean => {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const handleCellClick = useCallback((cell: Cell) => {
    setGameState(prevState => {
      const selectedCells = [...prevState.selectedCells];

      if (selectedCells.length === 0) {
        return { 
          ...prevState, 
          selectedCells: [cell],
          lastAttemptSuccess: null 
        };
      }

      if (selectedCells.length === 1) {
        if (isAdjacent(selectedCells[0], cell)) {
          const sum = selectedCells[0].value + cell.value;
          const diff = Math.abs(selectedCells[0].value - cell.value);

          if (sum === prevState.targetNumber || diff === prevState.targetNumber) {
            setAttempt(prev => prev + 1);
            const newBoard = generateBoard();
            setBoard(newBoard);
            const newTargetNumber = generateTargetNumber(newBoard);
            return {
              ...prevState,
              targetNumber: newTargetNumber,
              selectedCells: [],
              score: prevState.score + 1,
              lastAttemptSuccess: true
            };
          }
        }
        setAttempt(prev => prev + 1);
        return { 
          ...prevState, 
          selectedCells: [],
          lastAttemptSuccess: false 
        };
      }

      return { ...prevState, selectedCells: [] };
    });

    setBoard(prevBoard => 
      prevBoard.map(row =>
        row.map(c => ({
          ...c,
          isSelected: c.row === cell.row && c.col === cell.col
        }))
      )
    );
  }, [board, generateBoard, generateTargetNumber, isAdjacent]);

  const getSimpleExample = (targetNumber: number) => {
    // Для сложения
    let num1 = Math.min(Math.floor(targetNumber/2), 5);
    let num2 = targetNumber - num1;
    
    // Если второе число больше 9, корректируем
    if (num2 > 9) {
      num1 = 4;
      num2 = targetNumber - num1;
    }

    // Для вычитания (всегда используем числа меньше 10)
    const smallNum = Math.min(3, Math.floor(targetNumber/2));
    const bigNum = targetNumber + smallNum;

    return {
      additionExample: { num1, num2 },
      subtractionExample: { smallNum, bigNum: Math.min(bigNum, 9) }
    };
  };

  if (board.length === 0) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', textAlign: 'center' }}>
        Весёлая математика! 🎮
      </Typography>

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        mb: 4
      }}>
        <ButtonGroup 
          variant="contained" 
          color="primary"
          size="large"
          sx={{ boxShadow: 3 }}
        >
          {Object.keys(LEVELS).map((level) => (
            <Button
              key={level}
              onClick={() => handleLevelChange(Number(level))}
              sx={{
                bgcolor: gameState.level === Number(level) ? 'primary.dark' : 'primary.main',
                minWidth: '100px'
              }}
            >
              Уровень {level}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Box sx={{ 
        mb: 4, 
        p: 3, 
        bgcolor: 'info.light', 
        borderRadius: 2,
        border: '2px solid #2196f3',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
          Как играть? 🤔
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 2 }}>
          Привет! Давай поиграем в поиск волшебных пар чисел! 🔍
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
          Правила простые:
        </Typography>
        <Box sx={{ pl: 2, mb: 2 }}>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 1 }}>
            • Выбери два числа, которые стоят рядом (по вертикали ⬆️⬇️ или горизонтали ⬅️➡️)
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            • Эти числа должны быть волшебными: если их сложить (+) ИЛИ если из большего вычесть меньшее (-), 
              получится заданное число {gameState.targetNumber} ✨
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ 
          fontSize: '1.1rem', 
          bgcolor: 'background.paper', 
          p: 1, 
          borderRadius: 1,
          border: '1px dashed primary.main'
        }}>
          {(() => {
            const { additionExample, subtractionExample } = getSimpleExample(gameState.targetNumber);
            return (
              <>
                Например, чтобы получить число {gameState.targetNumber}, можно:<br/>
                • Найти два числа, которые дают {gameState.targetNumber} при сложении:<br/>
                  {additionExample.num1} + {additionExample.num2} = {gameState.targetNumber} ✨<br/>
                • ИЛИ найти два числа, разница между которыми равна {gameState.targetNumber}:<br/>
                  {subtractionExample.bigNum} - {subtractionExample.smallNum} = {gameState.targetNumber} ✨
              </>
            );
          })()}
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        gap: 3,
        mb: 3
      }}>
        <Paper sx={{ 
          p: 2,
          borderRadius: 2,
          bgcolor: '#1a237e',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          minWidth: '200px',
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
            Уровень {gameState.level}
          </Typography>
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
            Найди число:
          </Typography>
          <Typography variant="h4" sx={{ 
            color: '#fff',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            {gameState.targetNumber} 🎯
          </Typography>
        </Paper>
        
        <Paper sx={{ 
          p: 2,
          borderRadius: 2,
          bgcolor: '#2e7d32',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          minWidth: '200px',
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
            Твои очки:
          </Typography>
          <Typography variant="h4" sx={{ 
            color: '#fff',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            {gameState.score} ⭐
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        gap: 4,
        alignItems: 'flex-start',
        flexWrap: { xs: 'wrap', md: 'nowrap' }
      }}>
        <Box sx={{ 
          width: 'fit-content',
          margin: '0 auto'
        }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(${currentLevelConfig.size}, 1fr)`,
            gap: 2,
            width: 'fit-content'
          }}>
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <StyledCell
                  key={`${rowIndex}-${colIndex}`}
                  className={cell.isSelected ? 'selected' : ''}
                  onClick={() => handleCellClick(cell)}
                  elevation={1}
                  sx={{
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}
                >
                  {cell.value}
                </StyledCell>
              ))
            )}
          </Box>
        </Box>

        <Box sx={{ 
          flex: '0 0 auto',
          minWidth: { xs: '100%', md: '250px' },
          mt: 10,
          position: 'relative',
          zIndex: 1
        }}>
          <GameCharacter 
            isSuccess={gameState.lastAttemptSuccess}
            attempt={attempt}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default NumberGame; 