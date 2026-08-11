// /backend/src/controllers/user.controller.ts
import type { Request, Response } from 'express';
import User from '../models/User.model.js';
import type { IUser } from '@shared/types/index.ts';

/**
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @route   GET /api/users/profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non authentifié." });
        }
        // On récupère l'utilisateur via l'ID stocké dans req.user par le middleware 'protect'
        const user = await User.findById(req.user.id).select('-password -githubToken');

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
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @route   PUT /api/users/profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non authentifié." });
        }

        // On doit sélectionner le mot de passe pour pouvoir potentiellement le modifier
        const user = await User.findById(req.user.id).select('+password');

        if (user) {
            // On met à jour les champs s'ils sont fournis dans la requête
            user.email = req.body.email || user.email;
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;

            // On ne met à jour le token que s'il est explicitement fourni
            if (req.body.githubToken) {
                user.githubToken = req.body.githubToken;
            }

            // Si un nouveau mot de passe est fourni, on le met à jour.
            // Le middleware 'pre-save' s'occupera automatiquement du hachage.
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // On renvoie un objet "propre" au frontend, sans les données sensibles
            res.json({
                _id: updatedUser._id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
            });
        } else {
            res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }
    } catch (error) {
        console.error("Erreur de mise à jour du profil:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
    }
};