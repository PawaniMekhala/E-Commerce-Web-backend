const express = require("express");
const router = express.Router();
const {
  getAllAdmins,
  deleteAdmin,
} = require("../controllers/admin-controller");
const { createUser } = require("../controllers/user-controller");
const { authorizeAdmin } = require("../middleware/auth-middleware");
const { validateAdminCreation } = require("../middleware/validation");
const upload = require("../middleware/multer");

// Route to get all admins
router.get("/all-admins", authorizeAdmin, getAllAdmins);

// Route to create admin with profile image upload
router.post(
  "/create-admin",
  upload.single("profileImage"),
  validateAdminCreation,
  createUser
);

// Route to delete an admin by UserID
router.delete("/remove/:userId", authorizeAdmin, deleteAdmin);

module.exports = router;
