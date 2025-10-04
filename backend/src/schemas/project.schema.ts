import { z } from 'zod';

export const createProjectSchema = z.object({
    body: z.object({
        name: z.string().nonempty("Le nom du projet est requis."),
        githubOrg: z.string().nonempty("L'organisation GitHub est requise."),
        minMembers: z.number().int().min(1, "Il doit y avoir au moins 1 membre minimum."),
        maxMembers: z.number().int().min(1, "Il doit y avoir au moins 1 membre maximum."),
        repoPattern: z.string().optional(), // Le pattern est optionnel
    }),
});