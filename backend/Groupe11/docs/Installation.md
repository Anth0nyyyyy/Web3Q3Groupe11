# Documentation d'Installation du Projet Web 3 HELHa

Ce document explique comment installer, configurer et lancer l'application en environnement de développement local.

## 1. Prérequis

Avant de commencer, assurez-vous d'avoir les outils suivants installés sur votre machine :

* Node.js (version 18 ou supérieure recommandée)
* npm (généralement inclus avec Node.js)
* Docker Desktop
* Git

## 2. Installation

### Étape 2.1 : Cloner le Dépôt

Clonez ce projet sur votre machine locale à l'aide de Git. Remplacez [URL_DU_DEPOT] par l'URL de votre dépôt GitHub.

```bash
git clone [URL_DU_DEPOT]
cd project_web_b3_temp
```

### Étape 2.2 : Lancer la Base de Données

L'application utilise une base de données MongoDB gérée par Docker.

1. Assurez-vous que Docker Desktop est bien en cours d'exécution.
2. À la racine du projet, lancez la commande suivante pour démarrer le conteneur de la base de données en arrière-plan :

```bash
docker compose up -d
```

## 3. Configuration

L'application nécessite des variables d'environnement pour fonctionner, notamment pour se connecter à la base de données et sécuriser l'authentification.

### Étape 3.1 : Configurer le Backend

1. Naviguez dans le dossier backend :

```bash
cd backend
```

2. Créez une copie du fichier d'exemple .env.example et nommez-la .env.
    * Sur **Windows** (PowerShell) :

```powershell
copy .env.example .env
```

* Sur **macOS / Linux** :

```bash
cp ..env.example ..env
```

3. Ouvrez le nouveau fichier .env et remplissez les variables :
    * MONGO_URI : La valeur par défaut est déjà correcte pour l'environnement Docker local. Ne la modifiez pas.
    * JWT_SECRET : Générez une chaîne de caractères longue et aléatoire pour sécuriser les tokens de session. Vous pouvez utiliser la commande Node.js suivante dans votre terminal :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat dans le fichier .env.

* DEV_GITHUB_TOKEN : Pour le développement, l'application utilise un token de secours. Créez un Personal Access Token (PAT) sur GitHub avec les permissions **repo** et **admin:org**, puis collez-le ici. **IMPORTANT :** Ce token est très sensible. Ne le partagez jamais et ne le commitez pas sur Git.

## 4. Lancement de l'Application

L'application est composée de deux parties (frontend et backend) qui doivent être lancées dans des terminaux séparés.

### Étape 4.1 : Lancer le Serveur Backend

1. Ouvrez un premier terminal à la racine du projet.
2. Naviguez dans le dossier backend :

```bash
cd backend
```

3. Installez les dépendances :

```bash
npm install
```

4. Lancez le serveur de développement :

```bash
npm run dev
```

Le terminal devrait afficher que le serveur a démarré avec succès sur http://localhost:4000. Laissez ce terminal ouvert.

### Étape 4.2 : Lancer l'Application Frontend

1. Ouvrez un **nouveau terminal** (ne fermez pas le premier).
2. Naviguez dans le dossier frontend :

```bash
cd frontend
```

3. Installez les dépendances :

```bash
npm install
```

4. Lancez le serveur de développement :

```bash
npm run dev
```

Le terminal vous indiquera l'adresse sur laquelle l'application est accessible (généralement http://localhost:5173).

Vous pouvez maintenant ouvrir http://localhost:5173 dans votre navigateur pour utiliser l'application.