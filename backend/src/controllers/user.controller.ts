// /backend/src/controllers/user.controller.ts
import type { Request, Response } from 'express';
import User from '../models/User.model.js';

/**
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @route   GET /api/users/profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        // On récupère l'utilisateur via l'ID stocké dans req.user par le middleware 'protect'
        const user = await User.findById(req.user?.id).select('-password'); // Exclure le mot de passe

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * @desc    Mettre à jour le token GitHub de l'utilisateur connecté
 * @route   PUT /api/users/profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?.id);

        if (user) {
            user.githubToken = req.body.githubToken || user.githubToken;
            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                email: updatedUser.email,
                // On ne renvoie PAS le token, juste une confirmation
            });
        } else {
            res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};