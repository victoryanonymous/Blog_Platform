const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = mongoose.model('Users', new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        filename: { type: String },
        file_extension: { type: String },
        destination: { type: String }
    },
    isAdmin: {
        type: Boolean
    }
}))


module.exports=User;