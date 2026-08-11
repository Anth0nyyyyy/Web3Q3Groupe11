# Gestion des Processus en Arrière-plan et Tâches Planifiées (Crontab)

Ce document décrit les choix d'architecture concernant l'exécution des tâches de fond de l'application et la configuration de tâches planifiées (Cron Jobs).

---

## 1. Architecture Actuelle : Traitement en Temps Réel

Dans l'état actuel du projet, l'application utilise une architecture **événementielle et synchrone** [ref_0] :
*   Aucun processus d'arrière-plan permanent ou démon (daemon) n'est nécessaire.
*   La création des dépôts GitHub, l'association des membres et le téléversement des consignes se déclenchent **instantanément** lors de la soumission du formulaire d'inscription par les étudiants [ref_0].
*   Ce choix garantit que les étudiants disposent immédiatement de leur dépôt de travail sans délai d'attente.

---

## 2. Scénarios d'Évolution et Tâches Planifiées (Crontab)

Pour une mise en production à grande échelle au sein de la HELHa, plusieurs processus d'arrière-plan peuvent être configurés via des tâches planifiées standard (Cron).

### Scénario A : Archivage automatique des projets terminés
Afin de libérer de l'espace ou de verrouiller l'accès aux dépôts après la date de fin de projet (`projectEndDate`), un script d'arrière-plan peut être planifié pour s'exécuter chaque nuit à 2h00 du matin.

#### 1. Script d'archivage backend (`/backend/src/scripts/archive-expired.ts`)
Ce script interroge la base de données MongoDB, trouve les projets dont la date de fin est dépassée, et utilise l'API GitHub pour passer les dépôts correspondants en mode `archived: true`.

#### 2. Configuration de la Crontab (Linux / Serveur Propre)
Pour configurer l'exécution automatique de ce script sur un serveur dédié, vous devez éditer la table des tâches cron de l'utilisateur système :

```bash
crontab -e


0 2 * * * cd /chemin/vers/votre/projet/backend && /usr/bin/npm run archive-expired >> /var/log/projet_web3_archive.log 2>&1
