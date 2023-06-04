const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userController');

router.get('/users', usersController.getUsers);
router.post('/users', usersController.validateUser, usersController.createUser);
router.get('/users/:id', usersController.getUser);
router.put('/users/:id', usersController.validateUser, usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);

module.exports = router;