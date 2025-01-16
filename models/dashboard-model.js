const db = require("../config/db");

// model to get total count of customers
const getTotalCustomers = async () => {
  const query = "SELECT COUNT(*) AS totalCustomers FROM `user`";
  try {
    const [result] = await db.query(query);
    return result[0].totalCustomers;
  } catch (error) {
    console.error("Error getting total customers count:", error);
    throw error;
  }
};

// model to get total count of products
const getTotalProducts = async () => {
  const query = "SELECT COUNT(*) AS totalProducts FROM `product`";
  try {
    const [result] = await db.query(query);
    return result[0].totalProducts;
  } catch (error) {
    console.error("Error getting total products count:", error);
    throw error;
  }
};

// model to get total count of orders
const getTotalOrders = async () => {
  const query = `SELECT 
  COUNT(*) AS totalOrders 
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
  `;
  try {
    const [result] = await db.query(query);
    return result[0].totalOrders;
  } catch (error) {
    console.error("Error getting total orders count:", error);
    throw error;
  }
};

// model to get total count of reviews
const getTotalReviews = async () => {
  const query = "SELECT COUNT(*) AS totalReviews FROM `review`";
  try {
    const [result] = await db.query(query);
    return result[0].totalReviews;
  } catch (error) {
    console.error("Error getting total reviews count:", error);
    throw error;
  }
};

// model to get recent orders within the past weeks
const recentOrderData = async () => {
  const query = `SELECT 
                p.Name AS Product,oi.OIQuantity AS Sold,p.Quantity AS Stock,o.OrderDate
                FROM \`orderitem\` oi
                JOIN \`order\` o ON oi.OrderID = o.OrderID
                JOIN \`product\` p ON oi.ProductID = p.ProductID
                WHERE o.OrderDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                ORDER BY o.OrderDate DESC`;
  try {
    const [result] = await db.query(query);
    return result;
  } catch (error) {
    console.error("Error getting recent orders:", error);
    throw error;
  }
};

// model to get top-selling categories and their sales percentage
const topSellingCategories = async () => {
  const query = `SELECT c.CategoryName AS Name, 
    ROUND((SUM(oi.OIQuantity) / total_sales.total_quantity) * 100, 2) AS Sale 
    FROM orderitem oi 
    JOIN product p ON oi.ProductID = p.ProductID 
    JOIN category c ON p.CategoryID = c.CategoryID 
    CROSS JOIN ( 
          SELECT SUM(oi.OIQuantity) AS total_quantity 
          FROM orderitem oi 
          JOIN product p ON oi.ProductID = p.ProductID
      ) AS total_sales 
    GROUP BY 
      c.CategoryName, c.CategoryID, total_sales.total_quantity
    ORDER BY 
      Sale DESC`;

  try {
    const [result] = await db.query(query);
    return result;
  } catch (error) {
    console.error("Error getting top-selling categories:", error);
    throw error;
  }
};

// model to get sales data grouped by product and week
const getSalesData = async () => {
  // Query to get sales data for the past 4 weeks, with each week's date range
  const query = `
    SELECT
        CONCAT(
            DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL ((w.week - 1) * 7 + 6) DAY), '%Y-%m-%d'),
            ' to ',
            DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL (w.week - 1) * 7 DAY), '%Y-%m-%d')
        ) AS WeekRange,
        SUM(CASE WHEN c.CategoryName = 'Chair' THEN oi.OIQuantity ELSE 0 END) AS ChairCount,
        SUM(CASE WHEN c.CategoryName = 'Table' THEN oi.OIQuantity ELSE 0 END) AS TableCount,
        SUM(CASE WHEN c.CategoryName = 'Sofa' THEN oi.OIQuantity ELSE 0 END) AS SofaCount
    FROM
        (SELECT 1 AS week UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) AS w
    LEFT JOIN
        \`order\` o ON DATE(o.OrderDate) BETWEEN
            DATE_SUB(CURDATE(), INTERVAL ((w.week - 1) * 7 + 6) DAY)
            AND DATE_SUB(CURDATE(), INTERVAL (w.week - 1) * 7 DAY)
    LEFT JOIN
        orderitem oi ON o.OrderID = oi.OrderID
    LEFT JOIN
        product p ON oi.ProductID = p.ProductID
    LEFT JOIN
        category c ON p.CategoryID = c.CategoryID
    GROUP BY
        w.week
    ORDER BY
        w.week;
  `;

  //four days
  // const query = ` SELECT
  //       DATE(o.OrderDate) AS OrderDate,
  //       SUM(CASE WHEN c.CategoryName = 'Chair' THEN oi.OIQuantity ELSE 0 END) AS ChairCount,
  //       SUM(CASE WHEN c.CategoryName = 'Table' THEN oi.OIQuantity ELSE 0 END) AS TableCount,
  //       SUM(CASE WHEN c.CategoryName = 'Sofa' THEN oi.OIQuantity ELSE 0 END) AS SofaCount
  //   FROM
  //       \`order\` o
  //   JOIN
  //       orderitem oi ON o.OrderID = oi.OrderID
  //   JOIN
  //       product p ON oi.ProductID = p.ProductID
  //   JOIN
  //       category c ON p.CategoryID = c.CategoryID
  //   JOIN
  //       (
  //           SELECT DATE(OrderDate) AS OrderDate
  //           FROM \`order\`
  //           GROUP BY DATE(OrderDate)
  //           ORDER BY DATE(OrderDate) DESC
  //           LIMIT 4
  //       ) AS recent_dates ON DATE(o.OrderDate) = recent_dates.OrderDate
  //   GROUP BY
  //       DATE(o.OrderDate)
  //   ORDER BY
  //       OrderDate DESC;`;

  try {
    const [rows] = await db.query(query); // Execute SQL query
    return rows; // Return result
  } catch (error) {
    console.error("Error fetching sales data:", error.message);
    throw new Error("Error fetching sales data");
  }
};

module.exports = {
  getTotalCustomers,
  getTotalProducts,
  getTotalOrders,
  getTotalReviews,
  recentOrderData,
  topSellingCategories,
  getSalesData,
};
