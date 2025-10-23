// /backend/src/controllers/project.controller.ts
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.model.js';
import Group from '../models/Group.model.js';
import User from '../models/User.model.js';
import type { IProject } from '@shared/types/index.ts';
import { deleteGithubTeamAndRepo } from '../services/github.service.js';

/**
 * @desc    Créer un nouveau projet pour le professeur connecté
 */
export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, githubOrg, minMembers, maxMembers, repoPattern, enrollmentEndDate, projectEndDate } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }
        const ownerId = req.user.id;

        const newProjectData: Partial<IProject> = {
            name, githubOrg, minMembers, maxMembers, repoPattern, owner: ownerId, enrollmentEndDate, projectEndDate
        };

        if (req.file) {
            (newProjectData as any).instructionsContent = req.file.buffer.toString('utf-8');
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
 */
export const getMyProjects = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }
        const ownerId = new mongoose.Types.ObjectId(req.user.id);

        const projectsWithGroupCount = await Project.aggregate([
            { $match: { owner: ownerId } },
            { $lookup: { from: 'groups', localField: '_id', foreignField: 'project', as: 'groups' } },
            {
                $project: {
                    _id: 1, name: 1, githubOrg: 1, minMembers: 1, maxMembers: 1,
                    repoPattern: 1, accessKey: 1, enrollmentEndDate: 1, projectEndDate: 1,
                    createdAt: 1, groupCount: { $size: '$groups' }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json(projectsWithGroupCount);
    } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des projets.' });
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

        // Mise à jour explicite des champs pour la sécurité et la gestion des types
        project.name = req.body.name || project.name;
        project.githubOrg = req.body.githubOrg || project.githubOrg;
        project.minMembers = req.body.minMembers || project.minMembers;
        project.maxMembers = req.body.maxMembers || project.maxMembers;
        project.repoPattern = req.body.repoPattern || project.repoPattern;

        // On gère spécifiquement la mise à jour des dates
        if (req.body.enrollmentEndDate) {
            project.enrollmentEndDate = new Date(req.body.enrollmentEndDate);
        }
        if (req.body.projectEndDate) {
            project.projectEndDate = new Date(req.body.projectEndDate);
        }

        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (error) {
        console.error("Erreur de mise à jour du projet:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
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