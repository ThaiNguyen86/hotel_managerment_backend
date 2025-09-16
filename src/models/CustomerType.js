// models/CustomerType.js
const mongoose = require('mongoose');

const customerTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer type name is required'],
        unique: true
    },
    coefficient: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CustomerType', customerTypeSchema);