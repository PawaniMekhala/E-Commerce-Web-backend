const express = require("express");
const router = express.Router();
const {
  getShippingDetails,
  createShipping,
  removeShipping,
} = require("../controllers/shipping-controller");
const { authenticateUser } = require("../middleware/auth-middleware");

// route to save shipping details
router.post("/save-shipping", authenticateUser, createShipping);

// route to get all shipping details for a user
router.get("/:userId", authenticateUser, getShippingDetails);

// route to delete a shipping address
router.delete("/:shippingId", authenticateUser, removeShipping);

module.exports = router;
