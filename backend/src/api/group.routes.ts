// /backend/src/api/group.routes.ts
import { Router } from 'express';
import { createGroup, getPublicProjectDetails } from '../controllers/group.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createGroupSchema } from '../schemas/group.schema.js';


const router = Router();


console.log("INFO: Le routeur de groupe est chargé.");
// C'est la route "magique" publique
router.get('/details/:projectId/:accessKey', getPublicProjectDetails);
router.post('/create/:projectId/:accessKey', validate(createGroupSchema), createGroup);
export default router;