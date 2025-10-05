// /backend/src/api/project.routes.ts
import { Router } from 'express';
import { createProject, getMyProjects, getProjectById } from '../controllers/project.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; // On importe notre gardien
import { validate } from '../middlewares/validate.middleware.js';
import { createProjectSchema } from '../schemas/project.schema.js';

const router = Router();

// On applique le middleware 'protect' à toutes les routes de ce fichier
// Seul un utilisateur connecté pourra y accéder
router.use(protect);

router.route('/')
    .post(validate(createProjectSchema), createProject)
    .get(getMyProjects);

router.route('/:id')
    .get(getProjectById);

export default router;