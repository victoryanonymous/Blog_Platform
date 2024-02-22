const jwt = require('jsonwebtoken');
const config = require('../config/config')
const User = require('../models/user')

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        // console.log(token);

        if (!token) {
            return res.status(401).json({ message: 'Authentication failed. Token not provided.' });
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        if(!decoded){
            res.status(404).json({ message: 'Authentication failed. Invalid token.' })
        }
        const user = await User.findById(decoded._id);
        
        if(!user)
            return res.status(404).json({message: 'UnAuthorized(User not Found)'});

        req.user = user;
        next();
    } catch(error) {
        console.error("Error in middleware");
        return res.status(500).json("Internal Server Error");
    }
};

module.exports = authMiddleware;