const yup = require('yup');

const baseSchema = {
    type: yup.string().oneOf(['pneus', 'vidange', 'revision', 'autre']).required(),
    label: yup.string().trim().required(),
    description: yup.string().trim().notRequired(),
    periodiciteKm: yup.number().min(0).nullable().notRequired(),
    periodiciteJours: yup.number().min(0).nullable().notRequired(),
    actif: yup.boolean().default(true)
};

const createMaintenanceRuleSchema = yup.object(baseSchema).test('one-periodicity', 'Définir au moins une périodicité (km ou jours)', value => {
    if (!value) return false;
    return value.periodiciteKm !== undefined || value.periodiciteJours !== undefined;
});

const updateMaintenanceRuleSchema = yup
    .object({
        type: baseSchema.type.notRequired(),
        label: baseSchema.label.notRequired(),
        description: baseSchema.description,
        periodiciteKm: baseSchema.periodiciteKm,
        periodiciteJours: baseSchema.periodiciteJours,
        actif: baseSchema.actif.notRequired()
    })
    .test('one-periodicity', 'Définir au moins une périodicité (km ou jours)', value => {
        if (!value) return true;
        if (value.periodiciteKm === undefined && value.periodiciteJours === undefined) return true;
        return value.periodiciteKm !== undefined || value.periodiciteJours !== undefined;
    })
    .noUnknown();

module.exports = { createMaintenanceRuleSchema, updateMaintenanceRuleSchema };