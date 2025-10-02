// /frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, InputAdornment, CircularProgress, Alert } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// On importe notre nouveau service
import { authService } from '../services/authService';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Nouveaux états pour gérer le chargement et les erreurs
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(''); // On réinitialise l'erreur
        setLoading(true); // On active le chargement

        try {
            const data = await authService.login(email, password);
            console.log('Connexion réussie ! Token:', data.token);
            // Ici, on redirigera l'utilisateur vers son tableau de bord
            alert('Connexion réussie !');
        } catch (err: any) {
            // Si le serveur renvoie une erreur (ex: 401 Unauthorized), Axios la capture
            const errorMessage = err.response?.data?.message || 'Une erreur est survenue.';
            setError(errorMessage);
            console.error('Erreur de connexion:', errorMessage);
        } finally {
            setLoading(false); // On désactive le chargement dans tous les cas
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
                    {/* Affiche l'alerte d'erreur si elle existe */}
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