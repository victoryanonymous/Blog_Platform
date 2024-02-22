const mongoose = require("mongoose");
const Joi = require("joi");

const User = mongoose.model(
  "Users",
  new mongoose.Schema({
    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minlength: 5,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
    profile: {
      filename: { type: String },
      file_extension: { type: String },
      destination: { type: String },
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
  })
);

module.exports = User;
