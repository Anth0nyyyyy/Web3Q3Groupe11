// src/server.ts
import express from 'express';
import cors from 'cors';
import connectDB from './config/index.js';
import authRoutes from './api/auth.routes.js';
import projectRoutes from './api/project.routes.js';
import groupRoutes from './api/group.routes.js';
import userRoutes from './api/user.routes.js';
import helmet from 'helmet';

// Initialisation de la connexion à la base de données
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares essentiels
app.use(cors()); // Autorise les requêtes depuis d'autres origines (notre frontend)
app.use(helmet());
app.use(express.json()); // Permet de parser le JSON des requêtes entrantes
app.use(express.urlencoded({ extended: true }));
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);

// Route de test simple pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.send('🎉 Le serveur du projet Web 3 HELHa fonctionne !');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});