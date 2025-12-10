import { Navigate, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import InactiveChauffeur from '../pages/InactiveChauffeur';
import ChauffeurLayout from '../layouts/ChauffeurLayout';
import ChauffeurDashboard from '../pages/chauffeur/Dashboard';
import MyTrajets from '../pages/chauffeur/MyTrajets';

export const ChauffeurRoutes = () => {
    return (
        <>
            <Route
                path="/chauffeur/inactive"
                element={
                    <ProtectedRoute allowedRoles={['chauffeur']} allowInactive>
                        <InactiveChauffeur />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/chauffeur"
                element={
                    <ProtectedRoute allowedRoles={['chauffeur']}>
                        <ChauffeurLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/chauffeur/dashboard" replace />} />
                <Route path="dashboard" element={<ChauffeurDashboard />} />
                <Route path="trajets" element={<MyTrajets />} />
            </Route>
        </>
    );
};
