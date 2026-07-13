// /backend/src/controllers/group.controller.ts
import type { Request, Response } from 'express';
import { createGithubTeamAndRepo } from '../services/github.service.js';
import Project from '../models/Project.model.js';
import Group from '../models/Group.model.js';
import type { IProject } from '@shared/types/index.ts';

/**
 * @desc    Inscrire un groupe d'étudiants (Public)
 * @route   POST /api/groups/createGroup/:projectId/:accessKey
 */
export const createGroup = async (req: Request, res: Response) => {
    try {
        const { projectId, accessKey } = req.params;
        const { members } = req.body;

        // 1. Valider la logique métier : la clé d'accès correspond-elle bien au projet ?
        const project: IProject | null = await Project.findById(projectId);
        if (!project || project.accessKey !== accessKey) {
            return res.status(403).json({ message: 'Lien de projet invalide ou expiré.' });
        }

        // --- NOUVELLE RÈGLE : VALIDER LA DATE LIMITE D'INSCRIPTION ---
        if (project.enrollmentEndDate && new Date() > new Date(project.enrollmentEndDate)) {
            return res.status(400).json({
                message: "La période d'inscription pour ce projet est clôturée (date limite dépassée)."
            });
        }

        // --- RÈGLE EXISTANTE : VALIDER LA TAILLE DE L'ÉQUIPE ---
        if (members.length < project.minMembers || members.length > project.maxMembers) {
            return res.status(400).json({
                message: `Le nombre de membres doit être compris entre ${project.minMembers} et ${project.maxMembers}.`
            });
        }

        const githubUsernames = members.map((member: any) => member.githubUsername);

        // --- RÈGLE EXISTANTE : VÉRIFIER SI UN MEMBRE EST DÉJÀ DANS UN GROUPE ---
        const existingGroup = await Group.findOne({
            project: projectId,
            'members.githubUsername': { $in: githubUsernames }
        });

        if (existingGroup) {
            return res.status(409).json({ message: 'Un ou plusieurs membres de cette équipe font déjà partie d\'un autre groupe pour ce projet.' });
        }

        // 3. Appeler le service GitHub
        const { repoUrl, groupName } = await createGithubTeamAndRepo(projectId!, githubUsernames);

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

/**
 * @desc    Récupérer les détails d'un projet pour le formulaire d'inscription (Public)
 * @route   GET /api/groups/details/:projectId/:accessKey
 */
export const getPublicProjectDetails = async (req: Request, res: Response) => {
    console.log(`[${new Date().toISOString()}] REQUÊTE REÇUE sur /details`);
    try {
        const { projectId, accessKey } = req.params;
        console.log(` -> Recherche du projet avec ID: ${projectId}`);

        // On récupère le projet
        const project = await Project.findById(projectId);

        // Sécurité : On valide l'accessKey en même temps. Si la clé est mauvaise, on dit "Lien invalide"
        if (!project || project.accessKey !== accessKey) {
            console.log(' -> Projet introuvable ou clé d\'accès invalide.');
            return res.status(404).json({ message: 'Lien de projet invalide ou expiré.' });
        }

        console.log(' -> Envoi de la réponse sanitizée au client.');

        // On renvoie un objet propre sans exposer l'owner, la clé secrète ou les consignes
        res.json({
            _id: project._id,
            name: project.name,
            githubOrg: project.githubOrg,
            minMembers: project.minMembers,
            maxMembers: project.maxMembers,
            repoPattern: project.repoPattern,
            enrollmentEndDate: project.enrollmentEndDate,
            projectEndDate: project.projectEndDate
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};