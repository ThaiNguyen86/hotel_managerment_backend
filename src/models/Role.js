    const mongoose = require('mongoose');
    const Permission = require('./Permission')
    const roleSchema = new mongoose.Schema({
        name: {
            type: String,
            required: [true, 'Role name is required'],
            unique: true,
            enum: ['admin', 'user'] // Chỉ có 2 role: admin và user
        },
        description: {
            type: String,
            required: false
        },
        permissions: [{
            type: String,
            enum: Object.values(Permission)

        }]
    }, {
        timestamps: true
    });

    module.exports = mongoose.model('Role', roleSchema);