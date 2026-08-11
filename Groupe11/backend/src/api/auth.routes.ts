// /backend/src/api/auth.routes.ts

import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js'; // Notez le .js
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

// On crée une nouvelle instance de Router
const router = Router();

// On définit les routes spécifiques à l'authentification

// Route pour l'inscription d'un nouvel utilisateur
// Quand une requête POST arrive sur /api/auth/register, on exécute la fonction 'register' du contrôleur
router.post('/register', validate(registerSchema), register);

// Route pour la connexion d'un utilisateur existant
// Quand une requête POST arrive sur /api/auth/login, on exécute la fonction 'login' du contrôleur
router.post('/login', validate(loginSchema), login);

// On exporte le routeur pour pouvoir l'utiliser dans notre serveur principal
export default router;