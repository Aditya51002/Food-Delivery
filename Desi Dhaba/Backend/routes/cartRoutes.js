const router = require("express").Router();
const { addToCart, getCart, removeFromCart, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", addToCart);
router.get("/", getCart);
router.delete("/:foodId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
