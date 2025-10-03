// /backend/src/controllers/group.controller.ts
import type { Request, Response } from 'express';
import { createGithubTeamAndRepo } from '../services/github.service.js';
import Project from '../models/Project.model.js';
import type { IProject } from '../models/Project.model.js';

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { projectId, accessKey } = req.params;
        const { githubUsernames } = req.body;

        // --- CORRECTION : On vérifie que les paramètres existent ---
        if (!projectId || !accessKey) {
            return res.status(400).json({ message: 'ID de projet ou clé d\'accès manquante dans l\'URL.' });
        }

        // Valider la clé d'accès
        const project: IProject | null = await Project.findById(projectId);
        if (!project || project.accessKey !== accessKey) {
            return res.status(403).json({ message: 'Clé d\'accès invalide ou projet non trouvé.' });
        }

        // Appeler le service qui fait tout le travail
        // À ce stade, TypeScript est certain que 'projectId' est une 'string'
        const repoUrl = await createGithubTeamAndRepo(projectId, githubUsernames);

        res.status(201).json({ message: 'Équipe et dépôt créés avec succès !', repoUrl });
    } catch (error: any) {
        console.error("ERREUR lors de la création du groupe:", error);
        res.status(500).json({ message: error.message || 'Erreur serveur.' });
    }
};