// /backend/src/api/user.routes.ts
import { Router } from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// On protège toutes les routes de ce fichier
router.use(protect);

router.route('/profile')
    .get(getUserProfile)
    .put(updateUserProfile);

export default router;