const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const Permission = require('../models/Permission')

router.post('/login', userController.login);
router.post('/register', userController.register);

router.use(protect);
router.post('/logout', protect, userController.logout);
router.get('/:id', userController.getUser);

router.use(authorize(Permission.MANAGE_USERS));

router.get('/', userController.getAllUsers);
router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;