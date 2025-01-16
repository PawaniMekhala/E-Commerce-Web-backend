const express = require("express");
const router = express.Router();
const { searchProduct } = require("../controllers/search-controller");

// Route for searching by category or name
router.get("/", searchProduct);

module.exports = router;
