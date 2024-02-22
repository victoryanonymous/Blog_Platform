const express = require('express');
const router = express.Router();
const User = require('../models/user');
const BlogPost = require('../models/blogPost');
const AuthMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.post('/',AuthMiddleware, upload.single('media'), async (req, res) => {
    try {
        let user = req.user;
        user = await User.findById(user._id);
        if(!user)
            return res.json("user not exist");
        if(user.isAdmin===true) {
            const { title, content, author } = req.body;
            const { filename, destination } = req.file;

            const newBlogPost = new BlogPost({
                title,
                content,
                author,
                media: {
                    filename,
                    destination
                }
            });

            const savedBlogPost = await newBlogPost.save();

            res.status(201).json(savedBlogPost);
        }else {
            return res.status(403).json("Forbidden: User is not a Admin");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const blogPosts = await BlogPost.find();
        res.json(blogPosts);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.put('/:id', AuthMiddleware, upload.single('media'), async (req, res) => {
    let user = req.user;
    try {
        user = await User.findById(user._id);
        if(!user)
            return res.json("user not exist");
        if(user.isAdmin===true) {
            const { title, content, author } = req.body;
            const media = req.file;
            let blogPost = await BlogPost.findById(req.params.id);
            if(!blogPost)
                return res.status(404).json("BlogPost not found");
            blogPost.title = title || blogPost.title;
            blogPost.content = content || blogPost.content;
            blogPost.author = author || blogPost.author;
            blogPost.media = media || blogPost.media;
            blogPost.createdAt = blogPost.createdAt;
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

router.delete("/:id", AuthMiddleware,  async (req, res) => {
  try {
    let user = req.user;
    user = await User.findById(user._id);
    if(!user)
            return res.json("user not exist");
    if(user.isAdmin===true) {
        const blogPost = await BlogPost.findByIdAndDelete(req.params.id);

        if (!blogPost) {
        return res.status(404).json("blog with given id does not exist");
        }
        res.json(blogPost);
    } else {
        return res.status(403).json("Forbidden: User is not a Admin");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});





module.exports = router;