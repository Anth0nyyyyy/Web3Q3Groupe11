// /backend/src/controllers/auth.controller.ts
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import type { IUser } from '@shared/types/index.ts';

/**
 * @desc    Inscrire un nouvel utilisateur (professeur)
 * @route   POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
    try {
        // La validation a été faite en amont par le middleware Zod.
        // On peut utiliser les données du body en toute confiance.
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
        }

        // Créer le nouvel utilisateur
        const newUser = new User({ email, password });
        await newUser.save();

        res.status(201).json({
            message: 'Utilisateur créé avec succès.',
            user: {
                id: newUser._id,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur du serveur lors de la création de l\'utilisateur.' });
    }
};


/**
 * @desc    Connecter un utilisateur
 * @route   POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
    try {
        // La validation a été faite en amont par le middleware Zod.
        const { email, password } = req.body;

        // Chercher l'utilisateur et inclure son mot de passe pour la comparaison
        const user: (IUser & { password?: string }) | null = await User.findOne({ email }).select('+password');
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        // Comparer le mot de passe fourni avec celui haché en base de données
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides.' });
        }

        // Si tout est correct, créer un JSON Web Token (JWT)
        const payload = { id: user._id };
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // Cette erreur est pour le développeur, pas l'utilisateur
            throw new Error('La clé secrète JWT n\'est pas configurée dans les variables d\'environnement.');
        }

        const token = jwt.sign(payload, secret, { expiresIn: '1d' });

        // Envoyer le token et les informations de l'utilisateur au client
        res.status(200).json({
            message: 'Connexion réussie.',
            token,
            user: {
                id: user._id,
                email: user.email,
            },
        });
    } catch (error) {
        // On log l'erreur côté serveur pour le débogage, mais on n'envoie pas les détails à l'utilisateur
        console.error("Erreur de connexion:", error);
        res.status(500).json({ message: 'Erreur du serveur lors de la connexion.' });
    }
};