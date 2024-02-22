const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config/config");
const upload = require("../middlewares/upload");
const AuthMiddleware = require("../middlewares/authMiddleware");
const Joi = require("joi");

function validateUser(user) {
  const userSchema = Joi.object({
    username: Joi.string()
      .min(2)
      .max(50)
      .required()
      .empty()
      .custom((value, helpers) => {
        if (!value.trim()) {
          return helpers.error("string.empty");
        }
        return value;
      }),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
      .custom((value, helpers) => {
        if (!value.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)) {
          return helpers.message(
            '"Password" must contain at least one special symbol and one number'
          );
        }
        return value;
      }),
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
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.json("user not exist");
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json("Invalid email or password");
    const token = jwt.sign({ _id: user._id }, config.jwtSecret);
    res.status(200).json({ token });
    //res.status(201).json("Authenticate User");
  } catch (error) {
    console.error("Error Loging user:", error);
    return res.status(500).json("Internal Server Error");
  }
});

router.put("/update/:id", AuthMiddleware, upload.single("profile"), async (req, res) => {
  try {
    const schema = Joi.object({
      username: Joi.string().min(2).max(50),
      email: Joi.string().email(),
      password: Joi.string().min(5).max(255),
      isAdmin: Joi.boolean(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((detail) => detail.message) });
    }

    const { username, email, password, isAdmin } = req.body;

    let hashed;

    if(password) {
        const salt = await bcrypt.genSalt(10);
        hashed = await bcrypt.hash(req.body.password, salt);
    }

    const profile = req.file;
    const id = req.params.id;
    const user = req.user;

    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Only admin users can perform this action" });
    }

    let existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    existingUser.username = username || existingUser.username;
    existingUser.email = email || existingUser.email;
    existingUser.isAdmin =
      isAdmin !== undefined ? isAdmin : existingUser.isAdmin;

    existingUser.password = hashed || existingUser.password;

    await existingUser.save();

    return res.json(existingUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
