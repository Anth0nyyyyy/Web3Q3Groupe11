// /frontend/src/pages/DashboardPage.tsx
import { Box, Typography, Button } from '@mui/material';

const DashboardPage = () => {

    // Fonction simple pour simuler une déconnexion
    const handleLogout = () => {
        localStorage.removeItem('user_token');
        window.location.href = '/login'; // Redirige vers la page de login
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Tableau de Bord du Professeur
            </Typography>
            <Typography>
                Bienvenue ! Vous êtes connecté.
            </Typography>
            <Button variant="contained" onClick={handleLogout} sx={{ mt: 4 }}>
                Se déconnecter
            </Button>
        </Box>
    );
};

export default DashboardPage;