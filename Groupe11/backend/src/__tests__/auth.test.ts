// /backend/src/__tests__/auth.test.ts
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

// On importe les routes et le modèle User pour pouvoir le manipuler
import authRoutes from '../api/auth.routes.js';
import User from '../models/User.model.js';

// --- CONFIGURATION DE L'ENVIRONNEMENT DE TEST ---

let mongoServer: MongoMemoryServer;
const app = express();

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', authRoutes);
});

// "afterEach" s'exécute après chaque test 'it'
// C'est parfait pour nettoyer la base de données entre chaque scénario
afterEach(async () => {
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// --- ÉCRITURE DES TESTS ---

describe('POST /api/auth/register', () => {
    it('devrait inscrire un nouvel utilisateur avec succès', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Utilisateur créé avec succès.');
    });

    it('devrait échouer si l\'email existe déjà', async () => {
        // D'abord, on crée un utilisateur
        await request(app).post('/api/auth/register').send({ email: 'test@example.com', password: 'password123' });

        // Ensuite, on essaie de le recréer
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@example.com', password: 'password456' });

        expect(response.status).toBe(409);
    });
});


// --- NOUVEAUX TESTS POUR LA CONNEXION ---

describe('POST /api/auth/login', () => {

    // Avant chaque test de ce bloc, on s'assure qu'un utilisateur existe
    beforeEach(async () => {
        await request(app).post('/api/auth/register').send({ email: 'user@test.com', password: 'goodpassword' });
    });

    // Scénario 1 : Succès
    it('devrait connecter un utilisateur avec les bons identifiants et renvoyer un token', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: 'goodpassword' });

        // On vérifie que la réponse est 200 OK
        expect(response.status).toBe(200);
        // On vérifie que la réponse contient bien une propriété "token"
        expect(response.body).toHaveProperty('token');
    });

    // Scénario 2 : Mauvais mot de passe
    it('devrait échouer la connexion si le mot de passe est incorrect', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: 'wrongpassword' });

        // On vérifie que la réponse est bien 401 Unauthorized
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Identifiants invalides.');
    });

    // Scénario 3 : Mauvais email
    it('devrait échouer la connexion si l\'email n\'existe pas', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nouser@test.com', password: 'goodpassword' });

        // On vérifie que la réponse est bien 401 Unauthorized
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Identifiants invalides.');
    });

    it('devrait échouer avec une erreur 400 si l\'email est invalide', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: 'emailinvalide', password: 'password123' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Erreur de validation.");
    });

});