// /backend/src/__tests__/project.test.ts
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Les routes à tester
import projectRoutes from '../api/project.routes.js';
// On a besoin des routes d'auth pour créer des utilisateurs
import authRoutes from '../api/auth.routes.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';

// --- CONFIGURATION DE L'ENVIRONNEMENT DE TEST ---

let mongoServer: MongoMemoryServer;
const app = express();

let testUser: any;
let testToken: string;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app.use(cors());
    app.use(express.json());
    // On expose les deux ensembles de routes
    app.use('/api/auth', authRoutes);
    app.use('/api/projects', projectRoutes);
});

// Avant chaque test, on nettoie les BDD et on crée un utilisateur de test
beforeEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});

    // On crée un professeur de test
    await request(app).post('/api/auth/register').send({
        email: 'prof1@test.com',
        password: 'password123'
    });

    // On le connecte pour obtenir son token et son ID
    const loginRes = await request(app).post('/api/auth/login').send({
        email: 'prof1@test.com',
        password: 'password123'
    });

    testUser = loginRes.body.user;
    testToken = loginRes.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// --- ÉCRITURE DES TESTS POUR LES PROJETS ---

describe('Project API (/api/projects)', () => {

    // Test de sécurité : accès sans token
    it('devrait refuser l\'accès sans token JWT (erreur 401)', async () => {
        const response = await request(app).get('/api/projects');
        expect(response.status).toBe(401);
    });

    // Test de création de projet
    it('devrait créer un nouveau projet pour l\'utilisateur connecté', async () => {
        const response = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${testToken}`) // On envoie le token
            .send({
                name: "Mon Projet Test",
                githubOrg: "MonOrga",
                minMembers: 1,
                maxMembers: 3
            });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe("Mon Projet Test");
        expect(response.body.owner).toBe(testUser.id); // On vérifie que le projet appartient bien au bon prof
    });

    // Test de récupération de projets
    it('devrait récupérer la liste des projets appartenant à l\'utilisateur connecté', async () => {
        // On crée d'abord un projet pour être sûr qu'il y a quelque chose à récupérer
        await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ name: "Projet A", githubOrg: "Orga", minMembers: 1, maxMembers: 1 });

        // On effectue la requête de récupération
        const response = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true); // La réponse doit être un tableau
        expect(response.body.length).toBe(1); // Il ne doit y avoir qu'un seul projet
        expect(response.body[0].name).toBe("Projet A");
    });

});