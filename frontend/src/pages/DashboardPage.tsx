// /frontend/src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardActions, Button, CircularProgress } from '@mui/material';
import DashboardLayout from '../components/DashboardLayout.tsx';
import { projectService } from '../services/projectService.ts';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// On importe le composant Modal que nous avons créé
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

    // Nouvel état pour gérer l'ouverture et la fermeture du modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Cet effet se lance une seule fois au chargement de la page pour récupérer les projets
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

    // Fonction pour construire l'URL de partage
    const getShareableUrl = (project: IProject) => {
        return `${window.location.origin}/join/${project._id}/${project.accessKey}`;
    };

    // Fonction appelée par le Modal quand un projet est créé avec succès
    // Elle ajoute le nouveau projet à la liste sans recharger la page
    const handleProjectCreated = (newProject: IProject) => {
        setProjects(prevProjects => [newProject, ...prevProjects]);
    };

    return (
        <DashboardLayout title="Projets">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    {/* (Ici on ajoutera plus tard la barre de recherche et le filtre) */}

                    {/* Liste des projets */}
                    <Box sx={{ backgroundColor: '#b7e4c7', p: 1, borderRadius: 4 }}>
                        {projects.length === 0 ? (
                            <Typography sx={{ textAlign: 'center', p: 2 }}>Aucun projet pour le moment.</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {projects.map((project) => (
                                    <Card key={project._id} sx={{ borderRadius: 2 }}>
                                        <CardContent>
                                            <Typography sx={{ fontWeight: '600' }}>{project.name}</Typography>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', px: 1.5, py: 1 }}>
                                            <Typography variant="caption">URL de partage :</Typography>
                                            <Button
                                                size="small"
                                                startIcon={<ContentCopyIcon />}
                                                onClick={() => navigator.clipboard.writeText(getShareableUrl(project))}
                                            >
                                                Copier
                                            </Button>
                                        </CardActions>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Le bouton "Créer un nouveau projet" qui ouvre le modal */}
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, py: 1.5, fontSize: '1rem', backgroundColor: 'primary.main' }}
                        onClick={() => setIsModalOpen(true)} // Action pour ouvrir le modal
                    >
                        Créer un nouveau projet
                    </Button>
                </Box>
            )}

            {/* Le composant Modal, qui n'est visible que si 'isModalOpen' est true */}
            <CreateProjectModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)} // Action pour fermer le modal
                onProjectCreated={handleProjectCreated} // Action à exécuter après la création
            />
        </DashboardLayout>
    );
};

export default DashboardPage;