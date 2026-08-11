// /backend/src/middlewares/validate.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodObject<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Erreur de validation.",
                    // CORRECTION : La propriété correcte est 'issues' et non 'errors'
                    issues: error.issues.map((issue: z.ZodIssue) => ({
                        path: issue.path.join('.'),
                        message: issue.message
                    })),
                });
            }
            res.status(500).json({ message: "Erreur interne du serveur." });
        }
    };