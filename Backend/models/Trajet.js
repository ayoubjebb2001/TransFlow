const mongoose = require('mongoose');

const TrajetSchema = new mongoose.Schema(
    {
        depart: { type: String, required: true, trim: true },
        arrivee: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        camion: { type: mongoose.Schema.Types.ObjectId, ref: 'Camion', required: true },
        remorque: { type: mongoose.Schema.Types.ObjectId, ref: 'Remorque', default: null },
        chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Chauffeur', default: null },
        kilometrageDepart: { type: Number, required: true, min: 0 },
        kilometrageArrivee: { type: Number, min: 0 },
        volumeGasoilConsommee: { type: Number, min: 0, default: 0 },
        statut: { type: String, enum: ['à faire', 'en_cours', 'terminé'], default: 'à faire' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Trajet', TrajetSchema);
