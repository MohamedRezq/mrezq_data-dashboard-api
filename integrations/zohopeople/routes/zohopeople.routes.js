const express = require('express');
const router = express.Router();
// Import Controller ---------------------------------------------//
const controller = require('../controllers/zohopeople.controller');


//----------------------------------------------------------------//
router.post("/exchange-code", controller.handleCodeExchange);
router.post("/sync-data", controller.syncData);
router.post("/get-data", controller.getData);
router.post("/validate-tokens", controller.validateTokens);
//----------------------------------------------------------------//
module.exports = router;
