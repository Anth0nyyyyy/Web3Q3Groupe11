# Documentation de l'API

Ce document décrit les différentes routes (endpoints) de l'API backend du projet.

**URL de base de l'API (en développement) :** `http://localhost:4000`

---

## Authentification (`/api/auth`)

Routes relatives à l'inscription et à la connexion des utilisateurs (professeurs).

### `POST /api/auth/register`

**Description :** Crée un nouvel utilisateur (professeur).

**Corps de la requête (`body`) :**
```json
{
  "email": "professeur@example.com",
  "password": "unmotdepassesecurise"
}
Réponses possibles :

201 Created : L'utilisateur a été créé avec succès.

