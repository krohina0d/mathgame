import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid, Button, ButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Avatar, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Cell, GameState, LEVELS, Pair, GAME_TIME, CORRECT_POINTS, MISTAKE_PENALTY, LeaderboardEntry, User, UserAchievement, ACHIEVEMENTS } from '../types/types';
import GameCharacter from './GameCharacter';
import AuthDialog from './AuthDialog';
import Leaderboard from './Leaderboard';
import { saveUser, getUser, saveLeaderboardEntry, getLeaderboardEntries, getUserAchievements, saveUserAchievement } from '../services/storage';
import { auth } from '../config/firebase';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ProfileDialog from './ProfileDialog';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AchievementDialog from './AchievementDialog';
import { useSnackbar } from 'notistack';
import Confetti from 'react-confetti';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import House from './House';

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

const InlineLeaderboard = ({ entries, currentLevel }: { entries: LeaderboardEntry[]; currentLevel: number }) => {
  const filteredEntries = entries
    .filter(entry => entry.level === currentLevel)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Показываем только топ-10

  return (
    <Paper sx={{ 
      p: 2, 
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 3,
      width: '300px',
      position: 'sticky',
      top: 20
    }}>
      <Typography variant="h6" sx={{ 
        textAlign: 'center', 
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}>
        <EmojiEventsIcon color="primary" />
        Рекорды уровня {currentLevel}
      </Typography>

      {filteredEntries.length === 0 ? (
        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}>
          Пока нет результатов для уровня {currentLevel}
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: '500px' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Место</TableCell>
                <TableCell>Игрок</TableCell>
                <TableCell align="right">Очки</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.map((entry, index) => (
                <TableRow
                  key={`${entry.userId}-${entry.timestamp}`}
                  sx={{
                    bgcolor: index < 3 ? `rgba(255, 215, 0, ${0.1 - index * 0.02})` : 'inherit'
                  }}
                >
                  <TableCell>
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : index + 1}
                  </TableCell>
                  <TableCell sx={{ 
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {entry.displayName}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {entry.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

const NumberGame = () => {
  const [attempt, setAttempt] = useState(0);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<GameState>({
    targetNumber: 0,
    selectedCells: [],
    score: 0,
    lastAttemptSuccess: null,
    level: 1,
    foundPairs: [],
    isTimeMode: false,
    timeLeft: GAME_TIME,
    totalFoundPairs: 0,
    user: getUser()
  });
  const [showAllPairs, setShowAllPairs] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hintPair, setHintPair] = useState<Pair | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const [floors, setFloors] = useState(0);

  // Добавляем ref для инструкции
  const instructionsRef = useRef<HTMLDivElement>(null);

  const currentLevelConfig = LEVELS[gameState.level];

  // Добавляем функцию для проверки завершения матрицы
  const checkMatrixCompletion = useCallback((foundPairs: any[]): boolean => {
    return foundPairs.every(pair => pair.found);
  }, []);

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

  useEffect(() => {
    let timer: number;
    if (gameState.isTimeMode && gameState.timeLeft > 0) {
      timer = window.setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [gameState.isTimeMode, gameState.timeLeft]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const entries = await getLeaderboardEntries();
      setLeaderboardEntries(entries);
    };
    loadLeaderboard();
  }, []);

  useEffect(() => {
    const handleTimeEnd = async () => {
      if (gameState.isTimeMode && gameState.timeLeft === 0 && gameState.user) {
        // Сначала показываем модальное окно
        setShowResultModal(true);

        try {
          // Создаем запись для таблицы рекордов
          const entry: LeaderboardEntry = {
            userId: gameState.user.id,
            displayName: gameState.user.displayName || `${gameState.user.firstName} ${gameState.user.lastName}`,
            score: gameState.score,
            level: gameState.level,
            foundPairs: gameState.totalFoundPairs,
            timestamp: Date.now()
          };
          
          // Сохраняем результат
          await saveLeaderboardEntry(entry);
          
          // Обновляем таблицу рекордов
          const updatedEntries = await getLeaderboardEntries();
          setLeaderboardEntries(updatedEntries);
        } catch (error) {
          console.error('Error saving game result:', error);
        }
      }
    };

    if (gameState.timeLeft === 0) {
      handleTimeEnd();
    }
  }, [gameState.timeLeft, gameState.isTimeMode, gameState.user, gameState.score, gameState.level, gameState.totalFoundPairs]);

  useEffect(() => {
    const loadAchievements = async () => {
      if (gameState.user) {
        const achievements = await getUserAchievements(gameState.user.id);
        setUserAchievements(achievements);
      }
    };
    loadAchievements();
  }, [gameState.user]);

  const handleLevelChange = (newLevel: number) => {
    setGameState(prev => ({
      ...prev,
      level: newLevel,
      score: 0,
      isTimeMode: false,
      timeLeft: GAME_TIME
    }));
    setAttempt(0);
    setShowAllPairs(false);
  };

  const toggleTimeMode = () => {
    if (!gameState.user) {
      setShowAuthDialog(true);
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

  const checkAchievements = useCallback(async () => {
    if (!gameState.user || gameState.isTimeMode) return;

    const unlockedAchievements = ACHIEVEMENTS
      .filter(achievement => 
        achievement.level === gameState.level &&
        achievement.requiredStreak <= gameState.score &&
        !userAchievements.some(ua => 
          ua.achievementId === achievement.id && 
          ua.level === gameState.level
        )
      );

    for (const achievement of unlockedAchievements) {
      const newAchievement: UserAchievement = {
        achievementId: achievement.id,
        unlockedAt: Date.now(),
        level: gameState.level
      };
      
      await saveUserAchievement(gameState.user.id, newAchievement);
      setUserAchievements(prev => [...prev, newAchievement]);
      
      // Показываем конфетти
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      // Показываем уведомление
      enqueueSnackbar(
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          animation: 'fadeIn 0.5s ease-in-out'
        }}>
          <Box sx={{ fontSize: '2rem' }}>{achievement.icon}</Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {achievement.title}
            </Typography>
            <Typography variant="body2">
              {achievement.description}
            </Typography>
          </Box>
        </Box>,
        { 
          variant: 'success',
          autoHideDuration: 5000,
          style: {
            backgroundColor: '#2e7d32',
            borderRadius: '12px',
            padding: '16px'
          }
        }
      );
    }
  }, [gameState.level, gameState.score, gameState.user, gameState.isTimeMode, userAchievements, enqueueSnackbar]);

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
            newFoundPairs[pairIndex].found = true;

            // Проверяем завершение матрицы
            if (checkMatrixCompletion(newFoundPairs)) {
              setFloors(prev => prev + 1);
              setTimeout(() => {
                initializeGame();
              }, 1000);
            }

            const newScore = prevState.isTimeMode ? 
              prevState.score + CORRECT_POINTS : 
              prevState.score + 1;
            
            return {
              ...prevState,
              foundPairs: newFoundPairs,
              selectedCells: [],
              score: newScore,
              lastAttemptSuccess: true,
              totalFoundPairs: prevState.totalFoundPairs + 1
            };
          }
        }
        return { 
          ...prevState, 
          selectedCells: [],
          lastAttemptSuccess: false,
          score: prevState.isTimeMode ? prevState.score + MISTAKE_PENALTY : 0
        };
      }

      return { ...prevState, selectedCells: [] };
    });
  }, [initializeGame, gameState.isTimeMode, gameState.timeLeft, checkMatrixCompletion]);

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
    const bigNum = targetNumber + smallNum; // Теперь bigNum - smallNum = targetNumber

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayAgain = () => {
    setShowResultModal(false);
    setGameState(prev => ({
      ...prev,
      score: 0,
      timeLeft: GAME_TIME,
      foundPairs: [],
      totalFoundPairs: 0,
      isTimeMode: false
    }));
    setFloors(0); // Сбрасываем количество этажей
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
      setShowAuthDialog(true);
      return;
    }

    // Находим первую неоткрытую пару
    const availablePair = gameState.foundPairs.find(pair => !pair.found);
    
    if (availablePair) {
      if (gameState.isTimeMode) {
        // В режиме с таймером просто отнимаем 15 очков
        setGameState(prev => ({
          ...prev,
          score: prev.score - 15
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

  // Обновляем renderCell, добавляя data-position
  const renderCell = (cell: Cell) => {
    const isSelected = gameState.selectedCells.some(
      selectedCell => selectedCell.row === cell.row && selectedCell.col === cell.col
    );

    const isHinted = hintPair && (
      (hintPair.cell1.row === cell.row && hintPair.cell1.col === cell.col) ||
      (hintPair.cell2.row === cell.row && hintPair.cell2.col === cell.col)
    );

    return (
      <StyledCell
        key={`${cell.row}-${cell.col}`}
        onClick={() => handleCellClick(cell)}
        data-position={`${cell.row}-${cell.col}`}
        elevation={1}
        sx={{
          width: { xs: '48px', sm: '64px' },
          height: { xs: '48px', sm: '64px' },
          fontSize: { xs: '1rem', sm: '1.2rem' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.3s ease',
          margin: '2px',
          bgcolor: isHinted ? 'warning.light' : isSelected ? 'primary.light' : 'background.paper',
          animation: isHinted ? 'pulse 1s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' }
          },
          '&:hover': {
            bgcolor: isSelected ? 'primary.light' : 'grey.100'
          }
        }}
      >
        {cell.value}
      </StyledCell>
    );
  };

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        color: 'primary.main', 
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
      }}>
        сЧислитель 🎮
      </Typography>

      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 1, sm: 2 },
        mb: { xs: 2, sm: 4 }
      }}>
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          width: '100%',
          justifyContent: 'center'
        }}>
          <Button
            variant="outlined"
            color="info"
            size="medium"
            onClick={scrollToInstructions}
            startIcon={<HelpOutlineIcon />}
            sx={{ 
              boxShadow: 3,
              minWidth: { xs: '120px', sm: '150px' }
            }}
          >
            Как играть?
          </Button>

          {gameState.user && !gameState.isTimeMode && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setShowAchievements(true)}
              startIcon={<EmojiEventsIcon />}
              sx={{ 
                boxShadow: 3,
                minWidth: { xs: '120px', sm: '150px' }
              }}
            >
              Достижения
            </Button>
          )}

          <Button
            variant="outlined"
            color="primary"
            size="medium"
            onClick={() => setShowLeaderboard(true)}
            startIcon={<EmojiEventsIcon />}
            sx={{ 
              boxShadow: 3,
              minWidth: { xs: '120px', sm: '150px' }
            }}
          >
            Рейтинг
          </Button>
        </Box>

        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Уровень:
          </Typography>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mb: 2 
          }}>
            <ButtonGroup variant="contained" sx={{ borderRadius: 2 }}>
              {Object.keys(LEVELS).map((level) => (
                <Button
                  key={level}
                  onClick={() => handleLevelChange(Number(level))}
                  variant={gameState.level === Number(level) ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: gameState.level === Number(level) ? 'primary.main' : 'transparent',
                    borderColor: 'primary.main',
                    color: gameState.level === Number(level) ? 'white' : 'primary.main'
                  }}
                >
                  Уровень {level}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        mb: 2
      }}>
        <Button
          variant={gameState.isTimeMode ? 'contained' : 'outlined'}
          onClick={toggleTimeMode}
          color="primary"
          sx={{ borderRadius: 2 }}
        >
          {gameState.isTimeMode ? 'Выключить таймер' : 'Включить таймер'}
        </Button>

        {gameState.isTimeMode && (
          <Paper sx={{ 
            px: 3,
            py: 1,
            borderRadius: 2,
            bgcolor: gameState.timeLeft < 30 ? 'error.main' : 
                     gameState.timeLeft < 60 ? 'warning.main' : 'success.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            animation: gameState.timeLeft < 30 ? 'blink 1s infinite' : 'none',
            '@keyframes blink': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.7 },
              '100%': { opacity: 1 }
            }
          }}>
            ⏱️ {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
          </Paper>
        )}

        <Button
          variant="contained"
          color="warning"
          onClick={handleHintClick}
          startIcon={<LightbulbIcon />}
          sx={{ 
            borderRadius: 2,
            minWidth: 'auto'
          }}
        >
          Подсказка {gameState.isTimeMode ? '(-15)' : '(сброс)'}
        </Button>
      </Box>

      <Box sx={{ 
        display: 'flex',
        gap: { xs: 2, md: 4 },
        alignItems: 'flex-start',
        flexDirection: { xs: 'column', lg: 'row' }
      }}>
        <Box sx={{ 
          flex: 1,
          width: '100%'
        }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 1, sm: 3 },
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' }
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
            gap: { xs: 2, md: 4 },
            alignItems: 'flex-start',
            mb: 4,
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center'
          }}>
            <Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                gap: 2
              }}>
                {gameState.isTimeMode && (
                  <Paper sx={{ 
                    p: 2,
                    borderRadius: 2,
                    bgcolor: gameState.timeLeft < 30 ? 'error.main' : 
                             gameState.timeLeft < 60 ? 'warning.main' : 'success.main',
                    color: 'white',
                    minWidth: '150px',
                    textAlign: 'center',
                    transition: 'background-color 0.3s ease',
                    animation: gameState.timeLeft < 30 ? 'blink 1s infinite' : 'none',
                    '@keyframes blink': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                      '100%': { opacity: 1 }
                    }
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ⏱️ {formatTime(gameState.timeLeft)}
                    </Typography>
                  </Paper>
                )}
              </Box>

              {gameState.isTimeMode && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2,
                    textAlign: 'center',
                    color: 'info.main',
                    fontWeight: 'bold'
                  }}
                >
                  🎯 +{CORRECT_POINTS} за верный ответ | ❌ {MISTAKE_PENALTY} за ошибку
                </Typography>
              )}

              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${currentLevelConfig.size}, 1fr)`,
                gap: { xs: 1, sm: 2 },
                width: 'fit-content',
                margin: '0 auto',
                position: 'relative'
              }} className="game-board">
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                >
                  {renderLines()}
                </svg>
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
              mt: { xs: 2, sm: 10 },
              display: { xs: 'none', sm: 'block' }
            }}>
              <GameCharacter 
                isSuccess={gameState.lastAttemptSuccess}
                attempt={attempt}
              />
            </Box>
          </Box>

          <Box 
            ref={instructionsRef}
            sx={{ 
              p: { xs: 2, sm: 3 },
              bgcolor: 'info.light', 
              borderRadius: 2,
              border: '2px solid #2196f3',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
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
                      {subtractionExample.bigNum} - {subtractionExample.smallNum} = {subtractionExample.bigNum - subtractionExample.smallNum} ✨
                  </>
                );
              })()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          width: { xs: '100%', lg: '300px' },
          flexShrink: 0,
          display: { xs: 'none', lg: 'block' },
          position: 'sticky',
          top: '20px',
          alignSelf: 'flex-start',
          zIndex: 1
        }}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: 3,
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <Box>
              <Typography variant="h6" align="center" gutterBottom>
                Ваш дом 🏠
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                Этажей построено: {floors}
              </Typography>
            </Box>
            <Box sx={{ height: '400px', overflow: 'hidden' }}>
              <House floors={floors} />
            </Box>
          </Paper>
        </Box>
      </Box>

      <AuthDialog 
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onAuth={handleAuth}
      />

      <Leaderboard
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        entries={leaderboardEntries}
      />

      <Dialog 
        open={showResultModal} 
        onClose={() => setShowResultModal(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'primary.main'
        }}>
          Время вышло! ⌛
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h4" sx={{ mb: 2, color: 'success.main' }}>
            {gameState.score} ⭐
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Твой результат
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Всего найдено пар: {gameState.totalFoundPairs}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center',
          pb: 3 
        }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handlePlayAgain}
            sx={{ 
              minWidth: '200px',
              borderRadius: 2,
              fontSize: '1.1rem'
            }}
          >
            Сыграть снова! 🎮
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ 
        position: { xs: 'relative', sm: 'absolute' },
        top: { xs: 'auto', sm: 16 },
        right: { xs: 'auto', sm: 16 },
        mt: { xs: 2, sm: 0 },
        display: 'flex',
        justifyContent: { xs: 'center', sm: 'flex-end' },
        alignItems: 'center',
        gap: 1
      }}>
        {gameState.user ? (
          <>
            <Button
              onClick={handleMenuClick}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
              startIcon={
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: 'primary.dark'
                  }}
                >
                  {gameState.user.displayName?.[0] || gameState.user.firstName[0]}
                </Avatar>
              }
            >
              {gameState.user.displayName || `${gameState.user.firstName} ${gameState.user.lastName}`}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 200
                }
              }}
            >
              <MenuItem 
                onClick={() => {
                  setShowProfileDialog(true);
                  handleMenuClose();
                }}
                sx={{
                  gap: 1,
                  py: 1
                }}
              >
                <AccountCircleIcon color="primary" />
                <Typography>Редактировать профиль</Typography>
              </MenuItem>
              <MenuItem 
                onClick={handleLogout}
                sx={{
                  gap: 1,
                  py: 1
                }}
              >
                <LogoutIcon color="error" />
                <Typography color="error">Выйти</Typography>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            onClick={() => setShowAuthDialog(true)}
            startIcon={<LoginIcon />}
            sx={{ 
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            Войти
          </Button>
        )}
      </Box>

      {gameState.user && (
        <ProfileDialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          user={gameState.user}
          onUpdate={handleUpdateUser}
        />
      )}

      <AchievementDialog
        open={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={ACHIEVEMENTS}
        userAchievements={userAchievements}
        currentLevel={gameState.level}
        currentStreak={gameState.totalFoundPairs}
      />

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
    </Box>
  );
};

export default NumberGame; 