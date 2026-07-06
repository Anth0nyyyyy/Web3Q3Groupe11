# Documentation de l'API Backend

Ce document décrit l'ensemble des points d'entrée (routes) exposés par l'API du projet HELHa.

**URL de base en développement :** `http://localhost:4000`  
**En-tête requis pour les routes protégées :** `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentification (`/api/auth`)

### `POST /api/auth/register`
*   **Accès :** Public
*   **Description :** Crée un nouveau compte utilisateur (professeur).
*   **Corps (`body`) :**
    ```json
    {
      "email": "professeur@example.com",
      "password": "unmotdepassesecurise"
    }
    ```
*   **Réponses :**
    *   **201 Created :** Utilisateur créé.
        ```json
        {
          "message": "Utilisateur créé avec succès.",
          "user": { "id": "64f9c8f...", "email": "professeur@example.com" }
        }
        ```
    *   **409 Conflict :** L'email est déjà utilisé.
    *   **500 Internal Error :** Erreur serveur lors de la création.

### `POST /api/auth/login`
*   **Accès :** Public
*   **Description :** Authentifie l'utilisateur et génère un jeton JWT.
*   **Corps (`body`) :** Identique au schéma d'inscription.
*   **Réponses :**
    *   **200 OK :** Connexion réussie, renvoie le token.
        ```json
        {
          "message": "Connexion réussie.",
          "token": "eyJhbGciOi...",
          "user": { "id": "64f9c8f...", "email": "professeur@example.com" }
        }
        ```
    *   **401 Unauthorized :** Identifiants invalides.

---

## 2. Profil Utilisateur (`/api/users`)

### `GET /api/users/profile`
*   **Accès :** Protégé (JWT)
*   **Description :** Récupère le profil de l'utilisateur connecté. Exclut les informations sensibles (mot de passe, token GitHub).
*   **Réponses :**
    *   **200 OK :** Profil récupéré.
        ```json
        {
          "_id": "64f9c8f...",
          "email": "professeur@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "avatarUrl": "https://github.com/..."
        }
        ```
    *   **401 Unauthorized :** Token manquant ou invalide.

### `PUT /api/users/profile`
*   **Accès :** Protégé (JWT)
*   **Description :** Met à jour les informations du profil de l'utilisateur connecté.
*   **Corps (`body`) :**
    ```json
    {
      "email": "nouveau@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "githubToken": "ghp_nouveauToken...",
      "password": "nouveauMotDePasseFacultatif"
    }
    ```
*   **Réponses :**
    *   **200 OK :** Profil mis à jour. Renvoie le document utilisateur modifié sans les champs confidentiels.

---

## 3. Projets (`/api/projects`)

### `POST /api/projects`
*   **Accès :** Protégé (JWT)
*   **Description :** Crée un nouveau projet académique.
*   **Corps :** FormData (Multipart) pour accepter le fichier de consignes.
    *   `name` (string) : Nom du projet
    *   `githubOrg` (string) : Organisation GitHub d'hébergement
    *   `minMembers` (number) : Taille minimale d'un groupe
    *   `maxMembers` (number) : Taille maximale d'un groupe
    *   `repoPattern` (string) : Structure de nom (ex: `projet-##`)
    *   `enrollmentEndDate` (date) : Date limite d'inscription
    *   `projectEndDate` (date) : Date limite de projet
    *   `file` (file, optionnel) : Fichier de consignes à pousser
*   **Réponses :**
    *   **201 Created :** Projet enregistré. Renvoie la fiche du projet créée.

### `GET /api/projects`
*   **Accès :** Protégé (JWT)
*   **Description :** Liste tous les projets appartenant au professeur connecté, incluant le décompte des groupes créés pour chacun d'eux.
*   **Réponses :**
    *   **200 OK :** Liste de projets.

### `GET /api/projects/:id`
*   **Accès :** Protégé (JWT)
*   **Description :** Récupère le détail d'un projet spécifique ainsi que la liste des groupes associés.
*   **Réponses :**
    *   **200 OK :** Renvoie `{ project: IProject, groups: IGroup[] }`.

### `PUT /api/projects/:id`
*   **Accès :** Protégé (JWT)
*   **Description :** Modifie la configuration d'un projet existant.
*   **Corps (`body`) :** Données à mettre à jour (JSON).
*   **Réponses :**
    *   **200 OK :** Renvoie le projet modifié.

### `DELETE /api/projects/:id`
*   **Accès :** Protégé (JWT)
*   **Description :** Supprime définitivement un projet. Cette action supprime également en cascade les groupes associés, ainsi que les équipes et les dépôts de l'organisation GitHub.
*   **Réponses :**
    *   **200 OK :** `{ "message": "Projet supprimé avec succès." }`

---

## 4. Groupes et Accès Public (`/api/groups`)

### `GET /api/groups/details/:projectId/:accessKey`
*   **Accès :** Public
*   **Description :** Affiche de manière sécurisée les détails d'un projet pour l'inscription des étudiants, à partir du lien de partage (ID et clé d'accès). Exclut le token ou l'identifiant du propriétaire du projet.
*   **Réponses :**
    *   **200 OK :** Fiche projet trouvée.
    *   **404 Not Found :** Projet introuvable.

### `POST /api/groups/join/:projectId/:accessKey`
*   **Accès :** Public
*   **Description :** Inscrit une équipe d'étudiants. Crée le dépôt privé, configure les permissions de push de l'équipe sur GitHub, déploie le fichier de consignes à la racine (`CONSIGNES.md`) et enregistre le groupe en base de données.
*   **Corps (`body`) :**
    ```json
    {
      "members": [
        {
          "lastName": "Dupont",
          "firstName": "Pierre",
          "matricule": "12345",
          "githubUsername": "pierredupont"
        }
      ]
    }
    ```
*   **Réponses :**
    *   **201 Created :** Équipe et dépôt créés avec succès.
        ```json
        {
          "message": "Groupe \"projet-01\" et dépôt créés avec succès !",
          "repoUrl": "https://github.com/org/projet-01"
        }
        ```
    *   **400 Bad Request :** Nombre de membres invalide ou nom d'utilisateur GitHub inexistant.
    *   **409 Conflict :** Un étudiant fait déjà partie d'un autre groupe de ce projet.

---

## 5. API GitHub intégrée (`/api/github`)

### `GET /api/github/orgs`
*   **Accès :** Protégé (JWT)
*   **Description :** Récupère les organisations GitHub du professeur connecté (nécessite d'avoir renseigné un token valide dans le profil).
*   **Réponses :**
    *   **200 OK :** Renvoie un tableau d'organisations `[{ "login": "org", "avatar_url": "..." }]`.