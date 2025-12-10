import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex flex-col gap-6 md:flex-row">
                    <AdminSidebar />

                    <main className="flex-1">
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
