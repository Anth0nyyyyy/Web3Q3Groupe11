// /backend/src/services/github.service.ts
import { Octokit } from 'octokit';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Group from '../models/Group.model.js';
import type { IUser } from '../models/User.model.js';
import type { IProject } from '../models/Project.model.js';

export const createGithubTeamAndRepo = async (projectId: string, studentUsernames: string[]) => {
    // 1. Récupérer les détails complets du projet
    const project: IProject | null = await Project.findById(projectId);
    if (!project) {
        throw new Error('Projet non trouvé.');
    }

    // 2. Récupérer le token GitHub (depuis la BDD ou le .env de secours)
    let githubToken: string | undefined;
    const ownerWithToken: (IUser & { githubToken?: string }) | null = await User.findById(project.owner).select('+githubToken');

    if (ownerWithToken && ownerWithToken.githubToken) {
        githubToken = ownerWithToken.githubToken;
        console.log("INFO: Utilisation du token GitHub de la base de données.");
    } else if (process.env.NODE_ENV !== 'production' && process.env.DEV_GITHUB_TOKEN) {
        githubToken = process.env.DEV_GITHUB_TOKEN;
        console.log("AVERTISSEMENT: Utilisation du token GitHub de secours (DEV_GITHUB_TOKEN).");
    }

    if (!githubToken) {
        throw new Error('Aucun token GitHub valide n\'a pu être trouvé. Le propriétaire du projet doit le configurer.');
    }

    const octokit = new Octokit({ auth: githubToken });

    // 3. Validation des pseudos GitHub avant toute autre action
    console.log("Vérification des pseudos GitHub...");
    for (const username of studentUsernames) {
        try {
            await octokit.rest.users.getByUsername({ username });
            console.log(` -> Pseudo "${username}" valide.`);
        } catch (error) {
            console.error(` -> ERREUR: Le pseudo "${username}" n'existe pas sur GitHub.`);
            throw new Error(`Le pseudo GitHub "${username}" est invalide ou n'a pas pu être trouvé.`);
        }
    }

    // 4. Logique de nommage séquentielle
    const groupCount = await Group.countDocuments({ project: projectId });
    const newGroupNumber = String(groupCount + 1).padStart(2, '0');
    const teamAndRepoName = project.repoPattern.replace('##', newGroupNumber);
    console.log(`Génération du nom pour le nouveau groupe : ${teamAndRepoName}`);

    // 5. Création du dépôt privé sur GitHub
    console.log(`Création du dépôt "${teamAndRepoName}"...`);
    const { data: repo } = await octokit.rest.repos.createInOrg({
        org: project.githubOrg,
        name: teamAndRepoName,
        private: true,
    });
    console.log(` -> Dépôt "${teamAndRepoName}" créé.`);

    // --- NOUVELLE ÉTAPE : AJOUTER LE FICHIER DE CONSIGNES SI IL EXISTE ---
    if (project.instructionsContent) {
        console.log("Ajout du fichier CONSIGNES.md au dépôt...");
        try {
            await octokit.rest.repos.createOrUpdateFileContents({
                owner: project.githubOrg, // Le propriétaire du dépôt est l'organisation
                repo: teamAndRepoName,
                path: 'CONSIGNES.md', // Nom du fichier à la racine du dépôt
                message: 'Ajout des consignes initiales du projet', // Message du commit
                content: Buffer.from(project.instructionsContent).toString('base64'), // Le contenu doit être encodé en Base64
            });
            console.log(" -> Fichier de consignes ajouté avec succès.");
        } catch (error) {
            console.error("ERREUR lors de l'ajout du fichier de consignes:", error);
            // On continue même si cette étape échoue pour ne pas bloquer la création du groupe
        }
    }

    // 6. Création de l'équipe sur GitHub
    console.log(`Création de l'équipe "${teamAndRepoName}"...`);
    const { data: team } = await octokit.rest.teams.create({
        org: project.githubOrg,
        name: teamAndRepoName,
        privacy: 'closed',
    });
    console.log(` -> Équipe "${teamAndRepoName}" créée.`);

    // 7. Liaison de l'équipe au dépôt
    console.log(`Liaison de l'équipe au dépôt...`);
    await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
        org: project.githubOrg,
        team_slug: team.slug,
        owner: project.githubOrg,
        repo: repo.name,
        permission: 'push',
    });
    console.log(` -> Permissions accordées.`);

    // 8. Ajout des étudiants à l'équipe
    console.log(`Ajout des membres à l'équipe...`);
    for (const username of studentUsernames) {
        await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
            org: project.githubOrg,
            team_slug: team.slug,
            username,
            role: 'member',
        });
        console.log(` -> Membre '${username}' ajouté à l'équipe.`);
    }

    // 9. Retourner les informations nécessaires au contrôleur
    return { repoUrl: repo.html_url, groupName: teamAndRepoName };
};

export const deleteGithubTeamAndRepo = async (teamAndRepoName: string, githubOrg: string, githubToken: string) => {
    const octokit = new Octokit({ auth: githubToken });

    console.log(`Tentative de suppression de l'équipe et du dépôt "${teamAndRepoName}" dans "${githubOrg}"...`);

    try {
        // 1. Supprimer le dépôt
        await octokit.rest.repos.delete({
            owner: githubOrg,
            repo: teamAndRepoName,
        });
        console.log(` -> Dépôt "${teamAndRepoName}" supprimé avec succès.`);
    } catch (error: any) {
        // On n'arrête pas le processus si le dépôt n'existe plus, c'est peut-être normal
        if (error.status === 404) {
            console.log(` -> AVERTISSEMENT: Le dépôt "${teamAndRepoName}" n'a pas été trouvé (déjà supprimé ?).`);
        } else {
            console.error(` -> ERREUR lors de la suppression du dépôt:`, error.message);
            // On pourrait choisir de jeter une erreur ici pour arrêter le processus
        }
    }

    try {
        // 2. Supprimer l'équipe
        await octokit.rest.teams.deleteInOrg({
            org: githubOrg,
            team_slug: teamAndRepoName, // Le slug de l'équipe est généralement identique à son nom
        });
        console.log(` -> Équipe "${teamAndRepoName}" supprimée avec succès.`);
    } catch (error: any) {
        if (error.status === 404) {
            console.log(` -> AVERTISSEMENT: L'équipe "${teamAndRepoName}" n'a pas été trouvée (déjà supprimée ?).`);
        } else {
            console.error(` -> ERREUR lors de la suppression de l'équipe:`, error.message);
        }
    }
};