import { Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

interface RainbowProps {
  x: number;
  y: number;
  width: number;
  height: number;
  timer?: number;
  maxTimer?: number;
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.5),
                0 0 40px rgba(255, 165, 0, 0.3),
                0 0 60px rgba(255, 255, 0, 0.2);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.7),
                0 0 60px rgba(255, 165, 0, 0.5),
                0 0 90px rgba(255, 255, 0, 0.4);
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  80% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.3;
    transform: scale(0.95);
  }
`;

const RainbowContainer = styled(Box)<{ $timer?: number; $maxTimer?: number }>(({ theme, $timer, $maxTimer }) => {
  const timeLeft = $maxTimer && $timer ? $maxTimer - $timer : 0;
  const isFading = timeLeft < 3000; // Начинаем затухание за 3 секунды до исчезновения
  
  return {
    position: 'absolute',
    zIndex: 3,
    animation: isFading ? `${fadeOut} ${timeLeft}ms ease-in-out` : 'none',
  };
});

const RainbowArc = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  borderRadius: '50% 50% 0 0',
  background: 'linear-gradient(90deg, #FF0000 0%, #FF7F00 14.28%, #FFFF00 28.57%, #00FF00 42.86%, #0000FF 57.14%, #4B0082 71.43%, #9400D3 85.71%, #FF0000 100%)',
  backgroundSize: '200% 100%',
  animation: `${shimmer} 3s ease-in-out infinite, ${glow} 2s ease-in-out infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: '50% 50% 0 0',
    background: 'linear-gradient(90deg, #FF0000 0%, #FF7F00 14.28%, #FFFF00 28.57%, #00FF00 42.86%, #0000FF 57.14%, #4B0082 71.43%, #9400D3 85.71%, #FF0000 100%)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite reverse`,
    zIndex: -1,
  },
}));

const RainbowSparkles = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 4,
    height: 4,
    background: '#FFD700',
    borderRadius: '50%',
    animation: 'twinkle 1.5s ease-in-out infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '30%',
    right: '15%',
    width: 3,
    height: 3,
    background: '#FF69B4',
    borderRadius: '50%',
    animation: 'twinkle 1.5s ease-in-out infinite 0.5s',
  },
}));

const RainbowEnds = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '100%',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: '100%',
    background: 'linear-gradient(180deg, #FF0000 0%, #FF7F00 20%, #FFFF00 40%, #00FF00 60%, #0000FF 80%, #4B0082 100%)',
    borderRadius: '4px 0 0 4px',
    boxShadow: '0 0 15px rgba(255, 0, 0, 0.6)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: '100%',
    background: 'linear-gradient(180deg, #9400D3 0%, #4B0082 20%, #0000FF 40%, #00FF00 60%, #FFFF00 80%, #FF7F00 100%)',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 0 15px rgba(148, 0, 211, 0.6)',
  },
}));

const RainbowParticles = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '120%',
  height: '120%',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '10%',
    left: '20%',
    width: 6,
    height: 6,
    background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float 4s ease-in-out infinite',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '20%',
    right: '30%',
    width: 4,
    height: 4,
    background: 'radial-gradient(circle, #FF69B4 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'float 4s ease-in-out infinite 2s',
  },
}));

const TimeIndicator = styled(Box)<{ $progress: number }>(({ theme, $progress }) => ({
  position: 'absolute',
  top: -15,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '80%',
  height: 4,
  background: 'rgba(255, 255, 255, 0.3)',
  borderRadius: '2px',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${$progress}%`,
    background: 'linear-gradient(90deg, #00FF00 0%, #FFFF00 50%, #FF0000 100%)',
    transition: 'width 0.1s ease',
  },
}));

const Rainbow = ({ x, y, width, height, timer = 0, maxTimer = 15000 }: RainbowProps) => {
  const progress = maxTimer > 0 ? ((maxTimer - timer) / maxTimer) * 100 : 100;
  
  return (
    <RainbowContainer style={{ left: x, top: y, width, height }} $timer={timer} $maxTimer={maxTimer}>
      <TimeIndicator $progress={progress} />
      <RainbowArc />
      <RainbowEnds />
      <RainbowSparkles />
      <RainbowParticles />
      
      {/* Дополнительные эффекты */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '-20%',
          right: '-20%',
          bottom: '-20%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />
    </RainbowContainer>
  );
};

export default Rainbow;
