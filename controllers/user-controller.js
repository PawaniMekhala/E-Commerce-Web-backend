const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUserOrAdmin,
  findByEmail,
  getCustomers,
  saveResetToken,
  findByResetToken,
  updatePassword,
  clearResetToken,
  findUserById,
  updateUserOrAdminProfile,
  updateProfileImg,
  deleteProfileImg,
} = require("../models/user-model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cloudinary = require("../config/cloudinary");

//ccontroller to create user
const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role, address, phone } =
    req.body;

  try {
    // Check if the user already exists
    const existingUser = await findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email already exists. Please use a different email." });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle profile image upload (if provided)
    let profileImageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      profileImageUrl = result.secure_url;
    }

    // Default role to 'user' if not provided
    const userRole = role || "user";

    // Create the user
    await createUserOrAdmin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: userRole,
      address: address || null, // default empty if not provided
      phone: phone || null,
      profileImageUrl: profileImageUrl || null,
    });

    res.json(
      `${userRole === "admin" ? "Admin" : "User"} created successfully!`
    );
  } catch (err) {
    console.log("Error creating user:", err);
    res.status(500).send("Error creating user.");
  }
};

// controller to login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Validate the password
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token with role and user info
    const token = jwt.sign(
      {
        userId: user.UserID,
        email: user.Email,
        role: user.Role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the token as an HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000, // 1 h
    });
    // Send token back to client
    res.status(200).json({
      message: "Login successful",
      token: token,
      role: user.Role,
      user: { userId: user.UserID, email: user.Email, name: user.FirstName },
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error logging in." });
  }
};

// controller to logout user
const logoutUser = (req, res) => {
  // Clear the JWT token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// controller to fetch all customer details to the admin page
const getAllCustomers = async (req, res) => {
  try {
    const customers = await getCustomers();
    res.json(customers);
  } catch (err) {
    console.error("Error in getAllCustomers controller:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Setup transporter with environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//controller to request password reset
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await findByEmail(email); // Assume findByEmail is in userModel.js
    if (!user) return res.status(404).json({ message: "Email not found" });

    // Generate reset token and expiration
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 600000); // 10 min expiration

    // Save token and expiry in database
    const tokenSaved = await saveResetToken(
      user.UserID,
      resetToken,
      resetExpires
    );
    if (!tokenSaved)
      return res.status(500).json({ message: "Failed to save reset token" });

    // Send reset email
    const resetLink = `http://127.0.0.1:5504/frontend/password-reset.html?token=${resetToken}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    });

    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

//controller to reset password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await findByResetToken(token);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    if (user.resetExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Token expired. Please request a new one." });
    }

    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const passwordUpdated = await updatePassword(user.UserID, hashedPassword);
    if (!passwordUpdated)
      return res.status(500).json({ message: "Failed to update password." });

    // Clear the reset token fields
    const tokenCleared = await clearResetToken(user.UserID);
    if (!tokenCleared)
      return res.status(500).json({ message: "Failed to clear reset token." });

    res
      .status(200)
      .json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ message: "Error resetting password. Please try again." });
  }
};

// controller to fetch user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// controller to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressInput, phoneInput } = req.body;

    //validate request body
    if (typeof addressInput !== "string" || typeof phoneInput !== "string") {
      return res.status(400).json({
        message:
          "Invalid request body. Expected 'addressInput' and 'phoneInput' fields.",
      });
    }

    const address = addressInput;
    const phone = phoneInput;

    const updatedProfile = await updateUserOrAdminProfile(userId, {
      address,
      phone,
    });

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedProfile });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// controller to upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    const userId = req.user.userId;

    await updateProfileImg(userId, result.secure_url);

    res.status(200).json({
      message: "Profile picture updated",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload image", error });
  }
};

//controller to delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    await deleteProfileImg(userId);
    res.status(200).json({ message: "Profile picture deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete image", error });
  }
};

module.exports = {
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
};
