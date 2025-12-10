import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';

const AdminChauffeurs = () => {
    const { get, loading, error } = useAxios();
    const { put } = useAxios();
    const [chauffeurs, setChauffeurs] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);
    const [actionError, setActionError] = useState(null);

    const normalizeErrorMessage = (message) => {
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string' && message.trim()) return message;
        return 'Impossible de mettre à jour le statut.';
    };

    const updateStatus = async (chauffeurId, status) => {
        setActionError(null);
        setUpdatingId(chauffeurId);
        try {
            const res = await put(`/admin/chauffeurs/${chauffeurId}`, { status });
            const updated = res?.data;
            setChauffeurs((prev) =>
                prev.map((c) => (c._id === chauffeurId ? (updated ? updated : { ...c, status }) : c))
            );
        } catch (e) {
            setActionError(normalizeErrorMessage(e?.response?.data?.message));
        } finally {
            setUpdatingId(null);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await get('/admin/chauffeurs');
                if (!cancelled) setChauffeurs(res?.data || []);
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
                <h1 className="text-xl font-semibold text-gray-900">Chauffeurs</h1>
                <p className="mt-1 text-sm text-gray-600">Liste des chauffeurs.</p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {actionError}
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Nom</div>
                    <div>Email</div>
                    <div>Statut</div>
                    <div className="text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Chargement...</div>
                ) : chauffeurs.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Aucun chauffeur.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {chauffeurs.map((c) => (
                            <div key={c._id} className="grid grid-cols-4 items-center px-4 py-3 text-sm text-gray-800">
                                <div className="truncate">{c.user?.name || '—'}</div>
                                <div className="truncate">{c.user?.email || '—'}</div>
                                <div className="truncate">
                                    <span
                                        className={
                                            c.status === 'actif'
                                                ? 'rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700'
                                                : 'rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'
                                        }
                                    >
                                        {c.status}
                                    </span>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        disabled={updatingId === c._id || c.status === 'actif'}
                                        onClick={() => updateStatus(c._id, 'actif')}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Activer
                                    </button>
                                    <button
                                        type="button"
                                        disabled={updatingId === c._id || c.status === 'inactif'}
                                        onClick={() => updateStatus(c._id, 'inactif')}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Inactiver
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChauffeurs;
