const express = require('express');
const { createRule, listRules, updateRule, deleteRule } = require('../controllers/maintenanceRuleController');
const { createMaintenanceRuleSchema, updateMaintenanceRuleSchema } = require('../validators/maintenanceRule');
const validate = require('../middlewares/validate');

const router = express.Router();

router
    .route('/')
    .post(validate(createMaintenanceRuleSchema), createRule)
    .get(listRules);

router.route('/:id').put(validate(updateMaintenanceRuleSchema), updateRule).delete(deleteRule);

module.exports = router;