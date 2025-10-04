// /backend/src/controllers/group.controller.ts
import type { Request, Response } from 'express';
import { createGithubTeamAndRepo } from '../services/github.service.js';
import Project from '../models/Project.model.js';
import Group from '../models/Group.model.js';
import type { IProject } from '../models/Project.model.js';

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { projectId, accessKey } = req.params;
        const { members } = req.body;

        // --- CORRECTION : La vérification des 'params' qui rassure TypeScript ---
        if (!projectId || !accessKey) {
            return res.status(400).json({ message: 'ID de projet ou clé d\'accès manquante dans l\'URL.' });
        }

        // 1. Valider la logique métier : la clé d'accès correspond-elle bien au projet ?
        const project: IProject | null = await Project.findById(projectId);
        if (!project || project.accessKey !== accessKey) {
            return res.status(403).json({ message: 'Clé d\'accès invalide ou projet non trouvé.' });
        }

        // 2. Extraire les pseudos GitHub
        const githubUsernames = members.map((member: { githubUsername: string }) => member.githubUsername);

        // 3. Appeler le service GitHub
        // À ce stade, 'projectId' est bien une 'string'
        const { repoUrl, groupName } = await createGithubTeamAndRepo(projectId, githubUsernames);

        // 4. Sauvegarder le groupe dans notre base de données
        const newGroup = new Group({
            name: groupName,
            project: projectId,
            members: members,
            repoUrl: repoUrl,
        });
        await newGroup.save();

        // 5. Envoyer la réponse de succès
        res.status(201).json({ message: `Groupe "${groupName}" et dépôt créés avec succès !`, repoUrl });

    } catch (error: any) {
        console.error("ERREUR DANS LE CONTRÔLEUR DE GROUPE:", error.message);
        const statusCode = error.message.includes('pseudo GitHub') ? 400 : 500;
        res.status(statusCode).json({ message: error.message || 'Erreur serveur.' });
    }
};