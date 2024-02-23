const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config/config");
const upload = require("../middlewares/upload");
const authenticateToken = require("../middlewares/authenticateToken");
const Joi = require("joi");
require("dotenv").config();
const UserToken = require('../models/userToken')

function validateUser(user) {
  const userSchema = Joi.object({
    username: Joi.string().min(2).max(50).required().empty()
      .custom((value, helpers) => {
        if (!value.trim()) {
          return helpers.error("string.empty");
        }
        if(/^\d+$/.test(value)) {
          return helpers.message("Username cannot consist only nums");
        }
        return value;
      }),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
      .custom((value, helpers) => {
        if (!value.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)) {
          return helpers.message(
            '"Password" must contain at least one special symbol and one number'
          );
        }
        return value;
      }),
      isAdmin: Joi.boolean()
  });

  return userSchema.validate(user, { abortEarly: false });
}

router.post("/register", upload.single("profile"), async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    const { email } = req.body;
    const userExisting = await User.findOne({ email });
    if (userExisting) {
      return res.json("Already registered");
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);
      // console.log(req.body);
      const profile = req.file;
      const user = new User({
        ...req.body,
        password: hashed,
        profile: profile,
      });
      await user.save();
      return res.json("User registered successfully");
    }
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json("Internal Server Error");
  }
})

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.json("user not exist");
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json("Invalid username or password");

    const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET);

    const existingToken = await User.findOne({ _id: user._id })
    if(existingToken) {
      await UserToken.findOneAndDelete({ userId: user._id })
    }
    
    const userToken = new UserToken({ userId: user._id, token: refreshToken })
    await userToken.save();
    
    res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    console.error("Error Loging user:", error);
    return res.status(500).json("Internal Server Error");
  }
});

router.post("/token", async (req, res) => {
  try {
    const refreshToken = req.body.token;
    if (refreshToken == null)
      return res.status(401).send("please provide refreshtoken");

    let userToken = await UserToken.findOne({ token: refreshToken });
    if (!userToken) return res.status(403).send("token is not found");


    const decoded = jwt.verify(userToken.token , process.env.REFRESH_TOKEN_SECRET);

    if (!decoded) {
      res.status(404).json({ message: "Authentication failed. Invalid token." });
    }

    const { userId } = req.body;
    const accessToken = jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" });

    res.status(201).json({ accessToken: accessToken });
  } catch(error) {
    return res.status(500).json("Internal Server Error");
  }
});

router.put('/update/:id', authenticateToken, upload.single("profile"), async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    let hashed;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashed = await bcrypt.hash(req.body.password, salt);
    }
    const profile = req.file;
    const id = req.params.id;
    const user = req.user;

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Only admin users can perform this action" });
    }

    let existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    existingUser.username = username || existingUser.username;
    existingUser.email = email || existingUser.email;
    existingUser.profile = profile || existingUser.profile;
    existingUser.isAdmin =
      isAdmin !== undefined ? isAdmin : existingUser.isAdmin;

    existingUser.password = hashed || existingUser.password;

    await existingUser.save();

    return res.json(existingUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/users', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Only admin users can perform this action" });
    }
    const users = await User.find({ isAdmin: false }).select('-password')

    res.status(201).send(users)
  } catch(error) {
    return res.status(500).json({ error: error.message });
  }
})

router.delete('/:id', authenticateToken,  async (req, res) => {
  try {
    const admin = req.user;

    if (!admin.isAdmin) {
      return res.status(403).json({ error: "Only admin users can perform this action" });
    }

    const user = await User.findByIdAndDelete(req.params.id)
    if(!user)
      return res.status(404).json({ error: "User not found" });

    return res.status(201).json(user)

  } catch(error) {
      return res.status(500).json({ error: error.message });
  }
})

module.exports = router;
