const yup = require('yup');

const chauffeurBase = {
    phone: yup.string().trim().required(),
    licenseNumber: yup.string().trim().required(),
    status: yup.string().oneOf(['actif', 'inactif']).default('actif'),
    serviceYears: yup.number().min(0).default(0)
};

const createChauffeurSchema = yup.object(chauffeurBase);

const updateChauffeurSchema = yup
    .object({
        phone: chauffeurBase.phone.notRequired(),
        licenseNumber: chauffeurBase.licenseNumber.notRequired(),
        status: chauffeurBase.status.notRequired(),
        serviceYears: chauffeurBase.serviceYears.notRequired()
    })
    .noUnknown();

module.exports = { createChauffeurSchema, updateChauffeurSchema };
