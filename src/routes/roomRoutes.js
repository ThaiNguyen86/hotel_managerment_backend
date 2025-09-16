// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const Permission = require('../models/Permission')
const { protect, authorize } = require('../middlewares/auth');
const {
    getAllRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    getAvailableRooms
} = require('../controllers/roomController');

// Public routes (không cần đăng nhập)
router.get('/available', getAvailableRooms); // Cho trang chủ

// Protected routes (yêu cầu đăng nhập)
router.use(protect);
router.get('/:id', getRoom);
// 
// Admin routes
router.get('/',authorize(Permission.VIEW_ROOMS), getAllRooms);
router.patch('/:id',authorize(Permission.UPDATE_ROOMS), updateRoom);

// Only admin access
router.post('/',authorize(Permission.CREATE_ROOMS), createRoom);
router.delete('/:id',authorize(Permission.DELETE_ROOMS), deleteRoom);

module.exports = router;