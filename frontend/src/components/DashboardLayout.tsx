// /frontend/src/components/DashboardLayout.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import BottomNav from './BottomNav.tsx';
import DesignDashboard from '../assets/DesignDashboard.png'; // <-- On importe l'image de fond

type DashboardLayoutProps = {
    children: React.ReactNode;
    title: string;
};

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
    const navigate = useNavigate();
    return (
        // Le conteneur principal a maintenant l'image de fond
        <Box sx={{
            minHeight: '100vh',
            pb: '80px', // Espace pour la BottomNav
            backgroundImage: `url(${DesignDashboard})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed', // Le fond reste fixe au défilement
        }}>

            {/* HEADER - On le rend transparent */}
            <AppBar
                position="sticky"
                elevation={0} // On enlève toute ombre
                sx={{ background: 'transparent' }}
            >
                <Toolbar>
                    <IconButton edge="start" sx={{ color: 'white' }} onClick={() => navigate(-1)}>
                        <ArrowBackIosNewIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', color: 'white', fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                    <Box sx={{ width: 40 }} />
                </Toolbar>
            </AppBar>

            {/* CONTENU PRINCIPAL */}
            <Box component="main" sx={{ p: 2 }}>
                {children}
            </Box>

            {/* NAVIGATION DU BAS - Elle reste identique */}
            <BottomNav />
        </Box>
    );
};

export default DashboardLayout;