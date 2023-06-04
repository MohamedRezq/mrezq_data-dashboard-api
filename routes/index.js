const express = require("express");
const router = express.Router();
const cors = require('cors');

// Import controllers and middlewares as needed

// Set up routes
// router.get("/some-route", someController.someAction);

router.get("/test", (req, res) => {
    res.status(200).json({ message: "Test route is working!" });
  });


router.use('/application_categories', require('./application_categories_routes'));
router.use('/applications', require('./application_routes'));
router.use('/organizations', require('./organization_routes'));
router.use('/departments', require('./department_routes'));
router.use('/users', require('./user_routes'));
router.use('/organization_applications', require('./organization_applications_routes'));
router.use('/subscriptions', require('./subscription_routes'));
router.use('/sync_log', require('./sync_log_routes'));

//Applications routes
router.use('/quickbooks',cors(), require('../integrations/quickbooks/routes/quickbooks.routes'));

module.exports = router;
