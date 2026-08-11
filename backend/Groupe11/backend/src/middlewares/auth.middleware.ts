// /backend/src/middlewares/auth.middleware.ts
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

// On étend le type Request pour y ajouter notre propriété 'user'
declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
        }
    }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Non autorisé, token manquant.' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET non défini');

        const decoded = jwt.verify(token, secret) as { id: string };
        req.user = { id: decoded.id }; // On attache l'ID de l'utilisateur à la requête
        next(); // On passe au contrôleur suivant
    } catch (error) {
        return res.status(401).json({ message: 'Non autorisé, token invalide.' });
    }
};