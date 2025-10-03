// /backend/src/services/github.service.ts
import { Octokit } from 'octokit';
// On importe les modèles (les valeurs) et les types (avec 'type') séparément
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import type { IUser } from '../models/User.model.js';
import type { IProject } from '../models/Project.model.js';

export const createGithubTeamAndRepo = async (projectId: string, studentUsernames: string[]) => {
    // 1. Récupérer les détails du projet
    const project: IProject | null = await Project.findById(projectId);
    if (!project) {
        throw new Error('Projet non trouvé.');
    }

    // 2. Récupérer le token GitHub du professeur propriétaire
    // On spécifie que le type peut inclure notre champ optionnel githubToken
    const ownerWithToken: (IUser & { githubToken?: string }) | null = await User.findById(project.owner).select('+githubToken');
    if (!ownerWithToken || !ownerWithToken.githubToken) {
        throw new Error('Le token GitHub du professeur est manquant ou invalide.');
    }

    const octokit = new Octokit({ auth: ownerWithToken.githubToken });

    // 3. Générer le nom de l'équipe et du dépôt
    const teamAndRepoName = `${project.name.replace(/\s+/g, '-')}-equipe-${Date.now()}`;

    // 4. Créer l'équipe dans l'organisation
    const { data: team } = await octokit.rest.teams.create({
        org: project.githubOrg,
        name: teamAndRepoName,
        privacy: 'closed',
    });

    // 5. Créer le dépôt privé
    const { data: repo } = await octokit.rest.repos.createInOrg({
        org: project.githubOrg,
        name: teamAndRepoName,
        private: true,
    });

    // 6. Lier l'équipe au dépôt
    await octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
        org: project.githubOrg,
        team_slug: team.slug,
        owner: project.githubOrg,
        repo: repo.name,
        permission: 'push',
    });

    // 7. Ajouter chaque étudiant à l'équipe
    for (const username of studentUsernames) {
        await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
            org: project.githubOrg,
            team_slug: team.slug,
            username,
            role: 'member',
        });
    }

    // 8. Retourner l'URL du dépôt créé
    return repo.html_url;
};