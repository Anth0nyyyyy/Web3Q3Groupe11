// /frontend/src/App.tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import theme from './theme'; // On importe notre thème personnalisé

function App() {
    return (
        <ThemeProvider theme={theme}>
            {/* CssBaseline réinitialise les styles du navigateur pour être cohérent */}
            <CssBaseline />
            <LoginPage />
        </ThemeProvider>
    );
}

export default App;