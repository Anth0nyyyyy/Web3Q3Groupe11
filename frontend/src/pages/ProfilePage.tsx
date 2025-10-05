// /frontend/src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react'; // On importe juste useState et useEffect
import { Box, Typography, Button, Avatar, Paper, Divider, TextField, CircularProgress, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DashboardLayout from '../components/DashboardLayout.tsx';
import { userService } from '../services/userService.ts';

interface UserProfile {
    _id: string;
    email: string;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [githubToken, setGithubToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                setProfile(data);
            } catch (error) {
                console.error("Impossible de charger le profil", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaveLoading(true);
        setSuccess('');
        try {
            await userService.updateProfile({ githubToken });
            setSuccess('Vos informations ont été mises à jour avec succès.');
            setIsEditing(false);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde", error);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return <DashboardLayout title="Mon Profil"><CircularProgress /></DashboardLayout>;
    }

    if (!profile) {
        return <DashboardLayout title="Mon Profil"><Alert severity="error">Profil non trouvé.</Alert></DashboardLayout>;
    }

    return (
        <DashboardLayout title="Mon Profil">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ width: 128, height: 128, mb: 2 }} src="https://source.unsplash.com/random/128x128?person" />
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{profile.email.split('@')[0]}</Typography>
                <Typography color="text.secondary">{profile.email}</Typography>
            </Box>

            <Paper sx={{ mt: 4, p: 3, borderRadius: 2 }}>
                {isEditing ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>Modifier le Profil</Typography>
                        <TextField
                            fullWidth
                            label="Personal Access Token GitHub"
                            type="password"
                            helperText="Le token doit avoir les permissions 'repo' et 'admin:org'"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={() => setIsEditing(false)}>Annuler</Button>
                            <Button variant="contained" onClick={handleSave} disabled={saveLoading}>
                                {saveLoading ? <CircularProgress size={24} /> : 'Sauvegarder'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ py: 2 }}>
                            <Typography variant="caption" color="text.secondary">Email</Typography>
                            <Typography>{profile.email}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ py: 2 }}>
                            <Typography variant="caption" color="text.secondary">Token GitHub</Typography>
                            <Typography sx={{ fontStyle: 'italic' }}>******** (masqué pour la sécurité)</Typography>
                        </Box>
                        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                    </Box>
                )}
            </Paper>

            {!isEditing && (
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<EditIcon />}
                    sx={{ mt: 3, py: 1.5 }}
                    onClick={() => setIsEditing(true)}
                >
                    Modifier mes informations
                </Button>
            )}
        </DashboardLayout>
    );
};

export default ProfilePage;