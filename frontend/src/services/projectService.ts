// /frontend/src/services/projectService.ts
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/projects';

// Fonction pour récupérer le token depuis le localStorage
const getToken = () => localStorage.getItem('user_token');

// Obtenir les projets du professeur
const getMyProjects = async () => {
    const config = {
        headers: {
            Authorization: `Bearer ${getToken()}` // On envoie le token pour prouver notre identité
        }
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

interface ProjectData {
    name: string;
    githubOrg: string;
    minMembers: number;
    maxMembers: number;
    repoPattern?: string; // Le '?' le rend optionnel
}

const createProject = async (projectData: ProjectData) => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.post(API_URL, projectData, config);
    return response.data;
};

export const projectService = {
    getMyProjects,
    createProject,
};