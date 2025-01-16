const multer = require("multer");
const path = require("path");

// Resolve the uploads folder relative to the backend directory
// const uploadPath = path.join(__dirname, "..", "uploads");

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, uploadPath);
    cb(null, "./uploads/"); // define where to store the uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Save with a unique name
  },
});

const upload = multer({
  storage: storage,

  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit

  // blocking non-image files
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/; // Accept these extensions
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

module.exports = upload;
