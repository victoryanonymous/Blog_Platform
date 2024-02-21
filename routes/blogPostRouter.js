const express = require('express');
const router = express.Router();
const User = require('../models/user');
const BlogPost = require('../models/blogPost');
const AuthMiddleware = require('../middlewares/authMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/blogPost', AuthMiddleware,  async (req, res)=> {
    // console.log(req.user);
    let user = req.user;
    try {
        user = await User.findById(user._id);
        if(!user)
            return res.json("user not exist");
        if(user.isAdmin===true) {
            const blogPost = new BlogPost({
                title: req.body.title,
                content: req.body.content,
                author: req.body.author,
                media: {
                    filename: req.body.media.filename,
                    file_extension: req.body.media.file_extension,
                    destination: req.body.media.destination
                },
                createdAt: req.body.createdAt,
                updatedAt: req.body.updatedAt
            });
            await blogPost.save();
            return res.status(201).json(blogPost);
        } else {
            return res.status(403).json("Forbidden: User is not a Admin");
        }
    } catch(error) {
        console.log(error);
        return res.status(500).json("Internal Server Error");
    }
})

router.get('/blogPost', async (req, res) => {
    try {
        const blogPosts = await BlogPost.find();
        res.json(blogPosts);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.put('/blogPost/:id', AuthMiddleware, async (req, res) => {
    let user = req.user;
    try {
        user = await User.findById(user._id);
        if(!user)
            return res.json("user not exist");
        if(user.isAdmin===true) {
            const { title, content, author, media, createdAt } = req.body;
            let blogPost = await BlogPost.findById(req.params.id);
            if(!blogPost)
                return res.status(404).json("BlogPost not found");
            blogPost.title = title || blogPost.title;
            blogPost.content = content || blogPost.content;
            blogPost.author = author || blogPost.author;
            blogPost.media = media || blogPost.media;
            blogPost.createdAt = createdAt || blogPost.createdAt;
            blogPost.updatedAt = Date.now();
            await blogPost.save();
            return res.status(201).json(blogPost);
        } else {
            return res.status(403).json("Forbidden: User is not a Admin");
        }
    } catch(error) {
        console.log(error);
        return res.status(500).json("Internal Server Error");
    }
})

router.delete("/blogPost/:id", AuthMiddleware,  async (req, res) => {
  try {
    const blogPost = await BlogPost.findByIdAndDelete(req.params.id);

    if (!blogPost) {
      return res.status(404).json("blog with given id does not exist");
    }
    res.json(blogPost);
  } catch (error) {
    res.status(500).send(error);
  }
});





module.exports = router;