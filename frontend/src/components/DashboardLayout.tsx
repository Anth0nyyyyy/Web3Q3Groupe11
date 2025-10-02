// /frontend/src/components/DashboardLayout.tsx
import React from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import BottomNav from './BottomNav.tsx';

// On définit le type des props pour que le Layout puisse accepter des enfants
type DashboardLayoutProps = {
    children: React.ReactNode;
    title: string;
};

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
    return (
        // Style de fond spécifique au Dashboard
        <Box sx={{ backgroundColor: '#f7faf9', minHeight: '100vh', pb: '80px' }}>

            {/* HEADER */}
            <AppBar
                position="sticky"
                sx={{
                    background: 'rgba(247, 250, 249, 0.8)',
                    backdropFilter: 'blur(4px)',
                    boxShadow: 'none',
                    borderBottom: '1px solid #e0e0e0'
                }}
            >
                <Toolbar>
                    <IconButton edge="start" sx={{ color: 'text.secondary' }}>
                        <ArrowBackIosNewIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', color: 'text.primary', fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                    <Box sx={{ width: 40 }} /> {/* Espace pour centrer le titre */}
                </Toolbar>
            </AppBar>

            {/* CONTENU PRINCIPAL */}
            <Box component="main" sx={{ p: 2 }}>
                {children} {/* C'est ici que le contenu de la page sera injecté */}
            </Box>

            {/* NAVIGATION DU BAS */}
            <BottomNav />
        </Box>
    );
};

// LA LIGNE MANQUANTE : Il faut exporter le composant pour pouvoir l'utiliser ailleurs
export default DashboardLayout;