import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';

const MyTrajets = () => {
    const { get, patch, loading, error } = useAxios();
    const [trajets, setTrajets] = useState([]);
    const [actionError, setActionError] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [savingLogId, setSavingLogId] = useState(null);
    const [drafts, setDrafts] = useState({});

    const statusLabel = (value) => {
        if (value === 'en_cours') return 'en cours';
        return value || '—';
    };

    const updateDraftFromTrajets = (items) => {
        setDrafts((prev) => {
            const next = { ...prev };
            items.forEach((t) => {
                if (!t?._id) return;
                if (next[t._id]) return;
                next[t._id] = {
                    kilometrageArrivee: t.kilometrageArrivee ?? '',
                    volumeGasoilConsommee: t.volumeGasoilConsommee ?? '',
                    remarquesEtat: t.remarquesEtat ?? ''
                };
            });
            return next;
        });
    };

    const downloadPdf = async (trajetId) => {
        setActionError(null);
        setDownloadingId(trajetId);
        try {
            const blob = await get(`/chauffeur/trajets/${trajetId}/pdf`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ordre-mission-${trajetId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Impossible de télécharger le PDF.');
        } finally {
            setDownloadingId(null);
        }
    };

    const setStatus = async (trajetId, statut) => {
        setActionError(null);
        setUpdatingStatusId(trajetId);
        try {
            const res = await patch(`/chauffeur/trajets/${trajetId}/status`, { statut });
            const updated = res?.data;
            if (updated?._id) {
                setTrajets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
                updateDraftFromTrajets([updated]);
            }
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Impossible de mettre à jour le statut.');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const saveLog = async (trajetId) => {
        setActionError(null);
        setSavingLogId(trajetId);
        try {
            const d = drafts[trajetId] || {};

            const kilometrageArrivee = d.kilometrageArrivee === '' ? undefined : Number(d.kilometrageArrivee);
            const volumeGasoilConsommee = d.volumeGasoilConsommee === '' ? undefined : Number(d.volumeGasoilConsommee);
            const remarquesEtat = (d.remarquesEtat || '').trim();

            const payload = {
                ...(Number.isFinite(kilometrageArrivee) ? { kilometrageArrivee } : {}),
                ...(Number.isFinite(volumeGasoilConsommee) ? { volumeGasoilConsommee } : {}),
                ...(remarquesEtat ? { remarquesEtat } : {})
            };

            if (Object.keys(payload).length === 0) {
                setActionError('Renseignez au moins un champ (km arrivée, gasoil, remarques).');
                return;
            }

            const res = await patch(`/chauffeur/trajets/${trajetId}/log`, payload);
            const updated = res?.data;
            if (updated?._id) {
                setTrajets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
                updateDraftFromTrajets([updated]);
            }
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Impossible d\'enregistrer le journal du trajet.');
        } finally {
            setSavingLogId(null);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await get('/chauffeur/trajets');
                const data = res?.data || [];
                if (!cancelled) {
                    setTrajets(data);
                    updateDraftFromTrajets(data);
                }
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
                <h1 className="text-xl font-semibold text-gray-900">Mes trajets</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Liste de vos trajets assignés.
                </p>
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
                    <div>Départ</div>
                    <div>Arrivée</div>
                    <div>Statut</div>
                    <div className="text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Chargement...</div>
                ) : trajets.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Aucun trajet.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {trajets.map((t) => (
                            <div key={t._id} className="px-4 py-3">
                                <div className="grid grid-cols-4 items-center gap-3 text-sm text-gray-800">
                                    <div className="truncate">{t.depart}</div>
                                    <div className="truncate">{t.arrivee}</div>
                                    <div className="truncate">
                                        <span
                                            className={
                                                t.statut === 'terminé'
                                                    ? 'rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700'
                                                    : t.statut === 'en_cours'
                                                        ? 'rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700'
                                                        : 'rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'
                                            }
                                        >
                                            {statusLabel(t.statut)}
                                        </span>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            disabled={downloadingId === t._id}
                                            onClick={() => downloadPdf(t._id)}
                                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {downloadingId === t._id ? 'Téléchargement...' : 'PDF'}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={updatingStatusId === t._id || t.statut !== 'à faire'}
                                            onClick={() => setStatus(t._id, 'en_cours')}
                                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Démarrer
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                updatingStatusId === t._id ||
                                                t.statut !== 'en_cours' ||
                                                (drafts[t._id]?.kilometrageArrivee ?? '') === ''
                                            }
                                            onClick={() => setStatus(t._id, 'terminé')}
                                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            title={(drafts[t._id]?.kilometrageArrivee ?? '') === '' ? 'Renseignez km arrivée avant de terminer' : undefined}
                                        >
                                            Terminer
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-4 gap-3">
                                    <div>
                                        <div className="text-xs font-medium text-gray-600">Km départ</div>
                                        <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                                            {t.kilometrageDepart ?? '—'}
                                        </div>
                                    </div>

                                    <label className="block">
                                        <span className="text-xs font-medium text-gray-600">Km arrivée</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={drafts[t._id]?.kilometrageArrivee ?? ''}
                                            onChange={(e) =>
                                                setDrafts((prev) => ({
                                                    ...prev,
                                                    [t._id]: { ...prev[t._id], kilometrageArrivee: e.target.value }
                                                }))
                                            }
                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-gray-300 focus:outline-none"
                                            disabled={savingLogId === t._id}
                                            placeholder="Ex: 125000"
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-medium text-gray-600">Gasoil (L)</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={drafts[t._id]?.volumeGasoilConsommee ?? ''}
                                            onChange={(e) =>
                                                setDrafts((prev) => ({
                                                    ...prev,
                                                    [t._id]: { ...prev[t._id], volumeGasoilConsommee: e.target.value }
                                                }))
                                            }
                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-gray-300 focus:outline-none"
                                            disabled={savingLogId === t._id}
                                            placeholder="Ex: 52"
                                        />
                                    </label>

                                    <div className="flex items-end justify-end">
                                        <button
                                            type="button"
                                            disabled={savingLogId === t._id}
                                            onClick={() => saveLog(t._id)}
                                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {savingLogId === t._id ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>

                                <label className="mt-3 block">
                                    <span className="text-xs font-medium text-gray-600">Remarques état véhicule</span>
                                    <textarea
                                        rows={2}
                                        value={drafts[t._id]?.remarquesEtat ?? ''}
                                        onChange={(e) =>
                                            setDrafts((prev) => ({
                                                ...prev,
                                                [t._id]: { ...prev[t._id], remarquesEtat: e.target.value }
                                            }))
                                        }
                                        className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-gray-300 focus:outline-none"
                                        disabled={savingLogId === t._id}
                                        placeholder="Ex: RAS / bruit suspect / pneus à surveiller..."
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTrajets;
