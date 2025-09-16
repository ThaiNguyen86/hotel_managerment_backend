const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const Permission = require('../models/Permission')
const {
    getAllBookings,
    getBooking,
    createBooking,
    updateBookingStatus,
    deleteBooking,
    getBookingsByUser,
    getBookingStats,
    getAllUncompletedBookings
} = require('../controllers/bookingController');

// Protect all routes
router.use(protect);

// Routes cho staff/receptionist 
router.post('/',authorize(Permission.CREATE_BOOKINGS), createBooking);
router.get('/my-bookings',authorize(Permission.VIEW_BOOKINGS), getBookingsByUser);

// Admin routes
router.get('/',authorize(Permission.VIEW_BOOKINGS), getAllBookings);
router.get('/uncompleted',authorize(Permission.VIEW_BOOKINGS), getAllUncompletedBookings);

router.get('/stats/summary',authorize(Permission.VIEW_REPORTS) ,getBookingStats);
router.put('/:id/status',authorize(Permission.UPDATE_BOOKINGS), updateBookingStatus);
router.delete('/:id',authorize(Permission.DELETE_BOOKINGS), deleteBooking);  // Xóa booking

module.exports = router;