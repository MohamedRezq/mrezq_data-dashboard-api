// controllers/applicationController.js

const { Application, ApplicationCategory } = require('../models');
const { check, validationResult } = require('express-validator');

exports.applicationValidationRules = [
  check('name').notEmpty().withMessage('Name is required'),
  check('description').optional(),
  check('category_id').isInt().withMessage('Category ID must be an integer'),
  check('logo_url').optional(),
  check('active').isBoolean().withMessage('Active must be a boolean'),
];

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: ApplicationCategory,
          as: 'category',
        },
      ],
    });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving applications', error });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        {
          model: ApplicationCategory,
          as: 'category',
        },
      ],
    });

    if (application) {
      res.status(200).json(application);
    } else {
      res.status(404).json({ message: 'Application not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving application', error });
  }
};

exports.createApplication = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const application = await Application.create(req.body);
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateApplication  = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    await application.update(req.body);
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    await application.update({ deleted_at: new Date() });
    res.status(204).json({ message: 'Application soft-deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
