const router = require("express").Router();
const { addToCart, getCart, removeFromCart, clearCart } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // All cart routes require authentication

router.get("/", getCart);
router.post("/add", addToCart);
router.delete("/remove/:foodId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
