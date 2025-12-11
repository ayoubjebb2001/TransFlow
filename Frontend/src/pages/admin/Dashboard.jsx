import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAxios } from '../../hooks/useAxios';

const StatCard = ({ label, value, hint }) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs font-medium text-gray-500">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
            {hint && <div className="mt-1 text-sm text-gray-600">{hint}</div>}
        </div>
    );
};

const AdminDashboard = () => {
    const { user } = useAuth();
    const { get } = useAxios();
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [fetchedAt, setFetchedAt] = useState(null);

    const [trajets, setTrajets] = useState([]);
    const [camions, setCamions] = useState([]);
    const [remorques, setRemorques] = useState([]);
    const [pneus, setPneus] = useState([]);
    const [chauffeurs, setChauffeurs] = useState([]);
    const [rules, setRules] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const [
                    trajetsRes,
                    camionsRes,
                    remorquesRes,
                    pneusRes,
                    chauffeursRes,
                    rulesRes
                ] = await Promise.all([
                    get('/admin/trajets'),
                    get('/admin/camions'),
                    get('/admin/remorques'),
                    get('/admin/pneus'),
                    get('/admin/chauffeurs'),
                    get('/admin/maintenance-rules')
                ]);

                if (cancelled) return;

                setTrajets(trajetsRes?.data || []);
                setCamions(camionsRes?.data || []);
                setRemorques(remorquesRes?.data || []);
                setPneus(pneusRes?.data || []);
                setChauffeurs(chauffeursRes?.data || []);
                setRules(rulesRes?.data || []);
                setFetchedAt(new Date());
            } catch (e) {
                if (!cancelled) {
                    setLoadError(e?.response?.data?.message || 'Impossible de charger les statistiques.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [get]);

    const fmtInt = useMemo(() => new Intl.NumberFormat('fr-FR'), []);
    const fmt1 = useMemo(() => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }), []);

    const stats = useMemo(() => {
        const trajetsTermines = trajets.filter((t) => t?.statut === 'terminé');
        const trajetsEnCours = trajets.filter((t) => t?.statut === 'en_cours');
        const trajetsAFaire = trajets.filter((t) => t?.statut === 'à faire');

        const totalConsommation = trajets.reduce(
            (sum, t) => sum + (Number(t?.volumeGasoilConsommee) || 0),
            0
        );

        const totalKmParcourus = trajets.reduce((sum, t) => {
            const dep = Number(t?.kilometrageDepart);
            const arr = Number(t?.kilometrageArrivee);
            if (!Number.isFinite(dep) || !Number.isFinite(arr)) return sum;
            const delta = arr - dep;
            return sum + (delta > 0 ? delta : 0);
        }, 0);

        const flotteKm = camions.reduce((sum, c) => sum + (Number(c?.kilometrage) || 0), 0);

        const camionsParStatut = camions.reduce(
            (acc, c) => {
                const s = c?.statut || '—';
                acc[s] = (acc[s] || 0) + 1;
                return acc;
            },
            { disponible: 0, en_mission: 0, en_panne: 0, maintenance: 0 }
        );

        const remorquesParStatut = remorques.reduce(
            (acc, r) => {
                const s = r?.statut || '—';
                acc[s] = (acc[s] || 0) + 1;
                return acc;
            },
            { disponible: 0, en_mission: 0, en_panne: 0, maintenance: 0 }
        );

        const pneusARemplacer = pneus.filter((p) => p?.etat === 'a_remplacer').length;
        const chauffeursInactifs = chauffeurs.filter((c) => c?.status === 'inactif').length;
        const rulesActives = rules.filter((r) => r?.actif !== false).length;

        const alertes = [];
        if (camionsParStatut.en_panne) alertes.push(`${camionsParStatut.en_panne} camion(s) en panne`);
        if (camionsParStatut.maintenance) alertes.push(`${camionsParStatut.maintenance} camion(s) en maintenance`);
        if (remorquesParStatut.en_panne) alertes.push(`${remorquesParStatut.en_panne} remorque(s) en panne`);
        if (remorquesParStatut.maintenance) alertes.push(`${remorquesParStatut.maintenance} remorque(s) en maintenance`);
        if (pneusARemplacer) alertes.push(`${pneusARemplacer} pneu(x) à remplacer`);
        if (chauffeursInactifs) alertes.push(`${chauffeursInactifs} chauffeur(s) inactif(s) (à valider)`);
        if (trajetsEnCours.length) alertes.push(`${trajetsEnCours.length} trajet(s) en cours`);

        return {
            trajetsTermines: trajetsTermines.length,
            trajetsEnCours: trajetsEnCours.length,
            trajetsAFaire: trajetsAFaire.length,
            totalConsommation,
            totalKmParcourus,
            flotteKm,
            camionsParStatut,
            remorquesParStatut,
            pneusARemplacer,
            chauffeursInactifs,
            rulesActives,
            alertes
        };
    }, [trajets, camions, remorques, pneus, chauffeurs, rules]);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Accueil</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Bienvenue{user?.name ? `, ${user.name}` : ''}.
                </p>
                {fetchedAt && (
                    <p className="mt-1 text-xs text-gray-500">
                        Mis à jour: {fetchedAt.toLocaleString('fr-FR')}
                    </p>
                )}
            </div>

            {loadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {Array.isArray(loadError) ? loadError.join(', ') : loadError}
                </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard
                    label="Consommation (total)"
                    value={loading ? '—' : `${fmt1.format(stats.totalConsommation)} L`}
                    hint="Somme des volumes sur les trajets"
                />
                <StatCard
                    label="Kilométrage (trajets)"
                    value={loading ? '—' : `${fmtInt.format(stats.totalKmParcourus)} km`}
                    hint="Basé sur km départ/arrivée"
                />
                <StatCard
                    label="Maintenance (règles actives)"
                    value={loading ? '—' : fmtInt.format(stats.rulesActives)}
                    hint="Règles applicables"
                />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="text-sm font-medium text-gray-900">Ressources</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="text-xs font-medium text-gray-500">Camions</div>
                            <div className="mt-1 text-sm text-gray-700">
                                Total: {loading ? '—' : fmtInt.format(camions.length)}
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                                Dispo: {loading ? '—' : fmtInt.format(stats.camionsParStatut.disponible)} ·
                                Mission: {loading ? '—' : fmtInt.format(stats.camionsParStatut.en_mission)} ·
                                Panne: {loading ? '—' : fmtInt.format(stats.camionsParStatut.en_panne)} ·
                                Maint: {loading ? '—' : fmtInt.format(stats.camionsParStatut.maintenance)}
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                                Km flotte: {loading ? '—' : fmtInt.format(stats.flotteKm)} km
                            </div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="text-xs font-medium text-gray-500">Remorques</div>
                            <div className="mt-1 text-sm text-gray-700">
                                Total: {loading ? '—' : fmtInt.format(remorques.length)}
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                                Dispo: {loading ? '—' : fmtInt.format(stats.remorquesParStatut.disponible)} ·
                                Mission: {loading ? '—' : fmtInt.format(stats.remorquesParStatut.en_mission)} ·
                                Panne: {loading ? '—' : fmtInt.format(stats.remorquesParStatut.en_panne)} ·
                                Maint: {loading ? '—' : fmtInt.format(stats.remorquesParStatut.maintenance)}
                            </div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="text-xs font-medium text-gray-500">Pneus</div>
                            <div className="mt-1 text-sm text-gray-700">
                                Total: {loading ? '—' : fmtInt.format(pneus.length)}
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                                À remplacer: {loading ? '—' : fmtInt.format(stats.pneusARemplacer)}
                            </div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="text-xs font-medium text-gray-500">Chauffeurs</div>
                            <div className="mt-1 text-sm text-gray-700">
                                Total: {loading ? '—' : fmtInt.format(chauffeurs.length)}
                            </div>
                            <div className="mt-1 text-xs text-gray-600">
                                Inactifs: {loading ? '—' : fmtInt.format(stats.chauffeursInactifs)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="text-sm font-medium text-gray-900">Trajets</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <StatCard label="Terminés" value={loading ? '—' : fmtInt.format(stats.trajetsTermines)} />
                        <StatCard label="En cours" value={loading ? '—' : fmtInt.format(stats.trajetsEnCours)} />
                        <StatCard label="À faire" value={loading ? '—' : fmtInt.format(stats.trajetsAFaire)} />
                    </div>

                    <div className="mt-4">
                        <div className="text-sm font-medium text-gray-900">Infos importantes</div>
                        {loading ? (
                            <p className="mt-1 text-sm text-gray-600">Chargement...</p>
                        ) : stats.alertes.length === 0 ? (
                            <p className="mt-1 text-sm text-gray-600">Aucune alerte.</p>
                        ) : (
                            <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                {stats.alertes.slice(0, 6).map((a) => (
                                    <li key={a} className="flex items-start gap-2">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-400" />
                                        <span>{a}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="mt-3 text-xs text-gray-500">
                            Astuce: utilisez les sections Camions/Remorques/Pneus/Chauffeurs pour traiter les alertes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
