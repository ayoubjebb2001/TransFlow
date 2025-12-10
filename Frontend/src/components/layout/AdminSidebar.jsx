import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const linkBase =
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors';

const SidebarLink = ({ to, children }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `${linkBase} ${isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
            }
            end
        >
            {children}
        </NavLink>
    );
};

const AdminSidebar = () => {
    const { user, logout } = useAuth();

    return (
        <aside className="w-full md:w-72 md:shrink-0">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-4">
                    <div className="text-lg font-semibold text-gray-900">TransFlow</div>
                    <div className="text-sm text-gray-500">Admin</div>
                    {user?.email && (
                        <div className="mt-1 truncate text-xs text-gray-500">{user.email}</div>
                    )}
                </div>

                <nav className="space-y-1">
                    <SidebarLink to="/admin/dashboard">Dashboard</SidebarLink>
                    <SidebarLink to="/admin/chauffeurs">Chauffeurs</SidebarLink>
                    <SidebarLink to="/admin/camions">Camions</SidebarLink>
                    <SidebarLink to="/admin/remorques">Remorques</SidebarLink>
                    <SidebarLink to="/admin/pneus">Pneus</SidebarLink>
                    <SidebarLink to="/admin/trajets">Trajets</SidebarLink>
                    <SidebarLink to="/admin/maintenance">Maintenance</SidebarLink>
                </nav>

                <div className="mt-4 border-t border-gray-200 pt-4">
                    <button
                        type="button"
                        onClick={logout}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
