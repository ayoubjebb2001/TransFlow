const express = require('express');
const { getChauffeurTrajets, updateTrajetLog } = require('../controllers/trajetController');
const { updateTrajetLogSchema } = require('../validators/trajet');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', getChauffeurTrajets);
router.patch('/:id/log', validate(updateTrajetLogSchema), updateTrajetLog);

module.exports = router;
