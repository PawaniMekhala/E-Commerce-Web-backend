const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getRecentOrders,
  getTopSellingCategories,
  getSalesActivity,
} = require("../controllers/dashboard-controller");
const { authorizeAdmin } = require("../middleware/auth-middleware");

// route to get dashboard stats
router.get("/stats", authorizeAdmin, getDashboardStats);

// route to get recent orders within the past week
router.get("/recent-orders", authorizeAdmin, getRecentOrders);

// route to get top-selling categories
router.get("/top-selling", authorizeAdmin, getTopSellingCategories);

// route to get sales activity data
router.get("/sales-activity", authorizeAdmin, getSalesActivity);

module.exports = router;
