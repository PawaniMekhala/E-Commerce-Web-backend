const express = require("express");
const {
  fetchPopularProducts,
  fetchNewProducts,
} = require("../controllers/product-controller");
const router = express.Router();

// route to get popular products
router.get("/popular-products", fetchPopularProducts);

// route to get  newly added products
router.get("/new-products", fetchNewProducts);

module.exports = router;
