// /backend/src/api/project.routes.ts
import { Router } from 'express';
import { createProject, getMyProjects } from '../controllers/project.controller.js';
import { protect } from '../middlewares/auth.middlewares.js'; // On importe notre gardien

const router = Router();

// On applique le middleware 'protect' à toutes les routes de ce fichier
// Seul un utilisateur connecté pourra y accéder
router.use(protect);

router.route('/')
    .post(createProject)
    .get(getMyProjects);

export default router;