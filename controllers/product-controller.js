const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const {
  createProduct,
  getProducts,
  getAllProductsByCategory,
  getProductById,
  updateProductById,
  deleteProductById,
  getPopularProducts,
  getNewProducts,
} = require("../models/product-model");

// Controller to fetch all products to the admin page
const getAllProducts = async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (err) {
    console.error("Error in getAllProducts controller:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// Controller to create a new product in the database
const createNewProduct = async (req, res) => {
  const { name, description, price, quantity, categoryID } = req.body;
  const imageFile = req.file;

  if (
    !name ||
    !description ||
    !price ||
    !quantity ||
    !categoryID ||
    !imageFile
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Upload image to Cloudinary and delete the temp file
    const imagePath = (
      await cloudinary.uploader.upload(imageFile.path, { folder: "products" })
    ).secure_url;
    fs.unlinkSync(imageFile.path);

    const productData = {
      name,
      description,
      price,
      quantity,
      categoryID,
      imagePath,
    };

    await createProduct(productData);
    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const results = await getAllProductsByCategory(categoryId);

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to get a product details by its ID
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controller to update a product by ID
const updateProductDetails = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity, categoryID } = req.body;
  const imageFile = req.file;
  try {
    // Fetch existing product details to retain unchanged fields
    const currentProduct = await getProductById(id);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProductData = {
      name: name || currentProduct.Name,
      description: description || currentProduct.Description,
      price: price || currentProduct.Price,
      quantity: quantity || currentProduct.Quantity,
      categoryID: categoryID || currentProduct.CategoryID,
      imagePath: currentProduct.ImagePath,
    };

    if (imageFile) {
      updatedProductData.imagePath = (
        await cloudinary.uploader.upload(imageFile.path, { folder: "products" })
      ).secure_url;
      fs.unlinkSync(imageFile.path);
    }

    const result = await updateProductById(id, updatedProductData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product updated successfully." });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controller to delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await deleteProductById(productId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to get popular products
const fetchPopularProducts = async (req, res) => {
  try {
    const products = await getPopularProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching popular products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular products",
    });
  }
};

// Controller to get newly added products
const fetchNewProducts = async (req, res) => {
  try {
    const products = await getNewProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching new products:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch new products.",
    });
  }
};

module.exports = {
  getAllProducts,
  createNewProduct,
  getProductsByCategory,
  getProductDetails,
  updateProductDetails,
  deleteProduct,
  fetchPopularProducts,
  fetchNewProducts,
};
