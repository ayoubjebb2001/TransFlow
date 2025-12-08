const yup = require('yup');

const registerSchema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
    role: yup.string().oneOf(['admin', 'chauffeur']).default('chauffeur')
});

const loginSchema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().required()
});

module.exports = { registerSchema, loginSchema };
