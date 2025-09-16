const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');


/**
 * API endpoint example : GET http://localhost:4000/api/reports/room-density-monthly?time=12-2024
 * @param {req.query.time = "mm-yyyy"}   
 * @required_role admin, manager
 */
exports.usageDensityByRoom = async(req,res)=>{
    try {
        const {time} = req.query 

        const [month,year] = time.split('-').map(Number)

        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return res.status(404).json({ success: false, error: 'Invalid year or month format' });
        }

        const startDate = new Date(year, month - 1, 1); 
        const endDate = new Date(year, month, 0);

        const report = await Invoice.aggregate([
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            { $unwind: '$booking' },
        
            {
                $lookup: {
                    from: 'bookingdetails',
                    localField: 'booking.bookingDetails',
                    foreignField: '_id',
                    as: 'bookingDetails'
                }
            },
            { $unwind: '$bookingDetails' },
        
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'bookingDetails.roomId',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            { $unwind: '$room' },
        
            {
                $match: {
                    $or: [
                        {
                            $and: [
                                { 'bookingDetails.checkInDate': { $lte: endDate } }, 
                                { 'bookingDetails.checkOutDate': { $gte: startDate } }
                            ]
                        }
                    ]
                }
            },
        
            {
                $addFields: {
                    numberOfDays: {
                        $floor: {
                            $add: [
                                {
                                    $divide: [
                                        {
                                            $subtract: [
                                                {
                                                    $cond: [
                                                        { $gte: ['$bookingDetails.checkOutDate', endDate] },
                                                        endDate,
                                                        '$bookingDetails.checkOutDate'
                                                    ]
                                                },
                                                {
                                                    $cond: [
                                                        { $lte: ['$bookingDetails.checkInDate', startDate] },
                                                        startDate,
                                                        '$bookingDetails.checkInDate'
                                                    ]
                                                }
                                            ]
                                        },
                                        1000 * 60 * 60 * 24
                                    ]
                                },
                                1
                            ]
                        }
                    }
                }
            },
        
            {
                $group: {
                    _id: '$room._id',
                    roomName: { $first: '$room.roomName' },
                    totalDays: { $sum: '$numberOfDays' }
                }
            },
        
            {
                $group: {
                    _id: null,
                    totalDaysAllRooms: { $sum: '$totalDays' },
                    rooms: { $push: { roomName: '$roomName', totalDays: '$totalDays' } }
                }
            },
        
            { $unwind: '$rooms' },
        
            {
                $project: {
                    _id: 0,
                    roomName: '$rooms.roomName',
                    totalDays: '$rooms.totalDays',
                    percentage: {
                        $multiply: [
                            { $divide: ['$rooms.totalDays', '$totalDaysAllRooms'] },
                            100
                        ]
                    }
                }
            }
        ]);
        
      
        res.status(200).json({
            success: true,
            data: {report}
        });
    } catch (error) {
        console.error('Error while processing report :',error)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}
/**
 * API endpoint example : GET http://localhost:4000/api/reports/roomtype-monthly?time=12-2024
 * @param {req.query.time = "mm-yyyy"}   
 * @required_role admin, manager
 */
