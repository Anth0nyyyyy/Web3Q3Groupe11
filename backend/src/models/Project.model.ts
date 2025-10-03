// /backend/src/models/Project.model.ts
import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';
import type { IUser } from './User.model.js';

// 1. Définir l'Interface qui représente un document Projet
// C'est la "forme" que TypeScript utilisera.
export interface IProject extends Document {
    name: string;
    githubOrg: string;
    minMembers: number;
    maxMembers: number;
    repoPattern: string;
    accessKey: string;
    // 'owner' peut être juste un ID, ou l'objet User complet si on utilise .populate()
    owner: Schema.Types.ObjectId | IUser;
}

// 2. Créer le Schéma correspondant à l'Interface
// C'est le "plan de construction" pour Mongoose.
const projectSchema = new Schema<IProject>({
    name: { type: String, required: true, trim: true },
    githubOrg: { type: String, required: true, trim: true },
    minMembers: { type: Number, required: true, min: 1 },
    maxMembers: { type: Number, required: true, min: 1 },
    repoPattern: { type: String, default: 'projet-##' },
    accessKey: { type: String, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// 3. Ajouter le Middleware (hook) avant la sauvegarde
projectSchema.pre('save', function(next) {
    // 'this' fait référence au document qui va être sauvegardé
    if (this.isNew && !this.accessKey) {
        this.accessKey = crypto.randomBytes(16).toString('hex');
    }
    next();
});

// 4. Créer le Modèle à partir du Schéma et de l'Interface
const Project = model<IProject>('Project', projectSchema);

// 5. Exporter le Modèle
export default Project;