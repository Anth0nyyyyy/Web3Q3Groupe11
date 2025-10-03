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

        // --- CORRECTION : On vérifie que les paramètres d'URL existent ---
        if (!projectId || !accessKey) {
            return res.status(400).json({ message: 'ID de projet ou clé d\'accès manquante dans l\'URL.' });
        }

        if (!members || !Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: 'La liste des membres est requise.' });
        }

        // 1. Valider la clé d'accès
        const project: IProject | null = await Project.findById(projectId);
        if (!project || project.accessKey !== accessKey) {
            return res.status(403).json({ message: 'Clé d\'accès invalide ou projet non trouvé.' });
        }

        // 2. Extraire les pseudos GitHub
        const githubUsernames = members.map((member: any) => member.githubUsername);

        // 3. Appeler le service GitHub
        // À ce stade, TypeScript sait que 'projectId' est une 'string'
        const repoUrl = await createGithubTeamAndRepo(projectId, githubUsernames);

        // 4. Générer un nom de groupe unique
        const groupCount = await Group.countDocuments({ project: projectId });
        const groupName = project.repoPattern.replace('##', String(groupCount + 1).padStart(2, '0'));

        // 5. Sauvegarder le groupe dans notre base de données
        const newGroup = new Group({
            name: groupName,
            project: projectId,
            members: members,
            repoUrl: repoUrl,
        });
        await newGroup.save();

        res.status(201).json({ message: `Groupe "${groupName}" et dépôt créés avec succès !`, repoUrl });

    } catch (error: any) {
        console.error("ERREUR lors de la création du groupe:", error);
        res.status(500).json({ message: error.message || 'Erreur serveur.' });
    }
};