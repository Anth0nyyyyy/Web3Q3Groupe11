// /backend/scripts/create-user.ts
import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../models/User.model.js';

const createUser = async () => {
    // 1. Récupérer les arguments depuis la ligne de commande
    // process.argv contient : [ 'node', 'create-user.ts', 'email', 'password', 'githubToken' ]
    const args = process.argv.slice(2);
    const [email, password, githubToken] = args;

    // 2. Valider que tous les arguments sont présents
    if (!email || !password || !githubToken) {
        console.error('ERREUR: Utilisation incorrecte du script.');
        console.log('Usage: npm run create-user -- <email> <password> <githubToken>');
        process.exit(1);
    }

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('Erreur: MONGO_URI n\'est pas défini dans le .env');
        process.exit(1);
    }

    try {
        console.log('Connexion à la base de données...');
        await mongoose.connect(mongoUri);
        console.log(' -> Connexion réussie.');

        // 3. Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.warn(`AVERTISSEMENT: Un utilisateur avec l'email "${email}" existe déjà.`);
            await mongoose.disconnect();
            process.exit();
        }

        // 4. Créer le nouvel utilisateur
        console.log(`Création de l'utilisateur : ${email}...`);
        const newUser = new User({
            email: email,
            password: password,      // Sera haché automatiquement par le modèle
            githubToken: githubToken,
            // Pas de rôle, c'est un professeur standard
        });

        await newUser.save();
        console.log(' -> Utilisateur créé avec succès !');

    } catch (error) {
        console.error('ERREUR LORS DE LA CRÉATION DE L\'UTILISATEUR:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Déconnexion de la base de données.');
        process.exit();
    }
};

createUser();