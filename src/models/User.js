const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required']
    },
    phone: String,
    address: String,
    role: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);