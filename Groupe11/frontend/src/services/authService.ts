// /frontend/src/services/authService.ts
import axios from 'axios';

// On définit l'URL de base de notre API backend.
// En développement, elle tourne sur le port 4000.
const API_URL = 'http://localhost:4000/api/auth';

// Fonction pour la connexion
const login = async (email: string, password: string) => {
    // On envoie une requête POST à l'endpoint /login
    const response = await axios.post(API_URL + '/login', {
        email,
        password,
    });

    // Si la requête réussit, l'API nous renvoie un token.
    // On le stocke dans le localStorage du navigateur pour s'en souvenir.
    if (response.data.token) {
        localStorage.setItem('user_token', response.data.token);
    }

    // On retourne les données de la réponse pour que le composant puisse réagir.
    return response.data;
};

// On exporte notre fonction pour pouvoir l'utiliser ailleurs
export const authService = {
    login,
};