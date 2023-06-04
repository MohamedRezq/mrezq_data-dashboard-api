// controllers/departmentController.js
const { Department, Organization } = require('../models');
const { check, validationResult } = require('express-validator');

exports.departmentValidationRules = [
    check('organization_id')
      .not()
      .isEmpty()
      .withMessage('Organization ID is required')
      .isInt()
      .withMessage('Organization ID must be an integer'),
    check('name')
      .not()
      .isEmpty()
      .withMessage('Department name is required')
      .isLength({ max: 255 })
      .withMessage('Department name cannot be longer than 255 characters'),
  ];

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: { model: Organization, as: 'organization' },
    });
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDepartment = async (req, res) => {
  try {
    const department = await Department.findOne({
      where: { id: req.params.id },
      include: { model: Organization, as: 'organization' },
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDepartment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const department = await Department.update(req.body, {
      where: { id: req.params.id },
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.status(200).json({ message: 'Department updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.update(
      { deleted_at: new Date() },
      { where: { id: req.params.id } }
    );

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
