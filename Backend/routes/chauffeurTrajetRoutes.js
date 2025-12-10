const express = require('express');
const { getChauffeurTrajets, updateTrajetLog, downloadTrajetPdf } = require('../controllers/trajetController');
const { updateTrajetLogSchema } = require('../validators/trajet');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', getChauffeurTrajets);
router.patch('/:id/log', validate(updateTrajetLogSchema), updateTrajetLog);
router.get('/:id/pdf', downloadTrajetPdf);

module.exports = router;
