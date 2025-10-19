// /backend/src/controllers/project.controller.ts
import type { Request, Response } from 'express';

// CORRECTION : On importe les VALEURS (Modèles) depuis leurs fichiers locaux
import Project from '../models/Project.model.js';
import Group from '../models/Group.model.js';
import User from '../models/User.model.js';

// CORRECTION : On importe les TYPES depuis le dossier partagé
import type { IProject } from '@shared/types/index.ts';
import { deleteGithubTeamAndRepo } from '../services/github.service.js';

/**
 * @desc    Créer un nouveau projet pour le professeur connecté
 */
export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, githubOrg, minMembers, maxMembers, repoPattern } = req.body;

        // CORRECTION : On vérifie que 'req.user' existe avant d'accéder à 'id'
        if (!req.user) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }
        const ownerId = req.user.id;

        const newProjectData = {
            name, githubOrg, minMembers, maxMembers, repoPattern, owner: ownerId
        };

        if (req.file) {
            (newProjectData as any).instructionsContent = req.file.buffer.toString('utf-8');
        }

        const newProject = new Project(newProjectData);
        await newProject.save();

        res.status(201).json(newProject);
    } catch (error) {
        console.error("Erreur lors de la création du projet:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * @desc    Obtenir tous les projets appartenant au professeur connecté
 */
export const getMyProjects = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }
        const projects = await Project.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * @desc    Récupérer un projet par son ID, avec les groupes associés
 */
export const getProjectById = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
        if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Accès non autorisé.' });

        const groups = await Group.find({ project: req.params.id });
        res.json({ project, groups });
    } catch (error) {
        console.error("Erreur de récupération du détail du projet:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * @desc    Mettre à jour un projet
 */
export const updateProject = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Utilisateur non authentifié." });

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
        if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Action non autorisée.' });

        // On met à jour les champs
        Object.assign(project, req.body);
        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (error) {
        console.error("Erreur de mise à jour du projet:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * @desc    Supprimer un projet
 */
export const deleteProject = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Utilisateur non authentifié." });

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Projet non trouvé.' });
        if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Action non autorisée.' });

        const owner = await User.findById(req.user.id).select('+githubToken');
        const githubToken = owner?.githubToken;

        if (githubToken) {
            const groups = await Group.find({ project: req.params.id });
            for (const group of groups) {
                await deleteGithubTeamAndRepo(group.name, project.githubOrg, githubToken);
            }
        }

        await Group.deleteMany({ project: req.params.id });
        await project.deleteOne();
        res.json({ message: 'Projet supprimé avec succès.' });
    } catch (error) {
        console.error("Erreur de suppression du projet:", error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};