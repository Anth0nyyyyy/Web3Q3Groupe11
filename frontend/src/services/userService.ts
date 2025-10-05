// /frontend/src/services/userService.ts
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/users';

const getToken = () => localStorage.getItem('user_token');

/**
 * Récupère le profil de l'utilisateur actuellement connecté.
 */
const getProfile = async () => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.get(`${API_URL}/profile`, config);
    return response.data;
};

/**
 * Met à jour le profil de l'utilisateur (pour l'instant, juste le token).
 * @param profileData - Les données à mettre à jour.
 */
const updateProfile = async (profileData: { githubToken: string }) => {
    const config = { headers: { Authorization: `Bearer ${getToken()}` } };
    const response = await axios.put(`${API_URL}/profile`, profileData, config);
    return response.data;
};

export const userService = {
    getProfile,
    updateProfile,
};