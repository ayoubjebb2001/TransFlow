const yup = require('yup');

const statutEnum = ['à faire', 'en_cours', 'terminé'];

const createTrajetSchema = yup.object({
    depart: yup.string().trim().required(),
    arrivee: yup.string().trim().required(),
    date: yup.date().required(),
    camion: yup.string().required(),
    remorque: yup.string().nullable(),
    chauffeur: yup.string().nullable().notRequired(),
    kilometrageDepart: yup.number().min(0).notRequired(),
    kilometrageArrivee: yup.number().min(0).nullable(),
    volumeGasoilConsommee: yup.number().min(0).default(0),
    statut: yup.string().oneOf(statutEnum).default('à faire')
});

const updateTrajetSchema = yup
    .object({
        depart: yup.string().trim().notRequired(),
        arrivee: yup.string().trim().notRequired(),
        date: yup.date().notRequired(),
        camion: yup.string().notRequired(),
        remorque: yup.string().nullable().notRequired(),
        chauffeur: yup.string().notRequired(),
        kilometrageDepart: yup.number().min(0).notRequired(),
        kilometrageArrivee: yup.number().min(0).notRequired(),
        volumeGasoilConsommee: yup.number().min(0).notRequired(),
        statut: yup.string().oneOf(statutEnum).notRequired()
    })
    .noUnknown();

const assignChauffeurSchema = yup
    .object({
        chauffeur: yup.string().required()
    })
    .noUnknown();

const updateTrajetLogSchema = yup
    .object({
        kilometrageArrivee: yup.number().min(0).notRequired(),
        volumeGasoilConsommee: yup.number().min(0).notRequired(),
        remarquesEtat: yup.string().trim().notRequired()
    })
    .test('at-least-one', 'Au moins un champ doit être renseigné', value => {
        if (!value) return false;
        return value.kilometrageArrivee !== undefined || value.volumeGasoilConsommee !== undefined || !!value.remarquesEtat;
    })
    .noUnknown();

const updateTrajetStatusSchema = yup
    .object({
        statut: yup.string().oneOf(statutEnum).required()
    })
    .noUnknown();

module.exports = {
    createTrajetSchema,
    updateTrajetSchema,
    assignChauffeurSchema,
    updateTrajetLogSchema,
    updateTrajetStatusSchema
};
