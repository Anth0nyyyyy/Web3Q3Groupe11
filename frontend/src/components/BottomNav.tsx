// /frontend/src/components/BottomNav.tsx
import { useState } from 'react'; // On importe juste ce dont on a besoin
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Link as RouterLink } from 'react-router-dom';

const BottomNav = () => {
    const [value, setValue] = useState(0);
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
            <BottomNavigation
                showLabels
                value={value}
                // CORRECTION : On a enlevé le paramètre "event" qui n'était pas utilisé
                onChange={(_, newValue) => {
                    setValue(newValue);
                }}
            >
                <BottomNavigationAction
                    label="Projets"
                    icon={<FolderIcon />}
                    sx={{ '&.Mui-selected': { color: 'primary.light' } }}
                />
                <BottomNavigationAction
                    label="Mon Profil"
                    icon={<PersonIcon />}
                    component={RouterLink} to="/profile" // <-- LIEN VERS LE PROFIL
                    sx={{ '&.Mui-selected': { color: 'primary.light' } }}
                />
                <BottomNavigationAction
                    label="Déconnexion"
                    icon={<LogoutIcon />}
                    onClick={handleLogout}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default BottomNav;