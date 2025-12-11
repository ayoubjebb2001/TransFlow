import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

const AdminPneus = () => {
    const { get, post, put, delete: del, loading, error } = useAxios();
    const [pneus, setPneus] = useState([]);
    const [camions, setCamions] = useState([]);
    const [remorques, setRemorques] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formError, setFormError] = useState(null);
    const [form, setForm] = useState({
        numeroSerie: '',
        marque: '',
        dimension: '',
        etat: 'neuf',
        kilometrage: 0,
        usure: 0,
        position: '',
        camion: '',
        remorque: '',
        remarques: ''
    });

    const normalizeErrorMessage = (message) => {
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string' && message.trim()) return message;
        return 'Une erreur est survenue.';
    };

    const refresh = async () => {
        const res = await get('/admin/pneus');
        setPneus(res?.data || []);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormError(null);
        setForm({
            numeroSerie: '',
            marque: '',
            dimension: '',
            etat: 'neuf',
            kilometrage: 0,
            usure: 0,
            position: '',
            camion: '',
            remorque: '',
            remarques: ''
        });
    };

    const startEdit = (pneu) => {
        setFormError(null);
        setEditingId(pneu._id);
        setForm({
            numeroSerie: pneu.numeroSerie || '',
            marque: pneu.marque || '',
            dimension: pneu.dimension || '',
            etat: pneu.etat || 'neuf',
            kilometrage: pneu.kilometrage ?? 0,
            usure: pneu.usure ?? 0,
            position: pneu.position || '',
            camion: pneu.camion || '',
            remorque: pneu.remorque || '',
            remarques: pneu.remarques || ''
        });
    };

    const toPayload = () => {
        const payload = {
            numeroSerie: form.numeroSerie?.trim(),
            marque: form.marque?.trim(),
            dimension: form.dimension?.trim(),
            etat: form.etat,
            kilometrage: form.kilometrage === '' ? undefined : Number(form.kilometrage),
            usure: form.usure === '' ? undefined : Number(form.usure),
            position: form.position === '' ? null : form.position,
            camion: form.camion === '' ? null : form.camion,
            remorque: form.remorque === '' ? null : form.remorque,
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
                await put(`/admin/pneus/${editingId}`, payload);
            } else {
                await post('/admin/pneus', payload);
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
            await del(`/admin/pneus/${id}`);
            setPneus((prev) => prev.filter((p) => p._id !== id));
            if (editingId === id) resetForm();
        } catch (err) {
            setFormError(normalizeErrorMessage(err?.response?.data?.message));
        }
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [pneusRes, camionsRes, remorquesRes] = await Promise.all([
                    get('/admin/pneus'),
                    get('/admin/camions'),
                    get('/admin/remorques')
                ]);

                if (!cancelled) {
                    setPneus(pneusRes?.data || []);
                    setCamions(camionsRes?.data || []);
                    setRemorques(remorquesRes?.data || []);
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
                <h1 className="text-xl font-semibold text-gray-900">Pneus</h1>
                <p className="mt-1 text-sm text-gray-600">Liste des pneus.</p>
            </div>

            <form onSubmit={submit} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-gray-900">
                        {editingId ? 'Modifier pneu' : 'Ajouter pneu'}
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
                        label="Numéro de série"
                        value={form.numeroSerie}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, numeroSerie: e.target.value.toUpperCase() }))
                        }
                        placeholder="SN-1234"
                        required
                    />
                    <Input
                        label="Marque"
                        value={form.marque}
                        onChange={(e) => setForm((p) => ({ ...p, marque: e.target.value }))}
                        required
                    />
                    <Input
                        label="Dimension"
                        value={form.dimension}
                        onChange={(e) => setForm((p) => ({ ...p, dimension: e.target.value }))}
                        required
                    />
                    <Select
                        label="État"
                        value={form.etat}
                        onChange={(e) => setForm((p) => ({ ...p, etat: e.target.value }))}
                        options={[
                            { value: 'neuf', label: 'neuf' },
                            { value: 'use', label: 'use' },
                            { value: 'a_remplacer', label: 'a_remplacer' }
                        ]}
                    />
                    <Input
                        label="Kilométrage"
                        type="number"
                        value={form.kilometrage}
                        onChange={(e) => setForm((p) => ({ ...p, kilometrage: e.target.value }))}
                    />
                    <Input
                        label="Usure (%)"
                        type="number"
                        value={form.usure}
                        onChange={(e) => setForm((p) => ({ ...p, usure: e.target.value }))}
                    />
                    <Input
                        label="Position"
                        value={form.position}
                        onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                    />
                    <Select
                        label="Camion (optionnel)"
                        value={form.camion}
                        onChange={(e) => setForm((p) => ({ ...p, camion: e.target.value }))}
                        placeholder="—"
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
                <div className="grid grid-cols-5 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
                    <div>Numéro série</div>
                    <div>État</div>
                    <div>Kilométrage</div>
                    <div>Usure</div>
                    <div className="text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Chargement...</div>
                ) : pneus.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-600">Aucun pneu.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {pneus.map((p) => (
                            <div key={p._id} className="grid grid-cols-5 items-center px-4 py-3 text-sm text-gray-800">
                                <div className="truncate">{p.numeroSerie || '—'}</div>
                                <div className="truncate">{p.etat || '—'}</div>
                                <div className="truncate">{p.kilometrage ?? '—'}</div>
                                <div className="truncate">{p.usure !== undefined ? `${Math.round(p.usure)}%` : '—'}</div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(p)}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                        disabled={loading}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(p._id)}
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

export default AdminPneus;
