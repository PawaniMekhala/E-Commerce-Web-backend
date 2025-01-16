const db = require("../config/db");

// model to create a new order
const createOrder = async (userId, totalAmount, oQuantity, subTotal) => {
  const query = `
    INSERT INTO \`order\` (UserID, OrderDate, Status, TotalAmount, OQuantity, PaymentMethod, SubTotal, ShippingID)
    VALUES (?, NOW(), 'Pending', ?, ?, 'Credit Card',?, NULL)`;
  try {
    const [result] = await db.query(query, [
      userId,
      totalAmount,
      oQuantity,
      subTotal,
    ]);
    return result.insertId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

//  model to add items to an order
const addOrderItem = async (orderId, productId, oiQuantity) => {
  const query = `
    INSERT INTO orderitem (OrderID, ProductID, OIQuantity)
    VALUES (?, ?, ?)
  `;
  try {
    const [result] = await db.query(query, [orderId, productId, oiQuantity]);
    return result.insertId;
  } catch (error) {
    console.error("Error adding order item:", error);
    throw error;
  }
};

// model to update product stock
const updateProductStock = async (productId, nQuantity) => {
  if (isNaN(nQuantity) || nQuantity < 0) {
    throw new Error(
      `Invalid stock quantity: ${nQuantity} for product ID ${productId}`
    );
  }

  const query = `
    UPDATE product
    SET Quantity = ?
    WHERE ProductID = ?
  `;
  try {
    const [result] = await db.query(query, [nQuantity, productId]);
    return result;
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw error;
  }
};

// model to update the order status based on OrderID
const updateStatus = async (status, orderId) => {
  const query = "UPDATE `order` SET Status = ? WHERE OrderID = ?";

  try {
    const [result] = await db.query(query, [status, orderId]);
    return result;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// model to update payment method based on OrderID
const updatePaymentMethod = async (paymentMethod, orderId) => {
  const query = "UPDATE `order` SET PaymentMethod = ? WHERE OrderID = ?";

  try {
    const [result] = await db.query(query, [paymentMethod, orderId]);
    return result;
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
};

// model to get all order IDs
const getAllOrderIDs = async () => {
  const query = `SELECT OrderID 
  FROM \`order\`
  WHERE 
      UserID IS NOT NULL AND 
      OrderDate IS NOT NULL AND 
      Status IS NOT NULL AND 
      TotalAmount IS NOT NULL AND 
      OQuantity IS NOT NULL AND 
      PaymentMethod IS NOT NULL AND 
      SubTotal IS NOT NULL AND 
      ShippingID IS NOT NULL 
  ORDER BY OrderID ASC
  `;

  try {
    const [result] = await db.query(query);
    return result;
  } catch (error) {
    console.error("Error fetching order id:", error);
    throw error;
  }
};

//model to get order details
const getCompleteOrderDetails = async (orderId) => {
  const query = `
    SELECT 
      o.OrderID, 
      o.OrderDate, 
      o.Status, 
      o.TotalAmount, 
      o.OQuantity, 
      o.PaymentMethod, 
      o.SubTotal,
      sa.FullName, 
      sa.AddressLine, 
      sa.City, 
      sa.State, 
      sa.ZipCode, 
      sa.Country, 
      sa.SH_mobile_number, 
      sa.SH_email,
      oi.OrderItemID, 
      oi.OIQuantity, 
      p.ProductID, 
      p.Quantity AS Stock,
      p.Name AS ProductName, 
      p.Price AS ProductPrice, 
      p.ImagePath
    FROM \`order\` o
    JOIN \`shippingaddress\` sa ON o.ShippingID = sa.ShippingID
    JOIN \`orderitem\` oi ON o.OrderID = oi.OrderID
    JOIN \`product\` p ON oi.ProductID = p.ProductID
    WHERE 
    o.OrderID = ? AND
    o.UserID IS NOT NULL AND 
    o.OrderDate IS NOT NULL AND 
    o.Status IS NOT NULL AND 
    o.TotalAmount IS NOT NULL AND 
    o.OQuantity IS NOT NULL AND 
    o.PaymentMethod IS NOT NULL AND 
    o.SubTotal IS NOT NULL AND 
    o.ShippingID IS NOT NULL
  `;
  try {
    const [result] = await db.query(query, [orderId]);
    return result;
  } catch (error) {
    console.error("Error fetching complete order details:", error);
    throw error;
  }
};

module.exports = {
  createOrder,
  addOrderItem,
  updateProductStock,
  updateStatus,
  updatePaymentMethod,
  getAllOrderIDs,
  getCompleteOrderDetails,
};
