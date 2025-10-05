// /frontend/src/pages/ProjectDetailsPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Button, IconButton, CircularProgress, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DashboardLayout from '../components/DashboardLayout.tsx';
import { projectService } from '../services/projectService.ts';
import type { IProject, IGroup, TeamMember } from '../types/index.ts';

import './ProjectDetailsPage.scss'; // On importe notre fichier de style

interface ProjectDetailsData {
    project: IProject;
    groups: IGroup[];
}

const ProjectDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<ProjectDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            projectService.getProjectById(id)
                .then(setData)
                .catch(err => {
                    console.error(err);
                    setError("Impossible de charger les détails du projet.");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const getShareableUrl = () => {
        if (!data) return '';
        return `${window.location.origin}/join/${data.project._id}/${data.project.accessKey}`;
    };

    if (loading) {
        return <DashboardLayout title="Détails du projet"><Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box></DashboardLayout>;
    }
    if (error || !data) {
        return <DashboardLayout title="Détails du projet"><Alert severity="error">{error || "Projet non trouvé."}</Alert></DashboardLayout>;
    }

    const { project, groups } = data;

    return (
        <DashboardLayout title="Détails du projet">
            <Box className="project-details-page">
                <Paper className="info-card">
                    <Box className="info-header">
                        <Typography variant="h6" className="info-title">Informations</Typography>
                        <IconButton size="small" sx={{ color: 'primary.main' }}><EditIcon /></IconButton>
                    </Box>
                    <Grid container spacing={2} className="info-grid">
                        <Grid item xs={6} className="info-item"><Typography variant="body2" className="info-label">Nom du projet</Typography><Typography>{project.name}</Typography></Grid>
                        <Grid item xs={6} className="info-item"><Typography variant="body2" className="info-label">Date de fin</Typography><Box className="info-value-container"><EventBusyIcon color="error" /><Typography>15/08/2025</Typography></Box></Grid>
                        <Grid item xs={6} className="info-item"><Typography variant="body2" className="info-label">Organisation GitHub</Typography><Typography>{project.githubOrg}</Typography></Grid>
                        <Grid item xs={6} className="info-item"><Typography variant="body2" className="info-label">Étudiants max / groupe</Typography><Typography>{project.maxMembers}</Typography></Grid>
                        <Grid item xs={12} className="info-item"><Typography variant="body2" className="info-label">Pattern nom de groupe</Typography><Typography>{project.repoPattern}</Typography></Grid>
                        <Grid item xs={12} className="info-item share-url-container">
                            <Typography variant="body2" className="info-label">URL du projet</Typography>
                            <Box className="share-url-box">
                                <Typography className="share-url-text">{getShareableUrl()}</Typography>
                                <Button size="small" variant="contained" startIcon={<ContentCopyIcon />} onClick={() => navigator.clipboard.writeText(getShareableUrl())} className="copy-button">
                                    Copier
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {groups.map(group => (
                    <Paper key={group._id} className="group-card">
                        <Box className="group-header">
                            <Box className="group-title-box">
                                <Typography variant="h6" fontWeight="bold">Membres du groupe {group.name.split('-').pop()}</Typography>
                                <Typography variant="body2" color="text.secondary">{group.members.length}/{project.maxMembers}</Typography>
                            </Box>
                            <IconButton size="small" sx={{ color: 'primary.main' }}><EditIcon /></IconButton>
                        </Box>
                        <Box className="members-list">
                            {group.members.map((member: TeamMember) => (
                                <Typography key={member.matricule}>
                                    {member.firstName} {member.lastName}
                                    <Typography component="span" variant="caption" className="member-pseudo">({member.githubUsername})</Typography>
                                </Typography>
                            ))}
                        </Box>
                    </Paper>
                ))}
            </Box>
        </DashboardLayout>
    );
};

export default ProjectDetailsPage;