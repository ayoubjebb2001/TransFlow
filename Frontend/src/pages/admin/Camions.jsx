import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

const AdminCamions = () => {
    const { get, post, put, delete: del, loading, error } = useAxios();
    const [camions, setCamions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState(null);
    const [form, setForm] = useState({
        immatriculation: '',
        marque: '',
        modele: '',
        annee: '',
        kilometrage: 0,
        statut: 'disponible',
        capacite: '',
        carburant: 'diesel',
        volumeCarburant: 0,
        remarques: ''
    });

    const normalizeErrorMessage = (message) => {
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string' && message.trim()) return message;
        return 'Une erreur est survenue.';
    };

    const refresh = async () => {
        const res = await get('/admin/camions');
        setCamions(res?.data || []);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormError(null);
        setForm({
            immatriculation: '',
            marque: '',
            modele: '',
            annee: '',
            kilometrage: 0,
            statut: 'disponible',
            capacite: '',
            carburant: 'diesel',
            volumeCarburant: 0,
            remarques: ''
        });
    };

    const startEdit = (camion) => {
        setFormError(null);
        setEditingId(camion._id);
        setForm({
            immatriculation: camion.immatriculation || '',
            marque: camion.marque || '',
            modele: camion.modele || '',
            annee: camion.annee ?? '',
            kilometrage: camion.kilometrage ?? 0,
            statut: camion.statut || 'disponible',
            capacite: camion.capacite ?? '',
            carburant: camion.carburant || 'diesel',
            volumeCarburant: camion.volumeCarburant ?? 0,
            remarques: camion.remarques || ''
        });
    };

    const toPayload = () => {
        const payload = {
            immatriculation: form.immatriculation?.trim(),
            marque: form.marque?.trim(),
            modele: form.modele?.trim(),
            annee: form.annee === '' ? undefined : Number(form.annee),
            kilometrage: form.kilometrage === '' ? undefined : Number(form.kilometrage),
            statut: form.statut,
            capacite: form.capacite === '' ? null : Number(form.capacite),
            carburant: form.carburant,
            volumeCarburant:
                form.volumeCarburant === '' ? undefined : Number(form.volumeCarburant),
            remarques: form.remarques === '' ? null : form.remarques
        };

        Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
        return payload;
    };

    const submit = async (e) => {
        e.preventDefault();
        setFormError(null);

        const payload = toPayload();
        try {
            if (editingId) {
                await put(`/admin/camions/${editingId}`, payload);
            } else {
                await post('/admin/camions', payload);
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
            await del(`/admin/camions/${id}`);
            setCamions((prev) => prev.filter((c) => c._id !== id));
            if (editingId === id) resetForm();
        } catch (err) {
            setFormError(normalizeErrorMessage(err?.response?.data?.message));
        }
    };

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

            <form onSubmit={submit} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-gray-900">
                        {editingId ? 'Modifier camion' : 'Ajouter camion'}
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

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Input
                        label="Immatriculation"
                        value={form.immatriculation}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, immatriculation: e.target.value.toUpperCase() }))
                        }
                        placeholder="AA-123-BB"
                        required
                    />
                    <Input
                        label="Marque"
                        value={form.marque}
                        onChange={(e) => setForm((p) => ({ ...p, marque: e.target.value }))}
                        required
                    />
                    <Input
                        label="Modèle"
                        value={form.modele}
                        onChange={(e) => setForm((p) => ({ ...p, modele: e.target.value }))}
                        required
                    />
                    <Input
                        label="Année"
                        type="number"
                        value={form.annee}
                        onChange={(e) => setForm((p) => ({ ...p, annee: e.target.value }))}
                        required
                    />
                    <Input
                        label="Kilométrage"
                        type="number"
                        value={form.kilometrage}
                        onChange={(e) => setForm((p) => ({ ...p, kilometrage: e.target.value }))}
                    />
                    <Select
                        label="Statut"
                        value={form.statut}
                        onChange={(e) => setForm((p) => ({ ...p, statut: e.target.value }))}
                        options={[
                            { value: 'disponible', label: 'disponible' },
                            { value: 'en_mission', label: 'en_mission' },
                            { value: 'en_panne', label: 'en_panne' },
                            { value: 'maintenance', label: 'maintenance' }
                        ]}
                    />
                    <Input
                        label="Capacité"
                        type="number"
                        value={form.capacite}
                        onChange={(e) => setForm((p) => ({ ...p, capacite: e.target.value }))}
                    />
                    <Select
                        label="Carburant"
                        value={form.carburant}
                        onChange={(e) => setForm((p) => ({ ...p, carburant: e.target.value }))}
                        options={[
                            { value: 'diesel', label: 'diesel' },
                            { value: 'essence', label: 'essence' },
                            { value: 'electrique', label: 'electrique' },
                            { value: 'gpl', label: 'gpl' }
                        ]}
                    />
                    <Input
                        label="Volume carburant"
                        type="number"
                        value={form.volumeCarburant}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, volumeCarburant: e.target.value }))
                        }
                    />
                    <Input
                        label="Remarques"
                        value={form.remarques}
                        onChange={(e) => setForm((p) => ({ ...p, remarques: e.target.value }))}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:max-w-sm">
                    <Button type="submit" loading={loading}>
                        {editingId ? 'Enregistrer' : 'Créer'}
                    </Button>
                </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Immatriculation</div>
                    <div>Statut</div>
                    <div>Kilométrage</div>
                    <div className="text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Chargement...</div>
                ) : camions.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Aucun camion.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {camions.map((c) => (
                            <div key={c._id} className="grid grid-cols-4 items-center px-4 py-3 text-sm text-gray-800">
                                <div className="truncate">{c.immatriculation || '—'}</div>
                                <div className="truncate">{c.statut}</div>
                                <div className="truncate">{c.kilometrage ?? '—'}</div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(c)}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={loading}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(c._id)}
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

export default AdminCamions;
