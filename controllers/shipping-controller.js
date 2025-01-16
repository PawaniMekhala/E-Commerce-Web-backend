const {
  getShippingDetailsByUserId,
  addShipping,
  deleteShipping,
  updateOrderWithShipping,
} = require("../models/shipping-model");
const {
  updateProductStock,
  getCompleteOrderDetails,
} = require("../models/order-model");

//controller to get shipping details
const getShippingDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const shippingDetails = await getShippingDetailsByUserId(userId);
    res
      .status(200)
      .json({ message: "Shipping details retrieved", data: shippingDetails });
  } catch (error) {
    console.error("Error fetching shipping details:", error.message);
    res.status(500).json({
      message: "Error fetching shipping details",
      error: error.message,
    });
  }
};

// controller to add a new shipping address
const createShipping = async (req, res) => {
  const { shippingData, orderID } = req.body;

  try {
    // Add or fetch shipping details
    const result = await addShipping(shippingData);

    // Update the order with the ShippingID
    await updateOrderWithShipping(orderID, result.shippingId);

    // Fetch complete order details including products and quantities
    const orderDetails = await getCompleteOrderDetails(orderID);

    // Update stock for each product in the order
    for (const item of orderDetails) {
      console.log(
        `ProductID: ${item.ProductID}, Stock: ${item.Stock}, OIQuantity: ${item.OIQuantity}`
      );

      if (isNaN(item.Stock) || isNaN(item.OIQuantity)) {
        throw new Error(
          `Invalid stock or order quantity for ProductID: ${item.ProductID}`
        );
      }

      const newQuantity = item.Stock - item.OIQuantity;

      if (newQuantity < 0) {
        throw new Error(`Insufficient stock for ProductID: ${item.ProductID}`);
      }

      await updateProductStock(item.ProductID, newQuantity);
    }

    const message = result.existing
      ? "Shipping details already exist and were linked to the order."
      : "Shipping details created and linked to the order.";

    res.status(200).json({ message, shippingId: result.shippingId });
  } catch (error) {
    console.error("Error creating shipping details:", error.message);
    res.status(500).json({
      message: "Error creating shipping details",
      error: error.message,
    });
  }
};

// controller to delete a shipping address
const removeShipping = async (req, res) => {
  const { shippingId } = req.params;

  try {
    await deleteShipping(shippingId);
    res.status(200).json({ message: "Shipping details deleted" });
  } catch (error) {
    console.error("Error deleting shipping details:", error.message);
    res.status(500).json({
      message: "Error deleting shipping details",
      error: error.message,
    });
  }
};

module.exports = {
  getShippingDetails,
  createShipping,
  removeShipping,
};
