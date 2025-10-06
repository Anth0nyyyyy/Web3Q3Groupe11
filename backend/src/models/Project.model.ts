// /backend/src/models/Project.model.ts
import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';
import type { IUser } from './User.model.js';

// 1. Définir l'Interface qui représente un document Projet
export interface IProject extends Document {
    name: string;
    githubOrg: string;
    minMembers: number;
    maxMembers: number;
    repoPattern: string;
    accessKey: string;
    enrollmentEndDate?: Date;
    projectEndDate?: Date;

    // --- CORRECTION : On autorise 'string' comme type valide pour 'owner' ---
    owner: Schema.Types.ObjectId | IUser | string;

    instructionsContent?: string;
}

// 2. Créer le Schéma correspondant à l'Interface
const projectSchema = new Schema<IProject>({
    name: { type: String, required: true, trim: true },
    githubOrg: { type: String, required: true, trim: true },
    minMembers: { type: Number, required: true, min: 1 },
    maxMembers: { type: Number, required: true, min: 1 },
    repoPattern: { type: String, default: 'Web3-Groupe-##' },
    accessKey: { type: String, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instructionsContent: { type: String },
    enrollmentEndDate: { type: Date },
    projectEndDate: { type: Date },
}, { timestamps: true });

// 3. Ajouter le Middleware (hook) avant la sauvegarde
projectSchema.pre('save', function(next) {
    if (this.isNew && !this.accessKey) {
        this.accessKey = crypto.randomBytes(16).toString('hex');
    }
    next();
});

// 4. Créer le Modèle à partir du Schéma et de l'Interface
const Project = model<IProject>('Project', projectSchema);

// 5. Exporter le Modèle
export default Project;