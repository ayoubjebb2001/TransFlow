import { useEffect, useMemo, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';

const AdminTrajets = () => {
    const { get, loading, error } = useAxios();
    const [trajets, setTrajets] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await get('/admin/trajets');
                if (!cancelled) setTrajets(res?.data || []);
            } catch {
                // handled by hook
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [get]);

    const stats = useMemo(() => {
        const counts = { termine: 0, en_cours: 0, a_faire: 0 };
        for (const t of trajets) {
            if (t?.statut === 'terminé') counts.termine += 1;
            else if (t?.statut === 'en_cours') counts.en_cours += 1;
            else if (t?.statut === 'à faire') counts.a_faire += 1;
        }
        return counts;
    }, [trajets]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Trajets</h1>
                <p className="mt-1 text-sm text-gray-600">Liste des trajets.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="text-xs font-medium text-gray-500">Terminés</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{loading ? '—' : stats.termine}</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="text-xs font-medium text-gray-500">En cours</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{loading ? '—' : stats.en_cours}</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="text-xs font-medium text-gray-500">À faire</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{loading ? '—' : stats.a_faire}</div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Départ</div>
                    <div>Arrivée</div>
                    <div>Statut</div>
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Chargement...</div>
                ) : trajets.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Aucun trajet.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {trajets.map((t) => (
                            <div key={t._id} className="grid grid-cols-3 px-4 py-3 text-sm text-gray-800">
                                <div className="truncate">{t.depart}</div>
                                <div className="truncate">{t.arrivee}</div>
                                <div className="truncate">{t.statut}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTrajets;
