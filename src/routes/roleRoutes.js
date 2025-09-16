const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect, authorize } = require('../middlewares/auth');
const Permission = require('../models/Permission')

router.use(protect);

router.use(authorize(Permission.MANAGE_ROLES));

router.get('/', roleController.getAllRoles);

module.exports = router;