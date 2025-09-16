// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const reportController = require('../controllers/reportController');
const Permission = require('../models/Permission')

router.use(protect);

router.get('/general-monthly',authorize(Permission.VIEW_REPORTS), reportController.generateMonthlyReport);
router.get('/roomtype-monthly',authorize(Permission.VIEW_REPORTS), reportController.revenuePerRoomType);
router.get('/room-density-monthly',authorize(Permission.VIEW_REPORTS), reportController.usageDensityByRoom);


module.exports = router;