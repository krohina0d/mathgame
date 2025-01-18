import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

interface PlayerNameDialogProps {
  open: boolean;
  onClose: () => void;
}

const PlayerNameDialog = ({ open, onClose }: PlayerNameDialogProps) => {
  const { playerName, setPlayerName } = useGame();
  const [name, setName] = useState('');

  useEffect(() => {
    if (open && playerName) {
      setName(playerName);
    }
  }, [open, playerName]);

  const handleSubmit = () => {
    if (name.trim()) {
      setPlayerName(name.trim());
      setName('');
      onClose();
    }
  };

  const handleClose = () => {
    if (playerName) {
      // Если у пользователя уже есть имя, позволяем закрыть диалог
      setName('');
      onClose();
    }
    // Если имени нет, не закрываем диалог
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        {playerName ? 'Изменить имя' : 'Введите ваше имя'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Имя"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </DialogContent>
      <DialogActions>
        {playerName && (
          <Button onClick={handleClose}>
            Отмена
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          {playerName ? 'Сохранить' : 'Начать игру'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlayerNameDialog; 