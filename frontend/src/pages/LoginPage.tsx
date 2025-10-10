// /frontend/src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { authService } from '../services/authService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

// On importe les deux illustrations depuis le dossier assets
import CommitTree from '../assets/CommitTree.png';
import BackgroundShapes from '../assets/BackgroundShapes.png'; // <-- VOTRE IMAGE PERSONNALISÉE
import './LoginPage.scss';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            login(data.token);
            navigate('/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Identifiants invalides.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="login-page-container">
            <Box className="login-card">

                {/* On utilise votre image personnalisée ici, à la place du SVG */}
                <img src={BackgroundShapes} alt="Formes abstraites de fond" className="background-shapes-image" />

                {/* Conteneur pour le formulaire (partie gauche) */}
                <Box className="login-form-container">
                    <Typography variant="h3" className="login-title">SE CONNECTER</Typography>
                    <Typography className="login-subtitle">Entrez vos informations de connexion</Typography>

                    <Box component="form" onSubmit={handleSubmit} className="login-form">
                        <TextField
                            required variant="standard" label="ADRESSE E-MAIL*" fullWidth
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            required variant="standard" label="MOT DE PASSE*" type="password" fullWidth
                            value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <Typography className="error-message">{error}</Typography>}
                        <Button type="submit" variant="contained" disabled={loading} className="submit-button">
                            {loading ? <CircularProgress size={24} /> : 'SE CONNECTER'}
                        </Button>
                    </Box>
                </Box>

                {/* Conteneur pour l'illustration de l'arbre (partie droite) */}
                <Box className="login-illustration-container">
                    <img src={CommitTree} alt="Illustration d'un arbre de commits" />
                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;