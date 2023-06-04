// controllers/applicationCategoriesController.js

const { ApplicationCategory } = require("../models");
const { check, validationResult } = require("express-validator");

exports.createApplicationCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required.")
    .trim(),
];

exports.updateApplicationCategoryValidator = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Category name is required.")
    .trim(),
];

exports.deleteApplicationCategoryValidator = [];

// Get a single application category by ID
exports.getApplicationCategory = async (req, res) => {
  const id = req.params.id;

  try {
    const applicationCategory = await ApplicationCategory.findOne({
      where: { id: id, deleted_at: null }
    });

    if (!applicationCategory) {
      return res.status(404).json({ error: 'Application category not found' });
    }

    res.json(applicationCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getApplicationCategories = async (req, res) => {
  try {
    const applicationCategories = await ApplicationCategory.findAll();
    res.status(200).json(applicationCategories);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching application categories." });
  }
};

exports.createApplicationCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const applicationCategory = await ApplicationCategory.create(req.body);
    res.status(201).json(applicationCategory);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while creating the application category." });
  }
};

exports.updateApplicationCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const [updatedRows] = await ApplicationCategory.update(req.body, { where: { id } });

    if (updatedRows === 0) {
      return res.status(404).json({ error: "Application category not found." });
    }

    res.status(200).json({ message: "Application category updated successfully." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while updating the application category." });
  }
};

exports.deleteApplicationCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await ApplicationCategory.destroy({ where: { id } });

    if (deletedRows === 0) {
      return res.status(404).json({ error: "Application category not found." });
    }

    res.status(200).json({ message: "Application category deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while deleting the application category." });
  }
};
