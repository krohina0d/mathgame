import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import grayFishImage from '../assets/images/fish/gray-fish.png';
import redFishImage from '../assets/images/fish/red-fish.png';
import catEatingGif from '../assets/images/cat-animations/cat-eating.gif';
import catFishingGif from '../assets/images/cat-animations/cat-fishing.gif';
import catHappyGif from '../assets/images/cat/cat-happy.gif';

interface Fish {
  id: string;
  x: number;
  y: number;
  color: 'gray' | 'red';
  clicked: boolean;
}

interface FishRainGameProps {
  open: boolean;
  onClose: () => void;
  onFinish: (earned: number) => void;
}

const FishRainGame = ({ open, onClose, onFinish }: FishRainGameProps) => {
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [catGif, setCatGif] = useState<string>(catFishingGif);
  const [showResults, setShowResults] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // Генерация новой рыбки
  const generateFish = useCallback(() => {
    const isRed = Math.random() < 0.3; // 30% красных рыбок
    const newFish: Fish = {
      id: Math.random().toString(36).substring(7),
      x: Math.random() * 80 + 10, // 10-90% ширины экрана
      y: -50,
      color: isRed ? 'red' : 'gray',
      clicked: false
    };
    return newFish;
  }, []);

  // Начало игры
  useEffect(() => {
    if (open) {
      setTimeLeft(30);
      setScore(0);
      setFishList([]);
      setCatGif(catFishingGif);
      setShowResults(false);
      setGameEnded(false);
    }
  }, [open]);

  // Таймер игры
  useEffect(() => {
    if (!open) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  // Генерация рыбок
  useEffect(() => {
    if (!open || timeLeft === 0 || gameEnded) return;

    const spawnInterval = setInterval(() => {
      setFishList(prev => [...prev, generateFish()]);
    }, 800); // Новая рыбка каждые 0.8 секунды

    return () => clearInterval(spawnInterval);
  }, [open, timeLeft, gameEnded, generateFish]);

  // Анимация падения рыбок
  useEffect(() => {
    if (!open || timeLeft === 0) return;

    const moveInterval = setInterval(() => {
      setFishList(prev =>
        prev
          .filter(fish => fish.y < 100 && !fish.clicked) // Удаляем рыбку, если она упала ниже экрана
          .map(fish => ({
            ...fish,
            y: fish.y + 2 // Скорость падения
          }))
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [open, timeLeft]);

  const handleFishClick = (fishId: string) => {
    setFishList(prev =>
      prev.map(fish =>
        fish.id === fishId ? { ...fish, clicked: true } : fish
      )
    );

    // Котик ест рыбку
    setCatGif(catEatingGif);
    setTimeout(() => setCatGif(catFishingGif), 1500);

    setScore(prev => prev + 1);
  };

  const handleGameEnd = () => {
    // Помечаем что игра завершена
    setGameEnded(true);
    // Останавливаем генерацию рыбок
    // Небольшая задержка перед показом результатов
    setTimeout(() => {
      setShowResults(true);
    }, 500);
  };

  const handleClose = () => {
    onFinish(score);
    setShowResults(false);
  };

  return (
    <>
      {/* Игровое поле */}
      {open && timeLeft > 0 && !showResults && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, #e3f2fd 0%, #bbdefb 100%)',
            zIndex: 10000,
            overflow: 'hidden'
          }}
        >
          {/* Таймер */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 10, sm: 20 },
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              padding: { xs: '8px 16px', sm: '10px 20px' },
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: '#1976d2',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              ⏱️ {timeLeft}
            </Typography>
          </Box>

          {/* Счет */}
          <Box
            sx={{
              position: 'absolute',
              top: { xs: 60, sm: 80 },
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              padding: { xs: '8px 16px', sm: '10px 20px' },
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold', 
              color: '#4caf50',
              fontSize: { xs: '1.2rem', sm: '1.5rem' }
            }}>
              🐟 {score}
            </Typography>
          </Box>

          {/* Рыбки */}
          {fishList.map(fish => (
            <Box
              key={fish.id}
              onClick={() => handleFishClick(fish.id)}
              sx={{
                position: 'absolute',
                left: `${fish.x}%`,
                top: `${fish.y}%`,
                cursor: 'pointer',
                width: { xs: 80, sm: 70, md: 60 }, // Больше на мобильных
                height: { xs: 80, sm: 70, md: 60 },
                borderRadius: '50%',
                transition: 'all 0.3s ease',
                opacity: fish.clicked ? 0 : 1,
                pointerEvents: fish.clicked ? 'none' : 'auto',
                touchAction: 'manipulation', // Для лучшей работы на мобильных
                WebkitTapHighlightColor: 'transparent', // Убираем подсветку при касании
                '&:active': {
                  transform: 'scale(0.9)'
                },
                '@media (min-width: 768px)': {
                  '&:hover': {
                    transform: 'scale(1.2)'
                  }
                }
              }}
            >
              <Box
                component="img"
                src={fish.color === 'gray' ? grayFishImage : redFishImage}
                alt={`${fish.color} fish`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          ))}

          {/* Котик */}
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 30, sm: 50 },
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <Box
              component="img"
              src={catGif}
              alt="Котик"
              sx={{
                width: { xs: 120, sm: 100 },
                height: { xs: 120, sm: 100 },
                objectFit: 'contain'
              }}
            />
          </Box>
        </Box>
      )}

      {/* Модальное окно с результатами */}
      <Dialog
        open={showResults}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Отлично! 🎉
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              src={catHappyGif}
              alt="Довольный котик"
              sx={{ width: 150, height: 150, margin: '0 auto' }}
            />
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50', mb: 1 }}>
            {score}
          </Typography>
          
          <Typography variant="h6" sx={{ color: '#666', mb: 3 }}>
            рыбок поймано!
          </Typography>

          <Typography variant="body2" sx={{ color: '#999' }}>
            Продолжай искать пары, чтобы заработать больше рыбок! 🎮
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleClose}
            sx={{
              minWidth: '200px',
              borderRadius: 2
            }}
          >
            Продолжить игру
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FishRainGame;

