const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoomType',
        required: true
    },
    roomName: {
        type: String,
        required: [true, 'Room name is required'],
        unique: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);