const express = require('express');
const router = express.Router();
const applicationCategoriesController = require('../controllers/application_categoriesController');

router.get('/', applicationCategoriesController.getApplicationCategories);
router.get('/:id', applicationCategoriesController.getApplicationCategory);
router.post('/', applicationCategoriesController.createApplicationCategory);
router.put('/:id', applicationCategoriesController.updateApplicationCategory);
router.delete('/:id', applicationCategoriesController.deleteApplicationCategory);

module.exports = router;
