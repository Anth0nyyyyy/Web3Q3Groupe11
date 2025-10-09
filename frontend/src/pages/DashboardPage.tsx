// /frontend/src/pages/DashboardPage.tsx

import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, CardActions, Button, CircularProgress, IconButton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string }>({ open: false, message: ''
    });

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

    const getShareableUrl = (project: IProject) => `${window.location.origin}/join/${project._id}/${project.accessKey}`;

    const handleProjectCreated = (newProject: IProject) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
    };

    const handleCopyClick = (e: React.MouseEvent, project: IProject) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(getShareableUrl(project));
        setSnackbar({ open: true, message: 'Lien du projet copié !' });
    };

    // NOUVELLE FONCTION pour ouvrir la modale
    const openDeleteConfirm = (e: React.MouseEvent, project: IProject) => {
        e.preventDefault();
        e.stopPropagation();
        setProjectToDelete(project);
        setIsDeleteConfirmOpen(true);
    };

    // FONCTION MODIFIÉE pour supprimer après confirmation
    const handleDeleteProject = async () => {
        if (!projectToDelete) return;

        try {
            await projectService.deleteProject(projectToDelete._id);
            setProjects(prevProjects => prevProjects.filter(p => p._id !== projectToDelete._id));
            setSnackbar({ open: true, message: 'Projet supprimé avec succès !' });
        } catch (error) {
            console.error("Erreur lors de la suppression du projet", error);
            alert("Une erreur est survenue lors de la suppression.");
        } finally {
            setIsDeleteConfirmOpen(false);
            setProjectToDelete(null);
        }
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    return (
        <DashboardLayout title="Projets">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : (
                <Box>
                    <Box className="projects-container">
                        {projects.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <AddCircleOutlineIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Vous n'avez pas encore de projet
                                </Typography>
                                <Typography color="text.secondary">
                                    Cliquez sur le bouton ci-dessous pour en créer un.
                                </Typography>
                            </Box>
                            ) : (
                            <Box className="projects-list">
                                {projects.map((project) => (
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
                                                <Button size="small" startIcon={<ContentCopyIcon />} onClick={(e) => handleCopyClick(e, project)}>Copier</Button>
                                            </CardActions>
                                        </Card>
                                    </RouterLink>
                                ))}
                            </Box>
                        )}
                    </Box>
                    <Button fullWidth variant="contained" color="primary" className="create-project-button" onClick={() => setIsModalOpen(true)}>
                        Créer un nouveau projet
                    </Button>
                </Box>
            )}

            <CreateProjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onProjectCreated={handleProjectCreated}/>

            {}
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
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </DashboardLayout>
    );
};

export default DashboardPage;