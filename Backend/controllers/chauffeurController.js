const Chauffeur = require('../models/Chauffeur');
const User = require('../models/User');

exports.listChauffeurs = async (req, res, next) => {
    try {
        const chauffeurs = await Chauffeur.find().populate('user', '-password');
        return res.json({ success: true, status: 200, data: chauffeurs });
    } catch (err) {
        return next(err);
    }
};

exports.updateChauffeur = async (req, res, next) => {
    try {
        const updates = req.body;
        const chauffeur = await Chauffeur.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
            context: 'query'
        }).populate('user', '-password');

        if (!chauffeur) {
            return res.status(404).json({ success: false, status: 404, message: 'Chauffeur not found' });
        }

        return res.json({ success: true, status: 200, data: chauffeur });
    } catch (err) {
        return next(err);
    }
};

exports.deleteChauffeur = async (req, res, next) => {
    try {
        const chauffeur = await Chauffeur.findById(req.params.id);
        if (!chauffeur) {
            return res.status(404).json({ success: false, status: 404, message: 'Chauffeur not found' });
        }

        await User.findByIdAndDelete(chauffeur.user);
        await Chauffeur.findByIdAndDelete(req.params.id);

        return res.json({ success: true, status: 200, message: 'Chauffeur deleted' });
    } catch (err) {
        return next(err);
    }
};
