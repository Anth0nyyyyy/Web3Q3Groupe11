// /backend/src/api/auth.routes.ts

import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js'; // Notez le .js

// On crée une nouvelle instance de Router
const router = Router();

// On définit les routes spécifiques à l'authentification

// Route pour l'inscription d'un nouvel utilisateur
// Quand une requête POST arrive sur /api/auth/register, on exécute la fonction 'register' du contrôleur
router.post('/register', register);

// Route pour la connexion d'un utilisateur existant
// Quand une requête POST arrive sur /api/auth/login, on exécute la fonction 'login' du contrôleur
router.post('/login', login);

// On exporte le routeur pour pouvoir l'utiliser dans notre serveur principal
export default router;