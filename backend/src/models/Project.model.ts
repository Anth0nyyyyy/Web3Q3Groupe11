// /backend/src/models/Project.model.ts
import { Schema, model } from 'mongoose';
import crypto from 'crypto';

const projectSchema = new Schema({
    name: { type: String, required: true },
    githubOrg: { type: String, required: true },
    minMembers: { type: Number, required: true, min: 1 },
    maxMembers: { type: Number, required: true, min: 1 },
    repoPattern: { type: String, required: true, default: 'projet-##' },

    // La clé secrète pour l'URL de partage
    accessKey: { type: String, unique: true },

    // Le lien vers le professeur qui a créé le projet
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Middleware pour générer la clé d'accès avant de sauvegarder
projectSchema.pre('save', function(next) {
    if (this.isNew) {
        // Génère 16 octets aléatoires et les convertit en une chaîne hexadécimale de 32 caractères
        this.accessKey = crypto.randomBytes(16).toString('hex');
    }
    next();
});

const Project = model('Project', projectSchema);
export default Project;