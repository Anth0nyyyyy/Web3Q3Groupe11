// /frontend/src/services/projectService.ts
import axios from 'axios';

// CORRECTION : On importe le type 'TeamMember' dont on a besoin
import type { TeamMember } from '../types/index.ts';

// --- INTERFACES & CONFIGURATION ---

const API_PROJECTS_URL = 'http://localhost:4000/api/projects';
const API_GROUPS_URL = 'http://localhost:4000/api/groups';

interface ProjectData {
    name: string;
    githubOrg: string;
    minMembers: number;
    maxMembers: number;
    repoPattern?: string;
}

const getToken = () => localStorage.getItem('user_token');

// --- FONCTIONS DU SERVICE ---

/**
 * Récupère tous les projets appartenant au professeur connecté.
 */
const getMyProjects = async () => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.get(API_PROJECTS_URL, config);
    return response.data;
};

/**
 * Crée un nouveau projet pour le professeur connecté.
 * @param projectData - Les données du projet à créer.
 */
const createProject = async (projectData: ProjectData) => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.post(API_PROJECTS_URL, projectData, config);
    return response.data;
};

/**
 * Crée un groupe, une équipe et un dépôt GitHub pour un projet donné.
 * @param projectId - L'ID du projet.
 * @param accessKey - La clé secrète du projet.
 * @param members - La liste des membres de l'équipe. // CORRECTION : Paramètre mis à jour
 */
const createGroupForProject = async (projectId: string, accessKey: string, members: TeamMember[]) => {
    const url = `${API_GROUPS_URL}/create/${projectId}/${accessKey}`;
    const response = await axios.post(url, { members }); // On envoie bien un objet { members: [...] }
    return response.data;
};

const getProjectById = async (projectId: string) => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.get(`${API_PROJECTS_URL}/${projectId}`, config);
    return response.data;
};

// --- EXPORT ---
export const projectService = {
    getMyProjects,
    createProject,
    createGroupForProject,
    getProjectById, // <-- Corrigé
};