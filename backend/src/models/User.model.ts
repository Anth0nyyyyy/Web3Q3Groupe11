// /backend/src/models/User.model.ts

import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Définition du Schéma
const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        unique: true, // L'email doit être unique dans la collection
        lowercase: true, // Convertit l'email en minuscules avant de le sauvegarder
        trim: true, // Supprime les espaces au début et à la fin
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
        select: false, // TRÈS IMPORTANT: le mot de passe ne sera jamais renvoyé par les requêtes
    },
}, {
    // 2. Options du Schéma
    timestamps: true, // Ajoute automatiquement les champs createdAt et updatedAt
});

// 3. Middleware "pre-save" pour hacher le mot de passe
// Cette fonction sera exécutée automatiquement AVANT qu'un utilisateur soit sauvegardé
userSchema.pre('save', async function(next) {
    // On ne hache le mot de passe que s'il a été modifié (ou s'il est nouveau)
    if (!this.isModified('password')) {
        return next();
    }

    // Génère un "sel" pour renforcer le hachage
    const salt = await bcrypt.genSalt(10);
    // Hache le mot de passe avec le sel
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export interface IUser extends Document {
    email: string;
    password?: string; // Le '?' car il est parfois non sélectionné
    githubToken?: string; // Le '?' car il est optionnel et non sélectionné
}

// 4. Création et Exportation du Modèle
const User = model('User', userSchema);



export default User;