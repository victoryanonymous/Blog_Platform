const express = require('express');
const router = express.Router();
const User = require('../models/user');
const BlogPost = require('../models/blogPost');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.get('/blogPost', AuthMiddleware,  async(req, res)=> {
    console.log(req.userId);
    

})





module.exports = router;