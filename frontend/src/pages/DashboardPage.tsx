// /frontend/src/pages/DashboardPage.tsx

import { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, CardActions, Button, CircularProgress, IconButton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Snackbar, Alert, TextField, Stack, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout.tsx';
import { projectService } from '../services/projectService.ts';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateProjectModal from '../components/CreateProjectModal.tsx';
import type { IProject } from '../types/index.ts';

const DashboardPage = () => {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string }>({ open: false, message: '' });

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('creation-desc');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectService.getMyProjects();
                setProjects(data);
            } catch (error) {
                console.error("Impossible de charger les projets", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const displayedProjects = useMemo(() => {
        return [...projects]
            .filter(project =>
                project.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                switch (sortBy) {
                    case 'creation-desc':
                        return b._id.localeCompare(a._id);
                    case 'creation-asc':
                        return a._id.localeCompare(b._id);
                    case 'deadline-asc':
                        if (!a.projectEndDate) return 1;
                        if (!b.projectEndDate) return -1;
                        return new Date(a.projectEndDate).getTime() - new Date(b.projectEndDate).getTime();
                    case 'name-asc':
                        return a.name.localeCompare(b.name);
                    default:
                        return 0;
                }
            });
    }, [projects, searchTerm, sortBy]);

    const getShareableUrl = (project: IProject) => `${window.location.origin}/join/${project._id}/${project.accessKey}`;

    const handleProjectCreated = (newProject: IProject) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
    };

    const openDeleteConfirm = (e: React.MouseEvent, project: IProject) => {
        e.preventDefault();
        e.stopPropagation();
        setProjectToDelete(project);
        setIsDeleteConfirmOpen(true);
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        try {
            await projectService.deleteProject(projectToDelete._id);
            setProjects(prevProjects => prevProjects.filter(p => p._id !== projectToDelete._id));
            setSnackbar({ open: true, message: 'Projet supprimé avec succès !' });
        } catch (error) {
            console.error("Erreur lors de la suppression du projet", error);
            setSnackbar({ open: true, message: 'Erreur lors de la suppression.' });
        } finally {
            setIsDeleteConfirmOpen(false);
            setProjectToDelete(null);
        }
    };

    const handleCopyClick = (e: React.MouseEvent, project: IProject) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(getShareableUrl(project));
        setSnackbar({ open: true, message: 'Lien de partage copié !' });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <DashboardLayout title="Projets">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : (
                <Box>
                    {projects.length > 0 && (
                        <Stack spacing={2} sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Rechercher un projet..."
                                variant="outlined"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FormControl sx={{ minWidth: 220 }}>
                                <InputLabel>Trier par</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Trier par"
                                    // LA SOLUTION SÛRE : On dit à TypeScript que la valeur est une 'string'
                                    onChange={(e) => setSortBy(e.target.value as string)}
                                >
                                    <MenuItem value="creation-desc">Les plus récents d'abord</MenuItem>
                                    <MenuItem value="creation-asc">Les plus anciens d'abord</MenuItem>
                                    <MenuItem value="deadline-asc">Échéance la plus proche</MenuItem>
                                    <MenuItem value="name-asc">Ordre alphabétique (A-Z)</MenuItem>
                                    <MenuItem value="name-desc">Ordre alphabétique (Z-A)</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    )}

                    {displayedProjects.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <AddCircleOutlineIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                {searchTerm ? 'Aucun projet ne correspond à votre recherche' : 'Vous n\'avez pas encore de projet'}
                            </Typography>
                            <Typography color="text.secondary">
                                {searchTerm ? 'Essayez avec un autre mot-clé.' : 'Cliquez sur le bouton ci-dessous pour commencer.'}
                            </Typography>
                        </Box>
                    ) : (
                        <Box className="projects-list">
                            {displayedProjects.map((project) => (
                                <RouterLink to={`/project/${project._id}`} key={project._id} className="project-card-link">
                                    <Card className="project-card">
                                        <IconButton
                                            aria-label="supprimer projet"
                                            size="small"
                                            onClick={(e) => openDeleteConfirm(e, project)}
                                            className="delete-button" color="error"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                        <CardContent>
                                            <Typography className="project-name">{project.name}</Typography>
                                        </CardContent>
                                        <CardActions className="card-actions">
                                            <Typography variant="caption">URL de partage :</Typography>
                                            <Button size="small" startIcon={<ContentCopyIcon />} onClick={(e) => handleCopyClick(e, project)}>
                                                Copier
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </RouterLink>
                            ))}
                        </Box>
                    )}
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 4 }}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Créer un nouveau projet
                    </Button>
                </Box>
            )}

            <CreateProjectModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />

            <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer le projet "{projectToDelete?.name}" ? Cette action est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteConfirmOpen(false)}>Annuler</Button>
                    <Button onClick={handleDeleteProject} color="error" autoFocus>Supprimer</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardLayout>
    );
};

export default DashboardPage;