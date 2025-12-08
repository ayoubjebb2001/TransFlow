const Pneu = require('../models/Pneu');

exports.createPneu = async (req, res, next) => {
    try {
        const exists = await Pneu.findOne({ numeroSerie: req.body.numeroSerie });
        if (exists) {
            return res.status(400).json({ success: false, status: 400, message: 'Numero de serie already exists' });
        }

        const pneu = await Pneu.create(req.body);
        return res.status(201).json({ success: true, status: 201, data: pneu });
    } catch (err) {
        return next(err);
    }
};

exports.getPneus = async (req, res, next) => {
    try {
        const pneus = await Pneu.find();
        return res.json({ success: true, status: 200, data: pneus });
    } catch (err) {
        return next(err);
    }
};

exports.getPneuById = async (req, res, next) => {
    try {
        const pneu = await Pneu.findById(req.params.id);
        if (!pneu) {
            return res.status(404).json({ success: false, status: 404, message: 'Pneu not found' });
        }
        return res.json({ success: true, status: 200, data: pneu });
    } catch (err) {
        return next(err);
    }
};

exports.updatePneu = async (req, res, next) => {
    try {
        const pneu = await Pneu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!pneu) {
            return res.status(404).json({ success: false, status: 404, message: 'Pneu not found' });
        }
        return res.json({ success: true, status: 200, data: pneu });
    } catch (err) {
        return next(err);
    }
};

exports.deletePneu = async (req, res, next) => {
    try {
        const pneu = await Pneu.findByIdAndDelete(req.params.id);
        if (!pneu) {
            return res.status(404).json({ success: false, status: 404, message: 'Pneu not found' });
        }
        return res.json({ success: true, status: 200, message: 'Pneu deleted' });
    } catch (err) {
        return next(err);
    }
};
