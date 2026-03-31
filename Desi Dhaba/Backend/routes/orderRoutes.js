const router = require("express").Router();
const {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  reorder,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", placeOrder);
router.get("/user", getUserOrders);
router.get("/:id", getOrderById);
router.post("/:id/cancel", cancelOrder);
router.post("/:id/reorder", reorder);

router.get("/", adminOnly, getAllOrders);
router.patch("/:id/status", adminOnly, updateOrderStatus);

module.exports = router;
