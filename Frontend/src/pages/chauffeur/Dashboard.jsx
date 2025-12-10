import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAxios } from '../../hooks/useAxios';

const ChauffeurDashboard = () => {
    const { user } = useAuth();
    const { get, loading, error } = useAxios();
    const [trajets, setTrajets] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await get('/chauffeur/trajets');
                const data = res?.data || [];
                if (!cancelled) setTrajets(data);
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

    const prochainTrajet = useMemo(() => {
        const aFaire = trajets
            .filter((t) => t?.statut === 'à faire')
            .slice()
            .sort((a, b) => {
                const da = a?.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY;
                const db = b?.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY;
                return da - db;
            });

        if (aFaire.length > 0) return aFaire[0];

        const enCours = trajets.find((t) => t?.statut === 'en_cours');
        return enCours || null;
    }, [trajets]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Accueil</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Bienvenue{user?.name ? `, ${user.name}` : ''}.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="text-xs font-medium text-gray-500">Terminés</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">
                        {loading ? '—' : stats.termine}
                    </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="text-xs font-medium text-gray-500">En cours</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">
                        {loading ? '—' : stats.en_cours}
                    </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="text-xs font-medium text-gray-500">À faire</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">
                        {loading ? '—' : stats.a_faire}
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-medium text-gray-900">Prochain trajet</div>
                {loading ? (
                    <p className="mt-1 text-sm text-gray-600">Chargement...</p>
                ) : !prochainTrajet ? (
                    <p className="mt-1 text-sm text-gray-600">Aucun trajet à venir.</p>
                ) : (
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2">
                        <div>
                            <div className="text-xs text-gray-500">Départ</div>
                            <div className="font-medium text-gray-900">{prochainTrajet.depart}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Arrivée</div>
                            <div className="font-medium text-gray-900">{prochainTrajet.arrivee}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Statut</div>
                            <div className="font-medium text-gray-900">{prochainTrajet.statut}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Date</div>
                            <div className="font-medium text-gray-900">
                                {prochainTrajet.date
                                    ? new Date(prochainTrajet.date).toLocaleDateString('fr-FR')
                                    : '—'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChauffeurDashboard;
