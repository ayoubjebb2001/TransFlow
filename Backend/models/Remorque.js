const mongoose = require('mongoose');

const RemorqueSchema = new mongoose.Schema(
    {
        immatriculation: { type: String, required: true, unique: true, trim: true },
        marque: { type: String, required: true, trim: true },
        modele: { type: String, required: true, trim: true },
        annee: { type: Number, required: true },
        capacite: { type: Number, min: 0 },
        type: { type: String, enum: ['plateau', 'frigorifique', 'citerne', 'bachee', 'autre'], default: 'autre' },
        statut: { type: String, enum: ['disponible', 'en_mission', 'en_panne', 'maintenance'], default: 'disponible' },
        remarques: { type: String, trim: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Remorque', RemorqueSchema);
