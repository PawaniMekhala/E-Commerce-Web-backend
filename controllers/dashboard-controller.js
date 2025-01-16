const {
  getTotalCustomers,
  getTotalProducts,
  getTotalOrders,
  getTotalReviews,
  recentOrderData,
  topSellingCategories,
  getSalesData,
} = require("../models/dashboard-model");

// controller to get all dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    // Get all the stats from the dashboard model
    const totalCustomers = await getTotalCustomers();
    const totalProducts = await getTotalProducts();
    const totalOrders = await getTotalOrders();
    const totalReviews = await getTotalReviews();

    // Send the stats in the response
    res.status(200).json({
      totalCustomers,
      totalProducts,
      totalOrders,
      totalReviews,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// controller to get recent orders
const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await recentOrderData();
    res.status(200).json(recentOrders);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
};

// controller to get top-selling categories and their sales percentage
const getTopSellingCategories = async (req, res) => {
  try {
    const categories = await topSellingCategories();
    res.status(200).json({
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve top-selling categories",
      error: error.message,
    });
  }
};

// controller to get sales data
const getSalesActivity = async (req, res) => {
  try {
    const salesData = await getSalesData(); // Get data from model
    res.status(200).json(salesData); // Send data as JSON response
  } catch (error) {
    console.error("Error in salesController:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getDashboardStats,
  getRecentOrders,
  getTopSellingCategories,
  getSalesActivity,
};
