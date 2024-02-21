const express = require('express');
const router = express.Router();
const User = require('../models/user');
const BlogPost = require('../models/blogPost');
const Comment = require('../models/comment');
const AuthMiddleware = require('../middlewares/authMiddleware')

router.post('/comment', AuthMiddleware,  async (req, res)=> {
    // console.log(req.user);
    let user = req.user;
    try {
        user = await User.findById(req.body.user);
        console.log(user);
        if(!user)
            return res.json("user not exist");
        const blogPost = await BlogPost.findById(req.body.blogPost);
        if(!blogPost)
            return res.json("blog post not exist");
        const existingComment = await Comment.findOne({ user: user, blogPost: blogPost });
        if (existingComment) 
            return res.status(400).json({ message: "You have already commented on this post. You can only update your comment." });

        const comment = new Comment({
            text: req.body.text,
            user: req.body.user,
            blogPost: req.body.blogPost,
            createdAt: req.body.createdAt,
            updatedAt: req.body.updatedAt
        })
        await comment.save();
        return res.status(201).json(comment);
    } catch(error) {
        console.log(error);
        return res.status(500).json("Internal Server Error");
    }
})

router.get('/comment', async (req, res) => {
    try {
        const comments = await Comment.find();
        res.json(comments);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

module.exports = router;