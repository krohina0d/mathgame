import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import catWaiting from '../assets/images/cat/cat-waiting.gif';
import catHappy from '../assets/images/cat/cat-happy.gif';
import catSad from '../assets/images/cat/cat-sad.gif';

export type CatState = 'waiting' | 'happy' | 'sad';

interface CatCharacterProps {
  state: CatState;
  onAnimationComplete?: () => void;
}

const CatCharacter = ({ state, onAnimationComplete }: CatCharacterProps) => {
  const [currentState, setCurrentState] = useState<CatState>(state);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (state !== currentState) {
      setIsAnimating(true);
      setCurrentState(state);
      
      // Если это анимация (не waiting), возвращаемся к waiting через 2 секунды
      if (state !== 'waiting') {
        setTimeout(() => {
          setCurrentState('waiting');
          setIsAnimating(false);
          onAnimationComplete?.();
        }, 2000);
      } else {
        setIsAnimating(false);
      }
    }
  }, [state, currentState, onAnimationComplete]);

  const getCatImage = () => {
    switch (currentState) {
      case 'happy':
        return catHappy;
      case 'sad':
        return catSad;
      case 'waiting':
      default:
        return catWaiting;
    }
  };

  const getAnimationStyle = () => {
    if (!isAnimating) return {};
    
    switch (currentState) {
      case 'happy':
        return {
          animation: 'bounce 0.6s ease-in-out',
          '@keyframes bounce': {
            '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
            '40%': { transform: 'translateY(-10px)' },
            '60%': { transform: 'translateY(-5px)' }
          }
        };
      case 'sad':
        return {
          animation: 'shake 0.5s ease-in-out',
          '@keyframes shake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '25%': { transform: 'translateX(-5px)' },
            '75%': { transform: 'translateX(5px)' }
          }
        };
      default:
        return {};
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 'fit-content'
    }}>
      <Box
        component="img"
        src={getCatImage()}
        alt={`Котик ${currentState === 'waiting' ? 'ждет' : currentState === 'happy' ? 'радуется' : 'грустит'}`}
        sx={{
          width: 100,
          height: 100,
          objectFit: 'contain',
          borderRadius: '50%',
          transition: 'all 0.3s ease-in-out',
          ...getAnimationStyle()
        }}
      />
    </Box>
  );
};

export default CatCharacter;
