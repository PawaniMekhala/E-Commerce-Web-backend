const db = require("../config/db");

// model to get all products from the database
const getProducts = async () => {
  const query = `
        SELECT  
        p.ProductID as productId, 
        p.Name AS name, 
        p.Price AS price, 
        p.Quantity AS quantity, 
        p.ImagePath AS image,
        c.CategoryName AS category,
        CASE 
        WHEN p.Quantity > 0 THEN 'In Stock'
        ELSE 'Out of Stock'
      END AS stockStatus
        FROM product p
        JOIN category c ON p.CategoryID = c.CategoryID
    `;
  try {
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// model to create product
const createProduct = async (productData) => {
  const { name, description, price, quantity, categoryID, imagePath } =
    productData;
  const query = `
        INSERT INTO product (Name, Description, Price, Quantity, CategoryID, ImagePath)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
  try {
    const [result] = await db.query(query, [
      name,
      description,
      price,
      quantity,
      categoryID,
      imagePath,
    ]);
    return result.insertId;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// model to get products by category
const getAllProductsByCategory = async (categoryId) => {
  const query = `SELECT ProductID, Name, Price, Description,Quantity,ImagePath, 
   CASE
   WHEN Quantity > 0 THEN 'In Stock'
   ELSE 'Out of Stock'
   END AS StockStatus
  FROM product 
  WHERE CategoryID = ?`;
  try {
    const [result] = await db.query(query, [categoryId]);
    return result;
  } catch (error) {
    console.error("Error getting all products by category:", error);
    throw error;
  }
};

// model to get a product details by its ID
const getProductById = async (productId) => {
  const query = `
    SELECT 
    p.ProductID, 
    p.Name, 
    p.Description, 
    p.Price, 
    p.Quantity, 
    p.CategoryID, 
    p.ImagePath,
    c.CategoryName AS category,
    CASE
   WHEN Quantity > 0 THEN 'In Stock'
   ELSE 'Out of Stock'
   END AS StockStatus
    FROM product p
    JOIN category c ON p.CategoryID = c.CategoryID
    WHERE p.ProductID = ?
  `;
  try {
    const [rows] = await db.query(query, [productId]);
    return rows[0];
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

// model to update a product by ID
const updateProductById = async (productId, productData) => {
  const { name, description, price, quantity, categoryID, imagePath } =
    productData;

  const query = `
    UPDATE product
    SET Name = ?, Description = ?, Price = ?, Quantity = ?, CategoryID = ?, ImagePath = ?
    WHERE ProductID = ?
  `;

  const queryParams = [
    name,
    description,
    price,
    quantity,
    categoryID,
    imagePath,
    productId,
  ];

  try {
    const [result] = await db.query(query, queryParams);
    return result;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// model to delete a product by ID
const deleteProductById = async (productId) => {
  const query = "DELETE FROM product WHERE ProductID = ?";
  try {
    const [result] = await db.query(query, [productId]);
    return result;
  } catch (err) {
    console.error("Error deleting product:", err);
    throw err;
  }
};

// model to get popular products
const getPopularProducts = async () => {
  const query = `
  SELECT  
        p.ProductID AS productId, 
        p.Name AS name, 
        p.Price AS price, 
        p.Quantity AS quantity, 
        p.ImagePath AS image,
        c.CategoryName AS category,
        SUM(oi.OIQuantity) AS totalSold,
        CASE 
          WHEN p.Quantity > 0 THEN 'In Stock'
          ELSE 'Out of Stock'
        END AS stockStatus
        FROM product p
        JOIN category c ON p.CategoryID = c.CategoryID
        JOIN orderitem oi ON p.ProductID = oi.ProductID
        GROUP BY p.ProductID
        ORDER BY totalSold DESC
        LIMIT 8;
`;
  try {
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching popular products:", error);
    throw error;
  }
};

// model to get newly added products
const getNewProducts = async () => {
  const query = `
  SELECT  
        p.ProductID AS productId, 
        p.Name AS name, 
        p.Price AS price, 
        p.Quantity AS quantity, 
        p.ImagePath AS image,
        CASE 
          WHEN p.Quantity > 0 THEN 'In Stock'
          ELSE 'Out of Stock'
        END AS stockStatus
        FROM product p
        ORDER BY ProductID DESC
        LIMIT 8;
`;
  try {
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    console.error("Error fetching new products:", error);
    throw error;
  }
};

module.exports = {
  createProduct,
  getProducts,
  getAllProductsByCategory,
  getProductById,
  updateProductById,
  deleteProductById,
  getPopularProducts,
  getNewProducts,
};
