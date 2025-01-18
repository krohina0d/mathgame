import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography,
  IconButton,
  Tooltip,
  Button,
  Box 
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useGame } from '../context/GameContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { styled } from '@mui/material/styles';

const AnimatedTableRow = styled(TableRow)`
  transition: background-color 0.3s ease;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

const ScoreCell = styled(TableCell)`
  font-weight: bold;
  color: #1976d2;
`;

interface LeaderboardProps {
  id?: string;
}

const Leaderboard = ({ id }: LeaderboardProps) => {
  const { highScores, isAdmin, deleteScore, clearAllScores } = useGame();
  console.log('Leaderboard isAdmin:', isAdmin);

  const handleDelete = async (scoreId: string, playerName: string) => {
    if (window.confirm(`Удалить результат игрока ${playerName}?`)) {
      await deleteScore(scoreId);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Вы уверены, что хотите удалить ВСЕ результаты?')) {
      await clearAllScores();
    }
  };

  return (
    <Paper 
      id={id}
      sx={{ 
        width: '100%', 
        maxWidth: 600, 
        mt: 2, 
        mb: 2,
        touchAction: 'pan-y',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollMarginTop: '1rem',
      }}
    >
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          Таблица лидеров
        </Typography>
        {isAdmin && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleClearAll}
          >
            Очистить все
          </Button>
        )}
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Место</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell align="right">Очки</TableCell>
              <TableCell align="right">Дата</TableCell>
              {isAdmin && <TableCell align="right">Действия</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {highScores.map((score, index) => (
              <AnimatedTableRow key={score.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{score.name}</TableCell>
                <ScoreCell align="right">{score.score}</ScoreCell>
                <TableCell align="right">
                  {format(new Date(score.timestamp), 'dd MMM HH:mm', { locale: ru })}
                </TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <Tooltip title="Удалить результат">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(score.id, score.name)}
                        color="error"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </AnimatedTableRow>
            ))}
            {highScores.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                  Пока нет результатов
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Leaderboard; 