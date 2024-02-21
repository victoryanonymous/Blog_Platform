const mongoose = require('mongoose');

const BlogPost = mongoose.model('BlogPost', new mongoose.Schema({
    title: { 
        type:String, 
        required: true 
    },
    content: { 
        type:String, 
        required: true 
    },
    author: { 
        type:mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required:true 
    },
    media: {
        filename: { type:String },
        file_extension: { type:String },
        destination: { type:String }
    },
    createdAt: { 
        type:Date, 
        default:Date.now 
    },
    updatedAt: { 
        type: Date, 
        default:Date.now 
    }
}));

module.exports = BlogPost;
