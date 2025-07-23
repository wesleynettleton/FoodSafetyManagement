const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
        // No longer unique for login, username is primary
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'kitchen_staff'],
        required: true
    },
    siteLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    // Push notification tokens
    fcmTokens: [{
        token: String,
        platform: {
            type: String,
            enum: ['android', 'ios'],
            default: 'android'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema); 