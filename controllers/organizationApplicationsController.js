const { OrganizationApplication } = require('../models');
const { check, validationResult } = require("express-validator");

exports.organizationApplicationValidation = [
    check('organization_id').notEmpty().isInt().withMessage('Organization ID must be an integer'),
    check('application_id').notEmpty().isInt().withMessage('Application ID must be an integer'),
  ];

exports.createOrganizationApplication = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const organizationApplication = await OrganizationApplication.create(req.body);
    res.status(201).json(organizationApplication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrganizationApplications = async (req, res) => {
  try {
    const organizationApplications = await OrganizationApplication.findAll();
    res.status(200).json(organizationApplications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrganizationApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const organizationApplication = await OrganizationApplication.findByPk(id);

    if (!organizationApplication) {
      return res.status(404).json({ error: 'OrganizationApplication not found' });
    }

    res.status(200).json(organizationApplication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrganizationApplication = async (req, res) => {
  const { id } = req.params;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const [updated] = await OrganizationApplication.update(req.body, {
      where: { id: id },
    });

    if (updated) {
      const updatedOrganizationApplication = await OrganizationApplication.findByPk(id);
      res.status(200).json(updatedOrganizationApplication);
    } else {
      res.status(404).json({ error: 'OrganizationApplication not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOrganizationApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const organizationApplication = await OrganizationApplication.findByPk(id);

    if (!organizationApplication) {
      return res.status(404).json({ error: 'OrganizationApplication not found' });
    }

    await OrganizationApplication.update({ deleted_at: new Date() }, { where: { id: id } });
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
