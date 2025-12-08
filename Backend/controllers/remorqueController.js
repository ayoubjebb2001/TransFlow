const Remorque = require('../models/Remorque');

exports.createRemorque = async (req, res, next) => {
    try {
        const exists = await Remorque.findOne({ immatriculation: req.body.immatriculation });
        if (exists) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Immatriculation already exists'
            });
        }

        const remorque = await Remorque.create(req.body);
        return res.status(201).json({ success: true, status: 201, data: remorque });
    } catch (err) {
        return next(err);
    }
};

exports.getRemorques = async (req, res, next) => {
    try {
        const remorques = await Remorque.find();
        return res.json({ success: true, status: 200, data: remorques });
    } catch (err) {
        return next(err);
    }
};

exports.getRemorqueById = async (req, res, next) => {
    try {
        const remorque = await Remorque.findById(req.params.id);
        if (!remorque) {
            return res.status(404).json({ success: false, status: 404, message: 'Remorque not found' });
        }
        return res.json({ success: true, status: 200, data: remorque });
    } catch (err) {
        return next(err);
    }
};

exports.updateRemorque = async (req, res, next) => {
    try {
        const remorque = await Remorque.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!remorque) {
            return res.status(404).json({ success: false, status: 404, message: 'Remorque not found' });
        }
        return res.json({ success: true, status: 200, data: remorque });
    } catch (err) {
        return next(err);
    }
};

exports.deleteRemorque = async (req, res, next) => {
    try {
        const remorque = await Remorque.findByIdAndDelete(req.params.id);
        if (!remorque) {
            return res.status(404).json({ success: false, status: 404, message: 'Remorque not found' });
        }
        return res.json({ success: true, status: 200, message: 'Remorque deleted' });
    } catch (err) {
        return next(err);
    }
};
