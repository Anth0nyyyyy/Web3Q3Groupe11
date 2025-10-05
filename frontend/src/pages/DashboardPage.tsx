// /frontend/src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Import du composant de lien
import { Box, Typography, Card, CardContent, CardActions, Button, CircularProgress } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout.tsx';
import { projectService } from '../services/projectService.ts';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CreateProjectModal from '../components/CreateProjectModal.tsx';

// On définit le type de nos projets pour TypeScript
interface IProject {
    _id: string;
    name: string;
    accessKey: string;
}

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

    // Fonction pour gérer le clic sur le bouton "Copier" sans propager le clic au lien parent
    const handleCopyClick = (e: React.MouseEvent, project: IProject) => {
        e.preventDefault(); // Empêche la navigation
        e.stopPropagation(); // Arrête la propagation de l'événement
        navigator.clipboard.writeText(getShareableUrl(project));
        // Idéalement, on ajouterait une notification "Toast" ici pour confirmer la copie
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
                                    // CORRECTION : On enveloppe la Card dans un RouterLink pour la rendre cliquable
                                    <RouterLink to={`/project/${project._id}`} key={project._id} style={{ textDecoration: 'none' }}>
                                        <Card sx={{ borderRadius: 2, '&:hover': { boxShadow: 3, cursor: 'pointer' } }}>
                                            <CardContent>
                                                <Typography sx={{ fontWeight: '600', color: 'text.primary' }}>{project.name}</Typography>
                                            </CardContent>
                                            <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', px: 1.5, py: 1 }}>
                                                <Typography variant="caption">URL de partage :</Typography>
                                                <Button
                                                    size="small"
                                                    startIcon={<ContentCopyIcon />}
                                                    // On utilise notre nouvelle fonction pour éviter la redirection
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