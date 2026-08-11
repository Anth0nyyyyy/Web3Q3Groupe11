// /backend/src/api/github.routes.ts
import { Router } from 'express';
import { getGithubOrgs } from '../controllers/github.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// On protège la route : seul un utilisateur connecté peut voir ses orgas
router.get('/orgs', protect, getGithubOrgs);

export default router;