require("dotenv").config();

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const UserToken = require("../models/userToken");

app.use(express.json());


