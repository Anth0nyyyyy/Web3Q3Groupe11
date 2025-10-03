// /backend/src/models/Group.model.ts
import { Schema, model, Document } from 'mongoose';
import type { IProject } from './Project.model.js';

// On définit une interface pour un membre, qui correspond à celle du frontend
interface ITeamMember {
    lastName: string;
    firstName: string;
    githubUsername: string;
    matricule: string;
}

// L'interface pour notre document Group
export interface IGroup extends Document {
    name: string;
    project: IProject['_id'];
    members: ITeamMember[];
    repoUrl?: string; // L'URL du dépôt GitHub, une fois créé
}

// Un sous-schéma pour les membres
const memberSchema = new Schema<ITeamMember>({
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    githubUsername: { type: String, required: true },
    matricule: { type: String, required: true },
}, { _id: false }); // Pas besoin d'un ID unique pour chaque membre

const groupSchema = new Schema<IGroup>({
    name: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    members: [memberSchema], // Un tableau de membres
    repoUrl: { type: String },
}, { timestamps: true });

const Group = model<IGroup>('Group', groupSchema);
export default Group;