import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Bienvenue{user?.name ? `, ${user.name}` : ''}.
                </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-sm font-medium text-gray-900">Raccourcis</div>
                <p className="mt-1 text-sm text-gray-600">
                    Utilisez la sidebar pour gérer les ressources.
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
