// models/BookingDetail.js
const mongoose = require('mongoose');

const bookingDetailSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    numberOfGuests: {
        type: Number,
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    roomPrice: {
        type: Number,
        required: true
    },
    additionalFees: [{
        description: {
            type: String,
            required: false
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    totalPrice : {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BookingDetail', bookingDetailSchema);