const router = require("express").Router();
const {
  placeOrder, getUserOrders, getOrderById,
  cancelOrder, getAllOrders, updateOrderStatus, reorder,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  placeOrderValidators,
  cancelOrderValidators,
  updateStatusValidators,
} = require("../middleware/validators/orderValidators");

router.post("/", protect, placeOrderValidators, validate, placeOrder);
router.get("/user", protect, getUserOrders);
router.get("/admin", protect, adminOnly, getAllOrders);
router.get("/:id", protect, getOrderById);
router.post("/:id/reorder", protect, reorder);
router.put("/:id/cancel", protect, cancelOrderValidators, validate, cancelOrder);
router.put("/:id/status", protect, adminOnly, updateStatusValidators, validate, updateOrderStatus);

module.exports = router;
