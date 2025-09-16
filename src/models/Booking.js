// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingDetails: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookingDetail'
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});
bookingSchema.pre('validate', function(next) {
    if (this.customerIds && this.customerIds.length === 0) {
        return next(new Error('customerIds must contain at least one customer'));
    }
    next();
});
module.exports = mongoose.model('Booking', bookingSchema);