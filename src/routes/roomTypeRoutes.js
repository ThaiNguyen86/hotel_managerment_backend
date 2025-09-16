// routes/roomTypeRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    getAllRoomTypes,
    getRoomType,
    createRoomType,
    updateRoomType,
    deleteRoomType
} = require('../controllers/roomTypeController');
const Permission = require('../models/Permission')
router.use(protect);

router.get('/', authorize(Permission.VIEW_ROOMTYPES),getAllRoomTypes); 
router.get('/:id',authorize(Permission.VIEW_ROOMTYPES), getRoomType);  
router.post('/',authorize(Permission.CREATE_ROOMTYPES), createRoomType);
router.patch('/:id',authorize(Permission.UPDATE_ROOMTYPES) ,updateRoomType);
router.delete('/:id',authorize(Permission.DELETE_ROOMTYPES), deleteRoomType);

module.exports = router;