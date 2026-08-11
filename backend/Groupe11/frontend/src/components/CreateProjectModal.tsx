// /frontend/src/components/CreateProjectModal.tsx
import { useState, useEffect } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    TextField, Box, CircularProgress, Typography, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { projectService } from '../services/projectService.ts';
import { githubService } from '../services/githubService.ts';

interface CreateProjectModalProps {
    open: boolean;
    onClose: () => void;
    onProjectCreated: (newProject: any) => void;
}

interface GithubOrg {
    login: string;
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
    const [instructionsFile, setInstructionsFile] = useState<File | null>(null);

    // États pour la liste des organisations
    const [orgs, setOrgs] = useState<GithubOrg[]>([]);
    const [orgsLoading, setOrgsLoading] = useState(true);

    // États pour la gestion de l'UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setOrgsLoading(true);
            githubService.getMyOrgs()
                .then(setOrgs)
                .catch(err => {
                    console.error("Impossible de charger les organisations GitHub", err);
                    setError("Impossible de charger vos organisations. Avez-vous configuré votre token GitHub dans votre profil ?");
                })
                .finally(() => setOrgsLoading(false));
        }
    }, [open]);

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
            const formData = new FormData();
            formData.append('name', name);
            formData.append('githubOrg', githubOrg);
            formData.append('minMembers', minMembers.toString());
            formData.append('maxMembers', maxMembers.toString());
            formData.append('repoPattern', repoPattern);
            if (enrollmentEndDate) formData.append('enrollmentEndDate', enrollmentEndDate);
            if (projectEndDate) formData.append('projectEndDate', projectEndDate);
            if (instructionsFile) {
                formData.append('instructionsFile', instructionsFile);
            }

            const newProject = await projectService.createProject(formData);

            onProjectCreated(newProject);
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setGithubOrg('');
        setMinMembers(1);
        setMaxMembers(3);
        setRepoPattern('Projet-##');
        setEnrollmentEndDate('');
        setProjectEndDate('');
        setInstructionsFile(null);
        setError('');
        setOrgs([]);
        onClose();
    };

    // Fonctions de validation pour Min/Max membres
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.max(1, Number(e.target.value));
        setMinMembers(newMin);
        if (newMin > maxMembers) {
            setMaxMembers(newMin);
        }
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(1, Number(e.target.value));
        setMaxMembers(newMax);
        if (newMax < minMembers) {
            setMinMembers(newMax);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 'bold' }}>Créer un nouveau projet</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Configurez les détails du projet. Une URL unique sera générée.
                </DialogContentText>
                <TextField autoFocus margin="dense" label="Nom du projet" type="text" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
                <FormControl fullWidth margin="dense">
                    <InputLabel id="github-org-select-label">Organisation GitHub</InputLabel>
                    <Select
                        labelId="github-org-select-label"
                        value={githubOrg}
                        onChange={(e) => setGithubOrg(e.target.value)}
                        label="Organisation GitHub"
                        disabled={orgsLoading}
                    >
                        {orgsLoading && <MenuItem disabled><em>Chargement...</em></MenuItem>}
                        {!orgsLoading && orgs.length === 0 && <MenuItem disabled><em>Aucune organisation trouvée.</em></MenuItem>}
                        {orgs.map(org => (<MenuItem key={org.login} value={org.login}>{org.login}</MenuItem>))}
                    </Select>
                </FormControl>
                <TextField margin="dense" label="Pattern du nom de dépôt" type="text" fullWidth value={repoPattern} onChange={(e) => setRepoPattern(e.target.value)} />
                <TextField margin="dense" label="Date de fin d'inscription" type="date" fullWidth InputLabelProps={{ shrink: true }} value={enrollmentEndDate} onChange={(e) => setEnrollmentEndDate(e.target.value)} />
                <TextField margin="dense" label="Date de fin du projet" type="date" fullWidth InputLabelProps={{ shrink: true }} value={projectEndDate} onChange={(e) => setProjectEndDate(e.target.value)} />
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <TextField margin="dense" label="Membres Min." type="number" InputProps={{ inputProps: { min: 1 } }} fullWidth value={minMembers} onChange={handleMinChange} />
                    <TextField margin="dense" label="Membres Max." type="number" InputProps={{ inputProps: { min: 1 } }} fullWidth value={maxMembers} onChange={handleMaxChange} />
                </Box>
                <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                    Joindre un fichier de consignes (.md, .txt)
                    <input type="file" hidden accept=".md,.txt" onChange={handleFileChange} />
                </Button>
                {instructionsFile && (<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Fichier : {instructionsFile.name}</Typography>)}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
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