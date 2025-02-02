import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Typography,
  Tabs,
  Tab
} from '@mui/material';
import { useState } from 'react';
import { LeaderboardEntry, LEVELS } from '../types/types';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface LeaderboardProps {
  open: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
}

const Leaderboard = ({ open, onClose, entries }: LeaderboardProps) => {
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Фильтруем записи по выбранному уровню и сортируем по очкам
  const filteredEntries = entries
    .filter(entry => entry.level === selectedLevel)
    .sort((a, b) => b.score - a.score);

  const getMedalColor = (index: number) => {
    switch(index) {
      case 0: return '#FFD700'; // Золото
      case 1: return '#C0C0C0'; // Серебро
      case 2: return '#CD7F32'; // Бронза
      default: return 'transparent';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Таблица рекордов
          </Typography>
        </Box>
        
        <Tabs
          value={selectedLevel}
          onChange={(_, newValue) => setSelectedLevel(newValue)}
          sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 2,
            '& .MuiTab-root': { minWidth: 100 }
          }}
        >
          {Object.keys(LEVELS).map((level) => (
            <Tab 
              key={level}
              label={`Уровень ${level}`}
              value={Number(level)}
              sx={{ fontWeight: 'bold' }}
            />
          ))}
        </Tabs>
      </DialogTitle>

      <DialogContent>
        {filteredEntries.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
            Пока нет результатов для уровня {selectedLevel}. Будьте первым! 🎮
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ 
            mt: 2,
            boxShadow: 3,
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Место</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Игрок</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Очки</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Найдено пар</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Дата</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEntries.map((entry, index) => (
                  <TableRow
                    key={`${entry.userId}-${entry.timestamp}`}
                    sx={{
                      bgcolor: index < 3 ? `${getMedalColor(index)}10` : 'inherit',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {index < 3 ? (
                          <EmojiEventsIcon sx={{ color: getMedalColor(index) }} />
                        ) : (
                          index + 1
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                      {entry.displayName}
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontWeight: 'bold',
                      color: 'success.main'
                    }}>
                      {entry.score}
                    </TableCell>
                    <TableCell align="right">
                      {entry.foundPairs}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            onClick={onClose} 
            variant="contained"
            size="large"
            sx={{ 
              minWidth: 200,
              borderRadius: 2
            }}
          >
            Закрыть
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Leaderboard; 