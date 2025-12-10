import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';

const AdminPneus = () => {
    const { get, loading, error } = useAxios();
    const [pneus, setPneus] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await get('/admin/pneus');
                if (!cancelled) setPneus(res?.data || []);
            } catch {
                // handled by hook
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [get]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Pneus</h1>
                <p className="mt-1 text-sm text-gray-600">Liste des pneus.</p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Référence</div>
                    <div>Kilométrage</div>
                    <div>Usure</div>
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Chargement...</div>
                ) : pneus.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Aucun pneu.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {pneus.map((p) => (
                            <div key={p._id} className="grid grid-cols-3 px-4 py-3 text-sm text-gray-800">
                                <div className="truncate">{p.reference || p._id}</div>
                                <div className="truncate">{p.kilometrage ?? '—'}</div>
                                <div className="truncate">{p.usure !== undefined ? `${Math.round(p.usure)}%` : '—'}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPneus;
