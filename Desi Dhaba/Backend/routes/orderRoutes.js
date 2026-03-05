const router = require("express").Router();
const {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, placeOrder);
router.get("/user", protect, getUserOrders);
router.get("/admin", protect, adminOnly, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
