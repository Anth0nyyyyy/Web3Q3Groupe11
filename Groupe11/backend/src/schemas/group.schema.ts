import { z } from 'zod';

const memberSchema = z.object({
    lastName: z.string().nonempty(),
    firstName: z.string().nonempty(),
    githubUsername: z.string().nonempty(),
    matricule: z.string().nonempty(),
});

export const createGroupSchema = z.object({
    body: z.object({
        members: z.array(memberSchema).min(1, "L'équipe doit contenir au moins un membre."),
    }),
    params: z.object({
        projectId: z.string(),
        accessKey: z.string(),
    }),
});