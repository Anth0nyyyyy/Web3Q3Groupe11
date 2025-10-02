import type { Request, Response } from 'express';
import Project from '../models/Project.model.js';

// Créer un nouveau projet
export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, githubOrg, minMembers, maxMembers, repoPattern } = req.body;
        const owner = req.user?.id; // On récupère l'ID du prof depuis le middleware

        const newProject = new Project({
            name, githubOrg, minMembers, maxMembers, repoPattern, owner
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la création du projet.' });
    }
};

// Obtenir tous les projets du professeur connecté
export const getMyProjects = async (req: Request, res: Response) => {
    try {
        const projects = await Project.find({ owner: req.user?.id }).sort({ createdAt: -1 });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};