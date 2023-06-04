const express = require('express');
const router = express.Router();
const organizationApplicationsController = require('../controllers/organizationApplicationsController');

router.get('/', organizationApplicationsController.getOrganizationApplications);
router.get('/:id', organizationApplicationsController.getOrganizationApplication);
router.post("/", organizationApplicationsController.organizationApplicationValidation, organizationApplicationsController.createOrganizationApplication);
router.put('/:id', organizationApplicationsController.organizationApplicationValidation, organizationApplicationsController.updateOrganizationApplication);
router.delete('/:id', organizationApplicationsController.deleteOrganizationApplication);

module.exports = router;
