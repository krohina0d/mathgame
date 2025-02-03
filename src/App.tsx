import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import NumberGame from './components/NumberGame';
import { SnackbarProvider } from 'notistack';

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
                <NumberGame />
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;
