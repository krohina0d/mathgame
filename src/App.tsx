import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import NumberGame from './components/NumberGame';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        secondary: {
            main: '#f50057',
        },
    },
});

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container>
                <NumberGame />
            </Container>
        </ThemeProvider>
    );
};

export default App;
