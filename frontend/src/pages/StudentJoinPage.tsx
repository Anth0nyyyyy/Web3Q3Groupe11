// /frontend/src/pages/StudentJoinPage.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert, IconButton, Link } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { projectService } from '../services/projectService.ts';

const StudentJoinPage = () => {
    const { projectId, accessKey } = useParams();
    const [githubUsernames, setGithubUsernames] = useState<string[]>(['']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<{ message: string; repoUrl: string } | null>(null);

    const handleUsernameChange = (index: number, value: string) => {
        const newUsernames = [...githubUsernames];
        newUsernames[index] = value;
        setGithubUsernames(newUsernames);
    };

    const addUsernameField = () => {
        setGithubUsernames([...githubUsernames, '']);
    };

    const removeUsernameField = (index: number) => {
        const newUsernames = githubUsernames.filter((_, i) => i !== index);
        setGithubUsernames(newUsernames);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(null);

        const nonEmptyUsernames = githubUsernames.filter(name => name.trim() !== '');
        if (nonEmptyUsernames.length === 0) {
            setError('Veuillez entrer au moins un pseudo GitHub.');
            setLoading(false);
            return;
        }

        try {
            if (!projectId || !accessKey) throw new Error('ID de projet ou clé d\'accès manquante.');
            const data = await projectService.createGroupForProject(projectId, accessKey, nonEmptyUsernames);
            setSuccess(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    // --- PARTIE MANQUANTE : LE JSX ---
    if (success) {
        return (
            <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
                <Alert severity="success" sx={{ mb: 3 }}>{success.message}</Alert>
                <Typography variant="h5" gutterBottom>Votre dépôt est prêt !</Typography>
                <Button variant="contained" component={Link} href={success.repoUrl} target="_blank">
                    Accéder au dépôt GitHub
                </Button>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
                        Rejoindre un Projet
                    </Typography>
                    <Typography sx={{ mt: 1, color: 'text.secondary' }}>Projet ID: {projectId}</Typography>
                </Box>
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: 'background.paper' }}>
                    <Typography variant="h6" gutterBottom>Membres de l'équipe</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Entrez les pseudos GitHub exacts des membres de votre groupe.
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {githubUsernames.map((username, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                label={`Pseudo GitHub #${index + 1}`}
                                value={username}
                                onChange={(e) => handleUsernameChange(index, e.target.value)}
                                variant="outlined"
                            />
                            <IconButton onClick={() => removeUsernameField(index)} color="error" disabled={githubUsernames.length <= 1}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button startIcon={<AddIcon />} onClick={addUsernameField} sx={{ mt: 1 }}>
                        Ajouter un membre
                    </Button>
                    <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Créer l'équipe et le dépôt"}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default StudentJoinPage;