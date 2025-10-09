// /frontend/src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, InputAdornment, CircularProgress, Alert } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { authService } from '../services/authService.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

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
            console.error("DÉTAILS COMPLETS DE L'ERREUR:", err.response);

            const status = err.response?.status;
            let errorMessage = 'Une erreur de connexion est survenue. Veuillez réessayer.';

            if (status === 401 || status === 403) {
                errorMessage = 'L\'adresse e-mail ou le mot de passe est incorrect.';
            } else if (status === 404) {
                errorMessage = 'Aucun compte n\'est associé à cette adresse e-mail.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" className="login-page-container">
            <Box className="login-box">
                <Box className="login-header">
                    <Typography component="h1" variant="h4" color="primary">
                        Connexion
                    </Typography>
                    <Typography>
                        Bon retour parmi nous !
                    </Typography>
                </Box>
                <Box component="form" onSubmit={handleSubmit} noValidate className="login-form">
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Adresse e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><MailOutlineIcon color="secondary" /></InputAdornment>)
                        }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><LockOutlinedIcon color="secondary" /></InputAdornment>)
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        className="submit-button"
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};
export default LoginPage;