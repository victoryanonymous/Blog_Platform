const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if(file.fieldname === 'media')
            callback(null, './uploads/blogpost');
        else
            callback(null, './uploads/profile');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
        callback(null, true); 
    } else {
        callback(new Error('Only images are allowed.'), false); 
    }
};

// Set up multer middleware
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;