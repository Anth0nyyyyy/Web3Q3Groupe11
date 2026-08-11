import 'dotenv/config';
import mongoose from 'mongoose';
import { Octokit } from 'octokit';
import Project from '../models/Project.model.js';
import Group from '../models/Group.model.js';
import User from '../models/User.model.js';

const archiveExpiredRepositories = async () => {
    console.log('--- Lancement du script d\'archivage des dépôts expirés ---');
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('ERREUR CRITIQUE : La variable MONGO_URI est manquante dans le fichier .env.');
        process.exit(1);
    }

    try {
        console.log('Connexion à la base de données...');
        await mongoose.connect(mongoUri);
        console.log(' -> Connexion réussie à MongoDB Atlas.');

        const now = new Date();

        // 1. Trouver tous les projets dont la date de fin est dépassée ou égale à aujourd'hui
        const expiredProjects = await Project.find({
            projectEndDate: { $lte: now }
        });

        if (expiredProjects.length === 0) {
            console.log(' -> Aucun projet expiré à traiter aujourd\'hui.');
            await mongoose.disconnect();
            console.log('Déconnexion de la base de données. Fin du processus.');
            process.exit(0);
        }

        console.log(` -> ${expiredProjects.length} projet(s) expiré(s) détecté(s). Début de l'archivage...`);

        for (const project of expiredProjects) {
            console.log(`\n--- Traitement du projet : "${project.name}" (Organisation GitHub: ${project.githubOrg}) ---`);

            // 2. Récupérer le token du professeur (propriétaire du projet)
            const owner = await User.findById(project.owner).select('+githubToken');
            if (!owner || !owner.githubToken) {
                console.warn(`  ⚠️ AVERTISSEMENT : Token GitHub introuvable pour le professeur du projet "${project.name}". Passage au suivant.`);
                continue;
            }

            const octokit = new Octokit({ auth: owner.githubToken });

            // 3. Récupérer tous les groupes d'étudiants inscrits à ce projet
            const groups = await Group.find({ project: project._id });
            if (groups.length === 0) {
                console.log('  -> Aucun groupe d\'étudiants n\'est inscrit à ce projet.');
                continue;
            }

            console.log(`  -> ${groups.length} dépôt(s) à archiver.`);

            // 4. Parcourir chaque groupe pour archiver son dépôt GitHub
            for (const group of groups) {
                try {
                    console.log(`  [🔄] Tentative d'archivage du dépôt "${group.name}" sur GitHub...`);

                    // Appel API GitHub pour passer le dépôt en lecture seule (archived)
                    await octokit.rest.repos.update({
                        owner: project.githubOrg,
                        repo: group.name,
                        archived: true
                    });

                    console.log(`  [✅] Succès : Le dépôt "${group.name}" est désormais archivé (Lecture seule).`);
                } catch (error: any) {
                    // On catch l'erreur pour qu'un dépôt en échec ne bloque pas l'archivage des autres dépôts du projet
                    console.error(`  [❌] Erreur d'archivage pour "${group.name}" :`, error.message);
                }
            }
        }

        console.log('\n--- Fin du traitement d\'archivage ---');
    } catch (error: any) {
        console.error('ERREUR SYSTEME :', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Déconnexion de la base de données.');
    }
};

// Exécution de la fonction
archiveExpiredRepositories();