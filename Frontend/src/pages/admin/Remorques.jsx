import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

const AdminRemorques = () => {
    const { get, post, put, delete: del, loading, error } = useAxios();
    const [remorques, setRemorques] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState(null);
    const [form, setForm] = useState({
        immatriculation: '',
        marque: '',
        modele: '',
        annee: '',
        capacite: '',
        type: 'autre',
        statut: 'disponible',
        remarques: ''
    });

    const normalizeErrorMessage = (message) => {
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string' && message.trim()) return message;
        return 'Une erreur est survenue.';
    };

    const refresh = async () => {
        const res = await get('/admin/remorques');
        setRemorques(res?.data || []);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormError(null);
        setForm({
            immatriculation: '',
            marque: '',
            modele: '',
            annee: '',
            capacite: '',
            type: 'autre',
            statut: 'disponible',
            remarques: ''
        });
    };

    const startEdit = (remorque) => {
        setFormError(null);
        setEditingId(remorque._id);
        setForm({
            immatriculation: remorque.immatriculation || '',
            marque: remorque.marque || '',
            modele: remorque.modele || '',
            annee: remorque.annee ?? '',
            capacite: remorque.capacite ?? '',
            type: remorque.type || 'autre',
            statut: remorque.statut || 'disponible',
            remarques: remorque.remarques || ''
        });
    };

    const toPayload = () => {
        const payload = {
            immatriculation: form.immatriculation?.trim(),
            marque: form.marque?.trim(),
            modele: form.modele?.trim(),
            annee: form.annee === '' ? undefined : Number(form.annee),
            capacite: form.capacite === '' ? null : Number(form.capacite),
            type: form.type,
            statut: form.statut,
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
                await put(`/admin/remorques/${editingId}`, payload);
            } else {
                await post('/admin/remorques', payload);
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
            await del(`/admin/remorques/${id}`);
            setRemorques((prev) => prev.filter((r) => r._id !== id));
            if (editingId === id) resetForm();
        } catch (err) {
            setFormError(normalizeErrorMessage(err?.response?.data?.message));
        }
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await get('/admin/remorques');
                if (!cancelled) setRemorques(res?.data || []);
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
                <h1 className="text-xl font-semibold text-gray-900">Remorques</h1>
                <p className="mt-1 text-sm text-gray-600">Liste des remorques.</p>
            </div>

            <form onSubmit={submit} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-gray-900">
                        {editingId ? 'Modifier remorque' : 'Ajouter remorque'}
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
                        label="Capacité"
                        type="number"
                        value={form.capacite}
                        onChange={(e) => setForm((p) => ({ ...p, capacite: e.target.value }))}
                    />
                    <Select
                        label="Type"
                        value={form.type}
                        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                        options={[
                            { value: 'plateau', label: 'plateau' },
                            { value: 'frigorifique', label: 'frigorifique' },
                            { value: 'citerne', label: 'citerne' },
                            { value: 'bachee', label: 'bachee' },
                            { value: 'autre', label: 'autre' }
                        ]}
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
                    <div>Type</div>
                    <div>Statut</div>
                    <div className="text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Chargement...</div>
                ) : remorques.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Aucune remorque.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {remorques.map((r) => (
                            <div key={r._id} className="grid grid-cols-4 items-center px-4 py-3 text-sm text-gray-800">
                                <div className="truncate">{r.immatriculation || '—'}</div>
                                <div className="truncate">{r.type || '—'}</div>
                                <div className="truncate">{r.statut}</div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(r)}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={loading}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(r._id)}
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

export default AdminRemorques;
