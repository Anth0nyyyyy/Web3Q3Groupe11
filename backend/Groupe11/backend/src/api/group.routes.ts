// /backend/src/api/group.routes.ts
import { Router } from 'express';
import { createGroup, getPublicProjectDetails } from '../controllers/group.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createGroupSchema } from '../schemas/group.schema.js';

const router = Router();

console.log("INFO: Le routeur de groupe est chargé.");

// Route publique pour afficher les informations de départ de l'étudiant
router.get('/details/:projectId/:accessKey', getPublicProjectDetails);

// NOUVEAU : Route officielle demandée sur le tableau blanc du professeur !
router.post('/createGroup/:projectId/:accessKey', validate(createGroupSchema), createGroup);

export default router;