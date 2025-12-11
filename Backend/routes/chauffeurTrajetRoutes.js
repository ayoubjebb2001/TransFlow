const express = require('express');
const {
    getChauffeurTrajets,
    updateTrajetLog,
    updateTrajetStatus,
    downloadTrajetPdf
} = require('../controllers/trajetController');
const { updateTrajetLogSchema, updateTrajetStatusSchema } = require('../validators/trajet');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', getChauffeurTrajets);
router.patch('/:id/log', validate(updateTrajetLogSchema), updateTrajetLog);
router.patch('/:id/status', validate(updateTrajetStatusSchema), updateTrajetStatus);
router.get('/:id/pdf', downloadTrajetPdf);

module.exports = router;
