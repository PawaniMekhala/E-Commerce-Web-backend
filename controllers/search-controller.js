const { findProducts } = require("../models/search-model");

// controller to search by category or product name
const searchProduct = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const results = await findProducts(query);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { searchProduct };
