const express = require('express');
const router = express.Router();
const organizationsController = require('../controllers/organizationsController');

router.get('/', organizationsController.getOrganizations);
router.get('/:id', organizationsController.getOrganization);
router.post("/", organizationsController.organizationValidationRules, organizationsController.createOrganization);
router.put('/:id', organizationsController.organizationValidationRules, organizationsController.updateOrganization);
router.delete('/:id', organizationsController.deleteOrganization);

module.exports = router;
