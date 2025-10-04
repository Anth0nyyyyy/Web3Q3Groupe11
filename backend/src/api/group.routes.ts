// /backend/src/api/group.routes.ts
import { Router } from 'express';
import { createGroup } from '../controllers/group.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createGroupSchema } from '../schemas/group.schema.js';


const router = Router();

// C'est la route "magique" publique
router.post('/create/:projectId/:accessKey', validate(createGroupSchema), createGroup);
export default router;