// /frontend/src/components/CreateProjectModal.tsx
import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Box, CircularProgress, Typography } from '@mui/material';
import { projectService } from '../services/projectService.ts';

interface CreateProjectModalProps {
    open: boolean;
    onClose: () => void;
    onProjectCreated: (newProject: any) => void;
}

const CreateProjectModal = ({ open, onClose, onProjectCreated }: CreateProjectModalProps) => {
    // États pour les champs du formulaire
    const [name, setName] = useState('');
    const [githubOrg, setGithubOrg] = useState('');
    const [minMembers, setMinMembers] = useState(1);
    const [maxMembers, setMaxMembers] = useState(3);
    const [repoPattern, setRepoPattern] = useState('Projet-##');
    const [enrollmentEndDate, setEnrollmentEndDate] = useState('');
    const [projectEndDate, setProjectEndDate] = useState('');


    // Nouvel état pour gérer le fichier de consignes
    const [instructionsFile, setInstructionsFile] = useState<File | null>(null);

    // États pour la gestion de l'UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setInstructionsFile(event.target.files[0]);
        } else {
            setInstructionsFile(null);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            // Pour envoyer un fichier, nous devons construire un objet FormData
            const formData = new FormData();
            formData.append('name', name);
            formData.append('githubOrg', githubOrg);
            formData.append('minMembers', minMembers.toString());
            formData.append('maxMembers', maxMembers.toString());
            formData.append('repoPattern', repoPattern);
            formData.append('enrollmentEndDate', enrollmentEndDate);
            formData.append('projectEndDate', projectEndDate);


            // On ajoute le fichier s'il a été sélectionné
            if (instructionsFile) {
                formData.append('instructionsFile', instructionsFile);
            }

            // On appelle la fonction du service qui sait gérer les FormData
            const newProject = await projectService.createProject(formData);

            onProjectCreated(newProject);
            handleClose(); // On nettoie et ferme le modal
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour réinitialiser tous les champs en fermant
    const handleClose = () => {
        setName('');
        setGithubOrg('');
        setMinMembers(1);
        setMaxMembers(3);
        setRepoPattern('Projet-##');
        setInstructionsFile(null);
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold' }}>Créer un nouveau projet</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Configurez les détails du projet. Une URL unique sera générée pour que les étudiants puissent former leurs groupes.
                </DialogContentText>
                <TextField autoFocus margin="dense" label="Nom du projet (ex: Web 3 - 2025)" type="text" fullWidth variant="outlined" value={name} onChange={(e) => setName(e.target.value)} />
                <TextField margin="dense" label="Organisation GitHub (ex: HELHa-B3-Web)" type="text" fullWidth variant="outlined" value={githubOrg} onChange={(e) => setGithubOrg(e.target.value)} />
                <TextField margin="dense" label="Pattern du nom de dépôt (ex: Web3-Groupe-##)" type="text" fullWidth variant="outlined" value={repoPattern} onChange={(e) => setRepoPattern(e.target.value)} />
                <TextField margin="dense" label="Date de fin d'inscription" type="date" fullWidth InputLabelProps={{ shrink: true }} value={enrollmentEndDate} onChange={(e) => setEnrollmentEndDate(e.target.value)} />
                <TextField margin="dense" label="Date de fin du projet" type="date" fullWidth InputLabelProps={{ shrink: true }} value={projectEndDate} onChange={(e) => setProjectEndDate(e.target.value)} />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <TextField margin="dense" label="Membres Min." type="number" InputProps={{ inputProps: { min: 1 } }} fullWidth value={minMembers} onChange={(e) => setMinMembers(Number(e.target.value))} />
                    <TextField margin="dense" label="Membres Max." type="number" InputProps={{ inputProps: { min: 1 } }} fullWidth value={maxMembers} onChange={(e) => setMaxMembers(Number(e.target.value))} />
                </Box>
                <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                    Joindre un fichier de consignes (.md, .txt)
                    <input type="file" hidden accept=".md,.txt" onChange={handleFileChange} />
                </Button>
                {instructionsFile && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Fichier sélectionné : {instructionsFile.name}
                    </Typography>
                )}
                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            </DialogContent>
            <DialogActions sx={{ p: '0 24px 16px' }}>
                <Button onClick={handleClose}>Annuler</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Créer le projet'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateProjectModal;