import { useEffect, useMemo, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

const AdminTrajets = () => {
    const { get, post, put, delete: del, loading, error } = useAxios();
    const [trajets, setTrajets] = useState([]);
    const [camions, setCamions] = useState([]);
    const [remorques, setRemorques] = useState([]);
    const [chauffeurs, setChauffeurs] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState(null);
    const [form, setForm] = useState({
        depart: '',
        arrivee: '',
        date: '',
        camion: '',
        remorque: '',
        chauffeur: '',
        statut: 'à faire'
    });

    const normalizeErrorMessage = (message) => {
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string' && message.trim()) return message;
        return 'Une erreur est survenue.';
    };

    const toLocalDateTime = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    const refresh = async () => {
        const res = await get('/admin/trajets');
        setTrajets(res?.data || []);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormError(null);
        setForm({
            depart: '',
            arrivee: '',
            date: '',
            camion: '',
            remorque: '',
            chauffeur: '',
            statut: 'à faire'
        });
    };

    const startEdit = (trajet) => {
        setFormError(null);
        setEditingId(trajet._id);
        setForm({
            depart: trajet.depart || '',
            arrivee: trajet.arrivee || '',
            date: toLocalDateTime(trajet.date),
            camion: trajet.camion || '',
            remorque: trajet.remorque || '',
            chauffeur: trajet.chauffeur || '',
            statut: trajet.statut || 'à faire'
        });
    };

    const toPayload = () => {
        const payload = {
            depart: form.depart?.trim(),
            arrivee: form.arrivee?.trim(),
            date: form.date ? new Date(form.date).toISOString() : undefined,
            camion: form.camion,
            remorque: form.remorque === '' ? null : form.remorque,
            statut: form.statut
        };

        // chauffeur: on create can be null; on update schema is string (not nullable) so omit if empty
        if (editingId) {
            if (form.chauffeur) payload.chauffeur = form.chauffeur;
        } else {
            payload.chauffeur = form.chauffeur === '' ? null : form.chauffeur;
        }

        Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
        return payload;
    };

    const submit = async (e) => {
        e.preventDefault();
        setFormError(null);

        const payload = toPayload();
        try {
            if (editingId) {
                await put(`/admin/trajets/${editingId}`, payload);
            } else {
                await post('/admin/trajets', payload);
            }
            await refresh();
            resetForm();
        } catch (err) {
            setFormError(normalizeErrorMessage(err?.response?.data?.message));
        }
    };

    const remove = async (id) => {
        setFormError(null);
        try {
            await del(`/admin/trajets/${id}`);
            setTrajets((prev) => prev.filter((t) => t._id !== id));
            if (editingId === id) resetForm();
        } catch (err) {
            setFormError(normalizeErrorMessage(err?.response?.data?.message));
        }
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [trajetsRes, camionsRes, remorquesRes, chauffeursRes] = await Promise.all([
                    get('/admin/trajets'),
                    get('/admin/camions'),
                    get('/admin/remorques'),
                    get('/admin/chauffeurs')
                ]);

                if (!cancelled) {
                    setTrajets(trajetsRes?.data || []);
                    setCamions(camionsRes?.data || []);
                    setRemorques(remorquesRes?.data || []);
                    setChauffeurs(chauffeursRes?.data || []);
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

            <form onSubmit={submit} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-gray-900">
                        {editingId ? 'Modifier trajet' : 'Ajouter trajet'}
                    </div>
                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Annuler
                        </button>
                    )}
                </div>

                {formError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {formError}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Input
                        label="Départ"
                        value={form.depart}
                        onChange={(e) => setForm((p) => ({ ...p, depart: e.target.value }))}
                        required
                    />
                    <Input
                        label="Arrivée"
                        value={form.arrivee}
                        onChange={(e) => setForm((p) => ({ ...p, arrivee: e.target.value }))}
                        required
                    />
                    <Input
                        label="Date"
                        type="datetime-local"
                        value={form.date}
                        onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                        required
                    />
                    <Select
                        label="Camion"
                        value={form.camion}
                        onChange={(e) => setForm((p) => ({ ...p, camion: e.target.value }))}
                        placeholder="Sélectionner"
                        options={camions.map((c) => ({
                            value: c._id,
                            label: `${c.immatriculation} (${c.statut})`
                        }))}
                    />
                    <Select
                        label="Remorque (optionnel)"
                        value={form.remorque}
                        onChange={(e) => setForm((p) => ({ ...p, remorque: e.target.value }))}
                        placeholder="—"
                        options={remorques.map((r) => ({
                            value: r._id,
                            label: `${r.immatriculation} (${r.statut})`
                        }))}
                    />
                    <Select
                        label="Chauffeur (optionnel)"
                        value={form.chauffeur}
                        onChange={(e) => setForm((p) => ({ ...p, chauffeur: e.target.value }))}
                        placeholder="—"
                        options={chauffeurs
                            .filter((c) => c.status === 'actif')
                            .map((c) => ({
                                value: c._id,
                                label: `${c.user?.name || c.user?.email || c._id}`
                            }))}
                    />
                    <Select
                        label="Statut"
                        value={form.statut}
                        onChange={(e) => setForm((p) => ({ ...p, statut: e.target.value }))}
                        options={[
                            { value: 'à faire', label: 'à faire' },
                            { value: 'en_cours', label: 'en_cours' },
                            { value: 'terminé', label: 'terminé' }
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:max-w-sm">
                    <Button type="submit" loading={loading}>
                        {editingId ? 'Enregistrer' : 'Créer'}
                    </Button>
                </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-5 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Départ</div>
                    <div>Arrivée</div>
                    <div>Date</div>
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
                            <div key={t._id} className="grid grid-cols-5 items-center px-4 py-3 text-sm text-gray-800">
                                <div className="truncate">{t.depart}</div>
                                <div className="truncate">{t.arrivee}</div>
                                <div className="truncate">
                                    {t.date ? new Date(t.date).toLocaleString() : '—'}
                                </div>
                                <div className="truncate">{t.statut}</div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(t)}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={loading}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(t._id)}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={loading}
                                    >
                                        Supprimer
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

export default AdminTrajets;
