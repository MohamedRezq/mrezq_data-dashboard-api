const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.get('/', applicationController.getApplications);
router.get('/:id', applicationController.getApplication);
router.post('/', applicationController.applicationValidationRules, applicationController.createApplication);
router.put('/:id', applicationController.applicationValidationRules, applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
