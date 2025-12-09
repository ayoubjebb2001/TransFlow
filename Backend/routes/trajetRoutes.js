const express = require('express');
const {
    createTrajet,
    getTrajets,
    getTrajetById,
    updateTrajet,
    deleteTrajet
} = require('../controllers/trajetController');
const { createTrajetSchema, updateTrajetSchema } = require('../validators/trajet');
const validate = require('../middlewares/validate');

const router = express.Router();

router
    .route('/')
    .post(validate(createTrajetSchema), createTrajet)
    .get(getTrajets);

router
    .route('/:id')
    .get(getTrajetById)
    .put(validate(updateTrajetSchema), updateTrajet)
    .delete(deleteTrajet);

module.exports = router;
