const mongoose = require('mongoose');

const CamionSchema = new mongoose.Schema(
    {
        immatriculation: { type: String, required: true, unique: true, trim: true },
        marque: { type: String, required: true, trim: true },
        modele: { type: String, required: true, trim: true },
        annee: { type: Number, required: true },
        kilometrage: { type: Number, default: 0 },
        statut: {
            type: String,
            enum: ['disponible', 'en_mission','en_panne', 'maintenance'],
            default: 'disponible'
        },
        capacite: { type: Number },
        carburant: { type: String, enum: ['diesel', 'essence', 'electrique', 'gpl'], default: 'diesel' },
        volumeCarburant: { type: Number, default: 0 },
        remarques : { type: String, trim: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Camion', CamionSchema);
