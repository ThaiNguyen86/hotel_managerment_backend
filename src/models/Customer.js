// models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required']
    },
    idNumber: {
        type: String,
        required: [true, 'ID number is required'],
        unique: true
    },
    address: String,
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true
    },
    customerTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomerType',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);