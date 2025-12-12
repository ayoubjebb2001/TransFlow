const express = require('express');
const {
    createCamion,
    getCamions,
    getCamionById,
    updateCamion,
    deleteCamion
} = require('../controllers/camionController');
const { createCamionSchema, updateCamionSchema } = require('../validators/camion');
const validate = require('../middlewares/validate');

const router = express.Router();

router
    .route('/')
    .post(validate(createCamionSchema), createCamion)
    .get(getCamions);

router
    .route('/:id')
    .get(getCamionById)
    .put(validate(updateCamionSchema), updateCamion)
    .delete(deleteCamion);

module.exports = router;
