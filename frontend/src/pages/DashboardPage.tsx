// /frontend/src/pages/DashboardPage.tsx

import { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, Button, CircularProgress, TextField, FormControl, Select, MenuItem,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, IconButton
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete'; // <-- CORRECTION : On importe l'icône
import DashboardLayout from '../components/DashboardLayout.tsx';
import { projectService } from '../services/projectService.ts';
import CreateProjectModal from '../components/CreateProjectModal.tsx';
import type { IProject } from '@shared/types/index.ts';

import '../styles/DashBoardPage.scss';

const getProjectThumbnail = (projectId: string) => {
    let hash = 0;
    for (let i = 0; i < projectId.length; i++) {
        hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const imageId = Math.abs(hash % 1000);
    return `https://picsum.photos/id/${imageId}/120/120`;
};

const DashboardPage = () => {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('creation-desc');

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string }>({ open: false, message: '' });

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
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    default:
                        return 0;
                }
            });
    }, [projects, searchTerm, sortBy]);

    const handleProjectCreated = (newProject: IProject) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
        setSnackbar({ open: true, message: 'Projet créé avec succès !' });
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

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <DashboardLayout title="">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress color="inherit" /></Box>
            ) : (
                <Box className="dashboard-container">
                    {/* On utilise un conteneur principal en colonne */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>

                        {/* Conteneur pour la barre de recherche */}
                        <TextField
                            fullWidth
                            label="RECHERCHER UN PROJET ..."
                            variant="standard"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Conteneur pour le bouton de tri, aligné à gauche */}
                        <Box>
                            <FormControl className="sort-button">
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as string)}
                                    variant="standard"
                                    disableUnderline
                                >
                                    <MenuItem value="creation-desc">Trier</MenuItem>
                                    <MenuItem value="creation-asc">Les plus anciens</MenuItem>
                                    <MenuItem value="deadline-asc">Échéance</MenuItem>
                                    <MenuItem value="name-asc">Nom (A-Z)</MenuItem>
                                    <MenuItem value="name-desc">Nom (Z-A)</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    <Box>
                        {displayedProjects.slice(0, 3).map((project) => (
                            <RouterLink to={`/project/${project._id}`} key={project._id} className="project-list-item">
                                {/* CORRECTION : On appelle bien getProjectThumbnail */}
                                <img
                                    src={getProjectThumbnail(project._id)}
                                    alt="thumbnail de projet aléatoire"
                                    className="project-thumbnail"
                                />
                                <Box className="project-info">
                                    <Typography className="project-name">{project.name}</Typography>
                                    {/* CORRECTION : L'accès à 'groups' est maintenant sûr */}
                                    <Typography className="group-count">{project.groups?.length || 0} Groupes</Typography>
                                </Box>

                                {/* CORRECTION : On ajoute le bouton supprimer */}
                                <IconButton
                                    edge="end"
                                    onClick={(e) => openDeleteConfirm(e, project)}
                                    sx={{ ml: 1, color: '#aaa', '&:hover': { color: '#d32f2f', backgroundColor: 'transparent' } }}
                                >
                                    <DeleteIcon />
                                </IconButton>

                                <ArrowForwardIosIcon className="arrow-icon" />
                            </RouterLink>
                        ))}
                    </Box>

                    {displayedProjects.length > 3 && (
                        <Button className="see-more-button">Voir plus ....</Button>
                    )}
                    <Button
                        fullWidth
                        variant="contained"
                        className="create-project-button" // On peut lui donner une classe pour le styler
                        sx={{ mt: 4, py: 1.5, fontSize: '1.1rem', borderRadius: '50px' }} // On peut aussi le styler ici
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Créer un nouveau projet
                    </Button>
                </Box>
            )}

            {/* Le reste est correct */}
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