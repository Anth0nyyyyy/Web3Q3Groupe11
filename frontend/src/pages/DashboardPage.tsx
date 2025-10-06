// /frontend/src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActions, Button, CircularProgress, IconButton } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout.tsx';
import { projectService } from '../services/projectService.ts';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete'; // Import de l'icône de suppression
import CreateProjectModal from '../components/CreateProjectModal.tsx';

// On importe le type IProject depuis notre fichier centralisé
import type { IProject } from '../types/index.ts';

const DashboardPage = () => {
    const [projects, setProjects] = useState<IProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const getShareableUrl = (project: IProject) => {
        return `${window.location.origin}/join/${project._id}/${project.accessKey}`;
    };

    const handleProjectCreated = (newProject: IProject) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
    };

    const handleCopyClick = (e: React.MouseEvent, project: IProject) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(getShareableUrl(project));
        // Idéalement, on ajouterait une notification "Toast" ici
    };

    // Nouvelle fonction pour gérer la suppression d'un projet
    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
            try {
                await projectService.deleteProject(projectId);
                // On met à jour l'état du frontend pour retirer la carte sans recharger
                setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId));
            } catch (error) {
                console.error("Erreur lors de la suppression du projet", error);
                alert("Une erreur est survenue lors de la suppression.");
            }
        }
    };

    return (
        <DashboardLayout title="Projets">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    <Box sx={{ backgroundColor: '#b7e4c7', p: 1, borderRadius: 4 }}>
                        {projects.length === 0 ? (
                            <Typography sx={{ textAlign: 'center', p: 2 }}>Aucun projet pour le moment.</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {projects.map((project) => (
                                    <RouterLink to={`/project/${project._id}`} key={project._id} style={{ textDecoration: 'none' }}>
                                        <Card sx={{ borderRadius: 2, '&:hover': { boxShadow: 3, cursor: 'pointer' }, position: 'relative' }}>

                                            {/* Bouton de suppression ajouté */}
                                            <IconButton
                                                aria-label="supprimer projet"
                                                size="small"
                                                onClick={(e) => handleDeleteProject(e, project._id)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    color: 'error.main',
                                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                                    }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>

                                            <CardContent>
                                                <Typography sx={{ fontWeight: '600', color: 'text.primary', pr: '30px' }}>{project.name}</Typography>
                                            </CardContent>
                                            <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid #e0e000' }}>
                                                <Typography variant="caption">URL de partage :</Typography>
                                                <Button
                                                    size="small"
                                                    startIcon={<ContentCopyIcon />}
                                                    onClick={(e) => handleCopyClick(e, project)}
                                                >
                                                    Copier
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </RouterLink>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, py: 1.5, fontSize: '1rem', backgroundColor: 'primary.main' }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Créer un nouveau projet
                    </Button>
                </Box>
            )}

            <CreateProjectModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
        </DashboardLayout>
    );
};

export default DashboardPage;