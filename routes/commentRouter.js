const express = require("express");
const router = express.Router();
const User = require("../models/user");
const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const authenticateToken = require("../middlewares/authenticateToken");
const Joi = require("joi");

function validateComment(comment) {
  const commentSchema = Joi.object({
    text: Joi.string()
      .min(5)
      .max(255)
      .required()
      .empty()
      .custom((value, helpers) => {
        if (!value.trim()) {
          return helpers.error("string.empty");
        }
        if (/^\d+$/.test(value)) {
          return helpers.message("Username cannot consist only nums");
        }
        return value;
      }),
    blogPost: Joi.required(),
  });
  return commentSchema.validate(comment, { abortEarly: false });
}

router.post("/comment", authenticateToken, async (req, res) => {
  // console.log(req.user);
  let user = req.user;
  try {
    user = await User.findById(user._id);
    if (!user) return res.json("user not exist");

    const { error } = validateComment(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const blogId = req.body.blogPost;

    const blogPost = await BlogPost.findById(blogId);

    if (!blogPost) return res.json("blog post not exist");
    const existingComment = await Comment.findOne({
      user: user,
      blogPost: blogPost,
    });
    if (existingComment)
      return res
        .status(400)
        .json({
          message:
            "You have already commented on this post. You can only update your comment.",
        });

    const comment = new Comment({
      text: req.body.text,
      user: user._id,
      blogPost: req.body.blogPost,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await comment.save();
    return res.status(201).json(comment);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

router.get("/comment", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("/comment/:id", authenticateToken, async (req, res) => {
  let user = req.user;
  try {
    user = await User.findById(user._id);
    if (!user) return res.json("user not exist");

    const blogId = req.body.blogPost;
    const blogPost = await BlogPost.findById(blogId);

    if (!blogPost) return res.json("blog post not exist");
    let comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json("Comment not found");
    const existingComment = await Comment.findOne({
      _id: comment._id,
      user: user,
      blogPost: blogPost,
    });
    if (existingComment) {
      const { text } = req.body;
      existingComment.text = text || existingComment.text;
      existingComment.updatedAt = Date.now();
      await existingComment.save();
      return res.json(existingComment);
    } else {
      return res
        .status(400)
        .json({
          message:
            "You are not post any comment on this post. First, You need to post your comment.",
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

router.delete("/comment/:id", authenticateToken, async (req, res) => {
  try {
    let user = req.user;
    if (!user) return res.json("user not exist");
    const comment = await Comment.findByIdAndDelete(req.params.id);
    const blogPost = await BlogPost.findById(comment.blogPost);
    if (!blogPost) return res.json("blog post not exist");
    if (!comment) {
      return res.status(404).json("comment with given id does not exist");
    }
    res.status(201).json(comment);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

router.get("/post/:id/comment", authenticateToken, async (req, res) => {
  try {
    const postComents = await Comment.find({ blogPost: req.params.id });
    if (!postComents) return res.status(401).send("No comments for this post");

    res.json(postComents);
  } catch (error) {
    onsole.log(error);
    return res.status(500).json("Internal Server Error");
  }
});

module.exports = router;
