const express = require('express');
const router = express.Router();
const controller = require('../controllers/quickbooks.controller');

router.get('/authenticate', controller.authorize);
router.get('/callback', controller.handleAuthorizationCallback);

module.exports = router;
