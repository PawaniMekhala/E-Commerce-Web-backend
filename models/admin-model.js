const db = require("../config/db");

// model to fetch all admin details from the database
const getAdmins = async () => {
  const query = `
          SELECT u.UserID AS adminId, 
                 CONCAT(u.FirstName, ' ', u.LastName) AS name, 
                 u.Email AS email, 
                 u.Address AS address, 
                 u.Phone AS phone,
                u.ProfilePicture AS profile 
          FROM user u WHERE u.Role = 'Admin'
      `;
  try {
    const [row] = await db.query(query);
    return row;
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};

// model to delete an admin
const removeAdmin = async (userId) => {
  const query = `DELETE FROM user WHERE UserID = ? AND Role = 'Admin'`;

  try {
    await db.query(query, [userId]);
  } catch (error) {
    console.error("Error removing admin:", error);
    throw error;
  }
};

module.exports = {
  getAdmins,
  removeAdmin,
};
