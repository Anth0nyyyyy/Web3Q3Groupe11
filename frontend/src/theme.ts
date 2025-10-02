// /frontend/src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#40916c',      // Le vert "brand" principal
        },
        secondary: {
            main: '#52b788',      // Le vert secondaire
        },
        background: {
            default: '#f7faf8',    // Un fond global très clair
            paper: '#ffffff',
        },
        text: {
            primary: '#081c15',     // Un texte très sombre pour le contraste
            secondary: '#555555',
        },
        info: {
            main: '#3b82f6', // Le bleu pour le statut "actif"
        },
        error: {
            main: '#ef4444', // Le rouge pour le statut "erreur"
        }
    },
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        button: {
            textTransform: 'none', // Pas de majuscules sur les boutons
            fontWeight: 600,
        }
    },
    shape: {
        borderRadius: 12, // Un radius de base pour la cohérence
    },
});

export default theme;