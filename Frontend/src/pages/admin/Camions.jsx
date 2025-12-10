import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';

const AdminCamions = () => {
    const { get, loading, error } = useAxios();
    const [camions, setCamions] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await get('/admin/camions');
                if (!cancelled) setCamions(res?.data || []);
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
                <h1 className="text-xl font-semibold text-gray-900">Camions</h1>
                <p className="mt-1 text-sm text-gray-600">Liste des camions.</p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Immatriculation</div>
                    <div>Statut</div>
                    <div>Kilométrage</div>
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Chargement...</div>
                ) : camions.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Aucun camion.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {camions.map((c) => (
                            <div key={c._id} className="grid grid-cols-3 px-4 py-3 text-sm text-gray-800">
                                <div className="truncate">{c.immatriculation || '—'}</div>
                                <div className="truncate">{c.statut}</div>
                                <div className="truncate">{c.kilometrage ?? '—'}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCamions;
