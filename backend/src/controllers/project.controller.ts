// /backend/src/controllers/project.controller.ts
import type { Request, Response } from 'express';
import Project from '../models/Project.model.js';

/**
 * @desc    Créer un nouveau projet pour le professeur connecté
 * @route   POST /api/projects
 */
export const createProject = async (req: Request, res: Response) => {
    try {
        // La validation des données du body (name, githubOrg, etc.) a été faite en amont.
        const { name, githubOrg, minMembers, maxMembers, repoPattern } = req.body;

        // On récupère l'ID du professeur depuis le middleware 'protect'
        const owner = req.user?.id;

        // Le middleware 'protect' garantit que req.user.id existe, mais cette vérification est une sécurité supplémentaire.
        if (!owner) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }

        const newProject = new Project({
            name,
            githubOrg,
            minMembers,
            maxMembers,
            repoPattern, // Sera la valeur par défaut du modèle si non fourni
            owner
        });

        await newProject.save();

        // On renvoie le projet nouvellement créé
        res.status(201).json(newProject);

    } catch (error) {
        console.error("Erreur lors de la création du projet:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la création du projet.' });
    }
};

/**
 * @desc    Obtenir tous les projets appartenant au professeur connecté
 * @route   GET /api/projects
 */
export const getMyProjects = async (req: Request, res: Response) => {
    try {
        // On récupère l'ID du professeur depuis le middleware 'protect'
        const ownerId = req.user?.id;

        const projects = await Project.find({ owner: ownerId }).sort({ createdAt: -1 });

        res.status(200).json(projects);

    } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des projets.' });
    }
};