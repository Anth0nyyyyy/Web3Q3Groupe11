// /backend/src/controllers/project.controller.ts
import type { Request, Response } from 'express';
import Project, { type IProject } from '../models/Project.model.js';
import Group from '../models/Group.model.js';
import { deleteGithubTeamAndRepo } from '../services/github.service.js'; // <-- AJOUTER L'IMPORT
import User from '../models/User.model.js'; // <-- AJOUTER L'IMPORT (pour le token)

/**
 * @desc    Créer un nouveau projet pour le professeur connecté
 * @route   POST /api/projects
 */
export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, githubOrg, minMembers, maxMembers, repoPattern,enrollmentEndDate, projectEndDate } = req.body;
        const ownerId = req.user?.id;

        if (!ownerId) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }

        const newProjectData: Partial<IProject> = {
            name,
            githubOrg,
            minMembers,
            maxMembers,
            repoPattern,
            enrollmentEndDate,
            projectEndDate,
            // On convertit explicitement la string en ObjectId pour satisfaire TypeScript
            owner: ownerId
        };

        if (req.file) {
            newProjectData.instructionsContent = req.file.buffer.toString('utf-8');
        }

        const newProject = new Project(newProjectData);
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
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé.' });
        }

        if (project.owner.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Accès non autorisé à ce projet.' });
        }

        const groups = await Group.find({ project: projectId });
        res.json({ project, groups });

    } catch (error) {
        console.error("Erreur lors de la récupération du détail du projet:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * @desc    Mettre à jour un projet
 * @route   PUT /api/projects/:id
 */
export const updateProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé.' });
        }

        if (project.owner.toString() !== req.user?.id) {
            return res.status(403).json({ message: 'Action non autorisée.' });
        }

        project.name = req.body.name || project.name;
        project.githubOrg = req.body.githubOrg || project.githubOrg;
        project.minMembers = req.body.minMembers || project.minMembers;
        project.maxMembers = req.body.maxMembers || project.maxMembers;
        project.repoPattern = req.body.repoPattern || project.repoPattern;

        const updatedProject = await project.save();
        res.json(updatedProject);

    } catch (error) {
        console.error("Erreur lors de la mise à jour du projet:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
    }
};

/**
 * @desc    Supprimer un projet
 * @route   DELETE /api/projects/:id
 */
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
        if (project.owner.toString() !== req.user?.id) return res.status(403).json({ message: 'Action non autorisée.' });

        // --- NOUVELLE LOGIQUE DE SUPPRESSION SUR GITHUB ---

        // 1. Récupérer le token du professeur
        const owner = await User.findById(req.user.id).select('+githubToken');
        const githubToken = owner?.githubToken || process.env.DEV_GITHUB_TOKEN;

        if (githubToken) {
            // 2. Trouver tous les groupes associés à ce projet
            const groups = await Group.find({ project: req.params.id });

            // 3. Boucler sur chaque groupe et appeler le service de suppression
            for (const group of groups) {
                await deleteGithubTeamAndRepo(group.name, project.githubOrg, githubToken);
            }
        } else {
            console.warn(`AVERTISSEMENT: Aucun token GitHub trouvé pour l'utilisateur ${req.user.id}. Impossible de supprimer les ressources GitHub.`);
        }

        // --- FIN DE LA NOUVELLE LOGIQUE ---

        // On supprime les documents de notre base de données APRÈS avoir essayé de nettoyer GitHub
        await Group.deleteMany({ project: req.params.id });
        await project.deleteOne();

        res.json({ message: 'Projet et ressources associées supprimés avec succès.' });
    } catch (error) {
        console.error("Erreur lors de la suppression du projet:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};