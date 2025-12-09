const express = require('express');
const { listChauffeurs, updateChauffeur, deleteChauffeur } = require('../controllers/chauffeurController');
const { updateChauffeurSchema } = require('../validators/chauffeur');
const validate = require('../middlewares/validate');

const router = express.Router();

router.route('/').get(listChauffeurs);
router.route('/:id').put(validate(updateChauffeurSchema), updateChauffeur).delete(deleteChauffeur);

module.exports = router;
