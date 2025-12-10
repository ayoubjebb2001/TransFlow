const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function generateMissionPdf({ trajet, camion, chauffeur, remorque }) {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const margin = 50;
    let cursorY = height - margin;

    const lineHeight = 16;

    const drawHeading = (text) => {
        const size = 18;
        const textWidth = boldFont.widthOfTextAtSize(text, size);
        page.drawText(text, {
            x: (width - textWidth) / 2,
            y: cursorY,
            size,
            font: boldFont,
            color: rgb(0, 0, 0)
        });
        cursorY -= size + 10;
    };

    const drawLabelValue = (label, value) => {
        if (value === undefined || value === null || value === '') return;
        page.drawText(`${label}: ${value}`, {
            x: margin,
            y: cursorY,
            size: 12,
            font,
            color: rgb(0, 0, 0)
        });
        cursorY -= lineHeight;
    };

    const drawSection = (title, rows) => {
        page.drawText(title, {
            x: margin,
            y: cursorY,
            size: 14,
            font: boldFont,
            color: rgb(0, 0, 0)
        });
        cursorY -= lineHeight;
        rows.forEach(({ label, value }) => drawLabelValue(label, value));
        cursorY -= 4; // small spacer
    };

    drawHeading('Ordre de mission');

    drawSection('Trajet', [
        { label: 'ID', value: trajet._id },
        { label: 'Date', value: trajet.date ? new Date(trajet.date).toLocaleDateString('fr-FR') : undefined },
        { label: 'Départ', value: trajet.depart },
        { label: 'Arrivée', value: trajet.arrivee }
    ]);

    if (camion) {
        drawSection('Camion', [
            { label: 'Immatriculation', value: camion.immatriculation || camion._id },
            { label: 'Kilométrage', value: camion.kilometrage !== undefined ? `${camion.kilometrage} km` : undefined }
        ]);
    }

    if (remorque) {
        drawSection('Remorque', [
            { label: 'Immatriculation', value: remorque.immatriculation || remorque._id }
        ]);
    }

    if (chauffeur) {
        drawSection('Chauffeur', [
            { label: 'ID', value: chauffeur._id },
            { label: 'Nom', value: chauffeur.user && chauffeur.user.name ? chauffeur.user.name : undefined },
            { label: 'Statut', value: chauffeur.status }
        ]);
    }

    drawSection('Détails supplémentaires', [
        { label: 'Km départ', value: trajet.kilometrageDepart !== undefined ? `${trajet.kilometrageDepart} km` : undefined },
        { label: 'Km arrivée', value: trajet.kilometrageArrivee !== undefined ? `${trajet.kilometrageArrivee} km` : undefined },
        { label: 'Gasoil consommé', value: trajet.volumeGasoilConsommee !== undefined ? `${trajet.volumeGasoilConsommee} L` : undefined },
        { label: 'Remarques', value: trajet.remarquesEtat }
    ]);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}

module.exports = { generateMissionPdf };
