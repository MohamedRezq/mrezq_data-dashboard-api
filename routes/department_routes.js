const express = require('express');
const router = express.Router();
const departmentsController = require('../controllers/departmentController');

router.get('/', departmentsController.getDepartments);
router.get('/:id', departmentsController.getDepartment);
router.post("/", departmentsController.departmentValidationRules, departmentsController.createDepartment);
router.put('/:id', departmentsController.departmentValidationRules, departmentsController.updateDepartment);
router.delete('/:id', departmentsController.deleteDepartment);

module.exports = router;
