const db = require("../config/db");

// model to search for products by query
const findProducts = async (query) => {
  const searchQuery = `
    SELECT 
    p.ProductID, 
    p.Name, 
    p.Description, 
    p.Price, 
    p.ImagePath, 
    c.CategoryName AS category,
    CASE 
        WHEN p.Quantity > 0 THEN 'In Stock'
        ELSE 'Out of Stock'
      END AS StockStatus
    FROM product p
    LEFT JOIN category c ON p.CategoryID = c.CategoryID
    WHERE p.Name LIKE ? OR p.Description LIKE ? OR c.CategoryName LIKE ?
  `;
  const searchTerm = `%${query}%`;

  try {
    const [rows] = await db.query(searchQuery, [
      searchTerm,
      searchTerm,
      searchTerm,
    ]);
    return rows;
  } catch (error) {
    console.error("Error searching for products:", error);
    throw error;
  }
};

module.exports = { findProducts };
