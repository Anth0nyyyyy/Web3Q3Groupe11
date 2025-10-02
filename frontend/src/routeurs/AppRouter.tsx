// /frontend/src/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.tsx';
import DashboardPage from '../pages/DashboardPage.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

// Un composant spécial pour protéger une route
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
    const { isAuthenticated } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* Si l'utilisateur est connecté et va sur /login, on le redirige au dashboard */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
                />

                {/* La route du dashboard est protégée par notre PrivateRoute */}
                <Route
                    path="/dashboard"
                    element={<PrivateRoute><DashboardPage /></PrivateRoute>}
                />

                {/* Route par défaut : si connecté -> dashboard, sinon -> login */}
                <Route
                    path="*"
                    element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;