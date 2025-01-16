const {
  createOrder,
  addOrderItem,
  updateStatus,
  updatePaymentMethod,
  getAllOrderIDs,
  getCompleteOrderDetails,
} = require("../models/order-model");
const { getProductById } = require("../models/product-model");
const { getTotalPrice } = require("../models/cart-model");

// controller for Buy Now function
const buyNowOrder = async (req, res) => {
  console.log("Session Before:", req.session);

  const userId = req.user.userId;
  const { productId, oiQuantity } = req.body;

  try {
    // Validate the quantity
    if (!Number.isInteger(oiQuantity) || oiQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // Check if product exists and has sufficient stock
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.Quantity < oiQuantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    // Calculate total price
    const totalAmount = product.Price * oiQuantity;

    // Add Rs. 2000 shipping fee to totalAmount
    const shippingFee = 2000;
    const fullPayment = totalAmount + shippingFee;

    // Set OQuantity as 1, since only one product type is being bought in this order
    const oQuantity = 1;

    // Create a new order in the Order table
    const orderId = await createOrder(
      userId,
      totalAmount,
      oQuantity,
      fullPayment
    );

    // Add the item to the OrderItem table
    await addOrderItem(orderId, productId, oiQuantity);

    res.status(201).json({
      message: "Order placed successfully",
      orderId,
      totalAmount,
      oiQuantity,
      productName: product.Name,
      fullPayment,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

// controller for proceeding to checkout
const proceedToCheckout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cartItemIds } = req.body;

    if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return res
        .status(400)
        .json({ error: "No cart items selected for checkout." });
    }

    // calculate total amount and get cart item details
    const result = await getTotalPrice(cartItemIds, userId);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    const { totalAmount, items } = result;

    // Add Rs. 2000 shipping fee to totalAmount
    const shippingFee = 2000;
    const fullPayment = totalAmount + shippingFee;

    // create a new order
    const totalQuantity = items.reduce((sum, item) => sum + item.CQuantity, 0);
    const orderId = await createOrder(
      userId,
      totalAmount,
      totalQuantity,
      fullPayment
    );

    // add each cart item to the order and update stock
    for (const item of items) {
      const { ProductID, CQuantity, Stock } = item;

      // check stock for the product
      const newStock = Stock - CQuantity;
      if (newStock < 0) {
        return res
          .status(400)
          .json({ error: `Not enough stock for product ID ${ProductID}.` });
      }

      // Add item to order
      await addOrderItem(orderId, ProductID, CQuantity);
    }

    res.status(201).json({
      message: "Order created successfully",
      orderId,
      totalAmount,
      items,
      fullPayment,
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ error: "An error occurred during checkout." });
  }
};

// controller for fetch order details
const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    const orderData = await getCompleteOrderDetails(orderId);

    if (!orderData || orderData.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(orderData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order details", error });
  }
};

// controller to handle order status update
const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res
      .status(400)
      .json({ message: "Order ID and status are required" });
  }

  try {
    // Pass `status` first, and then `orderId`
    const result = await updateStatus(status, orderId);

    // Check if any row was affected (updated)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If successful, send a success message
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    // Handle error cases
    return res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// controller to handle payment method update
const updateOrderPaymentMethod = async (req, res) => {
  const { orderId, paymentMethod } = req.body;

  // Validate input
  if (!orderId || !paymentMethod) {
    return res
      .status(400)
      .json({ message: "Order ID and payment method are required" });
  }

  try {
    // Call model function to update payment method
    const result = await updatePaymentMethod(paymentMethod, orderId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Success response
    res.status(200).json({ message: "Payment method updated successfully" });
  } catch (error) {
    // Handle error
    return res
      .status(500)
      .json({ message: "Error updating payment method", error: error.message });
  }
};

// controller to get all order IDs
const getOrderIDs = async (_req, res) => {
  try {
    const orderIDs = await getAllOrderIDs();
    if (orderIDs.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.status(200).json({ orderIDs });
  } catch (error) {
    console.error("Error fetching order IDs:", error.message);
    res.status(500).json({ message: "Error fetching order IDs" });
  }
};

module.exports = {
  buyNowOrder,
  proceedToCheckout,
  getOrderDetails,
  updateOrderStatus,
  updateOrderPaymentMethod,
  getOrderIDs,
};
