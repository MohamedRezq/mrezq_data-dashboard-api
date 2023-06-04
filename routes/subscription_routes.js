const express = require('express');
const router = express.Router();
const subscriptionsController = require('../controllers/subscriptionController');

router.get('/', subscriptionsController.getSubscriptions);
router.get('/:id', subscriptionsController.getSubscription);
router.post("/", subscriptionsController.SubscriptionValidation, subscriptionsController.createSubscription);
router.put('/:id', subscriptionsController.SubscriptionValidation, subscriptionsController.updateSubscription);
router.delete('/:id', subscriptionsController.deleteSubscription);

module.exports = router;
