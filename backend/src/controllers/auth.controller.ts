// /backend/src/controllers/auth.controller.ts

import type { Request, Response } from 'express';import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js'; // Notez le .js à la fin pour ESM

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Valider les données d'entrée (simple vérification)
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
        }

        // 2. Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
        }

        // 3. Créer le nouvel utilisateur
        // Le hachage du mot de passe est géré automatiquement par le middleware pre-save de notre modèle
        const newUser = new User({ email, password });
        await newUser.save();

        // 4. Envoyer une réponse de succès (sans renvoyer le mot de passe)
        res.status(201).json({
            message: 'Utilisateur créé avec succès.',
            user: {
                id: newUser._id,
                email: newUser.email,
            },
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur du serveur lors de la création de l\'utilisateur.', error });
    }
};


// @desc    Connecter un utilisateur
// @route   POST /api/auth/login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Valider les données d'entrée
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
        }

        // 2. Chercher l'utilisateur dans la base de données
        // On doit explicitement demander le mot de passe car on a mis `select: false` dans le modèle
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Identifiants invalides.' }); // Message volontairement vague
        }

        // 3. Comparer le mot de passe fourni avec celui haché en base de données
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides.' }); // Même message vague pour la sécurité
        }

        // 4. Si tout est correct, créer un JSON Web Token (JWT)
        const payload = { id: user._id };
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('La clé secrète JWT n\'est pas définie dans les variables d\'environnement.');
        }

        const token = jwt.sign(payload, secret, { expiresIn: '1d' }); // Le token expirera dans 1 jour

        // 5. Envoyer le token au client
        res.status(200).json({
            message: 'Connexion réussie.',
            token,
            user: {
                id: user._id,
                email: user.email,
            },
        });

    } catch (error) {
        res.status(500).json({ message: 'Erreur du serveur lors de la connexion.', error });
    }
};