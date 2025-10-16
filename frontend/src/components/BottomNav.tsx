// /frontend/src/components/BottomNav.tsx

import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const handleLogout = () => {
        logout();
    };

    const getCurrentValue = () => {
        const path = location.pathname;
        if (path.startsWith('/profile')) return '/profile';
        if (path.startsWith('/dashboard') || path.startsWith('/project')) return '/dashboard';
        return false;
    };

    return (
        <Paper
            // On garde la position qui prend toute la largeur
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,

                // --- ON APPLIQUE L'EFFET DE VERRE ---
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)', // Une bordure en haut seulement
            }}
            elevation={0} // On enlève l'ombre pour un look plus plat
        >
            <BottomNavigation
                showLabels
                value={getCurrentValue()}
                sx={{ background: 'transparent' }}
            >
                <BottomNavigationAction
                    label="Projets"
                    value="/dashboard"
                    icon={<FolderIcon />}
                    component={RouterLink} to="/dashboard"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-selected': { color: 'white' },
                    }}
                />
                <BottomNavigationAction
                    label="Mon Profil"
                    value="/profile"
                    icon={<PersonIcon />}
                    component={RouterLink} to="/profile"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-selected': { color: 'white' },
                    }}
                />
                <BottomNavigationAction
                    label="Déconnexion"
                    icon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                    }}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;