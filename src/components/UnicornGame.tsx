import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import UnicornCharacter from './UnicornCharacter';
import IceCream from './IceCream';
import Rainbow from './Rainbow';
import Background from './Background';
import StartScreen from './StartScreen';

interface GameState {
  score: number;
  lives: number;
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  gameStarted: boolean;
}

interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface IceCreamItem extends GameObject {
  type: 'vanilla' | 'chocolate' | 'strawberry';
  collected: boolean;
}

interface RainbowPlatform extends GameObject {
  active: boolean;
  timer: number;
}

const GameContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)',
}));

const GameUI = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  padding: theme.spacing(2),
  zIndex: 10,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
}));

const UnicornGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    isGameOver: false,
    isPaused: false,
    level: 1,
    gameStarted: false,
  });

  const [unicorn, setUnicorn] = useState({
    x: 100,
    y: 400,
    velocityY: 0,
    isJumping: false,
    isOnGround: true,
    direction: 1, // 1 = right, -1 = left
  });

  const [iceCreams, setIceCreams] = useState<IceCreamItem[]>([]);
  const [rainbows, setRainbows] = useState<RainbowPlatform[]>([]);
  const [enemies, setEnemies] = useState<GameObject[]>([]);

  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());

  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const MOVE_SPEED = 5;
  const GROUND_Y = 400;

  // Генерация уровня
  const generateLevel = useCallback(() => {
    const newIceCreams: IceCreamItem[] = [];
    const newRainbows: RainbowPlatform[] = [];
    const newEnemies: GameObject[] = [];

    // Генерируем мороженое
    for (let i = 0; i < 10; i++) {
      newIceCreams.push({
        id: `ice-cream-${i}`,
        x: 200 + i * 150 + Math.random() * 100,
        y: 300 + Math.random() * 100,
        width: 30,
        height: 30,
        type: ['vanilla', 'chocolate', 'strawberry'][Math.floor(Math.random() * 3)] as any,
        collected: false,
      });
    }

    // Генерируем радуги с более длительным временем жизни
    for (let i = 0; i < 8; i++) {
      newRainbows.push({
        id: `rainbow-${i}`,
        x: 300 + i * 200 + Math.random() * 150,
        y: 350 + Math.random() * 50,
        width: 120,
        height: 20,
        active: true,
        timer: 0,
      });
    }

    // Генерируем врагов
    for (let i = 0; i < 5; i++) {
      newEnemies.push({
        id: `enemy-${i}`,
        x: 400 + i * 300 + Math.random() * 200,
        y: GROUND_Y - 40,
        width: 40,
        height: 40,
      });
    }

    setIceCreams(newIceCreams);
    setRainbows(newRainbows);
    setEnemies(newEnemies);
  }, []);

  // Обработка ввода
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.gameStarted || gameState.isGameOver || gameState.isPaused) return;

      keysPressed.current.add(e.code);
      
      if (e.code === 'KeyP') {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.gameStarted, gameState.isGameOver, gameState.isPaused]);

  // Игровой цикл
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.gameStarted || gameState.isPaused || gameState.isGameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Обработка движения
    let newDirection = unicorn.direction;
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) {
      newDirection = -1;
    } else if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) {
      newDirection = 1;
    }

    // Прыжок
    if ((keysPressed.current.has('Space') || keysPressed.current.has('ArrowUp') || keysPressed.current.has('KeyW')) && unicorn.isOnGround) {
      setUnicorn(prev => ({
        ...prev,
        velocityY: JUMP_FORCE,
        isJumping: true,
        isOnGround: false,
      }));
    }

    // Обновляем позицию единорога
    setUnicorn(prev => {
      let newY = prev.y + prev.velocityY;
      let newVelocityY = prev.velocityY + GRAVITY;
      let newIsOnGround = false;

      // Проверяем столкновение с землёй
      if (newY >= GROUND_Y) {
        newY = GROUND_Y;
        newVelocityY = 0;
        newIsOnGround = true;
      }

      // Проверяем столкновение с радугами
      rainbows.forEach(rainbow => {
        if (rainbow.active && 
            prev.x + 40 > rainbow.x && 
            prev.x < rainbow.x + rainbow.width &&
            newY + 60 > rainbow.y && 
            newY < rainbow.y + rainbow.height) {
          newY = rainbow.y - 60;
          newVelocityY = 0;
          newIsOnGround = true;
        }
      });

      return {
        ...prev,
        y: newY,
        velocityY: newVelocityY,
        isOnGround: newIsOnGround,
        isJumping: !newIsOnGround,
        direction: newDirection,
      };
    });

    // Движение единорога
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA') || 
        keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) {
      setUnicorn(prev => ({
        ...prev,
        x: Math.max(0, Math.min(800, prev.x + newDirection * MOVE_SPEED)),
      }));
    }

    // Проверяем сбор мороженого
    setIceCreams(prev => 
      prev.map(iceCream => {
        if (!iceCream.collected &&
            unicorn.x + 40 > iceCream.x &&
            unicorn.x < iceCream.x + iceCream.width &&
            unicorn.y + 60 > iceCream.y &&
            unicorn.y < iceCream.y + iceCream.height) {
          setGameState(game => ({ ...game, score: game.score + 10 }));
          return { ...iceCream, collected: true };
        }
        return iceCream;
      })
    );

    // Проверяем столкновение с врагами
    enemies.forEach(enemy => {
      if (unicorn.x + 40 > enemy.x &&
          unicorn.x < enemy.x + enemy.width &&
          unicorn.y + 60 > enemy.y &&
          unicorn.y < enemy.y + enemy.height) {
        setGameState(prev => ({ ...prev, lives: prev.lives - 1 }));
        if (gameState.lives <= 1) {
          setGameState(prev => ({ ...prev, isGameOver: true }));
        }
      }
    });

    // Обновляем радуги - увеличиваем время жизни до 15 секунд
    setRainbows(prev => 
      prev.map(rainbow => ({
        ...rainbow,
        timer: rainbow.timer + deltaTime,
        active: rainbow.timer < 15000, // Радуга исчезает через 15 секунд вместо 5
      }))
    );

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.gameStarted, gameState.isPaused, gameState.isGameOver, gameState.lives, rainbows, enemies, unicorn.x, unicorn.y]);

  // Запуск игрового цикла
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  // Генерация уровня при старте
  useEffect(() => {
    if (gameState.gameStarted) {
      generateLevel();
    }
  }, [gameState.gameStarted, generateLevel]);

  const startGame = () => {
    setGameState(prev => ({ ...prev, gameStarted: true }));
  };

  const restartGame = () => {
    setGameState({
      score: 0,
      lives: 3,
      isGameOver: false,
      isPaused: false,
      level: 1,
      gameStarted: true,
    });
    setUnicorn({
      x: 100,
      y: 400,
      velocityY: 0,
      isJumping: false,
      isOnGround: true,
      direction: 1,
    });
    generateLevel();
  };

  if (!gameState.gameStarted) {
    return <StartScreen onStart={startGame} />;
  }

  if (gameState.isGameOver) {
    return (
      <GameContainer>
        <Background />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 20,
          }}
        >
          <Paper
            sx={{
              padding: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h3" gutterBottom>
              Игра окончена!
            </Typography>
            <Typography variant="h5" gutterBottom>
              Счёт: {gameState.score}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={restartGame}
              sx={{ mt: 2, mr: 2 }}
            >
              Играть снова
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setGameState(prev => ({ ...prev, gameStarted: false }))}
              sx={{ mt: 2 }}
            >
              Главное меню
            </Button>
          </Paper>
        </Box>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      <Background />
      
      <GameUI>
        <Typography variant="h6">Счёт: {gameState.score}</Typography>
        <Typography variant="h6">Жизни: {gameState.lives}</Typography>
        <Typography variant="h6">Уровень: {gameState.level}</Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
          sx={{ mt: 1 }}
        >
          {gameState.isPaused ? 'Продолжить' : 'Пауза'}
        </Button>
      </GameUI>

      {/* Единорог */}
      <UnicornCharacter
        x={unicorn.x}
        y={unicorn.y}
        direction={unicorn.direction}
        isJumping={unicorn.isJumping}
      />

      {/* Мороженое */}
      {iceCreams.map(iceCream => (
        !iceCream.collected && (
          <IceCream
            key={iceCream.id}
            x={iceCream.x}
            y={iceCream.y}
            type={iceCream.type}
          />
        )
      ))}

      {/* Радуги */}
      {rainbows.map(rainbow => (
        rainbow.active && (
          <Rainbow
            key={rainbow.id}
            x={rainbow.x}
            y={rainbow.y}
            width={rainbow.width}
            height={rainbow.height}
            timer={rainbow.timer}
            maxTimer={15000}
          />
        )
      ))}

      {/* Враги */}
      {enemies.map(enemy => (
        <Box
          key={enemy.id}
          sx={{
            position: 'absolute',
            left: enemy.x,
            top: enemy.y,
            width: enemy.width,
            height: enemy.height,
            backgroundColor: '#8B0000',
            borderRadius: '50%',
            zIndex: 5,
          }}
        />
      ))}

      {/* Земля */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
          background: 'linear-gradient(180deg, #8FBC8F 0%, #556B2F 100%)',
          zIndex: 1,
        }}
      />

      {gameState.isPaused && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
          }}
        >
          <Paper
            sx={{
              padding: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h4">Пауза</Typography>
          </Paper>
        </Box>
      )}
    </GameContainer>
  );
};

export default UnicornGame;
