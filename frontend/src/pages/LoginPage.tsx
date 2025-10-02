// /frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import pour la redirection
import { Container, Box, Typography, TextField, Button, InputAdornment, CircularProgress, Alert } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// On importe notre service et notre contexte (avec les extensions de fichier)
import { authService } from '../services/authService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate(); // Hook de React Router pour changer de page
    const { login } = useAuth();    // On récupère la fonction 'login' de notre AuthContext

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            // On appelle le service pour se connecter
            const data = await authService.login(email, password);

            // Si la connexion réussit, on met à jour l'état global de l'application
            login(data.token);

            // Et on redirige l'utilisateur vers son tableau de bord
            navigate('/dashboard');

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Une erreur est survenue.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography component="h1" variant="h4" sx={{ fontWeight: '900', color: 'primary.main' }}>
                        Connexion
                    </Typography>
                    <Typography sx={{ mt: 1, opacity: 0.8 }}>
                        Bon retour parmi nous !
                    </Typography>
                </Box>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', p: 3, borderRadius: '24px', background: '#eafaf1', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        margin="normal" required fullWidth placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutlineIcon sx={{ color: 'secondary.main' }} /></InputAdornment>), sx: { borderRadius: '12px', height: '56px', background: 'white' } }}
                    />
                    <TextField
                        margin="normal" required fullWidth placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><LockOutlinedIcon sx={{ color: 'secondary.main' }} /></InputAdornment>), sx: { borderRadius: '12px', height: '56px', background: 'white' } }}
                    />
                    <Button
                        type="submit" fullWidth variant="contained" disabled={loading}
                        sx={{ mt: 3, mb: 2, height: '56px', fontSize: '1.125rem', boxShadow: '0 8px 15px -3px rgba(64, 145, 108, 0.4)', '&:hover': { backgroundColor: '#2d6a4f' } }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;