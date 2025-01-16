const db = require("../config/db");

// model to create a user
const createUserOrAdmin = async ({
  firstName,
  lastName,
  email,
  password,
  role,
  address,
  phone,
  profileImageUrl,
}) => {
  const query =
    "INSERT INTO user (FirstName, LastName, Email, Password, Role, Address, Phone, ProfilePicture) VALUES (?, ?, ?, ?, ?, ?, ?,?)";

  try {
    await db.query(query, [
      firstName,
      lastName,
      email,
      password,
      role,
      address,
      phone,
      profileImageUrl,
    ]);
  } catch (error) {
    console.error("Error creating user or admin:", error);
    throw error;
  }
};

// model to find a user by email
const findByEmail = async (email) => {
  const query = "SELECT * FROM user WHERE Email = ?";
  try {
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  } catch (error) {
    console.error("Error find user by email:", error);
    throw error;
  }
};

// Fetch all customer details from the database for admin page
const getCustomers = async () => {
  const query = `
        SELECT u.UserID AS customerId, 
               CONCAT(u.FirstName, ' ', u.LastName) AS name, 
               u.Email AS email, 
               u.Address AS address, 
               u.Phone AS phone
        FROM user u WHERE u.Role = 'User'
    `;
  try {
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

// model to save the reset token and expiry time in the database
const saveResetToken = async (userId, token, expires) => {
  const query = `UPDATE user SET resetToken = ?, resetExpires = ? WHERE UserID = ?`;

  try {
    const [result] = await db.execute(query, [token, expires, userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error saving reset token:", error);
    throw error;
  }
};

// model to retrieve user by reset token
const findByResetToken = async (token) => {
  const query = `SELECT * FROM user WHERE resetToken = ?`;

  try {
    const [rows] = await db.execute(query, [token]);
    return rows[0];
  } catch (error) {
    console.error("Error find user by reset token:", error);
    throw error;
  }
};

// model to update the user's password
const updatePassword = async (userId, hashedPassword) => {
  const query = `UPDATE user SET Password = ? WHERE UserID = ?`;

  try {
    const [result] = await db.execute(query, [hashedPassword, userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error update password:", error);
    throw error;
  }
};

// model to clear reset token after successful password reset
const clearResetToken = async (userId) => {
  const query = `UPDATE user SET resetToken = NULL, resetExpires = NULL WHERE UserID = ?`;

  try {
    const [result] = await db.execute(query, [userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error clearing reset token:", error);
    throw error;
  }
};

// model to find user by ID
const findUserById = async (userId) => {
  const query =
    "SELECT UserID, FirstName, LastName, Email, Address, Phone, ProfilePicture, Role FROM user WHERE UserID = ?";

  try {
    const [result] = await db.execute(query, [userId]);
    return result[0];
  } catch (error) {
    console.error("Error find user by id:", error);
    throw error;
  }
};

// model to update user profile (address and phone)
const updateUserOrAdminProfile = async (userId, { address, phone }) => {
  const query = "UPDATE user SET Address = ?, Phone = ? WHERE UserID = ?";
  try {
    await db.query(query, [address, phone, userId]);
  } catch (error) {
    throw error;
  }
};

// model to update profile picture
const updateProfileImg = async (userId, imageUrl) => {
  const query = "UPDATE user SET ProfilePicture = ? WHERE UserID = ?";
  try {
    await db.query(query, [imageUrl, userId]);
  } catch (error) {
    throw error;
  }
};

// model to delete profile picture
const deleteProfileImg = async (userId) => {
  const query = "UPDATE user SET ProfilePicture = NULL WHERE UserID = ?";
  try {
    await db.query(query, [userId]);
  } catch (error) {
    throw error;
  }
};

module.exports = {
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
};
