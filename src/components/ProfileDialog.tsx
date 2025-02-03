import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import { User } from '../types/types';
import { auth } from '../config/firebase';
import { 
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { saveUser } from '../services/storage';

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfileDialog = ({ open, onClose, user, onUpdate }: ProfileDialogProps) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName) {
      setError('Пожалуйста, заполните имя и фамилию');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Пользователь не авторизован');
      }

      const displayName = `${firstName} ${lastName}`;
      await updateProfile(currentUser, { displayName });

      // Если введены пароли для смены
      if (newPassword && currentPassword) {
        if (newPassword !== confirmNewPassword) {
          setError('Новые пароли не совпадают');
          return;
        }
        if (newPassword.length < 6) {
          setError('Новый пароль должен содержать минимум 6 символов');
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
      }

      const updatedUser: User = {
        ...user,
        firstName,
        lastName,
        displayName
      };

      saveUser(updatedUser);
      onUpdate(updatedUser);
      setSuccess('Профиль успешно обновлен');
      
      // Очищаем поля паролей
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.code === 'auth/wrong-password') {
        setError('Неверный текущий пароль');
      } else if (error.code === 'auth/requires-recent-login') {
        setError('Для смены пароля необходимо заново авторизоваться');
      } else {
        setError('Ошибка при обновлении профиля. Попробуйте позже.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Редактирование профиля
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Основная информация
          </Typography>

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
          <TextField
            fullWidth
            label="Email"
            value={user.email}
            margin="normal"
            disabled
            helperText="Email нельзя изменить"
          />

          <Typography variant="subtitle2" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>
            Смена пароля (необязательно)
          </Typography>

          <TextField
            fullWidth
            label="Текущий пароль"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            margin="normal"
            type="password"
            helperText="Необходим для смены пароля"
          />
          <TextField
            fullWidth
            label="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            type="password"
          />
          <TextField
            fullWidth
            label="Подтвердите новый пароль"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            margin="normal"
            type="password"
            error={newPassword !== confirmNewPassword && confirmNewPassword !== ''}
            helperText={
              newPassword !== confirmNewPassword && confirmNewPassword !== '' 
                ? 'Пароли не совпадают' 
                : ' '
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button 
          onClick={handleUpdateProfile}
          variant="contained" 
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDialog; 