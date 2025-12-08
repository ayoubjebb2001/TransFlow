const express = require('express');
const {
    createPneu,
    getPneus,
    getPneuById,
    updatePneu,
    deletePneu
} = require('../controllers/pneuController');
const { createPneuSchema, updatePneuSchema } = require('../validators/pneu');
const validate = require('../middlewares/validate');

const router = express.Router();

router
    .route('/')
    .post(validate(createPneuSchema), createPneu)
    .get(getPneus);

router
    .route('/:id')
    .get(getPneuById)
    .put(validate(updatePneuSchema), updatePneu)
    .delete(deletePneu);

module.exports = router;
