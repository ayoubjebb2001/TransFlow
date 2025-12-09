const express = require('express');
const { getChauffeurTrajets } = require('../controllers/trajetController');

const router = express.Router();

router.get('/', getChauffeurTrajets);

module.exports = router;
