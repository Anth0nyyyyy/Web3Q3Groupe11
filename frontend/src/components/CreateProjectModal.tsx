// /frontend/src/components/CreateProjectModal.tsx
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Box, CircularProgress,Typography  } from '@mui/material';
import { projectService } from '../services/projectService.ts';

// On définit les props que ce composant accepte
interface CreateProjectModalProps {
    open: boolean;
    onClose: () => void;
    onProjectCreated: (newProject: any) => void; // Pour rafraîchir la liste
}

const CreateProjectModal = ({ open, onClose, onProjectCreated }: CreateProjectModalProps) => {
    const [name, setName] = useState('');
    const [githubOrg, setGithubOrg] = useState('');
    const [minMembers, setMinMembers] = useState(1);
    const [maxMembers, setMaxMembers] = useState(3);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const newProject = await projectService.createProject({ name, githubOrg, minMembers, maxMembers });
            onProjectCreated(newProject); // On prévient le parent que le projet est créé
            onClose(); // On ferme le modal
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold' }}>Créer un nouveau projet</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Configurez les détails du projet. Une URL unique sera générée pour que les étudiants puissent former leurs groupes.
                </DialogContentText>
                <TextField autoFocus margin="dense" label="Nom du projet (ex: Web 3 - 2025)" type="text" fullWidth variant="outlined" value={name} onChange={(e) => setName(e.target.value)} />
                <TextField margin="dense" label="Organisation GitHub (ex: HELHa-B3-Web)" type="text" fullWidth variant="outlined" value={githubOrg} onChange={(e) => setGithubOrg(e.target.value)} />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <TextField margin="dense" label="Membres Min." type="number" value={minMembers} onChange={(e) => setMinMembers(Number(e.target.value))} />
                    <TextField margin="dense" label="Membres Max." type="number" value={maxMembers} onChange={(e) => setMaxMembers(Number(e.target.value))} />
                </Box>
                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={onClose}>Annuler</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Créer le projet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateProjectModal;