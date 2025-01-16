const express = require("express");
const {
  getAllProducts,
  createNewProduct,
  getProductsByCategory,
  getProductDetails,
  updateProductDetails,
  deleteProduct,
} = require("../controllers/product-controller");
const router = express.Router();
const upload = require("../middleware/multer");
const { authorizeAdmin } = require("../middleware/auth-middleware");

// route to get all products
router.get("/all-products", getAllProducts);

// route to create new product route
router.post(
  "/create-product",
  authorizeAdmin,
  upload.single("productImage"),
  createNewProduct
);

// route to get products by category
router.get("/category/:categoryId", getProductsByCategory);

//route to get a product by ID
router.get("/:id", getProductDetails);

// route to update a product details by its ID
router.put(
  "/:id",
  authorizeAdmin,
  upload.single("productImage"),
  updateProductDetails
);

// route to delete a product details by its ID
router.delete("/:id", authorizeAdmin, deleteProduct);

module.exports = router;
