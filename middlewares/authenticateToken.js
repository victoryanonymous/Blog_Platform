const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user')

async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if(token == null)   return res.status(401).json('token not found');

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decoded)
        if(!decoded){
            res.status(404).json({ message: 'Authentication failed. Invalid token.' })
        }

        const user = await User.findById(decoded._id);
            
        if(!user)
            return res.status(404).json({message: 'UnAuthorized(User not Found)'});

        req.user = user;
        next();
    } catch(error) {
        console.error("Forbidden");
        return res.status(500).json("AcessToken Expired");
    }
}

module.exports = authenticateToken;