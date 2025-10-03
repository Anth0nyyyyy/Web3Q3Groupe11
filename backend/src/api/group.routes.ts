// /backend/src/api/group.routes.ts
import { Router } from 'express';
import { createGroup } from '../controllers/group.controller.js';

const router = Router();

// C'est la route "magique" publique
router.post('/create/:projectId/:accessKey', createGroup);

export default router;