// /backend/src/services/github.service.ts
import { Octokit } from 'octokit';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Group from '../models/Group.model.js';
import type { IUser } from '../models/User.model.js';
import type { IProject } from '../models/Project.model.js';

/**
 * Orchestre la création d'une équipe, d'un dépôt, l'ajout de membres et de consignes sur GitHub.
 */
export const createGithubTeamAndRepo = async (projectId: string, studentUsernames: string[]) => {
    // 1. Récupérer les détails du projet
    const project: IProject | null = await Project.findById(projectId);
    if (!project) throw new Error('Projet non trouvé.');

    // 2. Récupérer le token GitHub du professeur
    const ownerWithToken: (IUser & { githubToken?: string }) | null = await User.findById(project.owner).select('+githubToken');
    if (!ownerWithToken || !ownerWithToken.githubToken) {
        throw new Error('Le token GitHub du professeur est manquant.');
    }

    const octokit = new Octokit({ auth: ownerWithToken.githubToken });

    // 3. Validation des pseudos
    for (const username of studentUsernames) {
        try { await octokit.rest.users.getByUsername({ username }); }
        catch (error) { throw new Error(`Le pseudo GitHub "${username}" est invalide.`); }
    }

    // 4. Logique de nommage
    const groupCount = await Group.countDocuments({ project: projectId });
    const newGroupNumber = String(groupCount + 1).padStart(2, '0');
    const teamAndRepoName = project.repoPattern.replace('##', newGroupNumber);

    // 5. Création du dépôt
    const { data: repo } = await octokit.rest.repos.createInOrg({
        org: project.githubOrg, name: teamAndRepoName, private: true,
    });

    // 6. Ajout du fichier de consignes
    if (project.instructionsContent) {
        try {
            await octokit.rest.repos.createOrUpdateFileContents({
                owner: project.githubOrg, repo: teamAndRepoName, path: 'CONSIGNES.md',
                message: 'Ajout des consignes initiales',
                content: Buffer.from(project.instructionsContent).toString('base64'),
            });
        } catch (error) { console.error("AVERTISSEMENT: L'ajout du fichier de consignes a échoué:", error); }
    }

    // 7. Création de l'équipe
    const { data: team } = await octokit.rest.teams.create({
        org: project.githubOrg, name: teamAndRepoName, privacy: 'closed',
    });

    // 8. Liaison de l'équipe au dépôt
    await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
        org: project.githubOrg, team_slug: team.slug, owner: project.githubOrg,
        repo: teamAndRepoName, permission: 'push',
    });

    // 9. Ajout des membres à l'équipe
    for (const username of studentUsernames) {
        await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
            org: project.githubOrg, team_slug: team.slug, username, role: 'member',
        });
    }

    // 10. CORRECTION : On ne renvoie PAS le slug
    return { repoUrl: repo.html_url, groupName: teamAndRepoName };
};


/**
 * Supprime une équipe et le dépôt associé sur GitHub.
 */
// CORRECTION : La fonction n'attend PAS de slug
export const deleteGithubTeamAndRepo = async (repoName: string, githubOrg: string, githubToken: string) => {
    const octokit = new Octokit({ auth: githubToken });

    // 1. Supprimer le dépôt
    try {
        await octokit.rest.repos.delete({ owner: githubOrg, repo: repoName });
        console.log(` -> Dépôt "${repoName}" supprimé.`);
    } catch (error: any) {
        if (error.status !== 404) console.error(` -> ERREUR suppression dépôt "${repoName}":`, error.message);
    }

    // 2. Supprimer l'équipe
    try {
        // On reconstruit le slug à la volée à partir du nom
        const teamSlug = repoName.toLowerCase().replace(/\s+/g, '-');
        await octokit.rest.teams.deleteInOrg({ org: githubOrg, team_slug: teamSlug });
        console.log(` -> Équipe "${repoName}" supprimée.`);
    } catch (error: any) {
        if (error.status !== 404) console.error(` -> ERREUR suppression équipe "${repoName}":`, error.message);
    }
};