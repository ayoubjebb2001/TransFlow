const MaintenanceRule = require('../models/MaintenanceRule');

exports.createRule = async (req, res, next) => {
    try {
        const rule = await MaintenanceRule.create(req.body);
        return res.status(201).json({ success: true, status: 201, data: rule });
    } catch (err) {
        return next(err);
    }
};

exports.listRules = async (req, res, next) => {
    try {
        const rules = await MaintenanceRule.find();
        return res.json({ success: true, status: 200, data: rules });
    } catch (err) {
        return next(err);
    }
};

exports.updateRule = async (req, res, next) => {
    try {
        const rule = await MaintenanceRule.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!rule) {
            return res.status(404).json({ success: false, status: 404, message: 'Règle non trouvée' });
        }
        return res.json({ success: true, status: 200, data: rule });
    } catch (err) {
        return next(err);
    }
};

exports.deleteRule = async (req, res, next) => {
    try {
        const rule = await MaintenanceRule.findByIdAndDelete(req.params.id);
        if (!rule) {
            return res.status(404).json({ success: false, status: 404, message: 'Règle non trouvée' });
        }
        return res.json({ success: true, status: 200, message: 'Règle supprimée' });
    } catch (err) {
        return next(err);
    }
};