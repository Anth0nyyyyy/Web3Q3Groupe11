// /frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// On définit la structure de notre contexte
interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

// On crée le contexte
const AuthContext = createContext<AuthContextType | null>(null);

// On crée le "Provider", le composant qui va envelopper notre application
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Au chargement de l'application, on vérifie si un token existe déjà
    useEffect(() => {
        const token = localStorage.getItem('user_token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('user_token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('user_token');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// On crée un "hook" personnalisé pour utiliser facilement notre contexte
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};