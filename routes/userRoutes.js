const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.get('/getInfo', userController.getUserData);
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUserById);
router.post('/login', userController.Login);
router.post('/register', userController.Register);
router.put('/editProfile', userController.editProfile);
router.put('/resetpassword', userController.resetPassword);

module.exports = router;