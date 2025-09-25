import { Box, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';

const rainbow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
`;

const StartContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '4rem',
  fontWeight: 'bold',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(45deg, #FF69B4, #FFD700, #FF69B4, #FFD700)',
  backgroundSize: '400% 400%',
  animation: `${rainbow} 3s ease infinite`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textShadow: '0 0 30px rgba(255, 105, 180, 0.5)',
  zIndex: 10,
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  color: '#FFF',
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  zIndex: 10,
}));

const StartButton = styled(Button)(({ theme }) => ({
  fontSize: '1.5rem',
  padding: theme.spacing(2, 4),
  borderRadius: '50px',
  background: 'linear-gradient(45deg, #FF69B4, #FFD700)',
  color: '#FFF',
  border: 'none',
  boxShadow: '0 8px 32px rgba(255, 105, 180, 0.3)',
  transition: 'all 0.3s ease',
  zIndex: 10,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(255, 105, 180, 0.5)',
    background: 'linear-gradient(45deg, #FF1493, #FFD700)',
  },
}));

const UnicornIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '20%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 120,
  height: 120,
  animation: `${float} 3s ease-in-out infinite`,
  zIndex: 5,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, #FF69B4 0%, #FF1493 100%)',
    borderRadius: '50%',
    border: '4px solid #FFD700',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -20,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 20,
    height: 30,
    background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
    borderRadius: '50%',
    boxShadow: '0 0 20px #FFD700',
  },
}));

const FloatingElements = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
}));

const FloatingElement = styled(Box)<{ $delay: number; $size: number; $color: string }>(({ theme, $delay, $size, $color }) => ({
  position: 'absolute',
  width: $size,
  height: $size,
  background: $color,
  borderRadius: '50%',
  animation: `${float} 4s ease-in-out infinite`,
  animationDelay: `${$delay}s`,
  opacity: 0.6,
}));

const Sparkle = styled(Box)<{ $delay: number }>(({ theme, $delay }) => ({
  position: 'absolute',
  width: 4,
  height: 4,
  background: '#FFD700',
  borderRadius: '50%',
  animation: `${sparkle} 2s ease-in-out infinite`,
  animationDelay: `${$delay}s`,
  boxShadow: '0 0 10px #FFD700',
}));

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
  return (
    <StartContainer>
      <FloatingElements>
        <FloatingElement $delay={0} $size={20} $color="rgba(255, 105, 180, 0.3)" style={{ top: '10%', left: '10%' }} />
        <FloatingElement $delay={1} $size={15} $color="rgba(255, 215, 0, 0.3)" style={{ top: '20%', right: '15%' }} />
        <FloatingElement $delay={2} $size={25} $color="rgba(255, 105, 180, 0.3)" style={{ top: '30%', left: '20%' }} />
        <FloatingElement $delay={3} $size={18} $color="rgba(255, 215, 0, 0.3)" style={{ top: '40%', right: '25%' }} />
        <FloatingElement $delay={4} $size={22} $color="rgba(255, 105, 180, 0.3)" style={{ top: '50%', left: '30%' }} />
        
        <Sparkle $delay={0} style={{ top: '15%', left: '25%' }} />
        <Sparkle $delay={0.5} style={{ top: '25%', right: '30%' }} />
        <Sparkle $delay={1} style={{ top: '35%', left: '40%' }} />
        <Sparkle $delay={1.5} style={{ top: '45%', right: '40%' }} />
        <Sparkle $delay={2} style={{ top: '55%', left: '50%' }} />
      </FloatingElements>

      <UnicornIcon />

      <Title variant="h1">
        Единорог и Мороженое
      </Title>

      <Subtitle variant="h2">
        Собери все мороженое и прыгай по радугам!
      </Subtitle>

      <StartButton variant="contained" onClick={onStart}>
        Начать игру
      </StartButton>

      <Box
        sx={{
          position: 'absolute',
          bottom: theme => theme.spacing(4),
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: '#FFF',
          zIndex: 10,
        }}
      >
        <Typography variant="body1" sx={{ marginBottom: 1 }}>
          Управление:
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          ← → или A/D - движение | Пробел или W - прыжок | P - пауза
        </Typography>
      </Box>
    </StartContainer>
  );
};

export default StartScreen;

