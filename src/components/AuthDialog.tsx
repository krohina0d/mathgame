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
  Divider,
  CircularProgress
} from '@mui/material';
import { User } from '../types/types';
import { auth, googleProvider } from '../config/firebase';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuth: (user: User) => void;
}

const AuthDialog = ({ open, onClose, onAuth }: AuthDialogProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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

  const handleEmailRegistration = async () => {
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setIsVerificationSent(true);

      const user: User = {
        id: userCredential.user.uid,
        email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`
      };

      onAuth(user);
    } catch (error: any) {
      console.error('Error registering:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Этот email уже зарегистрирован. Попробуйте войти.');
      } else {
        setError('Ошибка при регистрации. Пожалуйста, попробуйте снова.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError('Пожалуйста, введите email и пароль');
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        setError('Пожалуйста, подтвердите ваш email перед входом');
        await sendEmailVerification(userCredential.user);
        setIsVerificationSent(true);
        return;
      }

      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
        firstName: firstName || userCredential.user.displayName?.split(' ')[0] || '',
        lastName: lastName || userCredential.user.displayName?.split(' ')[1] || '',
        displayName: userCredential.user.displayName || `${firstName} ${lastName}`
      };

      onAuth(user);
      onClose();
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Пожалуйста, введите email');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError('Инструкции по сбросу пароля отправлены на ваш email');
    } catch (error) {
      console.error('Error sending reset password:', error);
      setError('Ошибка при отправке инструкций. Проверьте email.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        {isRegistering ? 'Регистрация' : 'Вход'} для таблицы рейтинга 🏆
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {isVerificationSent && (
            <Alert severity="success" sx={{ mb: 2 }}>
              На ваш email отправлено письмо для подтверждения. Пожалуйста, проверьте почту.
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
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

          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            type="email"
          />

          {isRegistering ? (
            <>
              <TextField
                fullWidth
                label="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                type="password"
                helperText="Минимум 6 символов"
              />
              <TextField
                fullWidth
                label="Подтвердите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                type="password"
                error={password !== confirmPassword && confirmPassword !== ''}
                helperText={
                  password !== confirmPassword && confirmPassword !== '' 
                    ? 'Пароли не совпадают' 
                    : ' '
                }
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
            </>
          ) : (
            <TextField
              fullWidth
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              type="password"
            />
          )}

          {!isRegistering && (
            <Button
              onClick={handleForgotPassword}
              sx={{ mt: 1 }}
              color="primary"
            >
              Забыли пароль?
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 1 }}>
        <Button 
          fullWidth
          onClick={isRegistering ? handleEmailRegistration : handleEmailSignIn}
          variant="contained" 
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            isRegistering ? 'Зарегистрироваться' : 'Войти'
          )}
        </Button>
        <Button
          fullWidth
          onClick={() => setIsRegistering(!isRegistering)}
          color="inherit"
        >
          {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog; 