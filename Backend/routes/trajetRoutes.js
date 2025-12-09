const express = require('express');
const {
    createTrajet,
    getTrajets,
    getTrajetById,
    updateTrajet,
    deleteTrajet,
    assignChauffeur
} = require('../controllers/trajetController');
const { createTrajetSchema, updateTrajetSchema, assignChauffeurSchema } = require('../validators/trajet');
const validate = require('../middlewares/validate');

const router = express.Router();

router
    .route('/')
    .post(validate(createTrajetSchema), createTrajet)
    .get(getTrajets);

router.patch('/:id/assign-chauffeur', validate(assignChauffeurSchema), assignChauffeur);

router
    .route('/:id')
    .get(getTrajetById)
    .put(validate(updateTrajetSchema), updateTrajet)
    .delete(deleteTrajet);

module.exports = router;
