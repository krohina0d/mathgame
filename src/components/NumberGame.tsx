import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, ButtonGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Cell, GameState, LEVELS, Pair } from '../types/types';
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
    level: 1,
    foundPairs: []
  });
  const [showAllPairs, setShowAllPairs] = useState(false);

  const currentLevelConfig = LEVELS[gameState.level];

  const generateTargetNumber = useCallback((board: Cell[][]): number => {
    // Находим все возможные пары
    const size = board.length;
    const pairs: { sum: number; difference: number }[] = [];
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Проверяем правого соседа
        if (j < size - 1) {
          const sum = board[i][j].value + board[i][j + 1].value;
          const difference = Math.abs(board[i][j].value - board[i][j + 1].value);
          pairs.push({ sum, difference });
        }
        // Проверяем нижнего соседа
        if (i < size - 1) {
          const sum = board[i][j].value + board[i + 1][j].value;
          const difference = Math.abs(board[i][j].value - board[i + 1][j].value);
          pairs.push({ sum, difference });
        }
      }
    }

    // Выбираем случайную пару
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    return Math.random() < 0.5 ? randomPair.sum : randomPair.difference;
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

  const getAllPairs = useCallback((board: Cell[][], targetNumber: number) => {
    const size = board.length;
    const pairs: { cell1: Cell; cell2: Cell; type: 'sum' | 'difference' }[] = [];
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Проверяем правого соседа
        if (j < size - 1) {
          const cell1 = board[i][j];
          const cell2 = board[i][j + 1];
          const sum = cell1.value + cell2.value;
          const diff = Math.abs(cell1.value - cell2.value);
          
          if (sum === targetNumber) {
            pairs.push({ cell1, cell2, type: 'sum' });
          }
          if (diff === targetNumber) {
            pairs.push({ cell1, cell2, type: 'difference' });
          }
        }
        // Проверяем нижнего соседа
        if (i < size - 1) {
          const cell1 = board[i][j];
          const cell2 = board[i + 1][j];
          const sum = cell1.value + cell2.value;
          const diff = Math.abs(cell1.value - cell2.value);
          
          if (sum === targetNumber) {
            pairs.push({ cell1, cell2, type: 'sum' });
          }
          if (diff === targetNumber) {
            pairs.push({ cell1, cell2, type: 'difference' });
          }
        }
      }
    }
    return pairs;
  }, []);

  const initializeGame = useCallback(() => {
    const newBoard = generateBoard();
    const newTargetNumber = generateTargetNumber(newBoard);
    const allPairs = getAllPairs(newBoard, newTargetNumber).map(pair => ({
      ...pair,
      found: false
    }));

    setBoard(newBoard);
    setGameState(prev => ({
      ...prev,
      targetNumber: newTargetNumber,
      selectedCells: [],
      foundPairs: allPairs,
      lastAttemptSuccess: null
    }));
  }, [generateBoard, generateTargetNumber, getAllPairs]);

  useEffect(() => {
    initializeGame();
  }, [gameState.level]);

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

          // Проверяем, является ли эта пара новой найденной парой
          const pairIndex = prevState.foundPairs.findIndex(
            pair => !pair.found && 
            ((pair.cell1.row === selectedCells[0].row && 
              pair.cell1.col === selectedCells[0].col &&
              pair.cell2.row === cell.row && 
              pair.cell2.col === cell.col) ||
             (pair.cell1.row === cell.row && 
              pair.cell1.col === cell.col &&
              pair.cell2.row === selectedCells[0].row && 
              pair.cell2.col === selectedCells[0].col)) &&
            ((pair.type === 'sum' && sum === prevState.targetNumber) ||
             (pair.type === 'difference' && diff === prevState.targetNumber))
          );

          if (pairIndex !== -1) {
            const newFoundPairs = [...prevState.foundPairs];
            newFoundPairs[pairIndex] = { ...newFoundPairs[pairIndex], found: true };

            // Проверяем, найдены ли все пары
            const allFound = newFoundPairs.every(pair => pair.found);
            
            if (allFound) {
              // Если все пары найдены, готовим новую игру
              setTimeout(() => {
                initializeGame();
              }, 1000);
            }

            return {
              ...prevState,
              foundPairs: newFoundPairs,
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
  }, [initializeGame]);

  const handleContinue = useCallback(() => {
    setShowAllPairs(false);
    const newBoard = generateBoard();
    setBoard(newBoard);
    const newTargetNumber = generateTargetNumber(newBoard);
    setGameState(prev => ({
      ...prev,
      targetNumber: newTargetNumber,
      selectedCells: [],
      lastAttemptSuccess: null
    }));
  }, [generateBoard, generateTargetNumber]);

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

  // Добавим функцию подсчета возможных пар
  const countPossiblePairs = useCallback((board: Cell[][], targetNumber: number): number => {
    const size = board.length;
    let count = 0;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Проверяем правого соседа
        if (j < size - 1) {
          const sum = board[i][j].value + board[i][j + 1].value;
          const diff = Math.abs(board[i][j].value - board[i][j + 1].value);
          if (sum === targetNumber || diff === targetNumber) {
            count++;
          }
        }
        // Проверяем нижнего соседа
        if (i < size - 1) {
          const sum = board[i][j].value + board[i + 1][j].value;
          const diff = Math.abs(board[i][j].value - board[i + 1][j].value);
          if (sum === targetNumber || diff === targetNumber) {
            count++;
          }
        }
      }
    }
    return count;
  }, []);

  if (board.length === 0) {
    return null;
  }

  const renderCell = (cell: Cell) => {
    let borderStyle = {};
    let backgroundColor = 'background.paper';

    // Проверяем, является ли клетка первой выбранной
    const isFirstSelected = gameState.selectedCells.length === 1 && 
      gameState.selectedCells[0].row === cell.row && 
      gameState.selectedCells[0].col === cell.col;

    if (isFirstSelected) {
      backgroundColor = 'primary.light';
    }

    // Проверяем все найденные пары
    const foundPair = gameState.foundPairs.find(
      pair => pair.found && 
      ((pair.cell1.row === cell.row && pair.cell1.col === cell.col) ||
       (pair.cell2.row === cell.row && pair.cell2.col === cell.col))
    );

    if (foundPair) {
      const isFirstCell = foundPair.cell1.row === cell.row && foundPair.cell1.col === cell.col;
      const isHorizontalPair = foundPair.cell1.row === foundPair.cell2.row;
      
      // Генерируем цвет для пары
      const pairIndex = gameState.foundPairs.indexOf(foundPair);
      const hue = (pairIndex * 137.508) % 360;
      const color = `hsl(${hue}, 70%, 50%)`;

      // Определяем стиль рамки
      if (isHorizontalPair) {
        if (isFirstCell) {
          borderStyle = {
            borderLeft: '4px solid ' + color,
            borderTop: '4px solid ' + color,
            borderBottom: '4px solid ' + color,
            marginRight: '-2px',
            zIndex: pairIndex + 1,
          };
        } else {
          borderStyle = {
            borderRight: '4px solid ' + color,
            borderTop: '4px solid ' + color,
            borderBottom: '4px solid ' + color,
            marginLeft: '-2px',
            zIndex: pairIndex + 1,
          };
        }
      } else {
        if (isFirstCell) {
          borderStyle = {
            borderLeft: '4px solid ' + color,
            borderRight: '4px solid ' + color,
            borderTop: '4px solid ' + color,
            marginBottom: '-2px',
            zIndex: pairIndex + 1,
          };
        } else {
          borderStyle = {
            borderLeft: '4px solid ' + color,
            borderRight: '4px solid ' + color,
            borderBottom: '4px solid ' + color,
            marginTop: '-2px',
            zIndex: pairIndex + 1,
          };
        }
      }

      // Добавляем маркер операции
      const operationMark = foundPair.type === 'sum' ? '+' : '−';
      borderStyle = {
        ...borderStyle,
        '&::after': {
          content: `"${operationMark}"`,
          position: 'absolute',
          top: isFirstCell ? '-12px' : 'auto',
          bottom: !isFirstCell ? '-12px' : 'auto',
          right: isHorizontalPair ? '50%' : '-12px',
          backgroundColor: color,
          color: 'white',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          transform: isHorizontalPair ? 'translateX(50%)' : 'none',
          zIndex: pairIndex + 2,
        }
      };
    }

    return (
      <StyledCell
        key={`${cell.row}-${cell.col}`}
        onClick={() => handleCellClick(cell)}
        elevation={1}
        sx={{
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          position: 'relative',
          transition: 'all 0.3s ease',
          margin: '2px',
          ...borderStyle,
          bgcolor: backgroundColor,
          '&:hover': {
            bgcolor: isFirstSelected 
              ? 'primary.light' 
              : (Object.keys(borderStyle).length === 0 ? 'grey.100' : 'background.paper')
          }
        }}
      >
        {cell.value}
      </StyledCell>
    );
  };

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
          <Typography variant="body1" sx={{ color: '#fff', mt: 1, opacity: 0.9 }}>
            (осталось найти {countPossiblePairs(board, gameState.targetNumber) - gameState.foundPairs.filter(p => p.found).length} пар)
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
              row.map((cell, colIndex) => renderCell(cell))
            )}
          </Box>
          
          {showAllPairs && (
            <Box sx={{ 
              mt: 3, 
              display: 'flex', 
              justifyContent: 'center' 
            }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleContinue}
                sx={{ minWidth: '200px' }}
              >
                Продолжить ➡️
              </Button>
            </Box>
          )}
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