// /shared/src/types/index.ts
// Ce fichier est la source de vérité pour les FORMES de nos données.

// --- PSEUDO-TYPES POUR LA COMPATIBILITÉ ---
// On simule les types de Mongoose pour que le frontend n'ait pas besoin d'installer mongoose.
// Ce sont juste des "alias" pour TypeScript.
type ObjectId = string; // Pour le frontend, un ObjectId est juste une string.
interface Document {} // On déclare une interface vide.

// --- TYPES PARTAGÉS ---

export interface ITeamMember {
    lastName: string;
    firstName: string;
    githubUsername: string;
    matricule: string;
}

export interface IUser extends Document {
    _id: ObjectId; // On ajoute explicitement _id
    email: string;
    password?: string;
    githubToken?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}

export interface IProject extends Document {
    _id: ObjectId;
    name: string;
    githubOrg: string;
    minMembers: number;
    maxMembers: number;
    repoPattern: string;
    accessKey: string;
    owner: ObjectId | IUser; // Le 'string' n'est plus nécessaire car ObjectId EST une string.
    instructionsContent?: string;
    enrollmentEndDate?: Date;
    projectEndDate?: Date;
    groupCount?: number;
}

export interface IGroup extends Document {
    _id: ObjectId;
    name: string;
    project: ObjectId | IProject;
    members: ITeamMember[];
    repoUrl?: string;
}