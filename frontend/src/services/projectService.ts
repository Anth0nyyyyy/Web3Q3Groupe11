// /frontend/src/services/projectService.ts
import axios from 'axios';

// --- INTERFACES & CONFIGURATION ---

const API_PROJECTS_URL = 'http://localhost:4000/api/projects';
const API_GROUPS_URL = 'http://localhost:4000/api/groups';

// Interface pour les données de création d'un projet
interface ProjectData {
    name: string;
    githubOrg: string;
    minMembers: number;
    maxMembers: number;
    repoPattern?: string;
}

// Fonction utilitaire pour récupérer le token
const getToken = () => localStorage.getItem('user_token');

// --- FONCTIONS DU SERVICE ---

/**
 * Récupère tous les projets appartenant au professeur connecté.
 */
const getMyProjects = async () => {
    const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
    };
    const response = await axios.get(API_PROJECTS_URL, config);
    return response.data;
};

/**
 * Crée un nouveau projet pour le professeur connecté.
 * @param projectData - Les données du projet à créer.
 */
const createProject = async (projectData: ProjectData) => {
    const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
    };
    const response = await axios.post(API_PROJECTS_URL, projectData, config);
    return response.data;
};

/**
 * Crée un groupe, une équipe et un dépôt GitHub pour un projet donné.
 * C'est la fonction appelée par la page étudiante.
 * @param projectId - L'ID du projet.
 * @param accessKey - La clé secrète du projet.
 * @param githubUsernames - La liste des pseudos GitHub des étudiants.
 */
const createGroupForProject = async (projectId: string, accessKey: string, githubUsernames: string[]) => {
    const url = `${API_GROUPS_URL}/create/${projectId}/${accessKey}`;
    const response = await axios.post(url, { githubUsernames });
    return response.data;
};

// --- EXPORT ---

export const projectService = {
    getMyProjects,
    createProject,
    // CORRECTION : On ajoute la fonction manquante à l'objet exporté
    createGroupForProject,
};