const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  logoutUser,
  getAllCustomers,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} = require("../controllers/user-controller");
const { validateUserCreation } = require("../middleware/validation");
const { authenticateUser } = require("../middleware/auth-middleware");
const upload = require("../middleware/multer");

// route to create account
router.post("/create-account", validateUserCreation, createUser);

// route to login
router.post("/login", loginUser);

// route for logging out
router.post("/logout", logoutUser);

// route to get all customers
router.get("/all-customers", getAllCustomers);

//route to request password reset
router.post("/forgot-password", requestPasswordReset);

//route to reset password
router.post("/reset-password", resetPassword);

// route to fetch user profile
router.get("/profile", authenticateUser, getProfile);

// route to update user profile
router.put("/profile", authenticateUser, updateProfile);

// route to upload profile picture
router.post(
  "/profile/picture",
  authenticateUser,
  upload.single("profilePicture"),
  uploadProfilePicture
);

// route to delete profile picture
router.delete("/profile/picture", authenticateUser, deleteProfilePicture);

module.exports = router;
