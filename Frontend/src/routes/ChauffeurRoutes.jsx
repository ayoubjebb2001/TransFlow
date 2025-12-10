import { Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import InactiveChauffeur from '../pages/InactiveChauffeur';

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
        </>
    );
};
