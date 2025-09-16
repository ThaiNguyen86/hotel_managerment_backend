const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Room type name is required'],
        unique: true
    },
    maxOccupancy: {
        type: Number,
        required: true
    },
    surchargeRate: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RoomType', roomTypeSchema);