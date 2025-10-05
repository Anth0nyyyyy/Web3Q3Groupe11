// /backend/src/controllers/project.controller.ts
import type { Request, Response } from 'express';
import Project from '../models/Project.model.js';
import Group from '../models/Group.model.js'; // Assurez-vous que l'import est bien là

/**
 * @desc    Créer un nouveau projet pour le professeur connecté
 * @route   POST /api/projects
 */
export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, githubOrg, minMembers, maxMembers, repoPattern } = req.body;
        const owner = req.user?.id;

        if (!owner) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }

        const newProject = new Project({
            name,
            githubOrg,
            minMembers,
            maxMembers,
            repoPattern,
            owner
        });

        await newProject.save();
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
        const ownerId = req.user?.id;
        const projects = await Project.find({ owner: ownerId }).sort({ createdAt: -1 });
        res.status(200).json(projects);

    } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des projets.' });
    }
};

/**
 * @desc    Récupérer un projet par son ID, avec les groupes associés
 * @route   GET /api/projects/:id
 */
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.id;

        // 1. Récupérer le projet
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé.' });
        }

        // 2. Vérifier que le projet appartient bien au professeur connecté (sécurité)
        if (project.owner.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Accès non autorisé à ce projet.' });
        }

        // 3. Récupérer tous les groupes qui sont liés à ce projet
        const groups = await Group.find({ project: projectId });

        // 4. Renvoyer un objet contenant à la fois les détails du projet et la liste des groupes
        res.json({ project, groups });

    } catch (error) {
        console.error("Erreur lors de la récupération du détail du projet:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};