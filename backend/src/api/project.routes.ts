// /backend/src/api/project.routes.ts
import { Router } from 'express';
import { createProject, getMyProjects, getProjectById, updateProject, deleteProject} from '../controllers/project.controller.js';import { protect } from '../middlewares/auth.middleware.js'; // On importe notre gardien
import { validate } from '../middlewares/validate.middleware.js';
import multer from 'multer';
import { createProjectSchema } from '../schemas/project.schema.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// On applique le middleware 'protect' à toutes les routes de ce fichier
// Seul un utilisateur connecté pourra y accéder
router.use(protect);

router.route('/')
    .post(upload.single('instructionsFile'), createProject)
    .get(getMyProjects);

router.route('/:id')
    .get(getProjectById)
    .put(updateProject)
    .delete(deleteProject);

export default router;