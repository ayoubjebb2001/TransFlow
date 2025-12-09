const User = require('../models/User');
const Chauffeur = require('../models/Chauffeur');
const { generateToken } = require('../services/jwt');
const { hashPassword, comparePassword } = require('../services/hash');
const { createChauffeurSchema } = require('../validators/chauffeur');

exports.register = async (req, res, next) => {
    try {
        const payload = req.body;

        const exists = await User.findOne({ email: payload.email });
        if (exists) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'This email is already taken'
            });
        }

        const hashedPassword = await hashPassword(payload.password);
        const user = await User.create({ ...payload, password: hashedPassword });

        if (user.role === 'chauffeur') {
            const chauffeurData = await createChauffeurSchema.validate(
                {
                    phone: payload.phone,
                    licenseNumber: payload.licenseNumber,
                    status: payload.status,
                    serviceYears: payload.serviceYears
                },
                { abortEarly: false, stripUnknown: true }
            );

            await Chauffeur.create({ user: user._id, ...chauffeurData });
        }
        const token = generateToken({ id: user._id, role: user.role });

        return res.status(201).json({
            status: 201,
            message: 'User registered successfully',
            data: { user, token }
        });
    } catch (err) {
        return next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const payload = req.body;

        const user = await User.findOne({ email: payload.email });
        if (!user) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await comparePassword(payload.password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken({ id: user._id, role: user.role });
        return res.json({
            success: true,
            status: 200,
            data: { user, token }
        });
    } catch (err) {
        return next(err);
    }
};
