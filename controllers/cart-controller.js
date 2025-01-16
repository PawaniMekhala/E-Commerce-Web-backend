const {
  findCartByUserId,
  createCart,
  findCartItem,
  addCartItem,
  updateItemQuantity,
  getCartDetailsByUserId,
  deleteItem,
  getTotalPrice,
} = require("../models/cart-model");
const { getProductById } = require("../models/product-model");

//controller to add product to the cart
const addToCart = async (req, res) => {
  const userId = req.user.userId;
  const { productId, cartQuantity } = req.body;
  try {
    // Validate cartQuantity
    if (!Number.isInteger(cartQuantity) || cartQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // Check if product exists and has enough stock
    const product = await getProductById(productId);
    if (!product || product.Quantity < cartQuantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    // Get or create cart for user
    let cart = await findCartByUserId(userId);
    if (!cart) {
      // Create a cart for the user
      const cartId = await createCart(userId);
      cart = { CartID: cartId };
    }
    const cartId = cart.CartID;
    const totalPrice = product.Price * cartQuantity;

    // Add or update cart item
    const cartItem = await findCartItem(cartId, productId);
    if (cartItem) {
      const newQuantity = cartItem.CQuantity + cartQuantity;
      const newTotalPrice = product.Price * newQuantity;
      await updateItemQuantity(cartId, productId, newQuantity, newTotalPrice);
    } else {
      await addCartItem(cartId, productId, cartQuantity, totalPrice);
    }

    res.status(201).json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Failed to add product to cart" });
  }
};

//controller to get products to the cart page
const viewCart = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Fetch cart details using a model function
    const cartDetails = await getCartDetailsByUserId(userId);

    // Check if cart is empty or doesn't exist
    if (!cartDetails || cartDetails.length === 0) {
      return res.status(404).json({ message: "Cart is empty or not found" });
    }

    // Calculate total price of all items in the cart ( TotalPrice is treated as a number)
    const totalCartPrice = cartDetails.reduce((acc, item) => {
      const itemTotalPrice = parseFloat(item.TotalPrice); // Convert TotalPrice to a number
      return acc + itemTotalPrice;
    }, 0);
    res.status(200).json({
      cartItems: cartDetails,
      totalCartPrice: totalCartPrice.toFixed(2), // Total in formatted currency
    });
  } catch (error) {
    console.error("Error retrieving cart details:", error);
    res.status(500).json({
      message: "Failed to retrieve cart details",
      error: error.message,
    });
  }
};

//controller to update item quantity
const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, newQuantity } = req.body;

    // Validate newQuantity is a positive integer
    if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    // Get the user's cart
    const cart = await findCartByUserId(userId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the item exists in the cart
    const cartItem = await findCartItem(cart.CartID, productId);
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Fetch product details to check stock availability
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the requested quantity exceeds available stock
    if (newQuantity > product.Quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    // Calculate new total price for the updated quantity
    const newTotalPrice = product.Price * newQuantity;

    // Update the item quantity in the cart
    await updateItemQuantity(
      cart.CartID,
      productId,
      newQuantity,
      newTotalPrice
    );

    res
      .status(200)
      .json({ message: "Cart item quantity updated successfully" });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ message: "Failed to update cart item quantity" });
  }
};

// controller to delete an item from the cart
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    // Get the cart for the user
    const cart = await findCartByUserId(userId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the item exists in the cart
    const cartItem = await findCartItem(cart.CartID, productId);
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Delete the item from the cart
    await deleteItem(cart.CartID, productId);

    res.status(200).json({ message: "Cart item removed successfully" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
};

// controller to calculate total price of selected cart items
const calculateTotalPrice = async (req, res) => {
  try {
    const { cartItemIds } = req.body;
    const userId = req.user.userId;

    if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return res
        .status(400)
        .json({
          error: "No valid cart items provided.",
          totalAmount: null,
          items: [],
        });
    }

    // call the model function to get the total price
    const result = await getTotalPrice(cartItemIds, userId);

    // Check if there is an error message from getTotalPrice
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ totalAmount: result.totalAmount });
  } catch (error) {
    console.error("Error calculating total price:", error);
    res
      .status(500)
      .json({ error: "An error occurred while calculating the total price." });
  }
};

module.exports = {
  addToCart,
  viewCart,
  updateCartItemQuantity,
  removeCartItem,
  calculateTotalPrice,
};
