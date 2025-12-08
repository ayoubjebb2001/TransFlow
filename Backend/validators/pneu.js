const yup = require('yup');

const numeroSerie = yup
    .string()
    .trim()
    .matches(/^(?!.*[a-z])[A-Z0-9-]+$/, 'Numero de serie must be uppercase and may include digits or hyphens')
    .required();

const base = {
    numeroSerie,
    marque: yup.string().trim().required(),
    dimension: yup.string().trim().required(),
    etat: yup.string().oneOf(['neuf', 'use', 'a_remplacer']).default('neuf'),
    kilometrage: yup.number().min(0).default(0),
    position: yup.string().trim().nullable(),
    camion: yup.string().nullable(),
    remorque: yup.string().nullable(),
    remarques: yup.string().trim().nullable()
};

const createPneuSchema = yup.object(base);

const updatePneuSchema = yup
    .object({
        numeroSerie: numeroSerie.notRequired(),
        marque: base.marque.notRequired(),
        dimension: base.dimension.notRequired(),
        etat: base.etat.notRequired(),
        kilometrage: base.kilometrage.notRequired(),
        position: base.position.notRequired(),
        camion: base.camion.notRequired(),
        remorque: base.remorque.notRequired(),
        remarques: base.remarques.notRequired()
    })
    .noUnknown();

module.exports = { createPneuSchema, updatePneuSchema };
