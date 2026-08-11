// /backend/src/controllers/github.controller.ts
import type { Request, Response } from 'express';
import { Octokit } from 'octokit';
import User from '../models/User.model.js';

/**
 * @desc    Récupérer les organisations GitHub de l'utilisateur connecté
 * @route   GET /api/github/orgs
 */
export const getGithubOrgs = async (req: Request, res: Response) => {
    try {
        // 1. Récupérer le token de l'utilisateur connecté depuis la BDD
        const user = await User.findById(req.user?.id).select('+githubToken');
        if (!user || !user.githubToken) {
            return res.status(400).json({ message: 'Le token GitHub n\'est pas configuré pour cet utilisateur.' });
        }

        // 2. Initialiser Octokit avec ce token
        const octokit = new Octokit({ auth: user.githubToken });

        // 3. Appeler l'API GitHub pour lister les organisations
        const { data: orgs } = await octokit.rest.orgs.listForAuthenticatedUser();

        // 4. Renvoyer une liste simplifiée (juste le nom/login) au frontend
        res.json(orgs.map(org => ({ login: org.login, avatar_url: org.avatar_url })));

    } catch (error) {
        console.error("Erreur lors de la récupération des organisations GitHub:", error);
        res.status(500).json({ message: 'Impossible de récupérer les organisations depuis GitHub.' });
    }
};