exports.revenuePerRoomType = async(req,res)=>{
    try {
        const {time} = req.query 

        const [month,year] = time.split('-').map(Number)

        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return res.status(404).json({ success: false, error: 'Invalid year or month format' });
        }

        const startDate = new Date(year, month - 1, 1); 
        const endDate = new Date(year, month, 0);

        const report = await Invoice.aggregate([
            {
                $lookup: {
                    from: 'bookings', 
                    localField: 'bookingId', 
                    foreignField: '_id', 
                    as: 'booking'
                }
            },
            { $unwind: '$booking' },
        
            {
                $lookup: {
                    from: 'bookingdetails', 
                    localField: 'booking.bookingDetails', 
                    foreignField: '_id', 
                    as: 'booking.bookingDetails' 
                }
            },
            { $unwind: '$booking.bookingDetails' }, 
        
            {
                $lookup: {
                    from: 'rooms', 
                    localField: 'booking.bookingDetails.roomId',
                    foreignField: '_id', 
                    as: 'booking.bookingDetails.room' 
                }
            },
            { $unwind: '$booking.bookingDetails.room' }, 
        
            {
                $lookup: {
                    from: 'roomtypes',
                    localField: 'booking.bookingDetails.room.roomTypeId',
                    foreignField: '_id', 
                    as: 'booking.bookingDetails.room.roomType' 
                }
            },
            { $unwind: '$booking.bookingDetails.room.roomType' }, 
        
            {
                $match: {
                    'booking.createdAt': {
                        $gte: startDate,
                        $lte: endDate   
                    }
                }
            },
        
            {
                $group: {
                    _id: '$booking.bookingDetails.room.roomType._id', 
                    roomTypeName: { $first: '$booking.bookingDetails.room.roomType.name' }, 
                    revenue: { $sum: '$totalAmount' } 
                }
            },
        
            {
                $project: {
                    roomTypeName: 1,
                    revenue: 1
                }
            },
        
            {
                $group: {
                    _id: '$_id',
                    roomTypeName: { $first: '$roomTypeName' }, 
                    totalRevenue: { $sum: '$revenue' },
                    revenue: { $sum: '$revenue' }
                }
            },
            {
                $group: {
                    _id: null, 
                    totalRevenue: { $sum: '$totalRevenue' },
                    roomTypes: { $push: {
                        roomTypeName: '$roomTypeName',
                        revenue: '$revenue'
                    }}
                }
            },
            {
                $unwind: '$roomTypes' 
            },
            {
                $project: {
                    _id: 0,
                    roomTypeName: '$roomTypes.roomTypeName',
                    revenue: '$roomTypes.revenue',
                    percentage: {
                        $multiply: [
                            { $divide: ['$roomTypes.revenue', '$totalRevenue'] },
                            100
                        ]
                    },
                    totalRevenue: 1
                }
            }
        ]);
        
      
        res.status(200).json({
            success: true,
            data: {report}
        });
    } catch (error) {
        console.error('Error while processing report :',error)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

/**
 * API endpoint example : GET http://localhost:4000/api/reports?time=12-2024
 * Required roles : admin,manager
 * @param {req.query = time} 
 */
exports.generateMonthlyReport = async (req, res) => {
    try {
        const {time} = req.query 

        const [month,year] = time.split('-').map(Number)

        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return res.status(404).json({ success: false, error: 'Invalid year or month format' });
        }

        const startDate = new Date(year, month - 1, 1); 
        const endDate = new Date(year, month, 0);

        const invoices = await Invoice.aggregate([

            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            {
                $unwind: '$booking' 
            },
        
            {
                $lookup: {
                    from: 'bookingdetails',
                    localField: 'booking.bookingDetails',
                    foreignField: '_id',
                    as: 'booking.bookingDetails'
                }
            },
        
            {
                $match: {
                    'booking.createdAt': {  
                        $gte: startDate, 
                        $lte: endDate
                    }
                }
            },
        
            {
                $project: {
                    _id: 1,
                    totalAmount: 1,
                    'booking.createdAt': 1,
                    'booking.customerIds': 1,
                    'booking.totalAmount': 1
                }
            },
                    {
                $project: {
                    createdAt: {
                        $dateToString: {
                            format: "%Y-%m-%d", 
                            date: "$booking.createdAt"
                        }
                    },
                    totalAmount: 1,
                    'booking.customerIds': 1,
                    'booking.totalAmount': 1
                }
            },
        
            {
                $group: {
                    _id: '$createdAt', 
                    totalBookings: { $sum: 1 }, 
                    totalAmount: { $sum: '$totalAmount' } 
                }
            },
        
            {
                $sort: {
                    _id: 1  
                }
            },
        
            {
                $group: {
                    _id: null,  
                    totalBookings: { $sum: '$totalBookings' },  
                    totalAmount: { $sum: '$totalAmount' }, 
                    dailyData: { $push: {  
                        date: '$_id',
                        totalAmount: '$totalAmount',
                        totalBookings: '$totalBookings'
                    }}
                }
            },
        
            {
                $project: {
                    _id: 0, 
                    totalBookings: 1,  
                    totalAmount: 1,
                    dailyData: 1 
                }
            }
        
        ]);
        
        
        const newCustomer = await Customer.find({
            'createdAt': {
                $gte: startDate, 
                $lte: endDate
            }
        })

        const totalNewCustomer = newCustomer.length

        res.status(200).json({
            success: true,
            data: {...invoices[0],totalNewCustomer}
        });
    } catch (error) {
        console.error('Error while processing report :',error)
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

