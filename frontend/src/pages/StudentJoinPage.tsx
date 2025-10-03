// /frontend/src/pages/StudentJoinPage.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Paper, Card, CardContent, IconButton, InputAdornment, Alert, CircularProgress, Link } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import HubIcon from '@mui/icons-material/Hub';
import BadgeIcon from '@mui/icons-material/Badge';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// CORRECTION : Chemin d'import corrigé et utilisation de 'import type'
import type { TeamMember } from '../types/index.ts';
import { projectService } from '../services/projectService.ts';

const StudentJoinPage = () => {
    const { projectId, accessKey } = useParams();

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [newMember, setNewMember] = useState<TeamMember>({
        lastName: '', firstName: '', githubUsername: '', matricule: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<{ message: string; repoUrl: string } | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setNewMember(currentMember => ({ ...currentMember, [name]: value }));
    };

    const handleAddMember = () => {
        if (newMember.firstName && newMember.lastName && newMember.githubUsername && newMember.matricule) {
            setMembers([...members, newMember]);
            setNewMember({ lastName: '', firstName: '', githubUsername: '', matricule: '' });
        } else {
            alert('Veuillez remplir tous les champs pour ajouter un membre.');
        }
    };

    const handleRemoveMember = (indexToRemove: number) => {
        setMembers(members.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmitProject = async () => {
        setError('');
        setSuccess(null);
        setLoading(true);

        const githubUsernames = members.map(m => m.githubUsername);

        if (githubUsernames.length === 0) {
            setError("Veuillez ajouter au moins un membre à l'équipe.");
            setLoading(false);
            return;
        }

        if (!projectId || !accessKey) {
            setError("Erreur : L'URL du projet est invalide ou corrompue.");
            setLoading(false);
            return;
        }

        try {
            // CORRECTION : On utilise la variable en appelant l'API
            const data = await projectService.createGroupForProject(projectId, accessKey, members);
            setSuccess(data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Une erreur est survenue lors de la création du groupe.");
        } finally {
            setLoading(false);
        }
    };

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
        <Box sx={{ backgroundColor: '#f7faf9', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="sm">
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        WEB3 HelHa 2025-2026
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Inscription jusqu'au 10/10/2025
                    </Typography>
                </Box>
                <Paper sx={{ p: 3, borderRadius: '24px', backgroundColor: '#b7e4c7', boxShadow: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Nom du groupe</Typography>
                    <Paper elevation={0} sx={{ p: 1.5, mb: 3, borderRadius: 2 }}>
                        <Typography sx={{ fontWeight: 500 }}>Web3-Groupe-1</Typography>
                    </Paper>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Membres de l'équipe {members.length}/4
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                        {members.map((member, index) => (
                            <Card key={index} sx={{ borderRadius: 2, position: 'relative' }}>
                                <IconButton size="small" onClick={() => handleRemoveMember(index)} sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'error.main', color: 'white', '&:hover': { backgroundColor: 'error.dark' }}}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                                        <Box><Typography variant="caption" color="text.secondary">Nom</Typography><Typography>{member.lastName}</Typography></Box>
                                        <Box><Typography variant="caption" color="text.secondary">Prénom</Typography><Typography>{member.firstName}</Typography></Box>
                                    </Box>
                                    <Box><Typography variant="caption" color="text.secondary">Pseudo GitHub</Typography><Typography>{member.githubUsername}</Typography></Box>
                                    <Box><Typography variant="caption" color="text.secondary">Matricule</Typography><Typography>{member.matricule}</Typography></Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                    {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                    <Paper sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField label="Nom" name="lastName" value={newMember.lastName} onChange={handleInputChange} size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon /></InputAdornment>) }} />
                            <TextField label="Prénom" name="firstName" value={newMember.firstName} onChange={handleInputChange} size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon /></InputAdornment>) }} />
                        </Box>
                        <TextField label="Pseudo GitHub" name="githubUsername" value={newMember.githubUsername} onChange={handleInputChange} size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><HubIcon /></InputAdornment>) }} />
                        <TextField label="Matricule" name="matricule" value={newMember.matricule} onChange={handleInputChange} size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><BadgeIcon /></InputAdornment>) }} />
                    </Paper>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddMember} sx={{ backgroundColor: 'primary.main' }}>
                            Ajouter un membre
                        </Button>
                    </Box>
                </Paper>
                <Button fullWidth variant="contained" disabled={loading} onClick={handleSubmitProject} sx={{ mt: 3, py: 1.5, fontSize: '1.1rem', backgroundColor: 'primary.main' }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Créer l'équipe et le dépôt GitHub"}
                </Button>
            </Container>
        </Box>
    );
};
export default StudentJoinPage;