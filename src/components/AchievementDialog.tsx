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
}

const AchievementDialog = ({ 
  open, 
  onClose, 
  achievements, 
  userAchievements
}: AchievementDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>
        Достижения
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {achievements.map(achievement => {
            const isUnlocked = userAchievements.some(
              ua => ua.achievementId === achievement.id
            );
            const unlockedAt = userAchievements.find(
              ua => ua.achievementId === achievement.id
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