import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Cell, GameState, GAME_CONFIG, Pair, GAME_TIME, CORRECT_POINTS, MISTAKE_PENALTY, LeaderboardEntry, User } from '../types/types';
import { saveUser, getUser, saveLeaderboardEntry, getLeaderboardEntries } from '../services/storage';
import { useSnackbar } from 'notistack';
import CatCharacter, { CatState } from './CatCharacter';
import FishRainGame from './FishRainGame';
import fishImage from '../assets/fish.png';

const NumberGame = () => {
  const [attempt, setAttempt] = useState(0);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<GameState>({
    targetNumber: 0,
    selectedCells: [],
    score: 0,
    lastAttemptSuccess: null,
    foundPairs: [],
    isTimeMode: false,
    timeLeft: GAME_TIME,
    totalFoundPairs: 0,
    user: getUser()
  });
  const [showAllPairs, setShowAllPairs] = useState(false);
  const [hintPair, setHintPair] = useState<Pair | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [catState, setCatState] = useState<CatState>('waiting');
  const [showFishRainGame, setShowFishRainGame] = useState(false);
  const [lastScoreTrigger, setLastScoreTrigger] = useState(0);
  const [playedLevels, setPlayedLevels] = useState<Set<number>>(new Set());
  const { enqueueSnackbar } = useSnackbar();

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
    const { size, maxNumber } = GAME_CONFIG;
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
  }, []);

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
    setSelectedCell(null); // Сбрасываем выбранную ячейку
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
  }, []);

  const toggleTimeMode = () => {
    if (!gameState.user) {
      return;
    }

    setGameState(prev => ({
      ...prev,
      isTimeMode: !prev.isTimeMode,
      timeLeft: GAME_TIME,
      score: 0
    }));
    setAttempt(0);
    setShowAllPairs(false);
    initializeGame();
  };

  const isAdjacent = (cell1: Cell, cell2: Cell): boolean => {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };


  const handleCellClick = useCallback((cell: Cell) => {
    if (showAllPairs) return;

    setGameState(prevState => {
      const selectedCells = [...prevState.selectedCells];

      if (selectedCells.length === 0) {
        // Первое нажатие - выбираем ячейку
        setSelectedCell(cell);
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

            const allFound = newFoundPairs.every(pair => pair.found);
            
            if (allFound) {
              setTimeout(() => {
                initializeGame();
              }, 1000);
            }

            const newScore = prevState.score + CORRECT_POINTS; // Всегда +2 балла за правильную пару
            
            // Котик радуется за правильную пару
            setCatState('happy');
            
            // Проверяем, нужно ли запустить мини-игру
            const previousScore = prevState.score;
            const previousMultiplier = Math.floor(previousScore / 20);
            const newMultiplier = Math.floor(newScore / 20);
            
            // Запускаем мини-игру если:
            // 1. Перешли на новый множитель (например, с 1 на 2 означает переход через 40)
            // 2. Этот уровень еще не был сыгран
            const justCrossedLevel = newMultiplier > previousMultiplier && newMultiplier > 0;
            const isNewLevel = !playedLevels.has(newMultiplier);
            
            if (justCrossedLevel && isNewLevel) {
              setPlayedLevels(prev => new Set([...prev, newMultiplier]));
              setLastScoreTrigger(newScore);
              setShowFishRainGame(true);
            }
            
            const result = {
              ...prevState,
              foundPairs: newFoundPairs,
              selectedCells: [],
              score: newScore,
              lastAttemptSuccess: true,
              totalFoundPairs: prevState.totalFoundPairs + 1
            };

            // Сбрасываем выбранную ячейку при успешном нахождении пары
            setSelectedCell(null);
            return result;
          }
        }
        
        // Неудачная попытка - сбрасываем выбор
        setSelectedCell(null);
        setAttempt(prev => prev + 1);
        
        // Котик грустит из-за неправильной пары
        setCatState('sad');
        
        return { 
          ...prevState, 
          selectedCells: [],
          lastAttemptSuccess: false,
          score: prevState.score + MISTAKE_PENALTY // Всегда -5 баллов за ошибку
        };
      }

      return { ...prevState, selectedCells: [] };
    });
  }, [initializeGame, gameState.isTimeMode, gameState.timeLeft]);

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayAgain = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      timeLeft: GAME_TIME,
      foundPairs: [],
      totalFoundPairs: 0,
      isTimeMode: false
    }));
    initializeGame();
  };

  const handleAuth = (user: User) => {
    saveUser(user);
    setGameState(prev => ({
      ...prev,
      user,
      score: 0
    }));
    setAttempt(0);
    setShowAllPairs(false);
    initializeGame();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    auth.signOut();
    setGameState(prev => ({
      ...prev,
      user: null,
      isTimeMode: false,
      timeLeft: GAME_TIME,
      score: 0
    }));
    handleMenuClose();
  };

  const handleUpdateUser = (updatedUser: User) => {
    saveUser(updatedUser);
    setGameState(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  // Функция прокрутки к инструкции
  const scrollToInstructions = () => {
    instructionsRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Добавляем функцию для отрисовки линий
  const renderLines = () => {
    return gameState.foundPairs
      .filter(pair => pair.found)
      .map((pair, index) => {
        const cell1Elem = document.querySelector(
          `[data-position="${pair.cell1.row}-${pair.cell1.col}"]`
        );
        const cell2Elem = document.querySelector(
          `[data-position="${pair.cell2.row}-${pair.cell2.col}"]`
        );

        if (!cell1Elem || !cell2Elem) return null;

        const rect1 = cell1Elem.getBoundingClientRect();
        const rect2 = cell2Elem.getBoundingClientRect();
        const boardElem = document.querySelector('.game-board');
        const boardRect = boardElem?.getBoundingClientRect();

        if (!boardRect) return null;

        const x1 = rect1.left + rect1.width / 2 - boardRect.left;
        const y1 = rect1.top + rect1.height / 2 - boardRect.top;
        const x2 = rect2.left + rect2.width / 2 - boardRect.left;
        const y2 = rect2.top + rect2.height / 2 - boardRect.top;

        return (
          <line
            key={`line-${index}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={pair.type === 'sum' ? '#4caf50' : '#2196f3'}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      });
  };

  const handleHintClick = useCallback(() => {
    if (!gameState.user) {
      return;
    }

    // Находим первую неоткрытую пару
    const availablePair = gameState.foundPairs.find(pair => !pair.found);
    
    if (availablePair) {
      if (gameState.isTimeMode) {
        // В режиме с таймером отнимаем баллы за подсказку
        setGameState(prev => ({
          ...prev,
          score: prev.score - 5 // -5 баллов за подсказку
        }));
      } else {
        // В режиме без таймера обнуляем очки
        setGameState(prev => ({
          ...prev,
          score: 0
        }));
      }

      // Показываем подсказку
      setHintPair(availablePair);
      setTimeout(() => setHintPair(null), 2000);
    } else {
      enqueueSnackbar('Все пары уже найдены!', { 
        variant: 'info',
        autoHideDuration: 3000
      });
    }
  }, [gameState.foundPairs, gameState.isTimeMode, gameState.user, enqueueSnackbar]);

  if (board.length === 0) {
    return null;
  }

  // Функция для создания овалов между парами
  const createPairOvals = () => {
    const foundPairs = gameState.foundPairs.filter(pair => pair.found);
    const ovals: JSX.Element[] = [];

    const gap = 16; // gap: 2 = 16px
    const cellHeight = 80; // фиксированная высота ячейки
    
    // Получаем позицию для колонки (в процентах)
    const getColPosition = (col: number) => {
      return col === 0 ? '16.67%' : col === 1 ? '50%' : '83.33%';
    };

    foundPairs.forEach((pair, pairIndex) => {
      const cell1 = pair.cell1;
      const cell2 = pair.cell2;
      
      // Цвета для разных пар
      const pairColors = [
        'rgba(255, 193, 7, 0.4)', // жёлтый
        'rgba(76, 175, 80, 0.4)',  // зелёный
        'rgba(33, 150, 243, 0.4)', // синий
        'rgba(156, 39, 176, 0.4)', // фиолетовый
        'rgba(255, 87, 34, 0.4)',  // оранжевый
        'rgba(0, 188, 212, 0.4)',  // голубой
      ];

      const color = pairColors[pairIndex % pairColors.length];
      
      // Определяем направление пары
      const isHorizontal = cell1.row === cell2.row;
      const isVertical = cell1.col === cell2.col;

      if (isHorizontal) {
        // Горизонтальная пара
        const top = cell1.row * (cellHeight + gap) + (cellHeight - 64) / 2;
        const leftCell = Math.min(cell1.col, cell2.col);
        const rightCell = Math.max(cell1.col, cell2.col);
        
        // Позиции центров колонок
        const leftPos = getColPosition(leftCell);
        const rightPos = getColPosition(rightCell);
        
        // Овал от центра левой колонки до центра правой
        const startPos = `calc(${leftPos} - 32px)`;
        const endPos = `calc(${rightPos} - 32px)`;
        const width = `calc(${endPos} - ${startPos} + 64px)`;
        
        ovals.push(
          <Box
            key={`horizontal-oval-${pairIndex}`}
            sx={{
              position: 'absolute',
              top: `${top}px`,
              left: startPos,
              width: width,
              height: '64px',
              borderRadius: '32px',
              backgroundColor: color,
              background: `linear-gradient(90deg, ${color}, ${color.replace('0.4', '0.2')})`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        );
      } else if (isVertical) {
        // Вертикальная пара
        const topRow = Math.min(cell1.row, cell2.row);
        const bottomRow = Math.max(cell1.row, cell2.row);
        
        const top = topRow * (cellHeight + gap) + (cellHeight - 64) / 2;
        const height = (bottomRow - topRow) * (cellHeight + gap) + cellHeight;
        
        // Позиция центра колонки
        const colPos = getColPosition(cell1.col);
        const left = `calc(${colPos} - 32px)`;
        
        ovals.push(
          <Box
            key={`vertical-oval-${pairIndex}`}
            sx={{
              position: 'absolute',
              top: `${top}px`,
              left: left,
              width: '64px',
              height: `${height}px`,
              borderRadius: '32px',
              backgroundColor: color,
              background: `linear-gradient(180deg, ${color}, ${color.replace('0.4', '0.2')})`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        );
      }
    });

    return ovals;
  };

  // Функция для создания интерактивного выделения (круг при выборе первой ячейки)
  const createInteractiveSelection = () => {
    if (!selectedCell) return null;

    // Рассчитываем точную позицию с учетом CSS Grid
    const gap = 16; // gap: 2 = 16px
    const cellHeight = 80; // высота ячейки
    
    // Позиция по вертикали
    const top = selectedCell.row * (cellHeight + gap) + (cellHeight - 64) / 2;
    
    // Позиция по горизонтали - используем простые проценты от контейнера Grid
    let left;
    // Процентное позиционирование от начала каждой колонки + offset для центрирования
    if (selectedCell.col === 0) {
      left = 'calc(0% + 16.67% - 32px)'; // 16.67% от начала контейнера
    } else if (selectedCell.col === 1) {
      left = 'calc(33.33% + 16.67% - 32px)'; // 50% от начала контейнера  
    } else if (selectedCell.col === 2) {
      left = 'calc(66.66% + 16.67% - 32px)'; // 83.33% от начала контейнера
    } else {
      left = 'calc(50% - 32px)';
    }

    return (
      <Box
        key="interactive-selection"
        sx={{
          position: 'absolute',
          top: `${top}px`,
          left: left,
          width: '64px',
          height: '64px',
          borderRadius: '50%', // Круг при выборе первого числа
          backgroundColor: 'rgba(33, 150, 243, 0.3)',
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.4), rgba(33, 150, 243, 0.2))',
          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
          zIndex: 1,
          pointerEvents: 'none',
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: 0.4 },
            '50%': { transform: 'scale(1.1)', opacity: 0.6 },
            '100%': { transform: 'scale(1)', opacity: 0.4 }
          }
        }}
      />
    );
  };

  // Обновляем renderCell для нового дизайна
  const renderCell = (cell: Cell) => {
    const isSelected = gameState.selectedCells.some(
      selectedCell => selectedCell.row === cell.row && selectedCell.col === cell.col
    );

    const isHinted = hintPair && (
      (hintPair.cell1.row === cell.row && hintPair.cell1.col === cell.col) ||
      (hintPair.cell2.row === cell.row && hintPair.cell2.col === cell.col)
    );

    return (
      <Box
        key={`${cell.row}-${cell.col}`}
        onClick={() => handleCellClick(cell)}
        sx={{
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          '&:hover': {
            bgcolor: isSelected ? '#e3f2fd' : '#f5f5f5',
            transform: 'scale(1.05)'
          }
        }}
      >
        {/* Число */}
        <Typography variant="h4" sx={{
          fontWeight: 'bold',
          color: '#333',
          fontSize: '1.8rem',
          position: 'relative',
          zIndex: 2
        }}>
          {cell.value}
        </Typography>
        
        {/* Подсказка */}
        {isHinted && (
          <Box sx={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: '#ff9800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1s infinite',
            zIndex: 3,
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.2)' },
              '100%': { transform: 'scale(1)' }
            }
          }}>
            <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
              💡
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      p: 3,
      bgcolor: '#f5f5f5'
    }}>
      {/* Основная игровая панель */}
      <Paper sx={{
        p: 4,
        borderRadius: 3,
        bgcolor: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Элементы выровнены по столбцам игрового поля */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          mb: 4
        }}>
          {/* Рыбки над левым столбцом */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 0.5
            }}>
              <Box
                component="img"
                src={fishImage}
                alt="Рыбка"
                sx={{
                  width: 28,
                  height: 28,
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Typography variant="h4" sx={{
              color: gameState.score >= 0 ? '#4caf50' : '#f44336',
              fontWeight: 'bold',
              fontSize: '2rem'
            }}>
              {gameState.score}
            </Typography>
          </Box>

          {/* Целевое число над центральным столбцом */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                zIndex: -1,
                opacity: 0.3
              }
            }}>
              <Typography variant="h2" sx={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: '2.5rem'
              }}>
                {gameState.targetNumber}
              </Typography>
            </Box>
          </Box>

          {/* Котик над правым столбцом */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <CatCharacter 
              state={catState} 
              onAnimationComplete={() => setCatState('waiting')}
            />
          </Box>
        </Box>

        {/* Игровое поле 3x3 */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          position: 'relative'
        }}>
          {/* Интерактивное выделение (круг при выборе первой ячейки) */}
          {createInteractiveSelection()}
          
          {/* Цветные овалы для найденных пар */}
          {createPairOvals()}
          
          {/* Ячейки игрового поля */}
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => renderCell(cell))
          )}
        </Box>

        {/* Информация о следующей мини-игре */}
        {(() => {
          const currentScore = gameState.score;
          const currentLevel = Math.floor(currentScore / 20);
          const nextPlayableLevel = Array.from({ length: 100 }, (_, i) => i + 1)
            .find(level => level > currentLevel && !playedLevels.has(level)) || currentLevel + 1;
          const targetScore = nextPlayableLevel * 20;
          
          return (
            <Box sx={{
              mt: 3,
              mb: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{
                color: '#666',
                fontSize: '0.85rem'
              }}>
                Следующая мини-игра при {targetScore} очках
              </Typography>
            </Box>
          );
        })()}

        {/* Индикатор оставшихся пар */}
        <Box sx={{
          textAlign: 'center',
          mt: 2
        }}>
          <Typography variant="h6" sx={{
            color: '#666',
            fontWeight: 'normal'
          }}>
            Ещё {countPossiblePairs(board, gameState.targetNumber) - gameState.foundPairs.filter(p => p.found).length} пар
          </Typography>
        </Box>
      </Paper>

      {/* Мини-игра с падающими рыбками */}
      <FishRainGame
        open={showFishRainGame}
        onClose={() => setShowFishRainGame(false)}
        onFinish={(earned) => {
          console.log(`Поймано рыбок: ${earned}`);
          setShowFishRainGame(false);
        }}
      />
    </Box>
  );
};

export default NumberGame; 