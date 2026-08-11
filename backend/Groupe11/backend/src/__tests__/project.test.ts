// /backend/src/__tests__/project.test.ts
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

import authRoutes from '../api/auth.routes.js';
import projectRoutes from '../api/project.routes.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';

let mongoServer: MongoMemoryServer;
const app = express();

// On va simuler deux professeurs différents
let prof1Token: string;
let prof2Token: string;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/projects', projectRoutes);
});

beforeEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});

    // Créer et connecter le prof 1
    await request(app).post('/api/auth/register').send({ email: 'prof1@test.com', password: 'password123' });
    const res1 = await request(app).post('/api/auth/login').send({ email: 'prof1@test.com', password: 'password123' });
    prof1Token = res1.body.token;

    // Créer et connecter le prof 2
    await request(app).post('/api/auth/register').send({ email: 'prof2@test.com', password: 'password123' });
    const res2 = await request(app).post('/api/auth/login').send({ email: 'prof2@test.com', password: 'password123' });
    prof2Token = res2.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Project API (/api/projects)', () => {
    it('devrait refuser l\'accès sans token JWT (401)', async () => {
        const response = await request(app).post('/api/projects').send({});
        expect(response.status).toBe(401);
    });

    it('devrait permettre à un professeur connecté de créer un projet', async () => {
        const response = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${prof1Token}`)
            .send({
                name: "Projet du Prof 1",
                githubOrg: "Orga1",
                minMembers: 1,
                maxMembers: 3
            });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe("Projet du Prof 1");
    });

    it('devrait permettre à un professeur de lister UNIQUEMENT ses propres projets', async () => {
        // Le prof 1 crée un projet
        await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${prof1Token}`)
            .send({ name: "Projet du Prof 1", githubOrg: "Orga1", minMembers: 1, maxMembers: 3 });

        // Le prof 2 crée un projet
        await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${prof2Token}`)
            .send({ name: "Projet du Prof 2", githubOrg: "Orga2", minMembers: 1, maxMembers: 3 });

        // On se connecte en tant que prof 1 et on liste les projets
        const response = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${prof1Token}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1); // Il ne doit voir qu'un seul projet
        expect(response.body[0].name).toBe("Projet du Prof 1"); // Et ça doit être le sien
    });

    it('devrait empêcher un professeur de voir les détails du projet d\'un autre (403)', async () => {
        // Le prof 1 crée un projet
        const createRes = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${prof1Token}`)
            .send({ name: "Projet Secret", githubOrg: "Orga1", minMembers: 1, maxMembers: 3 });

        const projectId = createRes.body._id;

        // Le prof 2 essaie d'accéder à ce projet
        const response = await request(app)
            .get(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${prof2Token}`);

        expect(response.status).toBe(403); // Forbidden
    });
});