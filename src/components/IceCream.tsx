import { Box, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

interface IceCreamProps {
  x: number;
  y: number;
  type: 'vanilla' | 'chocolate' | 'strawberry';
}

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
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

const IceCreamContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 30,
  height: 30,
  animation: `${float} 3s ease-in-out infinite`,
  zIndex: 8,
}));

const IceCreamCone = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 20,
  height: 15,
  background: 'linear-gradient(180deg, #8B4513 0%, #A0522D 100%)',
  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
  border: '1px solid #654321',
}));

const IceCreamScoop = styled(Box)<{ $type: string }>(({ theme, $type }) => {
  const colors = {
    vanilla: {
      main: '#FFFACD',
      shadow: '#F0E68C',
      highlight: '#FFFFF0',
    },
    chocolate: {
      main: '#8B4513',
      shadow: '#654321',
      highlight: '#A0522D',
    },
    strawberry: {
      main: '#FFB6C1',
      shadow: '#FF69B4',
      highlight: '#FFC0CB',
    },
  };

  const color = colors[$type as keyof typeof colors];

  return {
    position: 'absolute',
    bottom: 15,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 24,
    height: 20,
    background: `radial-gradient(circle at 30% 30%, ${color.highlight} 0%, ${color.main} 50%, ${color.shadow} 100%)`,
    borderRadius: '50%',
    border: `2px solid ${color.shadow}`,
    boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '20%',
      left: '25%',
      width: 8,
      height: 8,
      background: `radial-gradient(circle, ${color.highlight} 0%, transparent 70%)`,
      borderRadius: '50%',
    },
  };
});

const Sprinkles = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 5,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 20,
  height: 15,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 2,
    width: 2,
    height: 8,
    background: '#FF69B4',
    borderRadius: '1px',
    transform: 'rotate(-15deg)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 3,
    right: 2,
    width: 2,
    height: 6,
    background: '#32CD32',
    borderRadius: '1px',
    transform: 'rotate(20deg)',
  },
}));

const SparkleEffect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 40,
  height: 40,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 4,
    height: 4,
    background: '#FFD700',
    borderRadius: '50%',
    animation: `${sparkle} 1.5s ease-in-out infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 3,
    height: 3,
    background: '#FF69B4',
    borderRadius: '50%',
    animation: `${sparkle} 1.5s ease-in-out infinite 0.5s`,
  },
}));

const IceCream = ({ x, y, type }: IceCreamProps) => {
  return (
    <IceCreamContainer style={{ left: x, top: y }}>
      <IceCreamCone />
      <IceCreamScoop $type={type} />
      <Sprinkles />
      <SparkleEffect />
      
      {/* Дополнительные искры */}
      <Box
        sx={{
          position: 'absolute',
          top: -5,
          left: -5,
          width: 40,
          height: 40,
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: `${sparkle} 2s ease-in-out infinite 1s`,
        }}
      />
    </IceCreamContainer>
  );
};

export default IceCream;

