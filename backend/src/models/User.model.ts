// /backend/src/models/User.model.ts
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password?: string;
    githubToken?: string;
}

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
}, {
    timestamps: true,
});

userSchema.pre('save', async function(next) {
    // 'this' fait référence au document User en cours de sauvegarde
    const user = this as IUser;

    if (!user.isModified('password') || !user.password) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        // À ce stade, TypeScript est sûr que user.password est une string
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        // Si le hachage échoue, on passe l'erreur à Mongoose
        if (error instanceof Error) {
            next(error);
        }
    }
});

const User = model<IUser>('User', userSchema);

export default User;