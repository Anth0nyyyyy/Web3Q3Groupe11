import type { Request, Response } from 'express';
import Project from '../models/Project.model.js';

// Créer un nouveau projet
// /backend/src/controllers/project.controller.ts
export const createProject = async (req: Request, res: Response) => {
    // --- LIGNE ESPION ---
    console.log('Requête reçue pour créer un projet.');
    console.log('Corps de la requête (body):', req.body);
    console.log('Utilisateur authentifié (req.user):', req.user);

    try {
        const { name, githubOrg, minMembers, maxMembers, repoPattern } = req.body;
        const owner = req.user?.id;

        // On vérifie que l'owner a bien été trouvé
        if (!owner) {
            return res.status(401).json({ message: "Impossible d'identifier l'utilisateur propriétaire." });
        }

        const newProject = new Project({
            name, githubOrg, minMembers, maxMembers, repoPattern, owner
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error: any) { // On ajoute ': any' pour pouvoir logger l'erreur
        // --- LIGNE ESPION D'ERREUR ---
        console.error('ERREUR lors de la création du projet:', error.message);
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