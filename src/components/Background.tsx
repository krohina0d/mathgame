import { Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;

const BackgroundContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
  overflow: 'hidden',
}));

const Sun = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 50,
  right: 100,
  width: 80,
  height: 80,
  background: 'radial-gradient(circle, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
  borderRadius: '50%',
  boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)',
  animation: `${rotate} 20s linear infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: `${sparkle} 3s ease-in-out infinite`,
  },
}));

const SunRays = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 120,
  height: 120,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -20,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 4,
    height: 20,
    background: '#FFD700',
    borderRadius: '2px',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -20,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 4,
    height: 20,
    background: '#FFD700',
    borderRadius: '2px',
  },
}));

const Cloud = styled(Box)<{ $delay: number; $size: number }>(({ theme, $delay, $size }) => ({
  position: 'absolute',
  width: $size,
  height: $size * 0.6,
  background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.5) 100%)',
  borderRadius: '50px',
  animation: `${float} 8s ease-in-out infinite`,
  animationDelay: `${$delay}s`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -20,
    left: 20,
    width: $size * 0.6,
    height: $size * 0.6,
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -10,
    right: 30,
    width: $size * 0.5,
    height: $size * 0.5,
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
    borderRadius: '50%',
  },
}));

const Star = styled(Box)<{ $delay: number; $size: number }>(({ theme, $delay, $size }) => ({
  position: 'absolute',
  width: $size,
  height: $size,
  background: '#FFD700',
  borderRadius: '50%',
  boxShadow: `0 0 ${$size * 2}px rgba(255, 215, 0, 0.8)`,
  animation: `${sparkle} 2s ease-in-out infinite`,
  animationDelay: `${$delay}s`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: $size * 3,
    height: $size * 3,
    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
  },
}));

const Butterfly = styled(Box)<{ $delay: number }>(({ theme, $delay }) => ({
  position: 'absolute',
  width: 20,
  height: 15,
  animation: `${float} 6s ease-in-out infinite`,
  animationDelay: `${$delay}s`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 10,
    height: 15,
    background: 'linear-gradient(45deg, #FF69B4 0%, #FF1493 100%)',
    borderRadius: '50% 50% 50% 0',
    transform: 'rotate(-45deg)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 15,
    background: 'linear-gradient(-45deg, #FF69B4 0%, #FF1493 100%)',
    borderRadius: '50% 50% 0 50%',
    transform: 'rotate(45deg)',
  },
}));

const Background = () => {
  return (
    <BackgroundContainer>
      {/* Солнце */}
      <Sun>
        <SunRays />
      </Sun>

      {/* Облака */}
      <Cloud $delay={0} $size={120} style={{ top: 80, left: 50 }} />
      <Cloud $delay={2} $size={100} style={{ top: 120, left: 300 }} />
      <Cloud $delay={4} $size={140} style={{ top: 90, left: 600 }} />
      <Cloud $delay={1} $size={80} style={{ top: 150, left: 150 }} />
      <Cloud $delay={3} $size={110} style={{ top: 110, left: 450 }} />

      {/* Звёзды */}
      <Star $delay={0} $size={3} style={{ top: 200, left: 100 }} />
      <Star $delay={0.5} $size={2} style={{ top: 180, left: 250 }} />
      <Star $delay={1} $size={4} style={{ top: 220, left: 400 }} />
      <Star $delay={1.5} $size={2} style={{ top: 160, left: 550 }} />
      <Star $delay={2} $size={3} style={{ top: 240, left: 700 }} />

      {/* Бабочки */}
      <Butterfly $delay={0} style={{ top: 300, left: 200 }} />
      <Butterfly $delay={2} style={{ top: 280, left: 500 }} />
      <Butterfly $delay={4} style={{ top: 320, left: 350 }} />

      {/* Градиентный фон */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 50%, #F0E68C 100%)',
          zIndex: -1,
        }}
      />

      {/* Дополнительные декоративные элементы */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          zIndex: -1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          zIndex: -1,
        }}
      />
    </BackgroundContainer>
  );
};

export default Background;

