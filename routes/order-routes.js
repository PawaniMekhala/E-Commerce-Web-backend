const express = require("express");
const router = express.Router();
const {
  buyNowOrder,
  proceedToCheckout,
  getOrderDetails,
  updateOrderStatus,
  updateOrderPaymentMethod,
  getOrderIDs,
} = require("../controllers/order-controller");
const {
  authenticateUser,
  authorizeAdmin,
} = require("../middleware/auth-middleware");

// route for "Buy Now" functionality
router.post("/buy-now", authenticateUser, buyNowOrder);

// route for "proceed to checkout" functionality
router.post("/checkout", authenticateUser, proceedToCheckout);

// route for get order details
router.get("/:orderId", authorizeAdmin, getOrderDetails);

// route for update order status
router.put("/update-status", authorizeAdmin, updateOrderStatus);

// route for update payment method
router.put(
  "/update-payment-method",
  authenticateUser,
  updateOrderPaymentMethod
);

// route for fetching all order IDs
router.get("/summary/all-ids", authorizeAdmin, getOrderIDs);

module.exports = router;
