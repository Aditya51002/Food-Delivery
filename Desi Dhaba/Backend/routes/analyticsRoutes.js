const express = require("express");
const router = express.Router();
const { getDashboardStats, getRevenueChart, getOrderStatusDistribution, getTopItems } = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/revenue", protect, adminOnly, getRevenueChart);
router.get("/order-status", protect, adminOnly, getOrderStatusDistribution);
router.get("/top-items", protect, adminOnly, getTopItems);

module.exports = router;
