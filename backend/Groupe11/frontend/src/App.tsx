// /frontend/src/App.tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext.tsx';
import AppRouter from './routeurs/AppRouter.tsx';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider> {/* Notre gardien enveloppe tout */}
                <AppRouter />  {/* Notre système de routes gère ce qui est affiché */}
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;