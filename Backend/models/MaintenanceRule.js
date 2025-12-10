const mongoose = require('mongoose');

const MaintenanceRuleSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['pneus', 'vidange', 'revision', 'autre'], required: true },
        label: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        periodiciteKm: { type: Number, min: 0 },
        periodiciteJours: { type: Number, min: 0 },
        actif: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('MaintenanceRule', MaintenanceRuleSchema);