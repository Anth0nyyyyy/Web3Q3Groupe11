// /frontend/src/pages/DashboardPage.tsx

import { useEffect, useState, useMemo } from 'react'; // On ajoute useMemo pour l'optimisation
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, CardActions, Button, CircularProgress, IconButton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Snackbar, Alert,
    TextField // <-- L'UNIQUE NOUVEL IMPORT
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

    // NOUVEAU : Un seul état pour la recherche
    const [searchTerm, setSearchTerm] = useState('');

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

    // NOUVEAU : Logique pour filtrer les projets
    // useMemo garantit que le filtrage ne s'exécute que si les projets ou la recherche changent.
    const displayedProjects = useMemo(() => {
        // Si la recherche est vide, on retourne tous les projets.
        if (!searchTerm) {
            return projects;
        }
        // Sinon, on filtre
        return projects.filter(project =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);


    // Les autres fonctions (handlers) restent exactement les mêmes.
    const getShareableUrl = (project: IProject) => `${window.location.origin}/join/${project._id}/${project.accessKey}`;
    const handleProjectCreated = (newProject: IProject) => setProjects(prevProjects => [newProject, ...prevProjects]);
    const openDeleteConfirm = (e: React.MouseEvent, project: IProject) => {
        e.preventDefault();
        e.stopPropagation();
        setProjectToDelete(project);
        setIsDeleteConfirmOpen(true);
    };
    const handleDeleteProject = async () => { /* ... (inchangé) ... */ };
    const handleCopyClick = (e: React.MouseEvent, project: IProject) => { /* ... (inchangé) ... */ };
    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    return (
        <DashboardLayout title="Projets">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : (
                <Box>
                    {/* NOUVEAU : La barre de recherche (s'affiche seulement s'il y a des projets) */}
                    {projects.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Rechercher un projet..."
                                variant="outlined"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Box>
                    )}

                    {/* MODIFICATION : On vérifie la longueur de `displayedProjects` */}
                    {displayedProjects.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <AddCircleOutlineIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                            {/* MODIFICATION : Le message s'adapte à la recherche */}
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                {searchTerm ? 'Aucun projet ne correspond à votre recherche' : 'Vous n\'avez pas encore de projet'}
                            </Typography>
                            <Typography color="text.secondary">
                                {searchTerm ? 'Essayez avec un autre mot-clé.' : 'Cliquez sur le bouton ci-dessous pour commencer.'}
                            </Typography>
                        </Box>
                    ) : (
                        <Box className="projects-list">
                            {/* MODIFICATION : On affiche les projets filtrés */}
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

            {/* Le reste (modales et snackbar) est inchangé et stable */}
            <CreateProjectModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onProjectCreated={handleProjectCreated} />
            <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
                {/* ... */}
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