const express = require('express');
const {
    createRemorque,
    getRemorques,
    getRemorqueById,
    updateRemorque,
    deleteRemorque
} = require('../controllers/remorqueController');
const { createRemorqueSchema, updateRemorqueSchema } = require('../validators/remorque');
const validate = require('../middlewares/validate');

const router = express.Router();

router
    .route('/')
    .post(validate(createRemorqueSchema), createRemorque)
    .get(getRemorques);

router
    .route('/:id')
    .get(getRemorqueById)
    .put(validate(updateRemorqueSchema), updateRemorque)
    .delete(deleteRemorque);

module.exports = router;
