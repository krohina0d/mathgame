import { Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

interface UnicornCharacterProps {
  x: number;
  y: number;
  direction: number;
  isJumping: boolean;
}

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const trot = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-2px) rotate(2deg);
  }
  75% {
    transform: translateY(-2px) rotate(-2deg);
  }
`;

const UnicornContainer = styled(Box)<{ $direction: number; $isJumping: boolean }>(({ theme, $direction, $isJumping }) => ({
  position: 'absolute',
  width: 80,
  height: 80,
  transform: `scaleX(${$direction})`,
  animation: $isJumping ? `${bounce} 0.6s ease-in-out` : `${trot} 0.8s ease-in-out infinite`,
  zIndex: 10,
}));

const UnicornBody = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 20,
  left: 10,
  width: 60,
  height: 40,
  borderRadius: '30px 30px 20px 20px',
  background: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 50%, #FF1493 100%)',
  border: '3px solid #FF1493',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
}));

const UnicornHead = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 5,
  left: 5,
  width: 35,
  height: 30,
  borderRadius: '20px 25px 15px 20px',
  background: 'linear-gradient(135deg, #FFC0CB 0%, #FFB6C1 50%, #FF69B4 100%)',
  border: '2px solid #FF1493',
}));

const UnicornHorn = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -15,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 6,
  height: 20,
  background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
  borderRadius: '3px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 12,
    height: 8,
    background: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
    borderRadius: '50%',
    boxShadow: '0 0 10px #FFD700',
  },
}));

const UnicornMane = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: -5,
  width: 20,
  height: 35,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 15,
    height: 25,
    background: 'linear-gradient(180deg, #FF69B4 0%, #FF1493 50%, #8A2BE2 100%)',
    borderRadius: '50% 0 0 50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 8,
    left: 0,
    width: 12,
    height: 20,
    background: 'linear-gradient(180deg, #8A2BE2 0%, #FF1493 50%, #FF69B4 100%)',
    borderRadius: '50% 0 0 50%',
  },
}));

const UnicornEyes = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  left: 8,
  width: 6,
  height: 6,
  background: '#000',
  borderRadius: '50%',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -1,
    left: -1,
    width: 8,
    height: 8,
    background: 'radial-gradient(circle, #FFF 0%, transparent 70%)',
    borderRadius: '50%',
  },
}));

const UnicornNose = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 18,
  left: 12,
  width: 4,
  height: 3,
  background: '#FF69B4',
  borderRadius: '50%',
}));

const UnicornLegs = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: -15,
  left: 15,
  width: 6,
  height: 18,
  background: 'linear-gradient(180deg, #FFB6C1 0%, #FF69B4 100%)',
  borderRadius: '3px',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: -5,
    left: 15,
    width: 6,
    height: 18,
    background: 'linear-gradient(180deg, #FFB6C1 0%, #FF69B4 100%)',
    borderRadius: '3px',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -5,
    left: 30,
    width: 6,
    height: 18,
    background: 'linear-gradient(180deg, #FFB6C1 0%, #FF69B4 100%)',
    borderRadius: '3px',
  },
}));

const UnicornTail = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 25,
  right: -10,
  width: 20,
  height: 25,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 15,
    height: 20,
    background: 'linear-gradient(180deg, #FF69B4 0%, #FF1493 50%, #8A2BE2 100%)',
    borderRadius: '0 50% 50% 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 8,
    right: 0,
    width: 12,
    height: 18,
    background: 'linear-gradient(180deg, #8A2BE2 0%, #FF1493 50%, #FF69B4 100%)',
    borderRadius: '0 50% 50% 0',
  },
}));

const UnicornCharacter = ({ x, y, direction, isJumping }: UnicornCharacterProps) => {
  return (
    <UnicornContainer
      style={{ left: x, top: y }}
      $direction={direction}
      $isJumping={isJumping}
    >
      <UnicornBody />
      <UnicornHead />
      <UnicornHorn />
      <UnicornMane />
      <UnicornEyes />
      <UnicornNose />
      <UnicornLegs />
      <UnicornTail />
      
      {/* Магические искры вокруг единорога */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 100,
          height: 100,
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 2s ease-in-out infinite',
          zIndex: -1,
        }}
      />
      
      {/* Дополнительные магические частицы */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '20%',
          width: 4,
          height: 4,
          background: '#FFD700',
          borderRadius: '50%',
          animation: 'sparkle 1.5s ease-in-out infinite',
          boxShadow: '0 0 8px #FFD700',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          right: '25%',
          width: 3,
          height: 3,
          background: '#FF69B4',
          borderRadius: '50%',
          animation: 'sparkle 1.5s ease-in-out infinite 0.7s',
          boxShadow: '0 0 6px #FF69B4',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          left: '15%',
          width: 2,
          height: 2,
          background: '#00FFFF',
          borderRadius: '50%',
          animation: 'sparkle 1.5s ease-in-out infinite 1.4s',
          boxShadow: '0 0 4px #00FFFF',
        }}
      />
    </UnicornContainer>
  );
};

export default UnicornCharacter;
