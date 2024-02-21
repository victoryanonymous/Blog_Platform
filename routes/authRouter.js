const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken')
const User = require('../models/user'); 
const config = require('../config/config')

router.post("/register", async (req, res) => {
  try {
    const { email } = req.body;
    const userExisting = await User.findOne({ email });
    if (userExisting) {
        return res.json("Already registered");
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(req.body.password, salt)
        console.log(req.body);
        const user = new User({...req.body,  password: hashed});
        await user.save();
        return res.json("User registered successfully");
    }
  } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json("Internal Server Error");
  }
});

router.post('/login', async (req, res)=> {
    try{
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if(!user) {
            return res.json("user not exist");
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword)
            return res.status(400).json("Invalid email or password");
        const token = jwt.sign({ _id: user._id }, config.jwtSecret);
        res.status(200).json({ token });
        //res.status(201).json("Authenticate User");

    } catch(error) {
        console.error("Error Loging user:", error);
        return res.status(500).json("Internal Server Error");
    }
})

module.exports = router;
