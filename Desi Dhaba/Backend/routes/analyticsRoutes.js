const router = require("express").Router();
const {
  getDashboardStats,
  getRevenueChart,
  getOrderStatusDistribution,
  getTopItems,
} = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/revenue", protect, adminOnly, getRevenueChart);
router.get("/revenue-chart", protect, adminOnly, getRevenueChart);
router.get("/status-distribution", protect, adminOnly, getOrderStatusDistribution);
router.get("/top-items", protect, adminOnly, getTopItems);

module.exports = router;
