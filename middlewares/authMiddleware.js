const jwt = require('jsonwebtoken');
const config = require('../config/config')

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    console.log(token);

    if (!token) {
        return res.status(401).json({ message: 'Authentication failed. Token not provided.' });
    }

    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
            console.log("hello")
        return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
        }
        req.userId = decoded._id;
        next();
    });
    return res.status(401).json("Hello");
};

module.exports = authMiddleware;
