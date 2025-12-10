import { Navigate, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminChauffeurs from '../pages/admin/Chauffeurs';
import AdminCamions from '../pages/admin/Camions';
import AdminRemorques from '../pages/admin/Remorques';
import AdminPneus from '../pages/admin/Pneus';
import AdminTrajets from '../pages/admin/Trajets';
import AdminMaintenance from '../pages/admin/Maintenance';

export const AdminRoutes = () => {
    return (
        <>
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="chauffeurs" element={<AdminChauffeurs />} />
                <Route path="camions" element={<AdminCamions />} />
                <Route path="remorques" element={<AdminRemorques />} />
                <Route path="pneus" element={<AdminPneus />} />
                <Route path="trajets" element={<AdminTrajets />} />
                <Route path="maintenance" element={<AdminMaintenance />} />
            </Route>
        </>
    );
};
