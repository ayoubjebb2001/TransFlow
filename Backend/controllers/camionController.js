const Camion = require('../models/Camion');

exports.createCamion = async (req, res, next) => {
    try {
        const exists = await Camion.findOne({ immatriculation: req.body.immatriculation });
        if (exists) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Immatriculation already exists'
            });
        }

        const camion = await Camion.create(req.body);
        return res.status(201).json({
            success: true,
            status: 201,
            data: camion
        });
    } catch (err) {
        return next(err);
    }
};

exports.getCamions = async (req, res, next) => {
    try {
        const camions = await Camion.find();
        return res.json({ success: true, status: 200, data: camions });
    } catch (err) {
        return next(err);
    }
};

exports.getCamionById = async (req, res, next) => {
    try {
        const camion = await Camion.findById(req.params.id);
        if (!camion) {
            return res.status(404).json({ success: false, status: 404, message: 'Camion not found' });
        }
        return res.json({ success: true, status: 200, data: camion });
    } catch (err) {
        return next(err);
    }
};

exports.updateCamion = async (req, res, next) => {
    try {
        const camion = await Camion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!camion) {
            return res.status(404).json({ success: false, status: 404, message: 'Camion not found' });
        }
        return res.json({ success: true, status: 200, data: camion });
    } catch (err) {
        return next(err);
    }
};

exports.deleteCamion = async (req, res, next) => {
    try {
        const camion = await Camion.findByIdAndDelete(req.params.id);
        if (!camion) {
            return res.status(404).json({ success: false, status: 404, message: 'Camion not found' });
        }
        return res.json({ success: true, status: 200, message: 'Camion deleted' });
    } catch (err) {
        return next(err);
    }
};
