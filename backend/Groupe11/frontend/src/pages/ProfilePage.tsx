// /frontend/src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Paper, Divider, TextField, CircularProgress, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DashboardLayout from '../components/DashboardLayout.tsx';
import { userService } from '../services/userService.ts';
import type { IUser } from '@shared/types';

const ProfilePage = () => {
    const [profile, setProfile] = useState<IUser | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // On utilise un état séparé pour les données du formulaire d'édition
    const [editData, setEditData] = useState<Partial<IUser>>({});

    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        userService.getProfile()
            .then(data => {
                setProfile(data);
                setEditData(data); // On initialise le formulaire avec les données actuelles
            })
            .catch(err => {
                console.error("Impossible de charger le profil", err);
                setError("Impossible de charger vos informations de profil.");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditData(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleSave = async () => {
        setSaveLoading(true);
        setSuccess('');
        setError('');
        try {
            const updatedUser = await userService.updateProfile(editData);
            setProfile(updatedUser); // On met à jour l'affichage avec les nouvelles données
            setSuccess('Profil mis à jour avec succès !');
            setIsEditing(false);
        } catch (err) {
            console.error("Erreur de sauvegarde du profil", err);
            setError("Une erreur est survenue lors de la sauvegarde.");
        } finally {
            setSaveLoading(false);
        }
    };

    // Affiche un indicateur de chargement
    if (loading) {
        return <DashboardLayout title="Mon Profil"><Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box></DashboardLayout>;
    }

    // Affiche une erreur si le profil n'a pas pu être chargé
    if (error && !profile) {
        return <DashboardLayout title="Mon Profil"><Alert severity="error">{error}</Alert></DashboardLayout>;
    }

    // Affiche un fallback si le profil est null pour une raison inconnue
    if (!profile) {
        return <DashboardLayout title="Mon Profil"><Typography>Aucun profil à afficher.</Typography></DashboardLayout>;
    }

    return (
        <DashboardLayout title="Mon Profil">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ width: 128, height: 128, mb: 2, fontSize: '4rem' }} src={profile.avatarUrl}>
                    {/* Affiche les initiales si pas d'avatar */}
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {profile.firstName || profile.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Utilisateur'}
                </Typography>
                <Typography color="text.secondary">{profile.email}</Typography>
            </Box>

            <Paper sx={{ mt: 4, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                {isEditing ? (
                    // --- MODE ÉDITION ---
                    <Box component="form" noValidate autoComplete="off">
                        <Typography variant="h6" gutterBottom>Modifier le Profil</Typography>
                        <TextField fullWidth margin="normal" label="Prénom" name="firstName" value={editData.firstName || ''} onChange={handleInputChange} />
                        <TextField fullWidth margin="normal" label="Nom" name="lastName" value={editData.lastName || ''} onChange={handleInputChange} />
                        <TextField fullWidth margin="normal" label="Email" name="email" type="email" value={editData.email || ''} onChange={handleInputChange} />
                        <TextField fullWidth margin="normal" label="Nouveau mot de passe" name="password" type="password" helperText="Laissez vide pour ne pas changer" onChange={handleInputChange} />
                        <TextField fullWidth margin="normal" label="Token GitHub" name="githubToken" type="password" helperText="Laissez vide pour ne pas changer. Doit avoir les permissions 'repo' et 'admin:org'." onChange={handleInputChange} />

                        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={() => { setIsEditing(false); setEditData(profile); setError(''); setSuccess(''); }}>Annuler</Button>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saveLoading}>
                                {saveLoading ? <CircularProgress size={24} /> : 'Sauvegarder'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    // --- MODE LECTURE ---
                    <Box>
                        <Box sx={{ py: 2 }}>
                            <Typography variant="caption" color="text.secondary">Prénom</Typography>
                            <Typography>{profile.firstName || 'Non défini'}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ py: 2 }}>
                            <Typography variant="caption" color="text.secondary">Nom</Typography>
                            <Typography>{profile.lastName || 'Non défini'}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ py: 2 }}>
                            <Typography variant="caption" color="text.secondary">Email</Typography>
                            <Typography>{profile.email}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ py: 2 }}>
                            <Typography variant="caption" color="text.secondary">Token GitHub</Typography>
                            <Typography sx={{ fontStyle: 'italic' }}>******** (Masqué pour la sécurité)</Typography>
                        </Box>
                        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                    </Box>
                )}
            </Paper>

            {!isEditing && (
                <Button fullWidth variant="contained" startIcon={<EditIcon />} sx={{ mt: 3, py: 1.5 }} onClick={() => setIsEditing(true)}>
                    Modifier mes informations
                </Button>
            )}
        </DashboardLayout>
    );
};

export default ProfilePage;