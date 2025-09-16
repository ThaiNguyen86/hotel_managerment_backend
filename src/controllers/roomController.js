const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const BookingDetail = require('../models/BookingDetail')
const QueryHelper = require('../utils/QueryHelper')
/**
 * api : /api/rooms
 * required permission : all
 * possible query params : sort, limit, page , search 
 * @returns : success status, count (number of records) , total (total number of records), data 
 */
exports.getAllRooms = async (req, res) => {
    try {

        const { sort, search, page = 1, limit = 10 } = req.query;

        const filter = {};

        if (search) {
            const searchTerm = new RegExp(search, 'i'); 
            filter.$or = [
                { roomName: searchTerm },
                { 'roomTypeId.name': searchTerm },
                { notes: searchTerm }
            ];
        }

        let sortOption = {};
        if (sort) {
            if (sort === 'roomTypeId.price' || sort === '-roomTypeId.price') {
                sortOption = { 'roomTypeId.price': sort.startsWith('-') ? -1 : 1 };
            } else {
                sortOption[sort.replace('-', '')] = sort.startsWith('-') ? -1 : 1;
            }
        }

        const total = await Room.countDocuments(filter);
        
        const skip = (page - 1) * limit; 
        const rooms = await Room.find(filter)
            .populate('roomTypeId')
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            count: rooms.length,
            total,
            data: rooms
        });
    } catch (error) {
        console.error('Get all rooms error:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * api : /api/rooms
 * require : admin,manager,receptionist role
 */
exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('roomTypeId');

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * API endpoint example POST http://localhost:4000/api/rooms
 * require : admin,manager role
 * @param {roomName,roomTypeId,notes,status(optional)}
 */
exports.createRoom = async (req, res) => {
    try {
        const { roomTypeId, roomName, status, notes } = req.body;

        // Verify room type exists
        const roomType = await RoomType.findById(roomTypeId);
        if (!roomType) {
            return res.status(404).json({
                success: false,
                error: 'Room type not found'
            });
        }

        const room = await Room.create({
            roomTypeId,
            roomName,
            status,
            notes
        });

        res.status(201).json({
            success: true,
            data: await room.populate('roomTypeId')
        });
    } catch (error) {
        console.error('Create room error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Room name already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * API endpoint : PATCH http://localhost:4000/api/rooms/{roomId}
 * require : admin,manager
 */
exports.updateRoom = async (req, res) => {
    try {
        const { roomTypeId, roomName, status, notes } = req.body;

        // If roomTypeId is provided, verify it exists
        if (roomTypeId) {
            const roomType = await RoomType.findById(roomTypeId);
            if (!roomType) {
                return res.status(404).json({
                    success: false,
                    error: 'Room type not found'
                });
            }
        }

        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { roomTypeId, roomName, status, notes },
            {
                new: true,
                runValidators: true
            }
        ).populate('roomTypeId');

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Update room error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Room name already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * API endpoint example DELETE : /api/rooms/:room_id
 * require : admin,manager role
 * @param {req.params = {room_id}}
 */
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        if (!checkRoomAvailability(room._id)) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete occupied room'
            });
        }

        await room.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * api : /api/rooms
 * require : admin,manager,receptionist role
 */
exports.getAvailableRooms = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            const rooms = await Room.find({ status: 'available' })
                .populate('roomTypeId');

            return res.status(200).json({
                success: true,
                count: rooms.length,
                data: rooms
            });
        }

        // Find rooms not booked in the date range
        const bookedRoomIds = await BookingDetail.distinct('roomId', {
            $or: [
                {
                    checkInDate: { $lte: new Date(checkOut) },
                    checkOutDate: { $gte: new Date(checkIn) }
                }
            ]
        });

        const availableRooms = await Room.find({
            _id: { $nin: bookedRoomIds },
            status: 'available'
        }).populate('roomTypeId');

        res.status(200).json({
            success: true,
            count: availableRooms.length,
            data: availableRooms
        });
    } catch (error) {
        console.error('Get available rooms error:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Helper function to check room availability
const checkRoomAvailability = async (roomId) => {
    const now = new Date()
    const overlappingBookings = await BookingDetail.find({
        roomId,
        checkOutDate: { $gte: now }
    });

    return overlappingBookings.length === 0;
};