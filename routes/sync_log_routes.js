const express = require('express');
const router = express.Router();
const syncLogsController = require('../controllers/syncLogController');

router.get('/', syncLogsController.getSyncLogs);
router.get('/:id', syncLogsController.getSyncLog);
router.post("/", syncLogsController.createSyncLogValidation, syncLogsController.createSyncLog);
router.put('/:id', syncLogsController.updateSyncLogValidation, syncLogsController.updateSyncLog);
router.delete('/:id', syncLogsController.deleteSyncLog);

module.exports = router;
