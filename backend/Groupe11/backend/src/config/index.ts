    import mongoose from 'mongoose';
import 'dotenv/config'; // Permet de charger les variables de .env

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('Erreur: La variable MONGO_URI n\'est pas définie dans le fichier ..env');
        process.exit(1); // Arrête l'application si la variable n'est pas trouvée
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connexion à MongoDB établie avec succès !');
    } catch (error) {
        console.error('❌ Erreur de connexion à MongoDB:', error);
        process.exit(1); // Arrête l'application en cas d'échec de connexion
    }
};

export default connectDB;