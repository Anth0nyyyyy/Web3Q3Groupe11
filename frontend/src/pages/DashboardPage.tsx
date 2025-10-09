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
                <Box className="dashboard-loading">
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    <Box className="projects-container">
                        {projects.length === 0 ? (
                            <Typography className="no-projects-message">Aucun projet pour le moment.</Typography>
                        ) : (
                            <Box className="projects-list">
                                {projects.map((project) => (
                                    <RouterLink to={`/project/${project._id}`} key={project._id} className="project-card-link">
                                        <Card className="project-card">
                                            <IconButton
                                                aria-label="supprimer projet"
                                                size="small"
                                                onClick={(e) => handleDeleteProject(e, project._id)}
                                                className="delete-button"
                                                color="error"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                            <CardContent>
                                                <Typography className="project-name">{project.name}</Typography>
                                            </CardContent>
                                            <CardActions className="card-actions">
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
                        color="primary"
                        className="create-project-button"
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