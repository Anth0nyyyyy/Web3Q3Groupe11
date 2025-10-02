// /frontend/src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#40916c',      // Votre couleur "primary"
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#52b788',      // Votre couleur "secondary"
        },
        background: {
            default: '#f7faf8',    // Votre "background-light"
            paper: '#ffffff',       // Fond des cartes, comme le formulaire
        },
        text: {
            primary: '#081c15',     // Votre "text-light"
            secondary: '#52b788',   // Pour les textes moins importants
        },
    },
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', // On définit "Inter" comme police par défaut
        h1: {
            fontWeight: 900,
        },
        h5: {
            fontWeight: 700,
        },
        button: {
            fontWeight: 700,
            textTransform: 'none', // Pour que le texte du bouton ne soit pas en majuscules
        }
    },
    shape: {
        borderRadius: 12, // Correspond à votre "rounded-xl" (0.75rem * 16px)
    },
});

export default theme;