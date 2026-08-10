// /frontend/src/services/userService.ts
import axios from 'axios';

// On importe notre interface partagée pour typer les données
import type { IUser } from '@shared/types';

// --- CONFIGURATION DYNAMIQUE ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_URL = `${API_BASE_URL}/users`;

// Fonction utilitaire pour récupérer le token JWT depuis le localStorage
const getToken = () => localStorage.getItem('user_token');

/**
 * Récupère le profil de l'utilisateur actuellement connecté.
 * @returns Une promesse qui se résout avec l'objet utilisateur.
 */
const getProfile = async (): Promise<IUser> => {
    const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
    };
    const response = await axios.get(`${API_URL}/profile`, config);
    return response.data;
};

/**
 * Met à jour le profil de l'utilisateur connecté.
 * @param profileData - Un objet contenant les champs de l'utilisateur à mettre à jour.
 * @returns Une promesse qui se résout avec l'objet utilisateur mis à jour.
 */
// On utilise Partial<IUser> pour indiquer qu'on peut envoyer
// seulement une partie des champs de l'utilisateur (ex: juste le nom, ou juste le token).
const updateProfile = async (profileData: Partial<IUser>): Promise<IUser> => {
    const config = {
        headers: { Authorization: `Bearer ${getToken()}` }
    };
    const response = await axios.put(`${API_URL}/profile`, profileData, config);
    return response.data;
};

// On exporte un objet contenant toutes les fonctions du service
export const userService = {
    getProfile,
    updateProfile,
};