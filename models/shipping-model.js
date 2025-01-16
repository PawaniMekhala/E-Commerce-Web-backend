const db = require("../config/db");

// model to save shipping details
const addShipping = async (shippingData) => {
  const checkQuery = `SELECT ShippingID FROM shippingaddress 
        WHERE UserID = ? 
        AND FullName = ? 
        AND AddressLine = ? 
        AND City = ? 
        AND State = ? 
        AND ZipCode = ? 
        AND Country = ? 
        AND SH_mobile_number = ? 
        AND SH_email = ?`;

  const checkValues = [
    shippingData.UserID,
    shippingData.FullName,
    shippingData.AddressLine,
    shippingData.City,
    shippingData.State,
    shippingData.ZipCode,
    shippingData.Country,
    shippingData.SH_mobile_number,
    shippingData.SH_email,
  ];

  const insertQuery = `INSERT INTO shippingaddress 
  (UserID, FullName, AddressLine, City, State, ZipCode, Country, SH_mobile_number, SH_email)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    // Check if shipping details already exist
    const [checkResult] = await db.query(checkQuery, checkValues);

    if (checkResult.length > 0) {
      // Return the existing ShippingID
      return {
        existing: true,
        shippingId: checkResult[0].ShippingID,
      };
    }

    const [insertResult] = await db.query(insertQuery, checkValues);
    // Return the newly created ShippingID
    return {
      existing: false,
      shippingId: insertResult.insertId,
    };
  } catch (error) {
    console.error("Error saving shipping details:", error.message);
    throw error;
  }
};

// model to update order with ShippingID
const updateOrderWithShipping = async (orderID, shippingId) => {
  const query = `UPDATE \`order\`
                 SET shippingID = ?
                 WHERE OrderID = ?`;
  try {
    const [result] = await db.query(query, [shippingId, orderID]);
    return result;
  } catch (error) {
    console.error("Error updating order with shipping ID:", error);
    throw error;
  }
};

// model to get shipping details by order id
const getShippingDetailsByUserId = async (userId) => {
  const query = "SELECT * FROM `shippingaddress` WHERE UserID = ?";
  try {
    const [result] = await db.query(query, [userId]);
    return result;
  } catch (error) {
    console.error("Error getting shipping details by order ID:", error);
    throw error;
  }
};

// model to delete a shipping record by ID
const deleteShipping = async (shippingId) => {
  const query = "DELETE FROM shippingaddress WHERE ShippingID = ?";
  try {
    const [result] = await db.query(query, [shippingId]);
    return result;
  } catch (error) {
    console.error("Error deleting shipping details:", error);
    throw error;
  }
};

module.exports = {
  addShipping,
  updateOrderWithShipping,
  getShippingDetailsByUserId,
  deleteShipping,
};
