const Trajet = require('../models/Trajet');
const Camion = require('../models/Camion');
const Remorque = require('../models/Remorque');
const Chauffeur = require('../models/Chauffeur');

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

        if (payload.chauffeur) {
            const chauffeur = await Chauffeur.findById(payload.chauffeur);
            if (!chauffeur || chauffeur.status !== 'actif') {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'Chauffeur non trouvé ou inactif'
                });
            }
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
        const trajet = await Trajet.findById(req.params.id);
        if (!trajet) {
            return res.status(404).json({ success: false, status: 404, message: 'Trajet not found' });
        }

        if (trajet.statut !== 'à faire') {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Trajet non modifiable hors statut "à faire"'
            });
        }

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

        if (payload.chauffeur) {
            const chauffeur = await Chauffeur.findById(payload.chauffeur);
            if (!chauffeur || chauffeur.status !== 'actif') {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'Chauffeur non trouvé ou inactif'
                });
            }
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

        const updatedTrajet = await Trajet.findByIdAndUpdate(req.params.id, payload, {
            new: true,
            runValidators: true
        });

        return res.json({ success: true, status: 200, data: updatedTrajet });
    } catch (err) {
        return next(err);
    }
};

exports.assignChauffeur = async (req, res, next) => {
    try {
        const { chauffeur } = req.body;

        const trajet = await Trajet.findById(req.params.id);
        if (!trajet) {
            return res.status(404).json({ success: false, status: 404, message: 'Trajet not found' });
        }

        if (trajet.statut !== 'à faire') {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Assignation impossible hors statut "à faire"'
            });
        }

        const chauffeurDoc = await Chauffeur.findById(chauffeur);
        if (!chauffeurDoc || chauffeurDoc.status !== 'actif') {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Chauffeur non trouvé ou inactif'
            });
        }

        trajet.chauffeur = chauffeurDoc._id;
        await trajet.save();

        return res.json({ success: true, status: 200, data: trajet });
    } catch (err) {
        return next(err);
    }
};

exports.getChauffeurTrajets = async (req, res, next) => {
    try {
        if (req.user.role === 'admin') {
            const { chauffeurId } = req.query;

            if (chauffeurId) {
                const chauffeur = await Chauffeur.findById(chauffeurId);
                if (!chauffeur) {
                    return res.status(404).json({
                        success: false,
                        status: 404,
                        message: 'Chauffeur not found'
                    });
                }
                const trajets = await Trajet.find({ chauffeur: chauffeur._id });
                return res.json({ success: true, status: 200, data: trajets });
            }

            const trajets = await Trajet.find();
            return res.json({ success: true, status: 200, data: trajets });
        }

        const chauffeur = await Chauffeur.findOne({ user: req.user._id });

        if (!chauffeur || chauffeur.status !== 'actif') {
            return res.status(403).json({
                success: false,
                status: 403,
                message: 'Chauffeur non trouvé ou inactif'
            });
        }

        const trajets = await Trajet.find({ chauffeur: chauffeur._id });

        return res.json({ success: true, status: 200, data: trajets });
    } catch (err) {
        return next(err);
    }
};

exports.updateTrajetLog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const trajet = await Trajet.findById(id);
        if (!trajet) {
            return res.status(404).json({ success: false, status: 404, message: 'Trajet not found' });
        }

        if (req.user.role !== 'admin') {
            const chauffeur = await Chauffeur.findOne({ user: req.user._id });
            if (!chauffeur || chauffeur.status !== 'actif' || !trajet.chauffeur || String(trajet.chauffeur) !== String(chauffeur._id)) {
                return res.status(403).json({
                    success: false,
                    status: 403,
                    message: 'Accès refusé au trajet'
                });
            }
        }

        if (updates.kilometrageArrivee !== undefined) {
            if (updates.kilometrageArrivee < trajet.kilometrageDepart) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'Kilométrage arrivée invalide'
                });
            }
            if (trajet.kilometrageArrivee !== undefined && updates.kilometrageArrivee < trajet.kilometrageArrivee) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: 'Kilométrage arrivée ne peut pas diminuer'
                });
            }
            trajet.kilometrageArrivee = updates.kilometrageArrivee;
        }

        if (updates.volumeGasoilConsommee !== undefined) {
            trajet.volumeGasoilConsommee = updates.volumeGasoilConsommee;
        }

        if (updates.remarquesEtat !== undefined) {
            trajet.remarquesEtat = updates.remarquesEtat;
        }

        await trajet.save();

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
