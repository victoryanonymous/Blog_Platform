const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        // Define the destination directory
        callback(null, './uploads/');
    },
    filename: function (req, file, callback) {
        // Define the filename
        callback(null, file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    // Check file types to allow only images
    if (file.mimetype.startsWith('image/')) {
        callback(null, true); // Accept the file
    } else {
        callback(new Error('Only images are allowed.'), false); // Reject the file
    }
};

// Set up multer middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;