const { getAdmins, removeAdmin } = require("../models/admin-model");
const { findUserById } = require("../models/user-model");

// controller to fetch all admin details for the admin page
const getAllAdmins = async (req, res) => {
  try {
    const admins = await getAdmins();
    res.json(admins);
  } catch (err) {
    console.error("Error in getAllAdmins controller:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// controller to delete an admin
const deleteAdmin = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (user.Role !== "Admin") {
      return res.status(403).json({ error: "Cannot delete non-admin users" });
    }

    // Delete the user/admin
    await removeAdmin(userId);

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin:", err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the admin" });
  }
};

module.exports = {
  getAllAdmins,
  deleteAdmin,
};
