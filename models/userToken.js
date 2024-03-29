const mongoose = require('mongoose');

const UserToken = mongoose.model('UserToken', new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30*86400
    }
}))

module.exports = UserToken;