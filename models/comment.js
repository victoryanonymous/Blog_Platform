const mongoose = require('mongoose');

const Comment = mongoose.model('Comment', new mongoose.Schema({
    text: { 
        type: String, 
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    blogPost: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BlogPost', 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}));

module.exports = Comment;
