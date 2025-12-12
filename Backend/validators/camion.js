const yup = require('yup');

const base = {
    immatriculation: yup
        .string()
        .trim()
        .matches(/^(?!.*[a-z])[A-Z0-9-]+$/, 'Immatriculation must be uppercase and may include digits or hyphens')
        .required(),
    marque: yup.string().trim().required(),
    modele: yup.string().trim().required(),
    annee: yup.number().integer().min(2000).max(new Date().getFullYear()).required(),
    kilometrage: yup.number().min(0).default(0),
    statut: yup.string().oneOf(['disponible', 'en_mission', 'en_panne', 'maintenance']).default('disponible'),
    capacite: yup.number().min(0).nullable(),
    carburant: yup.string().oneOf(['diesel', 'essence', 'electrique', 'gpl']).default('diesel'),
    volumeCarburant: yup.number().min(0).default(0),
    remarques: yup.string().trim().nullable()
};

const createCamionSchema = yup.object(base);

const updateCamionSchema = yup.object({
    immatriculation: base.immatriculation.notRequired(),
    marque: base.marque.notRequired(),
    modele: base.modele.notRequired(),
    annee: base.annee.notRequired(),
    kilometrage: base.kilometrage.notRequired(),
    statut: base.statut.notRequired(),
    capacite: base.capacite.notRequired(),
    carburant: base.carburant.notRequired(),
    volumeCarburant: base.volumeCarburant.notRequired(),
    remarques: base.remarques.notRequired()
}).noUnknown();

module.exports = { createCamionSchema, updateCamionSchema };
