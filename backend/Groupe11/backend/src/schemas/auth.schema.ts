// /backend/src/schemas/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        // On définit le type, PUIS les règles de validation avec leurs messages.
        email: z.string().nonempty("L'email est requis.").email("Format d'email invalide."),

        password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().nonempty("L'email est requis.").email("Format d'email invalide."),
        password: z.string().nonempty("Le mot de passe est requis."),
    }),
});