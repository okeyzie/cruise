const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the images directory exists
const uploadDir = path.join(__dirname, '../images');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images')
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    const ext = file.mimetype.split('/')[1];
    cb(null, `IMG_${uniqueSuffix}.${ext}`)
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPG, PNG, JPEG, and WEBP are allowed."
      )
    );
  }
};

const limits = {
  fileSize: 1024 * 1024 * 10
};

const uploads = multer({
  storage,
  fileFilter,
  limits
});

module.exports = uploads;