const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userController');
//---------------------------------------------------------------//
router.get('/get-users', usersController.getUsers);
router.post('/create', usersController.validateUser, usersController.createUser); 
router.post("/login", usersController.loginUser);
router.post('/get-user', usersController.getUser);
router.put('/update/:id', usersController.validateUser, usersController.updateUser);
router.delete('/delete/:id', usersController.deleteUser);
//---------------------------------------------------------------//
module.exports = router;