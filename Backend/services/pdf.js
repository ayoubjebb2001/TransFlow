const PDFDocument = require('pdfkit');

async function generateMissionPdf({ trajet, camion, chauffeur, remorque }) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(18).text('Ordre de mission', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Trajet: ${trajet._id}`);
        doc.text(`Date: ${new Date(trajet.date).toLocaleDateString('fr-FR')}`);
        doc.text(`Départ: ${trajet.depart}`);
        doc.text(`Arrivée: ${trajet.arrivee}`);
        doc.moveDown();

        if (camion) {
            doc.text('Camion:');
            doc.text(`  Immatriculation: ${camion.immatriculation || camion._id}`);
            if (camion.kilometrage !== undefined) {
                doc.text(`  Kilométrage: ${camion.kilometrage} km`);
            }
            doc.moveDown();
        }

        if (remorque) {
            doc.text('Remorque:');
            doc.text(`  Immatriculation: ${remorque.immatriculation || remorque._id}`);
            doc.moveDown();
        }

        if (chauffeur) {
            doc.text('Chauffeur:');
            doc.text(`  Id: ${chauffeur._id}`);
            if (chauffeur.user && chauffeur.user.name) {
                doc.text(`  Nom: ${chauffeur.user.name}`);
            }
            doc.moveDown();
        }

        doc.text('Détails supplémentaires:');
        if (trajet.kilometrageDepart !== undefined) doc.text(`  Km départ: ${trajet.kilometrageDepart} km`);
        if (trajet.kilometrageArrivee !== undefined) doc.text(`  Km arrivée: ${trajet.kilometrageArrivee} km`);
        if (trajet.volumeGasoilConsommee !== undefined) doc.text(`  Gasoil consommé: ${trajet.volumeGasoilConsommee} L`);
        if (trajet.remarquesEtat) doc.text(`  Remarques: ${trajet.remarquesEtat}`);

        doc.end();
    });
}

module.exports = { generateMissionPdf };
