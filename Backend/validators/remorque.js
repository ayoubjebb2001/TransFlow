const yup = require('yup');

const immatriculation = yup
    .string()
    .trim()
    .matches(/^(?!.*[a-z])[A-Z0-9-]+$/, 'Immatriculation must be uppercase and may include digits or hyphens')
    .required();

const base = {
    immatriculation,
    marque: yup.string().trim().required(),
    modele: yup.string().trim().required(),
    annee: yup.number().integer().min(2000).max(new Date().getFullYear()).required(),
    capacite: yup.number().min(0).nullable(),
    type: yup.string().oneOf(['plateau', 'frigorifique', 'citerne', 'bachee', 'autre']).default('autre'),
    statut: yup.string().oneOf(['disponible', 'en_mission', 'en_panne', 'maintenance']).default('disponible'),
    remarques: yup.string().trim().nullable()
};

const createRemorqueSchema = yup.object(base);

const updateRemorqueSchema = yup
    .object({
        immatriculation: immatriculation.notRequired(),
        marque: base.marque.notRequired(),
        modele: base.modele.notRequired(),
        annee: base.annee.notRequired(),
        capacite: base.capacite.notRequired(),
        type: base.type.notRequired(),
        statut: base.statut.notRequired(),
        remarques: base.remarques.notRequired()
    })
    .noUnknown();

module.exports = { createRemorqueSchema, updateRemorqueSchema };
