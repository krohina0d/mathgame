import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import ChatApp from './components/ChatApp';
import AuthDialog from './components/AuthDialog';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SnackbarProvider } from 'notistack';
import { CircularProgress, Box } from '@mui/material';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return user ? <ChatApp /> : <AuthDialog />;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider 
                maxSnack={3} 
                anchorOrigin={{ 
                    vertical: 'bottom', 
                    horizontal: 'center' 
                }}
            >
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;
