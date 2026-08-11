# Projet Web 3 - HELHa (Gestionnaire de Dépôts GitHub)

Application web développée dans le cadre du cours "Projet Web 3" de la HELHa (Prof. Frédéric Pluquet). Ce projet permet d'automatiser la création d'équipes et de dépôts privés sur GitHub pour les travaux de groupe étudiants.

## 🎥 Vidéo de Présentation (Session Q3)

👉 **[CLIQUEZ ICI POUR VOIR LA VIDÉO DE PRÉSENTATION Q3](https://youtube.com/votre-lien-ici)** 👈

*Cette vidéo montre l'application en ligne en fonctionnement, détaille l'architecture du code, et met en évidence les améliorations apportées depuis la session Q1.*

---

##  Fonctionnalités Principales

*   **Espace Professeur :** Authentification sécurisée (JWT), configuration de l'organisation GitHub, création de projets avec dates limites, et génération de liens de partage uniques.
*   **Espace Étudiant :** Inscription des membres via un lien public (validation stricte des matricules et pseudos GitHub).
*   **Automatisation GitHub (Octokit) :** Création instantanée des dépôts, création des équipes, assignation des droits en écriture et upload automatique du fichier `CONSIGNES.md`.

##  Stack Technique

*   **Frontend :** React, TypeScript, Vite, React Router, Material-UI, Axios. (Déployé sur Vercel)
*   **Backend :** Node.js, Express, TypeScript, Zod (Validation), Bcrypt (Sécurité). (Déployé sur Render)
*   **Base de Données :** MongoDB Atlas, Mongoose (ODM).
*   **Tests :** Jest (Tests unitaires/intégration), Cypress (Tests E2E).

##  Documentation Technique

L'intégralité de la documentation technique exigée se trouve dans le dossier `/docs` à la racine du projet :

1.  [Guide d'Installation et d'Utilisation](./docs/INSTALLATION.md)
2.  [Documentation de l'API Backend](docs/API.md)
3.  [Gestion des Processus en Arrière-plan (Crontab)](docs/PROCESSUS_ARRIERE_PLAN.md)
4.  [Rapport des Améliorations Q3](./AMELIORATIONS_Q3.md)