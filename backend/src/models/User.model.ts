// /backend/src/models/User.model.ts
import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. On importe l'interface depuis notre dossier partagé
import type { IUser } from '@shared/types/index.ts';

// 2. On crée le schéma en le liant à l'interface importée
const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    githubToken: { type: String, select: false },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatarUrl: { type: String },
}, {
    timestamps: true,
});

// 3. On attache le middleware de hachage du mot de passe
userSchema.pre('save', async function(next) {
    // Dans ce contexte, 'this' est un document Mongoose complet qui a la méthode 'isModified'.
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        if (error instanceof Error) {
            return next(error);
        }
        // Gérer le cas où l'erreur n'est pas une instance de Error
        return next(new Error('Erreur de hachage de mot de passe'));
    }
});

// 4. On crée et on exporte le modèle, toujours en le liant à l'interface
const User = model<IUser>('User', userSchema);

export default User;