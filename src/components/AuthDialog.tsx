import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AuthDialog = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      setError(error.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError('Заполните все поля');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signUpWithEmail(email, password, displayName);
    } catch (error: any) {
      setError(error.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message || 'Ошибка входа через Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Чат с ИИ
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
          Войдите в систему, чтобы начать общение с ИИ
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Вход" />
            <Tab label="Регистрация" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleEmailSignIn}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleEmailSignUp}>
            <TextField
              fullWidth
              label="Имя"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              helperText="Минимум 6 символов"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
            </Button>
          </Box>
        </TabPanel>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            или
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{ mt: 1 }}
          >
            Войти через Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthDialog;