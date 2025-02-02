import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Divider
} from '@mui/material';
import { User } from '../types/types';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuth: (user: User) => void;
}

const AuthDialog = ({ open, onClose, onAuth }: AuthDialogProps) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user: User = {
        id: result.user.uid,
        email: result.user.email || '',
        firstName: result.user.displayName?.split(' ')[0] || '',
        lastName: result.user.displayName?.split(' ')[1] || '',
        displayName: result.user.displayName || ''
      };
      onAuth(user);
      onClose();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Ошибка при входе через Google. Пожалуйста, попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (!email || !firstName || !lastName) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`
    };

    onAuth(user);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        Регистрация для таблицы рейтинга 🏆
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            startIcon={<GoogleIcon />}
            sx={{ 
              mb: 3,
              py: 1.5,
              bgcolor: '#4285f4',
              '&:hover': {
                bgcolor: '#3367d6'
              }
            }}
          >
            Войти через Google
          </Button>

          <Divider sx={{ mb: 3 }}>
            <Typography color="textSecondary">или</Typography>
          </Divider>

          <Typography variant="body1" sx={{ mb: 2 }}>
            Заполните форму вручную:
          </Typography>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button 
          onClick={handleManualSubmit} 
          variant="contained" 
          color="primary"
          disabled={isLoading}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog; 