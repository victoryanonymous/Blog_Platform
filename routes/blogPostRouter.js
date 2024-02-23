const express = require("express");
const router = express.Router();
const User  = require("../models/user");
const BlogPost = require("../models/blogPost");
const authenticateToken = require('../middlewares/authenticateToken');
const upload = require("../middlewares/upload");
const Joi = require('joi')

function validateBlog(blog) {
  const blogSchema = Joi.object({
    title: Joi.string().min(5).max(255).required().empty()
      .custom((value, helpers) => {
        if (!value.trim()) {
          return helpers.error("string.empty");
        }
        if(/^\d+$/.test(value)) {
          return helpers.message("Username cannot consist only nums");
        }
        return value;
      }),
    content: Joi.string().min(5).max(1024).required().empty()
    .custom((value, helpers) => {
      if (!value.trim()) {
        return helpers.error("string.empty");
      }
      if(/^\d+$/.test(value)) {
        return helpers.message("Username cannot consist only nums");
      }
      return value;
    })
  });

  return blogSchema.validate(blog, { abortEarly: false });
}

router.post("/", authenticateToken , upload.single("media"), async (req, res) => {
  try {
    let user = req.user;
    user = await User.findById(user._id);
    if (!user) return res.json("user not exist");
  
    const { error } = validateBlog(req.body)
    if(error) return res.status(400).json(error.details[0].message);

    const { title, content } = req.body;
    const { filename, destination } = req.file;
    const userId = user._id;

    const newBlogPost = new BlogPost({
      title,
      content,
      author: userId,
      media: {
        filename,
        destination,
      },
    });

    const savedBlogPost = await newBlogPost.save();

    res.status(201).json(savedBlogPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const blogPosts = await BlogPost.find();
    res.json(blogPosts);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id)
    if(!blogPost)
      return res.send("BlogPost not Found")
    
    res.status(201).json(blogPost)
  } catch(error) {
    console.log(error)
    return res.send(error)
  }
})

router.put("/:id", authenticateToken , upload.single("media"), async (req, res) => {
  let user = req.user;
  try {
    user = await User.findById(user._id);
    if (!user) return res.json("user not exist");

    const { title, content } = req.body;
    const author = user._id;
    const media = req.file;
    let blogPost = await BlogPost.findById(req.params.id);
    if (!blogPost) return res.status(404).json("BlogPost not found");
    blogPost.title = title || blogPost.title;
    blogPost.content = content || blogPost.content;
    blogPost.author = author || blogPost.author;
    blogPost.media = media || blogPost.media;
    blogPost.createdAt = blogPost.createdAt;
    blogPost.updatedAt = Date.now();
    await blogPost.save();
    return res.status(201).json(blogPost);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    let user = req.user;
    user = await User.findById(user._id);
    if (!user) return res.json("user not exist");
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
