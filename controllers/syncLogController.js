const { check, validationResult } = require("express-validator");
const { SyncLog, Organization, OrganizationApplication } = require('../models');

exports.createSyncLogValidation = [
  check('organization_id')
    .notEmpty()
    .withMessage('Organization ID is required')
    .isInt()
    .withMessage('Organization ID must be an integer'),
  check('organization_application_id')
    .notEmpty()
    .withMessage('Organization Application ID is required')
    .isInt()
    .withMessage('Organization Application ID must be an integer'),
  check('sync_target')
    .notEmpty()
    .withMessage('Sync target is required')
    .isString()
    .withMessage('Sync target must be a string'),
  check('sync_type')
    .notEmpty()
    .withMessage('Sync type is required')
    .isIn(['manual', 'scheduled'])
    .withMessage('Sync type must be either "manual" or "scheduled"'),
  check('sync_status')
    .notEmpty()
    .withMessage('Sync status is required')
    .isIn(['pending', 'in_progress', 'success', 'failed'])
    .withMessage('Sync status must be one of "pending", "in_progress", "success", or "failed"'),
  check('start_time')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be in ISO 8601 format')
];

exports.updateSyncLogValidation = [
  check('organization_id')
    .notEmpty()
    .withMessage('Organization ID is required')
    .isInt()
    .withMessage('Organization ID must be an integer'),
  check('organization_application_id')
    .notEmpty()
    .withMessage('Organization Application ID is required')
    .isInt()
    .withMessage('Organization Application ID must be an integer'),
  check('sync_status')
    .notEmpty()
    .withMessage('Sync status is required')
    .isIn(['pending', 'in_progress', 'success', 'failed'])
    .withMessage('Sync status must be one of "pending", "in_progress", "success", or "failed"'),
  check('end_time')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be in ISO 8601 format')
];

exports.createSyncLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const syncLog = await SyncLog.create(req.body);
    res.status(201).json(syncLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSyncLogs = async (req, res) => {
  try {
    // const syncLogs = await SyncLog.findAll();
    const syncLogs = await SyncLog.findAll({
        include: [
          { model: Organization, as: 'organization' },
          { model: OrganizationApplication, as: 'organizationApplication' },
        ],
      });
    res.status(200).json(syncLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSyncLog = async (req, res) => {
    try {
      const syncLogId = req.params.id;
      const syncLog = await SyncLog.findOne({
        where: { id: syncLogId },
        include: [
          { model: Organization, as: 'organization' },
          { model: OrganizationApplication, as: 'organizationApplication' },
        ],
      });
  
      if (!syncLog) {
        return res.status(404).json({ error: 'Sync Log not found' });
      }
  
      res.status(200).json(syncLog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.updateSyncLog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const synLog = await SyncLog.findByPk(req.params.id);
    if (!synLog) {
      return res.status(404).json({ error: 'SyncLog not found' });
    }
    await synLog.update(req.body);
    res.status(200).json(synLog);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSyncLog = async (req, res) => {
  try {
    const deleted = await SyncLog.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
      res.status(204).json({ message: 'SyncLog deleted' });
    } else {
      res.status(404).json({ error: 'SyncLog not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
