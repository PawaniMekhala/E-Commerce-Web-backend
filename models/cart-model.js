const db = require("../config/db");

//model to find cart by user Id
const findCartByUserId = async (userId) => {
  const query = `SELECT * FROM cart WHERE UserID = ?`;
  try {
    const [rows] = await db.query(query, [userId]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error find cart by user ID:", error);
    throw error;
  }
};

//model to create cart
const createCart = async (userId) => {
  const query = `INSERT INTO cart (UserID, CreatedAt) VALUES (?, NOW())`;
  try {
    const [result] = await db.query(query, [userId]);
    return result.insertId;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
};

// model to check if an item exists in the cart
const findCartItem = async (cartId, productId) => {
  const query = `SELECT * FROM cart_items WHERE CartID = ? AND ProductID = ?`;
  try {
    const [result] = await db.query(query, [cartId, productId]);
    return result[0] || null;
  } catch (error) {
    console.error("Error finding product:", error);
    throw error;
  }
};

//model to add item to cart
const addCartItem = async (cartId, productId, cartQuantity, totalPrice) => {
  const query = `INSERT INTO cart_items (CartID, ProductID, CQuantity, TotalPrice) VALUES (?, ?, ?, ?)`;
  try {
    const [result] = await db.query(query, [
      cartId,
      productId,
      cartQuantity,
      totalPrice,
    ]);
    return result.insertId;
  } catch (error) {
    console.error("Error adding product to cart:", error);
    throw error;
  }
};

// model to update item quantity and total price
const updateItemQuantity = async (
  cartId,
  productId,
  cartQuantity,
  totalPrice
) => {
  const query = `UPDATE cart_items SET CQuantity = ?, TotalPrice = ? WHERE CartID = ? AND ProductID = ?`;
  try {
    const [result] = await db.query(query, [
      cartQuantity,
      totalPrice,
      cartId,
      productId,
    ]);
    return result;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

// model to get cart details by userID
const getCartDetailsByUserId = async (userId) => {
  const query = `SELECT 
     ci.CartItemID,     
     ci.CartID,
     p.ProductID,
     p.Name,
     p.Price,
     p.Quantity,
     p.ImagePath,
     ci.CQuantity AS CartQuantity,
     ci.TotalPrice,
     CASE 
        WHEN p.Quantity > 0 THEN 'In Stock'
        ELSE 'Out of Stock'
      END AS StockStatus
FROM cart_items ci
JOIN product p ON ci.ProductID = p.ProductID
JOIN cart c ON ci.CartID = c.CartID
    WHERE c.UserID = ?`;
  try {
    const [result] = await db.query(query, [userId]);
    return result;
  } catch (error) {
    console.error("Error getting cart details:", error);
    throw error;
  }
};

// model to delete an item from the cart
const deleteItem = async (cartId, productId) => {
  const query = `DELETE FROM cart_items WHERE CartID = ? AND ProductID = ?`;
  try {
    const [result] = await db.query(query, [cartId, productId]);
    return result;
  } catch (error) {
    console.error("Error deleting cart item:", error);
    throw error;
  }
};

// model to calculate total price of selected cart items
const getTotalPrice = async (cartItemIds, userId) => {
  const query = `
  SELECT 
    ci.CartItemID, 
    ci.CQuantity, 
    p.ProductID,
    p.Name,
    p.Price,
    p.Quantity AS Stock
  FROM cart_items ci
  JOIN product p ON ci.ProductID = p.ProductID
  JOIN cart c ON ci.CartID = c.CartID
  WHERE ci.CartItemID IN (?) AND c.UserID = ?`;

  try {
    // Query to get valid items for the given user
    const [validItems] = await db.query(query, [cartItemIds, userId]);

    // Identify any invalid cart item IDs
    const validItemIds = validItems.map((item) => item.CartItemID);
    const invalidItemIds = cartItemIds.filter(
      (id) => !validItemIds.includes(id)
    );

    // If there are invalid cart item IDs, return an error message
    if (invalidItemIds.length > 0) {
      return {
        error: `Invalid cart item IDs: ${invalidItemIds.join(", ")}`,
        totalAmount: null,
        items: [],
      };
    }

    // Calculate the total amount
    const totalAmount = validItems.reduce((total, item) => {
      const price = parseFloat(item.Price);
      return total + item.CQuantity * price;
    }, 0);

    return { totalAmount, items: validItems };
  } catch (error) {
    console.error("Error calculating total price:", error);
    throw error;
  }
};

// //model to clear selected cart items
// const clearCart = async (userId, cartItemIds) => {
//   const query = `DELETE FROM cart_items
//   WHERE CartID = (SELECT CartID FROM cart WHERE UserID = ?)
//   AND CartItemID IN (?)`;
//   try {
//     const [result] = await db.query(query, [userId, cartItemIds]);
//     return result;
//   } catch (error) {
//     console.error("Error clearing selected cart items:", error);
//     throw error;
//   }
// };

module.exports = {
  findCartByUserId,
  createCart,
  findCartItem,
  addCartItem,
  updateItemQuantity,
  getCartDetailsByUserId,
  deleteItem,
  getTotalPrice,
  // clearCart,
};
