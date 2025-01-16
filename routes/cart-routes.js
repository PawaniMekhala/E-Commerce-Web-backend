const express = require("express");
const router = express.Router();
const {
  addToCart,
  viewCart,
  updateCartItemQuantity,
  removeCartItem,
  calculateTotalPrice,
} = require("../controllers/cart-controller");
const { authenticateUser } = require("../middleware/auth-middleware");

// route to add product to cart
router.post("/add-to-cart", authenticateUser, addToCart);

// route to get cart details by userID
router.get("/view-cart", authenticateUser, viewCart);

// route to update cart item quantity
router.put("/update-item-quantity", authenticateUser, updateCartItemQuantity);

// route to delete an item from the cart
router.delete("/remove-item", authenticateUser, removeCartItem);

// route to calculate total price of selected cart items
router.post("/total", authenticateUser, calculateTotalPrice);

module.exports = router;
