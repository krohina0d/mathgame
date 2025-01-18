import { Box, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import characterImage from '../assets/images/character.png';

const SpeechBubble = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: '-15px',
    left: '50%',
    border: '15px solid transparent',
    borderTopColor: '#fff',
    borderBottom: 0,
    marginLeft: '-15px',
  }
}));

const CharacterContainer = styled(Box)({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 'fit-content'
});

const CharacterImage = styled('img')({
  width: '150px',
  height: 'auto',
  objectFit: 'contain',
});

interface GameCharacterProps {
  isSuccess: boolean | null;
  attempt: number;
}

const successMessages = [
  'Молодец! Так держать! 🌟',
  'Отличная работа! 👏',
  'Ты настоящий математик! 🎯',
  'Супер! Продолжай в том же духе! ⭐',
  'Вау! Ты справился! 🎉'
];

const failureMessages = [
  'Попробуй еще раз! Ты сможешь! 💪',
  'Почти получилось! Давай еще разок! 🎲',
  'Не сдавайся, у тебя всё получится! 🌈',
  'Ничего страшного, попробуй снова! 🌟',
  'Я верю в тебя! Попробуй еще раз! 🍀'
];

const GameCharacter = ({ isSuccess, attempt }: GameCharacterProps) => {
  if (isSuccess === null) {
    return (
      <CharacterContainer sx={{ mt: 2, mb: 2 }}>
        <SpeechBubble 
          elevation={3}
          sx={{ 
            bgcolor: 'primary.light',
            maxWidth: '250px',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6">
            Привет! Я помогу тебе в игре! 👋
          </Typography>
        </SpeechBubble>
        <CharacterImage src={characterImage} alt="Game Character" />
      </CharacterContainer>
    );
  }

  const messages = isSuccess ? successMessages : failureMessages;
  const messageIndex = attempt % messages.length;

  return (
    <CharacterContainer sx={{ mt: 2, mb: 2 }}>
      <SpeechBubble 
        elevation={3}
        sx={{ 
          bgcolor: isSuccess ? 'success.light' : 'info.light',
          maxWidth: '250px',
          textAlign: 'center'
        }}
      >
        <Typography variant="h6">
          {messages[messageIndex]}
        </Typography>
      </SpeechBubble>
      <CharacterImage 
        src={characterImage} 
        alt="Game Character"
        sx={{ 
          transform: isSuccess ? 'none' : 'translateY(5px)',
          transition: 'transform 0.3s ease-in-out'
        }}
      />
    </CharacterContainer>
  );
};

export default GameCharacter; 