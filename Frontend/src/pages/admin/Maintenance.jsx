import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

const AdminMaintenance = () => {
    const { get, post, put, delete: del, loading, error } = useAxios();
    const [rules, setRules] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState(null);
    const [form, setForm] = useState({
        type: 'autre',
        label: '',
        description: '',
        periodiciteKm: '',
        periodiciteJours: '',
        actif: true
    });

    const normalizeErrorMessage = (message) => {
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string' && message.trim()) return message;
        return 'Une erreur est survenue.';
    };

    const refresh = async () => {
        const res = await get('/admin/maintenance-rules');
        setRules(res?.data || []);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormError(null);
        setForm({
            type: 'autre',
            label: '',
            description: '',
            periodiciteKm: '',
            periodiciteJours: '',
            actif: true
        });
    };

    const startEdit = (rule) => {
        setFormError(null);
        setEditingId(rule._id);
        setForm({
            type: rule.type || 'autre',
            label: rule.label || '',
            description: rule.description || '',
            periodiciteKm: rule.periodiciteKm ?? '',
            periodiciteJours: rule.periodiciteJours ?? '',
            actif: rule.actif !== undefined ? !!rule.actif : true
        });
    };

    const toPayload = () => {
        const payload = {
            type: form.type,
            label: form.label?.trim(),
            description: form.description === '' ? undefined : form.description,
            periodiciteKm: form.periodiciteKm === '' ? undefined : Number(form.periodiciteKm),
            periodiciteJours: form.periodiciteJours === '' ? undefined : Number(form.periodiciteJours),
            actif: !!form.actif
        };

        Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
        return payload;
    };

    const submit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!editingId && form.periodiciteKm === '' && form.periodiciteJours === '') {
            setFormError('Définir au moins une périodicité (km ou jours)');
            return;
        }

        const payload = toPayload();
        try {
            if (editingId) {
                await put(`/admin/maintenance-rules/${editingId}`, payload);
            } else {
                await post('/admin/maintenance-rules', payload);
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
            await del(`/admin/maintenance-rules/${id}`);
            setRules((prev) => prev.filter((r) => r._id !== id));
            if (editingId === id) resetForm();
        } catch (err) {
            setFormError(normalizeErrorMessage(err?.response?.data?.message));
        }
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await get('/admin/maintenance-rules');
                if (!cancelled) setRules(res?.data || []);
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
                <h1 className="text-xl font-semibold text-gray-900">Maintenance</h1>
                <p className="mt-1 text-sm text-gray-600">Règles de maintenance.</p>
            </div>

            <form onSubmit={submit} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-gray-900">
                        {editingId ? 'Modifier règle' : 'Ajouter règle'}
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
                    <Select
                        label="Type"
                        value={form.type}
                        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                        options={[
                            { value: 'pneus', label: 'pneus' },
                            { value: 'vidange', label: 'vidange' },
                            { value: 'revision', label: 'revision' },
                            { value: 'autre', label: 'autre' }
                        ]}
                    />
                    <Input
                        label="Libellé"
                        value={form.label}
                        onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                        required
                    />
                    <Input
                        label="Description"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    />
                    <Input
                        label="Périodicité (km)"
                        type="number"
                        value={form.periodiciteKm}
                        onChange={(e) => setForm((p) => ({ ...p, periodiciteKm: e.target.value }))}
                    />
                    <Input
                        label="Périodicité (jours)"
                        type="number"
                        value={form.periodiciteJours}
                        onChange={(e) => setForm((p) => ({ ...p, periodiciteJours: e.target.value }))}
                    />
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Actif</label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
                            <input
                                type="checkbox"
                                checked={!!form.actif}
                                onChange={(e) => setForm((p) => ({ ...p, actif: e.target.checked }))}
                            />
                            <span className="text-sm text-gray-700">{form.actif ? 'Oui' : 'Non'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:max-w-sm">
                    <Button type="submit" loading={loading}>
                        {editingId ? 'Enregistrer' : 'Créer'}
                    </Button>
                </div>
            </form>

            <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="grid grid-cols-5 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Libellé</div>
                    <div>Type</div>
                    <div>Km</div>
                    <div>Jours</div>
                    <div className="text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Chargement...</div>
                ) : rules.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Aucune règle.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {rules.map((r) => (
                            <div key={r._id} className="grid grid-cols-5 items-center px-4 py-3 text-sm text-gray-800">
                                <div className="truncate">{r.label || '—'}</div>
                                <div className="truncate">{r.type || '—'}</div>
                                <div className="truncate">{r.periodiciteKm ?? '—'}</div>
                                <div className="truncate">{r.periodiciteJours ?? '—'}</div>
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

export default AdminMaintenance;
