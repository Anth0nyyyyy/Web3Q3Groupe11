// /frontend/src/types/index.ts

// Type pour un membre d'équipe (déjà existant)
export interface TeamMember {
    lastName: string;
    firstName: string;
    githubUsername: string;
    matricule: string;
}

// --- NOUVEAUX TYPES ---

// Interface pour un Groupe (côté frontend)
export interface IGroup {
    _id: string;
    name: string;
    members: TeamMember[];
    repoUrl?: string;
}

// Interface pour un Projet (côté frontend)
export interface IProject {
    _id: string;
    name: string;
    githubOrg: string;
    minMembers: number;
    maxMembers: number;
    repoPattern: string;
    accessKey: string;
    enrollmentEndDate?: Date;
    projectEndDate?: Date;
}