// /frontend/src/services/projectService.ts
import axios from 'axios';
import type { IProject, TeamMember } from '../types/index.ts';

// --- CONFIGURATION ---

const API_PROJECTS_URL = 'http://localhost:4000/api/projects';
const API_GROUPS_URL = 'http://localhost:4000/api/groups';

// Fonction utilitaire pour récupérer le token
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
 * Accepte FormData pour permettre l'upload de fichier.
 * @param formData - Les données du projet, y compris le fichier optionnel.
 */
const createProject = async (formData: FormData) => {
    const config = {
        headers: {
            Authorization: `Bearer ${getToken()}`,
            // L'en-tête 'Content-Type' est automatiquement défini par Axios
            // lorsqu'il détecte un objet FormData.
        }
    };
    const response = await axios.post(API_PROJECTS_URL, formData, config);
    return response.data;
};

/**
 * Crée un groupe, une équipe et un dépôt GitHub pour un projet donné.
 * @param projectId - L'ID du projet.
 * @param accessKey - La clé secrète du projet.
 * @param members - La liste des membres de l'équipe.
 */
const createGroupForProject = async (projectId: string, accessKey: string, members: TeamMember[]) => {
    const url = `${API_GROUPS_URL}/create/${projectId}/${accessKey}`;
    const response = await axios.post(url, { members });
    return response.data;
};

/**
 * Récupère un projet spécifique par son ID, avec ses groupes.
 */
const getProjectById = async (projectId: string) => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.get(`${API_PROJECTS_URL}/${projectId}`, config);
    return response.data;
};

/**
 * Met à jour un projet existant.
 */
const updateProject = async (projectId: string, projectData: Partial<IProject>) => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.put(`${API_PROJECTS_URL}/${projectId}`, projectData, config);
    return response.data;
};

/**
 * Supprime un projet.
 */
const deleteProject = async (projectId: string) => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.delete(`${API_PROJECTS_URL}/${projectId}`, config);
    return response.data;
};
const getPublicProjectDetails = async (projectId: string, accessKey: string) => {
    const url = `${API_GROUPS_URL}/details/${projectId}/${accessKey}`;
    const response = await axios.get(url);
    return response.data;
};


// --- EXPORT ---
export const projectService = {
    getMyProjects,
    createProject,
    createGroupForProject,
    getProjectById,
    updateProject,
    deleteProject,
    getPublicProjectDetails,
};