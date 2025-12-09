const Trajet = require('../models/Trajet');
const Camion = require('../models/Camion');
const Remorque = require('../models/Remorque');

exports.createTrajet = async (req, res, next) => {
    try {
        const payload = req.body;

        const camion = await Camion.findById(payload.camion);
        if (!camion || camion.statut !== 'disponible') {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Camion non disponible'
            });
        }

        if (payload.remorque) {
            const remorque = await Remorque.findById(payload.remorque);
            if (!remorque || remorque.statut !== 'disponible') {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'Remorque non disponible'
                });
            }
        }

        const trajet = await Trajet.create({
            ...payload,
            kilometrageDepart: camion.kilometrage
        });

        return res.status(201).json({ success: true, status: 201, data: trajet });
    } catch (err) {
        return next(err);
    }
};

exports.getTrajets = async (req, res, next) => {
    try {
        const trajets = await Trajet.find();
        return res.json({ success: true, status: 200, data: trajets });
    } catch (err) {
        return next(err);
    }
};

exports.getTrajetById = async (req, res, next) => {
    try {
        const trajet = await Trajet.findById(req.params.id);
        if (!trajet) {
            return res.status(404).json({ success: false, status: 404, message: 'Trajet not found' });
        }
        return res.json({ success: true, status: 200, data: trajet });
    } catch (err) {
        return next(err);
    }
};

exports.updateTrajet = async (req, res, next) => {
    try {
        const payload = req.body;

        if (payload.camion) {
            const camion = await Camion.findById(payload.camion);
            if (!camion || camion.statut !== 'disponible') {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'Camion non disponible'
                });
            }
            payload.kilometrageDepart = camion.kilometrage;
        }

        if (payload.remorque) {
            const remorque = await Remorque.findById(payload.remorque);
            if (!remorque || remorque.statut !== 'disponible') {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'Remorque non disponible'
                });
            }
        }

        const trajet = await Trajet.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
        if (!trajet) {
            return res.status(404).json({ success: false, status: 404, message: 'Trajet not found' });
        }
        return res.json({ success: true, status: 200, data: trajet });
    } catch (err) {
        return next(err);
    }
};

exports.deleteTrajet = async (req, res, next) => {
    try {
        const trajet = await Trajet.findByIdAndDelete(req.params.id);
        if (!trajet) {
            return res.status(404).json({ success: false, status: 404, message: 'Trajet not found' });
        }
        return res.json({ success: true, status: 200, message: 'Trajet deleted' });
    } catch (err) {
        return next(err);
    }
};
