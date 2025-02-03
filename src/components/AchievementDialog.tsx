import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Grid,
  Paper,
  Button
} from '@mui/material';
import { Achievement, UserAchievement } from '../types/types';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AchievementDialogProps {
  open: boolean;
  onClose: () => void;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  currentLevel: number;
  currentStreak: number;
}

const AchievementDialog = ({ 
  open, 
  onClose, 
  achievements, 
  userAchievements,
  currentLevel,
  currentStreak
}: AchievementDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        Достижения уровня {currentLevel}
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
          Текущая серия: {currentStreak} ✨
        </Typography>
        <Grid container spacing={2}>
          {achievements
            .filter(achievement => achievement.level === currentLevel)
            .map(achievement => {
              const isUnlocked = userAchievements.some(
                ua => ua.achievementId === achievement.id && ua.level === currentLevel
              );
              const unlockedAt = userAchievements.find(
                ua => ua.achievementId === achievement.id && ua.level === currentLevel
              )?.unlockedAt;

              return (
                <Grid item xs={12} sm={6} key={achievement.id}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: isUnlocked ? 'success.light' : 'background.paper',
                      opacity: isUnlocked ? 1 : 0.7
                    }}
                  >
                    <Box sx={{ 
                      fontSize: '2rem',
                      opacity: isUnlocked ? 1 : 0.5
                    }}>
                      {achievement.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {achievement.title}
                        {isUnlocked ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <LockIcon color="action" />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {achievement.description}
                      </Typography>
                      {isUnlocked && (
                        <Typography variant="caption" color="success.dark">
                          Получено: {new Date(unlockedAt!).toLocaleDateString()}
                        </Typography>
                      )}
                      {!isUnlocked && (
                        <Typography variant="caption" color="text.secondary">
                          Прогресс: {currentStreak}/{achievement.requiredStreak}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
        </Grid>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button variant="contained" onClick={onClose}>
            Закрыть
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementDialog; 