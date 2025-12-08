const mongoose = require('mongoose');

const PneuSchema = new mongoose.Schema(
    {
        numeroSerie: { type: String, required: true, unique: true, trim: true },
        marque: { type: String, required: true, trim: true },
        dimension: { type: String, required: true, trim: true },
        etat: { type: String, enum: ['neuf', 'use', 'a_remplacer'], default: 'neuf' },
        kilometrage: { type: Number, default: 0 },
        position: { type: String, trim: true },
        camion: { type: mongoose.Schema.Types.ObjectId, ref: 'Camion', default: null },
        remorque: { type: mongoose.Schema.Types.ObjectId, ref: 'Remorque', default: null },
        remarques: { type: String, trim: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Pneu', PneuSchema);
