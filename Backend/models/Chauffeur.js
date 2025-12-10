const mongoose = require('mongoose');

const ChauffeurSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        phone: { type: String, trim: true,required: true },
        licenseNumber: { type: String, trim: true },
        status: { type: String, enum: ['actif', 'inactif'], default: 'inactif' },
        serviceYears: { type: Number, min: 0, default: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Chauffeur', ChauffeurSchema);
