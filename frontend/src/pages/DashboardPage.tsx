import { Box, Typography, TextField, InputAdornment, Button, Card, CardContent, CardActions, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardLayout from '../components/DashboardLayout.tsx'; // On importe notre nouveau Layout

const projects = [
    { name: 'Projet Web 2 Groupe 1', members: 4, updated: 'il y a 5 min', status: 'active' },
    { name: 'Projet Web 3 Groupe 2', members: 3, updated: 'il y a 2 h', status: 'active' },
    { name: 'Web2 Groupe 4', members: 5, updated: 'il y a 1 jour', status: 'error' },
];

const DashboardPage = () => {
    return (
        // On enveloppe notre contenu avec le Layout
        <DashboardLayout title="Projets">

            {/* Search & Filter */}
            <TextField
                fullWidth
                placeholder="Rechercher un projet..."
                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: 'background.paper' } }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
            <Button variant="outlined" endIcon={<KeyboardArrowDownIcon />} sx={{ mb: 3, borderColor: '#e0e0e0', color: 'text.secondary', backgroundColor: 'background.paper' }}>
                Filtrer
            </Button>

            {/* Project List */}
            {/* Style de fond spécifique pour la liste */}
            <Box sx={{ backgroundColor: '#b7e4c7', p: 1, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {projects.map((project, index) => (
                        <Card key={index} sx={{ borderRadius: 2, transition: '0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5 }}>
                                <Avatar variant="rounded" src={`https://source.unsplash.com/random/100x100?sig=${index}`} sx={{ width: 48, height: 48 }} />
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: project.status === 'active' ? 'info.main' : 'error.main' }} />
                                        <Typography noWrap sx={{ fontWeight: '600' }}>{project.name}</Typography>
                                    </Box>
                                </Box>
                                <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', px: 1.5, py: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">{project.updated}</Typography>
                                <Typography variant="caption" color="text.secondary">{project.members} Membres</Typography>
                            </CardActions>
                        </Card>
                    ))}
                </Box>
                <Button fullWidth sx={{ mt: 1, color: 'primary.main', fontWeight: 'bold' }}>Voir plus</Button>
            </Box>

            {/* Create Project Button */}
            <Button fullWidth variant="contained" sx={{ mt: 3, py: 1.5, fontSize: '1rem', backgroundColor: 'primary.main' }}>
                Créer un nouveau projet
            </Button>

        </DashboardLayout>
    );
};

export default DashboardPage;