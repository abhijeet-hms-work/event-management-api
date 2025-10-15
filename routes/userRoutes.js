const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser } = require('../middleware/validation');

// User routes
router.post('/', validateUser, userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUser);

module.exports = router;
